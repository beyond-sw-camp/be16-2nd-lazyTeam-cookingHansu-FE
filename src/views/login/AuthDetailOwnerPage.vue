<template>
  <LoginLayout title="요리한수" subtitle="추가 인증" :show-box="showBox">
    <template #progress>
      <ProgressStep :step="3" />
    </template>

    <form class="form-content" @submit.prevent="onSubmit">
      <div class="section-title">요식업 자영업자 인증</div>

      <FormSelect
        v-model="form.shopCategory"
        label="요식업 종류"
        placeholder="요식업 종류를 선택하세요"
        :options="shopCategoryOptions"
        :required="true"
        :has-error="errors.shopCategory"
        error-message="요식업 종류를 선택해 주세요!"
        @input="onShopCategorySelect"
      />

      <FileUpload
        v-model="form.businessUrl"
        label="사업자 등록증"
        placeholder="사업자 등록증을 선택하세요"
        :required="true"
        :has-error="errors.businessUrl"
        error-message="사업자 등록증을 선택해 주세요!"
        @update:modelValue="onFileSelect"
      />

      <FormInput
        v-model="form.businessNumber"
        label="사업자 등록번호"
        placeholder="사업자 등록번호를 입력하세요"
        :required="true"
        :has-error="errors.businessNumber"
        error-message="사업자 등록번호를 입력해 주세요!"
        @input="onBusinessNumberInput"
      />

      <FormInput
        v-model="form.businessName"
        label="가게 이름"
        placeholder="가게 이름을 입력하세요"
        :required="true"
        :has-error="errors.businessName"
        error-message="가게 이름을 입력해 주세요!"
        @input="onBusinessNameInput"
      />

      <Address />
    </form>

    <FormButtons @prev="onPrev" @next="showConfirmationModal" next-text="가입 완료" />

    <!-- 확인 모달 -->
    <v-dialog v-model="showModal" max-width="400" persistent>
      <v-card class="confirmation-modal">
        <v-card-title class="text-h6 text-center pa-4">
          요식업 자영업자 회원 등록
        </v-card-title>
        <v-card-text class="text-center pa-4">
          <p class="mb-4">
            요식업 자영업자로 회원 등록하시겠습니까?
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
import Address from "@/components/login/Address.vue";
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
const shopCategoryOptions = [
  { value: "KOREAN", label: "한식" },
  { value: "JAPANESE", label: "일식" },
  { value: "CHINESE", label: "중식" },
  { value: "WESTERN", label: "양식" },
  { value: "ETC", label: "기타" },
];

const form = ref({
  shopCategory: "",
  businessUrl: null,
  businessNumber: "",
  businessName: "",
  businessAddress: "",
});

const errors = ref({
  shopCategory: false,
  businessUrl: false,
  businessNumber: false,
  businessName: false,
});

onMounted(() => {
  // 이전에 저장된 데이터가 있으면 불러오기
  const savedData = getStepData("authDetail");
  if (savedData) {
    form.value.shopCategory = savedData.shopCategory || "";
    form.value.businessNumber = savedData.businessNumber || "";
    form.value.businessName = savedData.businessName || "";
    form.value.businessAddress = savedData.businessAddress || "";
  }

  // 초기 에러 상태 초기화
  errors.value.shopCategory = false;
  errors.value.businessUrl = false;
  errors.value.businessNumber = false;
  errors.value.businessName = false;
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
      shopCategory: form.value.shopCategory,
      businessNumber: form.value.businessNumber,
      businessName: form.value.businessName,
      businessAddress: form.value.businessAddress,
      businessUrl: form.value.businessUrl ? form.value.businessUrl.name : null,
    });

    // 인증 스토어의 사용자 정보 업데이트
    authStore.updateUserInfo({
      business: {
        shopCategory: form.value.shopCategory,
        businessNumber: form.value.businessNumber,
        businessName: form.value.businessName,
        businessAddress: form.value.businessAddress,
        businessUrl: form.value.businessUrl ? form.value.businessUrl.name : null,
      }
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
  errors.value.shopCategory = !form.value.shopCategory;
  errors.value.businessUrl = !form.value.businessUrl;
  errors.value.businessNumber = !form.value.businessNumber;
  errors.value.businessName = !form.value.businessName;
  return (
    !errors.value.shopCategory &&
    !errors.value.businessUrl &&
    !errors.value.businessNumber &&
    !errors.value.businessName
  );
}

// 요식업 종류 선택 시 에러 제거
function onShopCategorySelect() {
  if (form.value.shopCategory && errors.value.shopCategory) {
    errors.value.shopCategory = false;
  }
}

// 파일 선택 시 에러 제거
function onFileSelect() {
  if (form.value.businessUrl && errors.value.businessUrl) {
    errors.value.businessUrl = false;
  }
}

// 사업자 번호 입력 시 에러 제거
function onBusinessNumberInput() {
  if (form.value.businessNumber && errors.value.businessNumber) {
    errors.value.businessNumber = false;
  }
}

// 가게 이름 입력 시 에러 제거
function onBusinessNameInput() {
  if (form.value.businessName && errors.value.businessName) {
    errors.value.businessName = false;
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
