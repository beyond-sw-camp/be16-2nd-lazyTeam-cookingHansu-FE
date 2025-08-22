<template>
  <div class="lecture-list-page">
    <!-- 상단 탭 -->
    <div class="nav-tabs">
      <button :class="{ active: currentTab === 'recipe' }" @click="goToRecipe">
        레시피 게시글
      </button>
      <button :class="{ active: currentTab === 'lecture' }" @click="currentTab = 'lecture'">
        강의 목록
      </button>
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

    <!-- 강의 카드 리스트 -->
    <div class="lecture-grid">
      <div v-for="lecture in pagedLectures" :key="lecture.id" class="lecture-card" @click="handleCardClick(lecture)">
        <img :src="lecture.image" class="lecture-img" />
        <div class="card-content">
          <div class="category-row">
            <span class="category-badge" :class="categoryClass(lecture.category)">{{ lecture.category }}</span>
            <span class="price">{{ lecture.price.toLocaleString() }}원</span>
          </div>
          <div class="title">{{ lecture.title }}</div>
          <div class="desc">{{ lecture.description }}</div>
          <div class="card-footer">
            <div class="meta">
              <span class="meta-rating">
                <span class="stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(lecture.rating) }">
                    ★
                  </span>
                </span>
                <span class="meta-count">({{ lecture.ratingCount }})</span>
              </span>
              <span class="meta-likes"><span class="meta-icon">&#9829;</span> {{ lecture.likes }}</span>
              <span class="meta-comments"><span class="meta-icon">💬</span> {{ lecture.comments }}</span>
              <span class="meta-students"><span class="meta-icon">👥</span> {{ lecture.students }}</span>
            </div>
            <div class="date">{{ lecture.date }}</div>
          </div>
        </div>
      </div>
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
import Header from '@/components/Header1.vue';
import Pagination from '@/components/common/Pagination.vue';

