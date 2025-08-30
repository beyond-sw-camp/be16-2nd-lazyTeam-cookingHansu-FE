<template>
  <div class="bookmarks">
    <div class="section-header">
      <h2>북마크</h2>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>북마크를 불러오는 중...</p>
    </div>

    <div v-else-if="bookmarks.length > 0" class="bookmarks-grid">
      <div v-for="item in pagedBookmarks" :key="item.id" class="bookmark-card" @click="goToPostDetail(item)">
        <div class="bookmark-image">
          <img 
            :src="item.thumbnailUrl || defaultThumbnail" 
            :alt="item.title"
            @error="handleImageError"
          />
        </div>
        <div class="bookmark-content">
          <div class="bookmark-type">
            <span class="type-badge type-recipe">레시피</span>
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

    <Pagination 
      v-if="bookmarks.length > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <div v-if="!loading && bookmarks.length === 0" class="empty-state">
      <div class="empty-icon">🔖</div>
      <h3>아직 북마크한 항목이 없어요</h3>
      <p>관심 있는 레시피를 북마크해보세요!</p>
      <button class="browse-content-btn">콘텐츠 둘러보기</button>
    </div>

    <div v-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>북마크를 불러오는데 실패했습니다</h3>
      <p>{{ error }}</p>
      <button @click="fetchBookmarks" class="retry-btn">다시 시도</button>
    </div>
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
      bookmarksPerPage: 6,
      bookmarks: [],
      loading: false,
      error: null
    };
  },
  computed: {
    pagedBookmarks() {
      const start = (this.currentPage - 1) * this.bookmarksPerPage;
      const end = start + this.bookmarksPerPage;
      return this.bookmarks.slice(start, end);
    },
    goToPostDetail(item) {
      // Navigate to post detail page
      this.$router.push(`/recipes/${item.id}`);
    },
    totalPages() {
      return Math.ceil(this.bookmarks.length / this.bookmarksPerPage);
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
        const response = await apiGet('/api/my/bookmarked-posts');
        
        if (response.ok) {
          const result = await response.json();
          // 삭제된 게시글 필터링
          const allBookmarks = result.data || [];
          this.bookmarks = allBookmarks.filter(bookmark => {
            // 삭제되지 않은 게시글만 표시
            return !bookmark.deleted && !bookmark.deletedAt && bookmark.status !== 'DELETED';
          });
          
          console.log(`🔍 전체 북마크: ${allBookmarks.length}개, 삭제되지 않은 북마크: ${this.bookmarks.length}개`);
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
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    goToPostDetail(item) {
      // Navigate to post detail page
      this.$router.push(`/recipes/${item.id}`);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}.${month}.${day}`;
    },
    isPrivatePost(item) {
      // isOpen 필드로 비밀글 체크
      return item.isOpen === false;
    },
    handleImageError(event) {
      // 이미지 로드 실패 시 기본 이미지로 대체
      event.target.src = defaultThumbnail;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.bookmark-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.bookmark-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.bookmark-image {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
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
  padding: 16px;
}

.bookmark-type {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.type-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.type-recipe {
  background: #ffe5c2;
  color: #ff7a00;
}

.bookmark-date {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.bookmark-title {
  font-size: 16px;
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
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
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