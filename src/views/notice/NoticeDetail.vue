<template>
  <div class="notice-detail-container">

    <!-- 로딩 상태 (데이터가 없을 때만) -->
    <LoadingScreen 
      v-if="noticeStore.isLoading && !noticeStore.getCurrentNotice"
      title="공지사항을 준비하고 있어요"
      description="잠시만 기다려주세요..."
    />

    <!-- 에러 상태 -->
    <div v-else-if="noticeStore.getError" class="error-container">
      <ErrorAlert
        title="연결 오류"
        :message="noticeStore.getError"
        @close="noticeStore.clearError"
      />
      <div class="error-actions">
        <v-btn color="primary" @click="goBack">목록으로 돌아가기</v-btn>
      </div>
    </div>

    <!-- 공지사항 상세 내용 -->
    <div v-else-if="noticeStore.getCurrentNotice" class="notice-detail-content">
      <div class="notice-detail-header">
        <div class="back-button">
          <v-btn
            icon
            variant="text"
            @click="goBack"
            prepend-icon="mdi-arrow-left"
          >
            뒤로가기
          </v-btn>
        </div>
        
        <div class="notice-detail-actions" v-if="isAdmin">
          <v-btn
            color="primary"
            variant="outlined"
            @click="goToEditNotice"
            prepend-icon="mdi-pencil"
          >
            수정
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            @click="confirmDelete"
            prepend-icon="mdi-delete"
          >
            삭제
          </v-btn>
        </div>
      </div>

      <div class="notice-detail-body">
        <div class="notice-title-section">
          <h1 class="notice-title">{{ noticeStore.getCurrentNotice.title }}</h1>
          <div class="notice-meta">
            <div class="notice-meta-item">
              <v-icon size="small" color="grey">mdi-account</v-icon>
              <span>{{ noticeStore.getCurrentNotice.adminName }}</span>
            </div>
                          <div class="notice-meta-item">
                <v-icon size="small" color="grey">mdi-calendar</v-icon>
                <span>{{ formatDateTime(noticeStore.getCurrentNotice.createdAt) }}</span>
              </div>
          </div>
        </div>

        <div class="notice-content-section">
          <!-- 이미지가 있는 경우 -->
          <div v-if="noticeStore.getCurrentNotice.imageUrl" class="notice-image">
            <img
              :src="noticeStore.getCurrentNotice.imageUrl"
              :alt="noticeStore.getCurrentNotice.title"
              class="notice-image-content"
            />
          </div>

          <!-- 공지사항 내용 -->
          <div class="notice-content">
            <div class="content-text" v-html="formatContent(noticeStore.getCurrentNotice.content)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 공지사항이 없는 경우 -->
    <div v-else class="not-found-container">
      <v-icon size="64" color="grey">mdi-alert-circle</v-icon>
      <h3>공지사항을 찾을 수 없습니다</h3>
      <p>요청하신 공지사항이 존재하지 않거나 삭제되었습니다.</p>
      <v-btn color="primary" @click="goBack">목록으로 돌아가기</v-btn>
    </div>

    <!-- 공용 삭제 확인 모달 -->
    <DeleteConfirmModal
      v-model="deleteDialog"
      title="공지사항을 삭제하시겠습니까?"
      message="삭제된 공지사항은 복구할 수 없습니다."
      :item-info="deleteItemInfo"
      :loading="deleting"
      @confirm="deleteNotice"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNoticeStore } from '../../store/notice/notice';
import { useAuthStore } from '../../store/auth/auth';
import { useAdminLoginStore } from '../../store/admin/adminLogin';
import { formatDateTime } from '../../utils/timeUtils';
import ErrorAlert from '../../components/common/ErrorAlert.vue';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal.vue';
import LoadingScreen from '../../components/common/LoadingScreen.vue';

const router = useRouter();
const route = useRoute();
const noticeStore = useNoticeStore();
const authStore = useAuthStore();
const adminLoginStore = useAdminLoginStore();

// 삭제 관련 상태
const deleteDialog = ref(false);
const deleting = ref(false);

