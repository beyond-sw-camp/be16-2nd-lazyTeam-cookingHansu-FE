<template>
  <div class="recipe-detail-page">
    <Header />
    
    <div class="main-container">
      <div class="back-button-container">
        <v-btn variant="outlined" @click="goBack" prepend-icon="mdi-arrow-left">
          뒤로가기
        </v-btn>
      </div>

      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <p class="mt-4 text-body-1">레시피를 불러오는 중...</p>
      </div>

      <div v-else-if="recipe" class="recipe-content">
        <div class="recipe-main-section">
          <div class="recipe-main-box">
            <div class="recipe-image-container">
      <v-img
                :src="recipe.thumbnailUrl || defaultThumbnail"
                height="400"
        cover
                class="recipe-image"
            />
          </div>
            
            <div class="recipe-info">
              <div class="recipe-header">
                <div class="title-section">
                  <div class="title-row">
                    <div class="title-left">
                      <h1 class="recipe-title">{{ recipe.title }}</h1>
                    </div>
                    <v-chip 
                      :color="getCategoryColor(recipe.category)" 
                      size="small" 
                      class="category-chip"
                    >
                      {{ getCategoryText(recipe.category) }}
            </v-chip>
          </div>
                  <p class="recipe-subtitle">{{ recipe.description }}</p>
                  
                  <!-- 작성자 정보 (제목 아래로 이동) -->
                  <div class="author-info-section">
                    <v-avatar size="48" color="orange" class="author-avatar">
                      <v-img 
                        v-if="recipe.profileImageUrl" 
                        :src="recipe.profileImageUrl" 
                        :alt="recipe.nickname"
                        cover
                      />
                      <span v-else class="text-caption text-white font-weight-bold">
                        {{ getAuthorInitial(recipe.nickname) }}
                      </span>
                    </v-avatar>
                    <div class="author-details">
                      <div class="author-name-main">{{ recipe.nickname || '작성자' }}</div>
                      <div class="author-role-main">{{ getUserTypeText(recipe.role) }}</div>
                    </div>
                  </div>
                  
                  <!-- 수정/삭제 버튼들 (작성자만 보임) -->
                  <div v-if="isAuthor" class="action-buttons">
                                          <v-btn 
                        color="success" 
                        variant="outlined" 
                        @click="editRecipe"
                        class="edit-btn"
                        size="x-small"
                      >
                        <v-icon start size="14">mdi-pencil</v-icon>
                        수정
                      </v-btn>
                      <v-btn 
                        color="error" 
                        variant="outlined" 
                        @click="confirmDelete"
                        class="delete-btn"
                        size="x-small"
                      >
                        <v-icon start size="12">mdi-delete</v-icon>
                        삭제
                      </v-btn>
            </div>
            </div>
            </div>
              
              <!-- 좋아요, 북마크, 조회수 카운트 -->
              <div class="engagement-stats">
                <div class="stat-item" :class="{ clickable: isLoggedIn }" @click="isLoggedIn ? toggleLike() : showLoginAlert()">
                  <v-icon :color="isLiked ? 'red' : 'grey'" size="20">mdi-heart</v-icon>
                  <span class="stat-count">{{ recipe.likeCount || 0 }}</span>
          </div>
                <div class="stat-item" :class="{ clickable: isLoggedIn }" @click="isLoggedIn ? toggleBookmark() : showLoginAlert()">
                  <v-icon :color="isBookmarked ? 'blue' : 'grey'" size="20">mdi-bookmark</v-icon>
                  <span class="stat-count">{{ recipe.bookmarkCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <v-icon color="grey" size="20">mdi-eye</v-icon>
                  <span class="stat-count">{{ recipe.viewCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <v-icon color="grey" size="20">mdi-comment</v-icon>
                  <span class="stat-count">{{ getTotalCommentCount() }}</span>
        </div>
      </div>
      
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
                      <div class="difficulty-text">
                        {{ getDifficultyText(recipe.level) }}
                      </div>
      </div>
    </div>

                  <div class="meta-item">
                    <div class="meta-label">인분</div>
                    <div class="meta-value">{{ recipe.serving }}인분</div>
                  </div>
                  
                  <div class="meta-item">
                    <div class="meta-label">조회수</div>
                    <div class="meta-value">{{ recipe.viewCount || 0 }}회</div>
                  </div>
                </div>
              </div>
            </div>
              </div>
            </div>

        <!-- 재료와 조리과정 섹션 -->
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
                    <p class="step-description">{{ step.content }}</p>
                    <p v-if="step.description" class="step-subtitle">{{ step.description }}</p>
                  </div>
                </div>
              </div>

              <!-- 요리 팁 -->
              <div v-if="recipe.cookTip" class="cooking-tip-section">
                <h3 class="tip-title">요리 팁</h3>
                <p class="tip-content">{{ recipe.cookTip }}</p>
                    </div>
                  </div>
                </div>
        </div>
        

        
        <div class="comments-section">
          <h3 class="comments-title">댓글 ({{ getTotalCommentCount() }})</h3>
          
          <!-- 댓글 작성 폼 (로그인한 사용자만 보임) -->
          <div v-if="isLoggedIn" class="comment-form">
                <v-textarea
                  v-model="newComment"
                  placeholder="댓글을 작성해주세요...."
                  variant="outlined"
                  rows="3"
              hide-details
              class="comment-input"
            ></v-textarea>
                  <v-btn 
                    color="primary" 
                    @click="submitComment"
                    :disabled="!newComment.trim()"
              class="comment-submit-btn"
                  >
                    댓글 등록
                  </v-btn>
                </div>
          
          <!-- 비로그인 사용자에게 로그인 안내 -->
          <div v-else class="login-notice">
            <p>댓글을 작성하려면 <button @click="goToLogin" class="login-link">로그인</button>이 필요합니다.</p>
              </div>

              <div class="comments-list">
                <div 
                  v-for="comment in comments" 
                  :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <div class="comment-info">
                  <v-avatar size="32" color="orange" class="mr-2">
                    <v-img 
                      v-if="comment.profileImage" 
                      :src="comment.profileImage" 
                      :alt="comment.nickname"
                      cover
                    />
                    <span v-else class="text-caption text-white font-weight-bold">
                      {{ getAuthorInitial(comment.nickname) }}
                    </span>
                  </v-avatar>
                  <div class="author-info">
                    <div class="author-name">{{ comment.nickname }}</div>
                    <div class="comment-time">{{ formatDate(comment.createdAt) }}</div>
                  </div>
                </div>
                <div class="comment-actions">
                  <v-btn 
                    icon 
                    size="small" 
                    variant="text"
                    @click="toggleCommentLike(comment)"
                    :color="comment.isLiked ? 'red' : 'grey'"
                  >
                    <v-icon size="16">mdi-heart</v-icon>
                  </v-btn>
                  <span class="like-count">{{ comment.likeCount || 0 }}</span>
                  <v-btn 
                    size="small" 
                    variant="text"
                    @click="showReplyForm(comment)"
                    class="reply-btn"
                  >
                    답글
                  </v-btn>
                  
                  <!-- 더보기 버튼 -->
                  <v-menu
                    v-model="comment.showMoreMenu"
                    :close-on-content-click="false"
                    location="bottom end"
                  >
                    <template v-slot:activator="{ props }">
                      <v-btn 
                        icon 
                        size="small" 
                        variant="text"
                        v-bind="props"
                        class="more-btn"
                      >
                        <v-icon size="16">mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    
                    <v-list density="compact">
                      <!-- 수정 버튼 (작성자만 표시) -->
                      <v-list-item
                        v-if="currentUser && currentUser.nickname === comment.nickname"
                        @click="startEditComment(comment)"
                        class="edit-menu-item"
                      >
                        <template v-slot:prepend>
                          <v-icon size="16" color="primary">mdi-pencil</v-icon>
                        </template>
                        <v-list-item-title>수정</v-list-item-title>
                      </v-list-item>
                      
                      <!-- 삭제 버튼 (작성자만 표시) -->
                      <v-list-item
                        v-if="currentUser && currentUser.nickname === comment.nickname"
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
              
              <!-- 댓글 내용 (수정 모드가 아닐 때) -->
              <div v-if="!comment.isEditing" class="comment-content">
                <div v-if="comment.isDeleted" class="deleted-comment">
                  <em>삭제된 댓글입니다.</em>
                </div>
                <div v-else>
                  {{ comment.content }}
                </div>
              </div>
              
              <!-- 댓글 수정 폼 (수정 모드일 때) -->
              <div v-if="comment.isEditing" class="comment-edit-form">
                <v-textarea
                  v-model="comment.editText"
                  placeholder="댓글을 수정해주세요...."
                  variant="outlined"
                  rows="2"
                  hide-details
                  class="comment-edit-input"
                ></v-textarea>
                <div class="comment-edit-actions">
                  <v-btn 
                    size="small" 
                    variant="outlined"
                    @click="cancelEditComment(comment)"
                  >
                    취소
                  </v-btn>
                  <v-btn 
                    size="small" 
                    color="primary"
                    @click="saveEditComment(comment)"
                    :disabled="!comment.editText.trim()"
                  >
                    저장
                  </v-btn>
                </div>
              </div>
              
              <div v-if="comment.showReplyForm" class="reply-form">
                <v-textarea
                  v-model="comment.replyText"
                  placeholder="답글을 작성해주세요...."
                  variant="outlined"
                  rows="2"
                  hide-details
                  class="reply-input"
                ></v-textarea>
                <div class="reply-actions">
                  <v-btn 
                    size="small" 
                    variant="outlined"
                    @click="cancelReply(comment)"
                  >
                    취소
                      </v-btn>
                  <v-btn 
                    size="small" 
                    color="primary"
                    @click="submitReply(comment)"
                    :disabled="!comment.replyText.trim()"
                  >
                    답글 등록
                      </v-btn>
                </div>
                    </div>

              <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                      <div 
                        v-for="reply in comment.replies" 
                        :key="reply.id"
                  class="reply-item"
                >
                  <div class="reply-header">
                    <div class="reply-info">
                      <v-avatar size="24" color="orange" class="mr-2">
                        <v-img 
                          v-if="reply.profileImage" 
                          :src="reply.profileImage" 
                          :alt="reply.nickname"
                          cover
                        />
                        <span v-else class="text-caption text-white font-weight-bold">
                          {{ getAuthorInitial(reply.nickname) }}
                        </span>
                      </v-avatar>
                      <div class="author-info">
                        <div class="author-name">{{ reply.nickname }}</div>
                        <div class="reply-time">{{ formatDate(reply.createdAt) }}</div>
                      </div>
                    </div>
                    
                    <div class="reply-actions">
                      <!-- 답글 더보기 버튼 -->
                      <v-menu
                        v-model="reply.showMoreMenu"
                        :close-on-content-click="false"
                        location="bottom end"
                      >
                        <template v-slot:activator="{ props }">
                          <v-btn 
                            icon 
                            size="small" 
                            variant="text"
                            v-bind="props"
                            class="more-btn"
                          >
                            <v-icon size="16">mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        
                        <v-list density="compact">
                          <!-- 수정 버튼 (작성자만 표시) -->
                          <v-list-item
                            v-if="currentUser && currentUser.nickname === reply.nickname"
                            @click="startEditComment(reply)"
                            class="edit-menu-item"
                          >
                            <template v-slot:prepend>
                              <v-icon size="16" color="primary">mdi-pencil</v-icon>
                            </template>
                            <v-list-item-title>수정</v-list-item-title>
                          </v-list-item>
                          
                          <!-- 삭제 버튼 (작성자만 표시) -->
                          <v-list-item
                            v-if="currentUser && currentUser.nickname === reply.nickname"
                            @click="deleteComment(reply.id)"
                            class="delete-menu-item"
                          >
                            <template v-slot:prepend>
                              <v-icon size="16" color="error">mdi-delete</v-icon>
                            </template>
                            <v-list-item-title class="text-error">삭제</v-list-item-title>
                          </v-list-item>
                          
                          <!-- 신고 버튼 (모든 사용자에게 표시) -->
                          <v-list-item
                            @click="reportComment(reply)"
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
                  
                  <div class="reply-content">
                    <div v-if="reply.isDeleted" class="deleted-comment">
                      <em>삭제된 답글입니다.</em>
                    </div>
                    <div v-else>
                      {{ reply.content }}
                    </div>
                  </div>
                </div>
                  </div>
                </div>
              </div>
          
          <div v-if="comments.length > 5" class="load-more-comments">
            <v-btn variant="outlined" @click="loadMoreComments">
              댓글 더보기▼
            </v-btn>
                  </div>
                </div>

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

      <div v-else-if="error" class="text-center py-12">
        <v-alert type="error" class="mb-4">
          {{ error }}
        </v-alert>
        <v-btn color="primary" @click="loadRecipe">다시 시도</v-btn>
                          </div>
    </div>
    
    <!-- 로그인 필요 모달 -->
    <CommonModal
      v-model="showLoginModal"
      type="info"
      title="로그인이 필요합니다"
      message="이 기능을 사용하려면 로그인이 필요합니다. 로그인하시겠습니까?"
      confirm-text="로그인하기"
      cancel-text="취소"
      @confirm="goToLogin"
      @cancel="closeLoginModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import CommonModal from '@/components/common/CommonModal.vue'

const route = useRoute()
const router = useRouter()

// 기본 썸네일 이미지
const defaultThumbnail = '/src/assets/images/smu_mascort1.jpg'

const loading = ref(true)
const error = ref(null)
const showDeleteModal = ref(false)
const newComment = ref('')
const currentUser = ref(null)
const showLoginModal = ref(false)

// 로그인 상태 확인
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('accessToken')
})

// 현재 사용자가 작성자인지 확인
const isAuthor = computed(() => {
  if (!recipe.nickname || !currentUser.value) return false
  return currentUser.value.nickname === recipe.nickname
})

// 좋아요, 북마크 상태
const isLiked = ref(false)
const isBookmarked = ref(false)

const comments = ref([])

const recipe = reactive({
  id: '',
  title: '',
  description: '',
  thumbnailUrl: '',
  cookTime: 0,
  serving: 0,
  level: 'MEDIUM',
  category: 'KOREAN',
  ingredients: [],
  steps: [],
  likeCount: 0,
  bookmarkCount: 0,
  viewCount: 0,
    nickname: '',
  role: ''
})

const getDifficultyText = (level) => {
  const levels = {
    'VERY_LOW': '매우 쉬움',
    'LOW': '쉬움',
    'MEDIUM': '보통',
    'HIGH': '어려움',
    'VERY_HIGH': '매우 어려움'
  }
  return levels[level] || '보통'
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
    'KOREAN': '#ff7a00',
    'CHINESE': '#ff3b3b',
    'WESTERN': '#007aff',
    'JAPANESE': '#00b86b'
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

const getUserTypeText = (role) => {
  const texts = {
    'GENERAL': '일반 사용자',
    'CHEF': '요리 전문가',
    'OWNER': '자영업자'
  }
  return texts[role] || '일반 사용자'
}

const getAuthorInitial = (nickname) => {
  return nickname ? nickname.charAt(0) : 'U'
}



const formatDate = (date) => {
  if (!date) return '방금 전'
  
  // 문자열을 Date 객체로 변환
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return '방금 전'
  
  const now = new Date()
  const diffInMinutes = Math.floor((now - dateObj) / (1000 * 60))
  
  if (diffInMinutes < 1) return '방금 전'
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}시간 전`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}일 전`
  
  return dateObj.toLocaleDateString('ko-KR')
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  console.log('댓글 제출 시작:', {
    postId: recipe.id,
    content: newComment.value,
    token: localStorage.getItem('accessToken') ? '있음' : '없음'
  })
  
  try {
    const response = await fetch('http://localhost:8080/post/comment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({
        postId: recipe.id,
        content: newComment.value
      })
    })

    console.log('댓글 생성 응답 상태:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('댓글 생성 성공:', data)
      
      // 댓글 목록 새로고침
      await loadComments()
      newComment.value = ''
      alert('댓글이 등록되었습니다!')
    } else {
      const errorData = await response.text()
      console.error('댓글 생성 실패:', response.status, errorData)
      alert('댓글 등록에 실패했습니다.')
    }
  } catch (error) {
    console.error('댓글 생성 에러:', error)
    alert('댓글 등록 중 오류가 발생했습니다.')
  }
}

