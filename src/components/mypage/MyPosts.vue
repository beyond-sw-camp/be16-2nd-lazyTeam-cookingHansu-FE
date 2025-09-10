<template>
  <div class="my-posts">
    <div class="section-header">
      <h2>내 게시글</h2>
    </div>

    <!-- 초기 로딩 상태 (데이터가 없을 때만) -->
    <div v-if="loading && posts.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p>게시글을 불러오는 중...</p>
      <button class="write-post-btn" @click="goToRecipePostWrite">
        <span class="plus-icon">+</span>
        게시글 작성
      </button>
    </div>

    <!-- 게시글 그리드 -->
    <div v-else-if="posts.length > 0" class="posts-grid">
      <div v-for="post in pagedPosts" :key="post.id" class="post-card" @click="goToPostDetail(post)">
        <div class="post-image">
          <img 
            :src="post.thumbnailUrl || defaultThumbnail" 
            :alt="post.title"
            @error="handleImageError"
          />
        </div>
        <div class="post-content">
          <div class="post-header">
            <span class="category-badge" :class="categoryClass(post.category)">{{ getCategoryName(post.category) }}</span>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
          <h3 class="post-title">
            <span v-if="isPrivatePost(post)" class="lock-icon">🔒</span>
            {{ post.title }}
          </h3>
          <p class="post-description">{{ post.description }}</p>
          <div class="post-meta">
            <div class="post-stats">
              <span class="stat-item">
                <span class="stat-icon">❤️</span>
                {{ post.likeCount }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">🔖</span>
                {{ post.bookmarkCount }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">💬</span>
                {{ post.commentCount || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="!loading && posts.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>아직 작성한 게시글이 없어요</h3>
      <p>첫 번째 게시글을 작성해보세요!</p>
    </div>

    <!-- 에러 상태 -->
    <div v-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>게시글을 불러오는데 실패했습니다</h3>
      <p>{{ error }}</p>
      <button @click="fetchPosts" class="retry-btn">다시 시도</button>
      <button class="write-first-post-btn" @click="goToRecipePostWrite">
        <span class="plus-icon">+</span>
        게시글 작성하기
      </button>
    </div>

    <!-- 페이지네이션 -->
    <Pagination 
      v-if="posts.length > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Pagination from '../common/Pagination.vue';
import { useMypageStore } from '@/store/mypage/mypage';

const defaultThumbnail = '/smu_mascort1.jpg';

// Store & Router
const mypageStore = useMypageStore();
const router = useRouter();

// Reactive data
const currentPage = ref(1);
const postsPerPage = ref(8);

// Computed
const posts = computed(() => mypageStore.getMyPosts);
const loading = computed(() => mypageStore.isPostsLoading);
const error = computed(() => mypageStore.getError);

const pagedPosts = computed(() => {
  return posts.value;
});

const totalPages = computed(() => {
  return mypageStore.myPostsPagination.totalPages;
});

// Methods
const fetchPosts = async () => {
  try {
    await mypageStore.fetchMyPosts(currentPage.value - 1, postsPerPage.value);
  } catch (error) {
    console.error('게시글 조회 오류:', error);
  }
};

const changePage = async (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    await fetchPosts();
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
};

const goToPostDetail = (post) => {
  // Navigate to post detail page
  router.push(`/recipes/${post.id}`);
};

const goToRecipePostWrite = () => {
  // Navigate to recipe post write page
  router.push('/recipe/post-write');
};

const isPrivatePost = (item) => {
  // isOpen 필드로 비밀글 체크
  return item.isOpen === false;
};

const handleImageError = (event) => {
  // 이미지 로드 실패 시 기본 이미지로 대체
  event.target.src = defaultThumbnail;
};

const categoryClass = (category) => {
  return category ? `cat-${category.toLowerCase()}` : '';
};

const getCategoryName = (category) => {
  switch (category) {
    case 'KOREAN': return '한식';
    case 'WESTERN': return '양식';
    case 'JAPANESE': return '일식';
    case 'CHINESE': return '중식';
    default: return category;
  }
};

// Lifecycle
onMounted(async () => {
  await fetchPosts();
});
</script>

<style scoped>
.my-posts {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff7a00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.error-state h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #dc3545;
}

.error-state p {
  font-size: 16px;
  margin: 0 0 32px 0;
  color: #666;
}

.retry-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #e66a00;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 1040px;
  margin: 0 auto 24px auto;
  min-height: 480px;
}

.posts-grid:empty {
  min-height: 0;
}

.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1.5px solid #f3f3f3;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 220px;
  max-height: 220px;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.post-image {
  width: 100%;
  height: 90px;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 14px;
}

.post-content {
  padding: 10px 12px 8px 12px;
  flex-grow: 1;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.cat-korean {
  background: #ffe5c2;
  color: #ff7a00;
}

.cat-western {
  background: #e2f0ff;
  color: #007aff;
}

.cat-japanese {
  background: #e2ffe7;
  color: #00b86b;
}

.cat-chinese {
  background: #ffe2e2;
  color: #ff3b3b;
}



.post-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0 0 12px 0;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.lock-icon {
  font-size: 16px;
  color: #ff7a00;
}

.post-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.post-date {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
}

.post-stats {
  display: flex;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-icon {
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #444;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 32px 0;
  color: #666;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style> 