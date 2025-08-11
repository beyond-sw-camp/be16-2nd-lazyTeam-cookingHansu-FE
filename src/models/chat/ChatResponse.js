// 채팅 관련 응답 모델

// 채팅방 목록 응답 모델 (ChatRoomListDto 기반)
export class ChatRoomResponse {
  constructor(roomId, customRoomName, otherUserName, otherUserNickname, otherUserProfileImage, lastMessage, lastMessageTime, newMessageCount) {
    this.roomId = roomId;
    this.customRoomName = customRoomName;
    this.otherUserName = otherUserName;
    this.otherUserNickname = otherUserNickname;
    this.otherUserProfileImage = otherUserProfileImage;
    this.lastMessage = lastMessage;
    this.lastMessageTime = lastMessageTime;
    this.unreadCount = newMessageCount || 0;
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
}

// 채팅 파일 응답 모델 (ChatFileUploadResDto.FileInfo 기반)
export class ChatFileResponse {
  constructor(fileId, fileUrl, fileName, fileType, fileSize) {
    this.id = fileId;
    this.fileId = fileId; // 기존 호환성을 위해 유지
    this.fileName = fileName;
    this.fileUrl = fileUrl;
    this.fileType = fileType;
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

  // 파일이 이미지인지 확인 (백엔드 FileType enum 기반)
  isImage() {
    return this.fileType === 'IMAGE';
  }

  // 파일이 비디오인지 확인 (백엔드 FileType enum 기반)
  isVideo() {
    return this.fileType === 'VIDEO';
  }

  // 파일 확장자로 이미지인지 확인 (기존 호환성)
  isImageByExtension() {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => 
      this.fileName && this.fileName.toLowerCase().endsWith(ext)
    );
  }
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

  // 이미지 파일들만 가져오기 (백엔드 FileType 기반)
  getImageFiles() {
    return this.files.filter(file => file.isImage());
  }

  // 비디오 파일들만 가져오기 (백엔드 FileType 기반)
  getVideoFiles() {
    return this.files.filter(file => file.isVideo());
  }

  // 일반 파일들만 가져오기 (이미지, 비디오 제외)
  getNonImageFiles() {
    return this.files.filter(file => !file.isImage() && !file.isVideo());
  }
} 