<template>
  <div class="purchased-lectures">
    <div class="section-header">
      <h2>구매한 강의</h2>
    </div>

    <div v-if="ready" class="lectures-grid">
      <div v-for="lecture in pagedLectures" :key="lecture.id" class="lecture-card">
        <div class="lecture-image" @click="goToLectureDetail(lecture.id)">
          <img :src="lecture.thumbUrl" :alt="lecture.title" />
        </div>
        <div class="lecture-content">
          <div class="lecture-header">
            <span class="category-badge" :class="categoryClass(lecture.category)">{{ getCategoryName(lecture.category) }}</span>

            <router-link :to="{ name: 'PaymentDetails', params: { lectureId: lecture.id } }" class="payment-history-link">결제 내역</router-link>

          </div>
          <h3 class="lecture-title" @click="goToLectureDetail(lecture.id)">{{ lecture.title }}</h3>
          <p class="lecture-description">{{ lecture.description }}</p>
          <div class="lecture-rating-stats">
            <div class="lecture-rating">
              <span class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(lecture.reviewAvg || 0) }">
                  ★
                </span>
              </span>
              <span class="rating-count">({{ lecture.reviewCount }})</span>
            </div>
            <div class="lecture-stats">
              <span class="stat-item">
                <span class="stat-icon">❤️</span>
                {{ lecture.likeCount }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">💬</span>
                {{ lecture.qnaCount }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">👥</span>
                {{ lecture.purchaseCount }}
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
      v-if="ready"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <div v-if="ready && lectures.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>아직 구매한 강의가 없어요</h3>
      <p>관심 있는 강의를 구매하고 학습을 시작해보세요!</p>
      <button class="browse-lectures-btn" @click="goToLectures">강의 둘러보기</button>
    </div>
  </div>
</template>

<script>
import Pagination from '../common/Pagination.vue';
import { apiGet } from '../../utils/api.js';

export default {
  name: 'PurchasedLectures',
  components: {
    Pagination
  },
  data() {
    return {
      currentPage: 1,
      lecturesPerPage: 6,
      lectures: [],
      totalPages: 0,
      totalElements: 0,
      loading: false,
      ready: false
    };
  },
  computed: {
    pagedLectures() {
      return this.lectures;
    }
  },
  async mounted() {
    await this.fetchPurchasedLectures();
  },
  methods: {
    async fetchPurchasedLectures() {
      try {
        this.loading = true;
        const params = new URLSearchParams({
          page: this.currentPage - 1, // API는 0-based pagination
          size: this.lecturesPerPage
        });
        
        const response = await apiGet(`/api/my/lectures?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          this.lectures = data.data.content;
          this.totalPages = data.data.totalPages;
          this.totalElements = data.data.totalElements;
        }
      } catch (error) {
        console.error('구매한 강의 조회 실패:', error);
      } finally {
        this.loading = false;
        this.ready = true;
      }
    },
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        await this.fetchPurchasedLectures();
      }
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
    },
    goToLectureDetail(lectureId) {
      this.$router.push(`/lectures/${lectureId}`);
    },
    goToLectures() {
      this.$router.push('/lectures');
    }
  }
};
</script>

<style scoped>
.purchased-lectures {
  width: 100%;
}

.section-header {
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin: 0;
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

.cat-dessert {
  background: #fff3e2;
  color: #ff7a00;
}

.payment-history-link {
  font-size: 12px;
  color: #666;
  text-decoration: none;
  font-weight: 500;
  border: 1px solid #ddd;
  padding: 4px 8px;
  border-radius: 12px;
  background: #f9f9f9;
}

.payment-history-link:hover {
  color: #ff7a00;
  border-color: #ff7a00;
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
  color: #ff7a00;
}

.lecture-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
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

.browse-lectures-btn {
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

.browse-lectures-btn:hover {
  background: #e66a00;
}

@media (max-width: 768px) {
  .lectures-grid {
    grid-template-columns: 1fr;
  }
  
  .lecture-content {
    padding: 16px;
  }
}
</style> 