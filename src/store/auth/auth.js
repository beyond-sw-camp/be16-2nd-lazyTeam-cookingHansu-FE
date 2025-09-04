import { defineStore } from 'pinia';
import { authService } from '@/services/auth/authService';
import { mypageService } from '@/services/mypage/mypageService';
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
        profileImageUrl: state.user?.picture, // 백엔드 DTO의 picture 필드 사용
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
          
          // 사용 제한된 회원인 경우 (user 객체 안의 loginStatus 확인)
          if (user && user.loginStatus === 'INACTIVE') {
            // 로그인 상태를 설정하지 않고 사용 제한 정보와 함께 특별한 객체 반환
            return { 
              isRestricted: true, 
              userInfo: { email: user.email, name: user.name } 
            };
          }
          
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
            // 사용자 정보 조회 실패는 무시
          }
          
          return user;
        } else {
          throw new Error(response.message || '로그인에 실패했습니다.');
        }
      } catch (error) {
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
              // 사용자 정보 조회 실패는 무시
            }
            
            // 인증된 사용자의 경우 알림 구독 시작
            try {
              const notificationStore = useNotificationStore();
              await notificationStore.requestNotificationPermission();
              notificationStore.startNotificationSubscription();
            } catch (error) {
              // 알림 구독 실패는 무시
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
                // 알림 구독 실패는 무시
              }
            } catch (error) {
              // 토큰 갱신 실패는 무시
            }
          }
        }
      } catch (error) {
        console.error('인증 초기화 실패:', error);
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
          const { accessToken, refreshToken, user, expiresIn, isDeleted, socialId, oauthType, email, name, picture } = response.data;
          
          // 사용 제한된 회원인 경우 (user 객체 안의 loginStatus 확인)
          if (user && user.loginStatus === 'INACTIVE') {
            // 로그인 상태를 설정하지 않고 사용 제한 정보와 함께 특별한 객체 반환
            return { 
              isRestricted: true, 
              userInfo: { socialId, oauthType, email, name, picture } 
            };
          }
          
          // 탈퇴한 회원인 경우
          if (isDeleted === true) {
            // 로그인 상태를 설정하지 않고 탈퇴한 회원 정보와 함께 특별한 객체 반환
            return { 
              isDeleted: true, 
              userInfo: { socialId, oauthType, email, name, picture } 
            };
          }
          
          this.setAuthData(accessToken, refreshToken, user, expiresIn, provider);
          
          // 최신 사용자 정보 조회
          try {
            await this.getCurrentUser();
          } catch (error) {
            // 사용자 정보 조회 실패는 무시
          }
          
          return user;
        } else {
          throw new Error(response.message || `${provider} 로그인에 실패했습니다.`);
        }
      } catch (error) {
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
          // 알림 구독 실패는 무시
        });
      } catch (error) {
        // 알림 구독 실패는 무시
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

        // 관리자 판단 로직 개선
        const isAdmin = this.provider === 'admin' && localStorage.getItem('adminAccessToken');
        const endpoint = isAdmin ? '/admin/refresh' : '/user/refresh';
        
        try {
          const response = await apiClient.post(endpoint, {
            refreshToken: this.refreshToken
          });
          
          // 응답 구조 처리 (관리자와 일반 사용자 응답 구조가 다를 수 있음)
          let accessToken, refreshToken;
          
          if (response.data.success && response.data.data) {
            // success: true, data: {...} 구조
            accessToken = response.data.data.accessToken;
            refreshToken = response.data.data.refreshToken;
          } else if (response.data.accessToken && response.data.refreshToken) {
            // 직접 토큰 데이터가 있는 구조
            accessToken = response.data.accessToken;
            refreshToken = response.data.refreshToken;
          } else if (response.data.success === false && response.data.message === 'Refresh token is required') {
            return; // 에러 없이 조용히 종료
          } else {
            throw new Error('Invalid response structure from server');
          }
          
          // 새로운 토큰으로 업데이트
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
          this.expiresIn = Date.now() + (3600 * 1000); // 1시간으로 설정
          
          // 로컬 스토리지 업데이트
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('expiresIn', this.expiresIn);
          
        } catch (adminError) {
          // 관리자 엔드포인트 실패 시 일반 사용자 엔드포인트로 폴백
          if (isAdmin && adminError.response?.status === 401) {
            
            const userResponse = await apiClient.post('/user/refresh', {
              refreshToken: this.refreshToken
            });
            
            if (userResponse.data.success && userResponse.data.data) {
              const { accessToken, refreshToken } = userResponse.data.data;
              
              // 새로운 토큰으로 업데이트
              this.accessToken = accessToken;
              this.refreshToken = refreshToken;
              this.expiresIn = Date.now() + (3600 * 1000);
              
              // 로컬 스토리지 업데이트
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', refreshToken);
              localStorage.setItem('expiresIn', this.expiresIn);
            } else {
              throw new Error('Invalid response structure from user refresh endpoint');
            }
          } else {
            throw adminError;
          }
        }
        
              } catch (error) {
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
          // 알림 구독 중지 실패는 무시
        }
        
        // 서버에 로그아웃 요청
        if (this.accessToken) {
          await authService.logout();
        }
      } catch (error) {
        // 로그아웃 요청 실패는 무시
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
        const response = await mypageService.deleteUser();
        
        if (response.success) {
          await this.logout();
          return { success: true, message: '회원 탈퇴가 완료되었습니다.' };
        } else {
          throw new Error(response.message || '회원 탈퇴에 실패했습니다.');
        }
      } catch (error) {
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
        
        const response = await authService.restoreUser(restoreData);
        
        if (response.success && response.data) {
          const { accessToken, refreshToken, user, expiresIn } = response.data;
          
          // 토큰 및 사용자 정보 저장
          this.setAuthData(accessToken, refreshToken, user, expiresIn, restoreData.oauthType.toLowerCase());
          
          // 최신 사용자 정보 조회
          try {
            await this.getCurrentUser();
          } catch (error) {
            // 사용자 정보 조회 실패는 무시
          }
          
          return { 
            success: true, 
            message: response.data.message || '회원 정보가 성공적으로 복원되었습니다.' 
          };
        } else {
          throw new Error(response.message || '회원 복구에 실패했습니다.');
        }
      } catch (error) {
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



    // 현재 로그인한 사용자 정보 조회 (/user/me 엔드포인트)
    async getCurrentUser() {
      try {
        if (!this.accessToken) {
          return null;
        }

        const response = await apiClient.get('/user/me');
        
        if (response.data.success && response.data.data) {
          this.user = response.data.data;
          localStorage.setItem('user', JSON.stringify(this.user));
          return response.data.data;
        } else {
          return null;
        }
      } catch (error) {
        throw error;
      }
    },
  },
});
