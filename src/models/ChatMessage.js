// 채팅 메시지 모델
export default class ChatMessage {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.roomId
   * @param {string} params.sender
   * @param {string} params.content
   * @param {string} params.timestamp
   */
  constructor({ id, roomId, sender, content, timestamp }) {
    this.id = id;
    this.roomId = roomId;
    this.sender = sender;
    this.content = content;
    this.timestamp = timestamp;
  }
} 