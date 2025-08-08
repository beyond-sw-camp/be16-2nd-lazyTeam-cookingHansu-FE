<template>
  <v-dialog 
    v-model="dialog" 
    max-width="400" 
    persistent
    :retain-focus="false"
    @click:outside="handleOutsideClick"
  >
    <v-card class="delete-modal">
      <!-- 닫기 버튼 -->
      <v-btn
        icon
        size="small"
        variant="text"
        class="close-btn"
        @click="cancel"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <!-- 경고 아이콘 -->
      <div class="warning-icon">
        <v-icon size="48" color="error">mdi-alert-circle</v-icon>
      </div>

      <!-- 메인 메시지 -->
      <h3 class="main-message">{{ title || '삭제 확인' }}</h3>

      <!-- 보조 메시지 -->
      <p class="sub-message">{{ message || '삭제된 항목은 복구할 수 없습니다.' }}</p>

      <!-- 삭제할 항목 정보 (선택적) -->
      <div v-if="itemInfo && itemInfo.title" class="item-info">
        <div class="item-preview">
          <h4 class="item-title">{{ itemInfo.title }}</h4>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="action-buttons">
        <v-btn 
          color="grey" 
          variant="outlined" 
          @click="cancel"
          class="cancel-btn"
        >
          취소
        </v-btn>
        <v-btn 
          color="error" 
          @click="confirm" 
          :loading="loading"
          class="delete-btn"
        >
          삭제하기
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '삭제 확인'
  },
  message: {
    type: String,
    default: '삭제된 항목은 복구할 수 없습니다.'
  },
  itemInfo: {
    type: Object,
    default: null
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
.delete-modal {
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

.delete-modal:hover {
  transform: scale(1.005);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #6b7280;
  transform: scale(1.1);
}

.warning-icon {
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

.item-info {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.item-info:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.item-preview {
  text-align: center;
}

.item-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.4;
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

.delete-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  min-width: 100px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
  transition: all 0.2s ease;
}

.delete-btn:hover {
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.3);
  transform: translateY(-1px);
}

.delete-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .delete-modal {
    margin: 20px;
    padding: 25px 20px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .cancel-btn,
  .delete-btn {
    width: 100%;
  }
}
</style>
