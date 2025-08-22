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
            <v-btn color="success" size="large" @click="openRecipeModal">
              <v-icon start>mdi-folder-open</v-icon>
              내 레시피 불러오기
            </v-btn>
          </div>

          <!-- 메인 폼 -->
          <v-card elevation="0" class="pa-8">
            <!-- 기본 정보 섹션 -->
            <div class="mb-10">
              <h2 class="text-h5 mb-6 font-weight-bold">기본 정보</h2>
              
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="post.title"
                    label="게시글 제목 *"
                    placeholder="예: 오늘 만든 김치찌개 후기"
                    variant="outlined"
                    class="mb-6"
                    required
                  />
                  
                  <v-textarea
                    v-model="post.content"
                    label="게시글 내용 *"
                    placeholder="레시피를 만들면서 느낀 점, 팁, 후기 등을 자유롭게 작성해주세요"
                    variant="outlined"
                    rows="5"
                    class="mb-6"
                    required
                  />
                  
                  <!-- 이미지 입력 섹션 -->
                  <div class="image-input-section mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold mb-3">대표 이미지</h3>
                    
                    <!-- 이미지 미리보기 -->
                    <div v-if="post.imageUrl" class="image-preview mb-4">
                      <v-img
                        :src="post.imageUrl"
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
                    
                    <!-- 이미지 입력 필드 -->
                    <v-text-field
                      v-model="post.imageUrl"
                      label="이미지 URL"
                      placeholder="https://example.com/image.jpg"
                      variant="outlined"
                      prepend-inner-icon="mdi-image"
                      clearable
                      @update:model-value="validateImageUrl"
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
                            <li>공개된 이미지 URL을 사용해주세요</li>
                          </ul>
                        </div>
                      </v-alert>
                    </div>
                    
                    <!-- 이미지 업로드 대안 -->
                    <div class="image-upload-alternative mt-3">
                      <v-btn
                        variant="outlined"
                        color="primary"
                        @click="showImageUploadModal = true"
                        class="mb-2"
                      >
                        <v-icon start>mdi-cloud-upload</v-icon>
                        이미지 직접 업로드
                      </v-btn>
                      <div class="text-caption text-grey">
                        또는 이미지 호스팅 서비스(Imgur, ImgBB 등)를 이용해 이미지 URL을 생성할 수 있습니다
                      </div>
                    </div>
                  </div>
                  
                  <!-- 카테고리, 인분, 난이도, 조리시간을 가로로 배치 -->
                  <v-row align="center" class="mb-6">
                    <v-col cols="auto">
                      <v-select
                        v-model="post.category"
                        :items="categoryOptions"
                        label="카테고리"
                        variant="outlined"
                        style="width: 160px;"
                        required
                      />
                    </v-col>
                    <v-col cols="auto">
                      <v-text-field
                        v-model="post.servings"
                        label="인분"
                        placeholder="4"
                        variant="outlined"
                        type="number"
                        style="max-width: 120px;"
                      />
                    </v-col>
                    <v-col cols="auto">
                      <v-select
                        v-model="post.difficulty"
                        :items="difficultyOptions"
                        label="난이도"
                        variant="outlined"
                        style="width: 160px;"
                        required
                      />
                    </v-col>
                    <v-col cols="auto">
                      <v-text-field
                        v-model="post.cookTime"
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

            <!-- 레시피 정보 섹션 -->
            <div class="mb-10">
              <h2 class="text-h5 mb-6 font-weight-bold">레시피 정보</h2>
              
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="post.recipeTitle"
                    label="레시피 제목"
                    placeholder="예: 김치찌개 만드는 비법"
                    variant="outlined"
                    class="mb-6"
                  />
                  
                  <v-textarea
                    v-model="post.recipeDescription"
                    label="레시피 설명"
                    placeholder="레시피에 대한 간단한 설명을 입력해주세요"
                    variant="outlined"
                    rows="3"
                    class="mb-6"
                  />
                  
                  <!-- 인분, 카테고리, 난이도, 조리시간을 가로로 배치 -->
                  <v-row align="center" class="mb-6">
                    <v-col cols="auto">
                      <v-text-field
                        v-model="post.servings"
                        label="인분"
                        placeholder="4"
                        variant="outlined"
                        type="number"
                        style="max-width: 120px;"
                      />
                    </v-col>
                    <v-col cols="auto">
                      <v-select
                        v-model="post.recipeCategory"
                        :items="categoryOptions"
                        label="레시피 카테고리"
                        variant="outlined"
                        style="width: 160px;"
                      />
                    </v-col>
                    <v-col cols="auto">
                      <v-select
                        v-model="post.recipeDifficulty"
                        :items="difficultyOptions"
                        label="레시피 난이도"
                        variant="outlined"
                        style="width: 160px;"
                      />
                    </v-col>
                    <v-col cols="auto">
                      <v-text-field
                        v-model="post.recipeCookTime"
                        label="레시피 조리시간 (분)"
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
              
              <div v-for="(ingredient, index) in post.ingredients" :key="index" class="d-flex gap-8 mb-4">
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
                  :disabled="post.ingredients.length <= 1"
                  style="width: 32px; height: 32px; min-width: 32px;"
                >
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
                  <v-avatar color="primary" size="32" class="mt-2">
                    <span class="text-white font-weight-bold text-body-1">{{ index + 1 }}</span>
                  </v-avatar>
                  
                  <div class="flex-grow-1" style="max-width: calc(100% - 42px);">
                    <v-textarea
                      v-model="step.content"
                      :label="`조리 순서 ${index + 1}를 상세히 설명해주세요`"
                      placeholder="예: 돼지고기를 한입 크기로 썰어 준비합니다"
                      variant="outlined"
                      rows="3"
                      class="mb-3"
                      required
                    />
                    
                    <!-- 추가 코멘트 (레시피와의 차이점) -->
                    <v-textarea
                      v-model="step.comment"
                      :label="`▷ 코멘트 (선택사항)`"
                      placeholder="이 단계에서 주의할 점이나 팁, 개인적인 경험을 공유해주세요"
                      variant="outlined"
                      rows="2"
                      class="mb-3"
                    />
                  </div>
                  
                  <v-btn 
                    variant="outlined"
                    color="black" 
                    @click="removeStep(index)"
                    :disabled="post.steps.length <= 1"
                    style="width: 32px; height: 32px; min-width: 32px;"
                  >
                    <v-icon size="small">mdi-minus</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- 요리 팁 섹션 -->
            <div class="mb-10">
              <h2 class="text-h5 mb-6 font-weight-bold">요리 팁</h2>
              <v-textarea
                v-model="post.cookingTip"
                label="요리 팁 (선택사항)"
                placeholder="이 레시피를 더 맛있게 만들 수 있는 팁이나 변형 방법을 공유해주세요"
                variant="outlined"
                rows="4"
              />
            </div>

            <!-- 공개 설정 -->
            <div class="public-setting-section mb-8">
              <h3 class="text-subtitle-1 font-weight-bold mb-4">공개 설정</h3>
              <div class="d-flex align-center gap-6">
                <v-radio-group v-model="post.isPublic" inline>
                  <v-radio 
                    label="공개" 
                    :value="true" 
                    color="primary"
                    class="mr-4"
                  />
                  <v-radio 
                    label="비공개" 
                    :value="false" 
                    color="primary"
                  />
                </v-radio-group>
                
                <div class="public-info">
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
                      <strong>공개 설정 안내:</strong>
                      <ul class="mt-1 mb-0">
                        <li><strong>공개:</strong> 모든 사용자가 게시글을 볼 수 있습니다</li>
                        <li><strong>비공개:</strong> 본인만 게시글을 볼 수 있습니다</li>
                      </ul>
                    </div>
                  </v-alert>
                </div>
              </div>
            </div>

            <!-- 하단 버튼들 -->
            <div class="d-flex justify-center gap-6 mt-10">
              <v-btn variant="outlined" size="large" class="px-8" @click="goBack">
                취소
              </v-btn>
              <v-btn color="primary" size="large" class="px-8" @click="submitPost">
                게시글 등록
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 내 레시피 불러오기 모달 -->
    <v-dialog v-model="showRecipeModal" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="d-flex align-center gap-2">
            <v-icon color="grey-darken-1">mdi-file-document-plus</v-icon>
            <span class="text-h5 font-weight-bold">내 레시피 불러오기</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="showRecipeModal = false" />
        </v-card-title>
        
        <v-card-text class="pa-6">
          <!-- 레시피 목록 -->
          <div class="recipe-list mb-6">
            <div 
              v-for="recipe in myRecipes" 
              :key="recipe.id"
              class="recipe-item d-flex justify-space-between align-center pa-4 mb-3 bg-grey-lighten-5 rounded"
            >
              <div class="flex-grow-1">
                <h3 class="text-h6 font-weight-bold mb-2">{{ recipe.title }}</h3>
                <p class="text-body-2 text-grey-darken-1 mb-2">{{ recipe.description }}</p>
                <div class="d-flex gap-4 text-caption text-grey-darken-2">
                  <span>{{ recipe.servings }}인분</span>
                  <span>{{ recipe.cookTime }}분</span>
                  <span>{{ recipe.difficulty }}</span>
                  <span>{{ recipe.category }}</span>
                </div>
                <div class="text-caption text-grey-darken-2 mt-1">
                  등록일: {{ recipe.registeredDate }}
                </div>
              </div>
              <v-btn color="orange" @click="loadRecipe(recipe)">
                불러오기
              </v-btn>
            </div>
          </div>

          <!-- 안내 정보 -->
          <v-card color="blue-lighten-5" variant="tonal" class="pa-4">
            <div class="d-flex align-start gap-3">
              <v-icon color="blue" size="24">mdi-help-circle</v-icon>
              <div>
                <div class="text-h6 font-weight-bold text-blue mb-2">레시피 불러오기 안내</div>
                <ul class="text-body-2 text-blue-darken-2 mb-0">
                  <li>마이페이지의 개인 레시피를 불러와 공유용으로 편집할 수 있습니다</li>
                  <li>각 조리 단계별로 코멘트와 요리 팁을 추가할 수 있습니다</li>
                  <li>불러온 레시피는 언제든지 수정할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 성공 알림 -->
    <v-dialog v-model="showSuccessDialog" max-width="400">
      <v-card class="text-center pa-6">
        <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
        <h2 class="text-h5 font-weight-bold mb-3">레시피를 불러왔습니다!</h2>
        <p class="text-body-1 mb-4">"{{ selectedRecipe?.title }}"을 공유용으로 편집 할 수 있습니다.</p>
        <v-btn color="success" block @click="closeSuccessDialog">
          확인
        </v-btn>
      </v-card>
    </v-dialog>

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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 게시글 데이터
const post = reactive({
  title: '',
  content: '',
  imageUrl: '',
  category: '한식',
  difficulty: '보통',
  cookTime: '',
  servings: '',
  recipeTitle: '',
  recipeDescription: '',
  recipeCategory: '한식',
  recipeDifficulty: '보통',
  recipeCookTime: '',
  cookingTip: '',
  isPublic: true,
  ingredients: [
    { name: '' }
  ],
  steps: [
    { content: '', comment: '' }
  ]
})

