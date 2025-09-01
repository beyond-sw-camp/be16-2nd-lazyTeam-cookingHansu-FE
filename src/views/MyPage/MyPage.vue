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
import MyPosts from '@/components/mypage/MyPosts.vue';
import PurchasedLectures from '@/components/mypage/PurchasedLectures.vue';
import SoldLectures from '@/components/mypage/SoldLectures.vue';
import Bookmarks from '@/components/mypage/Bookmarks.vue';
import Likes from '@/components/mypage/Likes.vue';
import ProfileEditModal from '@/components/mypage/modal/ProfileEditModal.vue';
import WithdrawConfirmModal from '@/components/mypage/modal/WithdrawConfirmModal.vue';
import { apiGet } from '@/utils/api';

export default {
  name: 'MyPage',
  components: {
    Header,
    MyPosts,
    PurchasedLectures,
    SoldLectures,
    Bookmarks,
    Likes,
    ProfileEditModal,
    WithdrawConfirmModal
  },
  data() {
    return {
      currentTab: 'posts',
      showProfileModal: false,
      showWithdrawModal: false,
      isSeller: false,
      userProfile: {
        nickname: '',
        email: '',
        info: '',
        profileImageUrl: null,
        userType: ''
      },
      tabs: [
        { id: 'posts', name: '내 게시글' },
        { id: 'lectures', name: '구매한 강의' },
        { id: 'sold-lectures', name: '판매한 강의' },
        { id: 'bookmarks', name: '북마크' },
        { id: 'likes', name: '좋아요' }
      ],
      message: null,
      messageType: null
    };
  },
  async mounted() {
    await this.fetchUserProfile();
    this.updateUserRoleFromProfile();
    this.checkSellerRole();
    
         // URL 파라미터에서 탭 설정
     this.currentTab = this.getInitialTab();
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
    const validTabs = ['posts', 'lectures', 'sold-lectures', 'bookmarks', 'likes'];
    
    if (tab === 'sold-lectures' && !this.isSeller) {
      return 'posts';
    }
    
    return tab && validTabs.includes(tab) ? tab : 'posts';
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
    },
         checkSellerRole() {
       try {
         const token = localStorage.getItem('accessToken');
         const userRole = localStorage.getItem('userRole');
         
         if (token) {
           const parts = token.split('.');
           
           if (parts.length >= 2) {
             const payload = JSON.parse(atob(parts[1]));
             const tokenRole = payload.role;
             
             this.isSeller = ['CHEF', 'OWNER'].includes(tokenRole) || ['CHEF', 'OWNER'].includes(userRole);
           } else {
             console.error('토큰 형식이 올바르지 않습니다.');
             this.isSeller = false;
           }
         } else {
           this.isSeller = false;
         }
       } catch (error) {
         console.error('토큰 파싱 오류:', error);
         this.isSeller = false;
       }
     },
         updateUserRoleFromProfile() {
       try {
         if (this.userProfile.chef && this.userProfile.chef.approvalStatus === 'APPROVED') {
           localStorage.setItem('userRole', 'CHEF');
         } else if (this.userProfile.owner && this.userProfile.owner.approvalStatus === 'APPROVED') {
           localStorage.setItem('userRole', 'OWNER');
         }
       } catch (error) {
       }
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