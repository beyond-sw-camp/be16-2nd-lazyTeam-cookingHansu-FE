<template>
  <div class="mypage-container">
    <Header />
    
    <!-- 프로필 -->
    <div class="profile-section">
      <div class="profile-content">
        <div class="profile-info">
          <div class="profile-avatar">
            <img 
              v-if="userProfile.profileImageUrl" 
              :src="userProfile.profileImageUrl" 
              alt="프로필 이미지"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder"></div>
          </div>
          <div class="profile-details">
            <h2 class="user-name">{{ userProfile.nickname }}</h2>
            <p class="user-type">{{ userProfile.userType }}</p>
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
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 탭 컨텐츠 -->
    <div class="tab-content">
      <MyRecipes v-if="currentTab === 'recipes'" />
      <MyPosts v-if="currentTab === 'posts'" />
      <PurchasedLectures v-if="currentTab === 'lectures'" />
      <Bookmarks v-if="currentTab === 'bookmarks'" />
      <Likes v-if="currentTab === 'likes'" />
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
      @withdraw-success="handleWithdrawSuccess"
      @withdraw-error="handleWithdrawError"
    />

    <div v-if="message" class="message-snackbar" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import MyRecipes from '@/components/mypage/MyRecipes.vue';
import MyPosts from '@/components/mypage/MyPosts.vue';
import PurchasedLectures from '@/components/mypage/PurchasedLectures.vue';
import Bookmarks from '@/components/mypage/Bookmarks.vue';
import Likes from '@/components/mypage/Likes.vue';
import ProfileEditModal from '@/components/mypage/modal/ProfileEditModal.vue';
import WithdrawConfirmModal from '@/components/mypage/modal/WithdrawConfirmModal.vue';
import { apiGet } from '@/utils/api';


export default {
  name: 'MyPage',
  components: {
    Header,
    MyRecipes,
    MyPosts,
    PurchasedLectures,
    Bookmarks,
    Likes,
    ProfileEditModal,
    WithdrawConfirmModal
  },
  data() {
    return {
      currentTab: this.getInitialTab(),
      showProfileModal: false,
      showWithdrawModal: false,
      userProfile: {
        nickname: '',
        email: '',
        info: '',
        profileImageUrl: null, // ✅ 키 맞춤
        userType: ''
      },
      tabs: [
        { id: 'recipes', name: '내 레시피' },
        { id: 'posts', name: '내 게시글' },
        { id: 'lectures', name: '구매한 강의' },
        { id: 'bookmarks', name: '북마크' },
        { id: 'likes', name: '좋아요' }
      ],
      message: null,
      messageType: null
    };
  },
  async mounted() {
    await this.fetchUserProfile();
  },
  watch: {
    currentTab(newTab) {
      this.updateUrlWithTab(newTab);
    },
    showProfileModal(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.width = 'auto';
      }
    }
  },
  beforeUnmount() {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
  },
  methods: {
    getInitialTab() {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      const validTabs = ['recipes', 'posts', 'lectures', 'bookmarks', 'likes'];
      return tab && validTabs.includes(tab) ? tab : 'recipes';
    },
    updateUrlWithTab(tab) {
      const url = new URL(window.location);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url);
    },
    async fetchUserProfile() {
      try {
        const response = await apiGet('/api/my/profile');
        if (response.ok) {
          const result = await response.json();
          this.userProfile = result.data;
        } else {
          console.error('프로필 조회 실패');
        }
      } catch (error) {
        console.error('프로필 조회 오류:', error);
      }
    },
    updateUserProfile(updatedData) {
      this.userProfile = { ...this.userProfile, ...updatedData };
    },
    showMessage(message) {
      this.message = message.message;
      this.messageType = message.type;
      setTimeout(() => {
        this.message = null;
        this.messageType = null;
      }, 3000);
    },
    handleWithdrawSuccess() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      this.showMessage({ type: 'success', message: '회원탈퇴가 완료되었습니다.' });
      setTimeout(() => this.$router.push('/login'), 2000);
    },
    handleWithdrawError(errorMessage) {
      this.showMessage({
        type: 'error',
        message: '회원탈퇴에 실패했습니다: ' + errorMessage
      });
    }
  }
};
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
  border: 1px solid #222;
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
  border: 1px solid #222;
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

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff7a00;
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.disabled-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.char-count {
  display: block;
  text-align: right;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.save-btn {
  background: #ff7a00;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #e66a00;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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
  
  .modal-content {
    margin: 20px;
    max-height: calc(100vh - 40px);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
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
</style>