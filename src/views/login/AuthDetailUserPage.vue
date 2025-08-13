<template>
  <LoginLayout 
    title="요리한수" 
    subtitle="추가 정보 입력"
    :show-box="showBox"
  >
    <template #progress>
      <ProgressStep :step="3" />
    </template>
    
    <form class="form-content" @submit.prevent="onSubmit">
      <FormSelect
        v-model="form.extra"
        label="추가 정보"
        placeholder="추가 정보를 선택하세요"
        :options="extraOptions"
        :has-error="errors.extra"
        error-message="추가 정보를 입력해 주세요!"
      />
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
import FormButtons from '@/components/login/FormButtons.vue'
import { authService } from '@/services/auth/authService'
import { saveStepData, getStepData, clearRegistrationData,getCompleteRegistrationData } from '@/utils/userRegistration'

const router = useRouter()
const authStore = useAuthStore()
const showBox = ref(true)
const form = ref({
  extra: ''
})
const errors = ref({ extra: false })

// 백엔드 엔티티에 맞는 일반 사용자 유형
const extraOptions = [
  { value: 'STUDENT', label: '학생' },
  { value: 'HOUSEWIFE', label: '주부' },
  { value: 'LIVINGALONE', label: '자취생' },
  { value: 'ETC', label: '기타' }
]

onMounted(() => {
  // 이전에 저장된 데이터가 있으면 불러오기
  const savedData = getStepData('authDetail')
  if (savedData) {
    form.value.extra = savedData.extra || ''
  }
})

function onPrev() { 
  router.push('/add-info') 
}

function validate() {
  errors.value.extra = !form.value.extra
  return !errors.value.extra
}

async function onSubmit() {
  if (!validate()) return
  
  try {
    // localStorage에 현재 단계 데이터 저장
    saveStepData('authDetail', {
      extra: form.value.extra
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
</style> 