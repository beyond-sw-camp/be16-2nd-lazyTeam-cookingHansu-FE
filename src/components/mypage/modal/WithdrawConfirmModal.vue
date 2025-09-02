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
            <li>북마크와 좋아요 정보가 삭제됩니다</li>
            <li>채팅 기록이 삭제됩니다</li>
          </ul>
          <p class="warning-note"><strong>※ 이 작업은 되돌릴 수 없습니다.</strong></p>
        </div>
        
        <div class="confirm-checkbox">
          <label>
            <input 
              type="checkbox" 
              v-model="confirmChecked"
            />
            위 내용을 모두 확인했으며, 회원 탈퇴에 동의합니다
          </label>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">취소</button>
        <button 
          class="withdraw-btn" 
          :disabled="!confirmChecked || loading"
          @click="confirmWithdraw"
        >
          {{ loading ? '처리 중...' : '탈퇴하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth/auth';

export default {
  name: 'WithdrawConfirmModal',
  emits: ['close', 'withdraw-error'],
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      confirmChecked: false,
      loading: false
    };
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        // 모달이 열릴 때 body 스크롤 방지
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
      } else {
        // 모달이 닫힐 때 body 스크롤 복원
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  },

  beforeUnmount() {
    // 컴포넌트가 제거될 때 body 스크롤 복원
    const scrollY = document.body.style.top;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  },

  methods: {
    closeModal() {
      this.$emit('close');
      this.confirmChecked = false;
      this.loading = false;
    },
    
    validateForm() {
      // 체크박스 상태에 따른 유효성 검사
      return this.confirmChecked;
    },
    
    async confirmWithdraw() {
      if (!this.confirmChecked) {
        return;
      }
      
      this.loading = true;
      
      try {
        const authStore = useAuthStore();
        const result = await authStore.deleteUser();
        
        if (result.success) {
          // 회원탈퇴 성공 시 탈퇴 완료 페이지로 리다이렉트
          this.$router.push('/withdraw-complete');
        } else {
          throw new Error(result.message || '회원탈퇴에 실패했습니다.');
        }
      } catch (error) {
        console.error('회원탈퇴 오류:', error);
        this.$emit('withdraw-error', error.message);
      } finally {
        this.loading = false;
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
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  position: relative;
}

.header-spacer {
  width: 32px;
  height: 32px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
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
  padding: 20px 24px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
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

.warning-note {
  color: #dc3545 !important;
  font-size: 14px;
  margin-top: 16px !important;
  padding: 12px;
  background: #fff5f5;
  border-radius: 8px;
  border-left: 4px solid #dc3545;
}

.confirm-checkbox {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
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
  accent-color: #dc3545;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
  background: white;
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
  min-height: 44px;
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-content {
    max-width: 100%;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-body {
    padding: 16px 20px;
  }
  
  .modal-footer {
    padding: 12px 20px;
  }
  
  .modal-header h3 {
    font-size: 16px;
  }
  
  .warning-message p {
    font-size: 14px;
  }
  
  .warning-message li {
    font-size: 13px;
  }
  
  .confirm-checkbox label {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 12px 16px;
  }
  
  .cancel-btn,
  .withdraw-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .warning-message ul {
    padding-left: 16px;
  }
}
</style>