const toggleCommentLike = (comment) => {
  comment.isLiked = !comment.isLiked
  comment.likeCount += comment.isLiked ? 1 : -1
}

const showReplyForm = (comment) => {
  comment.showReplyForm = true
  comment.replyText = ''
}

const cancelReply = (comment) => {
  comment.showReplyForm = false
  comment.replyText = ''
}

const submitReply = async (comment) => {
  if (!comment.replyText.trim()) return
  
  try {
    const response = await fetch('http://localhost:8080/post/comment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({
        postId: recipe.id,
        content: comment.replyText,
        parentCommentId: comment.id // 대댓글인 경우 부모 댓글 ID
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log('대댓글 생성 성공:', data)
      
      // 댓글 목록 새로고침
      await loadComments()
      comment.showReplyForm = false
      comment.replyText = ''
      alert('답글이 등록되었습니다!')
    } else {
      const errorData = await response.text()
      console.error('대댓글 생성 실패:', response.status, errorData)
      alert('답글 등록에 실패했습니다.')
    }
  } catch (error) {
    console.error('대댓글 생성 에러:', error)
    alert('답글 등록 중 오류가 발생했습니다.')
  }
}

const loadMoreComments = () => {
  console.log('댓글 더 로드')
}

// 댓글 삭제
const deleteComment = async (commentId) => {
  if (!confirm('댓글을 삭제하시겠습니까?')) return
  
  // 답글이 있는 댓글인지 미리 확인
  const commentToDelete = comments.value.find(comment => comment.id === commentId)
  const hasReplies = commentToDelete && commentToDelete.replies && commentToDelete.replies.length > 0
  
  console.log('삭제할 댓글:', commentToDelete)
  console.log('답글이 있는지:', hasReplies)
  console.log('답글 개수:', commentToDelete?.replies?.length || 0)
  
  try {
    const response = await fetch(`http://localhost:8080/post/comment/delete/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (response.ok) {
      console.log('댓글 삭제 성공')
      
      if (hasReplies) {
        // 답글이 있으면 삭제 상태만 표시
        const commentIndex = comments.value.findIndex(comment => comment.id === commentId)
        if (commentIndex !== -1) {
          // Vue 반응성을 위해 새로운 객체로 교체
          comments.value[commentIndex] = {
            ...comments.value[commentIndex],
            isDeleted: true,
            content: ''
          }
        }
        console.log('답글이 있는 댓글 삭제 처리 완료')
        console.log('삭제 처리 후 댓글 상태:', comments.value[commentIndex])
        console.log('isDeleted 값:', comments.value[commentIndex]?.isDeleted)
        alert('댓글이 삭제되었습니다. 답글은 그대로 유지됩니다.')
      } else {
        // 답글이 없으면 댓글 목록 새로고침
        await loadComments()
        alert('댓글이 삭제되었습니다!')
      }
    } else {
      const errorData = await response.text()
      console.error('댓글 삭제 실패:', response.status, errorData)
      console.error('삭제하려는 댓글 ID:', commentId)
      console.error('댓글에 답글이 있는지:', hasReplies)
      
      // 백엔드 에러 메시지 표시
      let errorMessage = '댓글 삭제에 실패했습니다.'
      try {
        const errorJson = JSON.parse(errorData)
        if (errorJson.message) {
          errorMessage = errorJson.message
        }
      } catch (e) {
        // JSON 파싱 실패 시 원본 텍스트 사용
        if (errorData) {
          errorMessage = errorData
        }
      }
      
      alert(`댓글 삭제 실패: ${errorMessage}`)
    }
  } catch (error) {
    console.error('댓글 삭제 에러:', error)
    alert('댓글 삭제 중 오류가 발생했습니다.')
  }
}

// 댓글 수정 시작
const startEditComment = (comment) => {
  comment.isEditing = true
  comment.editText = comment.content // 현재 내용을 수정 폼에 설정
}

// 댓글 수정 취소
const cancelEditComment = (comment) => {
  comment.isEditing = false
  comment.editText = ''
}

// 댓글 수정 저장
const saveEditComment = async (comment) => {
  if (!comment.editText.trim()) return
  
  try {
    const response = await fetch(`http://localhost:8080/post/comment/update/${comment.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({
        content: comment.editText
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log('댓글 수정 성공:', data)
      
      // 댓글 내용 업데이트
      comment.content = comment.editText
      comment.isEditing = false
      comment.editText = ''
      alert('댓글이 수정되었습니다!')
    } else {
      const errorData = await response.text()
      console.error('댓글 수정 실패:', response.status, errorData)
      alert('댓글 수정에 실패했습니다.')
    }
  } catch (error) {
    console.error('댓글 수정 에러:', error)
    alert('댓글 수정 중 오류가 발생했습니다.')
  }
}

