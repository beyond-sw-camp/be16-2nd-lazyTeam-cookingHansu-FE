<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">🎉 회원가입 승인 완료</h3>
        <button class="close-btn" @click="closeModal">×</button>
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
          {{ isLoading ? '권한 갱신 중...' : '확인' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const router = useRouter()
const isLoading = ref(false)

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}

const handleConfirm = async () => {
  isLoading.value = true
  
  try {
    if (!authStore.accessToken) {
      throw new Error('Access token이 없습니다.')
    }
    
    // 사용자 정보 갱신
    const userResponse = await fetch('http://localhost:8080/user/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    if (userResponse.ok) {
      const userData = await userResponse.json()
      
      // 새로운 사용자 정보로 업데이트
      if (userData.data) {
        authStore.user = userData.data
        localStorage.setItem('user', JSON.stringify(userData.data))
        
        // 사용자 정보에서 역할 확인
        let newRole = userData.data.role || 'GENERAL'
        
        // 역할 업데이트
        authStore.user.role = newRole
        localStorage.setItem('userRole', newRole)
        
        // 모달 닫기
        closeModal()

        // 페이지 이동
        router.push('/mypage')
        
      } else {
        throw new Error('사용자 정보를 받을 수 없습니다.')
      }
    } else {
      throw new Error('사용자 정보 조회 실패')
    }
    
  } catch (error) {
    console.error('권한 갱신 실패:', error)
    
    if (error.message.includes('Access token이 없습니다')) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.')
      router.push('/login')
    } else {
      alert('권한 갱신에 실패했습니다. 다시 시도해주세요.')
    }
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

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #666;
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
  background: linear-gradient(135deg, #ff6b35, #f7931e);
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
