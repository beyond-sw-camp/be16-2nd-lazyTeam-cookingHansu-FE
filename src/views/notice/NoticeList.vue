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
        
        <!-- 테스트용 신고 버튼들 -->
        <div class="test-report-buttons">
          <v-btn
            color="error"
            variant="outlined"
            size="x-small"
            prepend-icon="mdi-flag"
            @click="openUserProfileModal"
            class="test-report-btn"
          >
            프로필 테스트
          </v-btn>
          
          <v-btn
            color="error"
            variant="outlined"
            size="x-small"
            prepend-icon="mdi-flag"
            @click="openUserReportModal"
            class="test-report-btn"
          >
            사용자 신고
          </v-btn>
          
          <v-btn
            color="error"
            variant="outlined"
            size="x-small"
            prepend-icon="mdi-flag"
            @click="openCommentReportModal"
            class="test-report-btn"
          >
            댓글 신고
          </v-btn>
          
          <v-btn
            color="error"
            variant="outlined"
            size="x-small"
            prepend-icon="mdi-flag"
            @click="openRecipeReportModal"
            class="test-report-btn"
          >
            게시글 신고
          </v-btn>
        </div>
        
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
    
    <!-- 사용자 프로필 모달 -->
    <UserProfileModal
      v-model="showUserProfileModal"
      :user="testUser"
      @chat="handleStartChat"
      @report="handleProfileReport"
    />
    
    <!-- 신고 모달들 -->
    <ReportModal
      v-model="showUserReportModal"
      :report-type="'USER'"
      :target-id="'test-user-123'"
      :target-name="'테스트 사용자 (홍길동)'"
      @success="handleReportSuccess"
      @error="handleReportError"
    />
    
    <ReportModal
      v-model="showCommentReportModal"
      :report-type="'COMMENT'"
      :target-id="'test-comment-456'"
      :target-name="'테스트 댓글 (김철수: 안녕하세요! 좋은 글이네요.)'"
      @success="handleReportSuccess"
      @error="handleReportError"
    />
    
    <ReportModal
      v-model="showRecipeReportModal"
      :report-type="'RECIPE'"
      :target-id="'test-recipe-789'"
      :target-name="'테스트 레시피 (김치찌개 만들기)'"
      @success="handleReportSuccess"
      @error="handleReportError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNoticeStore } from '../../store/notice/notice';
import { useAuthStore } from '../../store/auth/auth';
import Header from '../../components/Header.vue';
import CommonModal from '../../components/common/CommonModal.vue';
import UserProfileModal from '../../components/common/UserProfileModal.vue';
import ReportModal from '../../components/common/ReportModal.vue';
import LoadingScreen from '../../components/common/LoadingScreen.vue';
import Pagination from '../../components/common/Pagination.vue';
import ErrorAlert from '../../components/common/ErrorAlert.vue';
import { formatDateTime } from '../../utils/timeUtils';
import { useChatStore } from '../../store/chat/chat';
import { useAdminLoginStore } from '../../store/admin/adminLogin';

const router = useRouter();
const route = useRoute();
const noticeStore = useNoticeStore();
const authStore = useAuthStore();
const chatStore = useChatStore();
const adminLoginStore = useAdminLoginStore();

// 관리자 여부 확인 (두 스토어 모두 확인)
const isAdmin = computed(() => {
  const userRole = authStore.getUserRole;
  return userRole === 'ADMIN' || adminLoginStore.isLoggedIn;
});

// 테스트용 채팅방 생성 상태
const creatingChatRoom = ref(false);

// 사용자 프로필 모달 상태
const showUserProfileModal = ref(false);

// 신고 모달 상태들
const showUserReportModal = ref(false);
const showCommentReportModal = ref(false);
const showRecipeReportModal = ref(false);

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
    
    // 실제 사용자 ID 사용
    const myId = authStore.user?.id;
    if (!myId) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    
    // 테스트용 상대방 ID (고정) - 실제 서비스에서는 다른 사용자 ID를 사용해야 함
    const inviteeId = '5a1af30b-aec4-425d-90ec-7218532a7720';
    
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

// 테스트용 사용자 데이터
const testUser = ref({
  id: 'test-user-123',
  nickname: '홍길동',
  email: 'hong@example.com',
  profileImage: 'https://via.placeholder.com/100x100/4CAF50/FFFFFF?text=홍',
  joinDate: '2024-01-15'
});

// 사용자 프로필 모달 열기
const openUserProfileModal = () => {
  showUserProfileModal.value = true;
};

// 신고 모달 열기 함수들
const openUserReportModal = () => {
  showUserReportModal.value = true;
};

const openCommentReportModal = () => {
  showCommentReportModal.value = true;
};

const openRecipeReportModal = () => {
  showRecipeReportModal.value = true;
};

// 신고 성공 처리
const handleReportSuccess = (response) => {
  console.log('신고 성공:', response);
  alert('신고가 성공적으로 접수되었습니다.');
};

// 신고 오류 처리
const handleReportError = (error) => {
  console.error('신고 오류:', error);
  alert('신고 처리 중 오류가 발생했습니다: ' + error);
};

// 프로필에서 채팅 시작
const handleStartChat = async (userId) => {
  try {
    const myId = authStore.user?.id;
    if (!myId) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    
    console.log('프로필에서 채팅 시작:', { myId, userId });
    
    const roomId = await chatStore.createRoom(myId, userId);
    console.log('채팅방 생성 성공, roomId:', roomId);
    
    // 프로필 모달 닫기
    showUserProfileModal.value = false;
    
    // 채팅 페이지로 이동
    router.push(`/chat?autoSelect=true&roomId=${roomId}`);
    
  } catch (error) {
    console.error('채팅방 생성 실패:', error);
    alert('채팅방 생성에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
  }
};

// 프로필에서 신고하기
const handleProfileReport = (userId) => {
  // 프로필 모달 닫기
  showUserProfileModal.value = false;
  
  // 사용자 신고 모달 열기
  showUserReportModal.value = true;
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

.test-report-buttons {
  display: flex;
  gap: 10px;
  margin-right: 20px;
  flex-wrap: wrap;
}

.test-report-btn {
  font-size: 0.75rem;
  padding: 2px 8px;
  min-width: auto;
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
