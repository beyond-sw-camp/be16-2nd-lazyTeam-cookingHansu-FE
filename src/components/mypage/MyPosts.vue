<template>
  <div class="my-posts">
    <div class="section-header">
      <h2>내 게시글</h2>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>게시글을 불러오는 중...</p>
      <button class="write-post-btn" @click="goToRecipePostWrite">
        <span class="plus-icon">+</span>
        게시글 작성
      </button>
    </div>

    <div v-else-if="posts.length > 0" class="posts-grid">
      <div v-for="post in pagedPosts" :key="post.id" class="post-card">
    <div class="posts-grid">
      <div v-for="post in pagedPosts" :key="post.id" class="post-card" @click="goToPostDetail(post)">
        <div class="post-image">
          <img 
            v-if="post.thumbnailUrl" 
            :src="post.thumbnailUrl" 
            :alt="post.title" 
          />
          <div v-else class="no-image">이미지 없음</div>
        </div>
        <div class="post-content">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-description">{{ post.description }}</p>
          <div class="post-meta">
            <div class="post-date">{{ formatDate(post.createdAt) }}</div>
            <div class="post-stats">
              <span class="stat-item">
                <span class="stat-icon">❤️</span>
                {{ post.likeCount }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">🔖</span>
                {{ post.bookmarkCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 제거 -->

    <!-- 페이지네이션 -->
    <Pagination 
      v-if="posts.length > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <div v-if="!loading && posts.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>아직 작성한 게시글이 없어요</h3>
      <p>첫 번째 게시글을 작성해보세요!</p>
    </div>

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
  </div>
</template>

<script>
import Pagination from '../common/Pagination.vue';
import { apiGet } from '@/utils/api';

export default {
  name: 'MyPosts',
  components: {
    Pagination
  },
  data() {
    return {
      currentPage: 1,
      postsPerPage: 6,
      posts: [],
      loading: false,
      error: null
    };
  },
  computed: {
    pagedPosts() {
      const start = (this.currentPage - 1) * this.postsPerPage;
      const end = start + this.postsPerPage;
      return this.posts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.posts.length / this.postsPerPage);
    }
  },
  async mounted() {
    await this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiGet('/api/my/posts');
        
        if (response.ok) {
          const result = await response.json();
          this.posts = result.data || [];
        } else {
          throw new Error('게시글을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('게시글 조회 오류:', error);
        this.error = error.message || '게시글을 불러오는데 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}.${month}.${day}`;
    }
  }
};
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex; /* Added for flex layout */
  flex-direction: column; /* Added for flex layout */
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.post-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
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
  padding: 16px;
  flex-grow: 1;
}

.post-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.post-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
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