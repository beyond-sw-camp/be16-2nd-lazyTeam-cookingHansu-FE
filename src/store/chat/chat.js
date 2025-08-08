import { defineStore } from 'pinia';
import Stomp from "webstomp-client";
import SockJs from "sockjs-client";
import { chatService } from '../../services/chat/chatService';
import { ChatMessageResponse } from '../../models/chat/ChatResponse';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useChatStore = defineStore('chat', {
  state: () => ({
    // 채팅 데이터
    rooms: [],
    messages: {}, // roomId를 키로 하는 메시지 캐시
    currentRoomId: null,
    
    // WebSocket 관련
    stompClient: null,
    
    // UI 상태
    loading: false,
    error: null,
  }),
  
  getters: {
    // 채팅방 관련
    getRooms: (state) => state.rooms,
    getCurrentRoom: (state) => state.rooms.find(room => room.chatRoomId === state.currentRoomId),
    getCurrentRoomId: (state) => state.currentRoomId,
    
    // 메시지 관련
    getMessages: (state) => (roomId) => state.messages[roomId] || [],
    getCurrentMessages: (state) => state.messages[state.currentRoomId] || [],
    
    // 읽지 않은 메시지
    getTotalUnreadCount: (state) => {
      return state.rooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
    },
    
    // UI 상태
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    // 유틸리티
    hasRooms: (state) => state.rooms.length > 0,
    hasCurrentRoom: (state) => !!state.currentRoomId,
    isWebSocketConnected: (state) => state.stompClient && state.stompClient.connected,
  },
  
  actions: {
    // 에러 처리 헬퍼
    _handleError(error, defaultMessage) {
      console.error(defaultMessage, error);
      this.error = error.message || defaultMessage;
      throw error;
    },

    // 로딩 상태 관리
    _setLoading(loading) {
      this.loading = loading;
    },

    // 에러 초기화
    clearError() {
      this.error = null;
    },

    // WebSocket 연결
    connectWebSocket(roomId) {
      this.disconnectWebSocket();
      
      if (!roomId) return;
      
      try {
        const sockJs = new SockJs(`${API_BASE_URL}/connect`);
        this.stompClient = Stomp.over(sockJs);

        this.stompClient.connect(
          {},
          () => {
            console.log('WebSocket 연결 성공');
            
            this.stompClient.subscribe(
              `/topic/${roomId}`,
              (message) => {
                try {
                  const parsedMessage = JSON.parse(message.body);
                  this.receiveMessage(parsedMessage);
                } catch (error) {
                  console.error('메시지 파싱 실패:', error);
                }
              }
            );
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
            this.stompClient.unsubscribe(`/topic/${this.currentRoomId}`);
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

    // 메시지 전송 (WebSocket)
    async sendMessageViaWebSocket(content, uploadedFiles = null) {
      if (!this.currentRoomId || !this.stompClient || !this.stompClient.connected) {
        throw new Error('WebSocket이 연결되지 않았습니다.');
      }

      const message = {
        roomId: this.currentRoomId,
        senderId: '00000000-0000-0000-0000-000000000000', // 테스트용 고정 ID
        message: content,
        files: uploadedFiles ? uploadedFiles.files : null
      };

      try {
        this.stompClient.send(
          `/publish/${this.currentRoomId}`,
          JSON.stringify(message)
        );
      } catch (error) {
        console.error('WebSocket 메시지 전송 실패:', error);
        throw error;
      }
    },

    // 내 채팅방 목록 조회
    async fetchMyChatRooms() {
      this._setLoading(true);
      this.error = null;
      
      try {
        const rooms = await chatService.getMyChatRooms();
        this.rooms = rooms;
      } catch (error) {
        this._handleError(error, '채팅방 목록을 불러오는데 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },
    
    // 채팅방 메시지 조회
    async fetchChatHistory(roomId) {
      this._setLoading(true);
      this.currentRoomId = roomId;
      
      try {
        const messages = await chatService.getChatHistory(roomId);
        this.messages[roomId] = messages;
        
        // 메시지 읽음 처리
        await this.markAsRead(roomId);
        
        // WebSocket 연결
        this.connectWebSocket(roomId);
      } catch (error) {
        this._handleError(error, '메시지를 불러오는데 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },
    
    // 메시지 읽음 처리
    async markAsRead(roomId) {
      try {
        await chatService.markMessageAsRead(roomId);
        
        // 로컬 상태에서 읽지 않은 메시지 수 초기화
        const room = this.rooms.find(r => r.chatRoomId === roomId);
        if (room) {
          room.unreadCount = 0;
        }
      } catch (error) {
        console.error('메시지 읽음 처리 실패:', error);
      }
    },
    
    // 메시지 전송
    async sendMessage(content, files = null) {
      if (!this.currentRoomId || this.loading) {
        throw new Error('채팅방이 선택되지 않았거나 로딩 중입니다.');
      }
      
      this._setLoading(true);
      
      try {
        const now = new Date().toISOString();
        
        // 파일이 있는 경우 먼저 업로드
        let uploadedFiles = null;
        if (files && files.length > 0) {
          const fileTypes = files.map(file => chatService.getFileTypeFromFile(file));
          uploadedFiles = await chatService.uploadFiles(this.currentRoomId, files, fileTypes);
        }
        
        // WebSocket을 통해 메시지 전송
        if (this.stompClient && this.stompClient.connected) {
          await this.sendMessageViaWebSocket(content, uploadedFiles);
        } else {
          // WebSocket이 연결되지 않은 경우 HTTP API 사용
          const message = await chatService.sendMessage(this.currentRoomId, content, uploadedFiles);
          if (!this.messages[this.currentRoomId]) {
            this.messages[this.currentRoomId] = [];
          }
          this.messages[this.currentRoomId].push(message);
        }
        
        // 채팅방의 마지막 메시지 정보 업데이트
        const room = this.rooms.find(r => r.chatRoomId === this.currentRoomId);
        if (room) {
          room.lastMessage = content;
          room.lastMessageTime = now;
          room.unreadCount = 0;
        }
      } catch (error) {
        this._handleError(error, '메시지 전송에 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },
    
    // 채팅방 생성
    async createRoom(otherUserId) {
      this._setLoading(true);
      
      try {
        const roomId = await chatService.createChatRoom(otherUserId);
        
        // 새 채팅방 정보를 목록에 추가
        await this.fetchMyChatRooms();
        
        return roomId;
      } catch (error) {
        this._handleError(error, '채팅방 생성에 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },
    
    // 채팅방 이름 수정
    async updateRoomName(roomId, roomName) {
      this._setLoading(true);
      
      try {
        await chatService.updateChatRoomName(roomId, roomName);
        
        // 로컬 상태 업데이트
        const roomIndex = this.rooms.findIndex(r => r.chatRoomId === roomId);
        if (roomIndex !== -1) {
          const updatedRooms = [...this.rooms];
          updatedRooms[roomIndex] = {
            ...updatedRooms[roomIndex],
            customRoomName: roomName
          };
          this.rooms = updatedRooms;
        }
      } catch (error) {
        this._handleError(error, '채팅방 이름 수정에 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },
    
    // 채팅방 나가기
    async leaveRoom(roomId) {
      if (!roomId) return;
      
      this._setLoading(true);
      
      try {
        await chatService.leaveChatRoom(roomId);
        
        // WebSocket 연결 해제
        if (this.currentRoomId === roomId) {
          this.disconnectWebSocket();
        }
        
        // 로컬 상태에서 채팅방 제거
        this.rooms = this.rooms.filter(r => r.chatRoomId !== roomId);
        
        // 현재 채팅방이 나간 채팅방이면 선택 해제
        if (this.currentRoomId === roomId) {
          this.currentRoomId = null;
          delete this.messages[roomId];
        }
      } catch (error) {
        this._handleError(error, '채팅방 나가기에 실패했습니다.');
      } finally {
        this._setLoading(false);
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
      
      // 해당 채팅방의 정보 업데이트
      const room = this.rooms.find(r => r.chatRoomId === chatMessageResponse.roomId);
      if (room) {
        room.lastMessage = chatMessageResponse.message;
        room.lastMessageTime = chatMessageResponse.createdAt;
        
        // 현재 채팅방이 아니면 읽지 않은 메시지 수 증가
        if (chatMessageResponse.roomId !== this.currentRoomId) {
          room.unreadCount = (room.unreadCount || 0) + 1;
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
      
      // 이미 메시지가 캐시되어 있으면 API 호출하지 않음
      if (this.messages[roomId] && this.messages[roomId].length > 0) {
        // 메시지 읽음 처리만 수행
        this.markAsRead(roomId);
        // WebSocket 연결
        this.connectWebSocket(roomId);
        return;
      }
      
      // 메시지가 없으면 API 호출
      this.fetchChatHistory(roomId);
    },
    
    // 채팅 연결 해제
    disconnectChat() {
      this.disconnectWebSocket();
      this.currentRoomId = null;
      this.messages = {};
    },

    // 전체 상태 초기화
    reset() {
      this.rooms = [];
      this.messages = {};
      this.currentRoomId = null;
      this.stompClient = null;
      this.loading = false;
      this.error = null;
    },
    
    // 기존 호환성 함수들
    async fetchRooms() {
      return this.fetchMyChatRooms();
    },
    
    async fetchMessages(roomId) {
      return this.fetchChatHistory(roomId);
    },
  },
}); 