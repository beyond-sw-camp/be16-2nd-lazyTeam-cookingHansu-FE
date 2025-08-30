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
          전체 서비스를 이용하시려면<br>
          다시 로그인해주세요.
        </p>
      </div>
      
      <div class="modal-footer">
        <button 
          class="confirm-btn" 
          @click="handleConfirm"
          :disabled="isLoading"
        >
          {{ isLoading ? '처리 중...' : '로그인하러 가기' }}
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
    // 모달 닫기
    closeModal()
    
    // 로그아웃 처리 (기존 세션 정리)
    await authStore.logout()
    
    // 로그인 페이지로 이동
    router.push('/login')
    
  } catch (error) {
    
    router.push('/login')
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
