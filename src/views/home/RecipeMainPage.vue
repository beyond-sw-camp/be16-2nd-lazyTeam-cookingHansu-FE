<template>
  <div class="recipe-main-page">
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
        <button class="write-btn" @click="goToPostWrite">게시글 등록하기</button>
      </div>
      <div class="filter-row">
        <div class="filter-col">
          <label>사용자 유형</label>
          <select v-model="selectedUserType" @change="onFilterChange">
            <option value="">전체</option>
            <option value="GENERAL">일반 사용자</option>
            <option value="CHEF">요리 전문가</option>
            <option value="OWNER">자영업자</option>
          </select>
        </div>
        <div class="filter-col">
          <label>요식 종류</label>
          <select v-model="selectedCategory" @change="onFilterChange">
            <option value="">전체</option>
            <option value="KOREAN">한식</option>
            <option value="CHINESE">중식</option>
            <option value="WESTERN">양식</option>
            <option value="JAPANESE">일식</option>
          </select>
        </div>
        <div class="filter-col">
          <label>정렬</label>
          <select v-model="selectedSort" @change="onFilterChange">
            <option value="latest">최신순</option>
            <option value="views">조회순</option>
            <option value="likes">좋아요순</option>
            <option value="bookmarks">북마크순</option>
          </select>
        </div>
      </div>
    </div>
    <!-- 레시피 카드 리스트 (2행 4열) -->
    <div class="recipe-grid">
      <div v-for="recipe in pagedRecipes" :key="recipe.id" class="recipe-card" @click="handleCardClick(recipe)">
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
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Pagination from '@/components/common/Pagination.vue';
import axios from 'axios';

const defaultThumbnail = '/src/assets/images/smu_mascort1.jpg';

export default {
  name: "RecipeMainPage",
  components: {
    Header,
    Pagination,
  },
  data() {
    return {
      currentTab: "recipe",
      currentPage: 1,
      recipesPerPage: 8,
      selectedUserType: "",
      selectedCategory: "",
      selectedSort: "latest",
      selectedRecipe: null,
      showClickEffect: false,
      recipes: [], // 하드코딩된 데이터 제거, 빈 배열로 초기화
      totalItems: 0, // 서버에서 받은 총 레시피 수
    };
  },
  computed: {
    filteredRecipes() {
      // 클라이언트 측 필터링 제거, 서버에서 필터링 처리
      return this.recipes;
    },
    pagedRecipes() {
      // 서버에서 페이지네이션된 데이터 사용
      return this.recipes;
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.totalItems / this.recipesPerPage));
    },
  },
  watch: {
    selectedUserType() {
      this.currentPage = 1;
      this.fetchRecipes();
    },
    selectedCategory() {
      this.currentPage = 1;
      this.fetchRecipes();
    },
    selectedSort() {
      this.currentPage = 1;
      this.fetchRecipes();
    },
    currentPage() {
      this.fetchRecipes();
    },
  },
  created() {
    this.fetchRecipes(); // 컴포넌트 생성 시 데이터 가져오기
  },
  methods: {
    async fetchRecipes() {
      try {
        console.log('🔍 API 호출 시작:', {
          authorType: this.selectedUserType,
          category: this.selectedCategory,
          sort: this.selectedSort,
          page: this.currentPage,
          size: this.recipesPerPage
        });

        // 정렬 옵션을 백엔드 API 형식에 맞게 변환
        let sortParam = this.selectedSort;
        if (this.selectedSort === 'latest') {
          sortParam = 'createdAt,desc';
        } else if (this.selectedSort === 'views') {
          sortParam = 'viewCount,desc';
        } else if (this.selectedSort === 'likes') {
          sortParam = 'likeCount,desc';
        } else if (this.selectedSort === 'bookmarks') {
          sortParam = 'bookmarkCount,desc';
        }

        // 빈 값은 undefined로 설정하여 쿼리 파라미터에서 제외
        const params = {
          sort: sortParam,
          page: this.currentPage - 1,
          size: this.recipesPerPage,
        };

        if (this.selectedUserType) {
          params.role = this.selectedUserType; // 백엔드에서 role 파라미터 사용
        }
        if (this.selectedCategory) {
          params.category = this.selectedCategory;
        }

        console.log('📡 API 요청 파라미터:', JSON.stringify(params, null, 2));
        console.log('🔑 Authorization 토큰:', localStorage.getItem('accessToken') ? '있음' : '없음');

        const response = await axios.get('http://localhost:8080/api/posts', {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        console.log('✅ API 응답:', JSON.stringify(response.data, null, 2));
        
        // API 응답 데이터를 프론트엔드 형식에 맞게 변환
        this.recipes = (response.data.data.content || []).map(post => ({
          id: post.id,
          image: post.thumbnailUrl || defaultThumbnail,
          category: post.category,
          title: post.title,
          authorType: post.user?.role || 'GENERAL', // user.role 필드 사용
          description: post.description,
          likes: post.likeCount || 0,
          comments: 0, // commentCount 필드가 없음
          views: post.viewCount || 0,
          time: this.formatTime(post.createdAt)
        }));
        
        this.totalItems = response.data.data.totalElements || 0;
        
        console.log('🎯 변환된 레시피 데이터:', JSON.stringify(this.recipes, null, 2));
        console.log('📊 총 아이템 수:', this.totalItems);
        
      } catch (error) {
        console.error('❌ API 호출 실패:', error);
        console.error('❌ 에러 상세:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        
        // 에러 처리 (예: 사용자에게 알림 표시)
        this.recipes = [];
        this.totalItems = 0;
      }
    },
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
    
    // 시간 포맷팅
    formatTime(createdAt) {
      if (!createdAt) return '';
      
      const now = new Date();
      const created = new Date(createdAt);
      const diffTime = Math.abs(now - created);
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      
      if (diffHours < 1) return '방금 전';
      if (diffHours < 24) return `${diffHours}시간 전`;
      
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 7) return `${diffDays}일 전`;
      
      return created.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
    },
    handleCardClick(recipe) {
      // 레시피 상세 페이지로 이동
      this.$router.push(`/recipes/${recipe.id}`);
    },
    goToPostWrite() {
      this.$router.push('/recipe/post-write');
    },
    
    // 필터 변경 시 목록 재조회
    onFilterChange() {
      this.currentPage = 1;
      this.fetchRecipes();
    },
  },
};
</script>

<style scoped>
.recipe-main-page {
  background: #fafbfc;
  box-sizing: border-box;
  padding-bottom: 0;
  margin-top: 64px;
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
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>