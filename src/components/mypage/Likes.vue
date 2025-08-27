<template>
  <div class="likes">
    <div class="section-header">
      <h2>좋아요</h2>
    </div>

    <div class="likes-grid">
      <div v-for="item in pagedLikes" :key="item.id" class="like-card">
        <div class="like-image">
          <img :src="item.image" :alt="item.title" />
          <button class="remove-like-btn" @click="unlikeItem(item.id)">
            <span class="remove-icon">×</span>
          </button>
        </div>
        <div class="like-content">
          <div class="like-type">
            <span class="type-badge" :class="typeClass(item.type)">{{ item.type }}</span>
            <span class="like-date">{{ item.likeDate }}</span>
          </div>
          <h3 class="like-title">{{ item.title }}</h3>
          <p class="like-description">{{ item.description }}</p>
          <div class="like-meta">
            <div class="author-stats">
              <span v-if="item.author" class="author">{{ item.author }}</span>
              <div class="like-stats">
                <span class="stat-item">
                  <span class="stat-icon">🔖</span>
                  {{ item.bookmarks }}
                </span>
                <span class="stat-item">
                  <span class="stat-icon">❤️</span>
                  {{ item.likes }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Pagination 
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <div v-if="likes.length === 0" class="empty-state">
      <div class="empty-icon">❤️</div>
      <h3>아직 좋아요한 항목이 없어요</h3>
      <p>마음에 드는 레시피나 게시글에 좋아요를 눌러보세요!</p>
      <button class="browse-content-btn">콘텐츠 둘러보기</button>
    </div>
  </div>
</template>

<script>
import Pagination from '../common/Pagination.vue';

export default {
  name: 'Likes',
  components: {
    Pagination
  },
  data() {
    return {

      currentPage: 1,
      likesPerPage: 6,
      likes: [
        {
          id: 1,
          type: '레시피',
          title: '김치찌개 만들면서 깨달은 요리 철학',
          description: '오늘 김치찌개를 끓이면서 느낀 점들을 공유해요. 요리는 정말 마음이 중요한 것 같아요...',
          image: '/src/assets/images/smu_mascort1.jpg',
          author: '김요리',
          likeDate: '2024.01.05',
          bookmarks: 18,
          likes: 42
        },
        {
          id: 2,
          type: '레시피',
          title: '한국 요리 초보자를 위한 팁',
          description: '요리를 시작한 지 6개월된 초보가 공유하는 실용적인 팁들. 실패담도 포함...',
          image: '/src/assets/images/smu_mascort2.jpg',
          author: '이요리',
          likeDate: '2024.01.03',
          bookmarks: 9,
          likes: 28
        },
        {
          id: 3,
          type: '레시피',
          title: '요리 도구 추천 리뷰',
          description: '1년간 사용해본 요리 도구들 솔직 후기. 꼭 필요한 것과 불필요한 것들...',
          image: '/src/assets/images/smu_mascort3.jpg',
          author: '박요리',
          likeDate: '2024.01.01',
          bookmarks: 14,
          likes: 35
        },
        {
          id: 4,
          type: '레시피',
          title: '집밥 vs 외식, 나의 선택은?',
          description: '한 달간 집밥만 해먹기 도전 후기. 건강과 경제적 효과, 그리고 의외의 발견들...',
          image: '/src/assets/images/smu_mascort4.jpg',
          author: '최요리',
          likeDate: '2023.12.28',
          bookmarks: 11,
          likes: 29
        }
      ]
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
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    unlikeItem(id) {
      this.likes = this.likes.filter(item => item.id !== id);
    },
    typeClass(type) {
      return type === '레시피' ? 'type-recipe' : 'type-post';
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

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  border-color: #ff7a00;
  color: #ff7a00;
}

.filter-tab.active {
  background: #ff7a00;
  color: white;
  border-color: #ff7a00;
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

.type-post {
  background: #e2f0ff;
  color: #007aff;
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
  
  .filter-tabs {
    justify-content: center;
  }
  
  .likes-grid {
    grid-template-columns: 1fr;
  }
}
</style> 