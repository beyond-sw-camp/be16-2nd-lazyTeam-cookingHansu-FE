<template>
  <v-dialog 
    v-model="dialog" 
    max-width="400" 
    persistent
    :retain-focus="false"
    @click:outside="handleOutsideClick"
  >
    <v-card class="common-modal">
      <!-- 헤더 (제목 + 닫기 버튼) -->
      <div class="modal-header">
        <h3 class="main-message">{{ title }}</h3>
        <v-btn
          icon
          size="small"
          variant="text"
          class="close-btn"
          @click="cancel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- 아이콘 -->
      <div class="modal-icon">
        <v-icon size="48" :color="iconColor">{{ icon }}</v-icon>
      </div>

      <!-- 보조 메시지 -->
      <p class="sub-message">{{ message }}</p>

      <!-- 액션 버튼 -->
      <div class="action-buttons">
        <v-btn 
          v-if="showCancelButton"
          color="grey" 
          variant="outlined" 
          @click="cancel"
          class="cancel-btn"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn 
          :color="confirmButtonColor" 
          @click="confirm" 
          :loading="loading"
          class="confirm-btn"
        >
          {{ confirmText }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // 'info', 'success', 'warning', 'error'
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: '알림'
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '확인'
  },
  cancelText: {
    type: String,
    default: '취소'
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const dialog = ref(props.modelValue);

// 타입별 아이콘과 색상 설정
const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'mdi-check-circle';
    case 'warning':
      return 'mdi-alert-circle';
    case 'error':
      return 'mdi-close-circle';
    default:
      return 'mdi-information';
  }
});

const iconColor = computed(() => {
  switch (props.type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'primary';
  }
});

const confirmButtonColor = computed(() => {
  switch (props.type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'primary';
  }
});



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
  if (!props.showCancelButton) {
    dialog.value = false;
  }
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
.common-modal {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  background: white;
  position: relative;
  padding: 30px 25px;
  text-align: center;
  transform: scale(1);
  transition: all 0.2s ease;
}

.common-modal:hover {
  transform: scale(1.005);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  color: #9ca3af;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #6b7280;
  transform: scale(1.1);
}

.modal-icon {
  margin: 20px 0 25px 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.main-message {
  font-size: 1.3rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.sub-message {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 25px 0;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
}

.cancel-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  min-width: 100px;
  transition: all 0.2s ease;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #9ca3af;
}

.confirm-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  min-width: 100px;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.confirm-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .common-modal {
    margin: 20px;
    padding: 25px 20px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .cancel-btn,
  .confirm-btn {
    width: 100%;
  }
}
</style>
