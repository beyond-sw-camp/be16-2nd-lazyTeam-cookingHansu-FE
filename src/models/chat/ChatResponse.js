// 채팅 관련 응답 모델

// 채팅방 목록 응답 모델
export class ChatRoomResponse {
  constructor(chatRoomId, chatRoomName, otherUserName, otherUserNickname, otherUserProfileImage, lastMessage, lastMessageTime, unreadCount) {
    this.chatRoomId = chatRoomId;
    this.chatRoomName = chatRoomName;
    this.otherUserName = otherUserName;
    this.otherUserNickname = otherUserNickname;
    this.otherUserProfileImage = otherUserProfileImage;
    this.lastMessage = lastMessage;
    this.lastMessageTime = lastMessageTime;
    this.unreadCount = unreadCount;
  }

  static fromJson(json) {
    return new ChatRoomResponse(
      json.chatRoomId,
      json.chatRoomName,
      json.otherUserName,
      json.otherUserNickname,
      json.otherUserProfileImage,
      json.lastMessage,
      json.lastMessageTime,
      json.unreadCount
    );
  }
}

// 채팅 파일 응답 모델
export class ChatFileResponse {
  constructor(id, fileName, fileUrl, fileType, fileSize) {
    this.id = id;
    this.fileName = fileName;
    this.fileUrl = fileUrl;
    this.fileType = fileType;
    this.fileSize = fileSize;
  }

  static fromJson(json) {
    return new ChatFileResponse(
      json.id,
      json.fileName,
      json.fileUrl,
      json.fileType,
      json.fileSize
    );
  }

  // 파일이 이미지인지 확인
  isImage() {
    return this.fileType && this.fileType.startsWith('image/');
  }

  // 파일 확장자로 이미지인지 확인
  isImageByExtension() {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => 
      this.fileName && this.fileName.toLowerCase().endsWith(ext)
    );
  }
}

// 채팅 메시지 응답 모델
export class ChatMessageResponse {
  constructor(id, roomId, senderId, message, files, createdAt, updatedAt) {
    this.id = id;
    this.roomId = roomId;
    this.senderId = senderId;
    this.message = message;
    this.files = files ? files.map(file => ChatFileResponse.fromJson(file)) : [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromJson(json) {
    return new ChatMessageResponse(
      json.id,
      json.roomId,
      json.senderId,
      json.message,
      json.files,
      json.createdAt,
      json.updatedAt
    );
  }

  // 메시지가 있는지 확인
  hasMessage() {
    return this.message && this.message.trim().length > 0;
  }

  // 파일이 있는지 확인
  hasFiles() {
    return this.files && this.files.length > 0;
  }

  // 이미지 파일들만 가져오기
  getImageFiles() {
    return this.files.filter(file => file.isImage() || file.isImageByExtension());
  }

  // 일반 파일들만 가져오기 (이미지 제외)
  getNonImageFiles() {
    return this.files.filter(file => !file.isImage() && !file.isImageByExtension());
  }
} 