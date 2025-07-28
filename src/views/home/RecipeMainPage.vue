<template>
  <div class="recipe-main-page">
    <Header />
    <!-- 상단 탭 -->
    <div class="nav-tabs">
      <button :class="{ active: currentTab === 'recipe' }" @click="currentTab = 'recipe'">
        레시피 게시글
      </button>
      <button :class="{ active: currentTab === 'lecture' }" @click="goToLecture">
        강의 목록
      </button>
    </div>

    <!-- 필터 영역 -->
    <div class="filter-card">
      <div class="filter-title-row">
        <div class="filter-title">레시피 필터</div>
        <button class="write-btn">게시글 등록하기</button>
      </div>
      <div class="filter-row">
        <div class="filter-col">
          <label>사용자 유형</label>
          <select v-model="selectedUserType">
            <option value="">전체</option>
            <option value="GENERAL">일반 사용자</option>
            <option value="CHEF">요리 전문가</option>
            <option value="OWNER">자영업자</option>
          </select>
        </div>
        <div class="filter-col">
          <label>요식 종류</label>
          <select v-model="selectedCategory">
            <option value="">전체</option>
            <option value="KOREAN">한식</option>
            <option value="CHINESE">중식</option>
            <option value="WESTERN">양식</option>
            <option value="JAPANESE">일식</option>
          </select>
        </div>
        <div class="filter-col">
          <label>정렬</label>
          <select v-model="selectedSort">
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
          </select>
        </div>
      </div>
    </div>
    <!-- 레시피 카드 리스트 (2행 4열) -->
    <div class="recipe-grid">
      <div v-for="recipe in pagedRecipes" :key="recipe.id" class="recipe-card">
        <img :src="recipe.image" alt="썸네일" class="recipe-img" @error="onImgError" />
        <div class="card-content">
          <div class="card-header">
            <span class="category-label" :class="categoryClass(recipe.category)">{{ categoryText(recipe.category) }}</span>
            <span class="author-type">{{ userTypeText(recipe.authorType) }}</span>
          </div>
          <div class="title">{{ recipe.title }}</div>
          <div class="desc">{{ recipe.description || '간단한 레시피 설명이 들어갑니다.' }}</div>
          <div class="card-footer">
            <div class="meta">
              <span class="meta-views"><span class="meta-icon">&#128065;</span> {{ recipe.views }}</span>
              <span class="meta-likes">❤️ {{ recipe.likes }}</span>
              <span class="meta-comments">💬 {{ recipe.comments }}</span>
            </div>
            <div class="time">{{ recipe.time }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 페이지네이션-->
    <div class="pagination">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage <= 1"> &lt; </button>
      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: page === currentPage }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages"> &gt; </button>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';

const defaultThumbnail = '/src/assets/images/smu_mascort1.jpg';

