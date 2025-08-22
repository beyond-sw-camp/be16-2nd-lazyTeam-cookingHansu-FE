<template>
  <v-container class="registration-complete-page" fluid>
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="complete-card" elevation="8">
          <v-card-text class="text-center pa-8">
            <!-- 축포 아이콘 -->
            <div class="icon-wrapper mb-6">
              <v-icon size="80" color="primary" class="celebration-icon">
                mdi-party-popper
              </v-icon>
            </div>
            
            <!-- 제목 -->
            <h1 class="text-h4 font-weight-bold primary--text mb-4">
              {{ pageTitle }}
            </h1>
            
            <!-- 메시지 -->
            <div class="message-content mb-6">
              <p class="text-body-1 mb-3">
                {{ mainMessage }}
              </p>
              <p class="text-caption text-medium-emphasis">
                {{ subMessage }}
              </p>
            </div>
            
            <!-- 버튼 -->
            <v-btn
              color="primary"
              size="large"
              rounded
              @click="goHome"
              class="px-8"
            >
              메인 페이지로 이동
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
  
<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth/auth';

const router = useRouter();
const authStore = useAuthStore();

// 사용자 역할에 따른 페이지 내용 계산
const pageTitle = computed(() => {
  const role = authStore.getUserRole;
  switch (role) {
    case 'CHEF':
      return '요식업 종사자 등록 완료!';
    case 'OWNER':
      return '요식업 자영업자 등록 완료!';
    default:
      return '등록을 완료했습니다!';
  }
});

const mainMessage = computed(() => {
  const role = authStore.getUserRole;
  switch (role) {
    case 'CHEF':
      return '요식업 종사자로 회원 등록이 완료되었습니다.';
    case 'OWNER':
      return '요식업 자영업자로 회원 등록이 완료되었습니다.';
    default:
      return '회원가입이 성공적으로 완료되었습니다.';
  }
});

const subMessage = computed(() => {
  const role = authStore.getUserRole;
  switch (role) {
    case 'CHEF':
    case 'OWNER':
      return '관리자 승인까지 권한이 제한됩니다. 승인 완료 시 모든 서비스를 이용할 수 있습니다.';
    default:
      return '이제 요리한수의 모든 서비스를 이용할 수 있습니다.';
  }
});

async function goHome() {
  try {
    // 메인 페이지로 이동하기 전에 최신 사용자 정보를 가져와서 등록 상태를 업데이트
    await authStore.getCurrentUser();
    router.push('/');
  } catch (error) {
    console.error('Failed to get current user:', error);
    // 에러가 발생해도 메인 페이지로 이동
    router.push('/');
  }
}
</script>

<style scoped>
@import '../../assets/fonts/global.scss';
@import '../../assets/styles/layout.css';

.registration-complete-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #F5F1E8 0%, #E8F4F8 100%);
}

.complete-card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.celebration-icon {
  animation: bounce 2s infinite;
}

.message-content {
  max-width: 400px;
  margin: 0 auto;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .complete-card {
    margin: 16px;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>
  