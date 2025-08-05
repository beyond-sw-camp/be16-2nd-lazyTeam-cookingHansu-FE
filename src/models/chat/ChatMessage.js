// 채팅 메시지 모델
export default class ChatMessage {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.roomId
   * @param {string} params.senderId
   * @param {string} params.content
   * @param {string} params.timestamp
   * @param {string|null} params.file
   * @param {string} params.fileName
   * @param {string} params.fileType
   */
  constructor({ id, roomId, senderId, content, timestamp, file = null, fileName = '', fileType = '' }) {
    this.id = id;
    this.roomId = roomId;
    this.senderId = senderId;
    this.content = content;
    this.timestamp = timestamp;
    this.file = file;
    this.fileName = fileName;
    this.fileType = fileType;
  }
} 