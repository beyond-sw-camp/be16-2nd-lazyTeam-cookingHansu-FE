// 공통 API 유틸리티
import { interceptor } from './interceptor';

// API 기본 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// JWT 토큰에서 사용자 ID 추출
export const getUserIdFromToken = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    console.log('Decoded JWT Payload:', decodedPayload); // Added for debugging
    
    if (decodedPayload.userId) {
      console.log('Found userId in token:', decodedPayload.userId);
      return decodedPayload.userId;
    }
    if (decodedPayload.uuid) {
      console.log('Found uuid in token:', decodedPayload.uuid);
      return decodedPayload.uuid;
    }
    
    console.warn('No explicit UUID field (userId/uuid) found in token. Falling back to "sub" field. This might be an email:', decodedPayload.sub);
    return decodedPayload.sub;
  } catch (error) {
    console.error('토큰에서 사용자 ID 추출 오류:', error);
    return null;
  }
};

// JWT 토큰에서 사용자 역할 추출
export const getUserRoleFromToken = () => {
  try {
    // localStorage가 존재하는지 확인
    if (typeof localStorage === 'undefined' || !localStorage) {
      return null;
    }
    
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return null;
    }
    
    // JWT 토큰의 payload 부분 추출 (두 번째 부분)
    const payload = token.split('.')[1];
    
    if (!payload) {
      return null;
    }
    
    // Base64 디코딩
    const decodedPayload = JSON.parse(atob(payload));
    
    // 사용자 역할 반환 (백엔드에서 설정한 필드명에 따라 조정 필요)
    return decodedPayload.role || decodedPayload.authorities || decodedPayload.userRole;
  } catch (error) {
    return null;
  }
};

// API 헤더 설정 (기본 인증 헤더만)
export const getHeaders = () => {
  const headers = {};
  
  // JWT 토큰이 있으면 헤더에 추가
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('localStorage 접근 오류:', error);
  }
  
  // 관리자 JWT 토큰이 있으면 헤더에 추가 (관리자 API용)
  const adminToken = localStorage.getItem('adminAccessToken');
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }
  
  return headers;
};

// 인터셉터 기반 헤더 설정
export const getHeadersWithInterceptor = async (endpoint) => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8'
  };
  
  // 관리자 API인지 확인
  const isAdminEndpoint = endpoint.startsWith('/admin');
  
  if (isAdminEndpoint) {
    // 관리자 API인 경우 관리자 토큰 추가
    const adminAccessToken = localStorage.getItem('adminAccessToken');
    if (adminAccessToken) {
      headers.Authorization = `Bearer ${adminAccessToken}`;
      console.log('🔐 관리자 토큰 추가됨:', endpoint);
    } else {
      console.warn('⚠️ 관리자 토큰이 없습니다:', endpoint);
    }
  } else {
    // 일반 API인 경우 일반 토큰 체크 및 추가
    if (interceptor.shouldAddToken(endpoint)) {
      // 토큰 자동 갱신 및 추가
      if (interceptor.isTokenExpired()) {
        await interceptor.refreshToken();
      }
      
      interceptor.addToken(headers, endpoint);
    }
  }
  
  return headers;
};

// GET 요청
export const apiGet = async (endpoint) => {
  console.log('API GET 요청 URL:', `${API_BASE_URL}${endpoint}`);
  
  try {
    const headers = await getHeadersWithInterceptor(endpoint);
    console.log('API 요청 헤더:', headers);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: headers,
    });
    
    return response;
  } catch (error) {
    console.error('API GET 요청 실패:', error);
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error('서버와의 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.message && error.message.includes('Network Error')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
    } else {
      throw error;
    }
  }
};

// POST 요청
export const apiPost = async (endpoint, data = null) => {
  console.log('API POST 요청 URL:', `${API_BASE_URL}${endpoint}`);
  console.log('API 요청 데이터:', data);
  
  if (data) {
    console.log('JSON.stringify(data):', JSON.stringify(data));
    console.log('data.lectureId:', data.lectureId);
    console.log('data.lectureId 타입:', typeof data.lectureId);
  }
  
  try {
    const headers = await getHeadersWithInterceptor(endpoint);
    console.log('API 요청 헤더:', headers);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: data ? JSON.stringify(data) : null,
    });
    
    console.log('API POST 응답 상태:', response.status);
    console.log('API POST 응답 헤더:', response.headers);
    
    return response;
  } catch (error) {
    console.error('API POST 요청 실패:', error);
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error('서버와의 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.message && error.message.includes('Network Error')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
    } else {
      throw error;
    }
  }
};

// PATCH 요청
export const apiPatch = async (endpoint, data = null) => {
  try {
    const headers = await getHeadersWithInterceptor(endpoint);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: headers,
      body: data ? JSON.stringify(data) : null,
    });
    
    return response;
  } catch (error) {
    console.error('API PATCH 요청 실패:', error);
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error('서버와의 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.message && error.message.includes('Network Error')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
    } else {
      throw error;
    }
  }
};

// DELETE 요청
export const apiDelete = async (endpoint, data = null) => {
  console.log('API DELETE 요청 URL:', `${API_BASE_URL}${endpoint}`);
  console.log('API 요청 데이터:', data);
  
  try {
    const headers = await getHeadersWithInterceptor(endpoint);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: headers,
      body: data ? JSON.stringify(data) : null,
    });
    
    return response;
  } catch (error) {
    console.error('API DELETE 요청 실패:', error);
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error('서버와의 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.message && error.message.includes('Network Error')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
    } else {
      throw error;
    }
  }
};

// PUT 요청
export const apiPut = async (endpoint, data = null) => {
  console.log('API PUT 요청 URL:', `${API_BASE_URL}${endpoint}`);
  console.log('API 요청 데이터:', data);
  
  try {
    const headers = await getHeadersWithInterceptor(endpoint);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers,
      body: data ? JSON.stringify(data) : null,
    });
    
    return response;
  } catch (error) {
    console.error('API PUT 요청 실패:', error);
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error('서버와의 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.message && error.message.includes('Network Error')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
    } else {
      throw error;
    }
  }
};

// FormData를 사용한 PUT 요청 (파일 업로드용)
export const apiPutFormData = async (endpoint, formData) => {
  console.log('API PUT FormData 요청 URL:', `${API_BASE_URL}${endpoint}`);
  console.log('API 요청 FormData:', formData);
  
  try {
    const headers = {};
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers,
      body: formData,
    });
    
    return response;
  } catch (error) {
    console.error('API PUT FormData 요청 실패:', error);
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error('서버와의 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.message && error.message.includes('Network Error')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
    } else {
      throw error;
    }
  }
};

// FormData를 사용한 POST 요청 (파일 업로드용)
export const apiPostFormData = async (endpoint, formData) => {
  console.log('API POST FormData 요청 URL:', `${API_BASE_URL}${endpoint}`);
  console.log('API 요청 FormData:', formData);
  
  // FormData 내용 상세 로깅
  if (formData instanceof FormData) {
    console.log('FormData 상세 내용:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`- ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`- ${key}: ${value}`);
      }
    }
  }
  
  try {
    const headers = {};
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    
    console.log('API 응답 상태:', response.status, response.statusText);
    return response;
  } catch (error) {
    console.error('API POST FormData 요청 실패:', error);
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error('서버와의 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.message && error.message.includes('Network Error')) {
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
    } else {
      throw error;
    }
  }
}; 