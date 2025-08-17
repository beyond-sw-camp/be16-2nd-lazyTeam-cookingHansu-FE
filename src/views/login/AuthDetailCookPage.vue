<template>
  <LoginLayout title="요리한수" subtitle="추가 인증" :show-box="showBox">
    <template #progress>
      <ProgressStep :step="3" />
    </template>

    <form class="form-content" @submit.prevent="onSubmit">
      <div class="section-title">요식업 종사자 인증</div>

      <FormSelect
        v-model="form.type"
        label="요식업 종류"
        placeholder="요식업 종류를 선택하세요"
        :options="typeOptions"
        :required="true"
        :has-error="errors.type"
        error-message="요식업 종류를 선택해 주세요!"
        @input="onTypeSelect"
      />

      <FileUpload
        v-model="form.certFile"
        label="요리사 자격증"
        placeholder="자격증 파일을 선택하세요"
        :required="true"
        :has-error="errors.certFile"
        error-message="자격증 파일을 선택해 주세요!"
        @update:modelValue="onFileSelect"
      />

      <FormInput
        v-model="form.certNum"
        label="자격증 관리번호"
        placeholder="자격증 관리번호를 입력하세요"
        :required="true"
        :has-error="errors.certNum"
        error-message="자격증 관리번호를 입력해 주세요!"
        @input="onCertNumInput"
      />
    </form>

    <FormButtons @prev="onPrev" @next="onSubmit" next-text="가입 완료" />
  </LoginLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth/auth";
import ProgressStep from "@/components/login/ProgressStep.vue";
import LoginLayout from "@/components/login/LoginLayout.vue";
import FormSelect from "@/components/login/FormSelect.vue";
import FormInput from "@/components/login/FormInput.vue";
import FileUpload from "@/components/login/FileUpload.vue";
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

// 백엔드 엔티티에 맞는 요식업 종류
const typeOptions = [
  { value: "KOREAN", label: "한식" },
  { value: "JAPANESE", label: "일식" },
  { value: "CHINESE", label: "중식" },
  { value: "WESTERN", label: "양식" },
  { value: "ETC", label: "기타" },
];

const form = ref({
  type: "",
  certFile: null,
  certNum: "",
});

const errors = ref({
  type: false,
  certFile: false,
  certNum: false,
});

onMounted(() => {
  // 이전에 저장된 데이터가 있으면 불러오기
  const savedData = getStepData("authDetail");
  if (savedData) {
    form.value.type = savedData.type || "";
    form.value.certNum = savedData.certNum || "";
  }

  // 초기 에러 상태 초기화
  errors.value.type = false;
  errors.value.certFile = false;
  errors.value.certNum = false;
});

function onPrev() {
  router.push("/add-info");
}

async function onSubmit() {
  try {
    // localStorage에 현재 단계 데이터 저장
    saveStepData("authDetail", {
      type: form.value.type,
      certNum: form.value.certNum,
      certFile: form.value.certFile ? form.value.certFile.name : null,
    });

    // 현재 사용자 ID 가져오기
    const currentUser = authStore.user;
    if (!currentUser || !currentUser.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 최종 회원가입 완료 - 통합 API 사용
    const registrationData = getCompleteRegistrationData();
    const response = await authService.addUserInfo(
      currentUser.id,
      registrationData
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
  }
}

function validate() {
  errors.value.type = !form.value.type;
  errors.value.certFile = !form.value.certFile;
  errors.value.certNum = !form.value.certNum;
  return !errors.value.type && !errors.value.certFile && !errors.value.certNum;
}

// 요식업 종류 선택 시 에러 제거
function onTypeSelect() {
  if (form.value.type && errors.value.type) {
    errors.value.type = false;
  }
}

// 파일 선택 시 에러 제거
function onFileSelect() {
  if (form.value.certFile && errors.value.certFile) {
    errors.value.certFile = false;
  }
}

// 자격증 번호 입력 시 에러 제거
function onCertNumInput() {
  if (form.value.certNum && errors.value.certNum) {
    errors.value.certNum = false;
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

.section-title {
  color: var(--color-text);
  font-size: 1.13rem;
  font-weight: 600;
  margin-bottom: 10px;
  margin-top: 2px;
}
</style>
