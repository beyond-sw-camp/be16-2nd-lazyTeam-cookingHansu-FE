// 공통 API 유틸리티 - axios 기반
import { apiClient } from './interceptor';

// JWT 토큰에서 사용자 ID 추출
export const getUserIdFromToken = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    if (decodedPayload.userId) {
      return decodedPayload.userId;
    }
    if (decodedPayload.uuid) {
      return decodedPayload.uuid;
    }
    
    return decodedPayload.sub;
  } catch (error) {
    console.error('토큰에서 사용자 ID 추출 오류:', error);
    return null;
  }
};

// JWT 토큰에서 사용자 역할 추출
export const getUserRoleFromToken = () => {
  try {
    if (typeof localStorage === 'undefined' || !localStorage) {
      return null;
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    const payload = token.split('.')[1];
    if (!payload) return null;
    
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.role || decodedPayload.authorities || decodedPayload.userRole;
  } catch (error) {
    return null;
  }
};

// GET 요청
export const apiGet = async (endpoint) => {
  try {
    const response = await apiClient.get(endpoint);
    return response;
  } catch (error) {
    console.error('API GET 요청 실패:', error);
    throw error;
  }
};

// POST 요청
export const apiPost = async (endpoint, data = null) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response;
  } catch (error) {
    console.error('API POST 요청 실패:', error);
    throw error;
  }
};

// PATCH 요청
export const apiPatch = async (endpoint, data = null) => {
  try {
    const response = await apiClient.patch(endpoint, data);
    return response;
  } catch (error) {
    console.error('API PATCH 요청 실패:', error);
    throw error;
  }
};

// PUT 요청
export const apiPut = async (endpoint, data = null) => {
  try {
    const response = await apiClient.put(endpoint, data);
    return response;
  } catch (error) {
    console.error('API PUT 요청 실패:', error);
    throw error;
  }
};

// DELETE 요청
export const apiDelete = async (endpoint, data = null) => {
  try {
    const response = await apiClient.delete(endpoint, { data });
    return response;
  } catch (error) {
    console.error('API DELETE 요청 실패:', error);
    throw error;
  }
};

// FormData를 사용한 POST 요청 (파일 업로드용)
export const apiPostFormData = async (endpoint, formData) => {
  try {
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 파일 업로드는 60초로 설정
    });
    return response;
  } catch (error) {
    console.error('API POST FormData 요청 실패:', error);
    throw error;
  }
};

// FormData를 사용한 PUT 요청 (파일 업로드용)
export const apiPutFormData = async (endpoint, formData) => {
  try {
    const response = await apiClient.put(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 파일 업로드는 60초로 설정
    });
    return response;
  } catch (error) {
    console.error('API PUT FormData 요청 실패:', error);
    throw error;
  }
}; 