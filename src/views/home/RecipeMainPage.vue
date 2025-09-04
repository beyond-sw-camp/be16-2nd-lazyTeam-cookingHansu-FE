<template>
  <div class="recipe-main-page">
    <!-- 상단 탭과 게시글 등록 버튼 -->
    <div class="nav-tabs">
      <div class="nav-buttons">
        <button :class="{ active: currentTab === 'recipe' }" @click="currentTab = 'recipe'">
          레시피 게시글
        </button>
        <button :class="{ active: currentTab === 'lecture' }" @click="goToLecture">
          강의 목록
        </button>
      </div>
      <!-- 게시글 등록하기 버튼 -->
      <div class="recipe-create-btn-container">
        <button class="recipe-create-btn" @click="goToWrite">
          게시글 등록하기
        </button>
      </div>
    </div>

    <!-- 필터 영역 -->
    <div class="filter-card">
      <div class="filter-title-row">
        <div class="filter-title">레시피 필터</div>
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
    <div v-if="pagedRecipes.length > 0" class="recipe-grid">
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
              <span class="meta-bookmarks">🔖 {{ recipe.bookmarks }}</span>
              <span class="meta-comments">💬 {{ recipe.commentCount || 0 }}</span>
            </div>
            <div class="time">{{ formatRelativeTime(recipe.createdAt || recipe.time) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 게시글이 없을 때 표시 -->
    <div v-else class="no-recipes-message">
      <div class="no-recipes-content">
        <div class="no-recipes-icon">📝</div>
        <h3 class="no-recipes-title">게시글이 없습니다</h3>
        <p class="no-recipes-description">검색 조건에 맞는 게시글이 없습니다.<br>다른 조건으로 검색해보세요.</p>
      </div>
    </div>
    <!-- 페이지네이션-->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <!-- 로그인 필요 모달 -->
    <LoginRequiredModal
      v-model="showLoginModal"
      title="로그인이 필요합니다"
      message="게시글을 등록하려면 로그인이 필요합니다."
      sub-message="로그인 후 레시피를 공유하고 다른 사용자들과 소통할 수 있습니다."
      confirm-text="로그인하기"
      cancel-text="취소"
      @confirm="goToLogin"
      @cancel="closeLoginModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '@/components/Header.vue';
import Pagination from '@/components/common/Pagination.vue';
import LoginRequiredModal from '@/components/common/LoginRequiredModal.vue';
import { useAuthStore } from '@/store/auth/auth';
import { useRecipeStore } from '@/store/recipe/recipe';

const defaultThumbnail = '/src/assets/images/smu_mascort1.jpg';

// 스토어 사용
const authStore = useAuthStore();
const recipeStore = useRecipeStore();
const router = useRouter();

// 반응형 데이터
const currentTab = ref("recipe");
const currentPage = ref(1);
const recipesPerPage = ref(8);
const selectedUserType = ref("");
const selectedCategory = ref("");
const selectedSort = ref("latest");
const selectedRecipe = ref(null);
const showClickEffect = ref(false);
const showLoginModal = ref(false);
// computed 속성
const isLoggedIn = computed(() => authStore.isAuthenticated);
const recipes = computed(() => recipeStore.getRecipes);
const filteredRecipes = computed(() => recipes.value);
const pagedRecipes = computed(() => {
  // 클라이언트 사이드 페이지네이션 적용
  const startIndex = (currentPage.value - 1) * recipesPerPage.value;
  const endIndex = startIndex + recipesPerPage.value;
  return recipes.value.slice(startIndex, endIndex);
});
const totalPages = computed(() => Math.max(1, Math.ceil(recipes.value.length / recipesPerPage.value)));
const totalItems = computed(() => recipeStore.getPaginationInfo.totalElements);
// watch 속성 (통합하여 중복 API 호출 방지)
watch([selectedUserType, selectedCategory, selectedSort], () => {
  currentPage.value = 1;
  fetchRecipes();
});

// 컴포넌트 마운트 시 데이터 가져오기
onMounted(() => {
  fetchRecipes();
});
// 메서드들
const fetchRecipes = async () => {
  try {


    // 정렬 옵션을 백엔드 API 형식에 맞게 변환
    let sortParam = selectedSort.value;
    if (selectedSort.value === 'latest') {
      sortParam = 'createdAt,desc';
    } else if (selectedSort.value === 'views') {
      sortParam = 'viewCount,desc';
    } else if (selectedSort.value === 'likes') {
      sortParam = 'likeCount,desc';
    } else if (selectedSort.value === 'bookmarks') {
      sortParam = 'bookmarkCount,desc';
    }

    // 필터 설정
    const filters = {
      role: selectedUserType.value || '',
      category: selectedCategory.value || '',
      sort: sortParam
    };

    // 스토어에 필터 설정
    recipeStore.setFilters(filters);

    // 레시피 목록 조회
    await recipeStore.fetchRecipes({
      page: 0,
      size: 100, // 모든 데이터를 한 번에 가져와서 클라이언트 사이드 페이지네이션
      ...filters
    });
    
    
  } catch (error) {
    console.error('❌ 레시피 목록 조회 실패:', error);
  }
};
const changePage = (page) => {
  
  // 페이지 범위 체크
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
  } else if (page > totalPages.value) {
    currentPage.value = totalPages.value;
  } else if (page < 1) {
    currentPage.value = 1;
  } else {
  }
};

const goToLecture = () => {
  router.push({ name: "LectureList" });
};

const goToWrite = () => {
  if (isLoggedIn.value) {
    // 게시글 등록 페이지로 이동
    router.push('/recipe/post-write');
  } else {
    // 비회원인 경우 로그인 필요 모달 표시
    showLoginModal.value = true;
  }
};

const goToLogin = () => {
  // 로그인 페이지로 이동
  router.push({ name: "Login" });
  closeLoginModal();
};

const closeLoginModal = () => {
  showLoginModal.value = false;
};
const categoryText = (category) => {
  switch (category) {
    case 'KOREAN': return '한식';
    case 'CHINESE': return '중식';
    case 'WESTERN': return '양식';
    case 'JAPANESE': return '일식';
    default: return '기타';
  }
};

const categoryClass = (category) => {
  return category ? `cat-${category.toLowerCase()}` : '';
};

const userTypeText = (type) => {
  switch (type) {
    case 'GENERAL': return '일반 사용자';
    case 'CHEF': return '요리 전문가';
    case 'OWNER': return '자영업자';
    default: return '알 수 없음';
  }
};

const userTypeClass = (type) => {
  return type ? `user-${type.toLowerCase()}` : '';
};

const onImgError = (e) => {
  if (!e.target.src.includes('smu_mascort1.jpg')) {
    e.target.src = defaultThumbnail;
  }
};

// 상대적 시간 포맷팅
const formatRelativeTime = (timeString) => {
  if (!timeString) return '시간 정보 없음';
  
  try {
    const now = new Date();
    const created = new Date(timeString);
    
    // 유효하지 않은 날짜인 경우
    if (isNaN(created.getTime())) {
      return timeString; // 원본 문자열 반환
    }
    
    const diffTime = Math.abs(now - created);
    
    // 분 단위
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    
    // 시간 단위
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    // 일 단위
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays}일 전`;
    
    // 주 단위
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}주 전`;
    
    // 월 단위
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}개월 전`;
    
    // 년 단위
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}년 전`;
  } catch (error) {
    console.error('시간 포맷팅 오류:', error);
    return timeString; // 오류 시 원본 문자열 반환
  }
};

const handleCardClick = (recipe) => {
  // 레시피 상세 페이지로 이동
  router.push(`/recipes/${recipe.id}`);
};

// 필터 변경 시 목록 재조회
const onFilterChange = () => {
  currentPage.value = 1;
  fetchRecipes();
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
  align-items: center;
  margin: 16px 0 24px 0;
  max-width: 1040px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px 20px 0 20px;
  position: relative;
  min-height: 60px; /* 최소 높이 설정으로 높이 변화 방지 */
}

.nav-buttons {
  display: flex;
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
.recipe-create-btn-container {
  position: absolute;
  right: 20px;
  top: 20px;
}

.recipe-create-btn {
  padding: 10px 20px;
  background: #ff7a00;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(255, 122, 0, 0.2);
}

.recipe-create-btn:hover {
  background: #e66a00;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 122, 0, 0.3);
  color: white !important;
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
  min-height: 480px; /* 페이지네이션 위치 고정을 위한 최소 높이 */
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

/* 게시글이 없을 때 메시지 스타일 */
.no-recipes-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  max-width: 1040px;
  margin: 0 auto 24px auto;
}

.no-recipes-content {
  text-align: center;
  padding: 40px 20px;
}

.no-recipes-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-recipes-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.no-recipes-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>