// 전체 댓글수 계산 (댓글 + 대댓글)
const getTotalCommentCount = () => {
  let totalCount = comments.value.length
  
  comments.value.forEach(comment => {
    if (comment.replies && Array.isArray(comment.replies)) {
      totalCount += comment.replies.length
    }
  })
  
  return totalCount
}

// 댓글 목록 로드
const loadComments = async () => {
  console.log('댓글 목록 로드 시작, postId:', recipe.id)
  
  try {
    // 댓글 목록은 권한 없이도 조회 가능하도록 헤더를 선택적으로 설정
    const headers = {}
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`http://localhost:8080/post/comment/list/${recipe.id}`, {
      headers
    })

    console.log('댓글 목록 응답 상태:', response.status, response.statusText)

    if (response.ok) {
      const data = await response.json()
      console.log('댓글 목록 로드 성공:', data)
      
      if (data.data) {
        comments.value = data.data.map(comment => {
          console.log('댓글 원본 데이터:', comment)
          console.log('댓글 날짜:', comment.createdAt, '타입:', typeof comment.createdAt)
          console.log('대댓글 데이터:', comment.childComments)
          console.log('대댓글 필드들:', Object.keys(comment))
          
          return {
            id: comment.commentId || comment.id,
            nickname: comment.authorNickName || comment.nickname,
            content: comment.content,
            createdAt: comment.createdAt,
            likeCount: comment.likeCount || 0,
            isLiked: comment.isLiked || false,
            isDeleted: comment.isDeleted || false, // 삭제 상태 추가
            showMoreMenu: false, // 더보기 메뉴 상태
            profileImage: comment.authorProfileImage,
            replies: comment.childComments ? comment.childComments.map(reply => ({
              id: reply.commentId || reply.id,
              nickname: reply.authorNickName || reply.nickname,
              content: reply.content,
              createdAt: reply.createdAt,
              likeCount: reply.likeCount || 0,
              isLiked: reply.isLiked || false,
              isDeleted: reply.isDeleted || false, // 답글 삭제 상태도 추가
              profileImage: reply.authorProfileImage,
              showMoreMenu: false // 더보기 메뉴 상태
            })) : []
          }
        })
        console.log('댓글 목록 변환 완료:', comments.value)
      } else {
        console.log('댓글 데이터가 없음')
        comments.value = []
      }
    } else {
      const errorData = await response.text()
      console.error('댓글 목록 로드 실패:', response.status, errorData)
    }
  } catch (error) {
    console.error('댓글 목록 로드 에러:', error)
  }
}

