import { defineStore } from 'pinia';
import { API_CONFIG } from '@/constants/oauth';
import { authService } from '@/services/auth/authService';
import { userService } from '@/services/auth/userService';
import { apiGet } from '@/utils/api';
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
    
    // OAuth 원본 액세스 토큰 (소셜 연동 해제용)
    oauthAccessToken: null,
    
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

    // 회원 복구 관련 상태
    isRestoredUser: false,
    showRestoreModal: false,
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
      // 백엔드에서 isNewUser 컬럼을 제거했으므로
      // 사용자의 기본 프로필 정보가 완성되었는지 여부로 판단
      if (!state.user) return false;
      
      // 관리자 계정은 항상 신규 사용자가 아님
      if (state.user.role === 'admin') {
        return false;
      }
      
      // getRegistrationStep과 일치하도록 수정
      // getter 내에서 다른 getter를 호출할 때는 this를 사용해야 함
      // 하지만 state 파라미터만 사용할 수 있으므로 직접 로직을 구현
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
      
      // 공통 필수 정보 확인 (info는 선택사항이므로 체크하지 않음)
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
      
      // 기본 정보가 없으면 add-info 단계 (info는 선택사항이므로 체크하지 않음)
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
          const { accessToken, refreshToken, user, expiresIn, isRestored } = response.data;
          
          // 회원 복구 여부 확인
          if (isRestored) {
            this.isRestoredUser = true;
            this.showRestoreModal = true;
          }
          
          // 토큰 및 사용자 정보 저장 
          this.setAuthData(accessToken, refreshToken, user, expiresIn, 'local');
          
          // 최신 사용자 정보 조회
          try {
            await this.getCurrentUser();
          } catch (error) {
            console.error('Failed to get current user after local login:', error);
          }
          
          // 알림 구독은 initialize()에서 중앙 관리됨
          
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
        const savedOauthAccessToken = localStorage.getItem('oauthAccessToken');
        
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
            
            // OAuth 원본 액세스 토큰 복원
            if (savedOauthAccessToken) {
              this.oauthAccessToken = savedOauthAccessToken;
            }
            
            // 최신 사용자 정보 조회
            try {
              await this.getCurrentUser();
            } catch (error) {
              console.error('Failed to get current user during initialization:', error);
              // 사용자 정보 조회 실패 시에도 기본 정보는 유지
            }
            
            // 인증된 사용자의 경우 알림 구독 시작
            try {
              const notificationStore = useNotificationStore();
              await notificationStore.requestNotificationPermission();
              console.log('🔍 초기화 후 알림 구독 시작...');
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
                console.log('🔍 토큰 갱신 후 알림 구독 시작...');
                notificationStore.startNotificationSubscription();
              } catch (error) {
                console.warn('알림 구독 시작 실패:', error);
              }
            } catch (error) {
              console.warn('Token refresh failed during initialization:', error.message);
              // 토큰 갱신 실패 시에도 기본 정보는 유지
              // (refreshToken에서 logout 호출을 제거했으므로 자동으로 유지됨)
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // this.clearAuth();
        // 에러가 발생해도 clearAuth는 호출하지 않음 (사용자 경험 개선)
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
        
        // 탈퇴한 회원인지 확인
        if (responseData.data && responseData.data.isDeleted) {
          // 탈퇴한 회원인 경우 확인 페이지로 리다이렉트
          const userInfo = encodeURIComponent(JSON.stringify(responseData.data));
          // replace를 사용하여 브라우저 히스토리에서 리다이렉트 페이지를 제거
          window.location.replace(`/deleted-user-confirm/${userInfo}`);
          return null;
        }
        
        const { accessToken, refreshToken, user, expiresIn, isRestored, oauthAccessToken } = responseData.data;

        // 회원 복구 여부 확인
        if (isRestored) {
          this.isRestoredUser = true;
          this.showRestoreModal = true;
        }

        // OAuth 원본 액세스 토큰 저장
        if (oauthAccessToken) {
          this.oauthAccessToken = oauthAccessToken;
          localStorage.setItem('oauthAccessToken', oauthAccessToken);
        }

        // 토큰 및 사용자 정보 저장 (Google 제공자로 설정)
        this.setAuthData(accessToken, refreshToken, user, expiresIn, 'google', oauthAccessToken);
        
        // 최신 사용자 정보 조회
        try {
          await this.getCurrentUser();
        } catch (error) {
          console.error('Failed to get current user after Google login:', error);
        }
        
        // 알림 구독은 initialize()에서 중앙 관리됨
        
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
        
        // 탈퇴한 회원인지 확인
        if (responseData.data && responseData.data.isDeleted) {
          // 탈퇴한 회원인 경우 확인 페이지로 리다이렉트
          const userInfo = encodeURIComponent(JSON.stringify(responseData.data));
          // replace를 사용하여 브라우저 히스토리에서 리다이렉트 페이지를 제거
          window.location.replace(`/deleted-user-confirm/${userInfo}`);
          return null;
        }
        
        const { accessToken, refreshToken, user, expiresIn, isRestored, oauthAccessToken } = responseData.data;

        // 회원 복구 여부 확인
        if (isRestored) {
          this.isRestoredUser = true;
          this.showRestoreModal = true;
        }

        // OAuth 원본 액세스 토큰 저장
        if (oauthAccessToken) {
          this.oauthAccessToken = oauthAccessToken;
          localStorage.setItem('oauthAccessToken', oauthAccessToken);
        }

        // 토큰 및 사용자 정보 저장 (Kakao 제공자로 설정)
        this.setAuthData(accessToken, refreshToken, user, expiresIn, 'kakao', oauthAccessToken);
        
        // 최신 사용자 정보 조회
        try {
          await this.getCurrentUser();
        } catch (error) {
          console.error('Failed to get current user after Kakao login:', error);
        }
        
        // 알림 구독은 initialize()에서 중앙 관리됨
        
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
        
        // 탈퇴한 회원인지 확인
        if (responseData.data && responseData.data.isDeleted) {
          // 탈퇴한 회원인 경우 확인 페이지로 리다이렉트
          const userInfo = encodeURIComponent(JSON.stringify(responseData.data));
          // replace를 사용하여 브라우저 히스토리에서 리다이렉트 페이지를 제거
          window.location.replace(`/deleted-user-confirm/${userInfo}`);
          return null;
        }
        
        const { accessToken, refreshToken, user, expiresIn, isRestored, oauthAccessToken } = responseData.data;

        // 회원 복구 여부 확인
        if (isRestored) {
          this.isRestoredUser = true;
          this.showRestoreModal = true;
        }

        // OAuth 원본 액세스 토큰 저장
        if (oauthAccessToken) {
          this.oauthAccessToken = oauthAccessToken;
          localStorage.setItem('oauthAccessToken', oauthAccessToken);
        }

        // 토큰 및 사용자 정보 저장 (Naver 제공자로 설정)
        this.setAuthData(accessToken, refreshToken, user, expiresIn, 'naver', oauthAccessToken);
        
        // 최신 사용자 정보 조회
        try {
          await this.getCurrentUser();
        } catch (error) {
          console.error('Failed to get current user after Naver login:', error);
        }
        
        // 알림 구독은 initialize()에서 중앙 관리됨
        
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
    setAuthData(accessToken, refreshToken, user, expiresIn, provider, oauthAccessToken = null) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.expiresIn = expiresIn;
      this.user = user;
      this.isAuthenticated = true;
      this.provider = provider;
      
      // OAuth 원본 액세스 토큰 저장
      if (oauthAccessToken) {
        this.oauthAccessToken = oauthAccessToken;
        localStorage.setItem('oauthAccessToken', oauthAccessToken);
      }
      
      // 토큰 만료 시간 설정 (현재 시간 + 만료 시간)
      this.expiresIn = Date.now() + (expiresIn * 1000);
      
      // 로컬 스토리지에 저장 (페이지 새로고침 시 복원용)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('expiresIn', this.expiresIn);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('provider', provider);
      
      // 사용자 역할 설정 (user 객체에서 role 추출)
      if (user && user.role) {
        localStorage.setItem('userRole', user.role);
        console.log('🔍 사용자 역할 설정:', user.role);
      }
      
      // 로그인 성공 후 알림 구독 시작
      try {
        const notificationStore = useNotificationStore();
        notificationStore.requestNotificationPermission().then(() => {
          console.log('🔍 로그인 후 알림 구독 시작...');
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
      
      console.log('🔍 관리자 인증 정보 설정 완료');
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

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
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
        this.expiresIn = Date.now() + (3600 * 1000); // 1시간으로 설정
        
        // 로컬 스토리지 업데이트
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('expiresIn', this.expiresIn);
        
      } catch (error) {
        console.error('Token refresh failed:', error);
        // 토큰 갱신 실패 시에도 로그아웃하지 않음 (사용자 경험 개선)
        // await this.logout(); // 이 줄 제거
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
        // 관리자 로그인 상태가 아닌 경우에만 clearAuth 호출
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
      this.oauthAccessToken = null;
      
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

    // 회원 탈퇴 (soft delete)
    async deleteUser() {
      try {
        this.isLoading = true;
        this.error = null;
        
        // accessToken이 없는 경우 에러 처리
        if (!this.accessToken) {
          throw new Error('인증 토큰을 찾을 수 없습니다.');
        }
        
        // 통합된 회원 탈퇴 API 호출
        const response = await userService.deleteUser();
        
        if (response.success) {
          await this.logout();
          return { success: true, message: '회원 탈퇴가 완료되었습니다.' };
        } else {
          throw new Error(response.message || '회원 탈퇴에 실패했습니다.');
        }
      } catch (error) {
        console.error('User deletion failed:', error);
        this.error = error.message || '회원 탈퇴에 실패했습니다.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 회원 복구
    async restoreUser(restoreData) {
      try {
        this.isLoading = true;
        this.error = null;
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESTORE_USER}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(restoreData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        if (responseData.success && responseData.data) {
          const { accessToken, refreshToken, user, expiresIn } = responseData.data;
          
          // 토큰 및 사용자 정보 저장
          this.setAuthData(accessToken, refreshToken, user, expiresIn, restoreData.oauthType.toLowerCase());
          
          // 최신 사용자 정보 조회
          try {
            await this.getCurrentUser();
          } catch (error) {
            console.error('Failed to get current user after restore:', error);
          }
          
          return { 
            success: true, 
            message: responseData.data.message || '회원 정보가 성공적으로 복원되었습니다.' 
          };
        } else {
          throw new Error(responseData.message || '회원 복구에 실패했습니다.');
        }
      } catch (error) {
        console.error('User restoration failed:', error);
        this.error = error.message || '회원 복구에 실패했습니다.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 회원 복구 모달 닫기
    closeRestoreModal() {
      this.showRestoreModal = false;
      this.isRestoredUser = false;
    },

    // 회원 복구 상태 초기화
    resetRestoreState() {
      this.isRestoredUser = false;
      this.showRestoreModal = false;
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
          // 사용자 정보 업데이트
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

        const response = await apiGet('/user/me');
        
        if (!response.ok) {
          if (response.status === 401) {
            // 토큰이 유효하지 않은 경우
            this.clearAuth();
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        
        if (responseData.success && responseData.data) {
          // 사용자 정보 업데이트
          this.user = responseData.data;
          localStorage.setItem('user', JSON.stringify(this.user));
          return responseData.data;
        } else {
          console.error('Failed to get current user:', responseData.message);
          return null;
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
      }
    },
  },
});
