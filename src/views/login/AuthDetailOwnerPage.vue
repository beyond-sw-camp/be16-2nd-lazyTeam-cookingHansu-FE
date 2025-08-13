<template>
  <LoginLayout 
    title="요리한수" 
    subtitle="추가 인증"
    :show-box="showBox"
  >
    <template #progress>
      <ProgressStep :step="3" />
    </template>
    
    <form class="form-content" @submit.prevent="onSubmit">
      <div class="section-title">요식업 자영업자 인증</div>
      
      <FormSelect
        v-model="form.type"
        label="요식업 종류"
        placeholder="요식업 종류를 선택하세요"
        :options="typeOptions"
        :required="true"
      />
      
      <FileUpload
        v-model="form.bizFile"
        label="사업자 등록증"
        placeholder="사업자 등록증을 선택하세요"
        :required="true"
      />
      
      <FormInput
        v-model="form.bizNum"
        label="사업자 등록번호"
        placeholder="사업자 등록번호를 입력하세요"
        :required="true"
      />
      
      <FormInput
        v-model="form.shopName"
        label="가게 이름"
        placeholder="가게 이름을 입력하세요"
        :required="true"
      />
      
      <Address />
    </form>
    
    <FormButtons
      @prev="onPrev"
      @next="onSubmit"
      next-text="가입 완료"
    />
  </LoginLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth'
import ProgressStep from '@/components/login/ProgressStep.vue'
import LoginLayout from '@/components/login/LoginLayout.vue'
import FormSelect from '@/components/login/FormSelect.vue'
import FormInput from '@/components/login/FormInput.vue'
import FileUpload from '@/components/login/FileUpload.vue'
import FormButtons from '@/components/login/FormButtons.vue'
import Address from '@/components/login/Address.vue'
import { authService } from '@/services/auth/authService'
import { saveStepData, getStepData, clearRegistrationData, getCompleteRegistrationData } from '@/utils/userRegistration'

const router = useRouter()
const authStore = useAuthStore()
const showBox = ref(true)

// 백엔드 엔티티에 맞는 요식업 종류
const typeOptions = [
  { value: 'KOREAN', label: '한식' },
  { value: 'JAPANESE', label: '일식' },
  { value: 'CHINESE', label: '중식' },
  { value: 'WESTERN', label: '양식' },
  { value: 'ETC', label: '기타' }
]

const form = ref({
  type: '',
  bizFile: null,
  bizNum: '',
  shopName: '',
  shopAddr: ''
})

onMounted(() => {
  // 이전에 저장된 데이터가 있으면 불러오기
  const savedData = getStepData('authDetail')
  if (savedData) {
    form.value.type = savedData.type || ''
    form.value.bizNum = savedData.bizNum || ''
    form.value.shopName = savedData.shopName || ''
    form.value.shopAddr = savedData.shopAddr || ''
  }
})

function onPrev() { 
  router.push('/add-info') 
}

async function onSubmit() { 
  try {
    // localStorage에 현재 단계 데이터 저장
    saveStepData('authDetail', {
      type: form.value.type,
      bizNum: form.value.bizNum,
      shopName: form.value.shopName,
      shopAddr: form.value.shopAddr,
      bizFile: form.value.bizFile ? form.value.bizFile.name : null
    })
    
    // 현재 사용자 ID 가져오기
    const currentUser = authStore.user
    if (!currentUser || !currentUser.id) {
      throw new Error('사용자 정보를 찾을 수 없습니다.')
    }
    
    // 최종 회원가입 완료 - 통합 API 사용
    const registrationData = getCompleteRegistrationData()
    const response = await authService.addUserInfo(currentUser.id, registrationData)
    
    if (response.isSuccess()) {
      // 성공 시 localStorage 데이터 초기화
      clearRegistrationData()
      router.push('/complete')
    } else {
      throw new Error(response.getMessage() || '회원가입에 실패했습니다.')
    }
  } catch (error) {
    console.error('회원가입 오류:', error)
    alert(error.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
  }
}
</script>

<style scoped>
@import '../../assets/fonts/global.scss';
@import '../../assets/styles/layout.css';

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