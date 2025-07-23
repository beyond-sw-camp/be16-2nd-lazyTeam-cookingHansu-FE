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
      <form @submit.prevent="onLogin" class="admin-login-form">
        <label class="admin-login-label" for="email">이메일</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="admin-login-input"
          placeholder="admin@cookingexpert.com"
          required
        />
        <label class="admin-login-label" for="password">비밀번호</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="admin-login-input"
          placeholder="비밀번호를 입력하세요"
          required
        />
        <router-link to="/admin-register" class="admin-login-register-link">관리자 회원가입</router-link>
        <button type="submit" class="admin-login-btn">로그인</button>
        <button type="button" class="admin-login-home-btn" @click="goBack()">
          ← 메인으로 돌아가기
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import router from '@/router'

const email = ref('')
const password = ref('')

function onLogin() {
  if (email.value === 'admin@cooking.com' && password.value === 'qwer1234') {
    router.push('/admin/dashboard')
  } else {
    alert('이메일 또는 비밀번호가 올바르지 않습니다.')
  }
}

function goBack() {
  router.push('/login')
}
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
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  padding: 48px 40px 40px 40px;
  width: 100%;
  min-width: 350px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto 0;
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

.admin-login-register-link {
  color: var(--color-primary);
  font-size: 0.95rem;
  margin-bottom: 8px;
  text-decoration: none;
  align-self: flex-start;
  transition: text-decoration 0.2s;
}
.admin-login-register-link:hover {
  text-decoration: underline;
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
}
.admin-login-btn:hover {
  background: #ff7b4a;
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
.admin-login-home-btn:hover {
  background: #f1f1f1;
}
</style> 