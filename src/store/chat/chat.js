import { defineStore } from 'pinia';
import Stomp from "webstomp-client";
import SockJs from "sockjs-client";
import { 
  getMyChatRooms, 
  getChatHistory, 
  uploadFiles,
  createChatRoom,
  updateChatRoomName,
  leaveChatRoom,
  readMessages
} from '../../services/chat/chatService';
import { ChatMessageResponse } from '../../models/chat/ChatResponse';
import { getFileTypeFromFile } from '../../utils/fileValidation';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 현재 사용자 ID 상수화 (실 서비스에선 Auth에서 주입)
const MY_ID = '550e8400-e29b-41d4-a716-446655440001';

// 내부 유틸: ms 대기
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const useChatStore = defineStore('chat', {
  state: () => ({
    rooms: [],
    messages: {},                 // roomId -> messages[]
    currentRoomId: null,
    loading: false,
    stompClient: null,            // 상세 방용 STOMP 클라이언트
    _stompRoomId: null,           // 현재 stompClient가 연결된 roomId (중복연결 방지)
    _disconnectPromise: null,     // 종료 직렬화 락
    error: null,
    onlineUsers: {},              // roomId -> [userIds]

    // 스크롤 페이지네이션 상태
    pagination: {},               // roomId -> { hasNext: boolean, nextCursor: string, isLoading: boolean }
    
    // 채팅방 목록 페이지네이션 상태
    roomsPagination: {
      hasNext: false,
      nextCursor: null,
      isLoading: false
    },

    // 읽음 처리 중복 방지
    _readingRooms: new Set(),

    _presenceInit: false,

    // ✅ 추가: 채팅방별 lastReadTimestamp 관리
    lastReadTimestamps: {},       // roomId -> lastReadTimestamp
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
  },
  
  actions: {
    /* =========================
     * Presence / Lifecycle
     * ========================= */
    async goOfflineFireAndForget(roomId) {
      const client = this.stompClient;
      if (!roomId || !client || !client.connected) return;
      try {
        client.send(
          `/publish/chat-rooms/${roomId}/offline`,
          JSON.stringify({ userId: MY_ID })
        );
      } catch (e) {
        // no-op: 파이어 앤 포겟
      }
    },

    // 안전 종료 유틸 (콜백 기반 disconnect를 Promise로)
    _safeDisconnect(client) {
      return new Promise((resolve) => {
        try {
          if (client && client.connected) {
            client.disconnect(() => resolve());
          } else {
            resolve();
          }
        } catch (_e) {
          resolve();
        }
      });
    },

    async flushOfflineAndDisconnect({ roomId, waitMs = 120 } = {}) {
      // 동시 종료 직렬화
      if (this._disconnectPromise) {
        try { await this._disconnectPromise; } catch (_e) {}
      }

      const client = this.stompClient;
      if (!client) return;

      this._disconnectPromise = (async () => {
        try {
          if (client.connected && roomId) {
            try { client.send(`/publish/chat-rooms/${roomId}/offline`, JSON.stringify({ userId: MY_ID })); } catch (_e) {}
            if (waitMs > 0) await sleep(waitMs);
          }
        } finally {
          await this._safeDisconnect(client);
          if (this.stompClient === client) {
            this.stompClient = null;
            this._stompRoomId = null;
          }
        }
      })();

      try {
        await this._disconnectPromise;
      } finally {
        this._disconnectPromise = null;
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
        await this.flushOfflineAndDisconnect({ roomId: rid, waitMs: 100 });
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
      const onlineUsers = this.onlineUsers[roomId] || [];
      const isOnline = onlineUsers.some((user) => user.userId !== MY_ID);
      return isOnline;
    },

    /* =========================
     * 온라인 상태 관리
     * ========================= */
    updateOnlineUsers(roomId, onlineUserIds) {
      const prev = Array.isArray(this.onlineUsers[roomId]) ? this.onlineUsers[roomId] : [];
      const wasOnline = prev.some((user) => user.userId !== MY_ID);

      this.onlineUsers[roomId] = Array.isArray(onlineUserIds) ? onlineUserIds : [];
      const nowOnline = this.isOtherOnline(roomId);
      
      console.log(`👥 채팅방 ${roomId} 온라인 사용자 업데이트:`, onlineUserIds);
      
      // 상대방이 온라인되어도 자동으로 읽음처리하지 않음
      // 읽음처리는 실제로 메시지를 읽었을 때만 해야 함
      console.log(`ℹ️ 상대방 온라인 상태 변경: ${wasOnline} → ${nowOnline}`);
      
      if (roomId === this.currentRoomId) {
        this.$patch({});
      }
    },

    // 채팅방 참여자 목록 업데이트
    updateChatParticipants(roomId, participants) {
      console.log(`👥 채팅방 ${roomId} 참여자 목록 업데이트:`, participants);
      
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
      console.log(`✅ markRoomAsRead: 채팅방 ${roomId} UI 읽음 처리 완료`);
    },

    // 채팅방 목록용 unreadCount 계산 (백엔드 데이터 기반)
    calculateRoomUnreadCount(roomId) {
      // 백엔드에서 제공하는 newMessageCount를 우선 사용
      const room = this.rooms.find(r => r.roomId === roomId);
      if (room && room.newMessageCount !== undefined) {
        return room.newMessageCount;
      }
      
      // 백엔드 데이터가 없으면 메시지 기반으로 계산 (fallback)
      const list = this.messages[roomId] || [];
      if (list.length === 0) return 0;
      
      // 가장 최근 상대방 메시지 시간을 기준으로 계산
      const otherUserMessages = list.filter(msg => msg.senderId !== MY_ID);
      if (otherUserMessages.length === 0) return 0;
      
      // 가장 최근 상대방 메시지 시간을 기준으로 unreadCount 계산
      const lastOtherMessageTime = otherUserMessages[otherUserMessages.length - 1].createdAt;
      const now = new Date();
      const lastMessageTime = new Date(lastOtherMessageTime);
      
      // 최근 1시간 내 메시지면 읽지 않은 것으로 간주
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      return lastMessageTime > oneHourAgo ? 1 : 0;
    },

    /* =========================
     * WebSocket (상세 방)
     * ========================= */
    async connectWebSocket(roomId) {
      if (!roomId) {
        console.error('roomId가 없습니다:', roomId);
        return;
      }

      // 기존 종료가 진행중이면 대기
      if (this._disconnectPromise) {
        try { await this._disconnectPromise; } catch (_e) {}
      }

      // 동일 방에 이미 연결되어 있으면 재연결 스킵
      if (this.stompClient && this.stompClient.connected && this._stompRoomId === roomId) {
        return;
      }

      // 다른 방에 연결 중이면 먼저 종료
      if (this.stompClient && this.stompClient.connected && this._stompRoomId !== roomId) {
        await this.flushOfflineAndDisconnect({ roomId: this._stompRoomId, waitMs: 80 });
      }

      try {
        const sockJs = new SockJs(`${API_BASE_URL}/connect`);
        const client = Stomp.over(sockJs);
        this.stompClient = client;
        this._stompRoomId = null;

        client.connect(
          {},
          () => {
            console.log(`✅ 채팅방 ${roomId} WebSocket 연결 성공`);
            
            // 메시지 구독
            client.subscribe(
              `/topic/chat-rooms/${roomId}/chat-message`,
              (message) => {
                try {
                  const parsed = JSON.parse(message.body);
                  this.receiveMessage(parsed);
                } catch (error) {
                  console.error('❌ 메시지 파싱 실패:', error);
                }
              }
            );

            // 온라인 참여자 상태 구독
            client.subscribe(
              `/topic/chat-rooms/${roomId}/online-participant`,
              (message) => {
                try {
                  const onlineUsers = JSON.parse(message.body);
                  console.log(`👥 채팅방 ${roomId} 온라인 참여자:`, onlineUsers);
                  this.updateOnlineUsers(roomId, onlineUsers);
                } catch (error) {
                  console.error('❌ 온라인 참여자 파싱 실패:', error);
                }
              }
            );

            // 채팅방 참여자 목록 구독
            client.subscribe(
              `/topic/chat-rooms/${roomId}/chat-participants`,
              (message) => {
                try {
                  const participants = JSON.parse(message.body);
                  console.log(`👥 채팅방 ${roomId} 참여자 목록:`, participants);
                  this.updateChatParticipants(roomId, participants);
                } catch (error) {
                  console.error('❌ 참여자 목록 파싱 실패:', error);
                }
              }
            );

            // 연결 성공 후 온라인 상태 알림
            this._stompRoomId = roomId;
            console.log(`🟢 채팅방 ${roomId}에 온라인 상태로 참여`);
            setTimeout(() => { this.sendOnlineStatus(roomId, true); }, 80);
          },
          async (error) => {
            console.error(`❌ 채팅방 ${roomId} WebSocket 연결 실패:`, error);
            await this._safeDisconnect(client);
            if (this.stompClient === client) {
              this.stompClient = null;
              this._stompRoomId = null;
            }
          }
        );
      } catch (error) {
        console.error('WebSocket 초기화 실패:', error);
        this.stompClient = null;
        this._stompRoomId = null;
      }
    },

    async disconnectWebSocket(roomId = this._stompRoomId || this.currentRoomId) {
      const client = this.stompClient;
      if (!client) { this.stompClient = null; this._stompRoomId = null; return; }

      try {
        await this.flushOfflineAndDisconnect({ roomId, waitMs: 100 });
      } catch (_e) {
        await this._safeDisconnect(client);
        if (this.stompClient === client) {
          this.stompClient = null;
          this._stompRoomId = null;
        }
      }
    },
    
    /* =========================
     * SWR 유틸
     * ========================= */
    // 메시지 시간 오름차순 정렬
    sortMessages(roomId) {
      const list = this.messages[roomId] || [];
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },

    // 방 입장 시 최신 메시지 로드
    async refreshRoomLatest(roomId) {
      try {
        const result = await getChatHistory(roomId, 30, null);
        const incoming = result.data || [];
        const current = this.messages[roomId] || [];
        
        if (incoming.length > 0) {
          // 중복 메시지 방지: 기존 메시지 ID와 비교하여 새 메시지만 추가
          const existingIds = new Set(current.map(msg => msg.id));
          const newMessages = incoming.filter(msg => !existingIds.has(msg.id));
          
          if (newMessages.length > 0) {
            console.log(`📥 새 메시지 ${newMessages.length}개 추가`);
            this.messages[roomId] = [...current, ...newMessages];
            this.sortMessages(roomId);
          } else {
            console.log(`⏭️ 새 메시지 없음, 기존 메시지 유지`);
          }
        }

        // 페이지네이션 상태 업데이트
        this.pagination[roomId] = {
          hasNext: result.hasNext,
          nextCursor: result.nextCursor,
          isLoading: false
        };
      } catch (e) {
        console.error('refreshRoomLatest 실패:', e);
      }
    },

    /* =========================
     * REST + WS Send
     * ========================= */
    async sendMessageViaWebSocket(content, uploadedFiles = null) {
      const client = this.stompClient;
      if (!this.currentRoomId || !client || !client.connected) {
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
        client.send(
          `/publish/chat-rooms/${this.currentRoomId}/message`,
          JSON.stringify(message)
        );
      } catch (error) {
        console.error('WebSocket 메시지 전송 실패:', error);
        throw error;
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
          console.log(`📤 메시지 전송 중: "${content}" (파일: ${files ? files.length : 0}개)`);
          
          // 메시지 전송 후 즉시 화면에 추가
          const tempMessage = {
            id: `temp-${Date.now()}`,
            roomId: this.currentRoomId,
            senderId: MY_ID,
            message: content,
            files: uploadedFiles ? uploadedFiles.files : [],
            createdAt: now,
            updatedAt: now,
            isTemp: true
          };
          
          if (!this.messages[this.currentRoomId]) {
            this.messages[this.currentRoomId] = [];
          }
          this.messages[this.currentRoomId].push(tempMessage);
          
          // WebSocket으로 메시지 전송
          await this.sendMessageViaWebSocket(content, uploadedFiles);
          
          console.log(`✅ 메시지 전송 완료`);
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
        if (this._stompRoomId === roomId) {
          await this.disconnectWebSocket(roomId);
        }
        this.rooms = this.rooms.filter((r) => r.roomId !== roomId);
        if (this.currentRoomId === roomId) {
          this.currentRoomId = null;
          delete this.messages[roomId];
          delete this.onlineUsers[roomId];
          delete this.pagination[roomId];
        }
      } catch (error) {
        console.error('채팅방 나가기 실패:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 메시지 수신 처리
    receiveMessage(message) {
      const chatMessageResponse = ChatMessageResponse.fromJson(message);
      const roomId = chatMessageResponse.roomId;
      
      const isMyMessage = chatMessageResponse.senderId === MY_ID;
      console.log(`${isMyMessage ? '📤' : '📥'} 메시지 수신: ${isMyMessage ? '내 메시지' : '상대방 메시지'} - "${chatMessageResponse.message}"`);

      if (!this.messages[roomId]) this.messages[roomId] = [];

      // 중복 메시지 체크 (더 엄격하게)
      const existingMessage = this.messages[roomId].find(
        msg => msg.id === chatMessageResponse.id || 
               (msg.isTemp && msg.message === chatMessageResponse.message && msg.senderId === chatMessageResponse.senderId)
      );
      
      if (existingMessage) {
        console.log(`⏭️ 중복 메시지 스킵: ${chatMessageResponse.id} (${chatMessageResponse.message})`);
        return;
      }

      if (isMyMessage) {
        // 내 메시지인 경우 임시 메시지를 실제 메시지로 교체
        const tempIndex = this.messages[roomId].findIndex(m => m.isTemp && m.message === chatMessageResponse.message);
        if (tempIndex !== -1) {
          console.log(`🔄 임시 메시지를 실제 메시지로 교체: ${chatMessageResponse.id}`);
          this.messages[roomId][tempIndex] = chatMessageResponse;
        } else {
          console.log(`➕ 새 메시지 추가: ${chatMessageResponse.id}`);
          this.messages[roomId].push(chatMessageResponse);
        }
        
        console.log(`✅ 내 메시지 전송 완료`);
      } else {
        // 상대방 메시지는 그대로 추가
        console.log(`➕ 상대방 메시지 추가: ${chatMessageResponse.id}`);
        this.messages[roomId].push(chatMessageResponse);
        
        // 상대방 메시지 수신 시 현재 방이면 자동 읽음 처리
        if (roomId === this.currentRoomId) {
          console.log(`📥 상대방 메시지 수신: 현재 방이므로 자동 읽음 처리`);
          setTimeout(() => {
            this.markMessagesAsRead(roomId);
          }, 100);
        }
      }

      // 정렬
      this.sortMessages(roomId);

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

        // 상대방 메시지만 unreadCount 증가
        if (roomId !== this.currentRoomId) {
          if (chatMessageResponse.senderId !== MY_ID) {
            room.unreadCount = (room.unreadCount || 0) + 1;
          }
        } else {
          // 현재 방에 있을 때는 unreadCount를 0으로 설정
          room.unreadCount = 0;
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
    async selectRoom(roomId) {
      if (!roomId) return;

      // 다른 방에서 넘어오는 경우, 안전 종료 먼저
      if (this._stompRoomId && this._stompRoomId !== roomId) {
        await this.disconnectWebSocket(this._stompRoomId);
      }

      this.currentRoomId = roomId;

      // 상대방 메시지가 있을 때만 읽음 처리 API 호출
      const hasOtherMessages = this.messages[roomId] && this.messages[roomId].some(msg => msg.senderId !== MY_ID);
      if (hasOtherMessages) {
        console.log(`📥 채팅방 입장: 상대방 메시지가 있어서 읽음 처리 API 호출`);
        await this.markMessagesAsRead(roomId);
      } else {
        console.log(`⏭️ 채팅방 입장: 상대방 메시지가 없어서 읽음 처리 API 호출 안함`);
      }

      // UI 읽음 처리
      this.markRoomAsRead(roomId);

      if (this.messages[roomId] !== undefined) {
        // 캐시된 메시지가 있으면 WebSocket만 연결하고 새로 로드하지 않음
        console.log(`📱 캐시된 메시지 사용 (${this.messages[roomId].length}개)`);
        await this.connectWebSocket(roomId);
        return;
      }
      // 캐시가 없으면 최초 히스토리 로드
      console.log(`�� 최초 메시지 로드`);
      const lastMessageTimestamp = await this.fetchChatHistory(roomId);
      
      // 백엔드에서 제공하는 lastMessageTimestamp가 있으면 이벤트 발생
      if (lastMessageTimestamp) {
        console.log(`✅ 백엔드에서 lastMessageTimestamp 받음: ${lastMessageTimestamp}`);
        // 이벤트를 통해 chatDetailScreen에 전달
        this.$emit('lastMessageTimestampReceived', { roomId, timestamp: lastMessageTimestamp });
      }
    },

    /* =========================
     * 읽음 처리
     * ========================= */
    async markMessagesAsRead(roomId) {
      if (!roomId) return;
      
      // 중복 읽음 처리 방지
      if (this._readingRooms.has(roomId)) {
        console.log(`⏭️ 채팅방 ${roomId} 이미 읽음 처리 중입니다. 스킵`);
        return;
      }
      
      this._readingRooms.add(roomId);
      
      try {
        // 백엔드에 읽음 처리 요청
        await readMessages(roomId, MY_ID);
        
        // ✅ 추가: 현재 시간으로 lastReadTimestamp 업데이트
        const now = new Date().toISOString();
        this.lastReadTimestamps[roomId] = now;
        console.log(`✅ 읽음 처리 후 lastReadTimestamp 업데이트: ${roomId} -> ${now}`);
        
        // 로컬 상태 업데이트
        const room = this.rooms.find(r => r.roomId === roomId);
        if (room) {
          room.unreadCount = 0;
        }
        
        // UI 강제 갱신
        if (roomId === this.currentRoomId) {
          this.$patch({});
        }
        
        console.log(`✅ 채팅방 ${roomId} 메시지 읽음 처리 완료`);
      } catch (error) {
        console.error('읽음 처리 실패:', error);
      } finally {
        this._readingRooms.delete(roomId);
      }
    },

    /* =========================
     * Misc
     * ========================= */
    clearError() { this.error = null; },
    async disconnectChat() {
      await this.disconnectWebSocket(this._stompRoomId || this.currentRoomId);
      this.currentRoomId = null;
      this.messages = {};
      this.onlineUsers = {};
    },
    
    sendOnlineStatus(roomId, isOnline) {
      const client = this.stompClient;
      if (!client || !client.connected) return;
      try {
        const statusRequest = { userId: MY_ID };
        const endpoint = isOnline ? 'online' : 'offline';
        console.log(`🔄 ${isOnline ? '온라인' : '오프라인'} 상태 전송 중...`);
        client.send(
          `/publish/chat-rooms/${roomId}/${endpoint}`,
          JSON.stringify(statusRequest)
        );
        console.log(`✅ ${isOnline ? '온라인' : '오프라인'} 상태 전송 완료`);
      } catch (_e) {
        console.error(`❌ ${isOnline ? '온라인' : '오프라인'} 상태 전송 실패:`, _e);
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
        
        // ✅ 추가: 백엔드에서 받은 lastReadTimestamp 저장
        if (result.lastReadTimestamp) {
          // 채팅방별로 lastReadTimestamp 저장
          this.rooms.forEach(room => {
            if (result.lastReadTimestamp) {
              this.lastReadTimestamps[room.roomId] = result.lastReadTimestamp;
            }
          });
          console.log(`✅ 채팅방 목록에서 lastReadTimestamp 받음: ${result.lastReadTimestamp}`);
        }
        
        // 상대방 메시지만 unreadCount 계산
        this.rooms.forEach(room => {
          room.unreadCount = this.calculateRoomUnreadCount(room.roomId);
        });
        
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
          const newRooms = result.data.map(room => {
            room.unreadCount = this.calculateRoomUnreadCount(room.roomId);
            return room;
          });
          
          // ✅ 추가: 새로 로드된 채팅방들의 lastReadTimestamp 저장
          if (result.lastReadTimestamp) {
            newRooms.forEach(room => {
              this.lastReadTimestamps[room.roomId] = result.lastReadTimestamp;
            });
          }
          
          this.rooms = [...this.rooms, ...newRooms];
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
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 300));
        const [result] = await Promise.all([
          getChatHistory(roomId, 30, null),
          minLoadingTime
        ]);
        
        this.messages[roomId] = result.data || [];
        
        // ✅ 추가: 백엔드에서 받은 lastReadTimestamp 저장
        if (result.lastReadTimestamp) {
          this.lastReadTimestamps[roomId] = result.lastReadTimestamp;
          console.log(`✅ 백엔드에서 lastReadTimestamp 받음: ${roomId} -> ${result.lastReadTimestamp}`);
        }
        
        this.sortMessages(roomId);

        this.pagination[roomId] = {
          hasNext: result.hasNext,
          nextCursor: result.nextCursor,
          isLoading: false
        };

        await this.connectWebSocket(roomId);
        
        // 백엔드에서 제공하는 lastReadTimestamp 반환
        return result.lastReadTimestamp;
      } catch (error) {
        console.error('메시지 조회 실패:', error);
        this.error = error.message;
        if (!this.messages[roomId]) {
          this.messages[roomId] = [];
        }
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 스크롤 페이지네이션: 이전 메시지 로드
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
          this.messages[roomId] = [...result.data, ...this.messages[roomId]];
          
          // ✅ 추가: 백엔드에서 받은 lastReadTimestamp 저장
          if (result.lastReadTimestamp) {
            this.lastReadTimestamps[roomId] = result.lastReadTimestamp;
            console.log(`✅ 이전 메시지 로드 후 lastReadTimestamp 업데이트: ${roomId} -> ${result.lastReadTimestamp}`);
          }
          
          this.sortMessages(roomId);

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
  },
});