export default {
  name: "RecipeMainPage",
  components: {
    Header,
  },
  data() {
    return {
      currentTab: "recipe",
      currentPage: 1,
      recipesPerPage: 8,
      selectedUserType: "",
      selectedCategory: "",
      selectedSort: "latest",
      recipes: [
        {
          id: 1,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: 'KOREAN',
          title: '집밥 백선생의 한식 레시피',
          authorType: 'CHEF',
          description: '쉽고 맛있는 한식 레시피 모음',
          likes: 120,
          comments: 15,
          views: 500,
          time: '1시간 전',
        },
        {
          id: 2,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: 'CHINESE',
          title: '중식 고수의 꿀팁',
          authorType: 'OWNER',
          description: '중식당 사장님의 인기 레시피',
          likes: 80,
          comments: 8,
          views: 300,
          time: '2시간 전',
        },
        {
          id: 3,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: 'WESTERN',
          title: '이탈리안 파스타 마스터',
          authorType: 'GENERAL',
          description: '집에서 즐기는 정통 파스타',
          likes: 60,
          comments: 5,
          views: 200,
          time: '3시간 전',
        },
        {
          id: 4,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: 'JAPANESE',
          title: '스시의 모든 것',
          authorType: 'CHEF',
          description: '스시 장인의 노하우',
          likes: 90,
          comments: 10,
          views: 250,
          time: '4시간 전',
        },
        {
          id: 5,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: 'KOREAN',
          title: '매콤한 김치찌개',
          authorType: 'GENERAL',
          description: '집밥의 정석, 김치찌개 레시피',
          likes: 70,
          comments: 6,
          views: 180,
          time: '5시간 전',
        },
        {
          id: 6,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: 'CHINESE',
          title: '깐풍기 쉽게 만들기',
          authorType: 'OWNER',
          description: '바삭하고 매콤한 깐풍기',
          likes: 55,
          comments: 4,
          views: 160,
          time: '6시간 전',
        },
        {
          id: 7,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: 'WESTERN',
          title: '홈메이드 피자',
          authorType: 'CHEF',
          description: '도우부터 토핑까지 직접!',
          likes: 100,
          comments: 12,
          views: 400,
          time: '7시간 전',
        },
        {
          id: 8,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: 'JAPANESE',
          title: '라멘 마스터 클래스',
          authorType: 'OWNER',
          description: '진한 국물의 비법 공개',
          likes: 65,
          comments: 7,
          views: 210,
          time: '8시간 전',
        },
        {
          id: 9,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: 'KOREAN',
          title: '된장찌개 완벽 가이드',
          authorType: 'CHEF',
          description: '집에서 만드는 맛있는 된장찌개',
          likes: 85,
          comments: 9,
          views: 320,
          time: '9시간 전',
        },
        {
          id: 10,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: 'CHINESE',
          title: '짜장면 홈메이드',
          authorType: 'GENERAL',
          description: '집에서 만드는 정통 짜장면',
          likes: 75,
          comments: 6,
          views: 280,
          time: '10시간 전',
        },
        {
          id: 11,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: 'WESTERN',
          title: '스테이크 마스터',
          authorType: 'CHEF',
          description: '완벽한 스테이크 굽기 비법',
          likes: 110,
          comments: 13,
          views: 450,
          time: '11시간 전',
        },
        {
          id: 12,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: 'JAPANESE',
          title: '우동 레시피',
          authorType: 'OWNER',
          description: '진한 국물의 우동 만들기',
          likes: 60,
          comments: 5,
          views: 190,
          time: '12시간 전',
        },
        {
          id: 13,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: 'KOREAN',
          title: '불고기 홈메이드',
          authorType: 'GENERAL',
          description: '집에서 만드는 맛있는 불고기',
          likes: 95,
          comments: 11,
          views: 380,
          time: '13시간 전',
        },
        {
          id: 14,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: 'CHINESE',
          title: '탕수육 완벽 레시피',
          authorType: 'CHEF',
          description: '바삭한 탕수육 만들기',
          likes: 88,
          comments: 8,
          views: 290,
          time: '14시간 전',
        },
        {
          id: 15,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: 'WESTERN',
          title: '샐러드 마스터',
          authorType: 'OWNER',
          description: '건강한 샐러드 만들기',
          likes: 70,
          comments: 7,
          views: 220,
          time: '15시간 전',
        },
        {
          id: 16,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: 'JAPANESE',
          title: '초밥 홈메이드',
          authorType: 'GENERAL',
          description: '집에서 만드는 초밥',
          likes: 82,
          comments: 9,
          views: 310,
          time: '16시간 전',
        },
        {
          id: 17,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: 'KOREAN',
          title: '비빔밥 레시피',
          authorType: 'CHEF',
          description: '건강한 비빔밥 만들기',
          likes: 78,
          comments: 6,
          views: 260,
          time: '17시간 전',
        },
        {
          id: 18,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: 'CHINESE',
          title: '마파두부 홈메이드',
          authorType: 'OWNER',
          description: '매콤달콤한 마파두부',
          likes: 66,
          comments: 5,
          views: 200,
          time: '18시간 전',
        },
        {
          id: 19,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: 'WESTERN',
          title: '파스타 카르보나라',
          authorType: 'GENERAL',
          description: '진한 카르보나라 레시피',
          likes: 92,
          comments: 10,
          views: 340,
          time: '19시간 전',
        },
        {
          id: 20,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: 'JAPANESE',
          title: '덮밥 레시피',
          authorType: 'CHEF',
          description: '간단한 덮밥 만들기',
          likes: 73,
          comments: 7,
          views: 240,
          time: '20시간 전',
        },
      ],
    };
  },
  computed: {
    filteredRecipes() {
      let filtered = this.recipes;
      
      // 사용자 유형 필터
      if (this.selectedUserType) {
        filtered = filtered.filter(r => r.authorType === this.selectedUserType);
      }
      
      // 카테고리 필터
      if (this.selectedCategory) {
        filtered = filtered.filter(r => r.category === this.selectedCategory);
      }
      
      // 정렬
      if (this.selectedSort === 'latest') {
        filtered = filtered.slice().sort((a, b) => b.id - a.id);
      } else if (this.selectedSort === 'popular') {
        filtered = filtered.slice().sort((a, b) => b.likes - a.likes);
      }
      
      return filtered;
    },
    pagedRecipes() {
      const start = (this.currentPage - 1) * this.recipesPerPage;
      const end = start + this.recipesPerPage;
      return this.filteredRecipes.slice(start, end);
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredRecipes.length / this.recipesPerPage));
    },
  },
  watch: {
    selectedUserType() {
      this.currentPage = 1;
    },
    selectedCategory() {
      this.currentPage = 1;
    },
    selectedSort() {
      this.currentPage = 1;
    },
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      } else if (page > this.totalPages) {
        this.currentPage = this.totalPages;
      } else if (page < 1) {
        this.currentPage = 1;
      }
    },
    goToLecture() {
      this.$router.push({ name: "LectureList" });
    },
    categoryText(category) {
      switch (category) {
        case 'KOREAN': return '한식';
        case 'CHINESE': return '중식';
        case 'WESTERN': return '양식';
        case 'JAPANESE': return '일식';
        default: return '기타';
      }
    },
    categoryClass(category) {
      return category ? `cat-${category.toLowerCase()}` : '';
    },
    userTypeText(type) {
      switch (type) {
        case 'GENERAL': return '일반 사용자';
        case 'CHEF': return '요리 전문가';
        case 'OWNER': return '자영업자';
        default: return '알 수 없음';
      }
    },
    userTypeClass(type) {
      return type ? `user-${type.toLowerCase()}` : '';
    },
    onImgError(e) {
      if (!e.target.src.includes('smu_mascort1.jpg')) {
        e.target.src = defaultThumbnail;
      }
    },
  },
};
</script>

