import { defineStore } from 'pinia';
import { 
  getMyChatRooms, 
  getChatHistory, 
  sendMessage, 
  markMessageAsRead,
  createChatRoom,
  updateChatRoomName,
  leaveChatRoom
} from '../../services/chat/chatService';

export const useChatStore = defineStore('chat', {
  state: () => ({
    rooms: [],
    messages: [],
    currentRoomId: null,
    loading: false,
    // error: null, // 에러 상태 제거
  }),
  
  getters: {
    // 현재 선택된 채팅방 정보
    currentRoom: (state) => {
      return state.rooms.find(room => room.chatRoomId === state.currentRoomId);
    },
    
    // 읽지 않은 메시지 총 개수
    totalUnreadCount: (state) => {
      return state.rooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
    },
  },
  
  actions: {
    // 내 채팅방 목록 조회
    async fetchMyChatRooms() {
      this.loading = true;
      // this.error = null; // 에러 상태 제거
      
      try {
        const rooms = await getMyChatRooms();
        this.rooms = rooms;
      } catch (error) {
        console.error('채팅방 목록 조회 실패:', error);
        // this.error = error.message; // 에러 상태 제거
      } finally {
        this.loading = false;
      }
    },
    
    // 채팅방 메시지 조회
    async fetchChatHistory(roomId) {
      this.loading = true;
      // this.error = null; // 에러 상태 제거
      this.currentRoomId = roomId;
      
      try {
        const messages = await getChatHistory(roomId);
        this.messages = messages;
        
        // 메시지 읽음 처리
        await this.markAsRead(roomId);
      } catch (error) {
        console.error('메시지 조회 실패:', error);
        // this.error = error.message; // 에러 상태 제거
      } finally {
        this.loading = false;
      }
    },
    
    // 메시지 읽음 처리
    async markAsRead(roomId) {
      try {
        await markMessageAsRead(roomId);
        
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
    async sendMessage(content, file = null) {
      if (!this.currentRoomId || this.loading) return;
      
      this.loading = true;
      // this.error = null; // 에러 상태 제거
      
      try {
        const message = await sendMessage(this.currentRoomId, content, file);
        this.messages.push(message);
        
        // 채팅방의 마지막 메시지 정보 업데이트
        const room = this.rooms.find(r => r.chatRoomId === this.currentRoomId);
        if (room) {
          room.lastMessage = content;
          room.lastMessageTime = message.createdAt || new Date().toISOString();
          room.unreadCount = 0;
        }
      } catch (error) {
        console.error('메시지 전송 실패:', error);
        // this.error = error.message; // 에러 상태 제거
      } finally {
        this.loading = false;
      }
    },
    
    // 채팅방 생성
    async createRoom(otherUserId) {
      this.loading = true;
      // this.error = null; // 에러 상태 제거
      
      try {
        const roomId = await createChatRoom(otherUserId);
        
        // 새 채팅방 정보를 목록에 추가 (실제로는 서버에서 전체 목록을 다시 가져와야 함)
        await this.fetchMyChatRooms();
        
        return roomId;
      } catch (error) {
        console.error('채팅방 생성 실패:', error);
        // this.error = error.message; // 에러 상태 제거
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 채팅방 이름 수정
    async updateRoomName(roomId, roomName) {
      this.loading = true;
      // this.error = null; // 에러 상태 제거
      
      try {
        await updateChatRoomName(roomId, roomName);
        
        // 로컬 상태 업데이트
        const room = this.rooms.find(r => r.chatRoomId === roomId);
        if (room) {
          room.chatRoomName = roomName;
        }
      } catch (error) {
        console.error('채팅방 이름 수정 실패:', error);
        // this.error = error.message; // 에러 상태 제거
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 채팅방 나가기
    async leaveRoom(roomId) {
      this.loading = true;
      // this.error = null; // 에러 상태 제거
      
      try {
        await leaveChatRoom(roomId);
        
        // 로컬 상태에서 채팅방 제거
        this.rooms = this.rooms.filter(r => r.chatRoomId !== roomId);
        
        // 현재 채팅방이 나간 채팅방이면 선택 해제
        if (this.currentRoomId === roomId) {
          this.currentRoomId = null;
          this.messages = [];
        }
      } catch (error) {
        console.error('채팅방 나가기 실패:', error);
        // this.error = error.message; // 에러 상태 제거
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 새 메시지 수신 (WebSocket 등에서 호출)
    receiveMessage(message) {
      // 현재 채팅방의 메시지라면 messages에 추가
      if (message.roomId === this.currentRoomId) {
        this.messages.push(message);
      }
      
      // 해당 채팅방의 정보 업데이트
      const room = this.rooms.find(r => r.chatRoomId === message.roomId);
      if (room) {
        room.lastMessage = message.content;
        room.lastMessageTime = message.createdAt || new Date().toISOString();
        
        // 현재 채팅방이 아니면 읽지 않은 메시지 수 증가
        if (message.roomId !== this.currentRoomId) {
          room.unreadCount = (room.unreadCount || 0) + 1;
        }
      }
    },
    
    // 채팅방 선택
    selectRoom(roomId) {
      this.currentRoomId = roomId;
      this.fetchChatHistory(roomId);
    },
    
    // 에러 초기화
    clearError() {
      // this.error = null; // 에러 상태 제거
    },
    
    // 채팅 연결 해제
    disconnectChat() {
      this.currentRoomId = null;
      this.messages = [];
      // WebSocket 연결 해제 로직 추가 예정
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