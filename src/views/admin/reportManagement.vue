<template>
  <v-container>
    <!-- 제목 -->
    <h2 class="text-h5 font-weight-bold mb-1">신고 관리</h2>
    <p class="mb-6">플랫폼 내 신고 사항을 관리하세요</p>

    <!-- 로딩 상태 -->
    <LoadingScreen 
      v-if="reportManagementStore.isLoading"
      title="신고 목록을 불러오는 중"
      description="플랫폼 내 신고 사항들을 확인하고 있어요..."
    />

    <!-- 에러 상태 (네트워크 연결 오류만) -->
    <div v-else-if="reportManagementStore.getError" class="error-container">
      <ErrorAlert
        title="연결 오류"
        :message="reportManagementStore.getError"
        @close="reportManagementStore.clearError"
      />
    </div>

    <!-- 탭과 신고 목록 -->
    <template v-else>
      <!-- 탭 네비게이션 -->
      <v-card class="mb-6" elevation="0">
        <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="custom-tabs">
          <v-tab value="all" class="tab-item">
            <v-icon start>mdi-view-list</v-icon>
            전체 ({{ allReports.length }})
          </v-tab>
          <v-tab value="user" class="tab-item">
            <v-icon start>mdi-account-alert</v-icon>
            사용자 ({{ userReports.length }})
          </v-tab>
          <v-tab value="recipe" class="tab-item">
            <v-icon start>mdi-silverware-fork-knife</v-icon>
            레시피 ({{ recipeReports.length }})
          </v-tab>
          <v-tab value="comment" class="tab-item">
            <v-icon start>mdi-comment-alert</v-icon>
            댓글 ({{ commentReports.length }})
          </v-tab>
        </v-tabs>
      </v-card>

      <!-- 처리할 신고가 없을 경우 -->
      <v-row v-if="filteredReports.length === 0" justify="center" class="mt-10 mb-10">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="grey lighten-2">mdi-flag-outline</v-icon>
          <h3 class="mt-4">{{ getEmptyMessage() }}</h3>
          <p class="mt-2">{{ getEmptyDescription() }}</p>
        </v-col>
      </v-row>

      <!-- 신고 목록 -->
      <template v-else>
        <v-row>
          <v-col cols="12" v-for="report in paginatedReports" :key="report.id">
            <v-card 
              class="pa-6 report-card" 
              elevation="2"
              :class="{ 'processing': reportManagementStore.isReportProcessing(report.id) }"
            >
              <v-row align="center" justify="space-between">
                <v-col cols="auto" class="d-flex align-center">
                                    <div>
                    <v-chip
                      :color="getReportTypeColor(report.reportType)"
                      text-color="white"
                      class="mb-2"
                      size="small"
                    >
                      {{ getReportTypeLabel(report.reportType) }}
                    </v-chip>
                    <h3 class="text-subtitle-1 font-weight-bold report-title">
                      {{ getReportReasonLabel(report.reportReasonType) }}
                    </h3>
                    <div class="text-caption text-grey-darken-1">
                      신고일: {{ formatDateTime(report.createdAt) }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="auto" class="d-flex align-center">
                  <v-chip color="orange-darken-1" class="mr-3 status-chip" size="small">
                    <v-icon start size="14">mdi-clock-outline</v-icon>
                    처리 대기
                  </v-chip>
                  <v-btn 
                    color="success" 
                    variant="elevated"
                    class="mr-2 action-btn" 
                    @click="showApprovalDialog(report)"
                    :loading="reportManagementStore.isReportProcessing(report.id)"
                    :disabled="reportManagementStore.isReportProcessing(report.id)"
                  >
                    <v-icon start>mdi-check</v-icon>
                    승인
                  </v-btn>
                  <v-btn 
                    color="error" 
                    variant="outlined"
                    class="action-btn"
                    @click="showRejectDialog(report)"
                    :loading="reportManagementStore.isReportProcessing(report.id)"
                    :disabled="reportManagementStore.isReportProcessing(report.id)"
                  >
                    <v-icon start>mdi-close</v-icon>
                    거절
                  </v-btn>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <!-- 신고 상세 정보 -->
              <v-row>
                <v-col cols="12">
                  <div class="detail-section">
                    <div class="detail-header">
                      <v-icon class="mr-1" color="orange">mdi-information-outline</v-icon>
                      <strong>신고 상세 정보</strong>
                    </div>
                    <div class="detail-content">
                      <div class="detail-item">
                        <span class="detail-label">신고자 닉네임:</span>
                        <span class="detail-value">{{ report.reporterNickName }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">신고 대상 ID:</span>
                        <span class="detail-value">{{ report.targetId }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">신고 내용:</span>
                        <span class="detail-value">{{ report.content }}</span>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- 페이지네이션 -->
        <div class="d-flex justify-center mt-6">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
          />
        </div>
      </template>
    </template>

    <!-- 승인 확인 모달 -->
    <ApprovalConfirmModal
      v-model="approvalDialog"
      :item-name="selectedReportTitle"
      item-type="신고"
      :loading="reportManagementStore.isReportProcessing(selectedReport?.id)"
      @confirm="approveReport"
    />

    <!-- 거절 확인 모달 -->
    <RejectConfirmModal
      v-model="rejectDialog"
      :item-name="selectedReportTitle"
      item-type="신고"
      :loading="reportManagementStore.isReportProcessing(selectedReport?.id)"
      @confirm="rejectReport"
    />

    <!-- 공용 스낵바 -->
    <CommonSnackbar
      v-if="showSnackbar"
      :type="snackbarType"
      :title="snackbarTitle"
      :message="snackbarMessage"
      @close="closeSnackbar"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useReportManagementStore } from '@/store/admin/reportManagement';
import { useAuthStore } from '@/store/auth/auth';
import { useAdminLoginStore } from '@/store/admin/adminLogin';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import Pagination from '../../components/common/Pagination.vue';
import CommonSnackbar from '../../components/common/CommonSnackbar.vue';
import ApprovalConfirmModal from '../../components/common/ApprovalConfirmModal.vue';
import RejectConfirmModal from '../../components/common/RejectConfirmModal.vue';
import LoadingScreen from '../../components/common/LoadingScreen.vue';
import { formatDateTime } from '@/utils/timeUtils';

const reportManagementStore = useReportManagementStore();
const authStore = useAuthStore();
const adminLoginStore = useAdminLoginStore();

// 관리자 권한 확인
const isAdmin = computed(() => {
  const userRole = authStore.getUserRole
  return userRole === 'ADMIN' || adminLoginStore.isLoggedIn
})

// 탭 상태
const activeTab = ref('all');

// 페이지네이션
const currentPage = ref(1);
const perPage = 5;

// 승인/거절 다이얼로그 관련
const approvalDialog = ref(false);
const rejectDialog = ref(false);
const selectedReport = ref(null);
const selectedReportTitle = ref('');

// 스낵바 관련
const showSnackbar = ref(false);
const snackbarType = ref('success');
const snackbarTitle = ref('');
const snackbarMessage = ref('');

// 모든 신고 목록
const allReports = computed(() => {
  return reportManagementStore.getReports;
});

// 사용자 신고만 필터링
const userReports = computed(() => {
  return allReports.value.filter(report => report.reportType === 'USER');
});

// 레시피 신고만 필터링
const recipeReports = computed(() => {
  return allReports.value.filter(report => report.reportType === 'RECIPE');
});

// 댓글 신고만 필터링
const commentReports = computed(() => {
  return allReports.value.filter(report => report.reportType === 'COMMENT');
});

// 탭에 따른 필터링된 신고 목록
const filteredReports = computed(() => {
  switch (activeTab.value) {
    case 'user':
      return userReports.value;
    case 'recipe':
      return recipeReports.value;
    case 'comment':
      return commentReports.value;
    default:
      return allReports.value;
  }
});

// 페이지네이션된 신고 목록
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredReports.value.slice(start, start + perPage);
});

