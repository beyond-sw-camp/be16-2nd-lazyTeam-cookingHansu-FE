import { defineStore } from 'pinia';
import { API_CONFIG } from '@/constants/oauth';
import { authService } from '@/services/auth/authService';

// Auth 관련 상태 관리 스토어
// OAuth2 소셜 로그인 기반의 토큰 관리, 로그인 상태 관리, 사용자 정보 관리
// 토큰 만료 시간 체크, 토큰 갱신, 로그아웃 처리
// 페이지 새로고침 시 로그인 상태 복원

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 사용자 정보
    user: null,
    
    // JWT 토큰 (메모리에 저장)
    accessToken: null,
    refreshToken: null,
    
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
    
    // 로그인 제공자 (google, kakao, naver, local)
    provider: null,
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
      return state.user?.newUser === true;
    },

    // 헤더에 렌더링할 사용자 정보 getter
    getProfileInfo: (state) => {
      return {
        nickname: state.user?.nickname, 
        profileImageUrl: state.user?.profileImageUrl,
      };
    }
  },

  actions: {
    // 일반 로그인 처리
    async handleLocalLogin(loginData) {
      try {
        this.isLoading = true;
        this.error = null;
        
        const response = await authService.login(loginData);
        
        if (response.success && response.data) {
          const { accessToken, refreshToken, user, expiresIn } = response.data;
          
          // 토큰 및 사용자 정보 저장 (local 제공자로 설정)
          this.setAuthData(accessToken, refreshToken, user, expiresIn, 'local');
          
          return user;
        } else {
          throw new Error(response.message || '로그인에 실패했습니다.');
        }
      } catch (error) {
        console.error('Local login failed:', error);
        this.error = error.message || '로그인에 실패했습니다.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 초기화 - 페이지 새로고침 시 로그인 상태 복원
    async initialize() {
      try {
        // 로컬 스토리지에서 토큰 정보 복원
        const savedAccessToken = localStorage.getItem('accessToken');
        const savedRefreshToken = localStorage.getItem('refreshToken');
        const savedExpiry = localStorage.getItem('tokenExpiry');
        const savedUser = localStorage.getItem('user');
        const savedProvider = localStorage.getItem('provider');
        
        if (savedAccessToken && savedRefreshToken && savedExpiry && savedUser) {
          const expiry = parseInt(savedExpiry);
          
          // 토큰이 아직 유효한 경우
          if (Date.now() < expiry) {
            this.accessToken = savedAccessToken;
            this.refreshToken = savedRefreshToken;
            this.tokenExpiry = expiry;
            this.user = JSON.parse(savedUser);
            this.provider = savedProvider || 'local';
            this.isAuthenticated = true;
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
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GOOGLE_LOGIN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: authorizationCode })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        const { accessToken, refreshToken, user, expiresIn } = responseData.data;

        // 토큰 및 사용자 정보 저장 (Google 제공자로 설정)
        this.setAuthData(accessToken, refreshToken, user, expiresIn, 'google');
        
        return user;
      } catch (error) {
        console.error('Google login failed:', error);
        this.error = error.message || 'Google 로그인에 실패했습니다.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Kakao OAuth 로그인 처리
    async handleKakaoLogin(authorizationCode) {
      try {
        this.isLoading = true;
        this.error = null;
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.KAKAO_LOGIN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: authorizationCode })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        const { accessToken, refreshToken, user, expiresIn } = responseData.data;

        // 토큰 및 사용자 정보 저장 (Kakao 제공자로 설정)
        this.setAuthData(accessToken, refreshToken, user, expiresIn, 'kakao');
        
        return user;
      } catch (error) {
        console.error('Kakao login failed:', error);
        this.error = error.message || 'Kakao 로그인에 실패했습니다.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Naver OAuth 로그인 처리
    async handleNaverLogin(authorizationCode) {
      try {
        this.isLoading = true;
        this.error = null;
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NAVER_LOGIN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: authorizationCode })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        const { accessToken, refreshToken, user, expiresIn } = responseData.data;

        // 토큰 및 사용자 정보 저장 (Naver 제공자로 설정)
        this.setAuthData(accessToken, refreshToken, user, expiresIn, 'naver');
        
        return user;
      } catch (error) {
        console.error('Naver login failed:', error);
        this.error = error.message || 'Naver 로그인에 실패했습니다.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 인증 데이터 설정
    setAuthData(accessToken, refreshToken, user, expiresIn, provider = 'local') {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.user = user;
      this.isAuthenticated = true;
      this.provider = provider;
      
      // 토큰 만료 시간 설정 (현재 시간 + 만료 시간)
      this.tokenExpiry = Date.now() + (expiresIn * 1000);
      
      // 로컬 스토리지에 저장 (페이지 새로고침 시 복원용)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiry', this.tokenExpiry.toString());
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('provider', provider);
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
        
        if (!this.refreshToken) {
          throw new Error('Refresh token not found');
        }

        // 제공자에 따라 적절한 엔드포인트 선택
        let refreshEndpoint;
        if (this.provider === 'google') {
          refreshEndpoint = API_CONFIG.ENDPOINTS.GOOGLE_REFRESH;
        } else if (this.provider === 'kakao') {
          refreshEndpoint = API_CONFIG.ENDPOINTS.KAKAO_REFRESH;
        } else if (this.provider === 'naver') {
          refreshEndpoint = API_CONFIG.ENDPOINTS.NAVER_REFRESH;
        } 
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${refreshEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: this.refreshToken })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        // const { accessToken, refreshToken } = responseData.data;

        if (!responseData.data || !responseData.data.accessToken || !responseData.data.refreshToken) {
          throw new Error('Invalid response structure from server');
        }

        const { accessToken, refreshToken } = responseData.data;
        
        // 새로운 토큰으로 업데이트
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = Date.now() + (3600 * 1000); // 1시간으로 설정
        
        // 로컬 스토리지 업데이트
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('tokenExpiry', this.tokenExpiry.toString());
        
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
          await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            }
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
      this.refreshToken = null;
      this.isAuthenticated = false;
      this.tokenExpiry = null;
      this.error = null;
      this.provider = null;
      
      // 로컬 스토리지 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      localStorage.removeItem('provider');
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