// 관리자 여부 확인 (두 스토어 모두 확인)
const isAdmin = computed(() => {
  const userRole = authStore.getUserRole;
  return userRole === 'ADMIN' || adminLoginStore.isLoggedIn;
});

// 뒤로가기
const goBack = () => {
  router.push('/notice');
};

// 수정 페이지로 이동
const goToEditNotice = () => {
  if (!isAdmin.value) {
    // 권한이 없는 경우 접근 거부 페이지로 이동
    router.push('/access-denied');
    return;
  }
  router.push(`/notice/edit/${route.params.id}`);
};

// 삭제 확인 다이얼로그 열기
const confirmDelete = () => {
  if (!isAdmin.value) {
    // 권한이 없는 경우 접근 거부 페이지로 이동
    router.push('/access-denied');
    return;
  }
  deleteDialog.value = true;
};

// 공지사항 삭제
const deleteNotice = async () => {
  try {
    deleting.value = true;
    await noticeStore.deleteNotice(route.params.id);
    deleteDialog.value = false;
    router.push('/notice');
  } catch (error) {
    console.error('공지사항 삭제 실패:', error);
  } finally {
    deleting.value = false;
  }
};

// 삭제 취소
const cancelDelete = () => {
  deleteDialog.value = false;
};

// 삭제 아이템 정보 (DeleteConfirmModal에 전달)
const deleteItemInfo = computed(() => {
  return {
    title: noticeStore.getCurrentNotice?.title || '공지사항'
  };
});

// 날짜 포맷팅은 timeUtils의 formatDateTime 사용

// 내용 포맷팅 (줄바꿈 처리)
const formatContent = (content) => {
  return content.replace(/\n/g, '<br>');
};

// 컴포넌트 마운트 시 공지사항 상세 정보 로드
onMounted(() => {
  if (route.params.id) {
    // 이미 해당 공지사항 데이터가 있으면 API 호출하지 않음
    const currentNotice = noticeStore.getCurrentNotice;
    if (!currentNotice || currentNotice.id !== parseInt(route.params.id)) {
      noticeStore.fetchNoticeDetail(route.params.id);
    }
    // 상세 페이지 진입 시 맨 위로 스크롤
    window.scrollTo(0, 0);
  }
});
</script>

<style scoped>
.notice-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  margin-top: 60px;
  min-height: calc(100vh - 60px);
}

.error-container {
  margin: 20px 0;
}

.error-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.notice-detail-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.notice-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.notice-detail-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary) 0%, #FF8E53 100%);
}

.back-button {
  display: flex;
  align-items: center;
}

.notice-detail-actions {
  display: flex;
  gap: 10px;
}

.notice-detail-body {
  padding: 25px;
}

.notice-title-section {
  margin-bottom: 25px;
}

.notice-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 18px 0;
  line-height: 1.3;
  background: linear-gradient(135deg, var(--color-primary) 0%, #FF8E53 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding-left: 12px;
}

.notice-meta {
  display: flex;
  gap: 20px;
  color: var(--color-text);
  font-size: 0.9rem;
}

.notice-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f7fafc;
  border-radius: 15px;
  font-weight: 500;
}

.notice-content-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notice-image {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.notice-image-content {
  max-width: 100%;
  max-height: 400px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;
}

.notice-image-content:hover {
  transform: scale(1.02);
}

.notice-content {
  line-height: 1.8;
  background: #f7fafc;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
}

.content-text {
  font-size: 1rem;
  color: var(--color-text);
  white-space: pre-line;
  line-height: 1.8;
}

.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  margin: 20px 0;
}

.not-found-container h3 {
  margin: 25px 0 15px 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text);
}

.not-found-container p {
  margin: 0 0 25px 0;
  font-size: 1.1rem;
  color: var(--color-text);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .notice-detail-container {
    padding: 15px;
  }

  .notice-detail-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .notice-detail-body {
    padding: 20px;
  }

  .notice-title {
    font-size: 1.5rem;
  }

  .notice-meta {
    flex-direction: column;
    gap: 10px;
  }

  .notice-detail-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
