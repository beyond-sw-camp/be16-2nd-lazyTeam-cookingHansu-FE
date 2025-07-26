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
