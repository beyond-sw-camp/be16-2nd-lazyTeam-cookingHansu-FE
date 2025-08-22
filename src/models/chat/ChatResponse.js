// 채팅방 목록 응답 모델 (ChatRoomListDto 기반)
export class ChatRoomResponse {
  constructor(
    roomId,
    customRoomName,
    otherUserName,
    otherUserNickname,
    otherUserProfileImage,
    lastMessage,
    lastMessageTime,
    newMessageCount
  ) {
    this.roomId = roomId;
    this.customRoomName = customRoomName;
    this.otherUserName = otherUserName;
    this.otherUserNickname = otherUserNickname;
    this.otherUserProfileImage = otherUserProfileImage;
    this.lastMessage = lastMessage;
    this.lastMessageTime = lastMessageTime;
    this.newMessageCount = newMessageCount;
  }

  static fromJson(json) {
    return new ChatRoomResponse(
      json.roomId,
      json.customRoomName,
      json.otherUserName,
      json.otherUserNickname,
      json.otherUserProfileImage,
      json.lastMessage,
      json.lastMessageTime,
      json.newMessageCount
    );
  }

  // lastMessageId 기반으로 unread count 계산 (백엔드에서 이미 계산된 값 사용)
  getUnreadCount() {
    return this.newMessageCount || 0;
  }
}

// 채팅 파일 응답 모델 (ChatFileUploadResDto.FileInfo 기반)
export class ChatFileResponse {
  constructor(fileId, fileUrl, fileName, fileType, fileSize) {
    this.id = fileId;
    this.fileId = fileId; // 기존 호환
    this.fileName = fileName;
    this.fileUrl = fileUrl;
    this.fileType = fileType; // 'IMAGE' | 'VIDEO' | 'OTHER'
    this.fileSize = fileSize;
  }

  static fromJson(json) {
    return new ChatFileResponse(
      json.fileId,
      json.fileUrl,
      json.fileName,
      json.fileType,
      json.fileSize
    );
  }

  isImage() { return this.fileType === 'IMAGE'; }
  isVideo() { return this.fileType === 'VIDEO'; }
}

// 채팅 메시지 응답 모델 (ChatMessageResDto 기반)
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
      json.updatedAt,
    );
  }
}
