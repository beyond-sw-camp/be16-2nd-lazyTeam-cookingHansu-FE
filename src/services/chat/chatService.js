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
    const response = await apiPost(`/chat/room/${roomId}/read`);
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

// 파일 업로드 API
export async function uploadFiles(roomId, files, fileTypes) {
  try {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file);
      formData.append('fileTypes', fileTypes[index]);
      console.log(`파일크기: ${file.size}`)
    });

    const response = await apiPostFormData(`/chat/room/${roomId}/upload`, formData);
    const apiResponse = await handleApiResponse(response);
    return apiResponse.getData();
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    throw error;
  }
}

// 메시지 전송 API (WebSocket 사용 권장)
export async function sendMessage(roomId, content, uploadedFiles = null) {
  try {
    const formData = new FormData();
    formData.append('content', content);
    
    if (uploadedFiles && uploadedFiles.files && uploadedFiles.files.length > 0) {
      // 업로드된 파일 정보들을 JSON으로 전송
      formData.append('files', JSON.stringify(uploadedFiles.files));
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

// 파일로부터 파일 타입 추정
function getFileTypeFromFile(file) {
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
}

// 기존 호환성 함수들
export function getChatRooms() {
  return getMyChatRooms();
}

export function getMessages(roomId) {
  return getChatHistory(roomId);
} 