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

  getFileTypeFromFile(file) {
    if (!file || !file.name) return 'UNKNOWN';
    const lastDotIndex = file.name.lastIndexOf(".");
    if (lastDotIndex === -1) return 'UNKNOWN';
    const extension = file.name.substring(lastDotIndex + 1).toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov'];
    if (imageExtensions.includes(extension)) return 'IMAGE';
    if (videoExtensions.includes(extension)) return 'VIDEO';
    return 'UNKNOWN';
  },
};

// 기존 호환성 함수들
export const getMyChatRooms = () => chatService.getMyChatRooms();
export const getChatHistory = (roomId) => chatService.getChatHistory(roomId);
export const createChatRoom = (otherUserId) => chatService.createChatRoom(otherUserId);
export const updateChatRoomName = (roomId, roomName) => chatService.updateChatRoomName(roomId, roomName);
export const leaveChatRoom = (roomId) => chatService.leaveChatRoom(roomId);
export const uploadFiles = (roomId, files, fileTypes) => chatService.uploadFiles(roomId, files, fileTypes);
export const sendMessage = (roomId, content, uploadedFiles) => chatService.sendMessage(roomId, content, uploadedFiles);
export const getFileTypeFromFile = (file) => chatService.getFileTypeFromFile(file);
export function getChatRooms() { return getMyChatRooms(); }
export function getMessages(roomId) { return getChatHistory(roomId); }
