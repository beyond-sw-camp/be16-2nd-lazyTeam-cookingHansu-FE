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
        v-model="form.licenseUrl"
        label="요리사 자격증"
        placeholder="자격증 파일을 선택하세요"
        :required="true"
        :has-error="errors.licenseUrl"
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
    <v-dialog v-model="showModal" max-width="400" persistent>
      <v-card class="confirmation-modal">
        <v-card-title class="text-h6 text-center pa-4">
          요식업 종사자 회원 등록
        </v-card-title>
        <v-card-text class="text-center pa-4">
          <p class="mb-4">
            요식업 종사자로 회원 등록하시겠습니까?
          </p>
          <p class="text-caption text-medium-emphasis">
            등록 후에는 관리자 승인까지 권한이 제한됩니다.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showModal = false"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmRegistration"
            :loading="isSubmitting"
          >
            확인
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  licenseUrl: null,
  licenseNumber: "",
});

const errors = ref({
  cuisineType: false,
  licenseUrl: false,
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
  errors.value.licenseUrl = false;
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
      licenseUrl: form.value.licenseUrl ? form.value.licenseUrl.name : null,
    });

    // 인증 스토어의 사용자 정보 업데이트
    authStore.updateUserInfo({
      chef: {
        cuisineType: form.value.cuisineType,
        licenseNumber: form.value.licenseNumber,
        licenseUrl: form.value.licenseUrl ? form.value.licenseUrl.name : null,
      }
    });

    // 현재 사용자 ID 가져오기
    const currentUser = authStore.user;
    console.log(currentUser, authStore.user);
    if (!currentUser || !currentUser.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 최종 회원가입 완료 - 통합 API 사용
    const registrationData = getCompleteRegistrationData();
    const response = await authService.addUserInfo(
      currentUser.id,
      registrationData
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
  errors.value.licenseUrl = !form.value.licenseUrl;
  errors.value.licenseNumber = !form.value.licenseNumber;
  return !errors.value.cuisineType && !errors.value.licenseUrl && !errors.value.licenseNumber;
}

// 요식업 종류 선택 시 에러 제거
function onCuisineTypeSelect() {
  if (form.value.cuisineType && errors.value.cuisineType) {
    errors.value.cuisineType = false;
  }
}

// 파일 선택 시 에러 제거
function onFileSelect() {
  if (form.value.licenseUrl && errors.value.licenseUrl) {
    errors.value.licenseUrl = false;
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

.confirmation-modal {
  border-radius: 12px;
}

.confirmation-modal .v-card-title {
  color: var(--color-primary);
  font-weight: 600;
}

.confirmation-modal .v-card-text p {
  margin: 0;
  line-height: 1.5;
}
</style>
