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
                <h1 class="text-h3 font-weight-bold mb-3">레시피 게시글 수정</h1>
                <p class="text-body-1 text-grey-darken-2">
                  기존 레시피 게시글을 수정하고 업데이트하세요
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
                        <img v-else :src="post.imageUrl || defaultImageUrl" alt="이미지 미리보기" class="image-preview" />
                      </div>

                      <!-- 이미지 제거 버튼 (기본 이미지가 아닐 때만 표시) -->
                      <div v-if="post.imageUrl && post.imageUrl !== defaultImageUrl" class="image-actions mt-3">
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
                <div class="field-label mb-2">요리 팁 (선택사항)</div>
                <v-textarea v-model="post.cookingTip"
                  placeholder="이 레시피를 더 맛있게 만들 수 있는 팁이나 변형 방법을 공유해주세요" variant="outlined" rows="3" hide-details />
              </div>
            </div>

            <!-- 하단 버튼들 -->
            <div class="d-flex justify-center mt-6">
              <v-btn variant="outlined" size="large" class="px-8 mr-12" @click="goBack">
                취소
              </v-btn>
              <v-btn color="primary" size="large" class="px-8" @click="updatePost" :loading="isUpdating"
                :disabled="isUpdating">
                게시글 수정
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { recipeService } from '@/services/recipe/recipeService'
import { useAuthStore } from '@/store/auth/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 게시글 데이터
const post = reactive({
  title: '',
  content: '',
  imageUrl: '',
  imageFile: null,
  category: '한식',
  difficulty: '보통',
  cookTime: '',
  servings: '',
  cookingTip: '',
  isPublic: true,
  authorNickname: null, // 작성자 닉네임 추가
  ingredients: [
    { name: '', amount: '' }
  ],
  steps: [
    { content: '', comment: '' }
  ]
})

// 이미지 업로드 관련 상태
const imageInput = ref(null)
const isUpdating = ref(false)

// 기본 이미지 URL
const defaultImageUrl = '/cooking.png' // public 폴더의 기본 이미지

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

// 카테고리 역변환 함수
const getCategoryText = (category) => {
  const categoryMap = {
    'KOREAN': '한식',
    'CHINESE': '중식',
    'WESTERN': '양식',
    'JAPANESE': '일식'
  }
  return categoryMap[category] || '한식'
}

// 난이도 역변환 함수
const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    'VERY_LOW': '매우 쉬움',
    'LOW': '쉬움',
    'MEDIUM': '보통',
    'HIGH': '어려움',
    'VERY_HIGH': '매우 어려움'
  }
  return difficultyMap[difficulty] || '보통'
}

// 현재 사용자 정보 (authStore에서 직접 가져오기)
const currentUser = computed(() => {
  return authStore.user
})

// 관리자 여부 확인 (authStore에서 직접 가져오기)
const isAdmin = computed(() => {
  return authStore.getUserRole === 'ADMIN'
})

// 현재 사용자가 작성자인지 확인 (닉네임으로 비교)
const isAuthor = computed(() => {
  if (!post.authorNickname || !currentUser.value) return false
  return currentUser.value.nickname === post.authorNickname
})

// 기존 게시글 데이터 로드
const loadPost = async () => {
  try {
    const postId = route.query.id
    if (!postId) {
      alert('게시글 ID가 없습니다.')
      router.push('/recipes')
      return
    }



    const response = await recipeService.getRecipeDetail(postId)

    if (response.success) {
      const data = response
      
      if (data.data) {
        // 작성자 닉네임 저장
        post.authorNickname = data.data.user?.nickname || data.data.nickname || data.data.authorNickname
        
        // 데이터 매핑
        post.title = data.data.title || ''
        post.content = data.data.description || ''
        post.imageUrl = data.data.thumbnailUrl || defaultImageUrl

        post.category = getCategoryText(data.data.category)
        post.difficulty = getDifficultyText(data.data.level)
        post.cookTime = data.data.cookTime || ''
        post.servings = data.data.serving || ''
        post.cookingTip = data.data.cookTip || ''
        post.isPublic = data.data.isOpen !== undefined ? data.data.isOpen : true
        
        // 재료 데이터
        if (data.data.ingredients && data.data.ingredients.length > 0) {
          post.ingredients = data.data.ingredients.map(ingredient => ({
            name: (ingredient.name || ingredient.ingredientName || '') === '주재료' ? '' : (ingredient.name || ingredient.ingredientName || ''),
            amount: ingredient.amount || ingredient.quantity || ''
          }))
        } else {
          post.ingredients = [{ name: '', amount: '' }]
        }
        
        // 조리 과정 데이터
        if (data.data.steps && data.data.steps.length > 0) {
          post.steps = data.data.steps.map(step => ({
            stepSequence: step.stepSequence || 1,
            content: step.content || '',
            comment: step.description || '' // 백엔드의 description을 comment로 매핑
          }))
        } else {
          post.steps = [{ stepSequence: 1, content: '', comment: '' }]
        }

        // 작성자/관리자 권한 체크
        if (!isAuthor.value && !isAdmin.value) {
          alert('본인이 작성한 게시글만 수정할 수 있습니다.')
          router.push(`/recipes/${postId}`)
          return
        }
      }
    } else {
      throw new Error('게시글을 불러올 수 없습니다.')
    }
  } catch (error) {
    console.error('게시글 로드 실패:', error)
    alert('게시글을 불러오는데 실패했습니다.')
    router.push('/recipes')
  }
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
  const nextSequence = post.steps.length + 1
  post.steps.push({ stepSequence: nextSequence, content: '', comment: '' })
}

