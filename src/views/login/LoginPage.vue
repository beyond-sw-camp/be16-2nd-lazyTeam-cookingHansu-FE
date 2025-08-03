<template>
  <div class="login-page">
    <ProgressStep :step="1" />
    <div class="login-box">
      <div class="project-title">요리한수</div>
      <div class="subtitle">레시피 공유 & 강의 플랫폼</div>
      <div class="login-label">로그인</div>
      <button class="social-btn google" @click="socialLogin('google')">
        <img
          src="@/assets/images/loginbtn/web_light_sq_SI@4x.png"
          alt="Google Login"
          class="social_btn_img"
        />
      </button>
      <button class="social-btn kakao" @click="socialLogin('kakao')">
        <img
          src="@/assets/images/loginbtn/kakao_login_large_wide.png"
          alt="Kakao Login"
          class="social_btn_img"
        />
      </button>
      <button class="social-btn naver" @click="socialLogin('naver')">
        <img
          src="@/assets/images/loginbtn/btnG_완성형.png"
          alt="Naver Login"
          class="social_btn_img"
        />
      </button>
      <div class="admin-login">
        <button class="admin-link" @click="goAdmin">관리자</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import ProgressStep from "@/components/login/ProgressStep.vue";
import axios from "axios";
import {
  OAUTH_CONFIG,
  API_CONFIG,
  generateOAuthUrl,
} from "@/constants/oauth.js";

const router = useRouter();
const step = ref(1);
const data = ref({
  email: "",
  name: "",
  profileImage: "",
});

async function socialLogin(provider) {
  try {
    if (provider === "google") {
      // Google OAuth URL로 리다이렉트
      const oauthUrl = generateOAuthUrl("google");
      window.location.href = oauthUrl;
    } else {
      // 다른 소셜 로그인의 경우 기존 방식 사용
      const loginData = {
        provider: provider,
        email: data.value.email,
        name: data.value.name,
        profileImage: data.value.profileImage,
        ...OAUTH_CONFIG.GOOGLE,
      };

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        loginData
      );
      const token = response.data.token;
      localStorage.setItem("token", token);
      window.location.href = "/";
    }
  } catch (error) {
    console.error(`${provider} 로그인 오류:`, error);
    alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}

function goAdmin() {
  router.push("/admin-login");
}
</script>

<style scoped>
@import "../../assets/fonts/global.scss";
@import "../../assets/styles/layout.css";
.login-page {
  min-height: 100vh;
  background: #f5f1e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: "NotoSansKR", "Noto Sans", sans-serif;
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
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
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
/* 버튼 크기 조정 중... */
.social-btn {
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
.social-btn:active {
  filter: brightness(0.95);
}
.social_btn_img {
  max-width: 100%;
  max-height: 70px;
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
