import { defineStore } from 'pinia';
import { authService } from '@/services/auth/authService';
import { apiClient } from '@/utils/interceptor';
import { useNotificationStore } from '@/store/notification/notification';

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
    expiresIn: null,
    
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
      if (!state.accessToken || !state.expiresIn) return false;
      return Date.now() < state.expiresIn;
    },
    
    // 사용자 역할 확인
    getUserRole: (state) => state.user?.role || null,
    
    // 신규 사용자 여부
    isNewUser: (state) => {
      if (!state.user) return false;
      
      // 관리자 계정은 항상 신규 사용자가 아님
      if (state.user.role === 'admin') {
        return false;
      }
      
      if (!state.user.nickname || !state.user.role) {
        return true; // add-info 단계
      }
      
      // 역할별 상세 정보 확인
      switch (state.user.role) {
        case 'GENERAL':
          if (!state.user.generalType) {
            return true; // detail-user 단계
          }
          break;
        case 'CHEF':
          if (!state.user.chef || 
              !state.user.chef.licenseNumber || 
              !state.user.chef.cuisineType || 
              !state.user.chef.licenseUrl) {
            return true; // detail-cook 단계
          }
          break;
        case 'OWNER':
          if (!state.user.business || 
              !state.user.business.businessNumber || 
              !state.user.business.businessUrl || 
              !state.user.business.businessName || 
              !state.user.business.businessAddress || 
              !state.user.business.shopCategory) {
            return true; // detail-owner 단계
          }
          break;
      }
      
      return false; // 등록 완료
    },

    // 사용자 등록 완료 상태 확인
    isRegistrationComplete: (state) => {
      if (!state.user) return false;
      
      // 관리자 계정은 항상 등록 완료 상태
      if (state.user.role === 'admin') {
        return true;
      }
      
      // 공통 필수 정보 확인
      if (!state.user.nickname || !state.user.role) {
        return false;
      }
      
      // 역할별 필수 정보 확인
      switch (state.user.role) {
        case 'GENERAL':
          return state.user.generalType != null;
        case 'CHEF':
          return state.user.chef && 
                 state.user.chef.licenseNumber && 
                 state.user.chef.cuisineType && 
                 state.user.chef.licenseUrl;
        case 'OWNER':
          return state.user.business && 
                 state.user.business.businessNumber && 
                 state.user.business.businessUrl && 
                 state.user.business.businessName && 
                 state.user.business.businessAddress && 
                 state.user.business.shopCategory;
        default:
          return false;
      }
    },

    // 사용자가 어느 단계까지 등록했는지 확인
    getRegistrationStep: (state) => {
      if (!state.user) return 'none';
      
      // 관리자 계정은 항상 등록 완료 상태
      if (state.user.role === 'admin') {
        return 'complete';
      }
      
      // 기본 정보가 없으면 add-info 단계
      if (!state.user.nickname || !state.user.role) {
        return 'add-info';
      }
      
      // 역할별 상세 정보 확인
      switch (state.user.role) {
        case 'GENERAL':
          if (!state.user.generalType) {
            return 'detail-user';
          }
          break;
        case 'CHEF':
          if (!state.user.chef || 
              !state.user.chef.licenseNumber || 
              !state.user.chef.cuisineType || 
              !state.user.chef.licenseUrl) {
            return 'detail-cook';
          }
          break;
        case 'OWNER':
          if (!state.user.business || 
              !state.user.business.businessNumber || 
              !state.user.business.businessUrl || 
              !state.user.business.businessName || 
              !state.user.business.businessAddress || 
              !state.user.business.shopCategory) {
            return 'detail-owner';
          }
          break;
      }
      
      return 'complete';
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
          
          // 토큰 및 사용자 정보 저장 
          this.setAuthData(accessToken, refreshToken, user, expiresIn, 'local');
          
          // 최신 사용자 정보 조회
          try {
            await this.getCurrentUser();
          } catch (error) {
            console.error('Failed to get current user after local login:', error);
          }
          
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
        const savedExpiry = localStorage.getItem('expiresIn');
        const savedUser = localStorage.getItem('user');
        const savedProvider = localStorage.getItem('provider');
        
        if (savedAccessToken && savedRefreshToken && savedExpiry && savedUser) {
          const expiry = parseInt(savedExpiry);
          
          // 토큰이 아직 유효한 경우
          if (Date.now() < expiry) {
            this.accessToken = savedAccessToken;
            this.refreshToken = savedRefreshToken;
            this.expiresIn = expiry;
            this.user = JSON.parse(savedUser);
            this.provider = savedProvider || 'local';
            this.isAuthenticated = true;
            
            // 최신 사용자 정보 조회
            try {
              await this.getCurrentUser();
            } catch (error) {
              console.error('Failed to get current user during initialization:', error);
            }
            
            // 인증된 사용자의 경우 알림 구독 시작
            try {
              const notificationStore = useNotificationStore();
              await notificationStore.requestNotificationPermission();
              notificationStore.startNotificationSubscription();
            } catch (error) {
              console.warn('알림 구독 시작 실패:', error);
            }
          } else {
            // 토큰이 만료된 경우 자동 갱신 시도
            try {
              await this.refreshToken();
              
              // 토큰 갱신 성공 시 알림 구독 시작
              try {
                const notificationStore = useNotificationStore();
                await notificationStore.requestNotificationPermission();
                notificationStore.startNotificationSubscription();
              } catch (error) {
                console.warn('알림 구독 시작 실패:', error);
              }
            } catch (error) {
              console.warn('Token refresh failed during initialization:', error.message);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      }
    },

    // 통합된 소셜 로그인 처리
    async handleSocialLogin(provider, authorizationCode) {
      try {
        this.isLoading = true;
        this.error = null;
        
        let response;
        switch (provider) {
          case 'google':
            response = await authService.googleLogin(authorizationCode);
            break;
          case 'kakao':
            response = await authService.kakaoLogin(authorizationCode);
            break;
          case 'naver':
            response = await authService.naverLogin(authorizationCode);
            break;
          default:
            throw new Error(`지원하지 않는 소셜 로그인: ${provider}`);
        }
        
        if (response.success && response.data) {
          const { accessToken, refreshToken, user, expiresIn } = response.data;
          this.setAuthData(accessToken, refreshToken, user, expiresIn, provider);
          
          // 최신 사용자 정보 조회
          try {
            await this.getCurrentUser();
          } catch (error) {
            console.error(`Failed to get current user after ${provider} login:`, error);
          }
          
          return user;
        } else {
          throw new Error(response.message || `${provider} 로그인에 실패했습니다.`);
        }
      } catch (error) {
        console.error(`${provider} login failed:`, error);
        this.error = error.message || `${provider} 로그인에 실패했습니다.`;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Google OAuth 로그인 처리 (기존 호환성 유지)
    async handleGoogleLogin(authorizationCode) {
      return this.handleSocialLogin('google', authorizationCode);
    },

    // Kakao OAuth 로그인 처리 (기존 호환성 유지)
    async handleKakaoLogin(authorizationCode) {
      return this.handleSocialLogin('kakao', authorizationCode);
    },

    // Naver OAuth 로그인 처리 (기존 호환성 유지)
    async handleNaverLogin(authorizationCode) {
      return this.handleSocialLogin('naver', authorizationCode);
    },

    // 인증 데이터 설정
    setAuthData(accessToken, refreshToken, user, expiresIn, provider) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.expiresIn = expiresIn;
      this.user = user;
      this.isAuthenticated = true;
      this.provider = provider;
      
      // 토큰 만료 시간 설정 (현재 시간 + 만료 시간)
      this.expiresIn = Date.now() + (expiresIn * 1000);
      
      // 로컬 스토리지에 저장 (페이지 새로고침 시 복원용)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('expiresIn', this.expiresIn);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('provider', provider);
      
      // 사용자 역할 설정
      if (user && user.role) {
        localStorage.setItem('userRole', user.role);
      }
      
      // 로그인 성공 후 알림 구독 시작
      try {
        const notificationStore = useNotificationStore();
        notificationStore.requestNotificationPermission().then(() => {
          notificationStore.startNotificationSubscription();
        }).catch((error) => {
          console.warn('알림 구독 시작 실패:', error);
        });
      } catch (error) {
        console.warn('알림 구독 시작 실패:', error);
      }
    },

    // 관리자 인증 정보 설정 (AdminLoginStore에서 호출)
    setAdminAuth(authData) {
      this.user = authData.user;
      this.accessToken = authData.accessToken;
      this.refreshToken = authData.refreshToken;
      this.expiresIn = authData.expiresIn;
      this.isAuthenticated = true;
      this.provider = 'admin';
      
      // 로컬 스토리지에 저장
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      if (authData.expiresIn) {
        localStorage.setItem('expiresIn', authData.expiresIn);
      }
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('provider', 'admin');
      localStorage.setItem('userRole', 'ADMIN');
      localStorage.setItem('adminAccessToken', authData.accessToken);
    },

    // 토큰 갱신
    async refreshToken() {
      if (this.isRefreshing) {
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

        const response = await apiClient.post('/user/refresh', {
          refreshToken: this.refreshToken
        });
        
        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken } = response.data.data;
          
          // 새로운 토큰으로 업데이트
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
          this.expiresIn = Date.now() + (3600 * 1000); // 1시간으로 설정
          
          // 로컬 스토리지 업데이트
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('expiresIn', this.expiresIn);
        } else {
          throw new Error('Invalid response structure from server');
        }
        
      } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
      } finally {
        this.isRefreshing = false;
      }
    },

    // 로그아웃
    async logout() {
      try {
        // 알림 구독 중지
        try {
          const notificationStore = useNotificationStore();
          notificationStore.stopNotificationSubscription();
        } catch (error) {
          console.warn('알림 구독 중지 실패:', error);
        }
        
        // 서버에 로그아웃 요청
        if (this.accessToken) {
          await authService.logout();
        }
      } catch (error) {
        console.error('Logout request failed:', error);
      } finally {
        // 클라이언트 상태 정리
        if (!localStorage.getItem('adminAccessToken')) {
          this.clearAuth();
        }
      }
    },

    // 인증 상태 정리
    clearAuth() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      this.expiresIn = null;
      this.error = null;
      this.provider = null;
      
      // 로컬 스토리지 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('expiresIn');
      localStorage.removeItem('user');
      localStorage.removeItem('provider');
      localStorage.removeItem('userRole');
      localStorage.removeItem('adminAccessToken');
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

    // 백엔드에서 최신 프로필 정보 가져오기
    async fetchProfileInfo() {
      try {
        if (!this.accessToken) {
          console.warn('Access token not available');
          return null;
        }

        const response = await authService.getProfileInfo();
        
        if (response.success && response.data) {
          this.user = { ...this.user, ...response.data };
          localStorage.setItem('user', JSON.stringify(this.user));
          return response.data;
        } else {
          console.error('Failed to fetch profile info:', response.message);
          return null;
        }
      } catch (error) {
        console.error('Error fetching profile info:', error);
        return null;
      }
    },

    // 현재 로그인한 사용자 정보 조회 (/user/me 엔드포인트)
    async getCurrentUser() {
      try {
        if (!this.accessToken) {
          console.warn('Access token not available');
          return null;
        }

        const response = await apiClient.get('/user/me');
        
        if (response.data.success && response.data.data) {
          this.user = response.data.data;
          localStorage.setItem('user', JSON.stringify(this.user));
          return response.data.data;
        } else {
          console.error('Failed to get current user:', response.data.message);
          return null;
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
      }
    },
  },
});