// 이미지 업로드 관련 상태
const showImageUploadModal = ref(false)
const uploadedFile = ref(null)
const uploadedImageUrl = ref('')

// 내 레시피 불러오기 관련 상태
const showRecipeModal = ref(false)
const showSuccessDialog = ref(false)
const selectedRecipe = ref(null)

// 내 레시피 데이터 (임시)
const myRecipes = ref([
  {
    id: 1,
    title: '집에서 만드는 간단한 김치찌개',
    description: '신 김치로 만드는 얼큰한 김치찌개',
    servings: '4',
    cookTime: '30',
    difficulty: '보통',
    category: '한식',
    registeredDate: '2024. 1. 15.',
    ingredients: [
      { name: '신김치 300g' },
      { name: '돼지고기 200g' },
      { name: '두부 1모' },
      { name: '대파 1대' }
    ],
    steps: [
      { content: '돼지고기를 한입 크기로 썰어 준비합니다.' },
      { content: '김치와 김치국물을 준비합니다.' },
      { content: '팬에 기름을 두르고 돼지고기를 볶습니다.' },
      { content: '김치를 넣고 함께 볶아줍니다.' }
    ]
  },
  {
    id: 2,
    title: '부드러운 계란찜',
    description: '폭신폭신한 계란찜 만들기',
    servings: '2',
    cookTime: '15',
    difficulty: '쉬움',
    category: '한식',
    registeredDate: '2024. 1. 10.',
    ingredients: [
      { name: '계란 2개' },
      { name: '물 100ml' },
      { name: '소금 약간' }
    ],
    steps: [
      { content: '계란을 깨서 그릇에 넣습니다.' },
      { content: '물과 소금을 넣고 잘 섞습니다.' },
      { content: '찜기에 넣고 10분간 찝니다.' }
    ]
  }
])

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

