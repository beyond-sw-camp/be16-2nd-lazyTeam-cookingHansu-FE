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
                <span class="text-primary font-weight-bold">게시글 등록</span>
              </nav>
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
                      <v-text-field v-model="post.servings" label="인분" placeholder="4" variant="outlined" type="number"
                        style="max-width: 120px;" required />
                    </v-col>
                    <v-col cols="auto">
                      <v-select v-model="post.difficulty" :items="difficultyOptions" label="난이도" variant="outlined"
                        style="width: 160px;" required />
                    </v-col>
                    <v-col cols="auto">
                      <v-text-field v-model="post.cookTime" label="조리 시간 (분)" placeholder="30" variant="outlined"
                        type="number" style="max-width: 160px;" required />
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
    // 필수 필드 검증
    if (!post.title.trim() || !post.content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    if (!post.imageFile) {
      alert('썸네일 이미지를 업로드해주세요.')
      return
    }

    isSubmitting.value = true

    // 데이터 변환
    const requestData = {
      title: post.title,
      description: post.content,  // content → description
      category: getCategoryEnum(post.category),  // 한식 → KOREAN
      level: getDifficultyEnum(post.difficulty), // 보통 → MEDIUM
      cookTime: parseInt(post.cookTime) || 0,
      serving: parseInt(post.servings) || 1,    // servings → serving
      cookTip: post.cookingTip,                  // cookingTip → cookTip
      isOpen: post.isPublic,                     // isPublic → isOpen
      ingredients: post.ingredients.map(ing => ({
        name: ing.name,
        amount: ing.amount || "적당량"  // amount 필드 추가
      })),
      steps: post.steps.map((step, index) => ({
        stepSequence: index + 1,      // stepSequence 추가
        content: step.content
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
    const response = await fetch('http://localhost:8080/api/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    if (response.ok) {
      const responseData = await response.json()
      console.log('게시글 생성 응답:', responseData)
      
      // 생성된 게시글의 ID를 가져와서 상세 페이지로 이동
      if (responseData.data && responseData.data.id) {
        alert('게시글이 등록되었습니다!')
        router.push(`/posts/${responseData.data.id}`)
      } else {
        alert('게시글이 등록되었습니다!')
        router.push('/posts')
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
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: cover;
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
  background: #f8f9fa;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  min-width: 280px;
}

.public-setting-switch .v-alert {
  margin-top: 12px;
  font-size: 0.875rem;
}
</style>