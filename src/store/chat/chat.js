import { defineStore } from 'pinia';
import Stomp from "webstomp-client";
import SockJs from "sockjs-client";
import { 
  getMyChatRooms, 
  getChatHistory, 
  uploadFiles,
  createChatRoom,
  updateChatRoomName,
  leaveChatRoom
} from '../../services/chat/chatService';
import { ChatMessageResponse } from '../../models/chat/ChatResponse';
import { getFileTypeFromFile } from '../../utils/fileValidation';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 현재 사용자 ID 상수화 (실 서비스에선 Auth에서 주입)
const MY_ID = '550e8400-e29b-41d4-a716-446655440001';

export const useChatStore = defineStore('chat', {
  state: () => ({
    rooms: [],
    messages: {},                 // roomId -> messages[]
    currentRoomId: null,
    loading: false,
    stompClient: null,
    error: null,
    onlineUsers: {},              // roomId -> [userIds]

    // ✅ 읽음 스냅샷(불가역)
    lastReadByMe: {},             // roomId -> ISO time (상대 메시지 기준)
    lastReadByOther: {},          // roomId -> ISO time (내 메시지 기준)

    // ✅ 오프라인 동안 내가 보낸 메시지 버킷 (각 메시지별 1 표시용)
    pendingMyOffline: {},         // roomId -> { [messageId]: true }

    // ✅ 스크롤 페이지네이션 상태
    pagination: {},               // roomId -> { hasNext: boolean, nextCursor: string, isLoading: boolean }
    
    // ✅ 채팅방 목록 페이지네이션 상태
    roomsPagination: {
      hasNext: false,
      nextCursor: null,
      isLoading: false
    },

    _presenceInit: false,
  }),
  
  getters: {
    currentRoom: (state) => {
      return state.rooms.find((room) => room.roomId === state.currentRoomId);
    },
    totalUnreadCount: (state) => {
      return state.rooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
    },
    getUnreadCount: (state) => (roomId) => {
      const room = state.rooms.find((r) => r.roomId === roomId);
      return room?.unreadCount || 0;
    },
    getError: (state) => state.error,
    hasRooms: (state) => state.rooms.length > 0,
    getOtherUserId: () => (_roomId) => null,
  },
  
  actions: {
    /* =========================
     * Presence / Lifecycle
     * ========================= */
    async goOfflineFireAndForget(roomId) {
      if (!roomId) return;
      if (!this.stompClient || !this.stompClient.connected) return;
      try {
        this.stompClient.send(
          `/publish/chat-rooms/${roomId}/offline`,
          JSON.stringify({ userId: MY_ID })
        );
      } catch (e) {
        console.error('offline 전송 실패(F&F):', e);
      }
    },

    async flushOfflineAndDisconnect({ roomId, waitMs = 180 } = {}) {
      if (!this.stompClient || !this.stompClient.connected) return;
      try {
        await this.goOfflineFireAndForget(roomId);
        await new Promise((r) => setTimeout(r, waitMs));
      } catch (_e) {
        // no-op
      } finally {
        try { this.stompClient.disconnect(); } catch (e) { console.warn('disconnect 에러 무시', e); }
        this.stompClient = null;
      }
    },

    initPresenceLifecycle() {
      if (this._presenceInit) return;
      this._presenceInit = true;

      const quickOfflineOnHide = () => {
        const rid = this.currentRoomId;
        if (!rid) return;
        if (document.hidden) {
          this.goOfflineFireAndForget(rid);
        } else {
          this.sendOnlineStatus(rid, true);
        }
      };

      const pagehideHandler = async () => {
        const rid = this.currentRoomId;
        if (!rid) return;
        await this.flushOfflineAndDisconnect({ roomId: rid, waitMs: 180 });
      };

      document.addEventListener('visibilitychange', quickOfflineOnHide, { capture: true });
      window.addEventListener('pagehide', pagehideHandler, { capture: true });
      window.addEventListener('beforeunload', () => {
        const rid = this.currentRoomId;
        if (!rid) return;
        this.goOfflineFireAndForget(rid);
      }, { capture: true });
    },

    isOtherOnline(roomId) {
      return (this.onlineUsers[roomId] || []).some((id) => id !== MY_ID);
    },

    /* =========================
     * Pending / Read Heuristics
     * ========================= */
    ensurePendingBucket(roomId) {
      if (!this.pendingMyOffline[roomId]) this.pendingMyOffline[roomId] = {};
    },

    markMyMessagePendingOffline(roomId, messageId) {
      if (!messageId) return;
      this.ensurePendingBucket(roomId);
      this.pendingMyOffline[roomId][messageId] = true;
    },

    flushPendingBecauseOtherOnline(roomId) {
      const list = this.messages[roomId] || [];
      const lastMyMsg = [...list].reverse().find((m) => m.senderId === MY_ID);
      if (lastMyMsg?.createdAt) {
        this.lastReadByOther[roomId] = lastMyMsg.createdAt;
      }
      this.pendingMyOffline[roomId] = {};
      if (roomId === this.currentRoomId) this.$patch({});
    },

    /* =========================
     * WebSocket
     * ========================= */
    connectWebSocket(roomId) {
      console.log('WebSocket 연결 시도:', { roomId, currentRoomId: this.currentRoomId });
      this.disconnectWebSocket();
      if (!roomId) {
        console.error('roomId가 없습니다:', roomId);
        return;
      }

      try {
        console.log('SockJS 연결 시도:', `${API_BASE_URL}/connect`);
        const sockJs = new SockJs(`${API_BASE_URL}/connect`);
        this.stompClient = Stomp.over(sockJs);

        this.stompClient.connect(
          {},
          () => {
            console.log('WebSocket 연결 성공');

            // 메시지 구독
            console.log('메시지 구독 시도:', `/topic/chat-rooms/${roomId}/chat-message`);
            this.stompClient.subscribe(
              `/topic/chat-rooms/${roomId}/chat-message`,
              (message) => {
                try {
                  const parsedMessage = JSON.parse(message.body);
                  this.receiveMessage(parsedMessage);
                } catch (error) {
                  console.error('메시지 파싱 실패:', error);
                }
              }
            );

            // 온라인 참여자 상태 구독
            this.stompClient.subscribe(
              `/topic/chat-rooms/${roomId}/online-participant`,
              (message) => {
                try {
                  const onlineUsers = JSON.parse(message.body);
                  console.log('온라인 참여자:', onlineUsers);
                  this.updateOnlineUsers(roomId, onlineUsers);
                } catch (error) {
                  console.error('온라인 참여자 파싱 실패:', error);
                }
              }
            );

            // 연결 성공 후 온라인 상태 알림
            setTimeout(() => {
              this.sendOnlineStatus(roomId, true);
            }, 100);
          },
          (error) => {
            console.error('WebSocket 연결 실패:', error);
            this.stompClient = null;
          }
        );
      } catch (error) {
        console.error('WebSocket 초기화 실패:', error);
        this.stompClient = null;
      }
    },

    async disconnectWebSocket(roomId = this.currentRoomId) {
      if (!this.stompClient || !this.stompClient.connected) {
        this.stompClient = null;
        return;
      }
      try {
        await this.flushOfflineAndDisconnect({ roomId, waitMs: 150 });
      } catch (e) {
        console.warn('graceful disconnect 실패, 강제 종료', e);
        try { this.stompClient.disconnect(); } catch {}
        this.stompClient = null;
      }
    },
    
    updateOnlineUsers(roomId, onlineUserIds) {
      console.log('온라인 사용자 업데이트:', { roomId, onlineUserIds });

      const prev = Array.isArray(this.onlineUsers[roomId]) ? this.onlineUsers[roomId] : [];
      const wasOnline = prev.some((id) => id !== MY_ID);

      this.onlineUsers[roomId] = Array.isArray(onlineUserIds) ? onlineUserIds : [];
      const nowOnline = this.isOtherOnline(roomId);

      if (!wasOnline && nowOnline) {
        this.flushPendingBecauseOtherOnline(roomId);
      }

      if (roomId === this.currentRoomId) {
        this.$patch({});
      }
    },
    
    /* =========================
     * Read & Badges
     * ========================= */
    markRoomAsRead(roomId) {
      const idx = this.rooms.findIndex((room) => room.roomId === roomId);
      if (idx !== -1) {
        this.rooms[idx].unreadCount = 0;
      }

      const list = this.messages[roomId] || [];
      const lastOtherMsg = [...list].reverse().find((m) => m.senderId !== MY_ID);
      if (lastOtherMsg?.createdAt) {
        this.lastReadByMe[roomId] = lastOtherMsg.createdAt;
      } else {
        this.lastReadByMe[roomId] = new Date().toISOString();
      }
    },

    /* =========================
     * SWR 유틸
     * ========================= */
    // 메시지 중복 제거 + 시간 오름차순 정렬
    dedupeAndSortMessages(roomId) {
      const list = this.messages[roomId] || [];
      const byId = new Map();
      for (const m of list) {
        const key = m.id ?? `${m.senderId}-${m.createdAt}-${m.message ?? ''}`;
        byId.set(key, m);
      }
      const arr = Array.from(byId.values());
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      this.messages[roomId] = arr;
    },

    // 방 입장 시 캐시를 보여주면서, 백그라운드로 최신 페이지 재조회하여 머지
    async refreshRoomLatest(roomId) {
      try {
        const result = await getChatHistory(roomId, 30, null); // 최신 페이지
        const incoming = result.data || [];
        const current = this.messages[roomId] || [];
        const known = new Set(current.map(m => m.id).filter(Boolean));

        // 캐시에 없는 새 메시지만 필터링
        const newcomers = incoming.filter(m => !m.id || !known.has(m.id));
        if (newcomers.length > 0) {
          this.messages[roomId] = [...current, ...newcomers];
          this.dedupeAndSortMessages(roomId);
        }

        // 최신 페이지 기준의 이전(스크롤 업) 커서 갱신
        this.pagination[roomId] = {
          hasNext: result.hasNext,
          nextCursor: result.nextCursor,
          isLoading: false
        };

        // 내가 방에 '있는' 상태라면 상대 메시지를 읽음 스냅샷으로 반영
        const lastOtherMsg = [...(this.messages[roomId] || [])].reverse().find(m => m.senderId !== MY_ID);
        if (lastOtherMsg?.createdAt) {
          this.lastReadByMe[roomId] = lastOtherMsg.createdAt;
          // 방 목록의 뱃지도 0으로 맞춤
          const idx = this.rooms.findIndex(r => r.roomId === roomId);
          if (idx !== -1) this.rooms[idx].unreadCount = 0;
        }
      } catch (e) {
        console.error('refreshRoomLatest 실패:', e);
      }
    },

    /* =========================
     * REST + WS Send
     * ========================= */
    async sendMessageViaWebSocket(content, uploadedFiles = null) {
      if (!this.currentRoomId || !this.stompClient || !this.stompClient.connected) {
        console.error('WebSocket이 연결되지 않았습니다.');
        return;
      }

      const message = {
        roomId: this.currentRoomId,
        senderId: MY_ID,
        message: content,
        files: uploadedFiles ? uploadedFiles.files : null
      };

      try {
        this.stompClient.send(
          `/publish/chat-rooms/${this.currentRoomId}/message`,
          JSON.stringify(message)
        );
      } catch (error) {
        console.error('WebSocket 메시지 전송 실패:', error);
        throw error;
      }
    },

    /* =========================
     * Rooms & History
     * ========================= */
    async fetchMyChatRooms() {
      this.loading = true;
      this.error = null;
      
      this.roomsPagination = {
        hasNext: false,
        nextCursor: null,
        isLoading: false
      };
      
      try {
        const result = await getMyChatRooms(10, null);
        this.rooms = result.data;
        this.roomsPagination = {
          hasNext: result.hasNext,
          nextCursor: result.nextCursor,
          isLoading: false
        };
      } catch (error) {
        console.error('채팅방 목록 조회 실패:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async loadMoreChatRooms() {
      if (!this.roomsPagination.hasNext || this.roomsPagination.isLoading) {
        return;
      }

      this.roomsPagination.isLoading = true;
      
      try {
        const result = await getMyChatRooms(10, this.roomsPagination.nextCursor);
        
        if (result.data && result.data.length > 0) {
          this.rooms = [...this.rooms, ...result.data];
          this.roomsPagination = {
            hasNext: result.hasNext,
            nextCursor: result.nextCursor,
            isLoading: false
          };
        } else {
          this.roomsPagination.hasNext = false;
          this.roomsPagination.nextCursor = null;
          this.roomsPagination.isLoading = false;
        }
      } catch (error) {
        console.error('추가 채팅방 로드 실패:', error);
        this.roomsPagination.isLoading = false;
      }
    },
    
    // 채팅방 메시지 조회 (초기 로드)
    async fetchChatHistory(roomId) {
      this.loading = true;
      this.error = null;
      this.currentRoomId = roomId;
      
      this.pagination[roomId] = {
        hasNext: false,
        nextCursor: null,
        isLoading: false
      };
      
      try {
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 400));
        const [result] = await Promise.all([
          getChatHistory(roomId, 30, null),
          minLoadingTime
        ]);
        
        this.messages[roomId] = result.data || [];
        // ✅ 정렬 보정
        this.dedupeAndSortMessages(roomId);

        this.pagination[roomId] = {
          hasNext: result.hasNext,
          nextCursor: result.nextCursor,
          isLoading: false
        };

        try {
          this.connectWebSocket(roomId);
        } catch (error) {
          console.log('WebSocket 연결 실패, HTTP API 모드로 전환:', error);
        }
      } catch (error) {
        console.error('메시지 조회 실패:', error);
        this.error = error.message;
        if (!this.messages[roomId]) {
          this.messages[roomId] = [];
        }
      } finally {
        this.loading = false;
      }
    },

    // 스크롤 페이지네이션: 이전 메시지 로드(프리펜드)
    async loadMoreMessages(roomId) {
      if (!this.pagination[roomId] || 
          !this.pagination[roomId].hasNext || 
          this.pagination[roomId].isLoading) {
        return;
      }

      this.pagination[roomId].isLoading = true;
      
      try {
        const result = await getChatHistory(roomId, 30, this.pagination[roomId].nextCursor);
        
        if (result.data && result.data.length > 0) {
          // 기존 메시지 앞에 추가(오래된 → 최신 순 유지)
          this.messages[roomId] = [...result.data, ...this.messages[roomId]];
          // ✅ 정렬 보정 + 중복 제거
          this.dedupeAndSortMessages(roomId);

          this.pagination[roomId] = {
            hasNext: result.hasNext,
            nextCursor: result.nextCursor,
            isLoading: false
          };
        } else {
          this.pagination[roomId].hasNext = false;
          this.pagination[roomId].nextCursor = null;
          this.pagination[roomId].isLoading = false;
        }
      } catch (error) {
        console.error('이전 메시지 로드 실패:', error);
        this.pagination[roomId].isLoading = false;
      }
    },
    
    sendOnlineStatus(roomId, isOnline) {
      if (!this.stompClient || !this.stompClient.connected) return;
      try {
        const statusRequest = { userId: MY_ID };
        const endpoint = isOnline ? 'online' : 'offline';
        this.stompClient.send(
          `/publish/chat-rooms/${roomId}/${endpoint}`,
          JSON.stringify(statusRequest)
        );
        console.log(`${isOnline ? '온라인' : '오프라인'} 상태 전송:`, statusRequest);
      } catch (error) {
        console.error('온라인 상태 전송 실패:', error);
      }
    },
    
    async sendMessage(content, files = null) {
      if (!this.currentRoomId) return;
      this.error = null;
      try {
        const now = new Date().toISOString();
        let uploadedFiles = null;

        if (files && files.length > 0) {
          const fileTypes = files.map(file => getFileTypeFromFile(file));
          uploadedFiles = await uploadFiles(this.currentRoomId, files, fileTypes);
        }

        if (this.stompClient && this.stompClient.connected) {
          await this.sendMessageViaWebSocket(content, uploadedFiles);
        } else {
          throw new Error('WebSocket 연결이 필요합니다. 메시지를 전송할 수 없습니다.');
        }
        
        // 방 메타 업데이트
        const idx = this.rooms.findIndex((r) => r.roomId === this.currentRoomId);
        if (idx !== -1) {
          const room = this.rooms[idx];
          room.lastMessageTime = now;
          room.unreadCount = 0;
          if (idx > 0) {
            this.rooms.splice(idx, 1);
            this.rooms.unshift(room);
          }
        }
      } catch (error) {
        console.error('메시지 전송 실패:', error);
        this.error = error.message;
        throw error;
      }
    },
    
    async createRoom(otherUserId) {
      this.loading = true;
      try {
        const roomId = await createChatRoom(otherUserId);
        await this.fetchMyChatRooms();
        return roomId;
      } catch (error) {
        console.error('채팅방 생성 실패:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateRoomName(roomId, roomName) {
      this.loading = true;
      try {
        await updateChatRoomName(roomId, roomName);
        const roomIndex = this.rooms.findIndex((r) => r.roomId === roomId);
        if (roomIndex !== -1) {
          const updatedRooms = [...this.rooms];
          updatedRooms[roomIndex] = {
            ...updatedRooms[roomIndex],
            customRoomName: roomName
          };
          this.rooms = updatedRooms;
        }
      } catch (error) {
        console.error('채팅방 이름 수정 실패:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async leaveRoom(roomId) {
      if (!roomId) return;
      this.loading = true;
      try {
        await leaveChatRoom(roomId);
        if (this.currentRoomId === roomId) {
          this.disconnectWebSocket();
        }
        this.rooms = this.rooms.filter((r) => r.roomId !== roomId);
        if (this.currentRoomId === roomId) {
          this.currentRoomId = null;
          delete this.messages[roomId];
          delete this.lastReadByMe[roomId];
          delete this.lastReadByOther[roomId];
          delete this.onlineUsers[roomId];
          delete this.pendingMyOffline[roomId];
        }
      } catch (error) {
        console.error('채팅방 나가기 실패:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    receiveMessage(message) {
      console.log('받은 메시지:', message);
      const chatMessageResponse = ChatMessageResponse.fromJson(message);
      const roomId = chatMessageResponse.roomId;

      if (!this.messages[roomId]) this.messages[roomId] = [];
      this.messages[roomId].push(chatMessageResponse);

      // 내 에코 메시지 처리 + 읽음 휴리스틱
      if (chatMessageResponse.senderId === MY_ID) {
        if (!this.isOtherOnline(roomId)) {
          this.markMyMessagePendingOffline(roomId, chatMessageResponse.id);
        } else if (chatMessageResponse?.createdAt) {
          this.lastReadByOther[roomId] = chatMessageResponse.createdAt;
        }
      }

      // 정렬/중복 보정
      this.dedupeAndSortMessages(roomId);

      const roomIndex = this.rooms.findIndex((r) => r.roomId === roomId);
      if (roomIndex !== -1) {
        const room = this.rooms[roomIndex];

        const raw = (chatMessageResponse.message ?? '');
        let lastMessageText = raw;
        if (!raw.trim() && chatMessageResponse.files && chatMessageResponse.files.length > 0) {
          const imageCount = chatMessageResponse.files.filter((f) => f.isImage()).length;
          const videoCount = chatMessageResponse.files.filter((f) => f.isVideo()).length;
          if (imageCount > 0 && videoCount > 0) lastMessageText = `사진 ${imageCount}장, 동영상 ${videoCount}개를 보냈습니다.`;
          else if (imageCount > 0) lastMessageText = `사진 ${imageCount}장을 보냈습니다.`;
          else if (videoCount > 0) lastMessageText = `동영상 ${videoCount}개를 보냈습니다.`;
          else lastMessageText = `파일 ${chatMessageResponse.files.length}개를 보냈습니다.`;
        }

        room.lastMessage = lastMessageText;
        room.lastMessageTime = chatMessageResponse.createdAt;

        if (roomId !== this.currentRoomId) {
          room.unreadCount = (room.unreadCount || 0) + 1;
        } else {
          if (chatMessageResponse.senderId !== MY_ID) {
            this.lastReadByMe[roomId] = chatMessageResponse.createdAt;
          }
        }

        if (roomIndex > 0) {
          this.rooms.splice(roomIndex, 1);
          this.rooms.unshift(room);
        }
      }
    },

    /* =========================
     * Room Selection
     * ========================= */
    selectRoom(roomId) {
      if (!roomId) return;
      if (this.currentRoomId && this.currentRoomId !== roomId) {
        this.disconnectWebSocket();
      }
      this.currentRoomId = roomId;

      // ✅ UI 읽음 + 스냅샷
      this.markRoomAsRead(roomId);

      if (this.messages[roomId] !== undefined) {
        // ✅ 캐시 즉시 표시 + 소켓 연결 + 최신 페이지 백그라운드 머지(SWR)
        try { this.connectWebSocket(roomId); } catch (error) { console.log('WebSocket 연결 실패:', error); }
        this.refreshRoomLatest(roomId); // ⬅️ 핵심
        return;
      }
      // 캐시가 없으면 최초 히스토리 로드
      this.fetchChatHistory(roomId);
    },

    /* =========================
     * Misc
     * ========================= */
    clearError() { this.error = null; },
    disconnectChat() {
      this.disconnectWebSocket();
      this.currentRoomId = null;
      this.messages = {};
      this.lastReadByMe = {};
      this.lastReadByOther = {};
      this.onlineUsers = {};
      this.pendingMyOffline = {};
    },
  },
});
