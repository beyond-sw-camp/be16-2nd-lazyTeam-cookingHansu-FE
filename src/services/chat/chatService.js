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
};

export const chatService = {
  async getMyChatRooms(size = 10, cursor = null) {
    const params = new URLSearchParams();
    params.append('size', size.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    const response = await apiGet(`${API_ENDPOINTS.MY_CHAT_ROOMS}?${params.toString()}`);
    const apiResponse = await handleApiResponse(response);
    const paginatedData = apiResponse.getData();
    
    return {
      data: (paginatedData.data || []).map((roomData) => ChatRoomResponse.fromJson(roomData)),
      hasNext: paginatedData.hasNext || false,
      nextCursor: paginatedData.nextCursor || null
    };
  },

  async getChatHistory(roomId, size = 30, cursor = null) {
    const params = new URLSearchParams();
    params.append('size', size.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    const response = await apiGet(`${API_ENDPOINTS.CHAT_HISTORY(roomId)}?${params.toString()}`);
    const apiResponse = await handleApiResponse(response);
    const paginatedData = apiResponse.getData();
    
    return {
      data: (paginatedData.data || []).map((messageData) => ChatMessageResponse.fromJson(messageData)),
      hasNext: paginatedData.hasNext || false,
      nextCursor: paginatedData.nextCursor || null
    };
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
};

// 주요 함수들만 export (개별 함수 export 제거)
export const {
  getMyChatRooms,
  getChatHistory,
  createChatRoom,
  updateChatRoomName,
  leaveChatRoom,
  uploadFiles
} = chatService;
