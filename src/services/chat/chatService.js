import { apiGet, apiPatch, apiDelete, apiPostFormData, apiPost } from '../../utils/api';
import { handleApiResponse } from '../../models/common/ApiResponse';
import { ChatRoomResponse, ChatMessageResponse } from '../../models/chat/ChatResponse';

const API_ENDPOINTS = {
  MY_CHAT_ROOMS: '/chat/my/rooms',
  CHAT_HISTORY: (roomId) => `/chat/room/${roomId}/history`,
  CREATE_ROOM: (otherUserId) => `/chat/room/create/${otherUserId}`,
  UPDATE_ROOM_NAME: (roomId) => `/chat/room/${roomId}/name`,
  LEAVE_ROOM: (roomId) => `/chat/room/${roomId}/leave`,
  UPLOAD_FILES: (roomId) => `/chat/room/${roomId}/upload`,
  READ_MESSAGES: (roomId) => `/chat/room/${roomId}/read`,
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
      data: (paginatedData.data || []).map(room => ChatRoomResponse.fromJson(room)),
      hasNext: paginatedData.hasNext || false,
      nextCursor: paginatedData.nextCursor || null,
      // ✅ 추가: lastReadTimestamp 반환
      lastReadTimestamp: paginatedData.lastReadTimestamp || null
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
      data: (paginatedData.data || []).map(message => ChatMessageResponse.fromJson(message)),
      hasNext: paginatedData.hasNext || false,
      nextCursor: paginatedData.nextCursor || null,
      // ✅ 추가: lastReadTimestamp 반환
      lastReadTimestamp: paginatedData.lastReadTimestamp || null
    };
  },

  async createChatRoom(otherUserId) {
    const response = await apiGet(API_ENDPOINTS.CREATE_ROOM(otherUserId));
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  },

  async updateChatRoomName(roomId, roomName) {
    const response = await apiPatch(API_ENDPOINTS.UPDATE_ROOM_NAME(roomId), { name: roomName });
    return handleApiResponse(response);
  },

  async leaveChatRoom(roomId) {
    const response = await apiDelete(API_ENDPOINTS.LEAVE_ROOM(roomId));
    return handleApiResponse(response);
  },

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

  // ✅ 개선된 읽음 처리 API
  async readMessages(roomId, userId) {
    try {
      const response = await apiPost(API_ENDPOINTS.READ_MESSAGES(roomId), { userId });
      const apiResponse = await handleApiResponse(response);
      console.log(`✅ 읽음 처리 API 호출 성공: roomId=${roomId}, userId=${userId}`);
      return apiResponse.getData();
    } catch (error) {
      console.error(`❌ 읽음 처리 API 호출 실패: roomId=${roomId}, userId=${userId}`, error);
      throw error;
    }
  }
};

// 주요 함수들만 export (개별 함수 export 제거)
export const {
  getMyChatRooms,
  getChatHistory,
  createChatRoom,
  updateChatRoomName,
  leaveChatRoom,
  uploadFiles,
  readMessages
} = chatService;
