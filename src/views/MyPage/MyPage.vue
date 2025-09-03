<template>
  <div class="mypage-container">
    <Header />
    
    <!-- 프로필 -->
    <div class="profile-section">
      <div class="profile-content">
        <div class="profile-info">
          <div class="profile-avatar">
            <img 
              v-if="userProfile.picture" 
              :src="userProfile.picture" 
              alt="프로필 이미지"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder"></div>
          </div>
          <div class="profile-details">
            <h2 class="user-name">{{ userProfile.nickname }}</h2>
            <p class="user-type">{{ getUserRoleText(userProfile.role || userProfile.userType) }}</p>
            <!-- 자기소개 추가 -->
            <p v-if="userProfile.info" class="user-info">{{ userProfile.info }}</p>
          </div>
        </div>
        <div class="profile-actions">
          <button class="edit-profile-btn" @click="showProfileModal = true">프로필 수정</button>
          <button class="withdraw-btn" @click="showWithdrawModal = true">회원탈퇴</button>
        </div>
      </div>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
        class="tab-button"
        v-show="tab.id !== 'sold-lectures' || isSeller"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 탭 컨텐츠 -->
    <div class="tab-content">
      <MyPosts v-if="currentTab === 'posts'" />
      <PurchasedLectures v-if="currentTab === 'lectures'" />
      <SoldLectures v-if="currentTab === 'sold-lectures'" />
      <Bookmarks v-if="currentTab === 'bookmarks'" />
      <Likes v-if="currentTab === 'likes'" />
      <LikedLectures v-if="currentTab === 'liked-lectures'" />
    </div>

    <!-- 프로필 수정 모달 -->
    <ProfileEditModal
      :visible="showProfileModal"
      :userData="userProfile"
      @close="showProfileModal = false"
      @update="updateUserProfile"
      @showMessage="showMessage"
    />

    <!-- 회원탈퇴 확인 모달 -->
    <WithdrawConfirmModal
      :visible="showWithdrawModal"
      @close="showWithdrawModal = false"
      @withdraw-error="handleWithdrawError"
    />

    <div v-if="message" class="message-snackbar" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import Header from '@/components/Header.vue';
import MyPosts from '@/components/mypage/MyPosts.vue';
import PurchasedLectures from '@/components/mypage/PurchasedLectures.vue';
import SoldLectures from '@/components/mypage/SoldLectures.vue';
import Bookmarks from '@/components/mypage/Bookmarks.vue';
import Likes from '@/components/mypage/Likes.vue';
import LikedLectures from '@/components/mypage/LikedLectures.vue';
import ProfileEditModal from '@/components/mypage/modal/ProfileEditModal.vue';
import WithdrawConfirmModal from '@/components/mypage/modal/WithdrawConfirmModal.vue';
import { useMypageStore } from '@/store/mypage/mypage';
import { useAuthStore } from '@/store/auth/auth';

// Store
const mypageStore = useMypageStore();
const authStore = useAuthStore();

// Reactive data
const currentTab = ref('posts');
const showProfileModal = ref(false);
const showWithdrawModal = ref(false);
const isSeller = ref(false);
const message = ref(null);
const messageType = ref(null);

const tabs = ref([
  { id: 'posts', name: '내 게시글' },
  { id: 'lectures', name: '구매한 강의' },
  { id: 'sold-lectures', name: '판매한 강의' },
  { id: 'bookmarks', name: '게시글 북마크' },
  { id: 'likes', name: '게시글 좋아요' },
  { id: 'liked-lectures', name: '강의 좋아요' }
]);

// Computed (authStore에서 직접 가져오기)
const userProfile = computed(() => authStore.user);

// Methods
const getInitialTab = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  const validTabs = ['posts', 'lectures', 'sold-lectures', 'bookmarks', 'likes', 'liked-lectures'];
  
  if (tab === 'sold-lectures' && !isSeller.value) {
    return 'posts';
  }
  
  return tab && validTabs.includes(tab) ? tab : 'posts';
};

const updateUrlWithTab = (tab) => {
  const url = new URL(window.location);
  url.searchParams.set('tab', tab);
  window.history.replaceState({}, '', url);
};

// fetchUserProfile 제거 - authStore에서 직접 사용하므로 불필요

