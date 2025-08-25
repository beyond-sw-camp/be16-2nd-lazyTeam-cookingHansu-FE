// 공통 API 유틸리티

// API 기본 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    const token = localStorage.getItem('accessToken');
    console.log('🔍 토큰 확인:', token ? '토큰 존재' : '토큰 없음');
    
    if (!token) {
      console.log('❌ 토큰이 없습니다.');
      return null;
    }
    
    // JWT 토큰의 payload 부분 추출 (두 번째 부분)
    const payload = token.split('.')[1];
    console.log('🔍 Payload 부분:', payload ? '존재' : '없음');
    
    if (!payload) {
      console.log('❌ Payload가 없습니다.');
      return null;
    }
    
    // Base64 디코딩
    const decodedPayload = JSON.parse(atob(payload));
    console.log('🔍 디코딩된 토큰 payload:', decodedPayload);
    console.log('🔍 토큰에서 찾은 필드들:', Object.keys(decodedPayload));
    
    // 사용자 역할 반환 (백엔드에서 설정한 필드명에 따라 조정 필요)
    const role = decodedPayload.role || decodedPayload.authorities || decodedPayload.userRole;
    console.log('🔍 추출된 role:', role);
    console.log('🔍 role 필드 확인:');
    console.log('  - decodedPayload.role:', decodedPayload.role);
    console.log('  - decodedPayload.authorities:', decodedPayload.authorities);
    console.log('  - decodedPayload.userRole:', decodedPayload.userRole);
    
    return role;
  } catch (error) {
    console.error('❌ 토큰에서 사용자 역할 추출 실패:', error);
    return null;
  }
};

// API 헤더 설정
export const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // JWT 토큰이 있으면 헤더에 추가
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// GET 요청
export const apiGet = async (endpoint) => {
  console.log('API GET 요청 URL:', `${API_BASE_URL}${endpoint}`);
  console.log('API 요청 헤더:', getHeaders());
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
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
  console.log('API 요청 헤더:', getHeaders());
  
  if (data) {
    console.log('JSON.stringify(data):', JSON.stringify(data));
    console.log('data.lectureId:', data.lectureId);
    console.log('data.lectureId 타입:', typeof data.lectureId);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
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
  console.log('API PATCH 요청 URL:', `${API_BASE_URL}${endpoint}`);
  console.log('API 요청 데이터:', data);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
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