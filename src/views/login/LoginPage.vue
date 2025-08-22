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
      const oauthUrl = generateOAuthUrl("google");
      window.location.href = oauthUrl;
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
