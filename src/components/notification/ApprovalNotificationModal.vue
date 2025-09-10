<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">🎉 회원가입 승인 완료</h3>
      </div>
      
      <div class="modal-body">
        <div class="approval-icon">✅</div>
        <p class="approval-message">
          회원가입이 승인되었습니다!<br>
          이제 모든 서비스를 이용하실 수 있습니다.
        </p>
      </div>
      
      <div class="modal-footer">
        <button 
          class="confirm-btn" 
          @click="handleConfirm"
          :disabled="isLoading"
        >
          {{ isLoading ? '처리 중...' : '확인' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/auth/auth'
import { useNotificationStore } from '@/store/notification/notification'
import { useRouter } from 'vue-router'
import { apiClient } from '@/utils/interceptor'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const isLoading = ref(false)

const closeModal = () => {
  notificationStore.closeApprovalModal()
  emit('close')
}

// ESC 키 비활성화
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const handleConfirm = async () => {
  isLoading.value = true
  
  try {
    // 1. 토큰 갱신
    const refreshResponse = await apiClient.post('/user/refresh', {
      refreshToken: authStore.refreshToken
    })
    
    if (refreshResponse.data.success && refreshResponse.data.data) {
      // 새로운 토큰으로 auth store 업데이트
      const { accessToken, refreshToken, expiresIn } = refreshResponse.data.data
      authStore.accessToken = accessToken
      authStore.refreshToken = refreshToken
      authStore.expiresIn = Date.now() + expiresIn
      
      // 로컬 스토리지 업데이트
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('expiresIn', authStore.expiresIn)
      
      // 토큰 갱신 후 잠시 대기 (API 요청이 새로운 토큰을 사용하도록)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // 2. 최신 사용자 정보 조회하여 역할 갱신
    await authStore.getCurrentUser()
    
    // 3. 로컬스토리지의 user 정보가 업데이트되었는지 확인하고 userRole도 업데이트
    const updatedUser = localStorage.getItem('user')
    if (updatedUser) {
      try {
        const userData = JSON.parse(updatedUser)
        
        // userRole도 함께 업데이트
        if (userData.role) {
          localStorage.setItem('userRole', userData.role)
        }
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error)
      }
    }
    
    // 4. 모달 닫기
    closeModal()
    
    // 5. 홈페이지로 이동
    if (router.currentRoute.value.path === '/login') {
      router.push('/')
    }
    
  } catch (error) {
    console.error('승인 처리 실패:', error)
    // 갱신 실패 시에도 모달은 닫기
    closeModal()
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: none;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}



.modal-body {
  padding: 24px;
  text-align: center;
}

.approval-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.approval-message {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.5;
}

.modal-footer {
  padding: 0 24px 24px 24px;
  display: flex;
  justify-content: center;
}

.confirm-btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.confirm-btn:hover:not(:disabled) {
  background: #e55a2b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.confirm-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .modal-title {
    font-size: 1.2rem;
  }
  
  .approval-message {
    font-size: 1rem;
  }
}
</style>
