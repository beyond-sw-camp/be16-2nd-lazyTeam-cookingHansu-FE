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
        v-model="form.businessFile"
        label="사업자 등록증"
        placeholder="사업자 등록증을 선택하세요"
        :required="true"
        :has-error="errors.businessFile"
        error-message="사업자 등록증을 선택해 주세요!"
        @update:modelValue="onFileSelect"
      />

      <FormInput
        v-model="form.businessNumber"
        label="사업자 등록번호"
        placeholder="사업자 등록번호를 입력하세요 (예: 123-45-67890)"
        :required="true"
        :has-error="errors.businessNumber"
        error-message="사업자 등록번호를 입력해 주세요!"
        :maxlength="12"
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

      <Address
        v-model="form.businessAddress"
        :has-error="errors.businessAddress"
        @input="onBusinessAddressInput"
      />
    </form>

    <FormButtons @prev="onPrev" @next="showConfirmationModal" next-text="가입 완료" />

    <!-- 확인 모달 -->
    <CommonModal
      v-model="showModal"
      type="success"
      title="요식업 자영업자 회원 등록"
      message="요식업 자영업자로 회원 등록하시겠습니까? 등록 후에는 관리자 승인까지 권한이 제한됩니다."
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
  businessFile: null, // businessUrl에서 businessFile로 변경
  businessNumber: "",
  businessName: "",
  businessAddress: "",
});

const errors = ref({
  shopCategory: false,
  businessFile: false, // businessUrl에서 businessFile로 변경
  businessNumber: false,
  businessName: false,
  businessAddress: false,
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
  errors.value.businessFile = false; // businessUrl에서 businessFile로 변경
  errors.value.businessNumber = false;
  errors.value.businessName = false;
  errors.value.businessAddress = false;
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
      businessFile: form.value.businessFile ? form.value.businessFile.name : null, // businessUrl에서 businessFile로 변경
    });

    // 인증 스토어의 사용자 정보 업데이트
    authStore.updateUserInfo({
      business: {
        shopCategory: form.value.shopCategory,
        businessNumber: form.value.businessNumber,
        businessName: form.value.businessName,
        businessAddress: form.value.businessAddress,
        businessFile: form.value.businessFile ? form.value.businessFile.name : null, // businessUrl에서 businessFile로 변경
      }
    });

    // 현재 사용자 ID 가져오기
    const currentUser = authStore.user;
    if (!currentUser || !currentUser.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 최종 회원가입 완료 - FormData를 사용하여 multipart 방식으로 전송
    const registrationData = getCompleteRegistrationData();
    
    // FormData 생성
    const formData = new FormData();
    
    // 텍스트 데이터 추가
    Object.keys(registrationData).forEach(key => {
      if (key !== 'businessFile' && registrationData[key] !== null && registrationData[key] !== undefined) {
        formData.append(key, registrationData[key]);
      }
    });
    
    // 파일 데이터 추가 (사업자 등록증) - 백엔드 필드명과 일치
    if (form.value.businessFile && form.value.businessFile instanceof File) {
      formData.append('businessFile', form.value.businessFile); // businessFile로 변경
    }
    
    const response = await authService.addUserInfoFormData(
      currentUser.id,
      formData
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
  errors.value.businessFile = !form.value.businessFile; // businessUrl에서 businessFile로 변경
  errors.value.businessNumber = !form.value.businessNumber;
  errors.value.businessName = !form.value.businessName;
  errors.value.businessAddress = !form.value.businessAddress;
  return (
    !errors.value.shopCategory &&
    !errors.value.businessFile &&
    !errors.value.businessNumber &&
    !errors.value.businessName &&
    !errors.value.businessAddress
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
  if (form.value.businessFile && errors.value.businessFile) { // businessUrl에서 businessFile로 변경
    errors.value.businessFile = false; // businessUrl에서 businessFile로 변경
  }
}

// 사업자 번호 입력 시 에러 제거 및 포맷팅
function onBusinessNumberInput(event) {
  if (form.value.businessNumber && errors.value.businessNumber) {
    errors.value.businessNumber = false;
  }
  
  // 숫자만 추출
  const value = event.target.value.replace(/[^0-9]/g, '');
  
  // 10자리로 제한
  const limitedValue = value.substring(0, 10);
  
  // 하이픈 추가 (xxx-xx-xxxxx 형식)
  let formattedValue = '';
  if (limitedValue.length > 0) {
    formattedValue = limitedValue.substring(0, 3);
  }
  if (limitedValue.length > 3) {
    formattedValue += '-' + limitedValue.substring(3, 5);
  }
  if (limitedValue.length > 5) {
    formattedValue += '-' + limitedValue.substring(5, 10);
  }
  
  // 값 업데이트
  form.value.businessNumber = formattedValue;
  event.target.value = formattedValue;
}

// 가게 이름 입력 시 에러 제거
function onBusinessNameInput() {
  if (form.value.businessName && errors.value.businessName) {
    errors.value.businessName = false;
  }
}

// 가게 주소 입력 시 에러 제거
function onBusinessAddressInput() {
  if (form.value.businessAddress && errors.value.businessAddress) {
    errors.value.businessAddress = false;
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
