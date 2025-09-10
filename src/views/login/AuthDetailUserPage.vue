<template>
  <LoginLayout title="요리한수" subtitle="추가 정보 입력" :show-box="showBox">
    <template #progress>
      <ProgressStep :step="3" />
    </template>

    <form class="form-content" @submit.prevent="onSubmit">
      <FormSelect
        v-model="form.generalType"
        label="추가 정보"
        placeholder="추가 정보를 선택하세요"
        :options="generalTypeOptions"
        :has-error="errors.generalType"
        error-message="추가 정보를 입력해 주세요!"
        @input="onGeneralTypeSelect"
      />
    </form>

    <FormButtons 
      @prev="onPrev" 
      @next="onSubmit" 
      next-text="가입 완료" 
      :loading="isLoading"
      :disabled="isLoading"
    />
  </LoginLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth/auth";
import ProgressStep from "@/components/login/ProgressStep.vue";
import LoginLayout from "@/components/login/LoginLayout.vue";
import FormSelect from "@/components/login/FormSelect.vue";
import FormButtons from "@/components/login/FormButtons.vue";
import { authService } from "@/services/auth/authService";
import {
  saveStepData,
  getStepData,
  clearRegistrationData,
  getCompleteRegistrationData,
} from "@/utils/userRegistration";

const router = useRouter();
const authStore = useAuthStore();
const showBox = ref(true);
const isLoading = ref(false);
const form = ref({
  generalType: "",
});
const errors = ref({ generalType: false });

// 백엔드 엔티티에 맞는 일반 사용자 유형
const generalTypeOptions = [
  { value: "STUDENT", label: "학생" },
  { value: "HOUSEWIFE", label: "주부" },
  { value: "LIVINGALONE", label: "자취생" },
  { value: "ETC", label: "기타" },
];

onMounted(() => {
  // 이전에 저장된 데이터가 있으면 불러오기
  const savedData = getStepData("authDetail");
  if (savedData) {
    form.value.generalType = savedData.generalType || "";
  }

  // 초기 에러 상태 초기화
  errors.value.generalType = false;
});

function onPrev() {
  router.push("/add-info");
}

function validate() {
  errors.value.generalType = !form.value.generalType;
  return !errors.value.generalType;
}

// 추가 정보 선택 시 에러 제거
function onGeneralTypeSelect() {
  if (form.value.generalType && errors.value.generalType) {
    errors.value.generalType = false;
  }
}

async function onSubmit() {
  if (!validate()) return;

  // 로딩 상태 시작
  isLoading.value = true;

  try {
    // localStorage에 현재 단계 데이터 저장
    saveStepData("authDetail", {
      generalType: form.value.generalType,
    });

    // 인증 스토어의 사용자 정보 업데이트
    authStore.updateUserInfo({
      generalType: form.value.generalType,
    });

    // 현재 사용자 ID 가져오기
    const currentUser = authStore.user;
    if (!currentUser || !currentUser.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 최종 회원가입 완료 - FormData를 사용하여 multipart 방식으로 전송
    const registrationData = getCompleteRegistrationData();
    
    // FormData 생성 (파일이 없어도 multipart 형식으로 전송)
    const formData = new FormData();
    
    // 텍스트 데이터 추가
    Object.keys(registrationData).forEach(key => {
      if (registrationData[key] !== null && registrationData[key] !== undefined) {
        formData.append(key, registrationData[key]);
      }
    });
    
    const response = await authService.addUserInfoFormData(
      currentUser.id,
      formData
    );
    
    if (response.isSuccess()) {
      // 성공 시 localStorage 데이터 초기화
      clearRegistrationData();
      router.push("/complete");  
    } else {
      throw new Error(response.getMessage() || "회원가입에 실패했습니다.");
    }
  } catch (error) {
    console.error("회원가입 오류:", error);
    alert(
      error.message || "회원가입 중 오류가 발생했습니다. 다시 시도해주세요."
    );
  } finally {
    // 로딩 상태 종료
    isLoading.value = false;
  }
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