const updateUserProfile = (updatedData) => {
  // authStore의 사용자 정보 직접 업데이트
  if (authStore.user) {
    authStore.user = { ...authStore.user, ...updatedData };
    // role 정보도 userType과 동기화
    if (updatedData.role) {
      authStore.user.userType = updatedData.role;
    }
    localStorage.setItem('user', JSON.stringify(authStore.user));
  }
  
  console.log('프로필 업데이트됨:', updatedData);
};

const showMessage = (messageData) => {
  message.value = messageData.message;
  messageType.value = messageData.type;
  setTimeout(() => {
    message.value = null;
    messageType.value = null;
  }, 3000);
};

// 사용자 역할을 한글로 변환하는 함수
const getUserRoleText = (role) => {
  const roleMap = {
    'GENERAL': '일반 사용자',
    'CHEF': '요리 전문가',
    'OWNER': '자영업자',
    'ADMIN': '관리자'
  };
  return roleMap[role] || '일반 사용자';
};

// 회원탈퇴 실패 처리
const handleWithdrawError = (errorMessage) => {
  showMessage({
    type: 'error',
    message: '회원탈퇴에 실패했습니다: ' + errorMessage
  });
};

const checkSellerRole = () => {
  try {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token) {
      const parts = token.split('.');
      
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1]));
        const tokenRole = payload.role;
        
        isSeller.value = ['CHEF', 'OWNER'].includes(tokenRole) || ['CHEF', 'OWNER'].includes(userRole);
      } else {
        console.error('토큰 형식이 올바르지 않습니다.');
        isSeller.value = false;
      }
    } else {
      isSeller.value = false;
    }
  } catch (error) {
    console.error('토큰 파싱 오류:', error);
    isSeller.value = false;
  }
};

const updateUserRoleFromProfile = () => {
  try {
    if (userProfile.value.chef && userProfile.value.chef.approvalStatus === 'APPROVED') {
      localStorage.setItem('userRole', 'CHEF');
    } else if (userProfile.value.owner && userProfile.value.owner.approvalStatus === 'APPROVED') {
      localStorage.setItem('userRole', 'OWNER');
    }
  } catch (error) {
    // 에러 무시
  }
};

// Watchers
watch(currentTab, (newTab) => {
  updateUrlWithTab(newTab);
});

watch(showProfileModal, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  } else {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
  }
});

// Lifecycle
onMounted(() => {
  updateUserRoleFromProfile();
  checkSellerRole();
  
  // URL 파라미터에서 탭 설정
  currentTab.value = getInitialTab();
});

onBeforeUnmount(() => {
  document.body.style.overflow = 'auto';
  document.body.style.position = 'static';
  document.body.style.width = 'auto';
});
</script>

<style scoped>
.mypage-container {
  min-height: 100vh;
  background-color: #fafbfc;
  margin-top: 80px;
}

.profile-section {
  background: #ff7a00;
  padding: 40px 0;
  color: #222;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 1040px;
}

.profile-content {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #222;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder {
  font-size: 40px;
  color: #222;
}

.profile-details h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #222;
}

.user-type {
  margin: 0;
  font-size: 16px;
  color: #222;
  opacity: 0.8;
}

.user-info {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #222;
  opacity: 0.7;
  line-height: 1.4;
}

.profile-actions {
  display: flex;
  gap: 12px;
}

.edit-profile-btn {
  background: white;
  color: #222;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-profile-btn:hover {
  background: #f0f0f0;
}

.withdraw-btn {
  background: white;
  color: #dc3545;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.withdraw-btn:hover {
  background: #dc3545;
  color: white;
}

.tab-navigation {
  background: white;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: center;
  gap: 0;
  max-width: 1040px;
  margin: 0 auto;
  border-radius: 0 0 8px 8px;
}

.tab-button {
  padding: 20px 32px;
  border: none;
  background: white;
  color: #666;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab-button:hover {
  color: #ff7a00;
}

.tab-button.active {
  color: #ff7a00;
  border-bottom-color: #ff7a00;
}

.tab-content {
  max-width: 1040px;
  margin: 0 auto;
  padding: 40px 20px;
}

.message-snackbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 1001;
  animation: slideUp 0.3s ease-out;
}

.message-snackbar.success {
  background-color: #28a745;
}

.message-snackbar.error {
  background-color: #dc3545;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .profile-actions {
    justify-content: center;
  }
  
  .tab-button {
    padding: 16px 20px;
    font-size: 14px;
  }
}
</style>