import { defineStore } from 'pinia';
import axios from 'axios';
import { API_CONFIG } from '@/constants/oauth';

// Auth 관련 상태 관리 스토어
// OAuth2 소셜 로그인 기반의 토큰 관리, 로그인 상태 관리, 사용자 정보 관리
// 토큰 만료 시간 체크, 토큰 갱신, 로그아웃 처리
// 페이지 새로고침 시 로그인 상태 복원
// Axios 인터셉터 설정 - 401 에러 시 자동 refresh

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 사용자 정보
    user: null,
    
    // JWT 토큰 (메모리에 저장)
    accessToken: null,
    
    // 로그인 상태
    isAuthenticated: false,
    
    // 로딩 상태
    isLoading: false,
    
    // 에러 상태
    error: null,
    
    // 토큰 갱신 중인지 여부
    isRefreshing: false,
    
    // 토큰 만료 시간 (밀리초)
    tokenExpiry: null,
  }),

  getters: {
    // 사용자 정보 getter
    getUser: (state) => state.user,
    
    // 로그인 상태 getter
    getIsAuthenticated: (state) => state.isAuthenticated,
    
    // 로딩 상태 getter
    getIsLoading: (state) => state.isLoading,
    
    // 에러 상태 getter
    getError: (state) => state.error,
    
    // 토큰이 유효한지 확인
    isTokenValid: (state) => {
      if (!state.accessToken || !state.tokenExpiry) return false;
      return Date.now() < state.tokenExpiry;
    },
    
    // 사용자 역할 확인
    getUserRole: (state) => state.user?.role || null,
    
    // 신규 사용자 여부
    isNewUser: (state) => {
      console.log('Checking newUser - user:', state.user);
      console.log('Checking newUser - user.newUser:', state.user?.newUser);
      return state.user?.newUser === true;
    },
  },

  actions: {
    // 초기화 - 페이지 새로고침 시 로그인 상태 복원
    async initialize() {
      try {
        // 로컬 스토리지에서 토큰 정보 복원
        const savedToken = localStorage.getItem('accessToken');
        const savedExpiry = localStorage.getItem('tokenExpiry');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedExpiry && savedUser) {
          const expiry = parseInt(savedExpiry);
          
          // 토큰이 아직 유효한 경우
          if (Date.now() < expiry) {
            this.accessToken = savedToken;
            this.tokenExpiry = expiry;
            this.user = JSON.parse(savedUser);
            this.isAuthenticated = true;
            
            // Axios 기본 헤더 설정
            this.setupAxiosHeaders();
          } else {
            // 토큰이 만료된 경우 자동 갱신 시도
            await this.refreshToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        this.clearAuth();
      }
    },

    // Google OAuth 로그인 처리
    async handleGoogleLogin(authorizationCode) {
      try {
        this.isLoading = true;
        this.error = null;
        
        const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GOOGLE_LOGIN}`, {
          code: authorizationCode
        });
        
        const { data: { accessToken, user, expiresIn } } = response.data;

        // 토큰 및 사용자 정보 확인
        console.log('accessToken:', accessToken);
        console.log('user object:', user);
        console.log('user.newUser:', user?.newUser);
        
        // 토큰 및 사용자 정보 저장
        this.setAuthData(accessToken, user, expiresIn);
        
        return user;
      } catch (error) {
        console.error('Google login failed:', error);
        this.error = error.response?.data?.message || 'Google 로그인에 실패했습니다.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 인증 데이터 설정
    setAuthData(accessToken, user, expiresIn) {
      this.accessToken = accessToken;
      this.user = user;
      this.isAuthenticated = true;
      
      // 토큰 만료 시간 설정 (현재 시간 + 만료 시간)
      this.tokenExpiry = Date.now() + (expiresIn * 1000);
      
      // 로컬 스토리지에 저장 (페이지 새로고침 시 복원용)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('tokenExpiry', this.tokenExpiry.toString());
      localStorage.setItem('user', JSON.stringify(user));

      console.log('Setting auth data - accessToken:', accessToken);
      console.log('Setting auth data - user:', user);
      console.log('Setting auth data - user.newUser:', user?.newUser);
      
      // Axios 기본 헤더 설정
      this.setupAxiosHeaders();
    },

    // Axios 헤더 설정
    setupAxiosHeaders() {
      if (this.accessToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
      }
    },

    // 토큰 갱신
    async refreshToken() {
      if (this.isRefreshing) {
        // 이미 갱신 중인 경우 대기
        return new Promise((resolve) => {
          const checkRefreshing = setInterval(() => {
            if (!this.isRefreshing) {
              clearInterval(checkRefreshing);
              resolve();
            }
          }, 100);
        });
      }
      
      try {
        this.isRefreshing = true;
        
        const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GOOGLE_REFRESH}`, {}, {
          withCredentials: true // 쿠키 포함
        });
        
        const { accessToken, expiresIn } = response.data;
        
        // 새로운 토큰으로 업데이트
        this.accessToken = accessToken;
        this.tokenExpiry = Date.now() + (expiresIn * 1000);
        
        // 로컬 스토리지 업데이트
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('tokenExpiry', this.tokenExpiry.toString());
        
        // Axios 헤더 업데이트
        this.setupAxiosHeaders();
        
      } catch (error) {
        console.error('Token refresh failed:', error);
        // 토큰 갱신 실패 시 로그아웃
        await this.logout();
        throw error;
      } finally {
        this.isRefreshing = false;
      }
    },

    // 로그아웃
    async logout() {
      try {
        // 서버에 로그아웃 요청
        if (this.accessToken) {
          await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {}, {
            withCredentials: true
          });
        }
      } catch (error) {
        console.error('Logout request failed:', error);
      } finally {
        // 클라이언트 상태 정리
        this.clearAuth();
      }
    },

    // 인증 상태 정리
    clearAuth() {
      this.user = null;
      this.accessToken = null;
      this.isAuthenticated = false;
      this.tokenExpiry = null;
      this.error = null;
      
      // 로컬 스토리지 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      
      // Axios 헤더 정리
      delete axios.defaults.headers.common['Authorization'];
    },

    // 에러 설정
    setError(error) {
      this.error = error;
    },

    // 에러 초기화
    clearError() {
      this.error = null;
    },

    // 사용자 정보 업데이트 (추가 정보 입력 후)
    updateUserInfo(userInfo) {
      this.user = { ...this.user, ...userInfo };
      localStorage.setItem('user', JSON.stringify(this.user));
    },
  },
});

// Axios 인터셉터 설정
export const setupAuthInterceptors = (authStore) => {
  // 요청 인터셉터
  axios.interceptors.request.use(
    (config) => {
      // 토큰이 유효하지 않으면 갱신 시도
      if (authStore.isAuthenticated && !authStore.isTokenValid && !authStore.isRefreshing) {
        authStore.refreshToken();
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // 401 에러이고 토큰 갱신을 시도하지 않은 경우
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          await authStore.refreshToken();
          // 토큰 갱신 후 원래 요청 재시도
          originalRequest.headers['Authorization'] = `Bearer ${authStore.accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃
          await authStore.logout();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};