// 옵션 데이터
const categoryOptions = [
  '한식', '중식', '양식', '일식', '베이킹', '음료', '기타'
]

const difficultyOptions = [
  '매우 쉬움', '쉬움', '보통', '어려움', '매우 어려움'
]

// 메서드들
const addIngredient = () => {
  post.ingredients.push({ name: '' })
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

const submitPost = () => {
  // 게시글 등록 로직
  console.log('게시글 등록:', post)
  // TODO: API 호출 로직 구현
  alert('게시글이 등록되었습니다!')
  router.push('/recipes')
}

// 이미지 관련 메서드들
const clearImage = () => {
  post.imageUrl = ''
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
  // 업로드된 이미지 URL을 게시글에 설정
  post.imageUrl = uploadedImageUrl.value
  showImageUploadModal.value = false
  clearUploadedImage()
}

const clearUploadedImage = () => {
  uploadedFile.value = null
  uploadedImageUrl.value = ''
}

// 내 레시피 불러오기 관련 메서드들
const openRecipeModal = () => {
  showRecipeModal.value = true
}

const loadRecipe = (recipe) => {
  selectedRecipe.value = recipe
  showRecipeModal.value = false
  showSuccessDialog.value = true
  
  // 레시피 데이터 로드
  post.recipeTitle = recipe.title
  post.recipeDescription = recipe.description
  post.category = recipe.category
  post.difficulty = recipe.difficulty
  post.servings = recipe.servings
  post.cookTime = recipe.cookTime
  post.recipeCategory = recipe.category
  post.recipeDifficulty = recipe.difficulty
  post.recipeCookTime = recipe.cookTime
  
  // 재료와 단계 로드
  if (recipe.ingredients) {
    post.ingredients = recipe.ingredients.map(ing => ({ name: ing.name }))
  }
  if (recipe.steps) {
    post.steps = recipe.steps.map(step => ({ content: step.content, comment: '' }))
  }
}

const closeSuccessDialog = () => {
  showSuccessDialog.value = false
  selectedRecipe.value = null
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

.image-preview {
  text-align: center;
}

.preview-image {
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.preview-image:hover {
  border-color: #1976d2;
  transform: scale(1.02);
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.image-help ul {
  margin: 0;
  padding-left: 20px;
}

.image-help li {
  margin-bottom: 4px;
}

.image-upload-alternative {
  text-align: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

/* 업로드 모달 스타일 */
.upload-area {
  border: 2px dashed #1976d2;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  background: #f5f9ff;
}

.uploaded-preview {
  text-align: center;
}

.uploaded-preview img {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

/* 공개 설정 섹션 스타일 */
.public-setting-section {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  background: #fafafa;
}

.public-info {
  flex: 1;
  max-width: 400px;
}

/* 내 레시피 불러오기 모달 스타일 */
.recipe-item {
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.recipe-item:hover {
  border-color: #ff9800;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
}
</style>