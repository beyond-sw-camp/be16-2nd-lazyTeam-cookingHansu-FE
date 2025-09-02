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
      <div v-for="item in pagedLikes" :key="item.id" class="like-card" @click="goToPostDetail(item)">
        <div class="like-image">
          <img 
            :src="item.thumbnailUrl || defaultThumbnail" 
            :alt="item.title"
            @error="handleImageError"
          />
        </div>
        <div class="like-content">
          <div class="like-header">
            <span class="category-badge" :class="categoryClass(item.category)">{{ getCategoryName(item.category) }}</span>
            <span class="like-date">{{ formatDate(item.createdAt) }}</span>
          </div>
          <h3 class="like-title">
            <span v-if="isPrivatePost(item)" class="lock-icon">🔒</span>
            {{ item.title }}
          </h3>
          <p class="like-description">{{ item.description }}</p>
          <div class="like-meta">
            <div class="author-stats">
              <span v-if="item.writerNickname" class="author">{{ item.writerNickname }}</span>
              <div class="like-stats">
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

const defaultThumbnail = '/src/assets/images/smu_mascort1.jpg';

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
          // 삭제된 게시글 필터링
          const allLikes = result.data || [];
          this.likes = allLikes.filter(like => {
            // 삭제되지 않은 게시글만 표시
            return !like.deleted && !like.deletedAt && like.status !== 'DELETED';
          });
          
          console.log(`🔍 전체 좋아요: ${allLikes.length}개, 삭제되지 않은 좋아요: ${this.likes.length}개`);
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
    },
    
    categoryClass(category) {
      switch (category) {
        case 'KOREAN': return 'cat-korean';
        case 'WESTERN': return 'cat-western';
        case 'JAPANESE': return 'cat-japanese';
        case 'CHINESE': return 'cat-chinese';
        case 'DESSERT': return 'cat-dessert';
        default: return '';
      }
    },
    
    getCategoryName(category) {
      switch (category) {
        case 'KOREAN': return '한식';
        case 'WESTERN': return '양식';
        case 'JAPANESE': return '일식';
        case 'CHINESE': return '중식';
        case 'DESSERT': return '디저트';
        default: return category;
      }
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
  display: flex;
  flex-direction: column;
}

.like-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.like-image {
  position: relative;
  width: 100%;
  height: 200px;
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



.like-content {
  padding: 16px;
}

.like-header {
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

.cat-dessert {
  background: #fff3e2;
  color: #ff7a00;
}

.like-date {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.like-title {
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