const removeStep = (index) => {
  if (post.steps.length > 1) {
    post.steps.splice(index, 1)
  }
}

// 이미지 업로드 관련
const triggerImageUpload = () => {
  imageInput.value.click()
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }
    
    post.imageFile = file
    post.imageUrl = URL.createObjectURL(file)
  }
}

const handleImageDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }
    
    post.imageFile = file
    post.imageUrl = URL.createObjectURL(file)
  }
}

const clearImage = () => {
  post.imageFile = null
  post.imageUrl = defaultImageUrl // 기본 이미지로 설정
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// 게시글 수정
const updatePost = async () => {
  try {
    isUpdating.value = true
    
    // 작성자/관리자 권한 재확인
    if (!isAuthor.value && !isAdmin.value) {
      alert('본인이 작성한 게시글만 수정할 수 있습니다.')
      return
    }
    
    // 기본 검증
    if (!post.title.trim() || !post.content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    if (post.ingredients.length === 0 || post.steps.length === 0) {
      alert('재료와 조리 과정을 입력해주세요.')
      return
    }

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
    
    
    // 이미지 처리 로직
    let thumbnailUrl = post.imageUrl || null;
    
    // 새로운 이미지 파일이 있으면 업로드, 없으면 기존 이미지 유지
    if (post.imageFile && post.imageFile.size > 0) {
      // 새로운 이미지가 있으면 업로드 (백엔드에서 처리)
    } else if (!post.imageUrl || post.imageUrl === '') {
      // 이미지가 없으면 기본 이미지로 설정
      thumbnailUrl = defaultImageUrl;
    }
    
    // PostUpdateRequestDto에 해당하는 데이터를 하나의 객체로 만듭니다.
    const requestDto = {
      title: post.title,
      description: post.content || '',
      category: getCategoryEnum(post.category), // '한식' → 'KOREAN' 변환
      level: getDifficultyEnum(post.difficulty),   // '보통' → 'MEDIUM' 변환
      cookTime: cookTime,
      serving: servings,
      cookTip: post.cookingTip || '',
      isOpen: post.isPublic,
      // 썸네일 URL 설정
      thumbnailUrl: thumbnailUrl,
      ingredients: post.ingredients.map(ing => ({
        name: ing.name,
        amount: ing.amount
      })),
      steps: post.steps.map(step => ({
        stepSequence: step.stepSequence || 1,
        content: step.content,
        description: step.comment || ''
      }))
    };
    
    
    // FormData 객체를 생성합니다.
    const formData = new FormData();
    
    // 1. JSON 데이터를 'request' 파트로 추가합니다.
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDto)], { type: 'application/json' })
    );
    
    
    // 2. 썸네일 파일을 'thumbnail' 파트로 추가합니다.
    //    새로운 파일이 있을 경우에만 추가합니다.
    if (post.imageFile && post.imageFile.size > 0) {
      formData.append('thumbnail', post.imageFile);
    } else if (!post.imageUrl || post.imageUrl === '') {
      // 이미지가 없으면 기본 이미지로 설정 (백엔드에서 처리)
    }
    
    
    
    const postId = route.query.id
    const response = await recipeService.updateRecipe(postId, formData)
    
    if (response.success) {
      const responseData = response
      alert('게시글이 수정되었습니다!')
      
      // 비밀글로 수정한 경우 마이페이지로, 공개글로 수정한 경우 상세페이지로 이동
      if (!post.isPublic) {
        router.push('/mypage')
      } else {
        router.push(`/recipes/${postId}`)
      }
    } else {
      const errorData = await response.text()
      console.error('게시글 수정 실패:', response.status, errorData)
      
      // 권한 에러인 경우 특별 처리
      if (response.status === 400) {
        try {
          const errorJson = JSON.parse(errorData)
          if (errorJson.message && errorJson.message.includes('권한이 없습니다')) {
            alert('본인이 작성한 게시글만 수정할 수 있습니다.')
            router.push('/mypage')
            return
          }
        } catch (e) {
          // JSON 파싱 실패 시 기본 메시지
        }
      }
      
      alert('게시글 수정에 실패했습니다.')
    }
    
  } catch (error) {
    console.error('게시글 수정 실패:', error)
    const errorMessage = error.message || '알 수 없는 오류가 발생했습니다.'
    alert(`게시글 수정에 실패했습니다: ${errorMessage}`)
  } finally {
    isUpdating.value = false
  }
}

const goBack = () => {
  router.go(-1)
}

// 컴포넌트 마운트 시 기존 데이터 로드
onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.image-upload-area {
  width: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-placeholder:hover {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

.upload-guide {
  text-align: center;
  color: #666;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.image-actions {
  display: flex;
  gap: 10px;
}

.image-help {
  margin-top: 16px;
}

.image-help ul {
  list-style: none;
  padding-left: 0;
}

.image-help li {
  margin-bottom: 4px;
}

.image-help li:before {
  content: "•";
  color: #1976d2;
  font-weight: bold;
  margin-right: 8px;
}

/* 공개 설정 스위치 스타일 */
.public-setting-switch {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  border: none;
  min-width: 280px;
  box-shadow: none;
}

.public-setting-switch .v-switch {
  pointer-events: auto;
}

/* 코멘트 텍스트에어리어 라벨 스타일 */
.comment-textarea :deep(.v-label) {
  color: #1976d2 !important;
  font-weight: 500;
}

.comment-textarea :deep(.v-field__outline) {
  --v-field-border-color: #1976d2;
}

.comment-textarea :deep(.v-field--focused .v-field__outline) {
  --v-field-border-color: #1976d2;
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
