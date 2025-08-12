import { apiGet, apiPatch, apiDelete, apiPostFormData } from '../../utils/api';
import { handleApiResponse } from '../../models/common/ApiResponse';
import { ChatRoomResponse, ChatMessageResponse } from '../../models/chat/ChatResponse';

const API_ENDPOINTS = {
  MY_CHAT_ROOMS: '/chat/my/rooms',
  CHAT_HISTORY: (roomId) => `/chat/room/${roomId}/history`,
  CREATE_ROOM: (otherUserId) => `/chat/room/create/${otherUserId}`,
  UPDATE_ROOM_NAME: (roomId) => `/chat/room/${roomId}/name`,
  LEAVE_ROOM: (roomId) => `/chat/room/${roomId}/leave`,
  UPLOAD_FILES: (roomId) => `/chat/room/${roomId}/upload`,
  SEND_MESSAGE: (roomId) => `/chat/room/${roomId}/message`,
};

export const chatService = {
  async getMyChatRooms() {
    const response = await apiGet(API_ENDPOINTS.MY_CHAT_ROOMS);
    const apiResponse = await handleApiResponse(response);
    const roomsData = apiResponse.getData() || [];
    return roomsData.map((roomData) => ChatRoomResponse.fromJson(roomData));
  },

  async getChatHistory(roomId) {
    const response = await apiGet(API_ENDPOINTS.CHAT_HISTORY(roomId));
    const apiResponse = await handleApiResponse(response);
    const messagesData = apiResponse.getData() || [];
    return messagesData.map((messageData) => ChatMessageResponse.fromJson(messageData));
  },

  async createChatRoom(otherUserId) {
    const response = await apiGet(API_ENDPOINTS.CREATE_ROOM(otherUserId));
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  },

  async updateChatRoomName(roomId, roomName) {
    const response = await apiPatch(API_ENDPOINTS.UPDATE_ROOM_NAME(roomId), { name: roomName });
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  },

  async leaveChatRoom(roomId) {
    const response = await apiDelete(API_ENDPOINTS.LEAVE_ROOM(roomId));
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  },

  async uploadFiles(roomId, files, fileTypes) {
    const formData = new FormData();
    formData.append('roomId', roomId);
    files.forEach((file, index) => {
      formData.append('files', file);
      formData.append('fileTypes', fileTypes[index]);
    });
    const response = await apiPostFormData(API_ENDPOINTS.UPLOAD_FILES(roomId), formData);
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  },

  async sendMessage(roomId, content, uploadedFiles = null) {
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('senderId', '550e8400-e29b-41d4-a716-446655440001'); // 데모용 하드코딩
    formData.append('message', content);
    if (uploadedFiles && uploadedFiles.files && uploadedFiles.files.length > 0) {
      formData.append('files', JSON.stringify(uploadedFiles.files));
    }
    const response = await apiPostFormData(API_ENDPOINTS.SEND_MESSAGE(roomId), formData);
    const apiResponse = await handleApiResponse(response);
    const messageData = apiResponse.getData();
    return ChatMessageResponse.fromJson(messageData);
  },
};

// 주요 함수들만 export (개별 함수 export 제거)
export const {
  getMyChatRooms,
  getChatHistory,
  createChatRoom,
  updateChatRoomName,
  leaveChatRoom,
  uploadFiles,
  sendMessage
} = chatService;