// 좋아요 토글
const toggleLike = async () => {
  try {
    const response = await fetch(`http://localhost:8080/api/interactions/posts/${recipe.id}/likes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (response.ok) {
      isLiked.value = !isLiked.value
      if (isLiked.value) {
        recipe.likeCount = (recipe.likeCount || 0) + 1
      } else {
        recipe.likeCount = Math.max(0, (recipe.likeCount || 0) - 1)
      }
      console.log('좋아요 토글 성공:', isLiked.value)
    } else {
      console.error('좋아요 토글 실패')
    }
  } catch (error) {
    console.error('좋아요 토글 에러:', error)
  }
}

// 북마크 토글
const toggleBookmark = async () => {
  try {
    const response = await fetch(`http://localhost:8080/api/interactions/posts/${recipe.id}/bookmarks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (response.ok) {
      isBookmarked.value = !isBookmarked.value
      if (isBookmarked.value) {
        recipe.bookmarkCount = (recipe.bookmarkCount || 0) + 1
      } else {
        recipe.bookmarkCount = Math.max(0, (recipe.bookmarkCount || 0) - 1)
      }
      console.log('북마크 토글 성공:', isBookmarked.value)
    } else {
      console.error('북마크 토글 실패')
    }
  } catch (error) {
    console.error('북마크 토글 에러:', error)
  }
}

