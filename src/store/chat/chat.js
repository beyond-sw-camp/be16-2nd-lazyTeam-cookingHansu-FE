import { defineStore } from 'pinia';
import { getChatRooms, getMessages, sendMessage } from '../../services/chat/chatService';

export const useChatStore = defineStore('chat', {
  state: () => ({
    rooms: [],
    messages: [],
    currentRoomId: null,
    loading: false,
  }),
  actions: {
    async fetchRooms() {
      this.loading = true;
      this.rooms = await getChatRooms();
      this.loading = false;
    },
    async fetchMessages(roomId) {
      this.loading = true;
      this.currentRoomId = roomId;
      this.messages = await getMessages(roomId);
      this.loading = false;
      // 기존 WebSocket 연결 해제 후 새로 연결

      // disconnectWebSocket();
      // connectWebSocket(roomId, (msg) => {
      //   this.messages.push(msg);
      //   // 마지막 메시지, 시간, 안읽은 메시지 갱신
      //   const room = this.rooms.find(r => r.id === roomId);
      //   if (room) {
      //     room.lastMessage = msg.content;
      //     room.lastMessageTime = msg.timestamp;
      //     if (msg.senderId !== this.myId) room.unreadCount += 1;
      //   }
      // });
      // 진입 시 unreadCount 0 처리
      const room = this.rooms.find(r => r.id === roomId);
      if (room) room.unreadCount = 0;
    },
    async sendMessage(content, senderId, file = null, fileName = '', fileType = '') {
      if (!this.currentRoomId || this.loading) return;
      this.loading = true;
      const msg = await sendMessage(this.currentRoomId, senderId, content, file, fileName, fileType);
      this.messages.push(msg);
      // WebSocket으로도 전송
      // sendWebSocketMessage(this.currentRoomId, msg);
      // 마지막 메시지, 시간 갱신
      const room = this.rooms.find(r => r.id === this.currentRoomId);
      if (room) {
        room.lastMessage = msg.content || msg.fileName;

        room.lastMessageTime = msg.timestamp;
        room.unreadCount = 0;
      }
      this.loading = false;
    },
    disconnectChat() {
      disconnectWebSocket();
    },
  },
}); 