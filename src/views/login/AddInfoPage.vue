<template>
  <LoginLayout title="요리한수" subtitle="기본 정보 입력" :show-box="showBox">
    <template #progress>
      <ProgressStep :step="2" :animate="progressAnimate" />
    </template>

    <form class="form-content" @submit.prevent="onNext">
      <UserInfoDisplay :user-info="userInfo" />

      <FormInput
        v-model="form.nickname"
        label="닉네임"
        placeholder="닉네임을 입력하세요"
        :required="true"
        :has-error="errors.nickname"
        error-message="닉네임을 입력해 주세요!"
        @input="onNicknameInput"
      />

      <RoleSelector v-model="form.role" :roles="roles" :required="true" />
    </form>

    <FormButtons @prev="onPrev" @next="onNext" next-text="다음" />
  </LoginLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth/auth";
import ProgressStep from "@/components/login/ProgressStep.vue";
import LoginLayout from "@/components/login/LoginLayout.vue";
import UserInfoDisplay from "@/components/login/UserInfoDisplay.vue";
import FormInput from "@/components/login/FormInput.vue";
import RoleSelector from "@/components/login/RoleSelector.vue";
import FormButtons from "@/components/login/FormButtons.vue";
import {
  saveStepData,
  getStepData,
  saveRegistrationData,
} from "@/utils/userRegistration";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  nickname: "",
  role: "GENERAL",
});
const errors = ref({ nickname: false });
const userInfo = ref(null);
const showBox = ref(true);
const progressAnimate = ref(false);

// 백엔드 엔티티에 맞는 역할 옵션
const roles = [
  { value: "GENERAL", label: "일반 사용자", desc: "레시피 공유 및 강의 수강" },
  { value: "CHEF", label: "요식업 종사자", desc: "요리사, 요리연구가" },
  { value: "OWNER", label: "요식업 자영업자", desc: "식당, 카페 운영자" },
];

onMounted(() => {
  // 인증 상태 확인
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  // 신규 사용자가 아닌 경우 홈으로 리다이렉트
  if (!authStore.isNewUser) {
    router.push("/");
    return;
  }

  // Pinia store에서 사용자 정보 가져오기
  const currentUser = authStore.user;
  if (currentUser) {
    userInfo.value = {
      name: currentUser.name,
      email: currentUser.email,
      picture: currentUser.picture,
    };

    // localStorage에 사용자 기본 정보 저장
    saveRegistrationData({
      userInfo: {
        email: currentUser.email,
        name: currentUser.name,
        picture: currentUser.picture,
        oauthType: currentUser.oauthType,
        socialId: currentUser.socialId,
      },
    });

    // 이전에 저장된 데이터가 있으면 불러오기
    const savedData = getStepData("addInfo");
    if (savedData) {
      form.value.nickname = savedData.nickname || currentUser.name || "";
      form.value.role = savedData.role || "GENERAL";
    } else {
      // 기본 닉네임으로 이름 설정
      form.value.nickname = currentUser.name || "";
    }

    // 초기 에러 상태 초기화
    errors.value.nickname = false;
  }
});

function onPrev() {
  progressAnimate.value = true;
  showBox.value = false;
  setTimeout(() => {
    router.push("/login");
  }, 350);
}

function validate() {
  errors.value.nickname = !form.value.nickname;
  return !errors.value.nickname;
}

// 닉네임 입력 시 에러 제거
function onNicknameInput() {
  if (form.value.nickname && errors.value.nickname) {
    errors.value.nickname = false;
  }
}

function onNext() {
  if (!validate()) return;

  // localStorage에 현재 단계 데이터 저장
  saveStepData("addInfo", {
    nickname: form.value.nickname,
    role: form.value.role,
  });

  // 인증 스토어의 사용자 정보 업데이트
  authStore.updateUserInfo({
    nickname: form.value.nickname,
    role: form.value.role,
  });

  progressAnimate.value = true;
  showBox.value = false;
  setTimeout(() => {
    if (form.value.role === "GENERAL") {
      router.push("/detail-user");
    } else if (form.value.role === "CHEF") {
      router.push("/detail-cook");
    } else if (form.value.role === "OWNER") {
      router.push("/detail-owner");
    } else {
      router.push("/");
    }
  }, 350);
}
</script>

<style scoped>
@import "../../assets/fonts/global.scss";
@import "../../assets/styles/layout.css";

.form-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}
</style>
