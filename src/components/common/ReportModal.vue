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
        <div class="mb-3 mt-4">
          <label class="text-subtitle-2 font-weight-medium mb-1 d-block">신고 대상</label>
          <v-text-field
            :model-value="targetName"
            readonly
            variant="outlined"
            density="compact"
            bg-color="grey-lighten-4"
            hide-details
            class="target-field"
          />
        </div>

        <!-- 신고 사유 -->
        <div class="mb-3">
          <label class="text-subtitle-2 font-weight-medium mb-1 d-block">신고 사유 *</label>
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
              class="mb-1"
            />
          </v-radio-group>
        </div>

        <!-- 상세 내용 -->
        <div class="mb-3">
          <label class="text-subtitle-2 font-weight-medium mb-1 d-block">
            신고 내용 <span class="text-error">*</span>
          </label>
          <v-textarea
            v-model="reportContent"
            variant="outlined"
            rows="4"
            placeholder="신고 사유에 대해 자세히 설명해주세요. (최소 10자 이상)"
            :counter="500"
            maxlength="500"
            hide-details
            density="compact"
            class="content-field"
          />
        </div>

        <!-- 주의사항 -->
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-3"
          density="compact"
        >
          <template #prepend>
            <v-icon size="16">mdi-alert-triangle</v-icon>
          </template>
          <div class="text-subtitle-2 font-weight-medium mb-1">신고 전 유의사항</div>
          <ul class="text-body-2 ma-0 pl-3">
            <li class="mb-1">허위 신고는 제재 대상이 될 수 있습니다</li>
            <li class="mb-1">신고 내용은 관리자만 확인할 수 있습니다</li>
          </ul>
        </v-alert>
      </v-card-text>

      <!-- 액션 버튼 -->
      <v-card-actions class="pa-4 pt-0">
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
          :disabled="!selectedReason"
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
    validator: (value) => ['RECIPE', 'USER', 'COMMENT'].includes(value)
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
  { value: 'INCORRECT_CONTENTS', label: '부적절한 콘텐츠' },
  { value: 'BOTHER_OR_SPIT', label: '괴롭힘 또는 욕설' },
  { value: 'FRAUD_INFORMATION', label: '가짜 정보 또는 사기' },
  { value: 'AUTHORIZATION', label: '저작권 침해' },
  { value: 'ETC', label: '기타' }
];

// 신고 제목 생성
const getReportTitle = () => {
  const titles = {
    'RECIPE': '게시글 신고',
    'USER': '사용자 신고',
    'COMMENT': '댓글 신고'
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
  border-radius: 12px;
}

.report-modal .v-card-title {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 12px;
}

.report-modal .v-card-text {
  max-height: 70vh;
  overflow-y: auto;
  padding-top: 16px;
  min-height: 400px;
}

.target-field {
  font-size: 14px;
}

.content-field {
  font-size: 14px;
  min-height: 120px;
}

.report-modal .v-radio-group {
  margin-top: 4px;
}

.report-modal .v-radio {
  margin-bottom: 2px;
}

.report-modal .v-radio :deep(.v-label) {
  font-size: 14px;
}

.report-modal .v-alert {
  border-radius: 8px;
  padding: 12px;
}

.report-modal .v-alert ul {
  margin: 0;
  padding-left: 16px;
}

.report-modal .v-alert li {
  margin-bottom: 2px;
  line-height: 1.4;
}

.report-modal .v-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: 6px;
}

.report-modal .v-btn.v-btn--variant-outlined {
  border-width: 1px;
}

.report-modal .v-btn.v-btn--variant-flat {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .report-modal .v-card-text {
    max-height: 70vh;
  }
  
  .report-modal .v-radio :deep(.v-label) {
    font-size: 13px;
  }
}
</style>
