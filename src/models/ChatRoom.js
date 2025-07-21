// 채팅방 모델
export default class ChatRoom {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {string[]} params.participants
   * @param {string} params.lastMessage
   * @param {string} params.lastMessageTime
   * @param {number} params.unreadCount
   * @param {string} params.avatar
   */
  constructor({ id, name, participants, lastMessage, lastMessageTime, unreadCount = 0, avatar = '' }) {
    this.id = id;
    this.name = name;
    this.participants = participants;
    this.lastMessage = lastMessage;
    this.lastMessageTime = lastMessageTime;
    this.unreadCount = unreadCount;
    this.avatar = avatar;
  }
} 