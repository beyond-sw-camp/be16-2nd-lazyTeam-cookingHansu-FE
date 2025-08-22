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
                <span class="text-primary font-weight-bold">레시피 등록</span>
              </nav>
              <h1 class="text-h3 font-weight-bold mb-3">{{ isEditMode ? '레시피 수정' : '새 레시피 등록' }}</h1>
              <p class="text-body-1 text-grey-darken-2">
                {{ isEditMode ? '기존 레시피를 수정해보세요' : '맛있는 레시피를 다른 사람들과 공유해보세요' }}
              </p>
            </div>
          </div>

          <!-- 메인 폼 -->
          <v-card elevation="0" class="pa-8">
            <!-- 기본 정보 섹션 -->
            <div class="mb-10">
              <h2 class="text-h5 mb-6 font-weight-bold">기본 정보</h2>
              
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="recipe.title"
                    label="레시피 제목 *"
                    placeholder="예: 김치찌개 만드는 비법"
                    variant="outlined"
                    class="mb-6"
                    required
                  />
                  
                  <v-textarea
                    v-model="recipe.description"
                    label="레시피 설명 *"
                    placeholder="레시피에 대한 간단한 설명을 입력해주세요"
                    variant="outlined"
                    rows="3"
                    class="mb-6"
                    required
                  />
                  
                  <!-- 이미지 입력 섹션 -->
                  <div class="image-input-section mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold mb-3">대표 이미지</h3>
                    
                    <!-- 이미지 미리보기 -->
                    <div v-if="recipe.imageUrl" class="image-preview mb-4">
                      <v-img
                        :src="recipe.imageUrl"
                        height="200"
                        cover
                        class="preview-image rounded"
                      >
                        <template v-slot:error>
                          <div class="d-flex align-center justify-center fill-height">
                            <div class="text-center">
                              <v-icon size="48" color="grey">mdi-image-off</v-icon>
                              <div class="text-body-2 text-grey mt-2">이미지를 불러올 수 없습니다</div>
                            </div>
                          </div>
                        </template>
                      </v-img>
                      
                      <div class="preview-actions mt-2">
                        <v-btn 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          @click="clearImage"
                        >
                          <v-icon start>mdi-delete</v-icon>
                          이미지 제거
                        </v-btn>
                      </div>
                    </div>
                    
                    <!-- 이미지 업로드 버튼 -->
                    <div class="image-upload-buttons mb-3">
                      <v-btn
                        color="primary"
                        variant="elevated"
                        @click="showImageUploadModal = true"
                        class="mr-3"
                      >
                        <v-icon start>mdi-cloud-upload</v-icon>
                        이미지 업로드
                      </v-btn>
                      
                      <v-btn
                        variant="outlined"
                        @click="showUrlInput = !showUrlInput"
                      >
                        <v-icon start>mdi-link</v-icon>
                        URL로 입력
                      </v-btn>
                    </div>
                    
                    <!-- 이미지 URL 입력 필드 (토글) -->
                    <v-text-field
                      v-if="showUrlInput"
                      v-model="recipe.imageUrl"
                      label="이미지 URL"
                      placeholder="https://example.com/image.jpg"
                      variant="outlined"
                      prepend-inner-icon="mdi-image"
                      clearable
                      @update:model-value="validateImageUrl"
                      class="mb-3"
                    />
                    
                    <!-- 이미지 입력 도움말 -->
                    <div class="image-help mt-2">
                      <v-alert
                        type="info"
                        variant="tonal"
                        density="compact"
                        class="mb-0"
                      >
                        <template v-slot:prepend>
                          <v-icon>mdi-information</v-icon>
                        </template>
                        <div class="text-body-2">
                          <strong>이미지 가이드:</strong>
                          <ul class="mt-1 mb-0">
                            <li>권장 크기: 800x600px 이상</li>
                            <li>지원 형식: JPG, PNG, WebP</li>
                            <li>최대 용량: 5MB 이하</li>
                            <li>이미지 업로드 또는 공개된 이미지 URL을 사용해주세요</li>
                          </ul>
                        </div>
                      </v-alert>
                    </div>
                  </div>
                  
                  <!-- 인분, 카테고리, 난이도, 조리시간을 가로로 배치 -->
                  <v-row align="center" class="mb-6">
                    <v-col cols="auto">
                      <v-text-field
                        v-model="recipe.servings"
                        label="인분"
                        placeholder="4"
                        variant="outlined"
                        type="number"
                        style="max-width: 120px;"
                      />
                    </v-col>
                    <v-col cols="auto">
                      <v-select
                        v-model="recipe.category"
                        :items="categoryOptions"
                        label="카테고리"
                        variant="outlined"
                        style="width: 160px;"
                        required
                      />
                    </v-col>
                    <v-col cols="auto">
                      <v-select
                        v-model="recipe.difficulty"
                        :items="difficultyOptions"
                        label="난이도"
                        variant="outlined"
                        style="width: 160px;"
                        required
                      />
                    </v-col>
                    <v-col cols="auto">
                      <v-text-field
                        v-model="recipe.cookTime"
                        label="조리 시간 (분)"
                        placeholder="30"
                        variant="outlined"
                        type="number"
                        style="max-width: 160px;"
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
              
              <div v-for="(ingredient, index) in recipe.ingredients" :key="index" class="d-flex gap-8 mb-4">
                <div class="flex-grow-1">
                  <v-text-field
                    v-model="ingredient.name"
                    :label="`재료 ${index + 1} (예: 김치 300g)`"
                    variant="outlined"
                    required
                  />
                </div>
                <v-btn 
                  variant="outlined"
                  color="black" 
                  @click="removeIngredient(index)"
                  :disabled="recipe.ingredients.length <= 1"
                  style="width: 32px; height: 32px; min-width: 32px;"
                >
                  <v-icon size="small">mdi-minus</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- 조리 과정 섹션 -->
            <div class="mb-10">
              <div class="d-flex justify-space-between align-center mb-6">
                <h2 class="text-h5 font-weight-bold">조리 과정</h2>
                <v-btn color="primary" @click="addStep">
                  <v-icon start>mdi-plus</v-icon>
                  단계 추가
                </v-btn>
              </div>
              
              <div v-for="(step, index) in recipe.steps" :key="index" class="mb-8">
                <div class="d-flex" style="gap: 10px;">
                  <v-avatar color="primary" size="32" class="mt-2">
                    <span class="text-white font-weight-bold text-body-1">{{ index + 1 }}</span>
                  </v-avatar>
                  
                  <div class="flex-grow-1" style="max-width: calc(100% - 42px);">
                    <v-textarea
                      v-model="step.content"
                      :label="`조리 과정 ${index + 1}를 상세히 설명해주세요`"
                      variant="outlined"
                      rows="3"
                      class="mb-3"
                      required
                    />
                  </div>
                  
                  <v-btn 
                    variant="outlined"
                    color="black" 
                    @click="removeStep(index)"
                    :disabled="recipe.steps.length <= 1"
                    style="width: 32px; height: 32px; min-width: 32px;"
                  >
                    <v-icon size="small">mdi-minus</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- 하단 버튼들 -->
            <div class="d-flex justify-center gap-6 mt-10">
              <v-btn variant="outlined" size="large" class="px-8" @click="router.push('/mypage')">
                취소
              </v-btn>
              <v-btn color="primary" size="large" class="px-8" @click="saveRecipe">
                {{ isEditMode ? '레시피 수정' : '레시피 등록' }}
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 이미지 업로드 모달 -->
    <v-dialog v-model="showImageUploadModal" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="d-flex align-center gap-2">
            <v-icon color="primary">mdi-cloud-upload</v-icon>
            <span class="text-h6 font-weight-bold">이미지 업로드</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="showImageUploadModal = false" />
        </v-card-title>
        
        <v-card-text class="pa-6">
          <!-- 파일 업로드 영역 -->
          <div class="upload-area mb-4">
            <v-file-input
              v-model="uploadedFile"
              accept="image/*"
              label="이미지 파일 선택"
              variant="outlined"
              prepend-icon="mdi-camera"
              @change="handleFileUpload"
              :rules="fileRules"
            />
          </div>
          
          <!-- 업로드된 이미지 미리보기 -->
          <div v-if="uploadedImageUrl" class="uploaded-preview mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">업로드된 이미지</h4>
            <v-img
              :src="uploadedImageUrl"
              height="200"
              cover
              class="rounded"
            />
            <div class="mt-2">
              <v-btn 
                color="success" 
                @click="useUploadedImage"
                class="mr-2"
              >
                <v-icon start>mdi-check</v-icon>
                이 이미지 사용
              </v-btn>
              <v-btn 
                variant="outlined" 
                @click="clearUploadedImage"
              >
                <v-icon start>mdi-refresh</v-icon>
                다시 선택
              </v-btn>
            </div>
          </div>
          
          <!-- 업로드 도움말 -->
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-0"
          >
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <div class="text-body-2">
              <strong>업로드 가이드:</strong>
              <ul class="mt-1 mb-0">
                <li>지원 형식: JPG, PNG, WebP, GIF</li>
                <li>권장 크기: 800x600px 이상</li>
                <li>최대 용량: 5MB 이하</li>
                <li>이미지 품질이 좋을수록 더 나은 결과를 얻을 수 있습니다</li>
              </ul>
            </div>
          </v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 편집 모드 확인