const loadRecipe = async () => {
  try {
    loading.value = true
    error.value = null
    
    const recipeId = route.params.id
    console.log('레시피 ID:', recipeId)
    
    // 조회수 증가 (로그인한 사용자만)
    if (isLoggedIn.value) {
      try {
        await fetch(`http://localhost:8080/api/interactions/posts/${recipeId}/views`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
      } catch (error) {
        console.log('조회수 증가 실패 (무시)', error)
      }
    }
    
    console.log('🔍 상세 조회 API 호출:', `http://localhost:8080/api/posts/${recipeId}`)
    
    // 상세 조회는 권한 없이도 가능하도록 헤더를 선택적으로 설정
    const headers = {}
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // 백엔드 API 경로를 여러 개 시도해보기
    let response
    let apiUrl = `http://localhost:8080/api/posts/${recipeId}`
    
    console.log('🔄 첫 번째 시도:', apiUrl)
    response = await fetch(apiUrl, { headers })
    
    if (!response.ok) {
      console.log('🔄 두 번째 시도: /api/posts/detail/{id}')
      apiUrl = `http://localhost:8080/api/posts/detail/${recipeId}`
      response = await fetch(apiUrl, { headers })
      
      if (!response.ok) {
        console.log('❌ 두 번째 시도 실패:', response.status, response.statusText)
        try {
          const errorText = await response.text()
          console.log('❌ 에러 상세:', errorText)
        } catch (e) {
          console.log('❌ 에러 상세 읽기 실패:', e)
        }
      }
    }
    
    if (!response.ok) {
      console.log('🔄 세 번째 시도: /api/recipes/{id}')
      apiUrl = `http://localhost:8080/api/recipes/${recipeId}`
      response = await fetch(apiUrl, { headers })
      
      if (!response.ok) {
        console.log('❌ 세 번째 시도 실패:', response.status, response.statusText)
        try {
          const errorText = await response.text()
          console.log('❌ 에러 상세:', errorText)
        } catch (e) {
          console.log('❌ 에러 상세 읽기 실패:', e)
        }
      }
    }
    
    console.log('📡 최종 응답 상태:', response.status, response.statusText, 'URL:', apiUrl)
    
    console.log('📡 상세 조회 응답 상태:', response.status, response.statusText)

    if (response.ok) {
      const data = await response.json()
      console.log('레시피 상세 응답:', data)
      
      if (data.data) {
        Object.assign(recipe, {
          id: data.data.id,
          title: data.data.title,
          description: data.data.description,
          category: data.data.category,
          level: data.data.level,
          cookTime: data.data.cookTime,
          serving: data.data.serving,
          cookTip: data.data.cookTip,
          thumbnailUrl: data.data.thumbnailUrl,
          likeCount: data.data.likeCount,
          viewCount: data.data.viewCount,
          bookmarkCount: data.data.bookmarkCount,
          isOpen: data.data.isOpen,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
          nickname: data.data.user?.nickname,
          role: data.data.user?.role,
          profileImageUrl: data.data.user?.profileImageUrl,
          ingredients: data.data.ingredients || [],
          steps: data.data.steps || []
        })
        
        // 댓글 목록 로드
        await loadComments()
      } else {
        throw new Error('레시피 데이터가 없습니다.')
      }
    } else {
      throw new Error('레시피를 불러올 수 없습니다.')
    }
  } catch (err) {
    console.error('레시피 로딩 실패:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const editRecipe = () => {
  router.push({ path: '/recipe/post-edit', query: { id: recipe.id } })
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deleteRecipe = async () => {
  try {
    console.log('🗑️ 삭제 API 호출:', `http://localhost:8080/api/posts/${recipe.id}`)
    
    const response = await fetch(`http://localhost:8080/api/posts/${recipe.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    
    console.log('📡 삭제 응답 상태:', response.status, response.statusText)

    if (response.ok) {
      alert('레시피가 삭제되었습니다.')
      router.push('/recipes')
    } else {
      throw new Error('삭제에 실패했습니다.')
    }
  } catch (err) {
    console.error('레시피 삭제 실패:', err)
    alert(err.message)
  } finally {
    showDeleteModal.value = false
  }
}

const showLoginAlert = () => {
  showLoginModal.value = true
}

const closeLoginModal = () => {
  showLoginModal.value = false
}

const goToLogin = () => {
  closeLoginModal()
  router.push('/login')
}

// 댓글 신고 기능
const reportComment = async (comment) => {
  try {
    if (!currentUser.value) {
      alert('로그인이 필요합니다.')
      return
    }

    const reportReason = prompt('신고 사유를 입력해주세요:')
    if (!reportReason || !reportReason.trim()) {
      return
    }

    const response = await fetch('http://localhost:8080/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({
        targetType: 'COMMENT',
        targetId: comment.id,
        reason: reportReason.trim()
      })
    })

    if (response.ok) {
      alert('신고가 접수되었습니다.')
      // 더보기 메뉴 닫기
      comment.showMoreMenu = false
    } else {
      const errorData = await response.text()
      console.error('신고 실패:', response.status, errorData)
      alert('신고 접수에 실패했습니다.')
    }
  } catch (error) {
    console.error('신고 에러:', error)
    alert('신고 중 오류가 발생했습니다.')
  }
}

const goBack = () => {
  router.go(-1)
}

onMounted(async () => {
  await loadCurrentUser()
  await loadRecipe()
})

// 현재 사용자 정보 로드
const loadCurrentUser = async () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    // 비회원인 경우 사용자 정보를 로드하지 않음
    currentUser.value = null
    return
  }
  
  try {
    const response = await fetch('http://localhost:8080/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      currentUser.value = data.data
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error)
    currentUser.value = null
  }
}
</script>

<style scoped>
.recipe-detail-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-top: 80px;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.back-button-container {
  margin: 20px 0;
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
  padding: 35px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin-left: 60px;
  width: 100%;
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
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 15px;
  width: 100%;
}

.title-section {
  flex: 1;
  width: 100%;
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

.recipe-subtitle {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.8;
  margin-bottom: 15px;
  max-width: 100%;
}

.action-buttons {
  display: flex;
    gap: 8px;
  flex-shrink: 0;
  min-width: 140px;
  justify-content: flex-end;
  margin-top: 15px;
}

.edit-btn, .delete-btn {
  flex: 0 0 auto;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.3s ease;
  min-width: 60px;
  color: #fff !important;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
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

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.author-avatar {
  flex-shrink: 0;
}

.author-details {
  flex: 1;
}

.author-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.author-role {
  font-size: 0.9rem;
  color: #666;
}

.engagement-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 8px;
}

.stat-item.clickable:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.stat-count {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.recipe-meta-info {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

/* 타이틀 행 */
.title-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 10px;
}

.title-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recipe-title {
  margin-bottom: 0;
}

.author-simple {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-name-simple {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
}

.author-role-simple {
  font-size: 0.8rem;
  color: #999;
  padding: 2px 6px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.category-chip {
  flex-shrink: 0;
}

/* 재료와 조리과정 컨테이너 */
.recipe-detail-content {
  background-color: #fff;
  border-radius: 12px;
  padding: 35px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  margin-left: 60px;
  max-width: 1000px;
  overflow: hidden;
}

.detail-sections-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  flex-wrap: nowrap;
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

.difficulty-text {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}



.ingredients-section {
  flex: 0 0 280px;
  min-width: 280px;
  max-width: 280px;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.cooking-steps-section {
  flex: 2;
  min-width: 500px;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
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
  border-bottom: 2px solid #f44336;
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
  width: 35px;
  height: 35px;
  background-color: #f44336;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
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
  margin-bottom: 8px;
}

.step-subtitle {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  margin: 8px 0 0 0;
  font-style: italic;
  padding-left: 8px;
  border-left: 2px solid #f44336;
}

.cooking-tip-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #fffbe6;
  border-radius: 10px;
  border: 1px solid #ffe6b3;
}

.tip-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.tip-content {
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
}



.comments-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 35px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  margin-left: 60px;
  max-width: 1000px;
}

.comments-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.comment-form {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  align-items: flex-start;
}

.comment-input {
  flex: 1;
}

.comment-submit-btn {
  flex-shrink: 0;
  min-width: 120px;
}

.login-notice {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.login-notice p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.login-link {
  background: none;
  border: none;
  color: #ff7a00;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
}

.login-link:hover {
  color: #e65c00;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  /* 테두리 제거 */
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.comment-time {
  font-size: 0.8rem;
  color: #666;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.like-count {
  font-size: 0.9rem;
  color: #666;
  min-width: 20px;
}

.reply-btn {
  font-size: 0.8rem;
  color: #666;
}

.delete-btn {
  font-size: 0.8rem;
  color: #dc3545;
}

.delete-btn:hover {
  background-color: #f8d7da;
  border-radius: 4px;
}

.comment-content {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 15px;
}

.deleted-comment {
  color: #999;
  font-style: italic;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 6px;
  border-left: 3px solid #ddd;
}

.reply-form {
  margin: 15px 0;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.reply-input {
  margin-bottom: 10px;
}

.reply-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.replies-list {
  margin-top: 15px;
  margin-left: 40px;
}

.reply-item {
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  /* 테두리 제거 */
  margin-bottom: 10px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.reply-author-info {
  display: flex;
  flex-direction: column;
}

.reply-author-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.reply-time {
  font-size: 0.7rem;
  color: #666;
}

.reply-content {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
}

.load-more-comments {
  text-align: center;
  margin-top: 20px;
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
    padding: 30px;
  }
  
  .recipe-detail-content {
    max-width: 100%;
    margin-left: 0;
    padding: 30px;
  }
  
  .comments-section {
    max-width: 100%;
    margin-left: 0;
    padding: 30px;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 0 20px;
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
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .step-number {
    align-self: center;
  }
  
  .comment-form {
    flex-direction: column;
    gap: 10px;
  }
  
  .comment-submit-btn {
    align-self: flex-end;
  }
  
  .comment-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .comment-actions {
  align-self: flex-start;
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

/* 댓글 헤더 스타일 */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  width: 100%;
}

.comment-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

/* 답글 헤더 스타일 - 댓글과 동일한 구조 */
.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  width: 100%;
}

.reply-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

/* 작성자 정보 섹션 스타일 */
.author-info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.author-avatar {
  margin-bottom: 4px;
}

.author-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.author-name-main {
  font-weight: 700;
  color: #333;
  font-size: 18px;
  line-height: 1.2;
}

.author-role-main {
  color: #666;
  font-size: 14px;
  font-weight: 500;
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
  
  .comments-section {
    padding: 20px;
    max-width: 100%;
    margin-left: 0;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .ingredients-section {
    min-width: auto;
    max-width: 100%;
    flex: 1;
  }
  
  .cooking-steps-section {
    min-width: auto;
    max-width: 100%;
    flex: 1;
  }
}
</style>
