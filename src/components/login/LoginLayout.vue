<template>
  <div class="login-layout">
    <div class="top-bar" v-if="showBackLink">
      <span class="back-link" @click="showGoHomeModal">&lt; 홈으로 돌아가기</span>
    </div>
    <slot name="progress" />
    <transition name="box-slide" mode="out-in">
      <div class="login-box" v-if="showBox" key="login-box">
        <div class="form-title">{{ title }}</div>
        <div class="form-subtitle">{{ subtitle }}</div>
        <slot />
      </div>
    </transition>

    <!-- 홈으로 돌아가기 확인 모달 -->
    <CommonModal
      v-model="showModal"
      type="warning"
      title="메인 페이지로 이동"
      message="메인 페이지로 이동하시겠습니까? 지금까지 작성된 정보들은 사라집니다."
      confirm-text="YES"
      cancel-text="NO"
      @confirm="handleGoHome"
      @cancel="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth/auth";
import CommonModal from "@/components/common/CommonModal.vue";

const router = useRouter();
const authStore = useAuthStore();

const props = defineProps({
  title: {
    type: String,
    default: "요리한수",
  },
  subtitle: {
    type: String,
    default: "",
  },
  showBackLink: {
    type: Boolean,
    default: true,
  },
  showBox: {
    type: Boolean,
    default: true,
  },
});

// 모달 표시 상태
const showModal = ref(false);

// 홈으로 돌아가기 모달 표시
function showGoHomeModal() {
  showModal.value = true;
}

// 홈으로 돌아가기 처리 (로그아웃 및 임시 정보 제거)
async function handleGoHome() {
  try {
    // 로그아웃 처리
    await authStore.logout();
    
    // 모달 닫기
    showModal.value = false;
    
    // 메인 페이지로 이동
    router.push("/");
  } catch (error) {
    console.error("홈으로 돌아가기 처리 중 오류 발생:", error);
    // 에러가 발생해도 메인 페이지로 이동
    router.push("/");
  }
}
</script>

<style scoped>
@import "../../assets/fonts/global.scss";
@import "../../assets/styles/layout.css";

.login-layout {
  min-height: 100vh;
  height: 100vh;
  background: #f5f1e8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "NotoSansKR", "Noto Sans", sans-serif;
  overflow: hidden;
}

.top-bar {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 12px auto;
  padding-top: 32px;
  display: flex;
  align-items: center;
}

.back-link {
  color: var(--color-text);
  font-size: 1.05rem;
  cursor: pointer;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.18s;
}

.back-link:hover {
  color: var(--color-primary);
}

.login-box {
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
  padding: 32px 32px 32px 32px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 30px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  max-height: calc(100vh - 40px);
  transition: box-shadow 0.2s;
}

.form-title {
  color: var(--color-primary);
  font-weight: bold;
  font-size: 2rem;
  margin-bottom: 5px;
  text-align: center;
}

.form-subtitle {
  color: var(--color-text);
  font-size: 1rem;
  margin-bottom: 28px;
  text-align: center;
}

.box-slide-enter-active,
.box-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.box-slide-enter-from {
  opacity: 0;
  transform: translateX(60px);
}

.box-slide-leave-to {
  opacity: 0;
  transform: translateX(-60px);
}
</style>
