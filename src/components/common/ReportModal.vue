<template>
  <v-dialog 
    v-model="dialog" 
    max-width="450" 
    max-height="80vh"
    :retain-focus="false"
    @click:outside="closeModal"
    @keydown.esc="closeModal"
  >
    <v-card class="report-modal">
      <!-- 헤더 -->
      <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
        <div class="d-flex align-center">
          <v-icon color="error" class="mr-3" size="20">mdi-alert-triangle</v-icon>
          <span class="text-h6 font-weight-bold">{{ getReportTitle() }}</span>
        </div>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="closeModal"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4 pt-0">
        <!-- 신고 대상 -->
        <div class="mb-4 mt-4">
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">신고 대상</label>
          <div class="target-display">
            <span class="target-text">{{ targetName }}</span>
          </div>
        </div>

        <!-- 신고 사유 -->
        <div class="mb-4">
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">신고 사유 *</label>
          <v-radio-group
            v-model="selectedReason"
            hide-details
            class="mt-1"
          >
            <v-radio
              v-for="reason in reportReasons"
              :key="reason.value"
              :value="reason.value"
              :label="reason.label"
              color="error"
              density="compact"
              class="mb-2"
            />
          </v-radio-group>
        </div>

        <!-- 상세 내용 -->
        <div class="mb-4">
          <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
            신고 내용 <span class="text-error">*</span>
          </label>
          <v-textarea
            v-model="reportContent"
            variant="outlined"
            rows="4"
            placeholder="신고 사유에 대해 자세히 설명해주세요."
            :counter="500"
            maxlength="500"
            hide-details
            density="compact"
            class="content-field"
          />
        </div>

        <!-- 주의사항 -->
        <div class="warning-section mb-4">
          <div class="warning-title">
            <v-icon color="error" size="18" class="mr-2">mdi-alert-circle</v-icon>
            <span class="warning-text">신고 전 유의사항</span>
          </div>
          <div class="warning-content">
            신고 내용은 관리자만 확인할 수 있고, 허위 신고는 제재 대상이 될 수 있습니다.
          </div>
        </div>
      </v-card-text>

      <!-- 액션 버튼 -->
      <v-card-actions class="pa-4 pt-2">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="closeModal"
          class="mr-2"
        >
          취소
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          @click="submitReport"
          :loading="loading"
          :disabled="!selectedReason || !reportContent"
        >
          신고하기
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { reportService } from '../../services/report/reportService';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  reportType: {
    type: String,
    required: true,
    validator: (value) => ['RECIPE', 'USER', 'COMMENT', 'LECTURE'].includes(value)
  },
  targetId: {
    type: String,
    required: true
  },
  targetName: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'success', 'error']);

const dialog = ref(props.modelValue);
const selectedReason = ref('');
const reportContent = ref('');
const loading = ref(false);

// 신고 사유 목록
const reportReasons = [
  { value: 'SPAM_OR_ADS', label: '스팸 또는 광고' },
  { value: 'INCORRECT_CONTENTS', label: '잘못된 내용' },
  { value: 'BOTHER_OR_SPIT', label: '불쾌감 또는 혐오' },
  { value: 'FRAUD_INFORMATION', label: '사기 정보' },
  { value: 'AUTHORIZATION', label: '권한 침해' },
  { value: 'ETC', label: '기타' }
];

// 신고 제목 생성
const getReportTitle = () => {
  const titles = {
    'RECIPE': '게시글 신고',
    'USER': '사용자 신고',
    'COMMENT': '댓글 신고',
    'LECTURE': '강의 신고'
  };
  return titles[props.reportType] || '신고';
};



// 모달 닫기
const closeModal = () => {
  dialog.value = false;
  resetForm();
  emit('update:modelValue', false);
};

// 폼 초기화
const resetForm = () => {
  selectedReason.value = '';
  reportContent.value = '';
};

// 신고 제출
const submitReport = async () => {
  if (!selectedReason.value) {
    emit('error', '신고 사유를 선택해주세요.');
    return;
  }



  loading.value = true;
  
  try {
    const reportData = {
      reportType: props.reportType,
      targetId: props.targetId,
      reportReasonType: selectedReason.value,
      content: reportContent.value || undefined
    };

    const response = await reportService.createReport(reportData);
    
    if (response.success) {
      emit('success', response);
      closeModal();
    } else {
      emit('error', response.message || '신고 처리 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('신고 제출 오류:', error);
    emit('error', '신고 처리 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

// props 변경 감지
watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue;
});

// 모달 상태 변경 감지
watch(dialog, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped>
.report-modal {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.report-modal .v-card-title {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 16px;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
}

.report-modal .v-card-text {
  max-height: 70vh;
  overflow-y: auto;
  padding-top: 20px;
  min-height: 400px;
}

.target-display {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px 16px;
  min-height: 48px;
  display: flex;
  align-items: center;
}

.target-text {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  line-height: 1.4;
  word-break: break-word;
}

.content-field {
  font-size: 14px;
  min-height: 120px;
  border-radius: 8px;
}

.content-field :deep(.v-field__outline) {
  border-radius: 8px;
}

.content-field :deep(.v-field--focused .v-field__outline) {
  border-color: #dc3545;
}

.warning-section {
  background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 16px;
}

.warning-title {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.warning-text {
  font-size: 14px;
  font-weight: 600;
  color: #dc3545;
}

.warning-content {
  font-size: 13px;
  line-height: 1.5;
  color: #333;
  padding-left: 26px;
}

.report-modal .v-radio-group {
  margin-top: 8px;
}

.report-modal .v-radio {
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.report-modal .v-radio:hover {
  background: #f8f9fa;
}

.report-modal .v-radio :deep(.v-label) {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.report-modal .v-radio :deep(.v-selection-control__input) {
  color: #dc3545;
}

.report-modal .v-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.report-modal .v-btn.v-btn--variant-outlined {
  border-width: 2px;
  border-color: #e0e0e0;
}

.report-modal .v-btn.v-btn--variant-outlined:hover {
  border-color: #ff7a00;
  color: #ff7a00;
}

.report-modal .v-btn.v-btn--variant-flat {
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.report-modal .v-btn.v-btn--variant-flat:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .report-modal .v-card-text {
    max-height: 70vh;
  }
  
  .report-modal .v-radio :deep(.v-label) {
    font-size: 13px;
  }
  
  .target-text {
    font-size: 13px;
  }
  
  .warning-content {
    font-size: 12px;
  }
}
</style>
