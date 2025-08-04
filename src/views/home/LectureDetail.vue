<template>
  <div class="lecture-detail-page">
    <Header />
    
    <div v-if="lecture" class="detail-container">
      <!-- 메인 콘텐츠 영역 -->
      <div class="main-content">
        <!-- 강의 제목 및 설명 -->
        <div class="lecture-header">
          <div class="tags">
            <span class="tag cuisine">{{ lecture.category }}</span>
            <span class="tag level">{{ lecture.level }}</span>
          </div>
          <h1 class="lecture-title">{{ lecture.title }}</h1>
          <p class="lecture-description">{{ lecture.description }}</p>
        </div>

        <!-- 비디오 미리보기 -->
        <div class="video-preview">
          <div class="video-container">
            <div class="video-placeholder">
              <div class="play-button">▶</div>
            </div>
            <div class="video-info">
              <h3>강의 미리보기</h3>
              <p>{{ lecture.title }}</p>
            </div>
          </div>
        </div>

        <!-- 강의 커리큘럼 -->
        <div class="curriculum-section">
          <div class="section-header">
            <h2>강의 목록</h2>
            <span class="total-lessons">총 {{ lecture.lessons.length }}강</span>
          </div>
          <div class="lessons-list">
            <div 
              v-for="(lesson, index) in lecture.lessons" 
              :key="index" 
              class="lesson-item"
              :class="{ 'preview': lesson.isPreview }"
            >
              <div class="lesson-info">
                <div class="lesson-icon">
                  <span v-if="lesson.isPreview" class="play-icon">▶</span>
                  <span v-else class="lock-icon">🔒</span>
                </div>
                <div class="lesson-content">
                  <h3>{{ lesson.title }}</h3>
                  <p>{{ lesson.description }}</p>
                </div>
              </div>
              <div class="lesson-meta">
                <span class="duration">{{ lesson.duration }}</span>
                <span v-if="lesson.isPreview" class="preview-badge">미리보기</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 강사 소개 -->
        <div class="instructor-section">
          <h2>강사 소개</h2>
          <div class="instructor-info">
            <div class="instructor-avatar">
              <span>{{ lecture.instructor.name.charAt(0) }}</span>
            </div>
            <div class="instructor-details">
              <h3>{{ lecture.instructor.name }}</h3>
              <p>{{ lecture.instructor.title }}</p>
            </div>
          </div>
        </div>

        <!-- 리뷰 및 Q&A -->
        <div class="reviews-section">
          <div class="tabs">
            <button 
              :class="{ active: activeTab === 'reviews' }" 
              @click="activeTab = 'reviews'"
            >
              수강평 ({{ lecture.reviews.length }})
            </button>
            <button 
              :class="{ active: activeTab === 'qa' }" 
              @click="activeTab = 'qa'"
            >
              Q&A ({{ lecture.qa.length }})
            </button>
          </div>
          
          <div v-if="activeTab === 'reviews'" class="reviews-content">
            <button class="write-review-btn">리뷰 작성하기</button>
            <div v-if="lecture.reviews.length === 0" class="no-reviews">
              <p>아직 리뷰가 없습니다.</p>
              <p>첫 번째 리뷰를 작성해보세요!</p>
            </div>
          </div>
          
          <div v-if="activeTab === 'qa'" class="qa-content">
            <div v-if="lecture.qa.length === 0" class="no-qa">
              <p>아직 Q&A가 없습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 사이드바 -->
      <div class="sidebar">
        <!-- 구매 정보 -->
        <div class="purchase-section">
          <div class="price">{{ lecture.price.toLocaleString() }}원</div>
          <button class="enroll-btn">지금 수강하기</button>
          <div class="share-section">
            <span class="share-icon">📤</span>
            <span>공유하기</span>
          </div>
        </div>

        <!-- 강의 요약 -->
        <div class="course-summary">
          <div class="summary-item">
            <span class="label">총 강의 수</span>
            <span class="value">{{ lecture.lessons.length }}강</span>
          </div>
          <div class="summary-item">
            <span class="label">총 시간</span>
            <span class="value">{{ lecture.totalDuration }}</span>
          </div>
          <div class="summary-item">
            <span class="label">난이도</span>
            <span class="value">{{ lecture.level }}</span>
          </div>
          <div class="summary-item">
            <span class="label">수강생</span>
            <span class="value">{{ lecture.students }}명</span>
          </div>
          <div class="summary-item">
            <span class="label">평점</span>
            <span class="value">☆ {{ lecture.rating }}({{ lecture.ratingCount }})</span>
          </div>
        </div>

        <!-- 레시피 -->
        <div class="recipe-section">
          <h3>레시피 📖</h3>
          <div class="recipe-card">
            <h4>{{ lecture.recipe.title }}</h4>
            <p>{{ lecture.recipe.description }}</p>
            <div class="recipe-meta">
              <span>{{ lecture.recipe.servings }}</span>
              <span>{{ lecture.recipe.cookTime }}</span>
              <span>{{ lecture.recipe.difficulty }}</span>
            </div>
            
            <div class="ingredients">
              <h5>재료 ({{ lecture.recipe.servings }})</h5>
              <ul>
                <li v-for="ingredient in lecture.recipe.ingredients" :key="ingredient.name">
                  {{ ingredient.name }}: {{ ingredient.amount }}
                </li>
              </ul>
            </div>
            
            <div class="cooking-steps">
              <h5>조리 과정</h5>
              <ol>
                <li v-for="(step, index) in lecture.recipe.steps" :key="step">
                  <span class="step-number">{{ index + 1 }}</span>
                  <span class="step-text">{{ step }}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 로딩 상태 -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>강의 정보를 불러오는 중...</p>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';

