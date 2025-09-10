<template>
  <LoginLayout title="요리한수" subtitle="기본 정보 입력" :show-box="showBox">
    <template #progress>
      <ProgressStep :step="2" :animate="progressAnimate" />
    </template>

    <form class="form-content" @submit.prevent="onNext">
      <UserInfoDisplay :user-info="userInfo" />

      <div class="nickname-container">
        <FormInput
          v-model="form.nickname"
          label="닉네임"
          placeholder="닉네임을 입력하세요 (2-10자)"
          :required="true"
          :has-error="errors.nickname"
          :error-message="getNicknameErrorMessage()"
          :maxlength="10"
          @input="onNicknameInput"
        />
        <v-btn
          v-if="!nicknameVerified && form.nickname.trim().length >= 2"
          :loading="checkingNickname"
          :disabled="checkingNickname || form.nickname.trim().length < 2"
          color="primary"
          variant="outlined"
          size="small"
          class="nickname-check-btn"
          @click="checkNickname"
        >
          {{ checkingNickname ? '확인 중...' : '중복 확인' }}
        </v-btn>
        <v-chip
          v-if="nicknameVerified"
          color="success"
          size="small"
          class="nickname-verified-chip"
        >
          <v-icon start>mdi-check</v-icon>
          사용 가능
        </v-chip>
      </div>

      <FormInput
        v-model="form.info"
        label="간단 소개"
        placeholder="자신을 간단히 소개해주세요 (20자 이하)"
        :required="false"
        :has-error="errors.info"
        :error-message="getInfoErrorMessage()"
        :maxlength="20"
        @input="onInfoInput"
      />

      <RoleSelector v-model="form.role" :roles="roles" :required="true" />
    </form>

    <FormButtons 
      @prev="onPrev" 
      @next="onNext" 
      next-text="다음"
      :disabled="!isNextEnabled"
    />

    <!-- 처음으로 돌아가기 확인 모달 -->
    <CommonModal
      v-model="showGoBackModal"
      type="warning"
      title="처음으로 돌아가기"
      message="처음으로 돌아가시겠습니까? 모든 임시 기록이 삭제됩니다."
      confirm-text="네"
      cancel-text="아니오"
      @confirm="handleGoBackConfirm"
      @cancel="showGoBackModal = false"
    />
  </LoginLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth/auth";
import { authService } from "@/services/auth/authService";
import ProgressStep from "@/components/login/ProgressStep.vue";
import LoginLayout from "@/components/login/LoginLayout.vue";
import UserInfoDisplay from "@/components/login/UserInfoDisplay.vue";
import FormInput from "@/components/login/FormInput.vue";
import RoleSelector from "@/components/login/RoleSelector.vue";
import FormButtons from "@/components/login/FormButtons.vue";
import CommonModal from "@/components/common/CommonModal.vue";
import {
  saveStepData,
  getStepData,
  saveRegistrationData,
  clearRegistrationData,
} from "@/utils/userRegistration";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  nickname: "",
  info: "",
  role: "",
});
const errors = ref({ nickname: false, info: false });
const userInfo = ref(null);
const showBox = ref(true);
const progressAnimate = ref(false);
const showGoBackModal = ref(false);

// 닉네임 중복검증 관련 상태
const nicknameVerified = ref(false);
const checkingNickname = ref(false);
const nicknameError = ref("");

// 백엔드 엔티티에 맞는 역할 옵션
const roles = [
  { value: "GENERAL", label: "일반 사용자", desc: "레시피 공유 및 강의 수강" },
  { value: "CHEF", label: "요식업 종사자", desc: "요리사, 요리연구가" },
  { value: "OWNER", label: "요식업 자영업자", desc: "식당, 카페 운영자" },
];

// 다음 버튼 활성화 조건
const isNextEnabled = computed(() => {
  return nicknameVerified.value && form.value.role;
});

