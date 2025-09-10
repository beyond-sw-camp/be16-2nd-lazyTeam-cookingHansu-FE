<template>
  <div style="background-color: white; min-height: 100vh;" class="white-background">
    <v-container class="py-8 mt-12" max-width="900px">
      <v-row>
        <v-col cols="12">
          <!-- 메인 폼 -->
          <v-card elevation="0" class="pa-12">
            <!-- 헤더 -->
            <div class="d-flex justify-space-between align-center mb-6 header-container">
              <div>
                <h1 class="text-h3 font-weight-bold mb-3">레시피 게시글 등록</h1>
                <p class="text-body-1 text-grey-darken-2">
                  맛있는 레시피를 공유하고 다른 사람들과 소통해보세요
                </p>
              </div>

              <!-- 공개 설정 스위치 -->
              <div class="public-setting-switch">
                <div class="d-flex align-center gap-3">
                  <span class="text-body-1 font-weight-medium">공개 설정</span>
                  <v-switch v-model="post.isPublic" :true-value="true" :false-value="false" color="primary" hide-details
                    inset />
                  <span class="text-body-2 text-grey-darken-1">
                    {{ post.isPublic ? '공개' : '비공개' }}
                  </span>
                </div>
              </div>
            </div>
            <!-- 기본 정보 섹션 -->
            <div class="section-container mb-8">
              <div class="section-header">
                <h2 class="section-title">기본 정보</h2>
              </div>
              <div class="section-content">

              <v-row>
                <v-col cols="12">
                  <div class="field-label mb-2">레시피 제목 <span class="required-dot">*</span></div>
                  <v-text-field v-model="post.title" placeholder="예: 집에서 만드는 진짜 비빔밥" variant="outlined"
                    class="mb-4" required hide-details />

                  <div class="field-label mb-2">레시피 내용 <span class="required-dot">*</span></div>
                  <v-textarea v-model="post.content" placeholder="한국의 대표 음식 비빔밥을 집에서도 쉽고 맛있게 만들어보세요. 영양가 있는 여러 나물과 고소한 참기름의 조화가 일품입니다."
                    variant="outlined" rows="4" class="mb-4" required hide-details />



                  <!-- 썸네일 이미지 -->
                  <div class="image-input-section mb-4">
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">썸네일 이미지</h3>

                    <!-- 이미지 업로드 영역 -->
                    <div class="image-upload-area">
                      <div class="upload-placeholder" @click="triggerImageUpload" @dragover.prevent
                        @drop.prevent="handleImageDrop">
                        <input ref="imageInput" type="file" accept="image/*" @change="handleImageChange"
                          style="display: none" />

                        <!-- 업로드 전 안내 -->
                        <div v-if="!post.imageUrl" class="upload-guide">
                          <v-icon size="48" color="grey">mdi-cloud-upload</v-icon>
                          <p class="text-body-1 mt-2">이미지를 클릭하여 등록하거나 드래그하여 업로드하세요</p>
                          <p class="text-caption text-grey-darken-1 mt-1">
                            지원 형식: JPG, PNG, WebP • 최대 용량: 5MB
                          </p>
                        </div>

                        <!-- 이미지 미리보기 -->
                        <img v-else :src="post.imageUrl" alt="이미지 미리보기" class="image-preview" />
                      </div>

                      <!-- 이미지 제거 버튼 -->
                      <div v-if="post.imageUrl" class="image-actions mt-3">
                        <v-btn variant="outlined" color="error" size="small" @click="clearImage">
                          <v-icon start>mdi-delete</v-icon>
                          이미지 제거
                        </v-btn>
                      </div>
                    </div>

                    <!-- 이미지 입력 도움말 -->
                    <div class="image-help mt-3">
                      <v-alert type="info" variant="tonal" density="compact" class="mb-0">
                        <template v-slot:prepend>
                          <v-icon>mdi-information</v-icon>
                        </template>
                        <div class="text-body-2">
                          <strong>이미지 가이드:</strong>
                          <ul class="mt-1 mb-0">
                            <li>권장 크기: 800x600px 이상</li>
                            <li>지원 형식: JPG, PNG, WebP</li>
                            <li>최대 용량: 5MB 이하</li>
                            <li>클릭하거나 드래그하여 이미지를 업로드하세요</li>
                          </ul>
                        </div>
                      </v-alert>
                    </div>
                  </div>

                  <!-- 카테고리, 인분, 난이도, 조리시간을 가로로 배치 -->
                  <v-row class="mb-4">
                    <v-col cols="12" sm="3">
                      <v-select v-model="post.category" :items="categoryOptions" label="카테고리" variant="outlined"
                        required />
                    </v-col>
                    <v-col cols="12" sm="3">
                      <v-text-field 
                        v-model="post.servings" 
                        label="인분" 
                        placeholder="4" 
                        variant="outlined" 
                        type="number"
                        min="1"
                        max="20"
                        hide-spin-buttons
                        required 
                      />
                    </v-col>
                    <v-col cols="12" sm="3">
                      <v-select v-model="post.difficulty" :items="difficultyOptions" label="난이도" variant="outlined"
                        required />
                    </v-col>
                    <v-col cols="12" sm="3">
                      <v-text-field 
                        v-model="post.cookTime" 
                        label="조리시간" 
                        placeholder="30분" 
                        variant="outlined"
                        type="number" 
                        min="1"
                        max="999"
                        hide-spin-buttons
                        required 
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              </div>
            </div>

            <!-- 재료 섹션 -->
            <div class="section-container mb-8">
              <div class="section-header">
                <h2 class="section-title">재료</h2>
                <v-btn color="primary" @click="addIngredient">
                  <v-icon start>mdi-plus</v-icon>
                  재료 추가
                </v-btn>
              </div>
              <div class="section-content">

              <div class="mb-4">
                <div v-for="(ingredient, index) in post.ingredients" :key="index" class="d-flex mb-3 align-items-center">
                  <span class="ingredient-number mr-3" style="min-width: 32px;">{{ index + 1 }}.</span>
                  <v-text-field v-model="ingredient.name" :label="`재료명`" placeholder="예: 김치"
                    variant="outlined" style="flex: 2; min-width: 180px; margin-right: 20px;" required />
                  <v-text-field v-model="ingredient.amount" :label="`양`" placeholder="예: 300g" variant="outlined"
                    style="flex: 1; min-width: 120px; margin-right: 20px;" required />
                  <v-btn variant="outlined" color="black" @click="removeIngredient(index)"
                    :disabled="post.ingredients.length <= 1" style="width: 32px; height: 32px; min-width: 32px; margin-bottom: 8px;">
                    <v-icon size="large" color="#d32f2f">mdi-minus</v-icon>
                  </v-btn>
                </div>
              </div>
              </div>
            </div>

            <!-- 조리 순서 섹션 -->
            <div class="section-container mb-8">
              <div class="section-header">
                <h2 class="section-title">조리 순서</h2>
                <v-btn color="primary" @click="addStep">
                  <v-icon start>mdi-plus</v-icon>
                  단계 추가
                </v-btn>
              </div>
              <div class="section-content">

              <div v-for="(step, index) in post.steps" :key="index" class="mb-6">
                <div class="d-flex align-items-end" style="gap: 20px;">
                  <div class="step-number" style="margin-bottom: 8px;">{{ index + 1 }}</div>

                <div style="width: calc(100% - 55px);">
                    <v-textarea v-model="step.content" :label="`조리 순서 ${index + 1}를 상세히 설명해주세요`"
                      placeholder="예: 돼지고기를 한입 크기로 썰어 준비합니다" variant="outlined" rows="2" class="mb-2" required />

                    <!-- 추가 코멘트 (레시피와의 차이점) -->
                    <div class="comment-section">
                      <div class="comment-header">
                        <v-icon color="#1976d2" size="small" class="mr-2">mdi-comment-text-outline</v-icon>
                        <span class="comment-label">코멘트 (선택사항)</span>
                      </div>
                      <v-textarea v-model="step.comment"
                        placeholder="이 단계에서 주의할 점이나 팁을 공유해주세요" variant="outlined" rows="2" class="comment-textarea" hide-details />
                    </div>
                  </div>

                  <v-btn variant="outlined" color="black" @click="removeStep(index)" :disabled="post.steps.length <= 1"
                    style="width: 32px; height: 32px; min-width: 32px; margin-bottom: 8px;">
                    <v-icon size="large" color="#d32f2f">mdi-minus</v-icon>
                  </v-btn>
                </div>
              </div>
              </div>
            </div>

            <!-- 요리 팁 섹션 -->
            <div class="section-container mb-8">
              <div class="section-header">
                <h2 class="section-title">요리 팁</h2>
              </div>
              <div class="section-content">
                <v-textarea v-model="post.cookingTip" label="요리 팁 (선택사항)"
                  placeholder="이 레시피를 더 맛있게 만들 수 있는 팁이나 변형 방법을 공유해주세요" variant="outlined" rows="3" />
              </div>
            </div>



            <!-- 하단 버튼들 -->
            <div class="d-flex justify-center mt-6">
              <v-btn variant="outlined" size="large" class="px-8 mr-12" @click="goBack">
                취소
              </v-btn>
              <v-btn color="primary" size="large" class="px-8" @click="submitPost" :loading="isSubmitting"
                :disabled="isSubmitting">
                게시글 등록
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>


  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { recipeService } from '@/services/recipe/recipeService'

