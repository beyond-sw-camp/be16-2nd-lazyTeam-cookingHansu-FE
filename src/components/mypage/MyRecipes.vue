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
      <div v-for="recipe in pagedRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image">
          <img :src="recipe.image" :alt="recipe.title" />
          <!-- 액션 버튼들 -->
          <div class="recipe-actions">
            <button class="action-btn edit-btn" @click="editRecipe(recipe)">
              <span class="action-icon">✏️</span>
            </button>
            <button class="action-btn delete-btn" @click="confirmDelete(recipe)">
              <span class="action-icon">🗑️</span>
            </button>
          </div>
        </div>
        <div class="recipe-content">
          <h3 class="recipe-title">{{ recipe.title }}</h3>
          <p class="recipe-description">{{ recipe.description }}</p>
          <div class="recipe-date">{{ recipe.date }}</div>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="delete-modal">
        <h3>레시피 삭제</h3>
        <p>"{{ recipeToDelete?.title }}" 레시피를 삭제하시겠습니까?</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteModal = false">취소</button>
          <button class="delete-confirm-btn" @click="deleteRecipe">삭제</button>
        </div>
      </div>
    </div>

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
const showDeleteModal = ref(false)
const recipeToDelete = ref(null)

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
    title: '닭볶음탕',
    description: '닭고기 1kg, 감자 2개, 당근 1개, 양파 1개, 간장, 설탕, 고춧가루.',
    image: '/src/assets/images/smu_mascort2.jpg',
    date: '2024.01.03'
  },
  {
    id: 7,
    title: '된장국',
    description: '된장 3스푼, 애호박, 두부, 파, 마늘, 참기름. 끓이는 시간 10분.',
    image: '/src/assets/images/smu_mascort3.jpg',
    date: '2024.01.01'
  },
  {
    id: 8,
    title: '김밥',
    description: '밥, 김, 단무지, 당근, 오이, 계란, 햄, 참기름, 깨소금.',
    image: '/src/assets/images/smu_mascort4.jpg',
    date: '2023.12.30'
  },
  {
    id: 9,
    title: '떡볶이',
    description: '떡볶이 떡, 어묵, 고추장, 고춧가루, 설탕, 간장. 끓이는 시간 15분.',
    image: '/src/assets/images/smu_mascort1.jpg',
    date: '2023.12.28'
  },
  {
    id: 10,
    title: '순두부찌개',
    description: '순두부 1팩, 돼지고기 100g, 양파, 대파, 고추장, 고춧가루.',
    image: '/src/assets/images/smu_mascort2.jpg',
    date: '2023.12.25'
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

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const editRecipe = (recipe) => {
  router.push({ path: '/recipe/write', query: { id: recipe.id } })
}

const confirmDelete = (recipe) => {
  recipeToDelete.value = recipe
  showDeleteModal.value = true
}

const deleteRecipe = () => {
  if (recipeToDelete.value) {
    const index = recipes.value.findIndex(r => r.id === recipeToDelete.value.id)
    if (index !== -1) {
      recipes.value.splice(index, 1)
    }
    showDeleteModal.value = false
    recipeToDelete.value = null
  }
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
  height: 160px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  z-index: 10; /* Ensure buttons are above other content */
}

.action-btn {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.action-icon {
  font-size: 18px;
}

.recipe-content {
  padding: 16px;
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
  background: #0056cc;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.delete-modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
}

.delete-modal h3 {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin-bottom: 16px;
}

.delete-modal p {
  font-size: 18px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.cancel-btn {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.cancel-btn:hover {
  background: #e0e0e0;
  border-color: #bbb;
}

.delete-confirm-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-confirm-btn:hover {
  background: #d9363e;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .recipes-grid {
    grid-template-columns: 1fr;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style> 