// 채팅 API 서비스

import { handleApiResponse } from '../../models/common/ApiResponse';
import { ChatRoomResponse, ChatMessageResponse } from '../../models/chat/ChatResponse';
import { apiGet, apiPost, apiPatch, apiDelete, apiPostFormData } from '../../utils/api';

// 내 채팅방 목록 조회 API
export async function getMyChatRooms() {
  try {
    const response = await apiGet('/chat/my/rooms');
    const apiResponse = await handleApiResponse(response);
    const roomsData = apiResponse.getData() || [];
    
    // 응답 데이터를 ChatRoomResponse 객체로 변환
    return roomsData.map(roomData => ChatRoomResponse.fromJson(roomData));
  } catch (error) {
    console.error('채팅방 목록 조회 실패:', error);
    throw error;
  }
}

// 채팅방 메시지 조회 API
export async function getChatHistory(roomId) {
  try {
    const response = await apiGet(`/chat/room/${roomId}/history`);
    const apiResponse = await handleApiResponse(response);
    const messagesData = apiResponse.getData() || [];
    
    // 응답 데이터를 ChatMessageResponse 객체로 변환
    return messagesData.map(messageData => ChatMessageResponse.fromJson(messageData));
  } catch (error) {
    console.error('메시지 조회 실패:', error);
    throw error;
  }
}

// 메시지 읽음 처리 API
export async function markMessageAsRead(roomId) {
  try {
    const response = await apiGet(`/chat/room/${roomId}/read`);
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  } catch (error) {
    console.error('메시지 읽음 처리 실패:', error);
    throw error;
  }
}

// 채팅방 생성 API
export async function createChatRoom(otherUserId) {
  try {
    const response = await apiGet(`/chat/room/create/${otherUserId}`);
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  } catch (error) {
    console.error('채팅방 생성 실패:', error);
    throw error;
  }
}

// 채팅방 이름 수정 API
export async function updateChatRoomName(roomId, roomName) {
  try {
    const response = await apiPatch(`/chat/room/${roomId}/name`, { name: roomName });
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  } catch (error) {
    console.error('채팅방 이름 수정 실패:', error);
    throw error;
  }
}

// 채팅방 나가기 API
export async function leaveChatRoom(roomId) {
  try {
    const response = await apiDelete(`/chat/room/${roomId}/leave`);
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  } catch (error) {
    console.error('채팅방 나가기 실패:', error);
    throw error;
  }
}

// 메시지 전송 API (추후 WebSocket으로 구현 예정)
export async function sendMessage(roomId, content, file = null) {
  try {
    const formData = new FormData();
    formData.append('content', content);
    if (file) {
      formData.append('file', file);
    }

    const response = await apiPostFormData(`/chat/room/${roomId}/message`, formData);
    const apiResponse = await handleApiResponse(response);
    const messageData = apiResponse.getData();
    
    // 응답 데이터를 ChatMessageResponse 객체로 변환
    return ChatMessageResponse.fromJson(messageData);
  } catch (error) {
    console.error('메시지 전송 실패:', error);
    throw error;
  }
}

// 기존 호환성 함수들
export function getChatRooms() {
  return getMyChatRooms();
}

export function getMessages(roomId) {
  return getChatHistory(roomId);
} 