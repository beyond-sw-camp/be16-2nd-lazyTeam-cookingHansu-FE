<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 pa-8">
          <v-card-text class="text-center">
            <!-- 로딩 스피너 -->
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              color="primary"
              size="64"
              width="6"
              class="mb-6"
            ></v-progress-circular>
            

            
            <!-- 에러 아이콘 -->
            <v-icon
              v-else-if="error"
              color="error"
              size="64"
              class="mb-6"
            >
              mdi-alert-circle
            </v-icon>
            
            <!-- 로딩 메시지 -->
            <h2 class="text-h5 font-weight-bold mb-4">
              {{ getStatusMessage }}
            </h2>
            
            <!-- 상세 메시지 -->
            <p class="text-body-1 text-medium-emphasis mb-6">
              {{ getDetailMessage }}
            </p>
            
            <!-- 에러 메시지 -->
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-6"
            >
              {{ error }}
            </v-alert>
            
            <!-- 재시도 버튼 -->
            <v-btn
              v-if="error"
              color="primary"
              variant="elevated"
              size="large"
              @click="retryLogin"
              :loading="isLoading"
              class="mb-4"
            >
              다시 시도
            </v-btn>
            
            <!-- 홈으로 이동 버튼 -->
            <v-btn
              v-if="error"
              color="secondary"
              variant="outlined"
              size="large"
              @click="goHome"
            >
              홈으로 이동
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth/auth';

export default {
  name: 'GoogleRedirect',
  
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    // 반응형 상태
    const isLoading = ref(true);
    const error = ref(null);
    const authorizationCode = ref(null);
    
    // 상태에 따른 메시지 계산
    const getStatusMessage = computed(() => {
      if (error.value) return '로그인 실패';
      return '로그인 처리 중...';
    });
    
    const getDetailMessage = computed(() => {
      if (error.value) return 'Google 로그인 처리 중 오류가 발생했습니다.';
      return 'Google에서 받은 정보를 처리하고 있습니다.';
    });
    
    // URL에서 인가 코드 추출
    const extractAuthorizationCode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      if (error) {
        throw new Error(`Google OAuth Error: ${error}`);
      }
      
      if (!code) {
        throw new Error('인가 코드를 찾을 수 없습니다.');
      }
      
      return code;
    };
    
    // Google 로그인 처리
    const handleGoogleLogin = async () => {
      try {
        isLoading.value = true;
        error.value = null;
        
        // 구글 세션 정리 (중복 로그인 방지)
        clearGoogleSession();
        
        // 인가 코드 추출
        authorizationCode.value = extractAuthorizationCode();
        
        // 서버에 인가 코드 전송하여 로그인 처리
        const user = await authStore.handleGoogleLogin(authorizationCode.value);
        
        // handleGoogleLogin에서 탈퇴한 회원인 경우 특별한 객체를 반환하므로 체크
        if (user && user.isDeleted) {
          // 탈퇴한 회원인 경우 복구 페이지로 리다이렉트
          const encodedUserInfo = encodeURIComponent(JSON.stringify(user.userInfo));
          router.push(`/deleted-user-confirm/${encodedUserInfo}`);
          return;
        }
        
        // handleGoogleLogin에서 비활성화된 회원인 경우 특별한 객체를 반환하므로 체크
        if (user && user.isRestricted) {
          // 비활성화된 회원인 경우 로그인 정보 정리 후 비활성화 페이지로 리다이렉트
          authStore.clearAuth();
          router.push('/inactive-user');
          return;
        }
        
        // 사용자 상태에 따른 즉시 리다이렉트 (로그인 성공 표시 없이)
        // 백엔드에서 isNewUser 컬럼을 제거하고 DB 조회로 기존 사용자 판단
        // 프론트엔드에서는 사용자의 기본 프로필 정보 완성 여부로 판단
        if (authStore.isNewUser) {
          // 신규 사용자: 추가 정보 입력 페이지로 이동
          router.push('/add-info');
        } else {
          // 기존 사용자: 홈페이지로 이동
          router.push('/');
        }
        
      } catch (err) {
        console.error('Google login error:', err);
        error.value = err.message || 'Google 로그인에 실패했습니다.';
        isLoading.value = false;
      }
    };
    
    // 재시도 로그인
    const retryLogin = async () => {
      if (authorizationCode.value) {
        await handleGoogleLogin();
      } else {
        // 인가 코드가 없는 경우 Google 로그인 페이지로 다시 이동
        // 세션 정리 후 로그인 페이지로 이동
        clearGoogleSession();
        window.location.href = '/login';
      }
    };
    
    // 홈으로 이동
    const goHome = () => {
      router.push('/');
    };
    
    // 구글 세션 정리 함수
    const clearGoogleSession = () => {
      try {
        // 구글 관련 쿠키 정리
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name.includes('google') || name.includes('oauth') || name.includes('gsi')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
        
        // 로컬 스토리지 및 세션 스토리지 정리
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('google') || key.includes('oauth') || key.includes('gsi'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.includes('google') || key.includes('oauth') || key.includes('gsi'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        
      } catch (error) {
      }
    };
    
    // 컴포넌트 마운트 시 로그인 처리 시작
    onMounted(() => {
      handleGoogleLogin();
    });
    
    return {
      isLoading,
      error,
      getStatusMessage,
      getDetailMessage,
      retryLogin,
      goHome,
      clearGoogleSession,
    };
  },
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.v-card {
  border-radius: 16px;
}

.v-progress-circular {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