const totalPages = computed(() => Math.ceil(filteredReports.value.length / perPage));

// 탭이 변경될 때 첫 페이지로 이동
watch(activeTab, () => {
  currentPage.value = 1;
});

// 페이지 변경 시 상단으로 스크롤
const handlePageChange = (page) => {
  currentPage.value = page;
  // 상단으로 스크롤
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 빈 상태 메시지
const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'user':
      return '사용자 신고가 없습니다';
    case 'recipe':
      return '레시피 신고가 없습니다';
    case 'comment':
      return '댓글 신고가 없습니다';
    default:
      return '처리할 신고가 없습니다';
  }
};

const getEmptyDescription = () => {
  switch (activeTab.value) {
    case 'user':
      return '사용자 신고가 접수되면 이곳에 표시됩니다.';
    case 'recipe':
      return '레시피 신고가 접수되면 이곳에 표시됩니다.';
    case 'comment':
      return '댓글 신고가 접수되면 이곳에 표시됩니다.';
    default:
      return '새로운 신고가 접수되면 이곳에 표시됩니다.';
  }
};

// 신고 유형별 색상
const getReportTypeColor = (reportType) => {
  const colors = {
    'USER': 'red',
    'LECTURE': 'blue',
    'RECIPE': 'green',
    'COMMENT': 'orange',
  };
  return colors[reportType] || 'grey';
};

// 신고 유형별 라벨
const getReportTypeLabel = (reportType) => {
  const labels = {
    'USER': '사용자',
    'LECTURE': '강의',
    'RECIPE': '레시피',
    'COMMENT': '댓글',
  };
  return labels[reportType] || '기타';
};