<style scoped>
.recipe-main-page {
  background: #fafbfc;
  box-sizing: border-box;
  padding-bottom: 0;
  margin-top: 64px; /* 헤더 높이만큼만 */
}
.nav-tabs {
  display: flex;
  justify-content: center;
  margin: 16px 0 24px 0;
  gap: 12px;
}
.nav-tabs button {
  padding: 10px 24px;
  border: none;
  background: #fff;
  color: #ff7a00;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.nav-tabs button.active {
  background: #ff7a00;
  color: #fff;
}
.filter-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 10px 14px 6px 14px;
  max-width: 1040px;
  margin: 0 auto 16px auto;
}
.filter-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #222;
}
.filter-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.write-btn {
  background: #ff7a00;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}
.filter-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.filter-col {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 120px;
}
.filter-col label {
  font-size: 13px;
  color: #444;
  font-weight: 500;
  margin-bottom: 4px;
}
.filter-col select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #eee;
  font-size: 14px;
  background: #fafbfc;
}
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  max-width: 1040px;
  margin: 0 auto 24px auto;
}
.recipe-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 220px;
  overflow: hidden;
  border: 1.5px solid #f3f3f3;
  transition: all 0.3s ease;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
.recipe-img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
  margin-bottom: 0;
}
.card-content {
  display: flex;
  flex-direction: column;
  padding: 10px 12px 8px 12px;
  flex: 1;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2px;
}
.category-label {
  font-size: 12px;
  padding: 1.5px 8px;
  border-radius: 10px;
  font-weight: 600;
  display: inline-block;
}
.cat-korean { background: #ffe5c2; color: #ff7a00; }
.cat-chinese { background: #ffe2e2; color: #ff3b3b; }
.cat-western { background: #e2f0ff; color: #007aff; }
.cat-japanese { background: #e2ffe7; color: #00b86b; }
.author-type {
  font-size: 12px;
  color: #aaa;
  font-weight: 500;
  margin-top: 0;
}
.title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 2px;
  color: #222;
  line-height: 1.3;
}
.desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  min-height: 24px;
  line-height: 1.5;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}
.meta {
  display: flex;
  gap: 10px;
  font-size: 13px;
  align-items: center;
  line-height: 1;
}
.meta-views,
.meta-likes,
.meta-comments {
  font-weight: 600;
  display: flex;
  align-items: center;
}
.meta-icon {
  color: #888;
  font-size: 16px;
  vertical-align: middle;
  margin-right: 3px;
  display: inline-block;
}
.meta-views {
  color: #888;
}
.meta-likes {
  color: #ff4d4f;
}
.meta-comments {
  color: #00b86b;
}
.time {
  font-size: 12px;
  color: #bbb;
  font-weight: 400;
  white-space: nowrap;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  margin-top: 0;
}
.pagination button {
  border: none;
  background: #fff;
  color: #ff7a00;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-weight: 600;
  min-width: 26px;
  min-height: 26px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  font-size: 15px;
  transition: background 0.15s, color 0.15s;
}
.pagination button.active {
  background: #ff7a00;
  color: #fff;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
