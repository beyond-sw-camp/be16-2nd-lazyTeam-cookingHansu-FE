<template>
  <div class="recipe-detail-page">
    <Header />
    
    <div class="main-container">

      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <p class="mt-4 text-body-1">레시피를 불러오는 중...</p>
      </div>

      <!-- 비밀글 접근 제한 UI -->
      <div v-else-if="recipe && !canAccessRecipe" class="access-denied-container">
        <div class="access-denied-content">
          <div class="access-denied-icon">🔒</div>
          <h2 class="access-denied-title">비밀글입니다</h2>
          <p class="access-denied-message">
            이 레시피는 작성자만 볼 수 있는 비밀글입니다.
          </p>
          <div class="access-denied-actions">
            <v-btn 
              color="primary" 
              variant="outlined" 
              @click="$router.push('/')"
              class="mr-3"
            >
              홈으로 돌아가기
            </v-btn>
            <v-btn 
              v-if="!isLoggedIn"
              color="primary" 
              @click="showLoginModal = true"
            >
              로그인하기
            </v-btn>
          </div>
        </div>
      </div>

      <div v-else-if="recipe && canAccessRecipe" class="recipe-content">
        <div class="recipe-main-section">
          <div class="recipe-main-box">
            <div class="recipe-image-container">
              <!-- 썸네일 상단 버튼들 -->
              <div class="image-overlay-buttons">
                <v-btn 
                  icon 
                  size="small" 
                  variant="elevated"
                  color="white"
                  class="overlay-btn"
                  @click="toggleLike"
                >
                  <v-icon :color="isLiked === true ? 'red' : 'grey'">mdi-heart</v-icon>
                </v-btn>
                <v-btn 
                  icon 
                  size="small" 
                  variant="elevated"
                  color="white"
                  class="overlay-btn"
                  @click="toggleBookmark"
                >
                  <v-icon :color="isBookmarked === true ? 'blue' : 'grey'">mdi-bookmark</v-icon>
                </v-btn>
                <v-btn 
                  icon 
                  size="small" 
                  variant="elevated"
                  color="white"
                  class="overlay-btn"
                  @click="shareRecipe"
                >
                  <v-icon color="grey">mdi-share</v-icon>
                </v-btn>
              </div>
              
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
                      <h1 class="recipe-title">
                        {{ recipe.title }}
                        <v-chip 
                          :color="getCategoryColor(recipe.category)" 
                          size="small" 
                          class="category-chip-inline"
                        >
                          {{ getCategoryText(recipe.category) }}
                        </v-chip>
                      </h1>
                      <p class="recipe-subtitle">{{ recipe.description }}</p>
                      
                      <!-- 작성자 프로필 섹션 (서브타이틀 아래) -->
                      <div class="author-profile-section">
                        <div class="author-profile-card">
                          <v-avatar size="60" class="author-avatar">
                            <v-img 
                              v-if="recipe.profileImageUrl" 
                              :src="recipe.profileImageUrl" 
                              :alt="recipe.nickname + ' 프로필 이미지'"
                              @error="handleProfileImageError('recipe')"
                            ></v-img>
                            <span v-else class="author-avatar-placeholder">
                              {{ getAuthorInitial(recipe.nickname) }}
                            </span>
                          </v-avatar>
                          <div class="author-info">
                            <h3 class="author-name">{{ recipe.nickname }}</h3>
                            <p class="author-role">{{ getUserTypeText(recipe.role) }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 레시피 정보 섹션을 타이틀 옆에 배치 -->
                    <div class="recipe-meta-info">
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
              
              <!-- 좋아요, 북마크, 조회수 카운트 (숫자만 표시) -->
              <div class="engagement-stats">
                <div class="stats-left">
                  <div class="stat-item">
                    <v-icon color="grey" size="20">mdi-heart</v-icon>
                    <span class="stat-count">{{ recipe.likeCount || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <v-icon color="grey" size="20">mdi-bookmark</v-icon>
                    <span class="stat-count">{{ recipe.bookmarkCount || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <v-icon color="grey" size="20">mdi-eye</v-icon>
                    <span class="stat-count">{{ recipe.viewCount || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <v-icon color="grey" size="20">mdi-comment</v-icon>
                    <span class="stat-count">{{ recipe.commentCount || getTotalCommentCount() }}</span>
                  </div>
                </div>
                
                <!-- 수정/삭제 버튼들 (작성자만 보임) -->
                <div v-if="isAuthor" class="action-buttons">
                  <v-btn 
                    color="success" 
                    variant="outlined" 
                    @click="editRecipe"
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
            </div>
              </div>
            </div>

        <!-- 재료와 조리과정 섹션 -->
        <div class="recipe-detail-content">
          <div class="detail-sections-container">
            <!-- 재료 섹션 -->
            <div class="ingredients-section">
              <h2 class="section-title">재료</h2>
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
          <h3 class="comments-title">댓글 ({{ recipe.commentCount || getTotalCommentCount() }})</h3>
          
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
                  <v-avatar size="40" class="comment-avatar">
                    <v-img 
                      v-if="comment.authorProfileImage" 
                      :src="comment.authorProfileImage" 
                      :alt="comment.nickname + ' 프로필 이미지'"
                      @error="handleCommentProfileImageError(comment)"
                    ></v-img>
                    <span v-else class="comment-avatar-placeholder">
                      {{ getAuthorInitial(comment.nickname) }}
                    </span>
                  </v-avatar>
                  <div class="comment-author-info">
                    <h4 class="comment-author-name">
                      {{ comment.nickname }}
                      <span 
                        v-if="isCommentAuthor(comment)" 
                        style="
                          display: inline-block;
                          background: linear-gradient(135deg, #ff7a00, #ff9500);
                          color: white;
                          font-size: 10px;
                          font-weight: 600;
                          padding: 2px 6px;
                          border-radius: 10px;
                          margin-left: 8px;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          box-shadow: 0 1px 3px rgba(255, 122, 0, 0.3);
                        "
                      >
                        작성자
                      </span>
                    </h4>
                    <p class="comment-time">{{ formatDate(comment.createdAt) }}</p>
                  </div>
                </div>
                <div class="comment-actions">
                  <!-- 답글 버튼 (삭제된 댓글이 아닌 경우만, 그리고 답글이 없는 경우만) -->
                  <v-btn 
                    v-if="!comment.isDeleted && (!comment.replies || comment.replies.length === 0)"
                    size="small" 
                    variant="text"
                    @click="showReplyForm(comment)"
                    class="reply-btn"
                  >
                    답글
                  </v-btn>
                  
                  <!-- 더보기 버튼 (삭제된 댓글이 아닌 경우만) -->
                  <v-menu
                    v-if="!comment.isDeleted"
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
                        v-if="canEditComment(comment)"
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
                        v-if="canEditComment(comment)"
                        @click="deleteComment(comment.id)"
                        class="delete-menu-item"
                      >
                        <template v-slot:prepend>
                          <v-icon size="16" color="error">mdi-delete</v-icon>
                        </template>
                        <v-list-item-title class="text-error">삭제</v-list-item-title>
                      </v-list-item>
                      
                      <!-- 신고 버튼 (작성자가 아닌 경우만 표시) -->
                      <v-list-item
                        v-if="!canEditComment(comment)"
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
                  rows="3"
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
                <div class="reply-notice">
                  <v-icon size="16" color="info">mdi-information</v-icon>
                  <span>답글은 1개만 작성할 수 있습니다</span>
                </div>
                
                <v-textarea
                  v-model="comment.replyText"
                  placeholder="답글을 작성해주세요...."
                  variant="outlined"
                  rows="3"
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
              <div class="comment-header">
                <div class="comment-info">
                  <v-avatar size="40" class="comment-avatar">
                    <v-img 
                      v-if="reply.authorProfileImage" 
                      :src="reply.authorProfileImage" 
                      :alt="reply.nickname + ' 프로필 이미지'"
                      @error="handleCommentProfileImageError(reply)"
                    ></v-img>
                    <span v-else class="comment-avatar-placeholder">
                      {{ getAuthorInitial(reply.nickname) }}
                    </span>
                  </v-avatar>
                  <div class="comment-author-info">
                    <h4 class="comment-author-name">
                      {{ reply.nickname }}
                      <span 
                        v-if="isCommentAuthor(reply)" 
                        style="
                          display: inline-block;
                          background: linear-gradient(135deg, #ff7a00, #ff9500);
                          color: white;
                          font-size: 10px;
                          font-weight: 600;
                          padding: 2px 6px;
                          border-radius: 10px;
                          margin-left: 8px;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          box-shadow: 0 1px 3px rgba(255, 122, 0, 0.3);
                        "
                      >
                        작성자
                      </span>
                    </h4>
                    <p class="comment-time">{{ formatDate(reply.createdAt) }}</p>
                  </div>
                </div>
                <div class="comment-actions">
                  <!-- 더보기 버튼 (삭제된 답글이 아닌 경우만) -->
                  <v-menu
                    v-if="!reply.isDeleted"
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
                        v-if="canEditComment(reply)"
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
                        v-if="canEditComment(reply)"
                        @click="deleteComment(reply.id)"
                        class="delete-menu-item"
                      >
                        <template v-slot:prepend>
                          <v-icon size="16" color="error">mdi-delete</v-icon>
                        </template>
                        <v-list-item-title class="text-error">삭제</v-list-item-title>
                      </v-list-item>
                      
                      <!-- 신고 버튼 (작성자가 아닌 경우만 표시) -->
                      <v-list-item
                        v-if="!canEditComment(reply)"
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
                    <div v-else-if="reply.isEditing" class="comment-edit-form">
                      <v-textarea
                        v-model="reply.editText"
                        placeholder="답글을 수정하세요..."
                        rows="3"
                        variant="outlined"
                        density="compact"
                        class="comment-edit-input"
                        auto-grow
                        no-resize
                      ></v-textarea>
                      <div class="comment-edit-actions">
                        <v-btn 
                          size="small" 
                          variant="outlined"
                          @click="cancelEditComment(reply)"
                        >
                          취소
                        </v-btn>
                        <v-btn 
                          size="small" 
                          color="primary"
                          @click="saveEditComment(reply)"
                          :disabled="!reply.editText.trim()"
                        >
                          저장
                        </v-btn>
                      </div>
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

    <!-- 공유 모달 -->
    <div v-if="showShareModal" class="share-modal-overlay" @click="showShareModal = false">
      <div class="share-modal" @click.stop>
        <div class="share-modal-header">
          <h3>공유하기</h3>
          <button class="close-btn" @click="showShareModal = false">×</button>
        </div>
        <div class="share-options">
          <div class="share-option facebook-option" @click="shareToFacebook">
            <div class="share-icon">
              <img src="/src/assets/images/Facebook_Logo_Primary.png" alt="Facebook" />
            </div>
            <span>페이스북</span>
          </div>
          <div class="share-option kakaotalk-option" @click="shareToKakaoTalk">
            <div class="share-icon">
              <img src="/src/assets/images/kakaotalk_sharing_btn_small.png" alt="KakaoTalk" />
            </div>
            <span>카카오톡</span>
          </div>
          <div class="share-option instagram-option" @click="shareToInstagram">
            <div class="share-icon">
              <img src="/src/assets/images/Instagram_Glyph_Gradient.png" alt="Instagram" />
            </div>
            <span>인스타그램</span>
          </div>
          <div class="share-option link-option" @click="copyToClipboard">
            <div class="share-icon">
              <img src="/src/assets/images/lecture_shared_icon.png" alt="Link" />
            </div>
            <span>링크 복사</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import CommonModal from '@/components/common/CommonModal.vue'
import { useNotifications } from '@/composables/useNotifications'

const route = useRoute()
const router = useRouter()

// 실시간 알림 설정
const { isConnected: notificationConnected } = useNotifications()

// 기본 썸네일 이미지
const defaultThumbnail = '/src/assets/images/smu_mascort1.jpg'

const loading = ref(true)
const error = ref(null)
const showDeleteModal = ref(false)
const newComment = ref('')
const currentUser = ref(null)
const showLoginModal = ref(false)
const showShareModal = ref(false)

// 로그인 상태 확인
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('accessToken')
})

// JWT 토큰에서 사용자 정보 추출
const getCurrentUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      console.log('🔍 JWT 토큰이 없습니다')
      return null
    }
    
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log('🔍 JWT 토큰 페이로드:', payload)
    
    // 다양한 필드명으로 사용자 ID 찾기
    const userId = payload.sub || payload.userId || payload.id || payload.user_id || payload.userId
    console.log('🔍 추출된 사용자 ID:', userId)
    
    return userId
  } catch (error) {
    console.error('JWT 토큰 파싱 실패:', error)
    return null
  }
}

// 현재 사용자가 작성자인지 확인 (JWT 토큰 기반)
const isAuthor = computed(() => {
  // JWT 토큰에서 사용자 ID 추출
  const currentUserId = getCurrentUserIdFromToken()
  
  if (!currentUserId) {
    console.log('🔍 isAuthor: JWT 토큰에서 사용자 ID 추출 실패')
    return false
  }
  
  if (!recipe.authorId) {
    console.log('🔍 isAuthor: 레시피 작성자 ID 없음')
    return false
  }
  
  // 타입 변환하여 비교 (문자열과 숫자 모두 지원)
  const isMatch = String(currentUserId) === String(recipe.authorId)
  console.log('🔍 isAuthor 체크 (JWT 토큰 기준):', {
    currentUserIdFromToken: currentUserId,
    currentUserIdType: typeof currentUserId,
    recipeAuthorId: recipe.authorId,
    recipeAuthorIdType: typeof recipe.authorId,
    currentUserNickname: currentUser.value?.nickname,
    recipeNickname: recipe.nickname,
    isMatch: isMatch
  })
  
  return isMatch
})

// 비밀글 접근 권한 확인
const canAccessRecipe = computed(() => {
  console.log('🔍 비밀글 접근 권한 체크:', {
    isOpen: recipe.isOpen,
    isOpenType: typeof recipe.isOpen,
    isAuthor: isAuthor.value,
    currentUserId: getCurrentUserIdFromToken(),
    recipeAuthorId: recipe.authorId
  })
  
  // 공개글인 경우 모든 사용자가 접근 가능
  if (recipe.isOpen === true || recipe.isOpen === undefined) {
    console.log('✅ 공개글 - 접근 허용')
    return true
  }
  
  // 비밀글인 경우 작성자만 접근 가능
  if (recipe.isOpen === false) {
    console.log('🔒 비밀글 - 작성자 체크:', isAuthor.value)
    return isAuthor.value
  }
  
  // 기본값은 접근 허용
  console.log('⚠️ 기본값 - 접근 허용')
  return true
})

// 좋아요, 북마크 상태 (초기값을 null로 설정하여 로딩 상태 구분)
const isLiked = ref(null)
const isBookmarked = ref(null)

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
  commentCount: 0, // 댓글 개수 추가
    nickname: '',
  role: '',
  authorId: null // 작성자 ID 추가
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

// 프로필 이미지 URL 추출 함수
const getProfileImageUrl = (user) => {
  if (!user) return null
  
  // 다양한 필드명에서 프로필 이미지 URL 찾기
  const possibleFields = [
    'authorProfileImage',
    'authorProfileUrl', 
    'profileImageUrl',
    'profileImage',
    'user?.profileImageUrl',
    'user?.profileImage'
  ]
  
  for (const field of possibleFields) {
    const value = field.includes('?.') ? 
      user.user?.[field.split('?.')[1]] : 
      user[field]
    
    if (value && typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  
  return null
}

// 프로필 이미지 에러 핸들러
const handleProfileImageError = (type) => {
  console.log(`${type} 프로필 이미지 로드 실패`)
  if (type === 'recipe') {
    recipe.value.profileImageUrl = null
  }
}

const handleCommentProfileImageError = (comment) => {
  console.log('댓글 프로필 이미지 로드 실패:', comment.nickname)
  comment.authorProfileImage = null
}

// 댓글 작성자가 레시피 작성자인지 확인 (UUID 기반)
const isCommentAuthor = (comment) => {
  // UUID로 비교 (더 정확함)
  if (comment.authorUUID && recipe.authorId) {
    return String(comment.authorUUID) === String(recipe.authorId)
  }
  
  // UUID가 없는 경우 닉네임으로 fallback (하위 호환성)
  return comment.nickname === recipe.nickname
}

// 댓글 수정/삭제 권한 확인 (UUID 기반)
const canEditComment = (comment) => {
  if (!isLoggedIn.value || !currentUser.value) {
    console.log('🔍 canEditComment: 로그인하지 않았거나 사용자 정보 없음')
    return false
  }
  
  // 현재 사용자 UUID 가져오기 (JWT 토큰에서 추출)
  const currentUserUUID = getCurrentUserIdFromToken() || currentUser.value.id || currentUser.value.uuid || currentUser.value.userId
  
  console.log('🔍 canEditComment 디버깅:', {
    isLoggedIn: isLoggedIn.value,
    currentUser: currentUser.value,
    currentUserUUID: currentUserUUID,
    currentUserNickname: currentUser.value.nickname,
    commentAuthorUUID: comment.authorUUID,
    commentNickname: comment.nickname,
    commentData: comment
  })
  
  // 댓글 작성자 UUID가 없는 경우 nickname으로 fallback (하위 호환성)
  if (!comment.authorUUID) {
    console.log('🔍 canEditComment: 댓글 작성자 UUID 없음, nickname으로 fallback')
    const nicknameMatch = currentUser.value.nickname === comment.nickname
    console.log('🔍 nickname 비교 결과:', nicknameMatch)
    return nicknameMatch
  }
  
  // UUID로 비교
  const canEdit = currentUserUUID && String(currentUserUUID) === String(comment.authorUUID)
  console.log('🔍 canEditComment 체크 (UUID 기준):', {
    currentUserUUID: currentUserUUID,
    currentUserUUIDType: typeof currentUserUUID,
    commentAuthorUUID: comment.authorUUID,
    commentAuthorUUIDType: typeof comment.authorUUID,
    commentNickname: comment.nickname,
    canEdit: canEdit
  })
  
  return canEdit
}



// 작성자 팔로우 기능
const followAuthor = async () => {
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }
  
  try {
    // TODO: 팔로우 API 호출 구현
    console.log('팔로우 기능 구현 예정:', recipe.authorId)
    alert('팔로우 기능은 준비 중입니다.')
  } catch (error) {
    console.error('팔로우 오류:', error)
    alert('팔로우 중 오류가 발생했습니다.')
  }
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
  
  // 500자 제한 체크
  if (newComment.value.length > 500) {
    alert('댓글은 500자 이내로 작성해주세요.')
    return
  }
  
  // 게시글 접근 권한 실시간 체크
  try {
    const checkResponse = await fetch(`http://localhost:8080/api/posts/${recipe.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    
    if (!checkResponse.ok) {
      alert('비공개된 게시글입니다.')
      router.push('/recipes')
      return
    }
    
    // 응답에서 isOpen 상태 확인
    const checkData = await checkResponse.json()
    if (checkData.data && checkData.data.isOpen === false) {
      // 비밀글인 경우 작성자 체크
      const currentUserId = getCurrentUserIdFromToken()
      if (!currentUserId || String(currentUserId) !== String(checkData.data.authorId)) {
        alert('비공개된 게시글입니다.')
        router.push('/recipes')
        return
      }
    }
  } catch (error) {
    console.error('게시글 접근 권한 체크 실패:', error)
    alert('비공개된 게시글입니다.')
    router.push('/recipes')
    return
  }
  
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
      
      // 403 또는 404 에러인 경우 비공개 게시글일 가능성
      if (response.status === 403 || response.status === 404) {
        alert('비공개된 게시글입니다.')
        router.push('/recipes')
        return
      }
      
      alert('댓글 등록에 실패했습니다.')
    }
  } catch (error) {
    console.error('댓글 생성 에러:', error)
    alert('댓글 등록 중 오류가 발생했습니다.')
  }
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
  
  // 500자 제한 체크
  if (comment.replyText.length > 500) {
    alert('답글은 500자 이내로 작성해주세요.')
    return
  }
  
  // 게시글 접근 권한 실시간 체크
  try {
    const checkResponse = await fetch(`http://localhost:8080/api/posts/${recipe.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    
    if (!checkResponse.ok) {
      alert('비공개된 게시글입니다.')
      router.push('/recipes')
      return
    }
    
    // 응답에서 isOpen 상태 확인
    const checkData = await checkResponse.json()
    if (checkData.data && checkData.data.isOpen === false) {
      // 비밀글인 경우 작성자 체크
      const currentUserId = getCurrentUserIdFromToken()
      if (!currentUserId || String(currentUserId) !== String(checkData.data.authorId)) {
        alert('비공개된 게시글입니다.')
        router.push('/recipes')
        return
      }
    }
  } catch (error) {
    console.error('게시글 접근 권한 체크 실패:', error)
    alert('비공개된 게시글입니다.')
    router.push('/recipes')
    return
  }
  
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
      
      // 403 또는 404 에러인 경우 비공개 게시글일 가능성
      if (response.status === 403 || response.status === 404) {
        alert('비공개된 게시글입니다.')
        router.push('/recipes')
        return
      }
      
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
  
  // 게시글 접근 권한 실시간 체크
  try {
    const checkResponse = await fetch(`http://localhost:8080/api/posts/${recipe.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    
    if (!checkResponse.ok) {
      alert('비공개된 게시글입니다.')
      router.push('/recipes')
      return
    }
    
    // 응답에서 isOpen 상태 확인
    const checkData = await checkResponse.json()
    if (checkData.data && checkData.data.isOpen === false) {
      // 비밀글인 경우 작성자 체크
      const currentUserId = getCurrentUserIdFromToken()
      if (!currentUserId || String(currentUserId) !== String(checkData.data.authorId)) {
        alert('비공개된 게시글입니다.')
        router.push('/recipes')
        return
      }
    }
  } catch (error) {
    console.error('게시글 접근 권한 체크 실패:', error)
    alert('비공개된 게시글입니다.')
    router.push('/recipes')
    return
  }
  
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
        alert('댓글이 삭제되었습니다.')
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
      
      // 403 또는 404 에러인 경우 비공개 게시글일 가능성
      if (response.status === 403 || response.status === 404) {
        alert('비공개된 게시글입니다.')
        router.push('/recipes')
        return
      }
      
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
  
  // 500자 제한 체크
  if (comment.editText.length > 500) {
    alert('댓글은 500자 이내로 작성해주세요.')
    return
  }
  
  // 게시글 접근 권한 실시간 체크
  try {
    const checkResponse = await fetch(`http://localhost:8080/api/posts/${recipe.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    
    if (!checkResponse.ok) {
      alert('비공개된 게시글입니다.')
      router.push('/recipes')
      return
    }
    
    // 응답에서 isOpen 상태 확인
    const checkData = await checkResponse.json()
    if (checkData.data && checkData.data.isOpen === false) {
      // 비밀글인 경우 작성자 체크
      const currentUserId = getCurrentUserIdFromToken()
      if (!currentUserId || String(currentUserId) !== String(checkData.data.authorId)) {
        alert('비공개된 게시글입니다.')
        router.push('/recipes')
        return
      }
    }
  } catch (error) {
    console.error('게시글 접근 권한 체크 실패:', error)
    alert('비공개된 게시글입니다.')
    router.push('/recipes')
    return
  }
  
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
      
      // 403 또는 404 에러인 경우 비공개 게시글일 가능성
      if (response.status === 403 || response.status === 404) {
        alert('비공개된 게시글입니다.')
        router.push('/recipes')
        return
      }
      
      alert('댓글 수정에 실패했습니다.')
    }
  } catch (error) {
    console.error('댓글 수정 에러:', error)
    alert('댓글 수정 중 오류가 발생했습니다.')
  }
}

// 전체 댓글수 계산 (댓글 + 대댓글)
const getTotalCommentCount = () => {
  let totalCount = 0
  
  comments.value.forEach(comment => {
    // 삭제되지 않은 댓글만 카운트
    if (!comment.isDeleted) {
      totalCount++
    }
    
    // 삭제되지 않은 답글은 댓글 삭제 여부와 관계없이 카운트
    if (comment.replies && Array.isArray(comment.replies)) {
      comment.replies.forEach(reply => {
        if (!reply.isDeleted) {
          totalCount++
        }
      })
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
        // 댓글을 오래된 순으로 정렬 (createdAt 기준 오름차순)
        const sortedComments = data.data.sort((a, b) => {
          const dateA = new Date(a.createdAt)
          const dateB = new Date(b.createdAt)
          return dateA - dateB // 오래된 순 (오름차순)
        })
        
        comments.value = sortedComments.map(comment => {
          
          return {
            id: comment.commentId || comment.id,
            nickname: comment.authorNickName || comment.nickname,
            authorUUID: comment.authorId, // 작성자 UUID (authorId가 UUID 타입)
            content: comment.content,
            createdAt: comment.createdAt,
            isDeleted: comment.isDeleted || false, // 삭제 상태 추가
            showMoreMenu: false, // 더보기 메뉴 상태
            authorProfileImage: getProfileImageUrl(comment),
            replies: comment.childComments ? comment.childComments
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // 대댓글도 오래된 순으로 정렬
              .map(reply => {
                return {
                  id: reply.commentId || reply.id,
                  nickname: reply.authorNickName || reply.nickname,
                  authorUUID: reply.authorId, // 답글 작성자 UUID (authorId가 UUID 타입)
                  content: reply.content,
                  createdAt: reply.createdAt,
                  isDeleted: reply.isDeleted || false, // 답글 삭제 상태도 추가
                  authorProfileImage: getProfileImageUrl(reply),
                  showMoreMenu: false // 더보기 메뉴 상태
                }
              }) : []
          }
        })
        console.log('댓글 목록 변환 완료 (오래된 순 정렬):', comments.value)
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
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }

  try {
    const response = await fetch(`http://localhost:8080/api/interactions/posts/${recipe.id}/likes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (response.ok) {
      // null 상태에서 시작하는 경우 false로 초기화
      if (isLiked.value === null) {
        isLiked.value = false
      }
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
  if (!isLoggedIn.value) {
    showLoginModal.value = true
    return
  }

  try {
    const response = await fetch(`http://localhost:8080/api/interactions/posts/${recipe.id}/bookmarks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (response.ok) {
      // null 상태에서 시작하는 경우 false로 초기화
      if (isBookmarked.value === null) {
        isBookmarked.value = false
      }
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

// 레시피 공유 기능
const shareRecipe = () => {
  showShareModal.value = true
}

// 공유 기능 메서드들
const getShareUrl = () => {
  return `${window.location.origin}/recipes/${recipe.id}`
}

const getShareText = () => {
  return `${recipe.title} - ${recipe.description}`
}

const shareToFacebook = () => {
  const url = encodeURIComponent(getShareUrl())
  const text = encodeURIComponent(getShareText())
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`
  window.open(facebookUrl, '_blank', 'width=600,height=400')
  showShareModal.value = false
}

const shareToKakaoTalk = () => {
  // Kakao SDK 초기화
  if (typeof Kakao !== 'undefined') {
    if (!Kakao.isInitialized()) {
      Kakao.init('3a1a982f8ee6ddbc64171c2f80850243') // 실제 앱 키로 교체 필요
    }
    
    Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: `🍳 ${recipe.title}`,
        description: recipe.description,
        imageUrl: recipe.thumbnailUrl || 'https://yourdomain.com/images/share-thumb.png',
        link: {
          mobileWebUrl: getShareUrl(),
          webUrl: getShareUrl(),
        },
      },
    })
  } else {
    // Kakao SDK가 없는 경우 링크 복사로 대체
    copyToClipboard()
  }
  showShareModal.value = false
}

const shareToInstagram = () => {
  // 인스타그램 공유 개선: 모바일에서는 인스타그램 앱으로, 데스크톱에서는 링크 복사
  if (isMobile()) {
    // 모바일에서는 인스타그램 앱으로 공유 시도
    const shareUrl = `instagram://library?AssetPickerSourceType=1`
    window.location.href = shareUrl
    
    // 3초 후 링크 복사로 대체 (인스타그램 앱이 없거나 실패한 경우)
    setTimeout(() => {
      copyToClipboard()
    }, 3000)
  } else {
    // 데스크톱에서는 링크 복사
    copyToClipboard()
  }
  showShareModal.value = false
}

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const copyToClipboard = async () => {
  try {
    const shareText = `${getShareText()}\n\n${getShareUrl()}`
    await navigator.clipboard.writeText(shareText)
    alert('링크가 클립보드에 복사되었습니다!')
  } catch (error) {
    console.error('클립보드 복사 실패:', error)
    alert('링크 복사에 실패했습니다.')
  }
  showShareModal.value = false
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
    let apiUrl = `http://localhost:8080/api/recipes/${recipeId}`
    
    console.log('🔄 첫 번째 시도:', apiUrl)
    response = await fetch(apiUrl, { headers })
    
    if (!response.ok) {
      console.log('🔄 두 번째 시도: /api/posts/{id}')
      apiUrl = `http://localhost:8080/api/posts/${recipeId}`
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
      console.log('🔄 세 번째 시도: /api/posts/detail/{id}')
      apiUrl = `http://localhost:8080/api/posts/detail/${recipeId}`
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
          commentCount: data.data.commentCount || 0, // 댓글 개수 추가
          isOpen: data.data.isOpen,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
          nickname: data.data.user?.nickname,
          role: data.data.user?.role,
          profileImageUrl: getProfileImageUrl(data.data.user),
          authorId: data.data.user?.id, // 작성자 ID 추가
          ingredients: data.data.ingredients || [],
          steps: data.data.steps || []
        })
        
        console.log('🔍 레시피 데이터 로드 완료:', {
          recipeId: recipe.id,
          authorId: recipe.authorId,
          authorNickname: recipe.nickname,
          userData: data.data.user,
          profileImageUrl: data.data.user?.profileImageUrl,
          profileImage: data.data.user?.profileImage,
          authorProfileImage: data.data.user?.authorProfileImage,
          authorProfileUrl: data.data.user?.authorProfileUrl
        })
        
        // 좋아요/북마크 상태 설정 (백엔드에서 받아온 데이터 사용)
        // 로그인한 사용자만 상태를 확인하고, 비로그인 사용자는 false로 설정
        if (isLoggedIn.value) {
          isLiked.value = data.data.isLiked !== undefined ? data.data.isLiked : false
          isBookmarked.value = data.data.isBookmarked !== undefined ? data.data.isBookmarked : false
        } else {
          isLiked.value = false
          isBookmarked.value = false
        }
        
        console.log('🔍 좋아요/북마크 상태:', {
          isLiked: isLiked.value,
          isBookmarked: isBookmarked.value,
          likeCount: recipe.likeCount,
          bookmarkCount: recipe.bookmarkCount
        })
        
        // 댓글 목록 로드
        await loadComments()
      } else {
        throw new Error('레시피 데이터가 없습니다.')
      }
    } else {
      // API 호출 실패 시 에러 메시지 확인
      let errorMessage = '레시피를 불러올 수 없습니다.'
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      
      // "접근할 수 없는 게시글입니다" 메시지인 경우 비밀글 접근 제한으로 처리
      if (errorMessage.includes('접근할 수 없는 게시글') || errorMessage.includes('비밀글')) {
        // 비밀글 접근 제한 UI를 표시하기 위해 recipe 객체를 초기화
        Object.assign(recipe, {
          id: recipeId,
          isOpen: false, // 비밀글으로 설정
          authorId: null // 작성자 정보 없음
        })
        return // 에러를 throw하지 않고 비밀글 접근 제한 UI 표시
      }
      
      throw new Error(errorMessage)
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



// ESC 키 이벤트 리스너
const handleKeydown = (event) => {
  if (event.key === 'Escape' && showShareModal.value) {
    showShareModal.value = false
  }
}

onMounted(async () => {
  await loadCurrentUser()
  await loadRecipe()
  // ESC 키 이벤트 리스너 추가
  document.addEventListener('keydown', handleKeydown)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
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
      console.log('🔍 현재 사용자 정보 로드 성공:', currentUser.value)
    } else {
      console.error('사용자 정보 로드 실패:', response.status, response.statusText)
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
  margin: 20px auto 0 auto;
  width: 100%;
}

.recipe-image-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: default; /* 커서 확대 효과 제거 */
}

.image-overlay-buttons {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.overlay-btn {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

.title-with-category {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.recipe-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0;
  line-height: 1.2;
  word-wrap: break-word;
  flex: 1;
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
  gap: 12px;
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



.engagement-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.stats-left {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: default; /* 클릭 효과 제거 */
}

.stat-count {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: -5px;
}

.action-buttons-top {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  justify-content: flex-end;
}

.recipe-meta-info {
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  flex: 0 0 280px;
  min-width: 280px;
}

/* 타이틀 행 */
.title-row {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin-bottom: 10px;
}

.title-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
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
  align-self: flex-start;
  margin-top: 8px;
}

/* 재료와 조리과정 컨테이너 */
.recipe-detail-content {
  background-color: #fff;
  border-radius: 12px;
  padding: 35px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin: 20px auto 0 auto;
  max-width: 1000px;
  overflow: hidden;
}

.detail-sections-container {
  display: flex;
  gap: 32px;
  margin: 32px auto;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: nowrap;
  max-width: 1200px;
  padding: 0 20px;
}



.meta-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
}

.meta-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.meta-value {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.difficulty-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  padding: 2px 6px;
  background-color: #f5f5f5;
  border-radius: 4px;
}



.ingredients-section {
  flex: 0 0 30%;
  min-width: 300px;
  max-width: 30%;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.cooking-steps-section {
  flex: 0 0 70%;
  min-width: 500px;
  max-width: 70%;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
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
  gap: 16px;
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: all 0.2s ease;
}

.ingredient-item:hover {
  background-color: #f8f9fa;
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
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #eee;
  transition: all 0.2s ease;
}

.step-item:hover {
  background-color: #f8f9fa;
  border-color: #ddd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-number {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  background-color: #ff7a00;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
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
  border-left: 2px solid #ff7a00;
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



/* 작성자 프로필 섹션 (서브타이틀 아래) */
.author-profile-section {
  margin: 20px 0;
}

.author-profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
  background-color: transparent;
  border: none;
  width: auto;
  height: auto;
}

.author-avatar {
  flex-shrink: 0;
  border: 1px solid #e0e0e0 !important;
  box-shadow: 0 0 0 1px #e0e0e0;
}

.author-avatar :deep(.v-avatar__underlay) {
  border: 1px solid #e0e0e0 !important;
}

.author-avatar :deep(.v-img) {
  border: 1px solid #e0e0e0 !important;
  border-radius: 50% !important;
}

.author-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: #666;
  background: #e0e0e0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.author-info {
  flex: 1;
  text-align: left;
}

.author-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.author-role {
  margin: 0;
  color: #666;
  font-size: 14px;
}



.comments-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 35px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin: 20px auto 0 auto;
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

/* 공통 폼 스타일 */
.comment-form,
.reply-form,
.comment-edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.comment-input,
.reply-input,
.comment-edit-input {
  width: 100%;
  min-height: 80px;
}

.comment-input :deep(.v-field__input),
.reply-input :deep(.v-field__input),
.comment-edit-input :deep(.v-field__input) {
  min-height: 80px;
  font-size: 1rem;
  line-height: 1.5;
  padding: 12px;
}

.comment-submit-btn {
  align-self: flex-end;
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
  gap: 0px;
}

.comment-item {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.comment-info {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* 공통 버튼 액션 스타일 */
.comment-edit-actions,
.reply-actions {
  display: flex !important;
  gap: 12px !important;
  justify-content: flex-end !important;
  align-items: center !important;
  width: 100% !important;
}

.comment-edit-actions .v-btn,
.reply-actions .v-btn {
  flex-shrink: 0 !important;
  min-width: 70px !important;
}

.replies-list {
  margin-top: 15px;
  margin-left: 40px;
}

.reply-item {
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 3px solid #e0e0e0;
  padding-left: 20px;
  position: relative;
}



.reply-content {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 15px;
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
    margin: 20px auto 0 auto;
    padding: 30px;
  }
  
  .author-profile-card {
    gap: 12px;
  }
  
  .author-avatar {
    width: 50px !important;
    height: 50px !important;
  }
  
  .comment-avatar,
  .reply-avatar {
    width: 36px !important;
    height: 36px !important;
  }
  
  .author-name {
    font-size: 16px;
  }
  
  .author-role {
    font-size: 13px;
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
  
  .title-with-category {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .recipe-title {
    font-size: 2rem;
    margin-bottom: 0;
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
  
  .title-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .recipe-meta-info {
    flex: none;
    min-width: auto;
    max-width: 100%;
  }
  
  .action-buttons {
    min-width: auto;
  }
  
  .meta-items {
    flex-direction: column;
    gap: 10px;
  }
  
  .meta-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }
  
  .meta-item:last-child {
    border-bottom: none;
  }
  
  .meta-label {
    margin-bottom: 0;
    font-size: 0.9rem;
  }
  
  .meta-value {
    font-size: 0.9rem;
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
  
  .comment-form,
  .reply-form,
  .comment-edit-form {
    gap: 12px;
    padding: 12px;
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
  
  .engagement-stats {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .stats-left {
    flex-wrap: wrap;
    gap: 15px;
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


.comment-avatar {
  flex-shrink: 0;
  border: 2px solid #e0e0e0 !important;
  box-shadow: 0 0 0 2px #e0e0e0;
  width: 40px !important;
  height: 40px !important;
}

.comment-avatar :deep(.v-avatar__underlay) {
  border: 2px solid #e0e0e0 !important;
}

.comment-avatar :deep(.v-img) {
  border: 2px solid #e0e0e0 !important;
  border-radius: 50% !important;
}

.comment-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #666;
  background: #e0e0e0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.comment-author-info {
  flex: 1;
  text-align: left;
}

.comment-author-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.comment-time {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.author-badge {
  display: inline-block;
  background: linear-gradient(135deg, #ff7a00, #ff9500);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 1px 3px rgba(255, 122, 0, 0.3);
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
  margin-bottom: 0;
  width: 100%;
}





.reply-author-info {
  flex: 1;
  text-align: left;
}

.reply-author-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.reply-time {
  margin: 0;
  color: #666;
  font-size: 14px;
}




}

@media (max-width: 480px) {
  .recipe-main-section {
    margin-top: 10px;
  }
  
  .recipe-main-box {
    padding: 20px;
    max-width: 100%;
    margin: 20px auto 0 auto;
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
  
  .author-profile-card {
    gap: 10px;
  }
  
  .author-avatar {
    width: 45px !important;
    height: 45px !important;
  }
  
  .comment-avatar,
  .reply-avatar {
    width: 32px !important;
    height: 32px !important;
  }
  
  .author-name {
    font-size: 15px;
  }
  
  .author-role {
    font-size: 12px;
  }
  
  .detail-sections-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .ingredients-section {
    flex: none;
    width: 100%;
    min-width: auto;
    max-width: 100%;
  }
  
  .cooking-steps-section {
    flex: none;
    width: 100%;
    min-width: auto;
    max-width: 100%;
  }
}

/* 공유 모달 스타일 */
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.share-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.share-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.share-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
}

.share-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.share-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.share-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.share-option .share-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-option .share-icon img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.share-option.facebook-option {
  background: #1877f2;
  border-color: #1877f2;
}

.share-option.facebook-option span {
  color: white;
}

.share-option.kakaotalk-option {
  background: #fee500;
  border-color: #fee500;
}

.share-option.kakaotalk-option span {
  color: #000;
}

.share-option.instagram-option {
  background: white;
  border-color: #e9ecef;
}

.share-option.instagram-option span {
  color: #333;
}

.share-option.link-option {
  background: white;
  border-color: #e9ecef;
}

.share-option.link-option span {
  color: #333;
}

/* 비밀글 접근 제한 UI 스타일 */
.access-denied-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.access-denied-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.access-denied-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.access-denied-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
}

.access-denied-message {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.access-denied-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .access-denied-content {
    padding: 30px 20px;
  }
  
  .access-denied-title {
    font-size: 24px;
  }
  
  .access-denied-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .access-denied-actions .v-btn {
    width: 100%;
    max-width: 200px;
  }
}

.share-option span {
  font-size: 16px;
  font-weight: 600;
  flex: 1;
}

@media (max-width: 480px) {
  .share-options {
    gap: 8px;
  }
  
  .share-option {
    padding: 14px 16px;
  }
  
  .share-option .share-icon {
    width: 20px;
    height: 20px;
  }
  
  .share-option .share-icon img {
    width: 16px;
    height: 16px;
  }
  
  .share-option span {
    font-size: 14px;
  }
  
  .share-modal {
    width: 95%;
    margin: 20px;
  }
}

.reply-notice {
  display: flex;
  align-items: center;
  gap: 16px; /* 12px에서 16px로 증가 */
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: #e3f2fd;
  border-radius: 6px;
  color: #1976d2;
  font-size: 0.9rem;
}

.reply-notice .v-icon {
  font-size: 16px;
}
</style>
