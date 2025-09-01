<template>
  <div class="notice-list-container">

    <Header />
    
    <div class="notice-header">
      <div class="notice-header-left">
        <h1 class="notice-title">공지사항</h1>
      </div>
      
      <div class="notice-actions">
        <v-btn
          v-if="isAdmin"
          color="primary"
          @click="goToCreateNotice"
          prepend-icon="mdi-plus"
        >
          공지사항 작성
        </v-btn>
      </div>
    </div>

    <!-- 로딩 상태 (데이터가 없을 때만) -->
    <LoadingScreen 
      v-if="noticeStore.isLoading && noticeStore.getNotices.length === 0"
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
    </div>

    <!-- 공지사항 목록 -->
    <div v-else class="notice-content">
      <div v-if="noticeStore.getNotices.length === 0" class="empty-state">
        <v-icon size="64" color="grey">mdi-bell-off</v-icon>
        <h3>등록된 공지사항이 없습니다</h3>
        <p>새로운 공지사항이 등록되면 여기에 표시됩니다.</p>
      </div>

      <div v-else class="notice-items">
        <div
          v-for="notice in noticeStore.getNotices"
          :key="notice.id"
          class="notice-item"
          @click="goToNoticeDetail(notice.id)"
        >
          <div class="notice-item-content">
            <div class="notice-item-header">
              <h3 class="notice-item-title">{{ notice.title }}</h3>
              <div class="notice-item-meta">
                <span class="notice-author">{{ notice.adminName }}</span>
                <span class="notice-date">{{ formatDateTime(notice.createdAt) }}</span>
              </div>
            </div>
            <div class="notice-item-arrow">
              <v-icon>mdi-chevron-right</v-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <Pagination
        v-if="paginationInfo.totalPages > 1"
        :current-page="currentPage"
        :total-pages="paginationInfo.totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNoticeStore } from '../../store/notice/notice';
import { useAuthStore } from '../../store/auth/auth';
import Header from '../../components/Header.vue';
import LoadingScreen from '../../components/common/LoadingScreen.vue';
import Pagination from '../../components/common/Pagination.vue';
import ErrorAlert from '../../components/common/ErrorAlert.vue';
import { formatDateTime } from '../../utils/timeUtils';

import { useAdminLoginStore } from '../../store/admin/adminLogin';

const router = useRouter();
const route = useRoute();
const noticeStore = useNoticeStore();
const authStore = useAuthStore();

const adminLoginStore = useAdminLoginStore();

// 관리자 여부 확인 (두 스토어 모두 확인)
const isAdmin = computed(() => {
  const userRole = authStore.getUserRole;
  return userRole === 'ADMIN' || adminLoginStore.isLoggedIn;
});

// 페이지네이션 정보
const paginationInfo = computed(() => noticeStore.getPaginationInfo);

// 현재 페이지 (store와 동기화)
const currentPage = computed({
  get: () => noticeStore.getPaginationInfo.currentPage + 1,
  set: (value) => {
    noticeStore.fetchNotices(value - 1, 10);
  }
});

// 페이지 변경 핸들러
const handlePageChange = (page) => {
  noticeStore.fetchNotices(page - 1, 10);
  // 페이지 변경 시 바로 상단으로 스크롤
  window.scrollTo(0, 0);
};

// 공지사항 상세 페이지로 이동
const goToNoticeDetail = (id) => {
  saveScrollPosition();
  router.push(`/notice/${id}`);
};

// 공지사항 작성 페이지로 이동
const goToCreateNotice = () => {
  router.push('/notice/create');
};

// 스크롤 위치 저장
const saveScrollPosition = () => {
  sessionStorage.setItem('noticeListScrollPosition', window.scrollY.toString());
};

// 스크롤 위치 복원
const restoreScrollPosition = () => {
  const savedPosition = sessionStorage.getItem('noticeListScrollPosition');
  if (savedPosition) {
    setTimeout(() => {
      window.scrollTo({ top: parseInt(savedPosition), behavior: 'smooth' });
    }, 100);
  }
};

// 컴포넌트 마운트 시 공지사항 목록 로드
onMounted(async () => {
  // 페이지 진입할 때마다 최신 데이터 가져오기
  await noticeStore.fetchNotices(0, 10);
  
  // 뒤로가기 시 스크롤 위치 복원
  restoreScrollPosition();
});

// 라우트 변경 감지하여 공지사항 페이지 진입 시 최신 데이터 가져오기
watch(() => route.path, async (newPath) => {
  if (newPath === '/notice') {
    await noticeStore.fetchNotices(0, 10);
  }
});

</script>

<style scoped>
.notice-list-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  margin-top: 60px;
  min-height: calc(100vh - 60px);
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.notice-header-left {
  display: flex;
  align-items: center;
}

.notice-title {
  font-size: 1.8rem;
  font-weight: 700;
  background: var(--color-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.notice-actions {
  display: flex;
  gap: 10px;
}

.error-container {
  margin: 20px 0;
}

.notice-content {
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.empty-state h3 {
  margin: 25px 0 15px 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text);
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text);
  line-height: 1.6;
}

.notice-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.notice-item {
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.notice-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-primary);
}

.notice-item:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.notice-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
}

.notice-item-header {
  flex: 1;
}

.notice-item-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice-item-meta {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: #718096;
}

.notice-author {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.notice-author::before {
  content: '👤';
  font-size: 0.9rem;
}

.notice-date {
  color: #a0aec0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.notice-date::before {
  content: '📅';
  font-size: 0.9rem;
}

.notice-item-arrow {
  color: #cbd5e0;
  transition: all 0.3s ease;
  font-size: 1.5rem;
}

.notice-item:hover .notice-item-arrow {
  color: var(--color-primary);
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .notice-list-container {
    padding: 15px;
  }

  .notice-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .notice-header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .notice-title {
    font-size: 1.5rem;
  }

  .notice-item-content {
    padding: 15px;
  }

  .notice-item-title {
    font-size: 1rem;
  }

  .notice-item-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
