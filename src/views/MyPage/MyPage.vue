<template>
  <div class="mypage-container">
    <Header />
    
    <!-- 프로필 -->
    <div class="profile-section">
      <div class="profile-content">
        <div class="profile-info">
          <div class="profile-avatar">
            <div class="avatar-placeholder">👤</div>
          </div>
          <div class="profile-details">
            <h2 class="user-name">김요리</h2>
            <p class="user-type">일반 사용자</p>
          </div>
        </div>
        <div class="profile-actions">
          <button class="edit-profile-btn">프로필 수정</button>
          <button class="withdraw-btn">회원탈퇴</button>
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
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import MyRecipes from '@/components/mypage/MyRecipes.vue';
import MyPosts from '@/components/mypage/MyPosts.vue';
import PurchasedLectures from '@/components/mypage/PurchasedLectures.vue';
import Bookmarks from '@/components/mypage/Bookmarks.vue';
import Likes from '@/components/mypage/Likes.vue';

export default {
  name: 'MyPage',
  components: {
    Header,
    MyRecipes,
    MyPosts,
    PurchasedLectures,
    Bookmarks,
    Likes
  },
  data() {
    return {
      currentTab: 'recipes',
      tabs: [
        { id: 'recipes', name: '내 레시피' },
        { id: 'posts', name: '내 게시글' },
        { id: 'lectures', name: '구매한 강의' },
        { id: 'bookmarks', name: '북마크' },
        { id: 'likes', name: '좋아요' }
      ]
    };
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
  border: none;
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

.profile-actions {
  display: flex;
  gap: 12px;
}

.edit-profile-btn {
  background: white;
  border: none;
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
  border: none;
  color: #222;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.withdraw-btn:hover {
  background: #f0f0f0;
}

.tab-navigation {
  background: white;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: center;
  gap: 0;
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