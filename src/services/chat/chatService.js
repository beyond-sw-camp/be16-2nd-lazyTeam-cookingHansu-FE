// 더미 데이터 기반 채팅 서비스

import ChatRoom from '../../models/ChatRoom';

const dummyRooms = [
  new ChatRoom({
    id: 'room1',
    name: '일반 채팅방',
    participants: ['user1', 'user2'],
    lastMessage: '안녕하세요!',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    avatar: '',
  }),
  new ChatRoom({
    id: 'room2',
    name: '공지방',
    participants: ['admin', 'user1'],
    lastMessage: '공지사항입니다.',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1,
    avatar: '',
  }),
];

const dummyMessages = {
  room1: [
    {
      id: 'msg1',
      roomId: 'room1',
      sender: 'user1',
      content: '안녕하세요!',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'msg2',
      roomId: 'room1',
      sender: 'user2',
      content: '반갑습니다!',
      timestamp: new Date().toISOString(),
    },
  ],
  room2: [
    {
      id: 'msg3',
      roomId: 'room2',
      sender: 'admin',
      content: '공지사항입니다.',
      timestamp: new Date().toISOString(),
    },
  ],
};

export function getChatRooms() {
  return Promise.resolve(dummyRooms);
}

export function getMessages(roomId) {
  return Promise.resolve(dummyMessages[roomId] || []);
}

export function sendMessage(roomId, sender, content) {
  const newMsg = {
    id: 'msg' + Math.random().toString(36).substr(2, 9),
    roomId,
    sender,
    content,
    timestamp: new Date().toISOString(),
  };
  if (!dummyMessages[roomId]) dummyMessages[roomId] = [];
  dummyMessages[roomId].push(newMsg);
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