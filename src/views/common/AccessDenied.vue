<template>
  <div class="access-denied-container">
    <div class="access-denied-content">
      <div class="icon-container">
        <v-icon size="80" color="error" class="mb-4">
          mdi-shield-alert
        </v-icon>
      </div>
      
      <h1 class="text-h4 font-weight-bold text-center mb-4">
        접근이 제한되었습니다
      </h1>
      
      <p class="text-body-1 text-center mb-6 text-medium-emphasis">
        일반 사용자 계정으로는 관리자 페이지에 접근할 수 없습니다.<br>
        관리자 권한이 필요한 경우 관리자 계정으로 로그인해주세요.
      </p>
      
      <div class="security-info mb-6">
        <v-card variant="outlined" class="pa-4">
          <div class="text-center">
            <v-icon color="warning" class="mb-2">mdi-shield-check</v-icon>
            <p class="text-body-2 text-medium-emphasis mb-0">
              이 접근 시도는 보안 로그에 기록됩니다.<br>
              의도하지 않은 접근인 경우 즉시 관리자에게 문의하세요.
            </p>
          </div>
        </v-card>
      </div>
      
      <div class="button-container">
        <v-btn
          color="primary"
          size="large"
          @click="goToHome"
          class="mr-4"
        >
          홈으로 돌아가기
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 접근 차단 로그 기록
onMounted(() => {
  const accessAttempt = {
    timestamp: new Date().toISOString(),
    userRole: authStore.getUserRole,
    userId: authStore.user?.id,
    attemptedPath: route.path,
    userAgent: navigator.userAgent,
    ip: 'client-side' // 클라이언트에서는 실제 IP를 알 수 없음
  }
  
  console.warn('Unauthorized access attempt detected:', accessAttempt)
  
  // 실제 프로덕션에서는 이 정보를 서버로 전송하여 보안 로그에 기록
  // await logSecurityEvent(accessAttempt)
})

// 홈으로 이동
const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.access-denied-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.access-denied-content {
  max-width: 600px;
  width: 100%;
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.icon-container {
  margin-bottom: 20px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .access-denied-content {
    padding: 40px 20px;
  }
  
  .button-container {
    flex-direction: column;
    align-items: center;
  }
  
  .button-container .v-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