export default {
  name: 'LectureDetail',
  components: { Header },
  data() {
    return {
      activeTab: 'reviews',
      lecture: null,
      // 강의 목록 데이터 (실제로는 API에서 가져옴)
      lecturesData: [
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
      ]
    };
  },
  methods: {
    // 강의 데이터를 받아오는 메서드 (실제로는 API 호출)
    async fetchLectureData(lectureId) {
      // 실제 구현에서는 API에서 강의 데이터를 가져옴
      console.log('강의 ID:', lectureId);
      
      // 강의 목록에서 해당 ID의 강의 찾기
      const baseLecture = this.lecturesData.find(l => l.id == lectureId);
      
      if (baseLecture) {
        // 강의 상세 정보 생성
        this.lecture = {
          ...baseLecture,
          level: this.getLevelByCategory(baseLecture.category),
          totalDuration: this.generateTotalDuration(),
          instructor: {
            name: baseLecture.teacher,
            title: '요리 전문가'
          },
          lessons: this.generateLessons(baseLecture),
          reviews: [],
          qa: [],
          recipe: this.generateRecipe(baseLecture)
        };
      } else {
        // 강의를 찾을 수 없는 경우 기본 데이터 사용
        this.lecture = this.getDefaultLecture();
      }
    },
    
    getLevelByCategory(category) {
      const levelMap = {
        '한식': '초급',
        '양식': '중급',
        '일식': '고급',
        '중식': '중급',
        '디저트': '초급'
      };
      return levelMap[category] || '초급';
    },
    
    generateTotalDuration() {
      const durations = ['1시간 15분', '1시간 30분', '2시간', '1시간 45분', '1시간 20분'];
      return durations[Math.floor(Math.random() * durations.length)];
    },
    
    generateLessons(baseLecture) {
      const lessonTemplates = {
        '한식': [
          { title: '기본 재료 준비하기', description: '한식의 기본 재료와 도구 준비', duration: '15분', isPreview: true },
          { title: '양념 만들기', description: '한식의 핵심, 양념 만들기', duration: '25분', isPreview: false },
          { title: '조리법 완성하기', description: '완성도 높은 한식 조리법', duration: '20분', isPreview: false }
        ],
        '양식': [
          { title: '파스타 면 삶기의 비법', description: '알덴테 파스타를 위한 삶기 방법', duration: '15분', isPreview: true },
          { title: '크림 소스 만들기', description: '진짜 이탈리아식 크림 소스 레시피', duration: '30분', isPreview: false },
          { title: '파스타와 소스 결합하기', description: '면과 소스를 완벽하게 결합하는 방법', duration: '10분', isPreview: false }
        ],
        '일식': [
          { title: '스시 밥 만들기', description: '스시의 기본, 밥 만들기', duration: '20분', isPreview: true },
          { title: '생선 손질하기', description: '신선한 생선 손질 방법', duration: '25분', isPreview: false },
          { title: '스시 완성하기', description: '완벽한 스시 만들기', duration: '15분', isPreview: false }
        ],
        '중식': [
          { title: '중식 기본 재료', description: '중식의 기본 재료 준비', duration: '15분', isPreview: true },
          { title: '양념과 소스', description: '중식의 핵심 양념 만들기', duration: '20분', isPreview: false },
          { title: '완성도 높은 중식', description: '정통 중식 완성하기', duration: '25분', isPreview: false }
        ],
        '디저트': [
          { title: '디저트 기본기', description: '디저트의 기본 재료와 도구', duration: '15분', isPreview: true },
          { title: '크림 만들기', description: '부드러운 크림 만들기', duration: '20분', isPreview: false },
          { title: '디저트 완성', description: '완벽한 디저트 완성하기', duration: '15분', isPreview: false }
        ]
      };
      
      return lessonTemplates[baseLecture.category] || lessonTemplates['한식'];
    },
    
    generateRecipe(baseLecture) {
      const recipeTemplates = {
        '한식': {
          title: '김치찌개',
          description: '매콤달콤한 김치찌개',
          servings: '2인분',
          cookTime: '30분',
          difficulty: '초급',
          ingredients: [
            { name: '김치', amount: '200g' },
            { name: '돼지고기', amount: '150g' },
            { name: '두부', amount: '1/2모' },
            { name: '양파', amount: '1/2개' },
            { name: '대파', amount: '1대' },
            { name: '고춧가루', amount: '1큰술' }
          ],
          steps: [
            '김치를 적당한 크기로 썰어둡니다',
            '돼지고기를 준비합니다',
            '양파와 대파를 썰어둡니다',
            '냄비에 기름을 두르고 고기를 볶습니다',
            '김치를 넣고 볶습니다',
            '물을 넣고 끓입니다',
            '두부와 채소를 넣고 끓입니다'
          ]
        },
        '양식': {
          title: '크림 파스타',
          description: '진짜 이탈리아식 크림 파스타',
          servings: '2인분',
          cookTime: '25분',
          difficulty: '초급',
          ingredients: [
            { name: '파스타 면', amount: '200 g' },
            { name: '생크림', amount: '200 ml' },
            { name: '파마산 치즈', amount: '50 g' },
            { name: '마늘', amount: '3쪽' },
            { name: '올리브오일', amount: '2큰술' },
            { name: '후추', amount: '적당량' }
          ],
          steps: [
            '파스타 면을 알덴테로 삶는다',
            '팬에 올리브오일과 마늘을 볶는다',
            '생크림을 넣고 끓인다',
            '파마산 치즈를 넣어 녹인다',
            '삶은 면을 넣고 소스와 잘 섞는다',
            '후추로 마무리한다'
          ]
        },
        '일식': {
          title: '스시',
          description: '신선한 스시',
          servings: '2인분',
          cookTime: '40분',
          difficulty: '고급',
          ingredients: [
            { name: '쌀', amount: '2컵' },
            { name: '생선', amount: '200g' },
            { name: '초밥초', amount: '적당량' },
            { name: '와사비', amount: '적당량' },
            { name: '간장', amount: '적당량' }
          ],
          steps: [
            '쌀을 깨끗이 씻어서 밥을 짓습니다',
            '초밥초를 섞어서 식힙니다',
            '생선을 손질합니다',
            '밥을 적당한 크기로 뭉칩니다',
            '생선을 올려서 완성합니다'
          ]
        },
        '중식': {
          title: '짜장면',
          description: '정통 짜장면',
          servings: '2인분',
          cookTime: '30분',
          difficulty: '중급',
          ingredients: [
            { name: '면', amount: '300g' },
            { name: '돼지고기', amount: '200g' },
            { name: '양파', amount: '1개' },
            { name: '춘장', amount: '3큰술' },
            { name: '식용유', amount: '적당량' }
          ],
          steps: [
            '면을 삶아서 준비합니다',
            '돼지고기를 다집니다',
            '양파를 썰어둡니다',
            '기름을 두르고 고기를 볶습니다',
            '춘장을 넣고 볶습니다',
            '면과 섞어서 완성합니다'
          ]
        },
        '디저트': {
          title: '티라미수',
          description: '이탈리안 디저트',
          servings: '4인분',
          cookTime: '20분',
          difficulty: '중급',
          ingredients: [
            { name: '마스카포네', amount: '250g' },
            { name: '계란', amount: '3개' },
            { name: '설탕', amount: '60g' },
            { name: '커피', amount: '200ml' },
            { name: '레이디핑거', amount: '적당량' }
          ],
          steps: [
            '계란 노른자와 설탕을 섞습니다',
            '마스카포네를 넣고 섞습니다',
            '계란 흰자를 거품내어 섞습니다',
            '커피에 레이디핑거를 담급니다',
            '크림을 올려서 완성합니다'
          ]
        }
      };
      
      return recipeTemplates[baseLecture.category] || recipeTemplates['한식'];
    },
    
    getDefaultLecture() {
      return {
        id: 1,
        title: '크림 파스타의 모든 것',
        description: '진짜 이탈리아 스타일 크림 파스타 만들기. 면 삶기부터 크림 소스 만들기까지 모든 노하우를 담았습니다.',
        category: '양식',
        level: '초급',
        price: 35000,
        totalDuration: '1시간 15분',
        students: 142,
        rating: 0.0,
        ratingCount: 0,
        instructor: {
          name: '김 요리',
          title: '요리 전문가'
        },
        lessons: [
          {
            title: '파스타 면 삶기의 비법',
            description: '알덴테 파스타를 위한 삶기 방법',
            duration: '15분',
            isPreview: true
          },
          {
            title: '크림 소스 만들기',
            description: '진짜 이탈리아식 크림 소스 레시피',
            duration: '30분',
            isPreview: false
          },
          {
            title: '파스타와 소스 결합하기',
            description: '면과 소스를 완벽하게 결합하는 방법',
            duration: '10분',
            isPreview: false
          }
        ],
        reviews: [],
        qa: [],
        recipe: {
          title: '크림 파스타',
          description: '진짜 이탈리아식 크림 파스타',
          servings: '2인분',
          cookTime: '25분',
          difficulty: '초급',
          ingredients: [
            { name: '파스타 면', amount: '200 g' },
            { name: '생크림', amount: '200 ml' },
            { name: '파마산 치즈', amount: '50 g' },
            { name: '마늘', amount: '3쪽' },
            { name: '올리브오일', amount: '2큰술' },
            { name: '후추', amount: '적당량' }
          ],
          steps: [
            '파스타 면을 알덴테로 삶는다',
            '팬에 올리브오일과 마늘을 볶는다',
            '생크림을 넣고 끓인다',
            '파마산 치즈를 넣어 녹인다',
            '삶은 면을 넣고 소스와 잘 섞는다',
            '후추로 마무리한다'
          ]
        }
      };
    }
  },
  mounted() {
    // URL 파라미터에서 강의 ID를 가져와서 데이터 로드
    const lectureId = this.$route.params.id;
    if (lectureId) {
      this.fetchLectureData(lectureId);
    }
  }
};
</script>