const router = useRouter()

// 게시글 데이터
const post = reactive({
  title: '',
  content: '',
  imageUrl: '',
  imageFile: null, // 실제 파일 객체 저장
  category: '한식',
  difficulty: '보통',
  cookTime: '',
  servings: '',
  cookingTip: '',
  isPublic: true,
  ingredients: [
    { name: '', amount: '' }
  ],
  steps: [
    { content: '', comment: '' }
  ]
})

// 이미지 업로드 관련 상태
const imageInput = ref(null)
const isSubmitting = ref(false)



// 옵션 데이터
const categoryOptions = [
  '한식', '중식', '양식', '일식'
]

const difficultyOptions = [
  '매우 쉬움', '쉬움', '보통', '어려움', '매우 어려움'
]

// 카테고리 변환 함수
const getCategoryEnum = (category) => {
  const categoryMap = {
    '한식': 'KOREAN',
    '중식': 'CHINESE',
    '양식': 'WESTERN',
    '일식': 'JAPANESE'
  }
  return categoryMap[category] || 'KOREAN'
}

// 난이도 변환 함수  
const getDifficultyEnum = (difficulty) => {
  const difficultyMap = {
    '매우 쉬움': 'VERY_LOW',
    '쉬움': 'LOW',
    '보통': 'MEDIUM',
    '어려움': 'HIGH',
    '매우 어려움': 'VERY_HIGH'
  }
  return difficultyMap[difficulty] || 'MEDIUM'
}

