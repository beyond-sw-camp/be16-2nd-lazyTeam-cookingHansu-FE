<template>
  <div class="admin-login-bg">
    <div class="admin-login-container">
      <div class="shield-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 6L40 12V22C40 33.0457 32.2843 39.3172 24 42C15.7157 39.3172 8 33.0457 8 22V12L24 6Z" stroke="var(--color-primary)" stroke-width="3" fill="none"/>
        </svg>
      </div>
      <h2 class="admin-login-title">관리자 로그인</h2>
      <p class="admin-login-subtitle">관리자 계정으로 로그인하세요</p>
      
      <!-- 에러 메시지 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="onLogin" class="admin-login-form">
        <label class="admin-login-label" for="email">이메일</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="admin-login-input"
          placeholder="admin@cookingexpert.com"
          required
          :disabled="isLoading"
        />
        <label class="admin-login-label" for="password">비밀번호</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="admin-login-input"
          placeholder="비밀번호를 입력하세요"
          required
          :disabled="isLoading"
        />
        <button 
          type="submit" 
          class="admin-login-btn"
          @click="onLogin" 
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-content">
            <div class="spinner"></div>
            로그인 중...
          </span>
          <span v-else>로그인</span>
        </button>
        <button 
          type="button" 
          class="admin-login-home-btn" 
          @click="goBack()"
          :disabled="isLoading"
        >
          ← 메인으로 돌아가기
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAdminLoginStore } from '@/store/admin/adminLogin'
import router from '@/router'

const adminLoginStore = useAdminLoginStore()
const email = ref('')
const password = ref('')

// 스토어에서 상태 가져오기
const isLoading = computed(() => adminLoginStore.isLoading)
const error = computed(() => adminLoginStore.error)

async function onLogin() {
  try {
    await adminLoginStore.login(email.value, password.value)
    // 로그인 성공 시 대시보드로 이동 (스토어에서 처리됨)
  } catch (error) {
    // 에러는 스토어에서 처리됨
    console.error('로그인 실패:', error)
  }
}

function goBack() {
  router.push('/login')
}

// 컴포넌트 마운트 시 스토어 초기화
onMounted(() => {
  adminLoginStore.initialize()
})
</script>

<style scoped>
@import '@/assets/fonts/global.scss';

.admin-login-bg {
  min-height: 100vh;
  background: #F5F1E8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-login-container {
    background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 48px 32px 32px 32px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 20px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  max-height: calc(100vh - 40px);
  transition: box-shadow 0.2s;
}

.shield-icon {
  margin-bottom: 16px;
}

.admin-login-title {
  font-family: 'NotoSansKR', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
  text-align: center;
}

.admin-login-subtitle {
  font-size: 1rem;
  color: var(--color-text);
  margin-bottom: 32px;
  text-align: center;
}

.admin-login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-login-label {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 4px;
}

.admin-login-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 12px;
  background: var(--color-background);
  font-family: 'NotoSansKR', sans-serif;
}

.admin-login-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.admin-login-btn {
  width: 100%;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.admin-login-btn:hover:not(:disabled) {
  background: #ff7b4a;
}

.admin-login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.admin-login-home-btn {
  width: 100%;
  background: var(--color-white);
  color: var(--color-text);
  font-size: 1.05rem;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.2s;
}

.admin-login-home-btn:hover:not(:disabled) {
  background: #f1f1f1;
}

.admin-login-home-btn:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 0.9rem;
  border: 1px solid #ffcdd2;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 