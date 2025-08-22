<template>
  <div class="notice-list-container">

    <Header />
    
    <div class="notice-header">
      <div class="notice-header-left">
        <!-- 테스트용 채팅방 생성 버튼 -->
        <v-btn
          color="success"
          variant="outlined"
          prepend-icon="mdi-chat-plus"
          @click="createTestChatRoom"
          :loading="creatingChatRoom"
          class="test-chat-btn"
        >
          테스트용 채팅방 생성
        </v-btn>
        
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNoticeStore } from '../../store/notice/notice';
import { formatDateTime } from '../../utils/timeUtils';
import Pagination from '../../components/common/Pagination.vue';
import ErrorAlert from '../../components/common/ErrorAlert.vue';
import LoadingScreen from '../../components/common/LoadingScreen.vue';
import { useChatStore } from '../../store/chat/chat';

const router = useRouter();
const noticeStore = useNoticeStore();
const chatStore = useChatStore();

// 관리자 여부 확인 (테스팅용)
const isAdmin = computed(() => {
  // 테스팅을 위해 관리자로 설정
  localStorage.setItem('userRole', 'ADMIN');
  return true;
});

// 테스트용 채팅방 생성 상태
const creatingChatRoom = ref(false);

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

// 테스트용 채팅방 생성
const createTestChatRoom = async () => {
  try {
    creatingChatRoom.value = true;
    
    // 테스트용 사용자 ID (고정)
    const myId = '550e8400-e29b-41d4-a716-446655440001';
    const inviteeId = '550e8400-e29b-41d4-a716-446655440002';
    
    console.log('테스트용 채팅방 생성 시작:', { myId, inviteeId });
    
    const roomId = await chatStore.createRoom(myId, inviteeId);
    console.log('채팅방 생성 성공, roomId:', roomId);
    
    // 생성된 roomId를 URL에 포함시켜서 정확한 채팅방을 자동 선택하도록 함
    router.push(`/chat?autoSelect=true&roomId=${roomId}`);
    
  } catch (error) {
    console.error('테스트용 채팅방 생성 실패:', error);
    alert('채팅방 생성에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
  } finally {
    creatingChatRoom.value = false;
  }
};

// 날짜 포맷팅은 timeUtils의 formatDateTime 사용

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

// 컴포넌트 마운트 시 공지사항 목록 로드 (이미 로드된 경우 제외)
onMounted(() => {
  // 이미 데이터가 있고 로딩 중이 아닌 경우에만 API 호출
  if (noticeStore.getNotices.length === 0 && !noticeStore.isLoading) {
    noticeStore.fetchNotices(0, 10);
  }
  // 뒤로가기 시 스크롤 위치 복원
  restoreScrollPosition();
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
  gap: 20px;
}

.test-chat-btn {
  font-size: 0.9rem;
  padding: 8px 12px;
  border-radius: 8px;
  border-color: var(--color-success);
  color: var(--color-success);
}

.test-chat-btn:hover {
  background-color: rgba(40, 167, 69, 0.1);
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

  .test-chat-btn {
    width: 100%;
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
