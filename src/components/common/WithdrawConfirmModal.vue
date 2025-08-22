<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="header-spacer"></div>
        <h3>회원 탈퇴</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="warning-message">
          <p><strong>정말로 탈퇴하시겠습니까?</strong></p>
          <p>회원 탈퇴 시 다음 사항들이 적용됩니다:</p>
          <ul>
            <li>모든 개인정보가 삭제됩니다</li>
            <li>작성한 게시글과 레시피가 삭제됩니다</li>
            <li>구매한 강의 정보가 삭제됩니다</li>
          </ul>
        </div>
        
        <div class="confirm-checkbox">
          <label>
            <input 
              type="checkbox" 
              v-model="confirmChecked"
              @change="validateForm"
            />
            위 내용을 모두 확인했으며, 회원 탈퇴에 동의합니다
          </label>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">취소</button>
        <button 
          class="withdraw-btn" 
          :disabled="!confirmChecked"
          @click="confirmWithdraw"
        >
          탈퇴하기
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WithdrawConfirmModal',
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
    
    async confirmWithdraw() {
      if (!this.confirmChecked) {
        return;
      }
      
      try {
        const response = await fetch('http://localhost:8080/api/my/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          // 회원탈퇴 성공
          this.$emit('withdraw-success');
          this.closeModal();
        } else {
          throw new Error('회원탈퇴에 실패했습니다.');
        }
      } catch (error) {
        console.error('회원탈퇴 오류:', error);
        this.$emit('withdraw-error', error.message);
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

.warning-message {
  margin-bottom: 24px;
}

.warning-message p {
  margin: 0 0 12px 0;
  color: #333;
  line-height: 1.5;
}

.warning-message ul {
  margin: 12px 0;
  padding-left: 20px;
}

.warning-message li {
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
.withdraw-btn {
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

.withdraw-btn {
  background: #dc3545;
  color: white;
}

.withdraw-btn:hover:not(:disabled) {
  background: #c82333;
}

.withdraw-btn:disabled {
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