const isEditMode = ref(false)
const editRecipeId = ref(null)

// 레시피 데이터
const recipe = reactive({
  title: '',
  description: '',
  imageUrl: '',
  category: '한식',
  difficulty: '쉬움',
  cookTime: 30,
  servings: 4,
  ingredients: [
    { name: '' }
  ],
  steps: [
    { content: '' }
  ]
})

// 옵션 데이터
const categoryOptions = [
  '한식', '중식', '양식', '일식', '디저트', '음료'
]

const difficultyOptions = [
  '매우 쉬움', '쉬움', '보통', '어려움', '매우 어려움'
]

// 이미지 업로드 관련 상태
const showImageUploadModal = ref(false)
const uploadedFile = ref(null)
const uploadedImageUrl = ref('')
const showUrlInput = ref(false)

// 파일 검증 규칙
const fileRules = [
  (value) => {
    if (!value) return true
    if (value.size > 5 * 1024 * 1024) return '파일 크기는 5MB 이하여야 합니다'
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(value.type)) {
      return '지원되는 이미지 형식: JPG, PNG, WebP, GIF'
    }
    return true
  }
]

// 메서드
const addIngredient = () => {
  recipe.ingredients.push({ name: '' })
}

const removeIngredient = (index) => {
  if (recipe.ingredients.length > 1) {
    recipe.ingredients.splice(index, 1)
  }
}

