<template>
  <div class="post-detail-page">
    <v-container class="py-8">
      <v-row>
        <v-col cols="12">
          <!-- 헤더 -->
          <div class="d-flex justify-space-between align-center mb-6">
            <nav class="breadcrumb">
              <span class="text-grey-darken-1">홈</span>
              <v-icon size="16" class="mx-2 text-grey">mdi-chevron-right</v-icon>
              <span class="text-grey-darken-1">레시피</span>
              <v-icon size="16" class="mx-2 text-grey">mdi-chevron-right</v-icon>
              <span class="text-primary font-weight-bold">게시글</span>
            </nav>
            
            <!-- 수정/삭제 버튼 (작성자만 표시) -->
            <div v-if="isAuthor" class="action-buttons">
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="editPost"
                class="mr-2"
              >
                <v-icon size="16" start>mdi-pencil</v-icon>
                수정
              </v-btn>
              <v-btn
                color="error"
                variant="outlined"
                size="small"
                @click="showDeleteModal = true"
              >
                <v-icon size="16" start>mdi-delete</v-icon>
                삭제
              </v-btn>
            </div>
          </div>

          <!-- 게시글 메인 정보 -->
          <v-card elevation="0" class="post-main-card mb-8">
            <div class="post-header">
              <div class="post-title-section">
                <h1 class="text-h3 font-weight-bold mb-3">{{ post.title }}</h1>
                <div class="post-meta d-flex align-center gap-4 mb-4">
                  <v-chip
                    :color="getCategoryColor(post.category)"
                    text-color="white"
                    size="small"
                    class="font-weight-bold"
                  >
                    {{ getCategoryText(post.category) }}
                  </v-chip>
                  <span class="text-body-2 text-grey-darken-1">
                    <v-icon size="16" start>mdi-account</v-icon>
                    {{ post.authorName }}
                  </span>
                  <span class="text-body-2 text-grey-darken-1">
                    <v-icon size="16" start>mdi-calendar</v-icon>
                    {{ formatDate(post.createdAt) }}
                  </span>
                </div>
              </div>
              
              <!-- 썸네일 이미지 -->
              <div class="post-thumbnail">
                <v-img
                  :src="post.thumbnailUrl"
                  height="300"
                  cover
                  class="rounded"
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
              </div>
            </div>

            <!-- 게시글 내용 -->
            <div class="post-content pa-6">
              <p class="text-body-1 mb-6">{{ post.content }}</p>
              
              <!-- 레시피 정보 -->
              <div class="recipe-info mb-6">
                <h3 class="text-h5 font-weight-bold mb-4">레시피 정보</h3>
                <div class="recipe-meta d-flex gap-6 mb-4">
                  <div class="meta-item">
                    <span class="text-caption text-grey-darken-1">인분</span>
                    <div class="text-body-1 font-weight-medium">{{ post.serving }}인분</div>
                  </div>
                  <div class="meta-item">
                    <span class="text-caption text-grey-darken-1">난이도</span>
                    <div class="text-body-1 font-weight-medium">{{ getDifficultyText(post.level) }}</div>
                  </div>
                  <div class="meta-item">
                    <span class="text-caption text-grey-darken-1">조리시간</span>
                    <div class="text-body-1 font-weight-medium">{{ post.cookTime }}분</div>
                  </div>
                </div>
              </div>

              <!-- 재료 -->
              <div class="ingredients-section mb-6">
                <h3 class="text-h5 font-weight-bold mb-4">재료</h3>
                <div class="ingredients-list">
                  <div 
                    v-for="(ingredient, index) in post.ingredients" 
                    :key="index"
                    class="ingredient-item pa-3 mb-2 bg-grey-lighten-5 rounded"
                  >
                    <span class="text-body-1">{{ ingredient.name }}</span>
                    <span class="text-body-2 text-grey-darken-1 ml-2">({{ ingredient.amount }})</span>
                  </div>
                </div>
              </div>

              <!-- 조리 과정 -->
              <div class="cooking-steps-section mb-6">
                <h3 class="text-h5 font-weight-bold mb-4">조리 과정</h3>
                <div class="steps-list">
                  <div 
                    v-for="(step, index) in post.steps" 
                    :key="index"
                    class="step-item d-flex gap-4 mb-6"
                  >
                    <v-avatar color="primary" size="40" class="mt-1">
                      <span class="text-white font-weight-bold text-body-1">{{ index + 1 }}</span>
                    </v-avatar>
                    
                    <div class="step-content flex-grow-1">
                      <div class="step-description mb-3">
                        <p class="text-body-1">{{ step.content }}</p>
                      </div>
                      
                      <!-- 단계별 설명 (있는 경우) -->
                      <div v-if="step.description" class="step-tip pa-3 bg-blue-lighten-5 rounded">
                        <div class="d-flex align-center gap-2 mb-2">
                          <v-icon size="16" color="blue">mdi-lightbulb</v-icon>
                          <span class="text-body-2 font-weight-medium text-blue">팁</span>
                        </div>
                        <p class="text-body-2 text-blue-darken-2 mb-0">{{ step.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 요리 팁 -->
              <div v-if="post.cookTip" class="cooking-tip-section mb-6">
                <h3 class="text-h5 font-weight-bold mb-4">요리 팁</h3>
                <div class="tip-content pa-4 bg-orange-lighten-5 rounded">
                  <div class="d-flex align-center gap-2 mb-2">
                    <v-icon size="20" color="orange">mdi-lightbulb</v-icon>
                    <span class="text-body-1 font-weight-medium text-orange">팁</span>
                  </div>
                  <p class="text-body-1 text-orange-darken-2 mb-0">{{ post.cookTip }}</p>
                </div>
              </div>
            </div>

            <!-- 게시글 하단 정보 -->
            <div class="post-footer pa-6 pt-0">
              <div class="engagement-metrics d-flex align-center gap-6 mb-4">
                <div class="metric-item d-flex align-center gap-2">
                  <v-icon size="20" color="grey-darken-1">mdi-eye</v-icon>
                  <span class="text-body-2 text-grey-darken-1">{{ post.viewCount }}회 조회</span>
                </div>
                <div class="metric-item d-flex align-center gap-2">
                  <v-icon size="20" color="red">mdi-heart</v-icon>
                  <span class="text-body-2 text-grey-darken-1">{{ post.likeCount }}개 좋아요</span>
                </div>
                <div class="metric-item d-flex align-center gap-2">
                  <v-icon size="20" color="blue">mdi-bookmark</v-icon>
                  <span class="text-body-2 text-grey-darken-1">{{ post.bookmarkCount }}개 북마크</span>
                </div>
              </div>

              <!-- 상호작용 버튼 -->
              <div class="interaction-buttons d-flex gap-3">
                <LikeButton 
                  :post-id="post.id"
                  :initial-liked="post.isLiked"
                  @like-updated="updateLikeCount"
                />
                <BookmarkButton 
                  :post-id="post.id"
                  :initial-bookmarked="post.isBookmarked"
                  @bookmark-updated="updateBookmarkCount"
                />
              </div>
            </div>
          </v-card>

          <!-- 댓글 섹션 -->
          <v-card elevation="0" class="comments-section">
            <div class="pa-6">
              <h3 class="text-h5 font-weight-bold mb-4">
                댓글 
                <span class="text-body-2 text-grey-darken-1">({{ post.comments?.length || 0 }})</span>
              </h3>
              
              <!-- 댓글 작성 -->
              <div class="comment-write mb-6">
                <v-textarea
                  v-model="newComment"
                  label="댓글을 작성해주세요"
                  placeholder="레시피에 대한 의견이나 질문을 남겨주세요"
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
                    댓글 작성
                  </v-btn>
                </div>
              </div>

              <!-- 댓글 목록 -->
              <div class="comments-list">
                <div 
                  v-for="comment in post.comments" 
                  :key="comment.id"
                  class="comment-item pa-4 mb-4 bg-grey-lighten-5 rounded"
                >
                  <div class="comment-header d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center gap-2">
                      <v-avatar size="32" color="primary">
                        <span class="text-white text-caption">{{ comment.authorName?.charAt(0) }}</span>
                      </v-avatar>
                      <span class="text-body-2 font-weight-medium">{{ comment.authorName }}</span>
                      <span class="text-caption text-grey-darken-1">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                    
                    <!-- 댓글 액션 버튼들 -->
                    <div class="comment-actions">
                      <!-- 더보기 버튼 -->
                      <v-menu
                        v-model="comment.showMoreMenu"
                        :close-on-content-click="false"
                        location="bottom end"
                      >
                        <template v-slot:activator="{ props }">
                          <v-btn 
                            icon="mdi-dots-vertical"
                            size="small" 
                            variant="text"
                            v-bind="props"
                            class="more-btn"
                          />
                        </template>
                        
                        <v-list density="compact">
                          <!-- 수정 버튼 (작성자만 표시) -->
                          <v-list-item
                            v-if="comment.isAuthor"
                            @click="editComment(comment)"
                            class="edit-menu-item"
                          >
                            <template v-slot:prepend>
                              <v-icon size="16" color="primary">mdi-pencil</v-icon>
                            </template>
                            <v-list-item-title>수정</v-list-item-title>
                          </v-list-item>
                          
                          <!-- 삭제 버튼 (작성자만 표시) -->
                          <v-list-item
                            v-if="comment.isAuthor"
                            @click="deleteComment(comment.id)"
                            class="delete-menu-item"
                          >
                            <template v-slot:prepend>
                              <v-icon size="16" color="error">mdi-delete</v-icon>
                            </template>
                            <v-list-item-title class="text-error">삭제</v-list-item-title>
                          </v-list-item>
                          
                          <!-- 신고 버튼 (모든 사용자에게 표시) -->
                          <v-list-item
                            @click="reportComment(comment)"
                            class="report-menu-item"
                          >
                            <template v-slot:prepend>
                              <v-icon size="16" color="warning">mdi-flag</v-icon>
                            </template>
                            <v-list-item-title class="text-warning">신고</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </div>
                  
                  <div class="comment-content">
                    <p class="text-body-2 mb-0">{{ comment.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 삭제 확인 모달 -->
    <v-dialog v-model="showDeleteModal" max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">게시글 삭제</v-card-title>
        <v-card-text>
          <p class="text-body-1">정말로 이 게시글을 삭제하시겠습니까?</p>
          <p class="text-body-2 text-grey-darken-1">삭제된 게시글은 복구할 수 없습니다.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="showDeleteModal = false">취소</v-btn>
          <v-btn color="error" @click="confirmDelete">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LikeButton from '../../components/recipe/LikeButton.vue'
import BookmarkButton from '../../components/recipe/BookmarkButton.vue'

const route = useRoute()
const router = useRouter()

// 상태 관리
const showDeleteModal = ref(false)
const newComment = ref('')
const isAuthor = ref(false)

// 게시글 데이터
const post = reactive({
  id: '',
  title: '',
  content: '',
  thumbnailUrl: '',
  category: '',
  level: '',
  cookTime: 0,
  serving: 0,
  cookTip: '',
  createdAt: '',
  authorName: '',
  viewCount: 0,
  likeCount: 0,
  bookmarkCount: 0,
  isLiked: false,
  isBookmarked: false,
  ingredients: [],
  steps: [],
  comments: []
})

// 카테고리 색상 매핑
const getCategoryColor = (category) => {
  const colors = {
    'KOREAN': '#ff7a00',
    'CHINESE': '#e74c3c',
    'WESTERN': '#3498db',
    'JAPANESE': '#9b59b6'
  }
  return colors[category] || '#666'
}

// 카테고리 텍스트 매핑
const getCategoryText = (category) => {
  const texts = {
    'KOREAN': '한식',
    'CHINESE': '중식',
    'WESTERN': '양식',
    'JAPANESE': '일식'
  }
  return texts[category] || category
}

// 난이도 텍스트 매핑
const getDifficultyText = (level) => {
  const texts = {
    'VERY_LOW': '매우 쉬움',
    'LOW': '쉬움',
    'MEDIUM': '보통',
    'HIGH': '어려움',
    'VERY_HIGH': '매우 어려움'
  }
  return texts[level] || level
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 메서드들
const editPost = () => {
  router.push(`/recipe/post-write?id=${post.id}`)
}

const confirmDelete = async () => {
  try {
    // TODO: API 호출로 게시글 삭제
    console.log('게시글 삭제:', post.id)
    showDeleteModal.value = false
    router.push('/recipes')
  } catch (error) {
    console.error('게시글 삭제 실패:', error)
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    // TODO: API 호출로 댓글 작성
    const comment = {
      id: Date.now().toString(),
      content: newComment.value,
      authorName: '현재 사용자', // TODO: 실제 사용자 정보 사용
      createdAt: new Date().toISOString(),
      isAuthor: true,
      showMoreMenu: false // 더보기 메뉴 상태
    }
    
    post.comments.unshift(comment)
    newComment.value = ''
  } catch (error) {
    console.error('댓글 작성 실패:', error)
  }
}

const editComment = (comment) => {
  // TODO: 댓글 수정 모달 또는 인라인 편집 구현
  console.log('댓글 수정:', comment)
}

const deleteComment = async (commentId) => {
  try {
    // TODO: API 호출로 댓글 삭제
    const index = post.comments.findIndex(c => c.id === commentId)
    if (index > -1) {
      post.comments.splice(index, 1)
    }
  } catch (error) {
    console.error('댓글 삭제 실패:', error)
  }
}

// 댓글 신고 기능
const reportComment = async (comment) => {
  try {
    const reportReason = prompt('신고 사유를 입력해주세요:')
    if (!reportReason || !reportReason.trim()) {
      return
    }

    // TODO: API 호출로 댓글 신고
    console.log('댓글 신고:', {
      commentId: comment.id,
      reason: reportReason.trim()
    })
    
    alert('신고가 접수되었습니다.')
    // 더보기 메뉴 닫기
    comment.showMoreMenu = false
  } catch (error) {
    console.error('댓글 신고 실패:', error)
    alert('신고 중 오류가 발생했습니다.')
  }
}

const updateLikeCount = (liked) => {
  if (liked) {
    post.likeCount++
    post.isLiked = true
  } else {
    post.likeCount--
    post.isLiked = false
  }
}

const updateBookmarkCount = (bookmarked) => {
  if (bookmarked) {
    post.bookmarkCount++
    post.isBookmarked = true
  } else {
    post.bookmarkCount--
    post.isBookmarked = false
  }
}

// 게시글 데이터 로드
const loadPost = async (postId) => {
  try {
    // TODO: API 호출로 게시글 데이터 로드
    // 임시 데이터 사용
    const mockPost = {
      id: postId,
      title: '오늘 만든 김치찌개 후기',
      content: '신 김치로 만든 얼큰한 김치찌개입니다. 돼지고기를 충분히 볶아서 김치와 함께 끓이니 정말 맛있어요!',
      thumbnailUrl: '/src/assets/images/smu_mascort1.jpg',
      category: 'KOREAN',
      level: 'MEDIUM',
      cookTime: 30,
      serving: 4,
      cookTip: '김치를 넣기 전에 돼지고기를 충분히 볶아주면 더 맛있어요. 그리고 김치국물을 넣을 때는 물을 조금씩 넣어가며 간을 맞춰주세요.',
      createdAt: '2024-01-15T10:00:00Z',
      authorName: '요리마스터',
      viewCount: 156,
      likeCount: 23,
      bookmarkCount: 8,
      isLiked: false,
      isBookmarked: false,
      ingredients: [
        { name: '신김치', amount: '300g' },
        { name: '돼지고기', amount: '200g' },
        { name: '두부', amount: '1모' },
        { name: '대파', amount: '1대' }
      ],
      steps: [
        { 
          content: '돼지고기를 한입 크기로 썰어 준비합니다.',
          description: '고기가 너무 작게 썰리면 맛이 없어질 수 있어요'
        },
        { 
          content: '김치와 김치국물을 준비합니다.',
          description: '김치가 너무 신맛이면 설탕을 조금 넣어주세요'
        },
        { 
          content: '팬에 기름을 두르고 돼지고기를 볶습니다.',
          description: '고기가 완전히 익을 때까지 충분히 볶아주세요'
        },
        { 
          content: '김치를 넣고 함께 볶아줍니다.',
          description: '김치가 너무 눅눅해지지 않도록 주의하세요'
        }
      ],
      comments: [
        {
          id: '1',
          content: '정말 맛있어 보여요! 김치찌개 만들 때 이 팁들을 참고해서 만들어보겠습니다.',
          authorName: '요리초보',
          createdAt: '2024-01-15T11:00:00Z',
          isAuthor: false
        }
      ]
    }
    
    Object.assign(post, mockPost)
    
    // 작성자 여부 확인 (TODO: 실제 사용자 ID와 비교)
    isAuthor.value = true
  } catch (error) {
    console.error('게시글 로드 실패:', error)
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  const postId = route.params.id
  if (postId) {
    loadPost(postId)
  }
})
</script>

<style scoped>
.post-detail-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.text-primary {
  color: #1976d2 !important;
}

.post-main-card {
  background: white;
  border-radius: 12px;
}

.post-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  align-items: start;
  padding: 32px 32px 0;
}

.post-title-section {
  flex: 1;
}

.post-thumbnail {
  min-width: 300px;
}

.post-content {
  border-top: 1px solid #e0e0e0;
}

.recipe-meta {
  display: flex;
  gap: 24px;
}

.meta-item {
  text-align: center;
}

.ingredients-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.steps-list {
  max-width: 800px;
}

.step-item {
  border-left: 3px solid #e0e0e0;
  padding-left: 24px;
  position: relative;
}

.step-item::before {
  content: '';
  position: absolute;
  left: -1.5px;
  top: 0;
  width: 3px;
  height: 100%;
  background: #1976d2;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.step-item:hover::before {
  opacity: 1;
}

.step-tip {
  border-left: 3px solid #2196f3;
}

.cooking-tip-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
}

.tip-content {
  border-left: 4px solid #ff9800;
}

.post-footer {
  border-top: 1px solid #e0e0e0;
}

.engagement-metrics {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interaction-buttons {
  justify-content: center;
}

.comments-section {
  background: white;
  border-radius: 12px;
}

.comment-item {
  border-left: 3px solid #e0e0e0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-actions {
  display: flex;
  gap: 4px;
}

/* 더보기 메뉴 스타일 */
.more-btn {
  color: #666;
}

.more-btn:hover {
  color: #333;
}

.edit-menu-item:hover {
  background-color: #e3f2fd;
}

.delete-menu-item:hover {
  background-color: #ffebee;
}

.report-menu-item:hover {
  background-color: #fff3e0;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .post-header {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .post-thumbnail {
    min-width: auto;
  }
  
  .recipe-meta {
    flex-direction: column;
    gap: 16px;
  }
  
  .ingredients-list {
    grid-template-columns: 1fr;
  }
  
  .step-item {
    padding-left: 16px;
  }
}
</style>
