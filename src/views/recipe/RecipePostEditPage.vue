<template>
  <div>
    <v-container class="py-8 mt-16">
      <v-row>
        <v-col cols="12">
          <!-- 헤더 -->
          <div class="d-flex justify-space-between align-center mb-8">
            <div>
              <nav class="breadcrumb mb-3">
                <span class="text-grey-darken-1">홈</span>
                <v-icon size="16" class="mx-2 text-grey">mdi-chevron-right</v-icon>
                <span class="text-grey-darken-1">레시피</span>
                <v-icon size="16" class="mx-2 text-grey">mdi-chevron-right</v-icon>
                <span class="text-primary font-weight-bold">게시글 수정</span>
              </nav>
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
              <v-alert v-if="!post.isPublic" type="info" variant="tonal" density="compact" class="mt-2">
                <template v-slot:prepend>
                  <v-icon>mdi-information</v-icon>
                </template>
                <span class="text-body-2">비공개로 설정하면 본인만 볼 수 있습니다</span>
              </v-alert>
            </div>
          </div>

          <!-- 메인 폼 -->
          <v-card elevation="0" class="pa-8">
            <!-- 기본 정보 섹션 -->
            <div class="mb-10">
              <h2 class="text-h5 mb-6 font-weight-bold">기본 정보</h2>

              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="post.title" label="게시글 제목 *" placeholder="예: 오늘 만든 김치찌개 후기" variant="outlined"
                    class="mb-6" required />

                  <v-textarea v-model="post.content" label="게시글 내용 *" placeholder="레시피를 만들면서 느낀 점, 팁, 후기 등을 자유롭게 작성해주세요"
                    variant="outlined" rows="5" class="mb-6" required />

                  <!-- 썸네일 이미지 -->
                  <div class="image-input-section mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold mb-3">썸네일 이미지</h3>

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
                  <v-row align="center" class="mb-6">
                    <v-col cols="auto">
                      <v-select v-model="post.category" :items="categoryOptions" label="카테고리" variant="outlined"
                        style="width: 160px;" required />
                    </v-col>
                    <v-col cols="auto">
                      <v-text-field 
                        v-model="post.servings" 
                        label="인분" 
                        placeholder="4" 
                        variant="outlined" 
                        type="number"
                        min="1"
                        max="20"
                        style="max-width: 120px;" 
                        required 
                      />
                    </v-col>
                    <v-col cols="auto">
                      <v-select v-model="post.difficulty" :items="difficultyOptions" label="난이도" variant="outlined"
                        style="width: 160px;" required />
                    </v-col>
                    <v-col cols="auto">
                      <v-text-field 
                        v-model="post.cookTime" 
                        label="조리 시간 (분)" 
                        placeholder="30" 
                        variant="outlined"
                        type="number" 
                        min="1"
                        max="999"
                        style="max-width: 160px;" 
                        required 
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>

            <!-- 재료 섹션 -->
            <div class="mb-10">
              <div class="d-flex justify-space-between align-center mb-6">
                <h2 class="text-h5 font-weight-bold">재료</h2>
                <v-btn color="primary" @click="addIngredient">
                  <v-icon start>mdi-plus</v-icon>
                  재료 추가
                </v-btn>
              </div>

              <div v-for="(ingredient, index) in post.ingredients" :key="index" class="d-flex gap-3 mb-4">
                <v-text-field v-model="ingredient.name" :label="`재료 ${index + 1}`" placeholder="예: 김치"
                  variant="outlined" class="flex-grow-1" required />
                <v-text-field v-model="ingredient.amount" :label="`양`" placeholder="예: 300g" variant="outlined"
                  style="max-width: 120px;" required />
                <v-btn variant="outlined" color="black" @click="removeIngredient(index)"
                  :disabled="post.ingredients.length <= 1" style="width: 32px; height: 32px; min-width: 32px;">
                  <v-icon size="small">mdi-minus</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- 조리 순서 섹션 -->
            <div class="mb-10">
              <div class="d-flex justify-space-between align-center mb-6">
                <h2 class="text-h5 font-weight-bold">조리 순서</h2>
                <v-btn color="primary" @click="addStep">
                  <v-icon start>mdi-plus</v-icon>
                  단계 추가
                </v-btn>
              </div>

              <div v-for="(step, index) in post.steps" :key="index" class="mb-8">
                <div class="d-flex" style="gap: 10px;">
                  <v-avatar color="primary" size="35" class="mt-2">
                    <span class="text-white font-weight-bold text-body-2">{{ index + 1 }}</span>
                  </v-avatar>

                  <div class="flex-grow-1" style="max-width: calc(100% - 42px);">
                    <v-textarea v-model="step.content" :label="`조리 순서 ${index + 1}를 상세히 설명해주세요`"
                      placeholder="예: 돼지고기를 한입 크기로 썰어 준비합니다" variant="outlined" rows="3" class="mb-3" required />

                    <!-- 추가 코멘트 (레시피와의 차이점) -->
                    <v-textarea v-model="step.comment" :label="`▷ 코멘트 (선택사항)`"
                      placeholder="이 단계에서 주의할 점이나 팁, 개인적인 경험을 공유해주세요" variant="outlined" rows="2" class="mb-3" />
                  </div>

                  <v-btn variant="outlined" color="black" @click="removeStep(index)" :disabled="post.steps.length <= 1"
                    style="width: 32px; height: 32px; min-width: 32px;">
                    <v-icon size="small">mdi-minus</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- 요리 팁 섹션 -->
            <div class="mb-10">
              <h2 class="text-h5 mb-6 font-weight-bold">요리 팁</h2>
              <v-textarea v-model="post.cookingTip" label="요리 팁 (선택사항)"
                placeholder="이 레시피를 더 맛있게 만들 수 있는 팁이나 변형 방법을 공유해주세요" variant="outlined" rows="4" />
            </div>

            <!-- 하단 버튼들 -->
            <div class="d-flex justify-center gap-12 mt-10">
              <v-btn variant="outlined" size="large" class="px-8" @click="goBack">
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

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

