<template>
  <LoginLayout
    title="요리한수"
    subtitle="레시피 공유 & 강의 플랫폼"
    :show-back-link="false"
  >
    <template #progress>
      <ProgressStep :step="1" />
    </template>

    <div class="login-content">
      <div class="login-label">로그인</div>
        <div class="login-btn-container">
        <button class="social-btn google" @click="socialLogin('google')">
          <img
            src="@/assets/images/loginbtn/web_light_sq_SI@2x.png"
            alt="Google Login"
            class="social_btn_img"
          />
        </button>
        <button class="social-btn kakao" @click="socialLogin('kakao')">
          <img
            src="@/assets/images/loginbtn/kakao_login_large_narrow.png"
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
      </div>
      <div class="admin-login">
        <button class="admin-link" @click="goAdmin">관리자 로그인</button>
      </div>
    </div>
  </LoginLayout>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import ProgressStep from "@/components/login/ProgressStep.vue";
import LoginLayout from "@/components/login/LoginLayout.vue";
import { authService } from "@/services/auth/authService";
import { generateOAuthUrl } from "@/constants/oauth.js";

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
      // Google OAuth URL로 리다이렉트 (인가 코드 방식)
      // 브라우저 캐싱 문제 해결을 위한 추가 처리
      const oauthUrl = generateOAuthUrl("google");
      
      // 구글 계정 선택 문제 해결을 위한 추가 처리
      // 1. 기존 구글 관련 쿠키/세션 정리
      clearGoogleSession();
      
      // 2. OAuth URL에 타임스탬프 추가하여 캐시 무효화
      const timestamp = Date.now();
      const finalUrl = `${oauthUrl}&_t=${timestamp}`;
      
      // 3. 새 창에서 열거나 기존 창에서 이동
      window.location.href = finalUrl;
    } else if (provider === "kakao") {
      const oauthUrl = generateOAuthUrl("kakao");
      window.location.href = oauthUrl;
    } else if (provider === "naver") {
      const oauthUrl = generateOAuthUrl("naver");
      window.location.href = oauthUrl;
    }
  } catch (error) {
    console.error(`${provider} 로그인 오류:`, error);
    alert(error.message || "로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}

// 구글 세션 정리 함수
function clearGoogleSession() {
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
    console.warn('Google 세션 정리 중 오류:', error);
  }
}

function goAdmin() {
  router.push("/admin-login");
}
</script>

<style scoped>
@import "../../assets/fonts/global.scss";
@import "../../assets/styles/layout.css";

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-label {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 24px;
}

.login-btn-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.social-btn {
  border: none;
  border-radius: 8px;
  font-size: 1.08rem;
  font-weight: 500;
  margin-bottom: 16px;
  cursor: pointer;
  transition: filter 0.15s;
}

.social-btn:active {
  filter: brightness(0.95);
}

.social_btn_img {
  width: 20rem;
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
