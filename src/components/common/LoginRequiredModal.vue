<template>
  <div v-if="dialog" class="modal-overlay" @click="handleOutsideClick">
    <div class="cart-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="cancel">×</button>
      </div>
      <div class="modal-content">
        <div class="modal-icon">🔐</div>
        <p class="modal-message">{{ message }}</p>
        <p v-if="subMessage" class="modal-submessage">{{ subMessage }}</p>
      </div>
      <div class="modal-actions">
        <button class="btn-primary" @click="confirm" :disabled="loading">
          {{ loading ? '처리 중...' : confirmText }}
        </button>
        <button class="btn-secondary" @click="cancel">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '로그인이 필요합니다'
  },
  message: {
    type: String,
    default: '이 기능을 사용하려면 로그인이 필요합니다.'
  },
  subMessage: {
    type: String,
    default: '로그인 후 모든 기능을 이용하실 수 있습니다.'
  },
  confirmText: {
    type: String,
    default: '로그인하기'
  },
  cancelText: {
    type: String,
    default: '취소'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const dialog = ref(props.modelValue);

// ESC 키 이벤트 핸들러
const handleEscKey = (event) => {
  if (event.key === 'Escape' && dialog.value) {
    cancel();
  }
};

// 외부 클릭 핸들러
const handleOutsideClick = () => {
  if (dialog.value) {
    cancel();
  }
};

// 이벤트 리스너 관리
const addEventListeners = () => {
  document.addEventListener('keydown', handleEscKey);
};

const removeEventListeners = () => {
  document.removeEventListener('keydown', handleEscKey);
};

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal;
  
  // 모달이 열릴 때 이벤트 리스너 추가
  if (newVal) {
    addEventListeners();
  } else {
    removeEventListeners();
  }
});

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal);
  
  // 모달이 닫힐 때 이벤트 리스너 제거
  if (!newVal) {
    removeEventListeners();
  }
});

const confirm = () => {
  emit('confirm');
  dialog.value = false;
};

const cancel = () => {
  emit('cancel');
  dialog.value = false;
};

// 컴포넌트가 언마운트될 때 이벤트 리스너 정리
onUnmounted(() => {
  removeEventListeners();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.cart-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
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
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #666;
}

.modal-content {
  padding: 24px;
  text-align: center;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.modal-message {
  font-size: 1rem;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.5;
  font-weight: 500;
}

.modal-submessage {
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px 24px;
}

.btn-primary {
  flex: 1;
  background: #ff7a00;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #e66a00;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 122, 0, 0.3);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  flex: 1;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #bbb;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .cart-modal {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
