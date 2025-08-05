<template>
  <div class="oauth-redirect">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">로그인 처리 중...</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    // URL에서 인가 코드 추출
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    console.log('Authorization code:', code)

    if (error) {
      console.error('OAuth error:', error)
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      router.push('/login')
      return
    }

    if (!code) {
      console.error('No authorization code received')
      alert('인증 코드를 받지 못했습니다. 다시 시도해주세요.')
      router.push('/login')
      return
    }

    // 백엔드로 인가 코드 전송하여 로그인 처리
    const { isNewUser, userData } = await authStore.login(code)
    console.log('Login result:', { isNewUser, userData })

    // 로그인 성공 후 라우팅
    if (isNewUser) {
      // 새 사용자인 경우 추가 정보 입력 페이지로 이동
      console.log('New user, redirecting to add-info page')
      router.push('/add-info')
    } else {
      // 기존 사용자인 경우 홈 화면으로 이동
      console.log('Existing user, redirecting to home page')
      router.push('/')
    }

  } catch (error) {
    console.error('Google OAuth redirect error:', error)
    alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    router.push('/login')
  }
})
</script>

<style scoped>
.oauth-redirect {
  min-height: 100vh;
  background: #f5f1e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "NotoSansKR", "Noto Sans", sans-serif;
}

.loading-container {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

.loading-text {
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
