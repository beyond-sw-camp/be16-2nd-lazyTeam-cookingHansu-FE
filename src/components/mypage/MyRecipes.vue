<template>
  <div class="my-recipes">
    <div class="section-header">
      <h2>내 레시피</h2>
      <div class="header-actions">
        <button class="write-recipe-btn" @click="goToRecipeWrite">
          <span class="plus-icon">+</span>
          레시피 작성
        </button>
      </div>
    </div>

    <div class="recipes-grid">
      <div v-for="recipe in pagedRecipes" :key="recipe.id" class="recipe-card" @click="goToRecipeDetail(recipe)">
        <div class="recipe-image">
          <img :src="recipe.image" :alt="recipe.title" />
        </div>
        <div class="recipe-content">
          <h3 class="recipe-title">{{ recipe.title }}</h3>
          <p class="recipe-description">{{ recipe.description }}</p>
          <div class="recipe-date">{{ recipe.date }}</div>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 제거 -->

    <!-- 페이지네이션 -->
    <Pagination 
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <div v-if="recipes.length === 0" class="empty-state">
      <div class="empty-icon">🍳</div>
      <h3>아직 작성한 레시피가 없어요</h3>
      <p>첫 번째 레시피를 작성해보세요!</p>
      <div class="empty-actions">
        <button class="write-first-recipe-btn" @click="goToRecipeWrite">
          <span class="plus-icon">+</span>
          레시피 작성하기
        </button>
        <button class="write-first-post-btn" @click="goToRecipePostWrite">
          <span class="plus-icon">+</span>
          게시글 작성하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Pagination from '../common/Pagination.vue'

const router = useRouter()

// 상태 관리
const currentPage = ref(1)
const recipesPerPage = ref(6)

// 레시피 데이터
const recipes = ref([
  {
    id: 1,
    title: '김치찌개',
    description: '신김치 1컵, 돼지고기 200g, 두부 반모, 대파 1대. 끓이는 시간 15분, 간 적당히.',
    image: '/src/assets/images/smu_mascort1.jpg',
    date: '2024.01.15'
  },
  {
    id: 2,
    title: '불고기',
    description: '소고기 300g, 양파 1개, 당근 반개, 간장 3스푼, 설탕 1스푼, 참기름 조금.',
    image: '/src/assets/images/smu_mascort2.jpg',
    date: '2024.01.12'
  },
  {
    id: 3,
    title: '된장찌개',
    description: '된장 2스푼, 애호박 반개, 감자 1개, 두부, 물 2컵 정도. 10분 끓이기.',
    image: '/src/assets/images/smu_mascort3.jpg',
    date: '2024.01.10'
  },
  {
    id: 4,
    title: '비빔밥',
    description: '밥, 시금치, 콩나물, 당근, 무, 고사리, 고추장 2스푼, 참기름 1스푼, 깨소금.',
    image: '/src/assets/images/smu_mascort4.jpg',
    date: '2024.01.08'
  },
  {
    id: 5,
    title: '삼겹살 구이',
    description: '삼겹살 500g, 상추, 깻잎, 마늘, 고추장. 숙성 시간 30분, 구워서 먹기.',
    image: '/src/assets/images/smu_mascort1.jpg',
    date: '2024.01.05'
  },
  {
    id: 6,
    title: '계란볶음밥',
    description: '밥 2공기, 계란 2개, 대파 1대, 간장 2스푼, 참기름 1스푼, 깨소금.',
    image: '/src/assets/images/smu_mascort2.jpg',
    date: '2024.01.02'
  }
])

// 계산된 속성
const pagedRecipes = computed(() => {
  const start = (currentPage.value - 1) * recipesPerPage.value
  const end = start + recipesPerPage.value
  return recipes.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(recipes.value.length / recipesPerPage.value)
})

// 메서드
const goToRecipeWrite = () => {
  router.push('/recipe/write')
}

const goToRecipePostWrite = () => {
  router.push('/recipe/post-write')
}

const goToRecipeDetail = (recipe) => {
  router.push({ path: `/recipes/${recipe.id}` })
}

const changePage = (page) => {
  currentPage.value = page
}

onMounted(() => {
  // 초기 데이터 로딩
})
</script>

<style scoped>
.my-recipes {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.write-recipe-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex; 
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.write-recipe-btn:hover {
  background: #e66a00;
}

.write-post-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.write-post-btn:hover {
  background: #0056cc;
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  position: relative; /* Added for modal positioning */
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-content {
  padding: 16px;
  flex-grow: 1;
}

.recipe-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.recipe-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-date {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
  display: block;
  text-align: center;
  margin-top: 8px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
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

.empty-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.write-first-recipe-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.write-first-recipe-btn:hover {
  background: #e66a00;
}

.write-first-post-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.write-first-post-btn:hover {
  background: #e66a00;
}

@media (max-width: 768px) {
  .recipes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .section-header {
    padding: 0 16px;
  }
  
  .write-recipe-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style> 