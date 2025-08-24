<template>
  <div class="post-detail-page">
    <Header />
    
    <div class="main-container">
      <!-- 게시글 메인 섹션 -->
      <div class="post-main-section">
        <!-- 게시글 메인 박스 -->
        <div class="post-main-box">
          <!-- 게시글 이미지 -->
          <div class="post-image-container">
            <img 
              :src="post.imageUrl || '/src/assets/images/smu_mascort1.jpg'" 
              :alt="post.title"
              class="post-image"
            />
          </div>
          
          <!-- 게시글 정보 -->
          <div class="post-info">
            <!-- 게시글 헤더 -->
            <div class="post-header">
              <div class="title-section">
                <h1 class="post-title">{{ post.title }}</h1>
                <v-chip 
                  :color="getCategoryColor(post.category)" 
                  size="small" 
                  class="category-chip"
                >
                  {{ getCategoryText(post.category) }}
                </v-chip>
              </div>
              
              <!-- 수정/삭제 버튼들 (작성자만 보임) -->
              <div v-if="isAuthor" class="action-buttons">
                <v-btn 
                  color="success" 
                  variant="outlined" 
                  @click="editPost"
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
            
            <!-- 게시글 내용 -->
            <div class="post-content">
              <p class="post-description">{{ post.content }}</p>
            </div>
            
            <!-- 게시글 메타 정보 -->
            <div class="post-meta-info">
              <div class="meta-title">게시글 정보</div>
              <div class="meta-items">
                <div class="meta-item">
                  <div class="meta-label">작성일</div>
                  <div class="meta-value">{{ post.date }}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">조회수</div>
                  <div class="meta-value">{{ post.views }}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">좋아요</div>
                  <div class="meta-value">{{ post.likes }}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">공개여부</div>
                  <div class="meta-value">{{ post.isPublic ? '공개' : '비공개' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 게시글 상세 내용 -->
      <div class="post-detail-content">
        <!-- 레시피 정보 섹션 -->
        <div class="recipe-info-section">
          <h2 class="section-title">레시피 정보</h2>
          <div class="recipe-basic-info">
            <div class="recipe-title">{{ post.recipeTitle }}</div>
            <p class="recipe-description">{{ post.recipeDescription }}</p>
            <div class="recipe-meta">
              <span class="meta-chip">{{ post.servings }}인분</span>
              <span class="meta-chip">{{ post.difficulty }}</span>
              <span class="meta-chip">{{ post.cookTime }}분</span>
            </div>
          </div>
        </div>
        
        <!-- 재료 섹션 -->
        <div class="ingredients-section">
          <h2 class="section-title">재료</h2>
          <div class="ingredients-container">
            <div v-for="(ingredient, index) in post.ingredients" :key="index" class="ingredient-item">
              <span class="ingredient-name">{{ ingredient.name }}</span>
            </div>
          </div>
        </div>
        
        <!-- 조리 과정 섹션 -->
        <div class="cooking-steps-section">
          <h2 class="section-title">조리 과정</h2>
          <div class="steps-container">
            <div v-for="(step, index) in post.steps" :key="index" class="step-item">
              <div class="step-number">
                <v-avatar color="primary" size="40">
                  <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                </v-avatar>
              </div>
              <div class="step-content">
                <div class="step-description">{{ step.content }}</div>
                <div v-if="step.comment" class="step-comment">
                  <strong>💡 코멘트:</strong> {{ step.comment }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 요리 팁 섹션 -->
        <div v-if="post.cookingTip" class="cooking-tip-section">
          <h2 class="section-title">요리 팁</h2>
          <div class="tip-content">
            <p>{{ post.cookingTip }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 삭제 확인 모달 -->
    <v-dialog v-model="showDeleteModal" max-width="400">
      <v-card>
        <v-card-title class="text-h6">게시글 삭제</v-card-title>
        <v-card-text>
          정말로 이 게시글을 삭제하시겠습니까?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="showDeleteModal = false">취소</v-btn>
          <v-btn color="error" @click="deletePost">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '../../components/Header.vue'

const router = useRouter()
const route = useRoute()

// 상태 관리
const showDeleteModal = ref(false)
const isAuthor = ref(true) // 임시로 true, 실제로는 사용자 ID 비교

// 게시글 데이터 (임시)
const post = ref({
  id: 1,
  title: '김치찌개 만들면서 깨달은 요리 철학',
  content: '오늘 김치찌개를 끓이면서 느낀 점들을 공유해요. 요리는 정말 마음이 중요한 것 같아요. 재료를 준비할 때부터 마음을 담아서 하면 맛이 달라지는 것 같아요. 특히 김치찌개는 김치의 숙성 정도와 고기의 품질이 중요한데, 오늘은 정말 맛있게 만들어졌어요.',
  imageUrl: '/src/assets/images/smu_mascort1.jpg',
  date: '2024.01.05',
  views: 18,
  likes: 42,
  category: '한식',
  difficulty: '보통',
  cookTime: 30,
  servings: 4,
  isPublic: true,
  recipeTitle: '집에서 만드는 간단한 김치찌개',
  recipeDescription: '신 김치로 만드는 얼큰한 김치찌개',
  cookingTip: '김치를 넣기 전에 돼지고기를 충분히 볶아주면 더 맛있어요. 그리고 김치국물을 넣을 때는 물을 조금씩 넣어가며 끓여주세요.',
  ingredients: [
    { name: '신김치 300g' },
    { name: '돼지고기 200g' },
    { name: '두부 1모' },
    { name: '대파 1대' },
    { name: '양파 1개' },
    { name: '고춧가루 2큰술' }
  ],
  steps: [
    { 
      content: '돼지고기를 한입 크기로 썰어 준비합니다.',
      comment: '고기는 너무 작게 썰면 맛이 없어요. 한입 크기 정도가 적당해요.'
    },
    { 
      content: '김치와 김치국물을 준비합니다.',
      comment: '김치가 너무 신면 설탕을 조금 넣어주세요.'
    },
    { 
      content: '팬에 기름을 두르고 돼지고기를 볶습니다.',
      comment: '고기가 완전히 익을 때까지 충분히 볶아주세요.'
    },
    { 
      content: '김치를 넣고 함께 볶아줍니다.',
      comment: '김치도 충분히 볶아야 맛이 나요.'
    },
    { 
      content: '물을 넣고 끓여줍니다.',
      comment: '물은 재료가 잠길 정도로 넣어주세요.'
    }
  ]
})

// 메서드들
const getCategoryColor = (category) => {
  const colors = {
    '한식': '#ff7a00', // 한식 - 주황색
    '중식': '#ff3b3b', // 중식 - 빨간색
    '양식': '#007aff', // 양식 - 파란색
    '일식': '#00b86b', // 일식 - 초록색
    '베이킹': '#ff7a00', // 베이킹 - 주황색
    '음료': '#00b86b', // 음료 - 초록색
    '기타': '#ff7a00' // 기타 - 주황색
  }
  return colors[category] || '#ff7a00'
}

const getCategoryText = (category) => {
  return category || '기타'
}

const editPost = () => {
  router.push(`/recipe/post-edit/${post.value.id}`)
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deletePost = () => {
  // TODO: API 호출로 게시글 삭제
  console.log('게시글 삭제:', post.value.id)
  showDeleteModal.value = false
  router.push('/mypage')
}

// 컴포넌트 마운트 시 게시글 데이터 로드
onMounted(async () => {
  const postId = route.params.id
  if (postId) {
    // TODO: API 호출로 게시글 데이터 로드
    console.log('게시글 ID:', postId)
  }
})
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.post-main-section {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}

.post-main-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #fff;
  border-radius: 12px;
  padding: 35px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin-left: 60px;
}

.post-image-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.05);
}

.post-info {
  padding: 0;
}

.post-header {
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

.post-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.2;
  word-wrap: break-word;
}

.category-chip {
  color: #fff !important;
  background-color: #42a5f5 !important;
  padding: 5px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-content {
  margin-bottom: 20px;
}

.post-description {
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

.post-meta-info {
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

.post-detail-content {
  background-color: #fff;
  border-radius: 12px;
  padding: 35px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  margin-left: 60px;
  max-width: 1000px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.recipe-info-section {
  margin-bottom: 30px;
}

.recipe-basic-info {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.recipe-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.recipe-description {
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 15px;
}

.recipe-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.meta-chip {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.ingredients-section {
  margin-bottom: 30px;
}

.ingredients-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.ingredient-item {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  text-align: center;
}

.ingredient-name {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

.cooking-steps-section {
  margin-bottom: 30px;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.step-number {
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-description {
  font-size: 1.1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 10px;
  font-weight: 500;
}

.step-comment {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  background-color: #fff3e0;
  padding: 10px;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.cooking-tip-section {
  margin-bottom: 30px;
}

.tip-content {
  background-color: #e8f5e8;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #c8e6c9;
}

.tip-content p {
  font-size: 1rem;
  color: #2e7d32;
  line-height: 1.6;
  margin: 0;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .post-main-box {
    max-width: 900px;
  }
  
  .post-detail-content {
    max-width: 900px;
  }
}

@media (max-width: 1024px) {
  .post-main-section {
    flex-direction: column;
    gap: 20px;
  }
  
  .post-main-box {
    flex: none;
    max-width: 100%;
    margin-left: 0;
    padding: 30px;
  }
  
  .post-detail-content {
    max-width: 100%;
    margin-left: 0;
    padding: 30px;
  }
  
  .ingredients-container {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 0 20px;
  }
  
  .post-title {
    font-size: 2rem;
  }
  
  .post-description {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .post-header {
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
    grid-template-columns: 1fr;
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
  .post-main-section {
    margin-top: 10px;
  }
  
  .post-main-box {
    padding: 20px;
    max-width: 100%;
    margin-left: 0;
  }
  
  .post-detail-content {
    padding: 20px;
    max-width: 100%;
    margin-left: 0;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
