import { defineStore } from 'pinia';
import Stomp from "webstomp-client";
import SockJs from "sockjs-client";
import { 
  getMyChatRooms, 
  getChatHistory, 
  sendMessage, 
  uploadFiles,
  createChatRoom,
  updateChatRoomName,
  leaveChatRoom
} from '../../services/chat/chatService';
import { ChatMessageResponse } from '../../models/chat/ChatResponse';

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

    // ✅ [NEW] 오프라인 동안 내가 보낸 메시지 버킷 (각 메시지별 1 표시용)
    pendingMyOffline: {},         // roomId -> { [messageId]: true }
  }),
  
  getters: {
    currentRoom: (state) => {
      return state.rooms.find((room) => room.roomId === state.currentRoomId);
    },
    totalUnreadCount: (state) => {
      return state.rooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
    },
    // ✅ 온라인 여부 의존 제거
    getUnreadCount: (state) => (roomId) => {
      const room = state.rooms.find((r) => r.roomId === roomId);
      return room?.unreadCount || 0;
    },
    getError: (state) => state.error,
    hasRooms: (state) => state.rooms.length > 0,
    getOtherUserId: () => (_roomId) => null,
  },
  
  actions: {
    isOtherOnline(roomId) {
      return (this.onlineUsers[roomId] || []).some((id) => id !== MY_ID);
    },

    // [NEW] 방별 버킷 보장
    ensurePendingBucket(roomId) {
      if (!this.pendingMyOffline[roomId]) this.pendingMyOffline[roomId] = {};
    },

    // [NEW] 내 메시지를 '오프라인 보류'로 등록
    markMyMessagePendingOffline(roomId, messageId) {
      if (!messageId) return;
      this.ensurePendingBucket(roomId);
      this.pendingMyOffline[roomId][messageId] = true;
    },

    // [NEW] 상대가 다시 온라인이 되었을 때: 경계 갱신 + 버킷 비우기
    flushPendingBecauseOtherOnline(roomId) {
      const list = this.messages[roomId] || [];
      const lastMyMsg = [...list].reverse().find((m) => m.senderId === MY_ID);
      if (lastMyMsg?.createdAt) {
        // '상대가 돌아오면 적어도 여기까지는 읽었다'는 휴리스틱
        this.lastReadByOther[roomId] = lastMyMsg.createdAt;
      }
      this.pendingMyOffline[roomId] = {};
      if (roomId === this.currentRoomId) this.$patch({});
    },

    // WebSocket 연결
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

    // WebSocket 연결 해제
    disconnectWebSocket() {
      if (this.stompClient && this.stompClient.connected) {
        try {
          if (this.currentRoomId) {
            this.sendOnlineStatus(this.currentRoomId, false);
          }
          this.stompClient.disconnect();
          console.log('WebSocket 연결 해제');
        } catch (error) {
          console.error('WebSocket 연결 해제 실패:', error);
        } finally {
          this.stompClient = null;
        }
      }
    },
    
    // ✅ 온라인 이벤트를 "상태+오프라인→온라인 전환"에만 사용
    updateOnlineUsers(roomId, onlineUserIds) {
      console.log('온라인 사용자 업데이트:', { roomId, onlineUserIds });

      const prev = Array.isArray(this.onlineUsers[roomId]) ? this.onlineUsers[roomId] : [];
      const wasOnline = prev.some((id) => id !== MY_ID);

      // 현재 상태 저장
      this.onlineUsers[roomId] = Array.isArray(onlineUserIds) ? onlineUserIds : [];
      const nowOnline = this.isOtherOnline(roomId);

      // [핵심] 오프라인 → 온라인 전환 시: 오프라인 동안 보낸 내 메시지들을 읽음으로 전환
      if (!wasOnline && nowOnline) {
        this.flushPendingBecauseOtherOnline(roomId); // [NEW]
      }

      if (roomId === this.currentRoomId) {
        this.$patch({});
      }
    },
    
    // ✅ UI 읽음 처리 + 내가 읽은 스냅샷 저장
    markRoomAsRead(roomId) {
      const idx = this.rooms.findIndex((room) => room.roomId === roomId);
      if (idx !== -1) {
        this.rooms[idx].unreadCount = 0;
      }

      // 내가 읽은 범위(상대 메시지의 최신 시각) 스냅샷
      const list = this.messages[roomId] || [];
      const lastOtherMsg = [...list].reverse().find((m) => m.senderId !== MY_ID);
      if (lastOtherMsg?.createdAt) {
        this.lastReadByMe[roomId] = lastOtherMsg.createdAt;
      } else {
        // 상대 메시지가 없으면 현재 시각으로 찍어도 무방
        this.lastReadByMe[roomId] = new Date().toISOString();
      }
    },

    // 메시지 전송 (WebSocket 사용)
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

    getFileTypeFromFile(file) {
      if (!file || !file.name) {
        console.error('파일 또는 파일 이름이 없습니다:', file);
        return 'UNKNOWN';
      }
      const fileName = file.name;
      const lastDotIndex = fileName.lastIndexOf(".");
      if (lastDotIndex === -1) {
        console.error('파일 확장자가 없습니다:', fileName);
        return 'UNKNOWN';
      }
      const extension = fileName.substring(lastDotIndex + 1).toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const videoExtensions = ['mp4', 'avi', 'mov'];
      if (imageExtensions.includes(extension)) return 'IMAGE';
      if (videoExtensions.includes(extension)) return 'VIDEO';
      console.error('지원하지 않는 파일 형식입니다:', extension);
      return 'UNKNOWN';
    },

    // 내 채팅방 목록 조회
    async fetchMyChatRooms() {
      this.loading = true;
      this.error = null;
      try {
        const rooms = await getMyChatRooms();
        this.rooms = rooms;
      } catch (error) {
        console.error('채팅방 목록 조회 실패:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    // 채팅방 메시지 조회
    async fetchChatHistory(roomId) {
      this.loading = true;
      this.error = null;
      this.currentRoomId = roomId;
      try {
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 400));
        const [messages] = await Promise.all([
          getChatHistory(roomId),
          minLoadingTime
        ]);
        this.messages[roomId] = messages || [];

        // 웹소켓 연결
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
    
    // 온라인 상태 전송
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
    
    // 메시지 전송
    async sendMessage(content, files = null) {
      if (!this.currentRoomId) return;
      this.error = null;
      try {
        const now = new Date().toISOString();
        let uploadedFiles = null;

        if (files && files.length > 0) {
          const fileTypes = files.map(file => this.getFileTypeFromFile(file));
          uploadedFiles = await uploadFiles(this.currentRoomId, files, fileTypes);
        }

        if (this.stompClient && this.stompClient.connected) {
          await this.sendMessageViaWebSocket(content, uploadedFiles);
        } else {
          const message = await sendMessage(this.currentRoomId, content, uploadedFiles);
          if (!this.messages[this.currentRoomId]) {
            this.messages[this.currentRoomId] = [];
          }
          this.messages[this.currentRoomId].push(message);

          // [NEW] 상대가 오프라인이면 보류 등록, 온라인이면 즉시 읽음 경계 갱신(heuristic)
          if (!this.isOtherOnline(this.currentRoomId) && message?.id) {
            this.markMyMessagePendingOffline(this.currentRoomId, message.id);
          } else if (message?.createdAt) {
            this.lastReadByOther[this.currentRoomId] = message.createdAt;
          }
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
    
    // 채팅방 생성
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
    
    // 채팅방 이름 수정
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
    
    // 채팅방 나가기
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
          delete this.pendingMyOffline[roomId]; // [NEW]
        }
      } catch (error) {
        console.error('채팅방 나가기 실패:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 새 메시지 수신
    receiveMessage(message) {
      console.log('받은 메시지:', message);
      const chatMessageResponse = ChatMessageResponse.fromJson(message);
      const roomId = chatMessageResponse.roomId;

      if (!this.messages[roomId]) this.messages[roomId] = [];
      this.messages[roomId].push(chatMessageResponse);

      // [NEW] 내 에코 메시지 처리
      if (chatMessageResponse.senderId === MY_ID) {
        if (!this.isOtherOnline(roomId)) {
          // 상대 오프라인이면 보류 등록
          this.markMyMessagePendingOffline(roomId, chatMessageResponse.id);
        } else if (chatMessageResponse?.createdAt) {
          // 상대 온라인이면 실시간 읽음 가정 (1 표시 방지)
          this.lastReadByOther[roomId] = chatMessageResponse.createdAt;
        }
      }

      const roomIndex = this.rooms.findIndex((r) => r.roomId === roomId);
      if (roomIndex !== -1) {
        const room = this.rooms[roomIndex];

        // 마지막 메시지 프리뷰 텍스트
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

        // ✅ 현재 방이 아니면 '내가 안 읽은' 증가
        if (roomId !== this.currentRoomId) {
          room.unreadCount = (room.unreadCount || 0) + 1;
        } else {
          // ✅ 현재 방이면 상대 메시지를 즉시 내가 읽음으로 간주 (스냅샷)
          if (chatMessageResponse.senderId !== MY_ID) {
            this.lastReadByMe[roomId] = chatMessageResponse.createdAt;
          }
        }

        // 최신 정렬
        if (roomIndex > 0) {
          this.rooms.splice(roomIndex, 1);
          this.rooms.unshift(room);
        }
      }
    },
    
    // 채팅방 선택
    selectRoom(roomId) {
      if (!roomId) return;
      if (this.currentRoomId && this.currentRoomId !== roomId) {
        this.disconnectWebSocket();
      }
      this.currentRoomId = roomId;

      // ✅ UI 읽음 + 스냅샷
      this.markRoomAsRead(roomId);

      if (this.messages[roomId] !== undefined) {
        this.loading = true;
        setTimeout(() => { this.loading = false; }, 150);
        try { this.connectWebSocket(roomId); } catch (error) { console.log('WebSocket 연결 실패:', error); }
        return;
      }
      this.fetchChatHistory(roomId);
    },
    
    clearError() { this.error = null; },
    disconnectChat() {
      this.disconnectWebSocket();
      this.currentRoomId = null;
      this.messages = {};
      this.lastReadByMe = {};
      this.lastReadByOther = {};
      this.onlineUsers = {};
      this.pendingMyOffline = {}; // [NEW]
    },

    // 호환성 함수
    async fetchRooms() { return this.fetchMyChatRooms(); },
    async fetchMessages(roomId) { return this.fetchChatHistory(roomId); },
  },
});
