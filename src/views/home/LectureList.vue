<template>
  <div class="lecture-list-page">
    <Header />
    <!-- 상단 탭과 강의 등록 버튼 -->
    <div class="nav-tabs">
      <div class="nav-buttons">
        <button :class="{ active: currentTab === 'recipe' }" @click="goToRecipe">
          레시피 게시글
        </button>
        <button :class="{ active: currentTab === 'lecture' }" @click="currentTab = 'lecture'">
          강의 목록
        </button>
      </div>
      <!-- 강의 등록하기 버튼 - CHEF, OWNER 역할일 때만 표시 -->
      <div v-if="userRole === 'CHEF' || userRole === 'OWNER'" class="lecture-create-btn-container">
        <button class="lecture-create-btn" @click="goToLectureCreate">
          강의 등록하기
        </button>
      </div>
    </div>

    <!-- 필터 -->
    <div class="filter-card">
      <div class="filter-title-row">
        <div class="filter-title">강의 필터</div>
      </div>
      <div class="filter-row">
        <div class="filter-col">
          <label>요리종류</label>
          <select v-model="selectedCategory">
            <option value="">전체</option>
            <option value="KOREAN">한식</option>
            <option value="WESTERN">양식</option>
            <option value="JAPANESE">일식</option>
            <option value="CHINESE">중식</option>
          </select>
        </div>
        <div class="filter-col">
          <label>정렬</label>
          <select v-model="selectedSort">
            <option value="latest">최신순</option>
            <option value="rating">평점 높은순</option>
            <option value="popular">인기순</option>
            <option value="price-low">가격 낮은순</option>
            <option value="price-high">가격 높은순</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">로딩 중...</div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">{{ error }}</div>
    </div>

    <!-- 강의 카드 리스트 -->
    <div v-else-if="pagedLectures.length > 0" class="lecture-grid">
      <div v-for="lecture in pagedLectures" :key="lecture.id" class="lecture-card" @click="handleCardClick(lecture)">
        <img :src="lecture.thumbUrl || '/src/assets/images/smu_mascort1.jpg'" class="lecture-img" />
        <div class="card-content">
          <div class="category-row">
            <span class="category-badge" :class="categoryClass(lecture.category)">{{ getCategoryName(lecture.category) }}</span>
            <span class="price">{{ lecture.price.toLocaleString() }}원</span>
          </div>
          <div class="title">{{ lecture.title }}</div>
          <div class="desc">{{ lecture.description }}</div>
          <div class="card-footer">
            <div class="meta">
              <span class="meta-rating">
                <span class="stars">
                  <span v-for="i in 5" :key="i" class="star" :class="getStarClass(i, lecture.rating || 0)">
                    ★
                  </span>
                </span>
                <span class="meta-count">({{ lecture.reviewCount || 0 }})</span>
              </span>
              <span class="meta-likes"><span class="meta-icon">&#9829;</span> {{ lecture.likesCount || 0 }}</span>
              <span class="meta-comments"><span class="meta-icon">💬</span> {{ lecture.qnaCount || 0 }}</span>
              <span class="meta-purchases"><span class="meta-icon">🛒</span> {{ lecture.purchaseCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 강의가 없을 때 메시지 -->
    <div v-else class="no-lectures-container">
      <div class="no-lectures-message">아직 강의가 등록되지 않았습니다.</div>
    </div>
    
    <!-- 페이지네이션 -->
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
import { getUserRoleFromToken } from '@/utils/api';
import { useAuthStore } from '@/store/auth/auth';
import { useLectureStore } from '@/store/lecture/lecture';

export default {
  name: 'LectureList',
  components: { Header, Pagination },
  setup() {
    const authStore = useAuthStore();
    const lectureStore = useLectureStore();
    return {
      authStore,
      lectureStore
    };
  },
  data() {
    return {
      currentTab: 'lecture',
      currentPage: 1,
      lecturesPerPage: 8,
      selectedCategory: '',
      selectedSort: 'latest',
      selectedLecture: null,
      showClickEffect: false,
      // 사용자 역할은 토큰에서 동적으로 가져옴
      lectures: [],
      totalLectures: 0,
      loading: false,
      error: null
    };
  },
  computed: {
    filteredLectures() {
      let filtered = this.lectures;
      
      // 카테고리 필터
      if (this.selectedCategory) {
        filtered = filtered.filter(l => l.category === this.selectedCategory);
      }
      
      // 정렬
      if (this.selectedSort === 'latest') {
        filtered = filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (this.selectedSort === 'rating') {
        filtered = filtered.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (this.selectedSort === 'popular') {
        filtered = filtered.slice().sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
      } else if (this.selectedSort === 'price-low') {
        filtered = filtered.slice().sort((a, b) => a.price - b.price);
      } else if (this.selectedSort === 'price-high') {
        filtered = filtered.slice().sort((a, b) => b.price - a.price);
      }
      
      return filtered;
    },
    pagedLectures() {
      // 백엔드에서 페이지네이션을 처리하므로 전체 강의 목록을 반환
      return this.filteredLectures;
    },
         totalPages() {
       const pages = Math.ceil(this.totalLectures / this.lecturesPerPage);
       return Math.max(1, pages);
     },
         // 사용자 역할 (토큰에서 동적으로 가져옴)
     userRole() {
       const authStore = useAuthStore();
       const tokenRole = getUserRoleFromToken();
       const storeRole = authStore.getUserRole;
       
       // 스토어의 역할을 우선 사용, 없으면 토큰에서 추출
       return storeRole || tokenRole;
     },

  },
  watch: {
    selectedCategory() {
      this.currentPage = 1;
    },
    selectedSort() {
      this.currentPage = 1;
    },
  },
     async created() {
     await this.fetchLectures();
   },
  methods: {
    async fetchLectures() {
      this.loading = true;
      this.error = null;
      
      try {
        // 페이지 정보를 포함하여 API 호출
        const response = await this.lectureStore.fetchLectures(this.currentPage - 1, this.lecturesPerPage);
        
                 if (response.success) {
          
          // 백엔드 응답 데이터를 프론트엔드 형식으로 변환
          let lectureData = [];
          
                     if (response.data.content && Array.isArray(response.data.content)) {
             // Spring Boot Page 객체 구조
             lectureData = response.data.content;
             this.totalLectures = response.data.totalElements || 0;
           } else if (Array.isArray(response.data)) {
             // 배열 구조 (페이지네이션 없이 전체 데이터 반환)
             lectureData = response.data;
             this.totalLectures = response.data.length;
           } else {
             this.error = '데이터 구조 오류';
             return;
           }
          
                     this.lectures = lectureData.map(lecture => {
             return {
               ...lecture,
               // 백엔드에서 제공하는 실제 좋아요 수 사용
               likesCount: lecture.likeCount || 0,
               // 백엔드에서 제공하는 평균 평점 사용
               rating: lecture.reviewAvg || 0,
             };
           });
        } else {
          this.error = '강의 목록을 불러오는데 실패했습니다.';
        }
      } catch (error) {
        console.error('강의 목록 조회 오류:', error);
        this.error = this.lectureStore.getError || '서버 연결에 실패했습니다.';
      } finally {
        this.loading = false;
      }
    },
    goToRecipe() { 
      this.$router.push({ name: 'RecipeMainPage' }); 
    },
    async changePage(page) {
      if (page >= 1) {
        this.currentPage = page;
        await this.fetchLectures();
      } else {
        this.currentPage = 1;
        await this.fetchLectures();
      }
    },
    categoryClass(category) {
      switch (category) {
        case 'KOREAN': return 'cat-korean';
        case 'WESTERN': return 'cat-western';
        case 'JAPANESE': return 'cat-japanese';
        case 'CHINESE': return 'cat-chinese';
        default: return '';
      }
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
         getStarClass(starIndex, rating) {
       const numRating = parseFloat(rating);
      
      if (numRating === 0) {
        return ''; // 별 없음
      }
      
      // 정수 부분만큼 완전히 채워진 별
      if (starIndex <= Math.floor(numRating)) {
        return 'filled';
      }
      
      // 소수점이 있는 경우 부분적으로 채워진 별
      if (starIndex === Math.ceil(numRating) && numRating % 1 !== 0) {
        const decimal = numRating % 1;
        if (decimal <= 0.2) return 'partially-filled-1';
        if (decimal <= 0.4) return 'partially-filled-2';
        if (decimal <= 0.6) return 'partially-filled-3';
        if (decimal <= 0.8) return 'partially-filled-4';
        return 'partially-filled-5';
      }
      
      return ''; // 빈 별
    },
         handleCardClick(lecture) {
       // 모든 강의 상세보기 가능
       this.$router.push({ name: 'LectureDetail', params: { id: lecture.id } });
     },
     goToLectureCreate() {
       this.$router.push({ name: 'LectureCreate' });
     },
    
  },
};
</script>

<style scoped>
.lecture-list-page { background: #fafbfc; min-height: 100vh; margin-top: 64px; }
.nav-tabs { 
  display: flex; 
  justify-content: center; 
  align-items: center;
  margin: 16px 0 24px 0; 
  max-width: 1040px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px 20px 0 20px; /* 상단에 20px 여백 추가 */
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
.nav-tabs button.active { background: #ff7a00; color: #fff; }

.lecture-create-btn-container {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.lecture-create-btn {
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

.lecture-create-btn:hover {
  background: #e66a00;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 122, 0, 0.3);
}

.filter-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 10px 14px 6px 14px; max-width: 1040px; margin: 0 auto 16px auto; }
.filter-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: #222; }
.filter-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.filter-row { display: flex; justify-content: space-between; gap: 16px; }
.filter-col { display: flex; flex-direction: column; flex: 1; min-width: 120px; }
.filter-col label { font-size: 13px; color: #444; font-weight: 500; margin-bottom: 4px; }
.filter-col select { padding: 6px 10px; border-radius: 6px; border: 1px solid #eee; font-size: 14px; background: #fafbfc; }

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-spinner {
  font-size: 16px;
  color: #666;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error-message {
  font-size: 16px;
  color: #ff3b3b;
}

.lecture-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  max-width: 1040px;
  margin: 0 auto 24px auto;
}

.lecture-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
  border: 1.5px solid #f3f3f3;
  transition: all 0.3s ease;
  cursor: pointer;
}

.lecture-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
.lecture-img { width: 100%; height: 90px; object-fit: cover; border-radius: 12px 12px 0 0; margin-bottom: 0; }
.card-content { display: flex; flex-direction: column; padding: 10px 12px 8px 12px; }
.category-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.category-badge { font-size: 13px; font-weight: 600; padding: 2px 10px; border-radius: 10px; background: #f5f5f5; }
.cat-korean { background: #ffe5c2; color: #ff7a00; }
.cat-chinese { background: #ffe2e2; color: #ff3b3b; }
.cat-western { background: #e2f0ff; color: #007aff; }
.cat-japanese { background: #e2ffe7; color: #00b86b; }
.cat-dessert { background: #fff3e2; color: #ff7a00; }
.price { font-size: 17px; color: #ff7a00; font-weight: 700; }

.title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #222;
  white-space: normal;
  word-break: keep-all;
  overflow: visible;
  text-overflow: unset;
}

.desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
  display: block;
  overflow: visible;
  white-space: normal;
  word-break: keep-all;
}

.card-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-top: auto;
}

.meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  align-items: center;
  line-height: 1;
}

.meta span {
  display: flex;
  align-items: center;
  gap: 2px;
}

.meta-icon {
  font-size: 12px;
}

.meta-rating .star {
  color: #ddd;
  font-size: 12px;
  position: relative;
}
.meta-rating .star.filled {
  color: #ffc107;
}
.meta-rating .star.partially-filled-1 {
  background: linear-gradient(90deg, #ffc107 20%, #ddd 20%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.meta-rating .star.partially-filled-2 {
  background: linear-gradient(90deg, #ffc107 40%, #ddd 40%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.meta-rating .star.partially-filled-3 {
  background: linear-gradient(90deg, #ffc107 60%, #ddd 60%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.meta-rating .star.partially-filled-4 {
  background: linear-gradient(90deg, #ffc107 80%, #ddd 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.meta-rating .star.partially-filled-5 {
  background: linear-gradient(90deg, #ffc107 100%, #ddd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.meta-count {
  font-size: 12px;
  color: #888;
}

.meta-likes,
.meta-comments,
.meta-purchases {
  font-weight: 500;
  display: flex;
  align-items: center;
}

.date {
  font-size: 11px;
  color: #bbb;
  font-weight: 400;
  white-space: nowrap;
  align-self: flex-end;
}

.meta {
  display: flex;
  gap: 8px;
  font-size: 10px;
  align-items: center;
  line-height: 1;
}

.meta-icon {
  font-size: 14px;
}

.meta-count {
  font-size: 12px;
  color: #888;
}

.meta-rating .star {
  font-size: 12px;
}

/* 강의가 없을 때 메시지 스타일 */
.no-lectures-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 20px;
}

.no-lectures-message {
  color: #ff7a00;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

</style>
