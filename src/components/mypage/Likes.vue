<template>
  <div class="likes">
    <div class="section-header">
      <h2>좋아요</h2>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>좋아요 목록을 불러오는 중...</p>
    </div>

    <div v-else-if="likes.length > 0" class="likes-grid">
      <div v-for="item in pagedLikes" :key="item.id" class="like-card">
        <div class="like-image">
          <img 
            v-if="item.thumbnailUrl" 
            :src="item.thumbnailUrl" 
            :alt="item.title" 
          />
          <div v-else class="no-image">이미지 없음</div>
          <button class="remove-like-btn" @click="unlikeItem(item.id)">
            <span class="remove-icon">×</span>
          </button>
        </div>
        <div class="like-content">
          <div class="like-type">
            <span class="type-badge type-recipe">레시피</span>
            <span class="like-date">{{ formatDate(item.createdAt) }}</span>
          </div>
          <h3 class="like-title">{{ item.title }}</h3>
          <p class="like-description">{{ item.description }}</p>
          <div class="like-meta">
            <div class="author-stats">
              <span v-if="item.writerNickname" class="author">{{ item.writerNickname }}</span>
              <div class="like-stats">
                <span class="stat-item">
                  <span class="stat-icon">🔖</span>
                  {{ item.bookmarkCount }}
                </span>
                <span class="stat-item">
                  <span class="stat-icon">❤️</span>
                  {{ item.likeCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Pagination 
      v-if="likes.length > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <div v-if="!loading && likes.length === 0" class="empty-state">
      <div class="empty-icon">❤️</div>
      <h3>아직 좋아요한 항목이 없어요</h3>
      <p>마음에 드는 레시피에 좋아요를 눌러보세요!</p>
      <button class="browse-content-btn">콘텐츠 둘러보기</button>
    </div>

    <div v-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>좋아요 목록을 불러오는데 실패했습니다</h3>
      <p>{{ error }}</p>
      <button @click="fetchLikes" class="retry-btn">다시 시도</button>
    </div>
  </div>
</template>

<script>
import Pagination from '../common/Pagination.vue';
import { apiGet } from '@/utils/api';

export default {
  name: 'Likes',
  components: {
    Pagination
  },
  data() {
    return {
      currentPage: 1,
      likesPerPage: 6,
      likes: [],
      loading: false,
      error: null
    };
  },
  computed: {
    pagedLikes() {
      const start = (this.currentPage - 1) * this.likesPerPage;
      const end = start + this.likesPerPage;
      return this.likes.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.likes.length / this.likesPerPage);
    }
  },
  async mounted() {
    await this.fetchLikes();
  },
  methods: {
    async fetchLikes() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiGet('/api/my/liked-posts');
        
        if (response.ok) {
          const result = await response.json();
          this.likes = result.data || [];
        } else {
          throw new Error('좋아요 목록을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('좋아요 조회 오류:', error);
        this.error = error.message || '좋아요 목록을 불러오는데 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    unlikeItem(id) {
      this.likes = this.likes.filter(item => item.id !== id);
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
.likes {
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

.likes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.like-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.like-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.like-image {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.like-image img {
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

.remove-like-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-like-btn:hover {
  background: rgba(255, 0, 0, 0.8);
}

.remove-icon {
  font-size: 18px;
  font-weight: bold;
}

.like-content {
  padding: 16px;
}

.like-type {
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

.like-date {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.like-title {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.like-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.like-meta {
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

.like-stats {
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
  
  .likes-grid {
    grid-template-columns: 1fr;
  }
}
</style> 