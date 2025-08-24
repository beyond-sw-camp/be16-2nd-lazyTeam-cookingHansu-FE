<template>
  <div class="recipe-detail-page">
    <Header />
    
    <div class="main-container">
      <!-- 레시피 메인 정보 섹션 -->
      <div class="recipe-main-section">
        <div class="recipe-main-box">
          <!-- 레시피 이미지 -->
          <div class="recipe-image-container">
            <v-img
              :src="recipe.thumbnailUrl || '/src/assets/images/smu_mascort1.jpg'"
              height="400"
              cover
              class="recipe-image"
              eager
              loading="eager"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="64"
                  />
                </div>
              </template>
              
              <template v-slot:error>
                <div class="d-flex align-center justify-center fill-height">
                  <div class="text-center">
                    <v-icon size="64" color="grey">mdi-image-off</v-icon>
                    <div class="text-h6 text-grey mt-2">이미지를 불러올 수 없습니다</div>
                  </div>
                </div>
              </template>
            </v-img>
          </div>
          
          <!-- 레시피 제목과 설명 -->
          <div class="recipe-info">
            <div class="recipe-header">
              <div class="title-section">
                <h1 class="recipe-title">{{ recipe.title }}</h1>
                <v-chip 
                  :color="getCategoryColor(recipe.category)" 
                  size="small" 
                  class="category-chip"
                >
                  {{ getCategoryText(recipe.category) }}
                </v-chip>
              </div>
              
              <!-- 수정/삭제 버튼들 (작성자만 보임) -->
              <div v-if="isAuthor" class="action-buttons">
                <v-btn 
                  color="success" 
                  variant="outlined" 
                  @click="editRecipe"
                  class="edit-btn"
                  size="small"
                >
                  <v-icon start size="16">mdi-pencil</v-icon>
                  수정
                </v-btn>
                <v-btn 
                  color="error" 
                  variant="outlined" 
                  @click="confirmDelete"
                  class="delete-btn"
                  size="small"
                >
                  <v-icon start size="16">mdi-delete</v-icon>
                  삭제
                </v-btn>
              </div>
            </div>
            
            <p class="recipe-description">{{ recipe.description }}</p>
          </div>
          
          <!-- 레시피 메타 정보 -->
          <div class="recipe-meta-info">
            <h3 class="meta-title">레시피 정보</h3>
            
            <div class="meta-items">
              <div class="meta-item">
                <div class="meta-label">조리시간</div>
                <div class="meta-value">{{ recipe.cookTime }}분</div>
              </div>
              
              <div class="meta-item">
                <div class="meta-label">난이도</div>
                <div class="meta-value">
                  <div class="difficulty-stars">
                    <v-icon 
                      v-for="i in 5" 
                      :key="i"
                      :color="i <= getDifficultyLevel(recipe.level) ? 'orange' : 'grey'"
                      size="20"
                    >
                      mdi-star
                    </v-icon>
                  </div>
                </div>
              </div>
              
              <div class="meta-item">
                <div class="meta-label">인분</div>
                <div class="meta-value">{{ recipe.servings }}인분</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 레시피 상세 내용 -->
      <div class="recipe-detail-content">
        <div class="detail-sections-container">
          <!-- 재료 섹션 -->
          <div class="ingredients-section">
            <h2 class="section-title">재료</h2>
            <div class="ingredients-container">
              <div class="ingredients-group">
                <h4 class="group-title">주재료</h4>
                <div class="ingredients-list">
                  <div 
                    v-for="ingredient in recipe.ingredients" 
                    :key="ingredient.id" 
                    class="ingredient-item"
                  >
                    <span class="ingredient-name">{{ ingredient.name }}</span>
                    <span class="ingredient-amount">{{ ingredient.amount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 조리과정 섹션 -->
          <div class="cooking-steps-section">
            <h2 class="section-title">조리과정</h2>
            <div class="cooking-steps">
              <div 
                v-for="(step, index) in recipe.steps" 
                :key="step.id" 
                class="step-item"
              >
                <div class="step-number">
                  <div class="step-circle">{{ index + 1 }}</div>
                </div>
                <div class="step-content">
                  <h4 class="step-title">{{ getStepTitle(index) }}</h4>
                  <p class="step-description">{{ step.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 삭제 확인 모달 -->
      <v-dialog v-model="showDeleteModal" max-width="400">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold">
            삭제 확인
          </v-card-title>
          <v-card-text>
            <p class="text-body-1">"{{ recipe.title }}"을(를) 삭제하시겠습니까?</p>
            <p class="text-caption text-grey mt-2">이 작업은 되돌릴 수 없습니다.</p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn variant="outlined" @click="showDeleteModal = false">
              취소
            </v-btn>
            <v-btn color="error" @click="deleteRecipe">
              삭제
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LikeButton from '@/components/recipe/LikeButton.vue'
import BookmarkButton from '@/components/recipe/BookmarkButton.vue'
import Header from '@/components/Header.vue'

const route = useRoute()
const router = useRouter()

// 삭제 모달 상태
const showDeleteModal = ref(false)

// 현재 사용자가 작성자인지 확인 (임시로 true로 설정)
const isAuthor = ref(true)

const recipe = reactive({
  id: '',
  postId: '',
  title: '',
  description: '',
  thumbnailUrl: '',
  cookTime: 0,
  servings: 0,
  level: 'MEDIUM',
  category: 'KOREAN',
  ingredients: [],
  steps: []
})

// 메서드들
const getDifficultyColor = (level) => {
  const colors = {
    'VERY_LOW': 'green',
    'LOW': 'light-green',
    'MEDIUM': 'orange',
    'HIGH': 'red-lighten-1',
    'VERY_HIGH': 'red'
  }
  return colors[level] || 'grey'
}

const getDifficultyText = (level) => {
  const texts = {
    'VERY_LOW': '매우 쉬움',
    'LOW': '쉬움',
    'MEDIUM': '보통',
    'HIGH': '어려움',
    'VERY_HIGH': '매우 어려움'
  }
  return texts[level] || '보통'
}

const getDifficultyLevel = (level) => {
  const levels = {
    'VERY_LOW': 1,
    'LOW': 2,
    'MEDIUM': 3,
    'HIGH': 4,
    'VERY_HIGH': 5
  }
  return levels[level] || 3
}

const getCategoryColor = (category) => {
  const colors = {
    'KOREAN': '#ff7a00', // 한식 - 주황색
    'CHINESE': '#ff3b3b', // 중식 - 빨간색
    'WESTERN': '#007aff', // 양식 - 파란색
    'JAPANESE': '#00b86b', // 일식 - 초록색
    'DESSERT': '#ff7a00', // 디저트 - 주황색
    'BEVERAGE': '#00b86b' // 음료 - 초록색
  }
  return colors[category] || '#ff7a00'
}

const getCategoryText = (category) => {
  const texts = {
    'KOREAN': '한식',
    'CHINESE': '중식',
    'WESTERN': '양식',
    'JAPANESE': '일식'
  }
  return texts[category] || '기타'
}

const getStepTitle = (index) => {
  const titles = [
    '밥 준비하기',
    '나물 준비하기', 
    '고기와 계란 준비',
    '비빔밥 완성하기'
  ]
  return titles[index] || `단계 ${index + 1}`
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return '방금 전'
  if (diffInHours < 24) return `${diffInHours}시간 전`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}일 전`
  
  return date.toLocaleDateString('ko-KR')
}

const loadRecipe = async () => {
  try {
    const recipeId = route.params.id
    console.log('레시피 ID:', recipeId)
    
    // 임시 데이터 (실제로는 API 호출)
    // 실제 API 연동 시 아래 주석을 해제하고 사용
    // const response = await fetch(`/api/recipes/${recipeId}`)
    // if (response.ok) {
    //   const data = await response.json()
    //   Object.assign(recipe, data)
    // }
    
    // 임시 데이터로 테스트
    const mockData = {
      id: recipeId,
      postId: recipeId,
      title: `레시피 ${recipeId} - 맛있는 요리`,
      description: `이것은 레시피 ${recipeId}에 대한 상세한 설명입니다. 이 레시피는 여러분의 요리 실력을 한 단계 끌어올릴 수 있는 특별한 방법을 담고 있습니다.`,
      thumbnailUrl: `/src/assets/images/smu_mascort${(recipeId % 5) + 1}.jpg`,
      cookTime: 30 + (parseInt(recipeId) * 5),
      servings: 2 + (parseInt(recipeId) % 4),
      level: ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'][parseInt(recipeId) % 5],
      category: ['KOREAN', 'CHINESE', 'WESTERN', 'JAPANESE'][parseInt(recipeId) % 4],
      ingredients: [
        { id: 1, name: '재료 1', amount: '100g' },
        { id: 2, name: '재료 2', amount: '2개' },
        { id: 3, name: '재료 3', amount: '1큰술' }
      ],
      steps: [
        { 
          id: 1, 
          content: `레시피 ${recipeId}의 첫 번째 단계입니다. 재료를 준비하고 기본적인 조리 과정을 시작합니다.`
        },
        { 
          id: 2, 
          content: `두 번째 단계에서는 주요 조리 과정을 진행합니다.`
        },
        { 
          id: 3, 
          content: `마지막 단계에서는 완성된 요리를 예쁘게 담고 마무리합니다.`
        }
      ]
    }
    
    Object.assign(recipe, mockData)
    console.log('레시피 데이터 로드 완료:', recipe)
    
  } catch (error) {
    console.error('레시피 로딩 실패:', error)
  }
}

// 레시피 수정
const editRecipe = () => {
  const isPost = route.path.includes('post-detail')
  if (isPost) {
    router.push({ path: '/recipe/post-write', query: { id: recipe.id } })
  } else {
    router.push({ path: '/recipe/write', query: { id: recipe.id } })
  }
}

// 삭제 확인 모달 표시
const confirmDelete = () => {
  showDeleteModal.value = true
}

// 레시피 삭제
const deleteRecipe = async () => {
  try {
    // TODO: API 호출로 레시피 삭제
    console.log('레시피 삭제:', recipe.id)
    
    // 삭제 성공 후 마이페이지로 이동
    router.push('/mypage')
  } catch (error) {
    console.error('레시피 삭제 실패:', error)
  }
}

onMounted(() => {
  loadRecipe()
})
</script>

<style scoped>
.recipe-detail-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-top: 80px; /* Header 높이 */
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px; /* 좌우 여백 증가 */
}

.recipe-main-section {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}

.recipe-main-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #fff;
  border-radius: 12px;
  padding: 35px; /* 패딩 증가 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 1000px; /* 너비 증가 */
  margin-left: 60px;
}

.recipe-image-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-image:hover {
  transform: scale(1.05);
}

.recipe-info {
  padding: 0;
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 15px;
}

.title-section {
  flex: 1;
  max-width: calc(100% - 200px);
}

.recipe-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.2;
  word-wrap: break-word;
}

.category-chip {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff !important;
  background-color: #42a5f5 !important;
  padding: 5px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recipe-description {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.8;
  margin-bottom: 20px;
  max-width: 100%;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  min-width: 180px;
}

.edit-btn, .delete-btn {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  min-width: 80px;
  color: #fff !important;
}

.edit-btn {
  background-color: #4caf50 !important;
  border-color: #4caf50 !important;
}

.edit-btn:hover {
  background-color: #388e3c !important;
  border-color: #388e3c !important;
}

.delete-btn {
  background-color: #f44336 !important;
  border-color: #f44336 !important;
}

.delete-btn:hover {
  background-color: #d32f2f !important;
  border-color: #d32f2f !important;
}

.recipe-meta-info {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.meta-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.meta-items {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
}

.meta-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.meta-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.difficulty-stars {
  display: flex;
  gap: 5px;
}

.recipe-detail-content {
  background-color: #fff;
  border-radius: 12px;
  padding: 35px; /* 패딩 증가 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  margin-left: 60px;
  max-width: 1000px; /* 너비 증가 */
}

.detail-sections-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.ingredients-section {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.cooking-steps-section {
  flex: 2;
  min-width: 500px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.ingredients-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ingredients-group {
  width: 100%;
}

.group-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f44336; /* Primary color changed to green */
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: all 0.2s ease;
}

.ingredient-item:hover {
  background-color: #f0f0f0;
  border-color: #ddd;
}

.ingredient-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.ingredient-amount {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.cooking-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #eee;
  transition: all 0.2s ease;
}

.step-item:hover {
  background-color: #f0f0f0;
  border-color: #ddd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f44336; /* Primary color changed to green */
  color: #fff;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: 700;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.step-description {
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
}

.overall-tip {
  margin-top: 20px;
  padding: 15px;
  background-color: #fffbe6; /* Warning color */
  border-radius: 10px;
  border: 1px solid #ffe6b3;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .recipe-main-box {
    max-width: 900px; /* 중간 화면에서 적당한 크기 */
  }
  
  .recipe-detail-content {
    max-width: 900px;
  }
}

@media (max-width: 1024px) {
  .recipe-main-section {
    flex-direction: column;
    gap: 20px;
  }
  
  .recipe-main-box {
    flex: none;
    max-width: 100%;
    margin-left: 0;
    padding: 30px; /* 패딩 조정 */
  }
  
  .recipe-detail-content {
    max-width: 100%;
    margin-left: 0;
    padding: 30px; /* 패딩 조정 */
  }
  
  .detail-sections-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .ingredients-section {
    min-width: auto;
    max-width: none;
  }
  
  .cooking-steps-section {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 0 20px; /* 모바일에서 여백 줄임 */
  }
  
  .recipe-title {
    font-size: 2rem;
  }
  
  .recipe-description {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .recipe-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .title-section {
    max-width: 100%;
  }
  
  .action-buttons {
    min-width: auto;
    width: 100%;
  }
  
  .meta-items {
    flex-direction: column;
    gap: 15px;
  }
  
  .ingredients-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .step-item {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .step-number {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .recipe-main-section {
    margin-top: 10px;
  }
  
  .recipe-main-box {
    padding: 20px;
    max-width: 100%;
    margin-left: 0;
  }
  
  .recipe-detail-content {
    padding: 20px;
    max-width: 100%;
    margin-left: 0;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .ingredients-section {
    min-width: auto;
  }
  
  .cooking-steps-section {
    min-width: auto;
  }
}
</style>