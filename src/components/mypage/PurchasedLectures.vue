<template>
  <div class="purchased-lectures">
    <div class="section-header">
      <h2>구매한 강의</h2>
    </div>

    <div class="lectures-grid">
      <div v-for="lecture in pagedLectures" :key="lecture.id" class="lecture-card">
        <div class="lecture-image">
          <img :src="lecture.image" :alt="lecture.title" />
        </div>
        <div class="lecture-content">
          <div class="lecture-header">
            <span class="category-badge" :class="categoryClass(lecture.category)">{{ lecture.category }}</span>
            <router-link :to="{ name: 'PaymentDetails', params: { orderId: 'ORDER_20250111_001' } }" class="payment-history-link">결제 내역</router-link>
          </div>
          <h3 class="lecture-title">{{ lecture.title }}</h3>
          <p class="lecture-description">{{ lecture.description }}</p>
          <div class="lecture-rating-stats">
            <div class="lecture-rating">
              <span class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(lecture.rating) }">
                  ★
                </span>
              </span>
              <span class="rating-count">({{ lecture.ratingCount }})</span>
            </div>
            <div class="lecture-stats">
              <span class="stat-item">
                <span class="stat-icon">❤️</span>
                {{ lecture.likes }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">💬</span>
                {{ lecture.comments }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">👥</span>
                {{ lecture.students }}
              </span>
            </div>
          </div>
          <div class="lecture-bottom">
            <div class="lecture-date">{{ lecture.date }}</div>
          </div>
        </div>
      </div>
    </div>

    <Pagination 
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <div v-if="lectures.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>아직 구매한 강의가 없어요</h3>
      <p>관심 있는 강의를 구매하고 학습을 시작해보세요!</p>
      <button class="browse-lectures-btn">강의 둘러보기</button>
    </div>
  </div>
</template>

<script>
import Pagination from './common/Pagination.vue';

export default {
  name: 'PurchasedLectures',
  components: {
    Pagination
  },
  data() {
    return {
      currentPage: 1,
      lecturesPerPage: 6,
      lectures: [
        {
          id: 1,
          title: '전문가와 함께하는 한식 기초',
          description: '한식의 기본기를 탄탄히 다지는 강의입니다. 초보자도 쉽게 따라 할 수 있어요!',
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '한식',
          rating: 5,
          ratingCount: 127,
          likes: 50,
          comments: 20,
          students: 120,
          date: '3일 전'
        },
        {
          id: 2,
          title: '홈메이드 파스타 마스터클래스',
          description: '집에서 만드는 정통 이탈리안 파스타 강의입니다. 면부터 소스까지!',
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '양식',
          rating: 4.5,
          ratingCount: 89,
          likes: 50,
          comments: 20,
          students: 120,
          date: '5일 전'
        },
        {
          id: 3,
          title: '일본 가정식 요리 마스터',
          description: '일본 가정에서 먹는 정통 요리들을 배워보세요!',
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '일식',
          rating: 4.8,
          ratingCount: 95,
          likes: 45,
          comments: 18,
          students: 98,
          date: '1주일 전'
        },
        {
          id: 4,
          title: '중국 요리의 모든 것',
          description: '중국 요리의 기본부터 고급 요리까지!',
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '중식',
          rating: 4.2,
          ratingCount: 76,
          likes: 38,
          comments: 15,
          students: 85,
          date: '2주일 전'
        },
        {
          id: 5,
          title: '디저트 베이킹 기초',
          description: '집에서 만드는 맛있는 디저트들!',
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '디저트',
          rating: 4.6,
          ratingCount: 103,
          likes: 52,
          comments: 22,
          students: 110,
          date: '3주일 전'
        }
      ]
    };
  },
  computed: {
    pagedLectures() {
      const start = (this.currentPage - 1) * this.lecturesPerPage;
      const end = start + this.lecturesPerPage;
      return this.lectures.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.lectures.length / this.lecturesPerPage);
    }
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    categoryClass(category) {
      switch (category) {
        case '한식': return 'cat-korean';
        case '양식': return 'cat-western';
        case '일식': return 'cat-japanese';
        case '중식': return 'cat-chinese';
        case '디저트': return 'cat-dessert';
        default: return '';
      }
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  height: 180px;
  overflow: hidden;
}

.lecture-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lecture-content {
  padding: 20px;
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