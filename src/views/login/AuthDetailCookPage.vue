<template>
  <LoginLayout title="요리한수" subtitle="추가 인증" :show-box="showBox">
    <template #progress>
      <ProgressStep :step="3" />
    </template>

    <form class="form-content" @submit.prevent="onSubmit">
      <div class="section-title">요식업 종사자 인증</div>

      <FormSelect
        v-model="form.cuisineType"
        label="요식업 종류"
        placeholder="요식업 종류를 선택하세요"
        :options="cuisineTypeOptions"
        :required="true"
        :has-error="errors.cuisineType"
        error-message="요식업 종류를 선택해 주세요!"
        @input="onCuisineTypeSelect"
      />

      <FileUpload
        v-model="form.licenseFile"
        label="요리사 자격증"
        placeholder="자격증 파일을 선택하세요"
        :required="true"
        :has-error="errors.licenseFile"
        error-message="자격증 파일을 선택해 주세요!"
        @update:modelValue="onFileSelect"
      />

      <FormInput
        v-model="form.licenseNumber"
        label="자격증 관리번호"
        placeholder="자격증 관리번호를 입력하세요"
        :required="true"
        :has-error="errors.licenseNumber"
        error-message="자격증 관리번호를 입력해 주세요!"
        @input="onLicenseNumberInput"
      />
    </form>

    <FormButtons @prev="onPrev" @next="showConfirmationModal" next-text="가입 완료" />

    <!-- 확인 모달 -->
    <CommonModal
      v-model="showModal"
      type="info"
      title="요식업 종사자 회원 등록"
      message="요식업 종사자로 회원 등록하시겠습니까? 등록 후에는 관리자 승인까지 권한이 제한됩니다."
      confirm-text="YES"
      cancel-text="NO"
      :loading="isSubmitting"
      @confirm="confirmRegistration"
      @cancel="showModal = false"
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
import FormInput from "@/components/login/FormInput.vue";
import FileUpload from "@/components/login/FileUpload.vue";
import FormButtons from "@/components/login/FormButtons.vue";
import CommonModal from "@/components/common/CommonModal.vue";
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
const showModal = ref(false);
const isSubmitting = ref(false);

// 백엔드 엔티티에 맞는 요식업 종류
const cuisineTypeOptions = [
  { value: "KOREAN", label: "한식" },
  { value: "JAPANESE", label: "일식" },
  { value: "CHINESE", label: "중식" },
  { value: "WESTERN", label: "양식" },
  { value: "ETC", label: "기타" },
];

const form = ref({
  cuisineType: "",
  licenseFile: null, // licenseUrl에서 licenseFile로 변경
  licenseNumber: "",
});

const errors = ref({
  cuisineType: false,
  licenseFile: false, // licenseUrl에서 licenseFile로 변경
  licenseNumber: false,
});

onMounted(() => {
  // 이전에 저장된 데이터가 있으면 불러오기
  const savedData = getStepData("authDetail");
  if (savedData) {
    form.value.cuisineType = savedData.cuisineType || "";
    form.value.licenseNumber = savedData.licenseNumber || "";
  }

  // 초기 에러 상태 초기화
  errors.value.cuisineType = false;
  errors.value.licenseFile = false; // licenseUrl에서 licenseFile로 변경
  errors.value.licenseNumber = false;
});

function onPrev() {
  router.push("/add-info");
}

function showConfirmationModal() {
  if (validate()) {
    showModal.value = true;
  }
}

async function confirmRegistration() {
  try {
    isSubmitting.value = true;
    
    // localStorage에 현재 단계 데이터 저장
    saveStepData("authDetail", {
      cuisineType: form.value.cuisineType,
      licenseNumber: form.value.licenseNumber,
      licenseFile: form.value.licenseFile ? form.value.licenseFile.name : null, // licenseUrl에서 licenseFile로 변경
    });

    // 인증 스토어의 사용자 정보 업데이트
    authStore.updateUserInfo({
      chef: {
        cuisineType: form.value.cuisineType,
        licenseNumber: form.value.licenseNumber,
        licenseFile: form.value.licenseFile ? form.value.licenseFile.name : null, // licenseUrl에서 licenseFile로 변경
      }
    });

    // 현재 사용자 ID 가져오기
    const currentUser = authStore.user;
    console.log(currentUser, authStore.user);
    if (!currentUser || !currentUser.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 최종 회원가입 완료 - FormData를 사용하여 multipart 방식으로 전송
    const registrationData = getCompleteRegistrationData();
    
    // FormData 생성
    const formData = new FormData();
    
    // 텍스트 데이터 추가
    Object.keys(registrationData).forEach(key => {
      if (key !== 'licenseFile' && registrationData[key] !== null && registrationData[key] !== undefined) {
        formData.append(key, registrationData[key]);
      }
    });
    
    // 파일 데이터 추가 (요리사 자격증) - 백엔드 필드명과 일치
    if (form.value.licenseFile && form.value.licenseFile instanceof File) {
      formData.append('licenseFile', form.value.licenseFile); // licenseFile로 변경
    }
    
    const response = await authService.addUserInfoFormData(
      currentUser.id,
      formData
    );
    console.log(registrationData, response);

    if (response.isSuccess()) {
      // 성공 시 localStorage 데이터 초기화
      clearRegistrationData();
      showModal.value = false;
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
    isSubmitting.value = false;
  }
}

function validate() {
  errors.value.cuisineType = !form.value.cuisineType;
  errors.value.licenseFile = !form.value.licenseFile; // licenseUrl에서 licenseFile로 변경
  errors.value.licenseNumber = !form.value.licenseNumber;
  return !errors.value.cuisineType && !errors.value.licenseFile && !errors.value.licenseNumber;
}

// 요식업 종류 선택 시 에러 제거
function onCuisineTypeSelect() {
  if (form.value.cuisineType && errors.value.cuisineType) {
    errors.value.cuisineType = false;
  }
}

// 파일 선택 시 에러 제거
function onFileSelect() {
  if (form.value.licenseFile && errors.value.licenseFile) { // licenseUrl에서 licenseFile로 변경
    errors.value.licenseFile = false; // licenseUrl에서 licenseFile로 변경
  }
}

// 자격증 번호 입력 시 에러 제거
function onLicenseNumberInput() {
  if (form.value.licenseNumber && errors.value.licenseNumber) {
    errors.value.licenseNumber = false;
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
