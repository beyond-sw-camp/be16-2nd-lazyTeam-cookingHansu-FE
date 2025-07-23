<template>
  <div class="login-page">
    <ProgressStep :step="1" />
    <div class="login-box">
      <div class="project-title">요리한수</div>
      <div class="subtitle">레시피 공유 & 강의 플랫폼</div>
      <div class="login-label">로그인</div>
      <button class="social-btn google" @click="socialLogin('google')">
        <span class="icon">G</span> 구글로 계속하기
      </button>
      <button class="social-btn kakao" @click="socialLogin('kakao')">
        <span class="icon">카</span> 카카오로 계속하기
      </button>
      <button class="social-btn naver" @click="socialLogin('naver')">
        <span class="icon">N</span> 네이버로 계속하기
      </button>
      <div class="admin-login">
        <button class="admin-link" @click="goAdmin">관리자</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import ProgressStep from '@/components/login/ProgressStep.vue'

const router = useRouter()
const step = ref(1)

function socialLogin(type) {
  // 실제 로그인 로직은 추후 구현, 현재는 2단계 정보 입력 페이지로 이동
  router.push('/add-info')
}
function goAdmin() {
  router.push('/admin-login')
}
</script>

<style scoped>
@import '../../assets/fonts/global.scss';
@import '../../assets/styles/layout.css';
.login-page {
  min-height: 100vh;
  background: #F5F1E8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'NotoSansKR', 'Noto Sans', sans-serif;
}
.progress-indicator {
  display: flex;
  gap: 18px;
  margin-bottom: 32px;
  justify-content: center;
}
.progress-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-background);
  border: 2px solid #d3d3d3;
  color: #adb5bd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  transition: background 0.2s, color 0.2s, border 0.2s;
}
.progress-circle.active {
  background: var(--color-primary);
  color: var(--color-white);
  border: 2px solid var(--color-primary);
}
.login-box {
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 48px 32px 32px 32px;
  width: 100%;
  min-width: 350px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.project-title {
  color: var(--color-primary);
  font-weight: bold;
  font-size: 2rem;
  margin-bottom: 8px;
}
.subtitle {
  color: var(--color-text);
  font-size: 1rem;
  margin-bottom: 28px;
}
.login-label {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 24px;
}
.social-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  font-size: 1.08rem;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.15s;
}
.social-btn .icon {
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 12px;
}
.social-btn.google {
  background: #6B6E76;
  color: var(--color-white);
}
.social-btn.kakao {
  background: #FFD600;
  color: #222;
}
.social-btn.naver {
  background: #03C75A;
  color: var(--color-white);
}
.social-btn:active {
  filter: brightness(0.95);
}
.admin-login {
  margin-top: 18px;
  text-align: center;
}
.admin-link {
  background: none;
  border: none;
  color: #bdbdbd;
  font-size: 0.98rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
.admin-link:active {
  color: var(--color-text);
}
</style> 