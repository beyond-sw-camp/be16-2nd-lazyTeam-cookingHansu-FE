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
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

export default {
  name: "RecipeMainPage",
  components: { Header, Footer },
  data() {
    return {
      currentTab: "recipe",
      currentPage: 1,
      recipesPerPage: 8,
      selectedUserType: "",
      selectedCategory: "",
      selectedSort: "latest",
  },
  methods: {
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
  },
};
</script>
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