const addStep = () => {
  recipe.steps.push({ content: '' })
}

const removeStep = (index) => {
  if (recipe.steps.length > 1) {
    recipe.steps.splice(index, 1)
  }
}

// 이미지 관련 메서드들
const clearImage = () => {
  recipe.imageUrl = ''
}

const validateImageUrl = (url) => {
  if (url && !url.startsWith('http')) {
    // URL 형식 검증 로직 추가 가능
    console.log('이미지 URL 입력됨:', url)
  }
}

const handleFileUpload = (file) => {
  if (file) {
    // 파일을 URL로 변환 (실제로는 서버에 업로드)
    uploadedImageUrl.value = URL.createObjectURL(file)
  }
}

const useUploadedImage = () => {
  // 업로드된 이미지 URL을 레시피에 설정
  recipe.imageUrl = uploadedImageUrl.value
  showImageUploadModal.value = false
  clearUploadedImage()
}

const clearUploadedImage = () => {
  uploadedFile.value = null
  uploadedImageUrl.value = ''
}

// 레시피 저장/수정
const saveRecipe = () => {
  if (isEditMode.value) {
    // 수정 모드: 기존 레시피 업데이트
    console.log('레시피 수정:', recipe)
    // TODO: API 호출로 레시피 수정
    router.push('/mypage')
  } else {
    // 새로 작성 모드: 새 레시피 저장
    console.log('새 레시피 저장:', recipe)
    // TODO: API 호출로 새 레시피 저장
    router.push('/mypage')
  }
}

// 기존 레시피 데이터 로드 (편집 모드)
const loadExistingRecipe = (id) => {
  // TODO: API에서 기존 레시피 데이터 가져오기
  // 임시로 더미 데이터 사용
  const existingRecipe = {
    title: '기존 레시피 제목',
    description: '기존 레시피 설명',
    imageUrl: '/src/assets/images/smu_mascort1.jpg',
    category: '한식',
    difficulty: '보통',
    cookTime: 45,
    servings: 6,
    ingredients: [
      { name: '재료 1' },
      { name: '재료 2' }
    ],
    steps: [
      { content: '조리 과정 1' },
      { content: '조리 과정 2' }
    ]
  }
  
  // 레시피 데이터 설정
  Object.assign(recipe, existingRecipe)
}

// 컴포넌트 마운트 시 편집 모드 확인
onMounted(() => {
  const id = route.query.id
  if (id) {
    isEditMode.value = true
    editRecipeId.value = id
    loadExistingRecipe(id)
  }
})
</script>

<style scoped>
.breadcrumb {
  font-size: 14px;
}

.recipe-item {
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.recipe-item:hover {
  border-color: #ff9800;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
}
</style>