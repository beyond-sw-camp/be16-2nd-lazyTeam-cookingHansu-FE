// 공통 API 유틸리티

// API 기본 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API 헤더 설정
export const getHeaders = () => ({
  'Content-Type': 'application/json',
  // JWT 토큰 (테스트 시 주석처리)
  // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

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
export const apiDelete = async (endpoint) => {
  console.log('API DELETE 요청 URL:', `${API_BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        // 'Content-Type': 'multipart/form-data', // FormData 사용 시 자동 설정
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
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
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        // 'Content-Type': 'multipart/form-data', // FormData 사용 시 자동 설정
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    
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