// 기존 게시글 데이터 로드
const loadPost = async () => {
  try {
    const postId = route.query.id
    if (!postId) {
      alert('게시글 ID가 없습니다.')
      router.push('/recipes')
      return
    }

    const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('게시글 데이터 로드 성공:', data)
      
      if (data.data) {
        // 데이터 매핑
        post.title = data.data.title || ''
        post.content = data.data.description || ''
        post.imageUrl = data.data.thumbnailUrl || ''

        post.category = getCategoryText(data.data.category)
        post.difficulty = getDifficultyText(data.data.level)
        post.cookTime = data.data.cookTime || ''
        post.servings = data.data.serving || ''
        post.cookingTip = data.data.cookTip || ''
        post.isPublic = data.data.isOpen !== undefined ? data.data.isOpen : true
        
        // 재료 데이터
        if (data.data.ingredients && data.data.ingredients.length > 0) {
          post.ingredients = data.data.ingredients.map(ingredient => ({
            name: ingredient.name || ingredient.ingredientName || '',
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
  post.imageUrl = ''
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// 게시글 수정
const updatePost = async () => {
  try {
    isUpdating.value = true
    
    // 기본 검증
    if (!post.title.trim() || !post.content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    if (post.ingredients.length === 0 || post.steps.length === 0) {
      alert('재료와 조리 과정을 입력해주세요.')
      return
    }
    
    console.log('🚀 updatePost 함수 호출됨!')
    console.log('현재 post 데이터:', post)
    
    // PostUpdateRequestDto에 해당하는 데이터를 하나의 객체로 만듭니다.
    const requestDto = {
      title: post.title,
      description: post.content || '',
      category: getCategoryEnum(post.category), // '한식' → 'KOREAN' 변환
      level: getDifficultyEnum(post.difficulty),   // '보통' → 'MEDIUM' 변환
      cookTime: parseInt(post.cookTime) || 0,
      serving: parseInt(post.servings) || 1,
      cookTip: post.cookingTip || '',
      isOpen: post.isPublic,
      // 기존 썸네일 URL은 DTO 필드로 전달
      thumbnailUrl: post.imageUrl || null,
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
    
    console.log('📦 requestDto 생성 완료:', requestDto)
    
    // FormData 객체를 생성합니다.
    const formData = new FormData();
    console.log('📋 FormData 객체 생성 완료')
    
    // 1. JSON 데이터를 'request' 파트로 추가합니다.
    console.log('🔧 FormData request 필드 추가 시도...')
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDto)], { type: 'application/json' })
    );
    
    console.log('✅ FormData request 필드 추가 완료')
    
    // 2. 썸네일 파일을 'thumbnail' 파트로 추가합니다.
    //    새로운 파일이 있을 경우에만 추가합니다.
    if (post.imageFile && post.imageFile.size > 0) {
      console.log('새로운 썸네일 파일 전송:', post.imageFile.name, post.imageFile.size);
      formData.append('thumbnail', post.imageFile);
    }
    
    // FormData 내용 확인 로그
    console.log('FormData 내용 확인:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    console.log('🚀 fetch 요청 시작...')
    
    const postId = route.query.id
    const response = await fetch(
      `http://localhost:8080/api/posts/${postId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          // Content-Type은 브라우저가 자동으로 multipart/form-data로 설정
        },
        body: formData
      }
    )
    
    if (response.ok) {
      const responseData = await response.json()
      console.log('게시글 수정 응답:', responseData)
      alert('게시글이 수정되었습니다!')
      router.push(`/recipes/${postId}`)
    } else {
      const errorData = await response.text()
      console.error('게시글 수정 실패:', response.status, errorData)
      alert('게시글 수정에 실패했습니다.')
    }
    
  } catch (error) {
    console.error('❌ 게시글 수정 실패 - 전체 에러 객체:', error)
    console.error('❌ 에러 타입:', error.constructor.name)
    console.error('❌ 에러 메시지:', error.message)
    console.error('❌ 에러 스택:', error.stack)
    
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
</style>
