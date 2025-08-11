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

export const useChatStore = defineStore('chat', {
  state: () => ({
    rooms: [],
    messages: {}, // roomId를 키로 하는 메시지 캐시
    currentRoomId: null,
    loading: false,
    stompClient: null,
    error: null,
    onlineUsers: {}, // roomId -> 온라인 사용자 목록
  }),
  
  getters: {
    // 현재 선택된 채팅방 정보
    currentRoom: (state) => {
      return state.rooms.find(room => room.roomId === state.currentRoomId);
    },
    
    // 읽지 않은 메시지 총 개수
    totalUnreadCount: (state) => {
      return state.rooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
    },
    
    // 특정 방의 읽지 않은 메시지 수 계산 (Redis 온라인 상태 기반)
    getUnreadCount: (state) => (roomId) => {
      const room = state.rooms.find(r => r.roomId === roomId);
      if (!room) return 0;
      
      const onlineUserIds = state.onlineUsers[roomId] || [];
      
      // 상대방이 온라인이면 읽음, 오프라인이면 읽지 않음
      if (onlineUserIds.length > 0) {
        // 상대방이 온라인이면 읽음 처리
        return 0;
      } else {
        // 상대방이 오프라인이면 원래 unreadCount 반환
        return room.unreadCount || 0;
      }
    },
    
    // 에러 상태 getter
    getError: (state) => state.error,
    
    // 데이터 존재 여부
    hasRooms: (state) => state.rooms.length > 0,
    
    // 상대방 사용자 ID 가져오기 (백엔드에서 제공하지 않으므로 null 반환)
    getOtherUserId: (state) => (roomId) => {
      return null; // 백엔드에서 otherUserId를 제공하지 않음
    },
  },
  
  actions: {
    // WebSocket 연결
    connectWebSocket(roomId) {
      console.log('WebSocket 연결 시도:', { roomId, currentRoomId: this.currentRoomId });
      
      // 기존 연결이 있으면 해제
      this.disconnectWebSocket();
      
      if (!roomId) {
        console.error('roomId가 없습니다:', roomId);
        return;
      }
      
      // const token = localStorage.getItem("token"); // 테스트용: 토큰 없이 연결
      // if (!token) {
      //   console.error('토큰이 없습니다.');
      //   return;
      // }

      try {
        console.log('SockJS 연결 시도:', `${API_BASE_URL}/connect`);
        const sockJs = new SockJs(`${API_BASE_URL}/connect`);
        this.stompClient = Stomp.over(sockJs);

        this.stompClient.connect(
          {
            // 테스트용: 헤더 없이 연결
          },
          () => {
            console.log('WebSocket 연결 성공');
            
            // 채팅방 메시지 구독
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
            
            // ✅ 연결 성공 후 온라인 상태 알림
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

          // 오프라인 상태 전송
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
    
    updateOnlineUsers(roomId, onlineUserIds) {
      console.log('온라인 사용자 업데이트:', { roomId, onlineUserIds });
      
      this.onlineUsers[roomId] = onlineUserIds;
      
      // 상대방이 온라인 상태가 되면 읽음 처리
      this.updateMessageReadStatus(roomId);
      
      // 현재 보고 있는 채팅방이면 즉시 UI 반영
      if (roomId === this.currentRoomId) {
        // Vue의 반응성을 위해 강제 업데이트 트리거
        this.$patch({});
      }
    },
    
    // 메시지 읽음 상태 업데이트 (상대방 온라인 상태에 따라)
    // 3. 읽음 상태 업데이트 로직 개선
    updateMessageReadStatus(roomId) {
      const roomIndex = this.rooms.findIndex(r => r.roomId === roomId);
      if (roomIndex !== -1) {
        const onlineUserIds = this.onlineUsers[roomId] || [];
        
        // ✅ 상대방이 온라인이고, 나 말고 다른 사람이 온라인이면 읽음 처리
        const otherUserOnline = onlineUserIds.some(userId => 
          userId !== '550e8400-e29b-41d4-a716-446655440001'
        );
        
        if (otherUserOnline) {
          this.rooms[roomIndex].unreadCount = 0;
          console.log(`채팅방 ${roomId} 읽음 처리됨 (상대방 온라인)`);
        }
      }
    },
    
    // 채팅방 읽음 처리 (UI적으로)
    markRoomAsRead(roomId) {
      const roomIndex = this.rooms.findIndex(room => room.roomId === roomId);
      if (roomIndex !== -1) {
        this.rooms[roomIndex].unreadCount = 0;
      }
    },

    // 메시지 전송 (WebSocket 사용)
    async sendMessageViaWebSocket(content, uploadedFiles = null) {
      if (!this.currentRoomId || !this.stompClient || !this.stompClient.connected) {
        console.error('WebSocket이 연결되지 않았습니다.');
        return;
      }

      // 백엔드 ChatMessageReqDto 형식에 맞춤
      const message = {
        roomId: this.currentRoomId,
        senderId: '550e8400-e29b-41d4-a716-446655440001',
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

    // 파일로부터 파일 타입 추정 (백엔드 FileType enum에 맞춤)
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
      
      if (imageExtensions.includes(extension)) {
        return 'IMAGE';
      } else if (videoExtensions.includes(extension)) {
        return 'VIDEO';
      } else {
        console.error('지원하지 않는 파일 형식입니다:', extension);
        return 'UNKNOWN';
      }
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
        // 최소 로딩 시간 보장을 위한 Promise 생성
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 400));
        
        // 메시지 조회와 최소 로딩 시간을 병렬로 처리
        const [messages] = await Promise.all([
          getChatHistory(roomId),
          minLoadingTime
        ]);
        
        // 빈 배열이어도 캐시에 저장하여 재호출 방지
        this.messages[roomId] = messages || [];
        
        // WebSocket 연결
        try {
          this.connectWebSocket(roomId);
        } catch (error) {
          console.log('WebSocket 연결 실패, HTTP API 모드로 전환:', error);
        }
      } catch (error) {
        console.error('메시지 조회 실패:', error);
        this.error = error.message;
        // 에러 시에도 빈 배열로 초기화하여 재호출 방지
        if (!this.messages[roomId]) {
          this.messages[roomId] = [];
        }
      } finally {
        this.loading = false;
      }
    },
    
    // 온라인 상태 전송
    sendOnlineStatus(roomId, isOnline) {
      if (!this.stompClient || !this.stompClient.connected) {
        return;
      }

      try {
        const userId = '550e8400-e29b-41d4-a716-446655440001';
        
        const statusRequest = {
          userId: userId
        };

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
        
        // 파일이 있는 경우 먼저 업로드
        let uploadedFiles = null;
        if (files && files.length > 0) {
          const fileTypes = files.map(file => this.getFileTypeFromFile(file));
          uploadedFiles = await uploadFiles(this.currentRoomId, files, fileTypes);
        }
        
        // WebSocket을 통해 메시지 전송
        if (this.stompClient && this.stompClient.connected) {
          await this.sendMessageViaWebSocket(content, uploadedFiles);
        } else {
          // WebSocket이 연결되지 않은 경우 HTTP API 사용
          const message = await sendMessage(this.currentRoomId, content, uploadedFiles);
          if (!this.messages[this.currentRoomId]) {
            this.messages[this.currentRoomId] = [];
          }
          this.messages[this.currentRoomId].push(message);
        }
        
        // 채팅방의 마지막 메시지 정보 업데이트 및 정렬
        const roomIndex = this.rooms.findIndex(r => r.roomId === this.currentRoomId);
        if (roomIndex !== -1) {
          const room = this.rooms[roomIndex];
          room.lastMessageTime = now;
          room.unreadCount = 0;
          
          // 해당 채팅방을 맨 위로 이동 (최신 메시지 순 정렬)
          if (roomIndex > 0) {
            this.rooms.splice(roomIndex, 1);
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
        
        // 새 채팅방 정보를 목록에 추가
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
        
        // 로컬 상태 업데이트
        const roomIndex = this.rooms.findIndex(r => r.roomId === roomId);
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
        
        // WebSocket 연결 해제
        if (this.currentRoomId === roomId) {
          this.disconnectWebSocket();
        }
        
        // 로컬 상태에서 채팅방 제거
        this.rooms = this.rooms.filter(r => r.roomId !== roomId);
        
        // 현재 채팅방이 나간 채팅방이면 선택 해제
        if (this.currentRoomId === roomId) {
          this.currentRoomId = null;
          delete this.messages[roomId];
        }
      } catch (error) {
        console.error('채팅방 나가기 실패:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 새 메시지 수신 (WebSocket 등에서 호출)
    receiveMessage(message) {
      console.log('받은 메시지:', message);
      
      // 백엔드에서 받은 메시지를 ChatMessageResponse 객체로 변환
      const chatMessageResponse = ChatMessageResponse.fromJson(message);
      
      // 해당 채팅방의 메시지에 추가
      if (!this.messages[chatMessageResponse.roomId]) {
        this.messages[chatMessageResponse.roomId] = [];
      }
      this.messages[chatMessageResponse.roomId].push(chatMessageResponse);
      
      // 해당 채팅방의 정보 업데이트 및 정렬
      const roomIndex = this.rooms.findIndex(r => r.roomId === chatMessageResponse.roomId);
      if (roomIndex !== -1) {
        const room = this.rooms[roomIndex];
        
        // 마지막 메시지 내용 결정
        let lastMessageText = chatMessageResponse.message;
        if (!chatMessageResponse.message.trim() && chatMessageResponse.files && chatMessageResponse.files.length > 0) {
          const imageCount = chatMessageResponse.files.filter(file => file.isImage()).length;
          const videoCount = chatMessageResponse.files.filter(file => file.isVideo()).length;
          
          if (imageCount > 0 && videoCount > 0) {
            lastMessageText = `사진 ${imageCount}장, 동영상 ${videoCount}개를 보냈습니다.`;
          } else if (imageCount > 0) {
            lastMessageText = `사진 ${imageCount}장을 보냈습니다.`;
          } else if (videoCount > 0) {
            lastMessageText = `동영상 ${videoCount}개를 보냈습니다.`;
          } else {
            lastMessageText = `파일 ${chatMessageResponse.files.length}개를 보냈습니다.`;
          }
        }
        
        room.lastMessage = lastMessageText;
        room.lastMessageTime = chatMessageResponse.createdAt;
        
        // 현재 채팅방이 아니면 읽지 않은 메시지 수 증가
        if (chatMessageResponse.roomId !== this.currentRoomId) {
          room.unreadCount = (room.unreadCount || 0) + 1;
        }
        
        // 해당 채팅방을 맨 위로 이동 (최신 메시지 순 정렬)
        if (roomIndex > 0) {
          this.rooms.splice(roomIndex, 1);
          this.rooms.unshift(room);
        }
      }
    },
    
    // 채팅방 선택
    selectRoom(roomId) {
      if (!roomId) return;
      
      // 이전 채팅방의 WebSocket 연결 해제
      if (this.currentRoomId && this.currentRoomId !== roomId) {
        this.disconnectWebSocket();
      }
      
      this.currentRoomId = roomId;
      
      // 채팅방 입장 시 읽음 처리 (UI적으로)
      this.markRoomAsRead(roomId);
      
      // 메시지 캐시가 있는지 확인
      if (this.messages[roomId] !== undefined) {
        // 캐시된 메시지가 있어도 잠깐 로딩 상태를 true로 설정하여 스켈레톤 표시
        this.loading = true;
        
        // 짧은 딜레이 후 로딩 완료 처리
        setTimeout(() => {
          this.loading = false;
        }, 150);
        
        // WebSocket 연결
        try {
          this.connectWebSocket(roomId);
        } catch (error) {
          console.log('WebSocket 연결 실패, HTTP API 모드로 전환:', error);
        }
        return;
      }
      
      // 메시지가 처음 로드되는 경우에만 API 호출
      this.fetchChatHistory(roomId);
    },
    
    // 에러 초기화
    clearError() {
      this.error = null;
    },
    
    // 채팅 연결 해제
    disconnectChat() {
      this.disconnectWebSocket();
      this.currentRoomId = null;
      this.messages = {};
    },
    
    // 기존 호환성 함수들
    async fetchRooms() {
      return this.fetchMyChatRooms();
    },
    
    async fetchMessages(roomId) {
      return this.fetchChatHistory(roomId);
    },

    // 테스트용: 간단한 메시지 추가
    addTestMessage(roomId, content, isFromMe = true) {
      if (!this.messages[roomId]) {
        this.messages[roomId] = [];
      }

      const testMessage = {
        id: `test-${Date.now()}`,
        roomId: roomId,
        senderId: isFromMe ? '550e8400-e29b-41d4-a716-446655440001' : 'other-user-id',
        message: content,
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.messages[roomId].push(testMessage);
      
      // 채팅방 정보 업데이트
      const roomIndex = this.rooms.findIndex(r => r.roomId === roomId);
      if (roomIndex !== -1) {
        this.rooms[roomIndex].lastMessage = content;
        this.rooms[roomIndex].lastMessageTime = testMessage.createdAt;
        if (!isFromMe) {
          this.rooms[roomIndex].unreadCount = (this.rooms[roomIndex].unreadCount || 0) + 1;
        }
      }
    },
  },
}); 