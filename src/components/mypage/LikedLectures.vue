<template>
  <div class="liked-lectures">
    <div class="section-header">
      <h2>강의 좋아요</h2>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>강의 좋아요 목록을 불러오는 중...</p>
    </div>

    <div v-else-if="likes.length > 0" class="lectures-grid">
      <div v-for="lecture in pagedLikes" :key="lecture.id" class="lecture-card">
        <div class="lecture-image" @click="goToLectureDetail(lecture.id)">
          <img :src="lecture.thumbUrl || defaultThumbnail" :alt="lecture.title" @error="handleImageError" />
        </div>
        <div class="lecture-content">
          <div class="lecture-header">
            <span class="category-badge" :class="categoryClass(lecture.category)">{{ getCategoryName(lecture.category) }}</span>
            <span class="like-date">{{ formatDate(lecture.createdAt || lecture.date) }}</span>
          </div>
          <h3 class="lecture-title" @click="goToLectureDetail(lecture.id)">{{ lecture.title }}</h3>
          <p class="lecture-description">{{ lecture.description }}</p>
          <div class="lecture-rating-stats">
            <div class="lecture-rating">
              <span class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(lecture.reviewAvg || 0) }">★</span>
              </span>
              <span class="rating-count">({{ lecture.reviewCount || 0 }})</span>
            </div>
            <div class="lecture-stats">
              <span class="stat-item">
                <span class="stat-icon">❤️</span>
                {{ lecture.likeCount || 0 }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">💬</span>
                {{ lecture.qnaCount || 0 }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">👥</span>
                {{ lecture.purchaseCount || 0 }}
              </span>
            </div>
          </div>
          <div class="lecture-bottom">
            <div class="lecture-date">{{ lecture.date || '' }}</div>
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
      <div class="empty-icon">📚</div>
      <h3>아직 좋아요한 강의가 없어요</h3>
      <p>마음에 드는 강의에 좋아요를 눌러보세요!</p>
      <button class="browse-content-btn" @click="goToLectures">강의 둘러보기</button>
    </div>

    <div v-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>강의 좋아요 목록을 불러오는데 실패했습니다</h3>
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
  name: 'LikedLectures',
  components: {
    Pagination
  },
  data() {
    return {
      currentPage: 1,
      likesPerPage: 6,
      likes: [],
      totalPages: 0,
      loading: false,
      error: null
    };
  },
  computed: {
    pagedLikes() {
      return this.likes;
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
        const params = new URLSearchParams({
          page: this.currentPage - 1, // API는 0-based pagination
          size: this.likesPerPage
        });
        
        const response = await apiGet(`/api/my/liked-lectures?${params.toString()}`);
        
        if (response.data && response.data.success) {
          this.likes = response.data.data.content || [];
          this.totalPages = response.data.data.totalPages || 0;
          
          console.log(`🔍 강의 좋아요: ${this.likes.length}개, 총 ${response.data.data.totalElements}개`);
        } else {
          throw new Error('강의 좋아요 목록을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('강의 좋아요 조회 오류:', error);
        this.error = error.message || '강의 좋아요 목록을 불러오는데 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        await this.fetchLikes();
      }
    },
    goToLectureDetail(lectureId) {
      this.$router.push(`/lectures/${lectureId}`);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}.${month}.${day}`;
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
    },
    
    handleImageError(event) {
      event.target.src = defaultThumbnail;
    },
    goToLectures() {
      this.$router.push('/lectures');
    }
  }
};
</script>

<style scoped>
.liked-lectures {
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
  border-top: 4px solid #17a2b8;
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
  background: #17a2b8;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #138496;
}

.lectures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.lecture-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.lecture-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.lecture-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.lecture-image:hover {
  transform: scale(1.02);
}

.lecture-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lecture-content {
  padding: 16px;
}

.lecture-header {
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



.like-date {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.lecture-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px 0;
  line-height: 1.3;
  cursor: pointer;
  transition: color 0.2s;
}

.lecture-title:hover {
  color: #17a2b8;
}

.lecture-description {
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

.lecture-rating-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.lecture-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  color: #ddd;
  font-size: 14px;
}

.star.filled {
  color: #ffc107;
}

.rating-count {
  font-size: 12px;
  color: #888;
}

.lecture-stats {
  display: flex;
  gap: 12px;
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

.lecture-bottom {
  display: flex;
  justify-content: flex-end;
}

.lecture-date {
  font-size: 12px;
  color: #999;
  font-weight: 500;
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
  background: #17a2b8;
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
  background: #138496;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .lectures-grid {
    grid-template-columns: 1fr;
  }
}
</style>