// 메서드들
const addIngredient = () => {
  post.ingredients.push({ name: '', amount: '' })
}

const removeIngredient = (index) => {
  if (post.ingredients.length > 1) {
    post.ingredients.splice(index, 1)
  }
}

const addStep = () => {
  post.steps.push({ content: '', comment: '' })
}

const removeStep = (index) => {
  if (post.steps.length > 1) {
    post.steps.splice(index, 1)
  }
}

const goBack = () => {
  router.go(-1)
}

const submitPost = async () => {
  try {
    // 백엔드 제약조건에 맞춘 유효성 검사
    
    // 1. 필수 필드 검증
    if (!post.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    
    if (post.title.trim().length > 20) {
      alert('제목은 최대 20자까지 입력 가능합니다.')
      return
    }
    
    if (!post.category) {
      alert('카테고리를 선택해주세요.')
      return
    }
    
    if (!post.difficulty) {
      alert('난이도를 선택해주세요.')
      return
    }
    
    if (!post.cookTime || post.cookTime < 1 || post.cookTime > 999) {
      alert('조리시간은 1~999분 사이로 입력해주세요.')
      return
    }
    
    if (!post.servings || post.servings < 1 || post.servings > 20) {
      alert('인분수는 1~20인분 사이로 입력해주세요.')
      return
    }
    
    // 2. 선택 필드 길이 검증
    if (post.content.trim().length > 2000) {
      alert('설명은 최대 2000자까지 입력 가능합니다.')
      return
    }
    
    if (post.cookingTip && post.cookingTip.trim().length > 2000) {
      alert('요리팁은 최대 2000자까지 입력 가능합니다.')
      return
    }
    
    // 3. 재료 검증
    if (post.ingredients.length === 0) {
      alert('최소 1개 이상의 재료를 입력해주세요.')
      return
    }
    
    for (let i = 0; i < post.ingredients.length; i++) {
      const ingredient = post.ingredients[i]
      if (!ingredient.name.trim()) {
        alert(`${i + 1}번째 재료명을 입력해주세요.`)
        return
      }
      if (ingredient.name.trim().length > 255) {
        alert(`${i + 1}번째 재료명은 최대 255자까지 입력 가능합니다.`)
        return
      }
      if (!ingredient.amount.trim()) {
        alert(`${i + 1}번째 재료량을 입력해주세요.`)
        return
      }
      if (ingredient.amount.trim().length > 255) {
        alert(`${i + 1}번째 재료량은 최대 255자까지 입력 가능합니다.`)
        return
      }
    }
    
    // 4. 조리과정 검증
    if (post.steps.length === 0) {
      alert('최소 1개 이상의 조리과정을 입력해주세요.')
      return
    }
    
    for (let i = 0; i < post.steps.length; i++) {
      const step = post.steps[i]
      if (!step.content.trim()) {
        alert(`${i + 1}번째 조리과정을 입력해주세요.`)
        return
      }
      if (step.content.trim().length > 255) {
        alert(`${i + 1}번째 조리과정은 최대 255자까지 입력 가능합니다.`)
        return
      }
      if (step.comment && step.comment.trim().length > 1000) {
        alert(`${i + 1}번째 추가설명은 최대 1000자까지 입력 가능합니다.`)
        return
      }
    }

    isSubmitting.value = true

    // 음수 값 검증
    const cookTime = parseInt(post.cookTime) || 0
    const servings = parseInt(post.servings) || 1
    
    if (cookTime < 1) {
      alert('조리 시간은 1분 이상이어야 합니다.')
      return
    }
    if (servings < 1) {
      alert('인분은 1인분 이상이어야 합니다.')
      return
    }

    // 데이터 변환
    const requestData = {
      title: post.title,
      description: post.content,  // content → description
      category: getCategoryEnum(post.category),  // 한식 → KOREAN
      level: getDifficultyEnum(post.difficulty), // 보통 → MEDIUM
      cookTime: cookTime,
      serving: servings,    // servings → serving
      cookTip: post.cookingTip,                  // cookingTip → cookTip
      isOpen: post.isPublic,                     // isPublic → isOpen
      ingredients: post.ingredients.map(ing => ({
        name: ing.name,
        amount: ing.amount || "적당량"  // amount 필드 추가
      })),
      steps: post.steps.map((step, index) => ({
        stepSequence: index + 1,      // stepSequence 추가
        content: step.content,
        description: step.comment      // comment를 description으로 매핑
      }))
    }

    const formData = new FormData()
    formData.append('request', new Blob([JSON.stringify(requestData)], {
      type: 'application/json'
    }))

    // 이미지가 있다면 추가
    if (post.imageFile) {
      formData.append('thumbnail', post.imageFile)
    }

    const token = localStorage.getItem('accessToken') // 또는 store에서 가져오기
    
    if (!token) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }
    
    // JWT 토큰 내용 확인
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
    }
    
    // 백엔드 API 경로를 새로운 형식으로 시도
    let response
    let apiUrl = '/api/posts/create'
    
    response = await recipeService.createRecipe(formData)
    
    if (response.success) {
      const responseData = response
      
      // 생성된 게시글의 ID를 가져와서 상세 페이지로 이동
      if (responseData.data && responseData.data.id) {
        alert('게시글이 등록되었습니다!')
        router.push(`/recipes/${responseData.data.id}`)
      } else {
        alert('게시글이 등록되었습니다!')
        router.push('/recipes')
      }
    } else {
      throw new Error('등록 실패')
    }
  } catch (error) {
    console.error('게시글 등록 실패:', error)
    alert('게시글 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

// 이미지 관련 메서드들
const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndSetImage(file)
  }
}

