<template>
  <div class="bookmarks">
    <div class="section-header">
      <h2>북마크</h2>
    </div>

    <!-- 초기 로딩 상태 (데이터가 없을 때만) -->
    <div v-if="loading && bookmarks.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p>북마크를 불러오는 중...</p>
    </div>

    <!-- 북마크 그리드 -->
    <div v-else-if="bookmarks.length > 0" class="bookmarks-grid">
        <div v-for="item in pagedBookmarks" :key="item.id" class="bookmark-card" @click="goToPostDetail(item)">
          <div class="bookmark-image">
            <img 
              :src="item.thumbnailUrl" 
              :alt="item.title"
              @error="handleImageError"
            />
          </div>
          <div class="bookmark-content">
            <div class="bookmark-header">
              <span class="category-badge" :class="categoryClass(item.category)">{{ getCategoryName(item.category) }}</span>
              <span class="bookmark-date">{{ formatDate(item.createdAt) }}</span>
            </div>
            <h3 class="bookmark-title">
              <span v-if="isPrivatePost(item)" class="lock-icon">🔒</span>
              {{ item.title }}
            </h3>
            <p class="bookmark-description">{{ item.description }}</p>
            <div class="bookmark-meta">
              <div class="author-stats">
                <span v-if="item.writerNickname" class="author">{{ item.writerNickname }}</span>
                <div class="bookmark-stats">
                  <span class="stat-item">
                    <span class="stat-icon">❤️</span>
                    {{ item.likeCount }}
                  </span>
                  <span class="stat-item">
                    <span class="stat-icon">🔖</span>
                    {{ item.bookmarkCount }}
                  </span>
                  <span class="stat-item">
                    <span class="stat-icon">💬</span>
                    {{ item.commentCount || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- 빈 상태 -->
    <div v-else-if="!loading && bookmarks.length === 0" class="empty-state">
      <div class="empty-icon">🔖</div>
      <h3>아직 북마크한 항목이 없어요</h3>
      <p>관심 있는 레시피를 북마크해보세요!</p>
      <button class="browse-content-btn" @click="goToRecipes">콘텐츠 둘러보기</button>
    </div>

    <!-- 에러 상태 -->
    <div v-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>북마크를 불러오는데 실패했습니다</h3>
      <p>{{ error }}</p>
      <button @click="fetchBookmarks" class="retry-btn">다시 시도</button>
    </div>

    <!-- 페이지네이션 -->
    <Pagination 
      v-if="bookmarks.length > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />
  </div>
</template>

<script>
import Pagination from '../common/Pagination.vue';
import { apiGet } from '@/utils/api';

const defaultThumbnail = '/src/assets/images/smu_mascort1.jpg';

export default {
  name: 'Bookmarks',
  components: {
    Pagination
  },
  data() {
    return {
      currentPage: 1,
      bookmarksPerPage: 8,
      bookmarks: [],
      totalPages: 0,
      loading: false,
      error: null
    };
  },
  computed: {
    pagedBookmarks() {
      return this.bookmarks.map(item => ({
        ...item,
        thumbnailUrl: this.getThumbnailUrl(item)
      }));
    }
  },
  async mounted() {
    await this.fetchBookmarks();
  },
  methods: {
    async fetchBookmarks() {
      this.loading = true;
      this.error = null;
      
      try {
        const params = new URLSearchParams({
          page: this.currentPage - 1, // API는 0-based pagination
          size: this.bookmarksPerPage
        });
        
        const response = await apiGet(`/api/my/bookmarked-posts?${params.toString()}`);
        
        if (response.data && response.data.success) {
          this.bookmarks = response.data.data.content || [];
          this.totalPages = response.data.data.totalPages || 0;
          
        } else {
          throw new Error('북마크를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('북마크 조회 오류:', error);
        this.error = error.message || '북마크를 불러오는데 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        await this.fetchBookmarks();
      }
    },
    goToPostDetail(item) {
      // Navigate to post detail page
      
      // 여러 가능한 ID 필드 시도
      const postId = item.id || item.postId || item.recipeId;
      if (postId) {
        this.$router.push(`/recipes/${postId}`);
      } else {
        console.error('❌ 게시글 ID를 찾을 수 없습니다:', item);
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}.${month}.${day}`;
    },
    goToRecipes() {
      this.$router.push('/recipes');
    },
    isPrivatePost(item) {
      // isOpen 필드로 비밀글 체크
      return item.isOpen === false;
    },
    getThumbnailUrl(item) {
      return item.thumbnailUrl || item.imageUrl || item.image || item.thumbUrl || defaultThumbnail;
    },
    handleImageError(event) {
      // 이미지 로드 실패 시 기본 이미지로 대체
      event.target.src = defaultThumbnail;
    },
    
    categoryClass(category) {
      return category ? `cat-${category.toLowerCase()}` : '';
    },
    
    getCategoryName(category) {
      switch (category) {
        case 'KOREAN': return '한식';
        case 'WESTERN': return '양식';
        case 'JAPANESE': return '일식';
        case 'CHINESE': return '중식';
        default: return category;
      }
    }
  }
};
</script>

<style scoped>
.bookmarks {
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

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 1040px;
  margin: 0 auto 24px auto;
  min-height: 480px;
}

.bookmarks-grid:empty {
  min-height: 0;
}

.bookmark-card {
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

.bookmark-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.bookmark-image {
  position: relative;
  width: 100%;
  height: 90px;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.bookmark-image img {
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



.bookmark-content {
  padding: 10px 12px 8px 12px;
  flex-grow: 1;
}

.bookmark-header {
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



.bookmark-date {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.bookmark-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 6px;
}

.lock-icon {
  font-size: 14px;
  color: #ff7a00;
}

.bookmark-description {
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

.bookmark-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.bookmark-stats {
  display: flex;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-icon {
  font-size: 12px;
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

.browse-content-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.browse-content-btn:hover {
  background: #e66a00;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .bookmarks-grid {
    grid-template-columns: 1fr;
  }
}
</style> 