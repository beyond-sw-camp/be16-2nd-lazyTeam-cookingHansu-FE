import axios from 'axios';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// 토큰 만료 확인
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// 토큰 갱신
const refreshToken = async (authStore) => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('리프레시 토큰이 없습니다.');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/user/refresh`, {
      refreshToken
    });

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      // auth store 업데이트
      if (authStore) {
        authStore.accessToken = accessToken;
        authStore.refreshToken = newRefreshToken;
      }
      
      return accessToken;
    } else {
      throw new Error(response.data.message || '토큰 갱신 실패');
    }
  } catch (error) {
    // 토큰 갱신 실패 시 로그아웃 처리
    if (authStore) {
      authStore.clearAuth();
    }
    throw error;
  }
};

// 관리자 토큰 갱신
const refreshAdminToken = async (adminLoginStore) => {
  const refreshToken = localStorage.getItem('adminRefreshToken');
  if (!refreshToken) {
    throw new Error('관리자 리프레시 토큰이 없습니다.');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/admin/refresh`, {
      refreshToken
    });

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem('adminAccessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('adminRefreshToken', newRefreshToken);
      }
      
      // admin store 업데이트
      if (adminLoginStore) {
        adminLoginStore.accessToken = accessToken;
        adminLoginStore.refreshToken = newRefreshToken;
      }
      
      return accessToken;
    } else {
      throw new Error(response.data.message || '관리자 토큰 갱신 실패');
    }
  } catch (error) {
    if (adminLoginStore) {
      adminLoginStore.logout();
    }
    throw error;
  }
};

// Axios 인터셉터 설정
export const setupAxiosInterceptors = (authStore, adminLoginStore) => {
  // 요청 인터셉터
  apiClient.interceptors.request.use(
    async (config) => {
      const endpoint = config.url;
      
      // 관리자 API인지 확인
      const isAdminEndpoint = endpoint.startsWith('/admin');
      
      if (isAdminEndpoint) {
        // 관리자 API인 경우 관리자 토큰 추가
        const adminAccessToken = localStorage.getItem('adminAccessToken');
        if (adminAccessToken) {
          config.headers.Authorization = `Bearer ${adminAccessToken}`;
        }
      } else {
        // 일반 API인 경우 토큰 체크 및 추가
        let accessToken = localStorage.getItem('accessToken');
        
        if (accessToken && isTokenExpired(accessToken)) {
          try {
            accessToken = await refreshToken(authStore);
          } catch (error) {
            // 토큰 갱신 실패 시 요청 중단
            return Promise.reject(error);
          }
        }
        
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // 401 에러이고 토큰 갱신을 시도하지 않은 경우
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const endpoint = originalRequest.url;
        const isAdminEndpoint = endpoint.startsWith('/admin');
        
        // 비활성화된 사용자 확인
        if (error.response?.data?.message?.includes('INACTIVE') || 
            error.response?.data?.data?.loginStatus === 'INACTIVE') {
          // 로그인 정보 정리
          if (authStore) {
            authStore.clearAuth();
          }
          // 비활성화된 사용자는 비활성화 페이지로 리다이렉트
          window.location.href = '/inactive-user';
          return Promise.reject(error);
        }
        
        try {
          if (isAdminEndpoint) {
            // 관리자 토큰 갱신
            await refreshAdminToken(adminLoginStore);
            // 원래 요청 재시도
            return apiClient(originalRequest);
          } else {
            // 일반 토큰 갱신
            await refreshToken(authStore);
            // 원래 요청 재시도
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 처리
          
          // 공개 API는 리다이렉트하지 않음 (비회원 접근 허용)
          const publicEndpoints = [
            '/lecture/detail/',
            '/lecture/list',
            '/api/posts',
            '/api/recipes',
            '/notice',
            '/landing'
          ];
          
          const isPublicEndpoint = publicEndpoints.some(publicPath => 
            endpoint.includes(publicPath)
          );
          
          // 공개 API가 아닌 경우에만 리다이렉트
          if (!isPublicEndpoint) {
            if (isAdminEndpoint) {
              window.location.href = '/admin-login';
            } else {
              window.location.href = '/login';
            }
          }
          
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// 토큰 정리
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('adminAccessToken');
  localStorage.removeItem('adminRefreshToken');
};

// 디바운싱을 위한 타이머
const debounceTimers = new Map();
const DEBOUNCE_DELAY = 300;

// 디바운싱된 API 호출
export const debounceApiCall = (key, apiCall, delay = null) => {
  const actualDelay = delay || DEBOUNCE_DELAY;
  
  if (debounceTimers.has(key)) {
    clearTimeout(debounceTimers.get(key));
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(async () => {
      try {
        const result = await apiCall();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        debounceTimers.delete(key);
      }
    }, actualDelay);

    debounceTimers.set(key, timer);
  });
};

// 디바운싱 타이머 정리
export const clearDebounceTimers = () => {
  debounceTimers.forEach(timer => clearTimeout(timer));
  debounceTimers.clear();
};
