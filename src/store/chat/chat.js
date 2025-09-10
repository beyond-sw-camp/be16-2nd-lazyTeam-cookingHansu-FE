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
  getChatRoomParticipants
} from '../../services/chat/chatService';
import { ChatMessageResponse } from '../../models/chat/ChatResponse';
import { getFileTypeFromFile } from '../../utils/fileValidation';
import { useAuthStore } from '../auth/auth';

// API_BASE_URL은 interceptor에서 관리됨

// 현재 사용자 ID는 Auth 스토어에서 가져옴
const getMyId = () => {
  try {
    const authStore = useAuthStore();
    return authStore.user?.id || null;
  } catch (error) {
    console.error('사용자 ID를 가져올 수 없습니다:', error);
    return null;
  }
};

// Access Token을 가져옴
const getAccessToken = () => {
  try {
    const authStore = useAuthStore();
    return authStore.accessToken || null;
  } catch (error) {
    console.error('Access Token을 가져올 수 없습니다:', error);
    return null;
  }
};



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

    participants: {},             // roomId -> [{ id, roomId, lastMessageId }]
    _unreadCountCache: new Map(), // roomId -> unreadCount (캐시)
  }),
  
  getters: {
    currentRoom: (state) => {
      return state.rooms.find((room) => room.roomId === state.currentRoomId);
    },
    totalUnreadCount: (state) => {
      return state.rooms.reduce((total, room) => {
        const unreadCount = state.calculateUnreadCount(room.roomId);
        return total + unreadCount;
      }, 0);
    },
    getUnreadCount: (state) => (roomId) => {
      if (state._unreadCountCache.has(roomId)) {
        return state._unreadCountCache.get(roomId);
      }
      
      const unreadCount = state.calculateUnreadCount(roomId);
      state._unreadCountCache.set(roomId, unreadCount);
      return unreadCount;
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
        const userId = getMyId();
        if (userId) {
          client.send(
            `/publish/chat-rooms/${roomId}/offline`,
            JSON.stringify({ userId })
          );
        }
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
          const userId = getMyId();
          if (userId) {
            try { client.send(`/publish/chat-rooms/${roomId}/offline`, JSON.stringify({ userId })); } catch (_e) {}
          }
          if (waitMs > 0) await new Promise(resolve => setTimeout(resolve, waitMs));
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
      const userId = getMyId();
      if (!userId) return false;
      const onlineUsers = this.onlineUsers[roomId] || [];
      const isOnline = onlineUsers.some((user) => user.userId !== userId);
      return isOnline;
    },

    /* =========================
     * 온라인 상태 관리
     * ========================= */
    updateOnlineUsers(roomId, onlineUserIds) {
      const userId = getMyId();
      if (!userId) return;
      
      const prev = Array.isArray(this.onlineUsers[roomId]) ? this.onlineUsers[roomId] : [];
      const wasOnline = prev.some((user) => user.userId !== userId);

      this.onlineUsers[roomId] = Array.isArray(onlineUserIds) ? onlineUserIds : [];
      const nowOnline = this.isOtherOnline(roomId);
      
      
      if (!wasOnline && nowOnline) {
        if (roomId === this.currentRoomId) {
          this.$patch({});
        }
      }
      
      if (wasOnline && !nowOnline) {
        
        this.loadChatRoomParticipants(roomId).then(() => {
          this.invalidateUnreadCountCache(roomId);
          this.recalculateAllMessageUnreadCounts(roomId);
          
          this.$patch({});
        }).catch(error => {
          console.error(`❌ 상대방 오프라인 후 참여자 정보 갱신 실패:`, error);
        });
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
        this.rooms[idx].newMessageCount = 0;
      }
      
      this._unreadCountCache.set(roomId, 0);
      
    },

    calculateUnreadCount(roomId) {
      const userId = getMyId();
      if (!userId) return 0;
      
      const room = this.rooms.find(r => r.roomId === roomId);
      if (room && room.newMessageCount !== undefined) {
        return room.newMessageCount;
      }
      
      const messages = this.messages[roomId] || [];
      const participants = this.participants[roomId] || [];
      
      const otherParticipant = participants.find(p => p.id !== userId);
      if (!otherParticipant) {
        return 0;
      }
      
      const otherLastReadMessageId = otherParticipant.lastMessageId || 0;
      
      const unreadMessages = messages.filter(msg => 
        msg.id > otherLastReadMessageId &&
        msg.senderId === userId &&
        !msg.isPending
      );
      
      const unreadCount = unreadMessages.length;
      

      
      return unreadCount;
    },

    updateParticipantLastMessageId(roomId, messageId) {
      const userId = getMyId();
      if (!userId) return;
      
      const participants = this.participants[roomId] || [];
      
      const otherParticipant = participants.find(p => p.id !== userId);
      if (otherParticipant) {
        otherParticipant.lastMessageId = messageId - 1;
        
        this.invalidateUnreadCountCache(roomId);
      }
    },

    // ✅ 추가: Redis에서 상대방 읽음 상태 변경 시 실시간 업데이트
    updateParticipantFromRedis(roomId, participantId, lastMessageId) {
      const userId = getMyId();
      if (!userId) return;
      
      const participants = this.participants[roomId] || [];
      const participant = participants.find(p => p.id === participantId);
      
      if (participant) {
        const oldLastMessageId = participant.lastMessageId || 0;
        participant.lastMessageId = lastMessageId;
        
        
        // 상대방의 읽음 상태가 변경되었을 때만 unread count 재계산
        if (participantId !== userId && oldLastMessageId !== lastMessageId) {
          this.invalidateUnreadCountCache(roomId);
          
          // UI 갱신
          if (roomId === this.currentRoomId) {
            this.$patch({});
          }
        }
      } else {
      }
    },

    // ✅ 추가: Redis에서 전체 참여자 목록 업데이트 시 실시간 동기화
    updateChatParticipantsFromRedis(roomId, participantsData) {
      
      // 기존 참여자 정보와 비교하여 변경사항 확인
      const currentParticipants = this.participants[roomId] || [];
      const hasChanges = this.checkParticipantChanges(currentParticipants, participantsData);
      
      if (hasChanges) {
        // ✅ 수정: Redis 데이터로 로컬 상태 완전 교체 (강제 동기화)
        this.participants[roomId] = participantsData;
        
        // unread count 캐시 무효화
        this.invalidateUnreadCountCache(roomId);
        
        // UI 갱신
        if (roomId === this.currentRoomId) {
          this.$patch({});
        }
      } else {
        // ✅ 수정: 변경사항이 없어도 Redis 최신 정보로 강제 업데이트
        this.participants[roomId] = participantsData;
        this.invalidateUnreadCountCache(roomId);
      }
    },

    // ✅ 추가: 참여자 정보 변경사항 확인
    checkParticipantChanges(currentParticipants, newParticipants) {
      if (currentParticipants.length !== newParticipants.length) {
        return true;
      }
      
      for (let i = 0; i < currentParticipants.length; i++) {
        const current = currentParticipants[i];
        const newParticipant = newParticipants.find(p => p.id === current.id);
        
        if (!newParticipant) {
          return true;
        }
        
        if (current.lastMessageId !== newParticipant.lastMessageId) {
          return true;
        }
      }
      
      return false;
    },

    // ✅ 추가: unread count 캐시 무효화
    invalidateUnreadCountCache(roomId) {
      this._unreadCountCache.delete(roomId);
    },

    // ✅ 수정: 특정 메시지의 unread count 계산 (상대방 기준 + 온라인 상태 고려)
    getMessageUnreadCount(roomId, messageId) {
      const userId = getMyId();
      if (!userId) return 0;
      
      const participants = this.participants[roomId] || [];
      const otherParticipant = participants.find(p => p.id !== userId);
      
      if (!otherParticipant) {
        return 0; // 상대방 정보가 없으면 0
      }
      
      const otherLastReadMessageId = otherParticipant.lastMessageId || 0;
      
      // 내가 보낸 메시지이고, 상대방이 읽지 않은 경우 1
      const message = this.messages[roomId]?.find(msg => msg.id === messageId);
      if (!message) {
        return 0;
      }
      
      let unreadCount = 0;
      if (message.senderId === userId) {
        // 내가 보낸 메시지: 상대방이 읽었으면 0, 읽지 않았으면 1
        if (message.isPending) {
          // pending 메시지(방금 보낸 메시지)는 항상 0
          unreadCount = 0;
        } else {
          // 실제 메시지: 상대방이 읽었으면 0, 읽지 않았으면 1
          unreadCount = message.id > otherLastReadMessageId ? 1 : 0;
        }
        
        // ✅ 추가: 상대방이 온라인일 때는 읽음 처리 (UI에서만)
        const onlineUsers = this.onlineUsers[roomId] || [];
        const isOtherOnline = onlineUsers.some(user => user.userId !== userId);
        
        if (isOtherOnline) {
          unreadCount = 0;
        }
      } else {
        // 상대방 메시지: 항상 0 (내가 읽은 상태)
        unreadCount = 0;
      }
      
      return unreadCount;
    },

    recalculateAllMessageUnreadCounts(roomId) {
      const userId = getMyId();
      if (!userId) return;
      
      const messages = this.messages[roomId] || [];
      const participants = this.participants[roomId] || [];
      const otherParticipant = participants.find(p => p.id !== userId);
      
      if (!otherParticipant) {
        return;
      }
      
      const otherLastReadMessageId = otherParticipant.lastMessageId || 0;
      
      let totalUnreadCount = 0;
      
      messages.forEach(message => {
        if (message.senderId === userId && !message.isPending) {
          const isUnread = message.id > otherLastReadMessageId;
          message.unreadCount = isUnread ? 1 : 0;
          
          if (isUnread) {
            totalUnreadCount++;
          }
        }
      });
      
      this.$patch({});
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
        const token = getAccessToken();
        if (!token) {
          throw new Error('Access Token이 없습니다. 로그인이 필요합니다.');
        }

        const sockJs = new SockJs(`${import.meta.env.VITE_API_BASE_URL}/connect`);
        const client = Stomp.over(sockJs);
        this.stompClient = client;
        this._stompRoomId = null;

        // Authorization 헤더 추가
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        client.connect(
          headers,
          () => {
            
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
              },
              { 'Authorization': `Bearer ${token}` }
            );

            // 온라인 참여자 상태 구독
            client.subscribe(
              `/topic/chat-rooms/${roomId}/online-participant`,
              (message) => {
                try {
                  const onlineUsers = JSON.parse(message.body);
                  this.updateOnlineUsers(roomId, onlineUsers);
                } catch (error) {
                  console.error('❌ 온라인 참여자 파싱 실패:', error);
                }
              },
              { 'Authorization': `Bearer ${token}` }
            );

            // 채팅방 참여자 목록 구독 (Redis 실시간 동기화)
            client.subscribe(
              `/topic/chat-rooms/${roomId}/chat-participants`,
              (message) => {
                try {
                  const participants = JSON.parse(message.body);
                  // Redis 업데이트 플래그 설정
                  this._isRedisUpdate = true;
                  this.updateChatParticipants(roomId, participants);
                  
                  // Redis 동기화 후 즉시 unread count 재계산 및 UI 갱신
                  setTimeout(() => {
                    this.invalidateUnreadCountCache(roomId);
                    const newUnreadCount = this.calculateUnreadCount(roomId);
                    this.$patch({});
                  }, 100);
                } catch (error) {
                  console.error('❌ 참여자 목록 파싱 실패:', error);
                }
              },
              { 'Authorization': `Bearer ${token}` }
            );



            // 연결 성공 후 온라인 상태 알림 및 참여자 목록 로드
            this._stompRoomId = roomId;
            setTimeout(() => { this.sendOnlineStatus(roomId, true); }, 80);
            
            // 참여자 목록 로드
            this.loadChatRoomParticipants(roomId).catch(error => {
              // 참여자 정보 로드 실패 시 재시도
              setTimeout(() => {
                this.loadChatRoomParticipants(roomId).catch(retryError => {
                  // 재시도 실패는 무시
                });
              }, 1000);
            });
            

          },
          async (error) => {
            await this._safeDisconnect(client);
            if (this.stompClient === client) {
              this.stompClient = null;
              this._stompRoomId = null;
            }
          }
        );
      } catch (error) {
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

    // 방 입장 시 최신 메시지 로드 + 참여자 정보 강제 갱신
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
            this.messages[roomId] = [...current, ...newMessages];
            this.sortMessages(roomId);
            this.invalidateUnreadCountCache(roomId);
          }
        }
        
        // 방 입장 시 참여자 정보 강제 갱신 (새로고침/페이지 이동 대응)
        try {
          await this.loadChatRoomParticipants(roomId);
        } catch (error) {
          console.error(`❌ 방 입장 시 참여자 정보 갱신 실패:`, error);
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

              const userId = getMyId();
        if (!userId) {
          console.error('사용자 ID가 없습니다. 로그인이 필요합니다.');
          return;
        }
        
        const message = {
          roomId: this.currentRoomId,
          senderId: userId,
          message: content,
          files: uploadedFiles ? uploadedFiles.files : null
        };

      try {
        client.send(
          `/publish/chat-rooms/${this.currentRoomId}/chat-message`,
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
          const userId = getMyId();
          if (!userId) {
            console.error('사용자 ID가 없습니다. 로그인이 필요합니다.');
            return;
          }
          
          const realMessage = {
            id: `pending-${Date.now()}`,
            roomId: this.currentRoomId,
            senderId: userId,
            message: content,
            files: uploadedFiles ? uploadedFiles.files : [],
            createdAt: now,
            updatedAt: now,
            isPending: true
          };
          
          if (!this.messages[this.currentRoomId]) {
            this.messages[this.currentRoomId] = [];
          }
          this.messages[this.currentRoomId].push(realMessage);
          
          this.invalidateUnreadCountCache(this.currentRoomId);
          realMessage.unreadCount = 0;
          this.$patch({});
          
          await this.sendMessageViaWebSocket(content, uploadedFiles);
          
          try {
            await this.loadChatRoomParticipants(this.currentRoomId);
          } catch (error) {
            console.error(`❌ 메시지 전송 후 참여자 정보 갱신 실패:`, error);
          }
        } else {
          throw new Error('WebSocket 연결이 필요합니다. 메시지를 전송할 수 없습니다.');
        }
        
        // 방 메타 업데이트
        const idx = this.rooms.findIndex((r) => r.roomId === this.currentRoomId);
        if (idx !== -1) {
          const room = this.rooms[idx];
          room.lastMessageTime = now;
          room.lastMessage = content || (uploadedFiles && uploadedFiles.files && uploadedFiles.files.length > 0 ? '파일을 전송했습니다.' : '');
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
    
    async createRoom(myId, inviteeId) {
      this.loading = true;
      try {
        // 실제 사용자 ID 확인
        const currentUserId = myId || getMyId();
        if (!currentUserId) {
          throw new Error('사용자 ID가 없습니다. 로그인이 필요합니다.');
        }
        
        const roomId = await createChatRoom(currentUserId, inviteeId);
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
        // ✅ 제거: 채팅방 나가기 전 읽음 처리 제거 (상대방 기준으로 관리)
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
          delete this.participants[roomId];
          this._unreadCountCache.delete(roomId);
        }
      } catch (error) {
        console.error('채팅방 나가기 실패:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 메시지 수신 처리
    async receiveMessage(message) {
      const userId = getMyId();
      if (!userId) {
        console.error('사용자 ID가 없습니다. 메시지를 처리할 수 없습니다.');
        return;
      }
      
      const chatMessageResponse = ChatMessageResponse.fromJson(message);
      const roomId = chatMessageResponse.roomId;
      
      const isMyMessage = chatMessageResponse.senderId === userId;

      if (!this.messages[roomId]) this.messages[roomId] = [];

      // 중복 메시지 체크 (내 메시지는 임시 메시지 교체 허용)
      if (isMyMessage) {
        // 내 메시지인 경우: 실제 ID로 중복 체크만
        const existingMessage = this.messages[roomId].find(msg => msg.id === chatMessageResponse.id);
        if (existingMessage) {
          return;
        }
      } else {
        // 상대방 메시지인 경우: 기존 로직 유지
        const existingMessage = this.messages[roomId].find(
          msg => msg.id === chatMessageResponse.id || 
                 (msg.isTemp && msg.message === chatMessageResponse.message && msg.senderId === chatMessageResponse.senderId)
        );
        
        if (existingMessage) {
          return;
        }
      }

      if (isMyMessage) {
        // 내 메시지인 경우 pending 메시지를 실제 메시지로 교체
        const pendingIndex = this.messages[roomId].findIndex(m => m.isPending && m.message === chatMessageResponse.message);
        if (pendingIndex !== -1) {
          // 반응성을 보장하기 위해 배열 전체를 새로 생성
          const updatedMessages = [...this.messages[roomId]];
          updatedMessages[pendingIndex] = chatMessageResponse;
          this.messages[roomId] = updatedMessages;
          
          // 메시지 교체 시 unread count 캐시 무효화
          this.invalidateUnreadCountCache(roomId);
          
          // 강제로 computed 재계산 트리거
          this.$patch({});
          
          // 참여자 정보 자동 업데이트 (Redis 동기화)
          this.updateParticipantLastMessageId(roomId, chatMessageResponse.id);
          
          this.invalidateUnreadCountCache(roomId);
          
          // 내 메시지 수신 후 참여자 정보 최신화 확인
          try {
            await this.loadChatRoomParticipants(roomId);
          } catch (error) {
            console.error(`❌ 참여자 정보 최신화 실패:`, error);
          }
        } else {
          this.messages[roomId].push(chatMessageResponse);
          this.invalidateUnreadCountCache(roomId);
        }
      } else {
        // 상대방 메시지는 그대로 추가
        this.messages[roomId].push(chatMessageResponse);
        this.invalidateUnreadCountCache(roomId);
        
        // 상대방 메시지 수신 시 현재 방이면 읽음 처리
        if (roomId === this.currentRoomId) {
          // 읽음 처리는 백엔드에서 offline 시에만 처리
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

        // // 상대방 메시지만 unreadCount 증가
        // if (roomId !== this.currentRoomId) {
        //   if (chatMessageResponse.senderId !== userId) {
        //     room.unreadCount = (room.unreadCount || 0) + 1;
        //   }
        // } else {
        //   // 현재 방에 있을 때는 unreadCount를 0으로 설정
        //   room.unreadCount = 0;
        // }

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

      const userId = getMyId();
      if (!userId) {
        console.error('사용자 ID가 없습니다. 채팅방을 선택할 수 없습니다.');
        return;
      }
      
      // 상대방 메시지가 있을 때만 즉시 읽음 처리
      const messages = this.messages[roomId] || [];
      const lastOtherMessage = messages.filter(msg => msg.senderId !== userId).pop();
      
      if (lastOtherMessage) {
        // 읽음 처리는 백엔드에서 offline 시에만 처리
      }

      // UI 읽음 처리
      this.markRoomAsRead(roomId);

      if (this.messages[roomId] !== undefined) {
        await this.connectWebSocket(roomId);
        return;
      }
      await this.fetchChatHistory(roomId);
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
      this.participants = {};
      this._unreadCountCache.clear();
    },
    
    sendOnlineStatus(roomId, isOnline) {
      const userId = getMyId();
      if (!userId) {
        console.error('사용자 ID가 없습니다. 온라인 상태를 전송할 수 없습니다.');
        return;
      }
      
      const client = this.stompClient;
      if (!client || !client.connected) return;
      try {
        const statusRequest = { userId };
        const endpoint = isOnline ? 'online' : 'offline';
        client.send(
          `/publish/chat-rooms/${roomId}/${endpoint}`,
          JSON.stringify(statusRequest)
        );
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
        
        // 백엔드에서 제공하는 newMessageCount 사용
        
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
          // 백엔드에서 제공하는 newMessageCount 사용
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
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 300));
        const [result] = await Promise.all([
          getChatHistory(roomId, 30, null),
          minLoadingTime
        ]);
        
        // 서버에서 최신 메시지 로드 후 기존 메시지와 병합
        const serverMessages = result.data || [];
        const existingMessages = this.messages[roomId] || [];
        
        // 기존 메시지와 서버 메시지를 병합 (중복 제거)
        const messageMap = new Map();
        
        // 기존 메시지 먼저 추가
        existingMessages.forEach(msg => {
          messageMap.set(msg.id, msg);
        });
        
        // 서버 메시지 추가 (기존 메시지 덮어쓰기)
        serverMessages.forEach(msg => {
          messageMap.set(msg.id, msg);
        });
        
        // Map을 배열로 변환하여 저장
        this.messages[roomId] = Array.from(messageMap.values());
        
        this.sortMessages(roomId);

        this.pagination[roomId] = {
          hasNext: result.hasNext,
          nextCursor: result.nextCursor,
          isLoading: false
        };

        // ✅ 추가: 메시지 로드 시 unread count 캐시 무효화
        this.invalidateUnreadCountCache(roomId);

        await this.connectWebSocket(roomId);
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
          
          this.sortMessages(roomId);

          this.pagination[roomId] = {
            hasNext: result.hasNext,
            nextCursor: result.nextCursor,
            isLoading: false
          };

          // ✅ 추가: 메시지 추가 시 unread count 캐시 무효화
          this.invalidateUnreadCountCache(roomId);
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

    // 채팅방 참여자 목록 업데이트 (lastMessageId 포함)
    updateChatParticipants(roomId, participants) {
      // Redis에서 온 데이터인지 확인 (실시간 동기화)
      if (this._isRedisUpdate) {
        this.updateChatParticipantsFromRedis(roomId, participants);
        this._isRedisUpdate = false; // 플래그 리셋
      } else {
        // 일반 API 응답인 경우
        this.participants[roomId] = participants;
        this.invalidateUnreadCountCache(roomId);
        
        if (roomId === this.currentRoomId) {
          this.$patch({});
        }
      }
    },

    // Redis 업데이트 플래그 설정
    _isRedisUpdate: false,

    // 채팅방 참여자 목록 로드
    async loadChatRoomParticipants(roomId) {
      try {
        const participants = await getChatRoomParticipants(roomId);
        this.participants[roomId] = participants;
        
        // unread count 캐시 무효화
        this.invalidateUnreadCountCache(roomId);
        
        // 참여자 정보 로드 후 unread count 재계산
        const unreadCount = this.calculateUnreadCount(roomId);
        
        // UI 갱신을 위해 강제 리렌더링
        this.$patch({});
      } catch (error) {
        console.error(`❌ 채팅방 ${roomId} 참여자 목록 로드 실패:`, error);
      }
    },

  },
});
