import { defineStore } from 'pinia';
import Stomp from "webstomp-client";
import SockJs from "sockjs-client";
import { 
  getMyChatRooms, 
  getChatHistory, 
  sendMessage, 
  uploadFiles,
  markMessageAsRead,
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
    error: null, // 에러 상태 추가
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
    
    // 에러 상태 getter
    getError: (state) => state.error,
    
    // 데이터 존재 여부
    hasRooms: (state) => state.rooms.length > 0,
  },
  
  actions: {
    // WebSocket 연결
    connectWebSocket(roomId) {
      // 기존 연결이 있으면 해제
      this.disconnectWebSocket();
      
      if (!roomId) return;
      
      // const token = localStorage.getItem("token"); // 테스트용: 토큰 없이 연결
      // if (!token) {
      //   console.error('토큰이 없습니다.');
      //   return;
      // }

      try {
        const sockJs = new SockJs(`${API_BASE_URL}/connect`);
        this.stompClient = Stomp.over(sockJs);

        this.stompClient.connect(
          {
            // Authorization: `Bearer ${token}`, // 테스트용: 토큰 없이 연결
          },
          () => {
            console.log('WebSocket 연결 성공');
            
            // 채팅방 구독
            this.stompClient.subscribe(
              `/topic/${roomId}`,
              (message) => {
                try {
                  const parsedMessage = JSON.parse(message.body);
                  this.receiveMessage(parsedMessage);
                } catch (error) {
                  console.error('메시지 파싱 실패:', error);
                }
              },
              {
                // Authorization: `Bearer ${token}`, // 테스트용: 토큰 없이 구독
              }
            );
          },
          (error) => {
            console.error('WebSocket 연결 실패:', error);
            // 연결 실패 시 HTTP API 사용
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

    // 메시지 전송 (WebSocket 사용)
    async sendMessageViaWebSocket(content, uploadedFiles = null) {
      if (!this.currentRoomId || !this.stompClient || !this.stompClient.connected) {
        console.error('WebSocket이 연결되지 않았습니다.');
        return;
      }

      // 백엔드 ChatMessageReqDto 형식에 맞춤
      const message = {
        roomId: this.currentRoomId,
        senderId: '550e8400-e29b-41d4-a716-446655440001', // 테스트용 고정 ID
        message: content,
        files: uploadedFiles ? uploadedFiles.files : null // 업로드된 파일 정보들
      };

      try {
        this.stompClient.send(
          `/publish/${this.currentRoomId}`,
          JSON.stringify(message)
          // , { Authorization: `Bearer ${token}` } // 테스트용: 토큰 없이 전송
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
        
        // 메시지 읽음 처리
        await this.markAsRead(roomId);
        
        // WebSocket 연결
        this.connectWebSocket(roomId);
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
    async sendMessage(content, files = null) {
      if (!this.currentRoomId) return;
      
      // 메시지 전송 중에는 전체 loading이 아닌 개별 loading 상태를 사용
      const isSending = true;
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
          // WebSocket 연결이 있으면 백엔드에서 받은 메시지를 사용하므로 로컬 추가하지 않음
        } else {
          // WebSocket이 연결되지 않은 경우 HTTP API 사용
          const message = await sendMessage(this.currentRoomId, content, uploadedFiles);
          if (!this.messages[this.currentRoomId]) {
            this.messages[this.currentRoomId] = [];
          }
          this.messages[this.currentRoomId].push(message);
        }
        
        // 채팅방의 마지막 메시지 정보 업데이트 및 정렬
        const roomIndex = this.rooms.findIndex(r => r.chatRoomId === this.currentRoomId);
        if (roomIndex !== -1) {
          const room = this.rooms[roomIndex];
          room.lastMessage = content;
          room.lastMessageTime = now;
          room.unreadCount = 0;
          
          // 해당 채팅방을 맨 위로 이동 (최신 메시지 순 정렬)
          if (roomIndex > 0) {
            this.rooms.splice(roomIndex, 1); // 기존 위치에서 제거
            this.rooms.unshift(room); // 맨 앞에 추가
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
        
        // 로컬 상태 업데이트 (반응성을 위해 새 배열 생성)
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
        console.error('채팅방 이름 수정 실패:', error);
        // this.error = error.message; // 에러 상태 제거
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 채팅방 나가기
    async leaveRoom(roomId) {
      if (!roomId) return;
      
      this.loading = true;
      // this.error = null; // 에러 상태 제거
      
      try {
        await leaveChatRoom(roomId);
        
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
        console.error('채팅방 나가기 실패:', error);
        // this.error = error.message; // 에러 상태 제거
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 새 메시지 수신 (WebSocket 등에서 호출)
    receiveMessage(message) {
      console.log('받은 메시지:', message); // 디버깅용
      console.log('받은 메시지 createdAt:', message.createdAt); // 시간 확인
      
      // 백엔드에서 받은 메시지를 ChatMessageResponse 객체로 변환
      const chatMessageResponse = ChatMessageResponse.fromJson(message);
      console.log('변환된 메시지:', chatMessageResponse);
      console.log('변환된 메시지 createdAt:', chatMessageResponse.createdAt);
      
      // 해당 채팅방의 메시지에 추가
      if (!this.messages[chatMessageResponse.roomId]) {
        this.messages[chatMessageResponse.roomId] = [];
      }
      this.messages[chatMessageResponse.roomId].push(chatMessageResponse);
      
      // 현재 채팅방의 메시지라면 즉시 반영
      if (chatMessageResponse.roomId === this.currentRoomId) {
        // 이미 추가했으므로 별도 처리 불필요
      }
      
      // 해당 채팅방의 정보 업데이트 및 정렬
      const roomIndex = this.rooms.findIndex(r => r.chatRoomId === chatMessageResponse.roomId);
      if (roomIndex !== -1) {
        const room = this.rooms[roomIndex];
        room.lastMessage = chatMessageResponse.message;
        room.lastMessageTime = chatMessageResponse.createdAt;
        
        // 현재 채팅방이 아니면 읽지 않은 메시지 수 증가
        if (chatMessageResponse.roomId !== this.currentRoomId) {
          room.unreadCount = (room.unreadCount || 0) + 1;
        }
        
        // 해당 채팅방을 맨 위로 이동 (최신 메시지 순 정렬)
        if (roomIndex > 0) {
          this.rooms.splice(roomIndex, 1); // 기존 위치에서 제거
          this.rooms.unshift(room); // 맨 앞에 추가
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
      
      // 메시지 캐시가 있는지 확인 (undefined나 빈 배열이어도 한번 로드했다면 재로드하지 않음)
      if (this.messages[roomId] !== undefined) {
        // 캐시된 메시지가 있어도 잠깐 로딩 상태를 true로 설정하여 스켈레톤 표시
        this.loading = true;
        
        // 짧은 딜레이 후 로딩 완료 처리
        setTimeout(() => {
          this.loading = false;
        }, 150);
        
        // 메시지 읽음 처리
        this.markAsRead(roomId);
        // WebSocket 연결
        this.connectWebSocket(roomId);
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
  },
}); 