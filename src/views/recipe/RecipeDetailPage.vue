<template>
  <div>

    <!-- 메인 레시피 이미지 -->
    <div class="hero-image-container">
      <v-img
        :src="recipe.thumbnailUrl || '/src/assets/images/smu_mascort1.jpg'"
        height="500"
        cover
        class="hero-image"
        :aspect-ratio="16/9"
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
      
      <!-- 이미지 오버레이 -->
      <div class="image-overlay">
        <div class="overlay-content">
          <div class="recipe-badge">
            <v-chip color="success" size="large" class="ma-2">
              <v-icon start>mdi-check-circle</v-icon>
              인증된 레시피
            </v-chip>
          </div>
          
          <div class="recipe-quick-info">
            <div class="info-item">
              <v-icon color="white" size="24">mdi-clock-outline</v-icon>
              <span class="text-white font-weight-bold">{{ recipe.cookTime }}분</span>
            </div>
            <div class="info-item">
              <v-icon color="white" size="24">mdi-account-group</v-icon>
              <span class="text-white font-weight-bold">{{ recipe.servings }}인분</span>
            </div>
            <div class="info-item">
              <v-icon color="white" size="24">mdi-star</v-icon>
              <span class="text-white font-weight-bold">{{ getDifficultyText(recipe.level) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 이미지 위 액션 버튼들 -->
      <div class="hero-actions">
        <BookmarkButton 
          :post-id="recipe.postId"
          :initial-bookmarked="recipe.isBookmarked"
          variant="icon"
          color="white"
        />
        <v-btn icon variant="text" color="white" size="large" class="action-btn">
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
        <v-btn icon variant="text" color="white" size="large" class="action-btn">
          <v-icon>mdi-heart</v-icon>
        </v-btn>
      </div>
    </div>

    <v-container class="py-8">
      <v-row>
        <v-col cols="12" lg="8">
          <!-- 레시피 헤더 -->
          <div class="recipe-header mb-6">
            <h1 class="text-h4 font-weight-bold mb-4">{{ recipe.title }}</h1>
            <p class="text-body-1 text-grey-darken-1 mb-4">{{ recipe.description }}</p>
            
            <!-- 작성자 정보 -->
            <div class="d-flex align-center gap-3 mb-4">
              <v-avatar size="40" color="orange">
                <span class="text-white font-weight-bold">{{ recipe.author.nickname.charAt(0) }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ recipe.author.nickname }}</div>
                <div class="text-caption text-grey">{{ recipe.author.role }}</div>
              </div>
            </div>

            <!-- 상호작용 버튼들 -->
            <div class="d-flex align-center gap-2 mb-6">
              <LikeButton 
                :post-id="recipe.postId" 
                :initial-count="recipe.likeCount"
                :initial-liked="recipe.isLiked"
              />
              <BookmarkButton 
                :post-id="recipe.postId"
                :initial-bookmarked="recipe.isBookmarked"
              />
              <v-btn variant="outlined" color="primary">
                <v-icon start>mdi-comment-outline</v-icon>
                신고
              </v-btn>
            </div>
          </div>

          <!-- 레시피 기본 정보 테이블 -->
          <v-card class="mb-6" elevation="1">
            <v-card-title class="text-h6 font-weight-bold bg-grey-lighten-4">
              재료
            </v-card-title>
            <v-card-text class="pa-0">
              <v-simple-table>
                <thead>
                  <tr>
                    <th class="text-left font-weight-bold">재료명</th>
                    <th class="text-right font-weight-bold">용량</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ingredient in recipe.ingredients" :key="ingredient.id">
                    <td class="py-3">{{ ingredient.name }}</td>
                    <td class="text-right py-3">{{ ingredient.amount }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>

          <!-- 조리과정 -->
          <v-card class="mb-6" elevation="1">
            <v-card-title class="text-h6 font-weight-bold bg-grey-lighten-4">
              조리과정
            </v-card-title>
            <v-card-text class="pa-6">
              <div 
                v-for="(step, index) in recipe.steps" 
                :key="step.id" 
                class="step-item mb-6"
              >
                <div class="d-flex align-start gap-4">
                  <v-avatar color="red" size="32">
                    <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                  </v-avatar>
                  
                  <div class="flex-grow-1">
                    <p class="text-body-1 mb-3">{{ step.content }}</p>
                    
                    <!-- 조리 팁이 있는 경우 -->
                    <v-card 
                      v-if="step.tip" 
                      color="orange-lighten-5" 
                      variant="tonal" 
                      class="pa-3"
                    >
                      <div class="d-flex align-start gap-2">
                        <v-icon color="orange" size="16">mdi-lightbulb</v-icon>
                        <div>
                          <div class="text-caption font-weight-medium text-orange mb-1">
                            조리 팁
                          </div>
                          <p class="text-body-2 mb-0">{{ step.tip }}</p>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </div>
              </div>

              <!-- 전체 요리 팁 -->
              <v-card 
                v-if="recipe.cookingTip" 
                color="yellow-lighten-5" 
                variant="tonal" 
                class="pa-4 mt-6"
              >
                <div class="d-flex align-start gap-2">
                  <v-icon color="orange" size="20">mdi-lightbulb</v-icon>
                  <div>
                    <div class="text-subtitle-2 font-weight-bold text-orange mb-2">
                      요리 팁
                    </div>
                    <p class="text-body-2 mb-0">{{ recipe.cookingTip }}</p>
                  </div>
                </div>
              </v-card>
            </v-card-text>
          </v-card>

          <!-- 댓글 섹션 -->
          <v-card elevation="1">
            <v-card-title class="text-h6 font-weight-bold">
              댓글 ({{ comments.length }})
            </v-card-title>
            <v-card-text>
              <!-- 댓글 작성 -->
              <div class="comment-write mb-6">
                <v-textarea
                  v-model="newComment"
                  placeholder="댓글을 작성해주세요...."
                  variant="outlined"
                  rows="3"
                  class="mb-3"
                />
                <div class="d-flex justify-end">
                  <v-btn 
                    color="primary" 
                    @click="submitComment"
                    :disabled="!newComment.trim()"
                  >
                    댓글 등록
                  </v-btn>
                </div>
              </div>

              <!-- 댓글 목록 -->
              <div class="comments-list">
                <div 
                  v-for="comment in comments" 
                  :key="comment.id"
                  class="comment-item d-flex gap-3 mb-4"
                >
                  <v-avatar size="32" :color="comment.author.role === 'CHEF' ? 'orange' : 'blue'">
                    <span class="text-white font-weight-bold">{{ comment.author.nickname.charAt(0) }}</span>
                  </v-avatar>
                  
                  <div class="flex-grow-1">
                    <div class="d-flex align-center gap-2 mb-1">
                      <span class="font-weight-medium">{{ comment.author.nickname }}</span>
                      <v-chip 
                        v-if="comment.author.role === 'CHEF'"
                        color="primary" 
                        size="x-small"
                      >
                        셰프
                      </v-chip>
                      <span class="text-caption text-grey">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                    <p class="text-body-2 mb-2">{{ comment.content }}</p>
                    
                    <!-- 댓글 액션 -->
                    <div class="d-flex align-center gap-2">
                      <v-btn size="small" variant="text" density="compact">
                        좋아요 {{ comment.likeCount || 0 }}
                      </v-btn>
                      <v-btn size="small" variant="text" density="compact">
                        답글
                      </v-btn>
                    </div>

                    <!-- 대댓글 (답글) -->
                    <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ml-4">
                      <div 
                        v-for="reply in comment.replies" 
                        :key="reply.id"
                        class="d-flex gap-2 mb-3"
                      >
                        <v-avatar size="24" color="orange">
                          <span class="text-white font-weight-bold text-caption">{{ reply.author.nickname.charAt(0) }}</span>
                        </v-avatar>
                        <div class="flex-grow-1">
                          <div class="d-flex align-center gap-2 mb-1">
                            <span class="text-body-2 font-weight-medium">{{ reply.author.nickname }}</span>
                            <v-chip size="x-small" color="orange" variant="tonal">작성자</v-chip>
                            <span class="text-caption text-grey">{{ formatDate(reply.createdAt) }}</span>
                          </div>
                          <p class="text-body-2">{{ reply.content }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 사이드바 -->
        <v-col cols="12" lg="4">
          <div class="sidebar-sticky">
            <!-- 레시피 정보 카드 -->
            <v-card class="mb-4" elevation="1">
              <v-card-title class="text-h6 font-weight-bold">레시피 정보</v-card-title>
              <v-card-text>
                <div class="recipe-stats">
                  <div class="stat-item d-flex justify-space-between py-2">
                    <span class="text-body-2">조리시간</span>
                    <span class="font-weight-medium">{{ recipe.cookTime }}분</span>
                  </div>
                  <div class="stat-item d-flex justify-space-between py-2">
                    <span class="text-body-2">난이도</span>
                    <v-chip size="small" :color="getDifficultyColor(recipe.level)">
                      {{ getDifficultyText(recipe.level) }}
                    </v-chip>
                  </div>
                  <div class="stat-item d-flex justify-space-between py-2">
                    <span class="text-body-2">인분</span>
                    <span class="font-weight-medium">{{ recipe.servings }}인분</span>
                  </div>
                  <div class="stat-item d-flex justify-space-between py-2">
                    <span class="text-body-2">카테고리</span>
                    <v-chip size="small" color="primary" variant="tonal">
                      {{ getCategoryText(recipe.category) }}
                    </v-chip>
                  </div>
                </div>

                <v-divider class="my-4" />

                <!-- 통계 정보 -->
                <div class="interaction-stats">
                  <div class="d-flex justify-space-around text-center">
                    <div>
                      <div class="text-h6 font-weight-bold text-primary">{{ recipe.viewCount || 1239 }}</div>
                      <div class="text-caption text-grey">조회</div>
                    </div>
                    <div>
                      <div class="text-h6 font-weight-bold text-red">{{ recipe.likeCount || 89 }}</div>
                      <div class="text-caption text-grey">좋아요</div>
                    </div>
                    <div>
                      <div class="text-h6 font-weight-bold text-orange">{{ recipe.bookmarkCount || 45 }}</div>
                      <div class="text-caption text-grey">북마크</div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- 관련 레시피 -->
            <v-card elevation="1">
              <v-card-title class="text-h6 font-weight-bold">비슷한 레시피</v-card-title>
              <v-card-text class="pa-2">
                <div 
                  v-for="relatedRecipe in relatedRecipes" 
                  :key="relatedRecipe.id"
                  class="related-recipe-item d-flex gap-3 pa-2 rounded cursor-pointer"
                  @click="goToRecipe(relatedRecipe.id)"
                >
                  <v-img
                    :src="relatedRecipe.thumbnailUrl || '/api/placeholder/60/60'"
                    width="60"
                    height="60"
                    cover
                    class="rounded"
                  />
                  <div class="flex-grow-1">
                    <div class="text-body-2 font-weight-medium line-clamp-2">
                      {{ relatedRecipe.title }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ relatedRecipe.author.nickname }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LikeButton from '@/components/recipe/LikeButton.vue'
import BookmarkButton from '@/components/recipe/BookmarkButton.vue'

const route = useRoute()
const router = useRouter()

const newComment = ref('')
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
  viewCount: 0,
  likeCount: 0,
  bookmarkCount: 0,
  isLiked: false,
  isBookmarked: false,
  cookingTip: '',
  author: {
    id: '',
    nickname: '',
    role: '',
    profileUrl: ''
  },
  ingredients: [],
  steps: []
})

const comments = ref([
  {
    id: 1,
    content: '정말 맛있어 보입니다! 내일 당장 만들어봐야겠어요 ^^',
    author: {
      id: '2',
      nickname: '요리초보자',
      role: 'GENERAL',
      profileUrl: ''
    },
    createdAt: '2024-01-15',
    likeCount: 5,
    replies: [
      {
        id: 11,
        content: '감사합니다! 꼭 만들어보시고 후기 남겨주세요 ㅎㅎ',
        author: {
          id: '1',
          nickname: '김푸드',
          role: 'CHEF',
          profileUrl: ''
        },
        createdAt: '2024-01-15'
      }
    ]
  },
  {
    id: 2,
    content: '와 정말 자세하게 설명되어있네요! 계란 지단만드는 부분에서 좀 헤맸는데 도움 많이 됐습니다',
    author: {
      id: '3',
      nickname: '박요리사',
      role: 'CHEF',
      profileUrl: ''
    },
    createdAt: '2024-01-10',
    likeCount: 1,
    replies: []
  },
  {
    id: 3,
    content: '집에서 김치를 맛나게 먹어보고싶어요',
    author: {
      id: '4',
      nickname: '김주부',
      role: 'GENERAL',
      profileUrl: ''
    },
    createdAt: '2024-01-08',
    likeCount: 0,
    replies: []
  }
])

const relatedRecipes = ref([
  {
    id: 2,
    title: '부드러운 계란탁',
    author: { nickname: '계란전문가' },
    thumbnailUrl: ''
  },
  {
    id: 3,
    title: '알버지를 위한 스시 만들기',
    author: { nickname: '지영인사' },
    thumbnailUrl: ''
  }
])

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

const getCategoryText = (category) => {
  const texts = {
    'KOREAN': '한식',
    'CHINESE': '중식',
    'WESTERN': '양식',
    'JAPANESE': '일식'
  }
  return texts[category] || '기타'
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

const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    // API 호출 예시
    const response = await fetch(`/api/posts/${recipe.postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: newComment.value
      })
    })
    
    if (response.ok) {
      const comment = await response.json()
      comments.value.unshift(comment)
      newComment.value = ''
    }
  } catch (error) {
    console.error('댓글 등록 실패:', error)
  }
}

const goToRecipe = (recipeId) => {
  router.push(`/recipes/${recipeId}`)
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
      viewCount: 100 + (parseInt(recipeId) * 50),
      likeCount: 20 + (parseInt(recipeId) * 10),
      bookmarkCount: 5 + (parseInt(recipeId) * 3),
      isLiked: false,
      isBookmarked: false,
      cookingTip: `레시피 ${recipeId}를 더 맛있게 만드는 팁: 신선한 재료를 사용하고, 정확한 시간을 지켜 조리하세요.`,
      author: {
        id: recipeId,
        nickname: `요리사${recipeId}`,
        role: ['GENERAL', 'CHEF', 'OWNER'][parseInt(recipeId) % 3],
        profileUrl: ''
      },
      ingredients: [
        { id: 1, name: '재료 1', amount: '100g' },
        { id: 2, name: '재료 2', amount: '2개' },
        { id: 3, name: '재료 3', amount: '1큰술' }
      ],
      steps: [
        { 
          id: 1, 
          content: `레시피 ${recipeId}의 첫 번째 단계입니다. 재료를 준비하고 기본적인 조리 과정을 시작합니다.`, 
          tip: '이 단계에서 주의할 점은 재료의 신선도입니다.'
        },
        { 
          id: 2, 
          content: `두 번째 단계에서는 주요 조리 과정을 진행합니다.`, 
          tip: '적절한 온도 조절이 맛의 핵심입니다.'
        },
        { 
          id: 3, 
          content: `마지막 단계에서는 완성된 요리를 예쁘게 담고 마무리합니다.`, 
          tip: '플레이팅도 요리의 일부입니다.'
        }
      ]
    }
    
    Object.assign(recipe, mockData)
    console.log('레시피 데이터 로드 완료:', recipe)
    
  } catch (error) {
    console.error('레시피 로딩 실패:', error)
  }
}

onMounted(() => {
  loadRecipe()
})
</script>

<style scoped>
.hero-image-container {
  position: relative;
  margin-bottom: 0;
  overflow: hidden;
  border-radius: 0;
}

.hero-image {
  width: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hero-image:hover {
  transform: scale(1.02);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .hero-image-container {
    margin: 0 -16px;
  }
  
  .image-overlay {
    padding: 16px;
  }
  
  .recipe-quick-info {
    flex-direction: column;
    gap: 16px;
    padding: 12px 16px;
  }
  
  .hero-actions {
    top: 16px;
    right: 16px;
    gap: 8px;
  }
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.recipe-badge {
  align-self: flex-start;
}

.recipe-quick-info {
  display: flex;
  gap: 24px;
  align-self: flex-end;
  background: rgba(0, 0, 0, 0.6);
  padding: 16px 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.info-item span {
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.hero-actions {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  gap: 12px;
  z-index: 10;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.1);
}

.recipe-header {
  padding-top: 24px;
}

.step-item:last-child {
  margin-bottom: 0;
}

.sidebar-sticky {
  position: sticky;
  top: 24px;
}

.related-recipe-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.comment-item:last-child {
  border-bottom: none;
}
</style>