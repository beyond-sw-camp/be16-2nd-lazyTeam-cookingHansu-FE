<template>
  <v-container>
    <!-- 제목 -->
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">강의 승인 관리</h2>
        <p>승인 대기 중인 강의를 관리합니다</p>
      </v-col>
    </v-row>

    <!-- 로딩 상태 -->
    <div v-if="lectureApprovalStore.isLoading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="loading-text">강의 목록을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 (네트워크 연결 오류만) -->
    <div v-else-if="lectureApprovalStore.getError" class="error-container">
      <ErrorAlert
        title="연결 오류"
        :message="lectureApprovalStore.getError"
        @close="lectureApprovalStore.clearError"
      />
    </div>

    <!-- 강의 목록 -->
    <template v-else>
      <!-- 승인할 강의가 없을 경우 -->
      <v-row v-if="lectureApprovalStore.getWaitingLectures.length === 0" justify="center" class="mt-10 mb-10">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="grey lighten-2">mdi-teach</v-icon>
          <h3 class="mt-4">승인 대기 중인 강의가 없습니다</h3>
          <p class="mt-2">강의 승인 요청이 도착하면 이곳에 표시됩니다.</p>
        </v-col>
      </v-row>

      <!-- 강의 목록 -->
      <template v-else>
        <v-row>
          <v-col cols="12" v-for="lecture in paginatedLectures" :key="lecture.id">
            <v-card 
              class="pa-4 lecture-card" 
              elevation="2"
              :class="{ 'processing': lectureApprovalStore.isLectureProcessing(lecture.id) }"
            >
              <v-row align="center" justify="space-between">
                <v-col cols="auto" class="d-flex align-center">
                  <v-img
                    :src="lecture.imageUrl || '/default-lecture.png'"
                    width="120"
                    height="90"
                    class="rounded thumbnail mr-4"
                    cover
                  />
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold lecture-title">
                      {{ lecture.title }}
                    </h3>
                    <div class="text-caption text-grey-darken-1">
                      강사: {{ lecture.instructorName }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="auto" class="d-flex align-center">
                  <v-chip color="orange-darken-1" class="mr-3 status-chip" size="small">
                    <v-icon start size="14">mdi-clock-outline</v-icon>
                    승인 대기
                  </v-chip>
                  <v-btn 
                    variant="outlined" 
                    color="info"
                    class="mr-2 action-btn"
                    @click="viewLectureDetail(lecture)"
                  >
                    <v-icon start>mdi-eye</v-icon>
                    상세보기
                  </v-btn>
                  <v-btn 
                    color="success" 
                    variant="elevated"
                    class="mr-2 action-btn" 
                    @click="showApprovalDialog(lecture)"
                    :loading="lectureApprovalStore.isLectureProcessing(lecture.id)"
                    :disabled="lectureApprovalStore.isLectureProcessing(lecture.id)"
                  >
                    <v-icon start>mdi-check</v-icon>
                    승인
                  </v-btn>
                  <v-btn 
                    color="error" 
                    variant="outlined"
                    class="action-btn"
                    @click="showRejectDialog(lecture)"
                    :loading="lectureApprovalStore.isLectureProcessing(lecture.id)"
                    :disabled="lectureApprovalStore.isLectureProcessing(lecture.id)"
                  >
                    <v-icon start>mdi-close</v-icon>
                    거절
                  </v-btn>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <!-- 강의 상세 정보 -->
              <v-row>
                <v-col cols="12">
                  <div class="detail-section">
                    <div class="detail-header">
                      <v-icon color="primary">mdi-teach</v-icon>
                      <strong>강의 상세 정보</strong>
                    </div>
                    <div class="detail-content">
                      <div class="detail-item">
                        <span class="detail-label">설명:</span>
                        <span class="detail-value">{{ lecture.description }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">카테고리:</span>
                        <span class="detail-value">{{ lecture.category }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">강의 시간:</span>
                        <span class="detail-value">{{ formatDuration(lecture.duration) }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">가격:</span>
                        <span class="detail-value">{{ lecture.price?.toLocaleString() }}원</span>
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
            @page-change="currentPage = $event"
          />
        </div>
      </template>
    </template>

    <!-- 승인 확인 모달 -->
    <ApprovalConfirmModal
      v-model="approvalDialog"
      :item-name="selectedLectureTitle"
      item-type="강의"
      :loading="lectureApprovalStore.isLectureProcessing(selectedLecture?.id)"
      @confirm="approveLecture"
    />

    <!-- 거절 확인 모달 -->
    <RejectConfirmModal
      v-model="rejectDialog"
      :item-name="selectedLectureTitle"
      item-type="강의"
      :loading="lectureApprovalStore.isLectureProcessing(selectedLecture?.id)"
      @confirm="rejectLecture"
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
import { ref, computed, onMounted, watch } from "vue";
import { useLectureApprovalStore } from '@/store/admin/lectureApproval'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import Pagination from "../../components/common/Pagination.vue";
import CommonSnackbar from "../../components/common/CommonSnackbar.vue";
import ApprovalConfirmModal from "../../components/common/ApprovalConfirmModal.vue";
import RejectConfirmModal from "../../components/common/RejectConfirmModal.vue";

const lectureApprovalStore = useLectureApprovalStore()

// 페이지네이션
const currentPage = ref(1);
const perPage = 5;

// 승인/거절 다이얼로그 관련
const approvalDialog = ref(false)
const rejectDialog = ref(false)
const selectedLecture = ref(null)
const selectedLectureTitle = ref('')

// 스낵바 관련
const showSnackbar = ref(false);
const snackbarType = ref('success');
const snackbarTitle = ref('');
const snackbarMessage = ref('');

// 페이지네이션된 강의 목록
const paginatedLectures = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return lectureApprovalStore.getWaitingLectures.slice(start, start + perPage);
});

const totalPages = computed(() => Math.ceil(lectureApprovalStore.getWaitingLectures.length / perPage));

// 시간 포맷팅 함수
const formatDuration = (minutes) => {
  if (!minutes) return '0분';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  }
  return `${mins}분`;
};

// 승인 다이얼로그 표시
const showApprovalDialog = (lecture) => {
  selectedLecture.value = lecture;
  selectedLectureTitle.value = lecture.title;
  approvalDialog.value = true;
};

// 강의 승인
const approveLecture = async () => {
  try {
    await lectureApprovalStore.approveLecture(selectedLecture.value.id);
    approvalDialog.value = false;
  } catch (error) {
    console.error('강의 승인 실패:', error);
    // 네트워크 오류가 아닌 경우에만 스낵바 메시지 표시
    if (!error.message || (!error.message.includes('서버와의 연결') && !error.message.includes('네트워크 연결'))) {
      snackbarType.value = 'error';
      snackbarTitle.value = '오류';
      snackbarMessage.value = error.message || '강의 승인에 실패했습니다.';
      showSnackbar.value = true;
    }
  }
};

// 거절 다이얼로그 표시
const showRejectDialog = (lecture) => {
  selectedLecture.value = lecture;
  selectedLectureTitle.value = lecture.title;
  rejectDialog.value = true;
};

// 강의 거절
const rejectLecture = async (reason) => {
  try {
    await lectureApprovalStore.rejectLecture(selectedLecture.value.id, reason);
    rejectDialog.value = false;
  } catch (error) {
    console.error('강의 거절 실패:', error);
    // 네트워크 오류가 아닌 경우에만 스낵바 메시지 표시
    if (!error.message || (!error.message.includes('서버와의 연결') && !error.message.includes('네트워크 연결'))) {
      snackbarType.value = 'error';
      snackbarTitle.value = '오류';
      snackbarMessage.value = error.message || '강의 거절에 실패했습니다.';
      showSnackbar.value = true;
    }
  }
};

// 강의 상세보기
const viewLectureDetail = (lecture) => {
  // TODO: 강의 상세 페이지 라우팅 구현
  // 강의 상세 페이지가 완성되면 아래 주석을 해제하고 라우팅 구현
  // router.push(`/admin/lecture/${lecture.id}`);
  
  console.log('강의 상세보기:', lecture);
  // 임시로 콘솔에 강의 정보 출력
  alert(`강의 상세보기 기능은 준비 중입니다.\n강의 ID: ${lecture.id}\n강의명: ${lecture.title}`);
};

// 성공 메시지 감시
watch(() => lectureApprovalStore.getSuccessMessage, (newMessage) => {
  if (newMessage) {
    snackbarType.value = 'success';
    snackbarTitle.value = '성공';
    snackbarMessage.value = newMessage;
    showSnackbar.value = true;
  }
});

// 스낵바 닫기
const closeSnackbar = () => {
  showSnackbar.value = false;
  lectureApprovalStore.clearMessages();
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await lectureApprovalStore.fetchWaitingLectures();
});
</script>
  
<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-text {
  margin-top: 20px;
  color: #666;
  font-size: 1.1rem;
}

.error-container {
  margin: 20px 0;
}

/* 강의 카드 스타일 */
.lecture-card {
  border-radius: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.lecture-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.lecture-card.processing {
  opacity: 0.6;
  transform: scale(0.98);
  pointer-events: none;
}

/* 부드러운 제거 애니메이션 */
.lecture-card-enter-active,
.lecture-card-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.lecture-card-leave-to {
  opacity: 0;
  transform: translateX(-100%);
  height: 0;
  margin: 0;
  padding: 0;
}

.lecture-title {
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

.thumbnail {
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 상세 정보 스타일 */
.detail-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #2c3e50;
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
  .lecture-card {
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