<style scoped>
.lecture-detail-page {
  background: #fafbfc;
  min-height: 100vh;
  margin-top: 64px;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
}

.main-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.lecture-header {
  margin-bottom: 40px;
}

.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.tag.cuisine {
  background: #e8f5e8;
  color: #2d5a2d;
}

.tag.level {
  background: #e3f2fd;
  color: #1565c0;
}

.lecture-title {
  font-size: 32px;
  font-weight: 700;
  color: #222;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.lecture-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.video-preview {
  margin-bottom: 40px;
}

.video-container {
  border-radius: 12px;
  overflow: hidden;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.video-placeholder {
  background: #2c3e50;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.play-button {
  color: white;
  font-size: 48px;
  cursor: pointer;
}

.video-info {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.video-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.video-info p {
  margin: 0;
  color: #666;
}

.curriculum-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.total-lessons {
  color: #666;
  font-size: 14px;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lesson-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
}

.lesson-item.preview {
  border-color: #ff7a00;
  background: #fff8f0;
}

.lesson-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.lesson-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.play-icon {
  color: #ff7a00;
}

.lock-icon {
  color: #999;
}

.lesson-content h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.lesson-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.duration {
  color: #666;
  font-size: 14px;
}

.preview-badge {
  background: #ff7a00;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.instructor-section {
  margin-bottom: 40px;
}

.instructor-section h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.instructor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: #666;
}

.instructor-details h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

.instructor-details p {
  margin: 0;
  color: #666;
}

.reviews-section {
  margin-bottom: 40px;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.tabs button {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  color: #ff7a00;
  border-bottom-color: #ff7a00;
}

.write-review-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
}

.no-reviews, .no-qa {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.purchase-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: #ff7a00;
  margin-bottom: 16px;
}

.enroll-btn {
  width: 100%;
  background: #ff7a00;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
}

.share-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.course-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  color: #666;
  font-size: 14px;
}

.summary-item .value {
  font-weight: 600;
  color: #222;
}

.recipe-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.recipe-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recipe-card h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.recipe-card p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.recipe-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.ingredients, .cooking-steps {
  margin-bottom: 20px;
}

.ingredients h5, .cooking-steps h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.ingredients ul {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #666;
}

.ingredients li {
  margin-bottom: 4px;
}

.cooking-steps ol {
  margin: 0;
  padding-left: 0;
  font-size: 14px;
  color: #666;
  list-style: none;
}

.cooking-steps li {
  margin-bottom: 12px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #ff7a00;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
}

@media (max-width: 1024px) {
  .detail-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 24px;
  }
  
  .lecture-title {
    font-size: 24px;
  }
  
  .lesson-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .lesson-meta {
    align-self: flex-end;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff7a00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
  font-size: 16px;
}
</style> 