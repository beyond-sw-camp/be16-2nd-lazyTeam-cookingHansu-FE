<template>
  <div class="lecture-list-page">
    <Header />
    <!-- 상단 탭 -->
    <div class="nav-tabs">
      <button :class="{ active: currentTab === 'recipe' }" @click="goToRecipe">
        레시피 게시글
      </button>
      <button :class="{ active: currentTab === 'lecture' }" @click="currentTab = 'lecture'">
        강의 목록
      </button>
    </div>

    <!-- 필터 영역 -->
    <div class="filter-card">
      <div class="filter-title-row">
        <div class="filter-title">강의 필터</div>
      </div>
      <div class="filter-row">
        <div class="filter-col">
          <label>요리종류</label>
          <select v-model="selectedCategory">
            <option value="">전체</option>
            <option value="한식">한식</option>
            <option value="양식">양식</option>
            <option value="일식">일식</option>
            <option value="중식">중식</option>
          </select>
        </div>
        <div class="filter-col">
          <label>가격대</label>
          <select v-model="selectedPrice">
            <option value="">전체</option>
            <option value="low">3만원 이하</option>
            <option value="mid">3~5만원</option>
            <option value="high">5만원 이상</option>
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
  name: 'LectureList',
  components: { Header, Footer },
  data() {
    return {
      currentTab: 'lecture',
      selectedCategory: '',
      selectedPrice: '',
      selectedSort: 'latest',
      lectures: [
        {
          id: 1,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '한식',
          title: '전문가와 함께하는 한식 기초',
          description: '한식의 기본기를 탄탄히 다지는 강의입니다.',
          price: 49000,
          teacher: '홍길동 셰프',
          rating: 3,
          ratingCount: 127,
          likes: 500,
          comments: 20,
          students: 320,
          date: '3일 전',
        },
        {
          id: 2,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '양식',
          title: '홈메이드 파스타 마스터클래스',
          description: '집에서 만드는 정통 이탈리안 파스타 강의입니다. 면부터 소스까지!',
          price: 35000,
          teacher: '이파스타 셰프',
          rating: 4,
          ratingCount: 89,
          likes: 200,
          comments: 10,
          students: 120,
          date: '5일 전',
        },
        {
          id: 3,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '일식',
          title: '스시의 모든 것',
          description: '최고의 스시 마스터가 되어보세요. 신선한 재료와 정통 레시피를 제공합니다.',
          price: 55000,
          teacher: '김스시 셰프',
          rating: 5,
          ratingCount: 56,
          likes: 150,
          comments: 8,
          students: 80,
          date: '1주 전',
        },
        {
          id: 4,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '중식',
          title: '정통 중식 마스터',
          description: '중식의 모든 것을 배우고 싶다면, 이 강의를 선택하세요.',
          price: 42000,
          teacher: '왕중식 셰프',
          rating: 4,
          ratingCount: 34,
          likes: 90,
          comments: 5,
          students: 60,
          date: '2주 전',
        },
        {
          id: 5,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: '디저트',
          title: '달콤한 디저트 클래스',
          description: '달콤한 디저트를 만드는 비법을 배우고 싶다면, 이 강의를 선택하세요.',
          price: 32000,
          teacher: '박디저트 셰프',
          rating: 2,
          ratingCount: 22,
          likes: 70,
          comments: 30,
          students: 400,
          date: '3주 전',
        },
        {
          id: 6,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '한식',
          title: '한식 고급반',
          description: '한식의 고급 레시피와 팁을 배우고 싶다면, 이 강의를 선택하세요.',
          price: 51000,
          teacher: '최한식 셰프',
          rating: 5,
          ratingCount: 99,
          likes: 300,
          comments: 12,
          students: 200,
          date: '4주 전',
        },
        {
          id: 7,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '양식',
          title: '이탈리안 파스타 마스터',
          description: '이탈리안 파스타의 모든 것을 배우고 싶다면, 이 강의를 선택하세요.',
          price: 37000,
          teacher: '마리오 셰프',
          rating: 4,
          ratingCount: 77,
          likes: 180,
          comments: 7,
          students: 110,
          date: '1달 전',
        },
        {
          id: 8,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '디저트',
          title: '초콜릿 디저트 클래스',
          description: '초콜릿 디저트를 만드는 비법을 배우고 싶다면, 이 강의를 선택하세요.',
          price: 33000,
          teacher: '초코 셰프',
          rating: 4,
          ratingCount: 44,
          likes: 120,
          comments: 6,
          students: 70,
          date: '2달 전',
        },
      ],
    };
  },
  },
  methods: {
    goToRecipe() { this.$router.push({ name: 'RecipeMainPage' }); },
  },
};
</script>

<style scoped>
.lecture-list-page { background: #fafbfc; min-height: 100vh; margin-top: 80px; }
.nav-tabs { display: flex; justify-content: center; margin: 32px 0 24px 0; gap: 12px; }
.nav-tabs button { padding: 10px 24px; border: none; background: #fff; color: #ff7a00; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.nav-tabs button.active { background: #ff7a00; color: #fff; }

.filter-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 10px 14px 6px 14px; max-width: 1040px; margin: 0 auto 16px auto; }
.filter-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: #222; }
.filter-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.filter-row { display: flex; justify-content: space-between; gap: 16px; }
.filter-col { display: flex; flex-direction: column; flex: 1; min-width: 120px; }
.filter-col label { font-size: 13px; color: #444; font-weight: 500; margin-bottom: 4px; }
.filter-col select { padding: 6px 10px; border-radius: 6px; border: 1px solid #eee; font-size: 14px; background: #fafbfc; }
</style>
