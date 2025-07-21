// 더미 데이터 기반 채팅 서비스

import ChatRoom from '../../models/ChatRoom';
import ChatMessage from '../../models/ChatMessage';


const dummyRooms = [
  new ChatRoom({
    id: 'room1',
    participants: ['user1', 'user2'],
    lastMessage: '안녕하세요!',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    avatar: '',
  }),
  new ChatRoom({
    id: 'room2',
    participants: ['user1', 'user3'],
    lastMessage: '안녕하세요! 여쭤볼게있는데 채팅 가능할까요? 안녕하세요! 여쭤볼게있는데 채팅 가능할까요? 안녕하세요! 여쭤볼게있는데 채팅 가능할까요? ',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 3,
    avatar: '',
  }),
];

const dummyMessages = {
  room1: [
    new ChatMessage({
      id: 'msg1',
      roomId: 'room1',
      senderId: 'user1',
      content: '안녕하세요!',
      timestamp: new Date().toISOString(),
      file: null,
      fileName: '',
      fileType: '',
    }),
    new ChatMessage({
      id: 'msg2',
      roomId: 'room1',
      senderId: 'user2',
      content: '반갑습니다!',
      timestamp: new Date().toISOString(),
      file: null,
      fileName: '',
      fileType: '',
    }),
  ],
  room2: [
    new ChatMessage({
      id: 'msg3',
      roomId: 'room2',
      senderId: 'user3',
      content: '안녕하세요! 여쭤볼게있는데 채팅 가능할까요? 안녕하세요! 여쭤볼게있는데 채팅 가능할까요? 안녕하세요! 여쭤볼게있는데 채팅 가능할까요? ',
      timestamp: new Date().toISOString(),
      file: null,
      fileName: '',
      fileType: '',
    }),
    new ChatMessage({
      id: 'msg4',
      roomId: 'room2',
      senderId: 'user3',
      content: '안녕하세요! 여쭤볼게있는데 채팅 가능할까요? 안녕하세요! 여쭤볼게있는데 채팅 가능할까요? 안녕하세요! 여쭤볼게있는데 채팅 가능할까요? ',
      timestamp: new Date().toISOString(),
      file: null,
      fileName: '',
      fileType: '',
    }),
    new ChatMessage({
      id: 'msg5',
      roomId: 'room2',
      senderId: 'user3',
      content: '안녕하세요! 여쭤볼게있는데 채팅 가능할까요? 안녕하세요! 여쭤볼게있는데 채팅 가능할까요? 안녕하세요! 여쭤볼게있는데 채팅 가능할까요? ',
      timestamp: new Date().toISOString(),
      file: null,
      fileName: '',
      fileType: '',
    }),
  ],
};

export function getChatRooms() {
  return Promise.resolve(dummyRooms);
}

export function getMessages(roomId) {
  return Promise.resolve(dummyMessages[roomId] || []);
}

export function sendMessage(roomId, senderId, content, file = null, fileName = '', fileType = '') {
  const newMsg = new ChatMessage({
    id: 'msg' + Math.random().toString(36).substr(2, 9),
    roomId,
    senderId,
    content,
    timestamp: new Date().toISOString(),
    file,
    fileName,
    fileType,
  });
  
  // 더미 데이터에는 저장하지 않고, 메시지 객체만 반환
  // store에서 직접 messages 배열에 추가하도록 함
  // if (!dummyMessages[roomId]) dummyMessages[roomId] = [];
  // dummyMessages[roomId].push(newMsg);
  

  return Promise.resolve(newMsg);
}

// // WebSocket, SockJS, STOMP 연동
// import SockJS from 'sockjs-client/dist/sockjs.min.js';
// import Stomp from 'stompjs';

// let stompClient = null;
// let connected = false;
// let messageCallback = null;

// const WS_URL = '/ws'; // 실제 서버에 맞게 교체
// const TOPIC_PREFIX = '/topic/chat/';
// const SEND_ENDPOINT = '/app/chat.send';

// export function connectWebSocket(roomId, onMessage) {
//   if (connected) return;
//   const socket = new SockJS(WS_URL);
//   stompClient = Stomp.over(socket);
//   messageCallback = onMessage;
//   stompClient.connect({}, () => {
//     connected = true;
//     stompClient.subscribe(TOPIC_PREFIX + roomId, (msg) => {
//       if (msg.body && messageCallback) {
//         messageCallback(JSON.parse(msg.body));
//       }
//     });
//   });
// }

// export function disconnectWebSocket() {
//   if (stompClient && connected) {
//     stompClient.disconnect(() => {
//       connected = false;
//       stompClient = null;
//     });
//   }
// }

// export function sendWebSocketMessage(roomId, messageObj) {
//   if (stompClient && connected) {
//     stompClient.send(SEND_ENDPOINT, {}, JSON.stringify({ ...messageObj, roomId }));
//   }
// } 