// 신고 사유별 라벨
const getReportReasonLabel = (reasonType) => {
  const labels = {
    'SPAM_OR_ADS': ' 스팸 또는 광고',
    'INCORRECT_CONTENTS': '잘못된 내용',
    'BOTHER_OR_SPIT': ' 불쾌감 또는 혐오',
    'FRAUD_INFORMATION': '사기 정보',
    'AUTHORIZATION': '권한 침해',
    'ETC': '기타',
  };
  return labels[reasonType] || '기타';
};

// 승인 다이얼로그 표시
const showApprovalDialog = (report) => {
  selectedReport.value = report;
  selectedReportTitle.value = `${getReportTypeLabel(report.reportType)} 신고`;
  approvalDialog.value = true;
};

// 신고 승인
const approveReport = async () => {
  try {
    await reportManagementStore.approveReport(selectedReport.value.id);
    approvalDialog.value = false;
    
    // store에서 이미 승인된 신고를 자동으로 제거하므로 추가 API 호출 불필요
  } catch (error) {
    console.error('신고 승인 실패:', error);
    // 네트워크 오류가 아닌 경우에만 스낵바 메시지 표시
    if (!error.message || (!error.message.includes('서버와의 연결') && !error.message.includes('네트워크 연결'))) {
      snackbarType.value = 'error';
      snackbarTitle.value = '오류';
      snackbarMessage.value = error.message || '신고 승인에 실패했습니다.';
      showSnackbar.value = true;
    }
  }
};

// 거절 다이얼로그 표시
const showRejectDialog = (report) => {
  selectedReport.value = report;
  selectedReportTitle.value = `${getReportTypeLabel(report.reportType)} 신고`;
  rejectDialog.value = true;
};

// 신고 거절
const rejectReport = async (reason) => {
  try {
    await reportManagementStore.rejectReport(selectedReport.value.id, reason);
    rejectDialog.value = false;
    
    // store에서 이미 거절된 신고를 자동으로 제거하므로 추가 API 호출 불필요
  } catch (error) {
    console.error('신고 거절 실패:', error);
    // 네트워크 오류가 아닌 경우에만 스낵바 메시지 표시
    if (!error.message || (!error.message.includes('서버와의 연결') && !error.message.includes('네트워크 연결'))) {
      snackbarType.value = 'error';
      snackbarTitle.value = '오류';
      snackbarMessage.value = error.message || '신고 거절에 실패했습니다.';
      showSnackbar.value = true;
    }
  }
};

// 성공 메시지 감시
watch(() => reportManagementStore.getSuccessMessage, (newMessage) => {
  if (newMessage) {
    snackbarType.value = 'success';
    snackbarTitle.value = '성공';
    snackbarMessage.value = newMessage;
    showSnackbar.value = true;
    
    // 1초 후 자동으로 닫기
    setTimeout(() => {
      closeSnackbar();
    }, 1000);
  }
});

// 스낵바 닫기
const closeSnackbar = () => {
  showSnackbar.value = false;
  reportManagementStore.clearMessages();
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  // 관리자 권한 확인
  if (!isAdmin.value) {
    console.error('관리자 권한이 없습니다.')
    return
  }
  
  await reportManagementStore.fetchReports(0, 50);
});
</script>

<style scoped>
.error-container {
  margin: 20px 0;
}

/* 탭 스타일 */
.custom-tabs {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  overflow: hidden;
}

.tab-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  border-radius: 10px !important;
  margin: 4px;
  position: relative;
}

/* 탭 정렬 수정 */
.custom-tabs .v-tab {
  justify-content: flex-start !important;
  text-align: left !important;
}

.report-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
border-radius: 12px;
  overflow: hidden;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.report-card.processing {
  opacity: 0.6;
  transform: scale(0.98);
  pointer-events: none;
}

/* 부드러운 제거 애니메이션 */
.report-card-enter-active,
.report-card-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.report-card-leave-to {
  opacity: 0;
  transform: translateX(-100%);
  height: 0;
  margin: 0;
  padding: 0;
}

.report-title {
  color: #2c3e50;
  margin: 8px 0 4px 0;
}

.status-chip {
  font-weight: 500;
}

.action-btn {
  font-weight: 600;
  min-width: 80px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 상세 정보 스타일 */
.detail-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #2c3e50;
font-weight: 600;
}

.detail-content {
  margin-left: 24px;
}

.detail-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
}

.detail-value {
  color: #2c3e50;
  flex: 1;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .report-card {
    margin-bottom: 12px;
  }
  
  .detail-section {
    padding: 12px;
  }
  
  .detail-content {
    margin-left: 0;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .detail-label {
    min-width: auto;
    font-size: 0.9rem;
  }
  
  .action-btn {
    min-width: 70px;
    font-size: 0.9rem;
  }
}
</style>
  