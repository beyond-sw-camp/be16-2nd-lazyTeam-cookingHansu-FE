// 채팅 API 서비스

import { apiGet, apiPost, apiPatch, apiDelete, apiPostFormData } from '../../utils/api';
import { handleApiResponse } from '../../models/common/ApiResponse';
import { ChatRoomResponse, ChatMessageResponse } from '../../models/chat/ChatResponse';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  MY_CHAT_ROOMS: '/chat/my/rooms',
  CHAT_HISTORY: (roomId) => `/chat/room/${roomId}/history`,
  MARK_AS_READ: (roomId) => `/chat/room/${roomId}/read`,
  CREATE_ROOM: (otherUserId) => `/chat/room/create/${otherUserId}`,
  UPDATE_ROOM_NAME: (roomId) => `/chat/room/${roomId}/name`,
  LEAVE_ROOM: (roomId) => `/chat/room/${roomId}/leave`,
  UPLOAD_FILES: (roomId) => `/chat/room/${roomId}/upload`,
  SEND_MESSAGE: (roomId) => `/chat/room/${roomId}/message`,
};

export const chatService = {
  // 내 채팅방 목록 조회
  async getMyChatRooms() {
    const response = await apiGet(API_ENDPOINTS.MY_CHAT_ROOMS);
    const apiResponse = await handleApiResponse(response);
    const roomsData = apiResponse.getData() || [];
    
    return roomsData.map(roomData => ChatRoomResponse.fromJson(roomData));
  },

  // 채팅방 메시지 조회
  async getChatHistory(roomId) {
    const response = await apiGet(API_ENDPOINTS.CHAT_HISTORY(roomId));
    const apiResponse = await handleApiResponse(response);
    const messagesData = apiResponse.getData() || [];
    
    return messagesData.map(messageData => ChatMessageResponse.fromJson(messageData));
  },

  // 메시지 읽음 처리
  async markMessageAsRead(roomId) {
    const response = await apiPost(API_ENDPOINTS.MARK_AS_READ(roomId));
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  },

  // 채팅방 생성
  async createChatRoom(otherUserId) {
    const response = await apiGet(API_ENDPOINTS.CREATE_ROOM(otherUserId));
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  },

  // 채팅방 이름 수정
  async updateChatRoomName(roomId, roomName) {
    const response = await apiPatch(API_ENDPOINTS.UPDATE_ROOM_NAME(roomId), { name: roomName });
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  },

  // 채팅방 나가기
  async leaveChatRoom(roomId) {
    const response = await apiDelete(API_ENDPOINTS.LEAVE_ROOM(roomId));
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  },

  // 파일 업로드
  async uploadFiles(roomId, files, fileTypes) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file);
      formData.append('fileTypes', fileTypes[index]);
    });

    const response = await apiPostFormData(API_ENDPOINTS.UPLOAD_FILES(roomId), formData);
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  },

  // 메시지 전송
  async sendMessage(roomId, content, uploadedFiles = null) {
    const formData = new FormData();
    formData.append('content', content);
    
    if (uploadedFiles && uploadedFiles.files && uploadedFiles.files.length > 0) {
      formData.append('files', JSON.stringify(uploadedFiles.files));
    }

    const response = await apiPostFormData(API_ENDPOINTS.SEND_MESSAGE(roomId), formData);
    const apiResponse = await handleApiResponse(response);
    const messageData = apiResponse.getData();
    
    return ChatMessageResponse.fromJson(messageData);
  },

  // 파일 타입 추정 유틸리티
  getFileTypeFromFile(file) {
    if (!file || !file.name) {
      return 'UNKNOWN';
    }
    
    const fileName = file.name;
    const lastDotIndex = fileName.lastIndexOf(".");
    
    if (lastDotIndex === -1) {
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
      return 'UNKNOWN';
    }
  },
};

// 기존 호환성 함수들 (점진적 마이그레이션을 위해 유지)
export const getMyChatRooms = () => chatService.getMyChatRooms();
export const getChatHistory = (roomId) => chatService.getChatHistory(roomId);
export const markMessageAsRead = (roomId) => chatService.markMessageAsRead(roomId);
export const createChatRoom = (otherUserId) => chatService.createChatRoom(otherUserId);
export const updateChatRoomName = (roomId, roomName) => chatService.updateChatRoomName(roomId, roomName);
export const leaveChatRoom = (roomId) => chatService.leaveChatRoom(roomId);
export const uploadFiles = (roomId, files, fileTypes) => chatService.uploadFiles(roomId, files, fileTypes);
export const sendMessage = (roomId, content, uploadedFiles) => chatService.sendMessage(roomId, content, uploadedFiles);
export const getFileTypeFromFile = (file) => chatService.getFileTypeFromFile(file);

// 기존 호환성 함수들
export function getChatRooms() {
  return getMyChatRooms();
}

export function getMessages(roomId) {
  return getChatHistory(roomId);
} 