const handleImageDrop = (event) => {
  event.preventDefault()
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      validateAndSetImage(file)
    }
  }
}

const validateAndSetImage = (file) => {
  // 파일 크기 검증 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB 이하여야 합니다')
    return
  }

  // 파일 타입 검증
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    alert('지원되는 이미지 형식: JPG, PNG, WebP')
    return
  }

  // 실제 파일 객체 저장
  post.imageFile = file

  // 이미지 미리보기 생성
  const reader = new FileReader()
  reader.onload = (e) => {
    post.imageUrl = e.target.result
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  post.imageUrl = ''
  post.imageFile = null
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.text-primary {
  color: #1976d2 !important;
}

/* 이미지 입력 섹션 스타일 */
.image-input-section {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.image-input-section:hover {
  border-color: #1976d2;
  background: #f5f9ff;
}

.image-upload-area {
  text-align: center;
}

.upload-placeholder {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 40px 20px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.upload-placeholder:hover {
  border-color: #1976d2;
  background: #f5f9ff;
}

.upload-guide {
  text-align: center;
}

.upload-guide p {
  margin: 8px 0;
}

.image-preview {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
}

.image-actions {
  text-align: center;
}

.image-help ul {
  margin: 0;
  padding-left: 20px;
}

.image-help li {
  margin-bottom: 4px;
}

/* 공개 설정 스위치 스타일 */
.public-setting-switch {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  border: none;
  min-width: 280px;
  box-shadow: none;
  position: absolute;
  top: 0;
  right: 0;
}

.public-setting-switch .v-switch {
  pointer-events: auto;
}

.header-container {
  position: relative;
}

/* 재료 번호 스타일 */
.ingredient-number {
  font-size: 1.2rem;
  font-weight: 500;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-8px);
}

/* 조리 순서 번호 스타일 */
.step-number {
  width: 30px;
  height: 30px;
  background-color: #ff7a00;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* 섹션 스타일 */
.section-container {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e0e0e0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.section-content {
  padding-top: 8px;
}

.field-label {
  font-size: 1.125rem;
  font-weight: 500;
  color: #333;
}

.required-dot {
  color: #e53e3e;
  font-weight: bold;
}

/* 마이너스 아이콘 굵기 */
.v-icon[color="#d32f2f"] {
  font-weight: 900;
  font-size: 1.5em;
  text-shadow: 1px 1px 0px #d32f2f, 2px 2px 0px #d32f2f;
  -webkit-text-stroke: 0.5px #d32f2f;
}

/* 코멘트 섹션 스타일 */
.comment-section {
  background-color: #f8f9ff;
  border: 1px solid #e3f2fd;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-label {
  color: #1976d2;
  font-weight: 500;
  font-size: 0.875rem;
}

.comment-textarea :deep(.v-field) {
  background-color: white;
  border-radius: 4px;
}
</style>