// 닉네임 중복검증 함수
async function checkNickname() {
  const nickname = form.value.nickname.trim();
  
  if (nickname.length < 2) {
    nicknameError.value = "닉네임은 2자 이상이어야 합니다.";
    return;
  }
  
  checkingNickname.value = true;
  nicknameError.value = "";
  
  try {
    const response = await authService.checkNicknameAvailability(nickname);
    
    if (response.success && response.data === true) {
      nicknameVerified.value = true;
      errors.value.nickname = false;
      nicknameError.value = "";
    } else {
      nicknameVerified.value = false;
      errors.value.nickname = true;
      nicknameError.value = "이미 사용 중인 닉네임입니다.";
    }
  } catch (error) {
    console.error("닉네임 중복검증 실패:", error);
    nicknameVerified.value = false;
    errors.value.nickname = true;
    nicknameError.value = "닉네임 확인 중 오류가 발생했습니다.";
  } finally {
    checkingNickname.value = false;
  }
}

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
      form.value.info = savedData.info || "";
      form.value.role = savedData.role || "";
    } else {
      // 기본 닉네임으로 이름 설정
      form.value.nickname = currentUser.name || "";
    }

    // 초기 에러 상태 초기화
    errors.value.nickname = false;
    errors.value.info = false;
  }
});

function onPrev() {
  // 모달 표시
  showGoBackModal.value = true;
}

// 처음으로 돌아가기 확인 처리
async function handleGoBackConfirm() {
  try {
    // 모달 닫기
    showGoBackModal.value = false;
    
    // 모든 임시 기록 삭제
    clearRegistrationData();
    
    // 로그아웃 처리
    await authStore.logout();
    
    // 로그인 페이지로 이동
    router.push("/login");
  } catch (error) {
    console.error("로그아웃 처리 중 오류 발생:", error);
    // 에러가 발생해도 로그인 페이지로 이동
    router.push("/login");
  }
}

function validate() {
  const nickname = form.value.nickname.trim();
  
  if (!nickname) {
    errors.value.nickname = true;
    return false;
  }
  
  if (nickname.length < 2) {
    errors.value.nickname = true;
    return false;
  }
  
  if (nickname.length > 10) {
    errors.value.nickname = true;
    return false;
  }

  const info = form.value.info.trim();
  if (info.length > 20) {
    errors.value.info = true;
    return false;
  }
  
  errors.value.nickname = false;
  errors.value.info = false;
  return true;
}

// 닉네임 입력 시 에러 제거 및 검증 상태 초기화
function onNicknameInput() {
  if (form.value.nickname && errors.value.nickname) {
    errors.value.nickname = false;
  }
  
  // 닉네임이 변경되면 검증 상태 초기화 (검증 완료된 상태에서 변경 시)
  if (nicknameVerified.value) {
    nicknameVerified.value = false;
    console.log('닉네임이 변경되어 중복확인이 필요합니다.');
  }
  nicknameError.value = "";
}

// 간단 소개 입력 시 에러 제거
function onInfoInput() {
  if (form.value.info && errors.value.info) {
    errors.value.info = false;
  }
}

// 닉네임 에러 메시지 생성
function getNicknameErrorMessage() {
  const nickname = form.value.nickname.trim();
  
  // 중복검증 에러가 있으면 우선 표시
  if (nicknameError.value) {
    return nicknameError.value;
  }
  
  if (!nickname) {
    return "닉네임을 입력해 주세요!";
  }
  
  if (nickname.length < 2) {
    return "닉네임은 2자 이상이어야 합니다!";
  }
  
  if (nickname.length > 10) {
    return "닉네임은 10자 이하여야 합니다!";
  }
  
  return "닉네임을 입력해 주세요!";
}

// 간단 소개 에러 메시지 생성
function getInfoErrorMessage() {
  const info = form.value.info.trim();
  if (info.length > 20) {
    return "간단 소개는 20자 이하여야 합니다!";
  }
  return "";
}

function onNext() {
  if (!validate()) return;

  // localStorage에 현재 단계 데이터 저장
  saveStepData("addInfo", {
    nickname: form.value.nickname,
    info: form.value.info,
    role: form.value.role,
  });

  // 인증 스토어의 사용자 정보 업데이트
  authStore.updateUserInfo({
    nickname: form.value.nickname,
    info: form.value.info,
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

.nickname-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nickname-check-btn {
  align-self: flex-end;
  margin-top: -8px;
  min-width: 100px;
}

.nickname-verified-chip {
  align-self: flex-end;
  margin-top: -8px;
}
</style>
