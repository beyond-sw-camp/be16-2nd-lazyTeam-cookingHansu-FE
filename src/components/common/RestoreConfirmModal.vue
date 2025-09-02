<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="header-spacer"></div>
        <h3>회원 복구</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="info-message">
          <p><strong>회원 정보를 복구하시겠습니까?</strong></p>
          <p>회원 복구 시 다음 사항들이 적용됩니다:</p>
          <ul>
            <li>기존 개인정보가 복원됩니다</li>
            <li>작성한 게시글과 레시피가 복원됩니다</li>
            <li>구매한 강의 정보가 복원됩니다</li>
            <li>계정이 활성 상태로 변경됩니다</li>
          </ul>
        </div>
        
        <div class="confirm-checkbox">
          <label>
            <input 
              type="checkbox" 
              v-model="confirmChecked"
              @change="validateForm"
            />
            위 내용을 모두 확인했으며, 회원 복구에 동의합니다
          </label>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">취소</button>
        <button 
          class="restore-btn" 
          :disabled="!confirmChecked"
          @click="confirmRestore"
        >
          복구하기
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth/auth';

export default {
  name: 'RestoreConfirmModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      confirmChecked: false
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
      this.confirmChecked = false;
    },
    
    async confirmRestore() {
      if (!this.confirmChecked) {
        return;
      }
      
      try {
        const authStore = useAuthStore();
        const result = await authStore.restoreUser();
        
        if (result.success) {
          // 회원 복구 성공
          this.$emit('restore-success', result.message);
          this.closeModal();
        } else {
          throw new Error(result.message || '회원 복구에 실패했습니다.');
        }
      } catch (error) {
        console.error('회원 복구 오류:', error);
        this.$emit('restore-error', error.message);
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  position: relative;
}

.header-spacer {
  width: 32px;
  height: 32px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 24px;
}

.info-message {
  margin-bottom: 24px;
}

.info-message p {
  margin: 0 0 12px 0;
  color: #333;
  line-height: 1.5;
}

.info-message ul {
  margin: 12px 0;
  padding-left: 20px;
}

.info-message li {
  margin: 8px 0;
  color: #666;
  line-height: 1.4;
}

.confirm-checkbox {
  margin-top: 20px;
}

.confirm-checkbox label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.confirm-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.restore-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.restore-btn {
  background: #28a745;
  color: white;
}

.restore-btn:hover:not(:disabled) {
  background: #218838;
}

.restore-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 20px;
    max-height: calc(100vh - 40px);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
}
</style>