export default {
  name: 'LectureList',
  components: { Header, Pagination },
  data() {
    return {
      currentTab: 'lecture',
      currentPage: 1,
      lecturesPerPage: 8,
      selectedCategory: '',
      selectedPrice: '',
      selectedSort: 'latest',
      selectedLecture: null,
      showClickEffect: false,
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
        {
          id: 9,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '한식',
          title: '김치찌개 마스터 클래스',
          description: '매콤달콤한 김치찌개 만드는 비법을 배워보세요.',
          price: 28000,
          teacher: '김치 셰프',
          rating: 4,
          ratingCount: 156,
          likes: 420,
          comments: 25,
          students: 280,
          date: '1주 전',
        },
        {
          id: 10,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: '양식',
          title: '스테이크 홈메이드',
          description: '집에서 만드는 완벽한 스테이크 레시피를 배워보세요.',
          price: 45000,
          teacher: '스테이크 셰프',
          rating: 5,
          ratingCount: 89,
          likes: 350,
          comments: 18,
          students: 150,
          date: '2주 전',
        },
        {
          id: 11,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '일식',
          title: '라멘 홈메이드',
          description: '진한 국물의 라멘을 집에서 만들어보세요.',
          price: 38000,
          teacher: '라멘 셰프',
          rating: 4,
          ratingCount: 67,
          likes: 220,
          comments: 12,
          students: 95,
          date: '3주 전',
        },
        {
          id: 12,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '중식',
          title: '짜장면 홈메이드',
          description: '정통 짜장면을 집에서 만들어보세요.',
          price: 25000,
          teacher: '짜장 셰프',
          rating: 3,
          ratingCount: 45,
          likes: 180,
          comments: 8,
          students: 120,
          date: '1달 전',
        },
        {
          id: 13,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '디저트',
          title: '티라미수 마스터',
          description: '이탈리안 디저트의 정석, 티라미수를 배워보세요.',
          price: 36000,
          teacher: '티라미수 셰프',
          rating: 5,
          ratingCount: 78,
          likes: 280,
          comments: 15,
          students: 110,
          date: '2주 전',
        },
        {
          id: 14,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '한식',
          title: '비빔밥 홈메이드',
          description: '건강한 비빔밥을 집에서 만들어보세요.',
          price: 32000,
          teacher: '비빔밥 셰프',
          rating: 4,
          ratingCount: 92,
          likes: 310,
          comments: 22,
          students: 180,
          date: '3주 전',
        },
        {
          id: 15,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: '양식',
          title: '피자 홈메이드',
          description: '도우부터 토핑까지 직접 만드는 피자 클래스.',
          price: 41000,
          teacher: '피자 셰프',
          rating: 4,
          ratingCount: 103,
          likes: 290,
          comments: 19,
          students: 140,
          date: '1달 전',
        },
        {
          id: 16,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '일식',
          title: '우동 홈메이드',
          description: '진한 국물의 우동을 집에서 만들어보세요.',
          price: 29000,
          teacher: '우동 셰프',
          rating: 3,
          ratingCount: 56,
          likes: 160,
          comments: 9,
          students: 85,
          date: '2주 전',
        },
        {
          id: 17,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '중식',
          title: '탕수육 홈메이드',
          description: '바삭한 탕수육을 집에서 만들어보세요.',
          price: 34000,
          teacher: '탕수육 셰프',
          rating: 4,
          ratingCount: 73,
          likes: 240,
          comments: 14,
          students: 130,
          date: '3주 전',
        },
        {
          id: 18,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '디저트',
          title: '마카롱 마스터',
          description: '프랑스 디저트의 정석, 마카롱을 배워보세요.',
          price: 48000,
          teacher: '마카롱 셰프',
          rating: 5,
          ratingCount: 88,
          likes: 320,
          comments: 20,
          students: 95,
          date: '1달 전',
        },
        {
          id: 19,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '한식',
          title: '된장찌개 홈메이드',
          description: '건강한 된장찌개를 집에서 만들어보세요.',
          price: 26000,
          teacher: '된장 셰프',
          rating: 4,
          ratingCount: 134,
          likes: 380,
          comments: 28,
          students: 220,
          date: '2주 전',
        },
        {
          id: 20,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: '양식',
          title: '샐러드 마스터',
          description: '건강한 샐러드를 맛있게 만드는 비법을 배워보세요.',
          price: 22000,
          teacher: '샐러드 셰프',
          rating: 3,
          ratingCount: 41,
          likes: 140,
          comments: 7,
          students: 75,
          date: '3주 전',
        },
        {
          id: 21,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '한식',
          title: '불고기 홈메이드',
          description: '정통 불고기 만드는 비법을 배워보세요.',
          price: 38000,
          teacher: '불고기 셰프',
          rating: 5,
          ratingCount: 167,
          likes: 450,
          comments: 32,
          students: 280,
          date: '1주 전',
        },
        {
          id: 22,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '양식',
          title: '리조또 마스터클래스',
          description: '크림리 리조또부터 해산물 리조또까지 완벽하게!',
          price: 42000,
          teacher: '리조또 셰프',
          rating: 4,
          ratingCount: 89,
          likes: 230,
          comments: 15,
          students: 120,
          date: '2주 전',
        },
        {
          id: 23,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '일식',
          title: '덮밥 홈메이드',
          description: '카츠동, 규동 등 다양한 덮밥을 만들어보세요.',
          price: 31000,
          teacher: '덮밥 셰프',
          rating: 4,
          ratingCount: 78,
          likes: 190,
          comments: 11,
          students: 95,
          date: '3주 전',
        },
        {
          id: 24,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '중식',
          title: '깐풍기 홈메이드',
          description: '바삭한 깐풍기를 집에서 만들어보세요.',
          price: 36000,
          teacher: '깐풍기 셰프',
          rating: 4,
          ratingCount: 65,
          likes: 210,
          comments: 13,
          students: 110,
          date: '1달 전',
        },
        {
          id: 25,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: '디저트',
          title: '크로플 마스터',
          description: '바삭한 크로플을 집에서 만들어보세요.',
          price: 29000,
          teacher: '크로플 셰프',
          rating: 5,
          ratingCount: 112,
          likes: 340,
          comments: 24,
          students: 160,
          date: '2주 전',
        },
        {
          id: 26,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '한식',
          title: '삼겹살 홈메이드',
          description: '집에서 즐기는 완벽한 삼겹살 구이법.',
          price: 44000,
          teacher: '삼겹살 셰프',
          rating: 4,
          ratingCount: 145,
          likes: 380,
          comments: 29,
          students: 200,
          date: '1주 전',
        },
        {
          id: 27,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '양식',
          title: '스테이크 소스 마스터',
          description: '완벽한 스테이크 소스 만드는 비법.',
          price: 28000,
          teacher: '소스 셰프',
          rating: 3,
          ratingCount: 52,
          likes: 160,
          comments: 8,
          students: 85,
          date: '3주 전',
        },
        {
          id: 28,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '일식',
          title: '오니기리 홈메이드',
          description: '다양한 모양과 맛의 오니기리를 만들어보세요.',
          price: 24000,
          teacher: '오니기리 셰프',
          rating: 4,
          ratingCount: 88,
          likes: 220,
          comments: 16,
          students: 130,
          date: '2주 전',
        },
        {
          id: 29,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '중식',
          title: '마파두부 홈메이드',
          description: '매콤달콤한 마파두부를 집에서 만들어보세요.',
          price: 27000,
          teacher: '마파두부 셰프',
          rating: 4,
          ratingCount: 73,
          likes: 200,
          comments: 12,
          students: 100,
          date: '1달 전',
        },
        {
          id: 30,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: '디저트',
          title: '치즈케이크 마스터',
          description: '부드러운 치즈케이크를 집에서 만들어보세요.',
          price: 35000,
          teacher: '치즈케이크 셰프',
          rating: 5,
          ratingCount: 134,
          likes: 360,
          comments: 26,
          students: 180,
          date: '1주 전',
        },
        {
          id: 31,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '한식',
          title: '닭볶음탕 홈메이드',
          description: '매콤달콤한 닭볶음탕 만드는 비법.',
          price: 33000,
          teacher: '닭볶음탕 셰프',
          rating: 4,
          ratingCount: 96,
          likes: 250,
          comments: 18,
          students: 140,
          date: '2주 전',
        },
        {
          id: 32,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '양식',
          title: '크림파스타 마스터',
          description: '부드러운 크림파스타를 완벽하게 만들어보세요.',
          price: 39000,
          teacher: '크림파스타 셰프',
          rating: 4,
          ratingCount: 104,
          likes: 270,
          comments: 21,
          students: 150,
          date: '3주 전',
        },
        {
          id: 33,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '일식',
          title: '오코노미야키 홈메이드',
          description: '일본의 대표 음식 오코노미야키를 만들어보세요.',
          price: 32000,
          teacher: '오코노미야키 셰프',
          rating: 3,
          ratingCount: 58,
          likes: 170,
          comments: 9,
          students: 90,
          date: '1달 전',
        },
        {
          id: 34,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '중식',
          title: '깐풍새우 홈메이드',
          description: '바삭한 깐풍새우를 집에서 만들어보세요.',
          price: 41000,
          teacher: '깐풍새우 셰프',
          rating: 5,
          ratingCount: 89,
          likes: 290,
          comments: 17,
          students: 120,
          date: '2주 전',
        },
        {
          id: 35,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: '디저트',
          title: '몽블랑 마스터',
          description: '프랑스 디저트의 정석, 몽블랑을 배워보세요.',
          price: 52000,
          teacher: '몽블랑 셰프',
          rating: 5,
          ratingCount: 76,
          likes: 310,
          comments: 22,
          students: 95,
          date: '1달 전',
        },
        {
          id: 36,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '한식',
          title: '갈비찜 홈메이드',
          description: '부드러운 갈비찜 만드는 비법을 배워보세요.',
          price: 46000,
          teacher: '갈비찜 셰프',
          rating: 4,
          ratingCount: 123,
          likes: 320,
          comments: 25,
          students: 170,
          date: '1주 전',
        },
        {
          id: 37,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '양식',
          title: '라자냐 마스터클래스',
          description: '이탈리안 라자냐를 완벽하게 만들어보세요.',
          price: 43000,
          teacher: '라자냐 셰프',
          rating: 4,
          ratingCount: 87,
          likes: 240,
          comments: 16,
          students: 130,
          date: '2주 전',
        },
        {
          id: 38,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '일식',
          title: '돈카츠 홈메이드',
          description: '바삭한 돈카츠를 집에서 만들어보세요.',
          price: 38000,
          teacher: '돈카츠 셰프',
          rating: 4,
          ratingCount: 95,
          likes: 260,
          comments: 19,
          students: 140,
          date: '3주 전',
        },
        {
          id: 39,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '중식',
          title: '훠궈 홈메이드',
          description: '중국식 샤브샤브 훠궈를 집에서 즐겨보세요.',
          price: 48000,
          teacher: '훠궈 셰프',
          rating: 5,
          ratingCount: 67,
          likes: 280,
          comments: 20,
          students: 110,
          date: '1달 전',
        },
        {
          id: 40,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: '디저트',
          title: '에클레어 마스터',
          description: '프랑스 디저트 에클레어를 배워보세요.',
          price: 44000,
          teacher: '에클레어 셰프',
          rating: 5,
          ratingCount: 82,
          likes: 300,
          comments: 23,
          students: 100,
          date: '2주 전',
        },
        {
          id: 41,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '한식',
          title: '순두부찌개 홈메이드',
          description: '매콤한 순두부찌개를 집에서 만들어보세요.',
          price: 25000,
          teacher: '순두부 셰프',
          rating: 4,
          ratingCount: 156,
          likes: 420,
          comments: 31,
          students: 240,
          date: '1주 전',
        },
        {
          id: 42,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '양식',
          title: '카르보나라 마스터',
          description: '정통 이탈리안 카르보나라를 배워보세요.',
          price: 36000,
          teacher: '카르보나라 셰프',
          rating: 4,
          ratingCount: 113,
          likes: 290,
          comments: 24,
          students: 160,
          date: '2주 전',
        },
        {
          id: 43,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '일식',
          title: '가라아게 홈메이드',
          description: '바삭한 가라아게를 집에서 만들어보세요.',
          price: 30000,
          teacher: '가라아게 셰프',
          rating: 3,
          ratingCount: 74,
          likes: 200,
          comments: 14,
          students: 105,
          date: '3주 전',
        },
        {
          id: 44,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '중식',
          title: '꿔바로우 홈메이드',
          description: '중국식 볶음밥 꿔바로우를 만들어보세요.',
          price: 22000,
          teacher: '꿔바로우 셰프',
          rating: 4,
          ratingCount: 89,
          likes: 230,
          comments: 17,
          students: 125,
          date: '1달 전',
        },
        {
          id: 45,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: '디저트',
          title: '마들렌 마스터',
          description: '프랑스 디저트 마들렌을 배워보세요.',
          price: 28000,
          teacher: '마들렌 셰프',
          rating: 4,
          ratingCount: 66,
          likes: 180,
          comments: 11,
          students: 85,
          date: '2주 전',
        },
        {
          id: 46,
          image: '/src/assets/images/smu_mascort1.jpg',
          category: '한식',
          title: '제육볶음 홈메이드',
          description: '매콤달콤한 제육볶음을 집에서 만들어보세요.',
          price: 34000,
          teacher: '제육볶음 셰프',
          rating: 4,
          ratingCount: 108,
          likes: 280,
          comments: 20,
          students: 155,
          date: '1주 전',
        },
        {
          id: 47,
          image: '/src/assets/images/smu_mascort2.jpg',
          category: '양식',
          title: '뇨끼 마스터클래스',
          description: '이탈리안 뇨끼를 완벽하게 만들어보세요.',
          price: 47000,
          teacher: '뇨끼 셰프',
          rating: 5,
          ratingCount: 73,
          likes: 250,
          comments: 18,
          students: 95,
          date: '2주 전',
        },
        {
          id: 48,
          image: '/src/assets/images/smu_mascort3.jpg',
          category: '일식',
          title: '오야코동 홈메이드',
          description: '일본의 대표 덮밥 오야코동을 만들어보세요.',
          price: 29000,
          teacher: '오야코동 셰프',
          rating: 4,
          ratingCount: 92,
          likes: 240,
          comments: 16,
          students: 135,
          date: '3주 전',
        },
        {
          id: 49,
          image: '/src/assets/images/smu_mascort4.jpg',
          category: '중식',
          title: '훙샤오러우 홈메이드',
          description: '중국식 탕수육 훙샤오러우를 만들어보세요.',
          price: 35000,
          teacher: '훙샤오러우 셰프',
          rating: 4,
          ratingCount: 81,
          likes: 220,
          comments: 15,
          students: 115,
          date: '1달 전',
        },
        {
          id: 50,
          image: '/src/assets/images/smu_mascort5.jpg',
          category: '디저트',
          title: '크레페 마스터',
          description: '프랑스 디저트 크레페를 배워보세요.',
          price: 32000,
          teacher: '크레페 셰프',
          rating: 4,
          ratingCount: 94,
          likes: 260,
          comments: 19,
          students: 140,
          date: '2주 전',
        },
      ],
    };
  },
  computed: {
    filteredLectures() {
      let filtered = this.lectures;
      
      // 카테고리 필터
      if (this.selectedCategory) {
        filtered = filtered.filter(l => l.category === this.selectedCategory);
      }
      
      // 가격대 필터
      if (this.selectedPrice) {
        filtered = filtered.filter(l => {
          if (this.selectedPrice === 'low') return l.price < 30000;
          if (this.selectedPrice === 'mid') return l.price >= 30000 && l.price <= 50000;
          if (this.selectedPrice === 'high') return l.price > 50000;
          return true;
        });
      }
      
      // 정렬
      if (this.selectedSort === 'latest') {
        filtered = filtered.slice().sort((a, b) => b.id - a.id);
      } else if (this.selectedSort === 'popular') {
        filtered = filtered.slice().sort((a, b) => b.likes - a.likes);
      }
      
      return filtered;
    },
    pagedLectures() {
      const start = (this.currentPage - 1) * this.lecturesPerPage;
      const end = start + this.lecturesPerPage;
      return this.filteredLectures.slice(start, end);
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredLectures.length / this.lecturesPerPage));
    },
  },
  watch: {
    selectedCategory() {
      this.currentPage = 1;
    },
    selectedPrice() {
      this.currentPage = 1;
    },
    selectedSort() {
      this.currentPage = 1;
    },
  },
  methods: {
    goToRecipe() { this.$router.push({ name: 'RecipeMainPage' }); },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      } else if (page > this.totalPages) {
        this.currentPage = this.totalPages;
      } else if (page < 1) {
        this.currentPage = 1;
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
    },
    handleCardClick(lecture) {
      console.log('강의 클릭:', lecture.id, lecture.title);
      
      // 강의 상세 페이지로 이동
      this.$router.push({ name: 'LectureDetail', params: { id: lecture.id } });
    },
  },
};
</script>

<style scoped>
.lecture-list-page { background: #fafbfc; min-height: 100vh; margin-top: 64px; }
.nav-tabs { display: flex; justify-content: center; margin: 16px 0 24px 0; gap: 12px; }
.nav-tabs button { padding: 10px 24px; border: none; background: #fff; color: #ff7a00; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.nav-tabs button.active { background: #ff7a00; color: #fff; }

.filter-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 10px 14px 6px 14px; max-width: 1040px; margin: 0 auto 16px auto; }
.filter-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: #222; }
.filter-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.filter-row { display: flex; justify-content: space-between; gap: 16px; }
.filter-col { display: flex; flex-direction: column; flex: 1; min-width: 120px; }
.filter-col label { font-size: 13px; color: #444; font-weight: 500; margin-bottom: 4px; }
.filter-col select { padding: 6px 10px; border-radius: 6px; border: 1px solid #eee; font-size: 14px; background: #fafbfc; }

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
}
.meta-rating .star.filled {
  color: #ffc107;
}

.meta-count {
  font-size: 12px;
  color: #888;
}

.meta-likes,
.meta-comments,
.meta-students {
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

</style>
