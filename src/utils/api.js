// 공통 API 유틸리티

// API 기본 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// JWT 토큰에서 사용자 ID 추출
export const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    // JWT 토큰의 payload 부분 추출 (두 번째 부분)
    const payload = token.split('.')[1];
    if (!payload) return null;
    
    // Base64 디코딩
    const decodedPayload = JSON.parse(atob(payload));
    
    // 사용자 ID 반환 (백엔드에서 설정한 필드명에 따라 조정 필요)
    return decodedPayload.sub || decodedPayload.userId || decodedPayload.id;
  } catch (error) {
    console.error('토큰에서 사용자 ID 추출 실패:', error);
    return null;
  }
};

// JWT 토큰에서 사용자 역할 추출
export const getUserRoleFromToken = () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    // JWT 토큰의 payload 부분 추출 (두 번째 부분)
    const payload = token.split('.')[1];
    if (!payload) return null;
    
    // Base64 디코딩
    const decodedPayload = JSON.parse(atob(payload));
    
    // 사용자 역할 반환 (백엔드에서 설정한 필드명에 따라 조정 필요)
    return decodedPayload.role || decodedPayload.authorities || decodedPayload.userRole;
  } catch (error) {
    console.error('토큰에서 사용자 역할 추출 실패:', error);
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
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : null,
    });
    
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