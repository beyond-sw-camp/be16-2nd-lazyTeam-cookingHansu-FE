<template>
  <div class="lecture-detail-page">
    <Header />
    
    <div v-if="lecture" class="detail-container">
      <!-- 메인 콘텐츠 영역 -->
      <div class="main-content">
        <!-- 강의 제목 및 설명 -->
        <div class="lecture-header">
          <div class="tags">
            <span class="tag cuisine">{{ lecture.category }}</span>
            <span class="tag level">{{ lecture.level }}</span>
          </div>
          <h1 class="lecture-title">{{ lecture.title }}</h1>
          <p class="lecture-description">{{ lecture.description }}</p>
        </div>

                           <!-- 비디오 미리보기 -->
          <div class="video-preview">
            <div class="video-container">
              <div class="video-placeholder" @click="playPreviewVideo">
                                                 <div v-if="!isVideoPlaying" class="video-thumbnail-container">
                  <!-- 영상 썸네일 표시 -->
                  <img
                    v-if="videoThumb"
                    :src="videoThumb"
                    alt="강의 영상 썸네일"
                    class="preview-thumbnail"
                    decoding="async"
                    loading="lazy"
                  />
                  <img
                    v-else
                    :src="lecture.image || '/src/assets/images/smu_mascort1.jpg'"
                    alt="기본 썸네일"
                    class="preview-thumbnail"
                    decoding="async"
                    loading="lazy"
                  />
                  
                  <!-- 세련된 플레이 버튼 -->
                  <div class="play-button-overlay">
                    <div class="play-button">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5V19L19 12L8 5Z" fill="white"/>
                      </svg>
                    </div>
                  </div>
                </div>

                 <!-- 화면에는 안 보이는 캡처용 비디오 (썸네일 생성만 담당) -->
                 <video
                   ref="hiddenVideo"
                   :src="previewVideoUrl"
                   preload="metadata"
                   muted
                   playsinline
                   crossOrigin="anonymous"
                   style="position:absolute; left:-9999px; width:1px; height:1px;"
                   @loadedmetadata="captureFirstFrame"
                   @error="onVideoError"
                 />
                 
                 <!-- 비디오 재생 시 표시되는 비디오 플레이어 -->
                 <video 
                   v-if="isVideoPlaying"
                   ref="previewVideo" 
                   class="preview-video" 
                   controls
                   @ended="onVideoEnded"
                 >
                   <source :src="previewVideoUrl" type="video/mp4">
                   브라우저가 비디오를 지원하지 않습니다.
                 </video>
              </div>
              <div class="video-info">
                <h3>강의 미리보기</h3>
                <p>{{ lecture.title }}</p>
              </div>
            </div>
          </div>

        <!-- 강의 커리큘럼 -->
        <div class="curriculum-section">
          <div class="section-header">
            <h2>강의 목록</h2>
            <span class="total-lessons">총 {{ lecture.lessons.length }}강</span>
          </div>
          <div class="lessons-list">
                         <div 
               v-for="(lesson, index) in lecture.lessons" 
               :key="index" 
               class="lesson-item"
               :class="{ 'preview': lesson.isPreview }"
               @click="handleLessonClick(lesson, index)"
               :title="getLessonTitle(lesson, index)"
             >
                             <div class="lesson-info">
                 <div class="lesson-icon">
                   <span v-if="!lesson.videoUrl" class="no-video-icon">⚠️</span>
                   <span v-else-if="lesson.isPreview" class="play-icon">▶</span>
                   <span v-else class="lock-icon">🔒</span>
                 </div>
                                                   <div class="lesson-content">
                    <h3>{{ lesson.title }}</h3>
                    <p>{{ lesson.description }}</p>
                  </div>
              </div>
              <div class="lesson-meta">
                <span class="duration">{{ lesson.duration }}</span>
                <span v-if="lesson.isPreview" class="preview-badge">미리보기</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 강사 소개 -->
        <div class="instructor-section">
          <h2>강사 소개</h2>
          <div class="instructor-info">
            <div class="instructor-avatar">
              <span>{{ lecture.instructor.name.charAt(0) }}</span>
            </div>
            <div class="instructor-details">
              <h3>{{ lecture.instructor.name }}</h3>
              <p>{{ lecture.instructor.title }}</p>
            </div>
          </div>
        </div>

        <!-- 리뷰 및 Q&A -->
        <div class="reviews-section">
          <div class="tabs">
            <button 
              :class="{ active: activeTab === 'reviews' }" 
              @click="activeTab = 'reviews'"
            >
              수강평 ({{ lecture.reviews.length }})
            </button>
            <button 
              :class="{ active: activeTab === 'qa' }" 
              @click="activeTab = 'qa'"
            >
              Q&A ({{ lecture.qa.length }})
            </button>
          </div>
          
          <div v-if="activeTab === 'reviews'" class="reviews-content">
            <div v-if="isPurchased" class="review-actions">
              <button class="write-review-btn" @click="showReviewModal = true">리뷰 작성하기</button>
            </div>
            <div v-else class="purchase-notice">
              <p>리뷰를 작성하려면 강의를 구매해주세요.</p>
              <button class="purchase-btn" @click="purchaseLecture">강의 구매하기</button>
            </div>
            
            <!-- 리뷰 목록 -->
            <div v-if="lecture.reviews.length > 0" class="reviews-list">
              <div v-for="review in paginatedReviews" :key="review.id" class="review-item">
                                 <div class="review-header">
                   <div class="reviewer-info">
                     <span class="reviewer-name">{{ review.writer }}</span>
                     <div class="rating">
                       <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">★</span>
                     </div>
                   </div>
                   <span class="review-date">{{ review.date }}</span>
                 </div>
                <div class="review-content">
                  <p>{{ review.content }}</p>
                </div>
              </div>
              
              <!-- 더 보기 버튼 -->
              <div v-if="showReviewsMoreButton" class="more-button-container">
                <button class="more-button" @click="loadMoreReviews">
                  더 보기
                </button>
              </div>
            </div>
            
            <div v-if="lecture.reviews.length === 0" class="no-reviews">
              <p>아직 리뷰가 없습니다.</p>
              <p>첫 번째 리뷰를 작성해보세요!</p>
            </div>
          </div>
          
          <div v-if="activeTab === 'qa'" class="qa-content">
            <button class="write-qa-btn" @click="showQAModal = true">질문하기</button>
            
                         <!-- Q&A 목록 -->
             <div v-if="lecture.qa.length > 0" class="qa-list">
               <div v-for="qa in paginatedQA" :key="qa.id" class="qa-item">
                 <div class="question">
                   <div class="question-header">
                     <div class="questioner-info">
                       <span class="questioner-name">{{ qa.questionerId }}</span>
                     </div>
                     <span class="question-date">{{ qa.questionDate }}</span>
                   </div>
                   <div class="question-content">
                     <p>{{ qa.question }}</p>
                   </div>
                 </div>
                 
                 <!-- 답글이 있는 경우에만 표시 -->
                 <div v-if="qa.hasAnswer" class="answer">
                   <div class="answer-content">
                     <div class="answer-header">
                       <span class="answerer-name">{{ qa.answererId }}</span>
                       <span class="answer-date">{{ qa.answerDate }}</span>
                     </div>
                     <p>{{ qa.answer }}</p>
                   </div>
                 </div>
               </div>
              
              <!-- 더 보기 버튼 -->
              <div v-if="showQAMoreButton" class="more-button-container">
                <button class="more-button" @click="loadMoreQA">
                  더 보기
                </button>
              </div>
            </div>
            
            <div v-if="lecture.qa.length === 0" class="no-qa">
              <p>아직 Q&A가 없습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 사이드바 -->
      <div class="sidebar">
        <!-- 구매 정보 -->
        <div class="purchase-section">
          <div class="price">{{ lecture.price.toLocaleString() }}원</div>
          <button 
            class="enroll-btn" 
            :class="{ 'in-cart': isInCart }"
            @click="enrollLecture"
          >
                          {{ isInCart ? '장바구니에 추가됨' : '장바구니에 담기' }}
          </button>
          <div class="share-section" @click="showShareModal = true">
            <span class="share-icon">📤</span>
            <span>공유하기</span>
          </div>
        </div>

        <!-- 강의 요약 -->
        <div class="course-summary">
          <div class="summary-item">
            <span class="label">총 강의 수</span>
            <span class="value">{{ lecture.lessons.length }}강</span>
          </div>
          <div class="summary-item">
            <span class="label">총 시간</span>
            <span class="value">{{ lecture.totalDuration }}</span>
          </div>
          <div class="summary-item">
            <span class="label">난이도</span>
            <span class="value">{{ lecture.level }}</span>
          </div>
          <div class="summary-item">
            <span class="label">수강생</span>
            <span class="value">{{ lecture.students }}명</span>
          </div>
          <div class="summary-item">
            <span class="label">평점</span>
            <span class="value">
              <span class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="getStarClass(i, lecture.rating || 0)">
                  ★
                </span>
              </span>
              {{ lecture.rating || 0 }}({{ lecture.ratingCount || 0 }})
            </span>
          </div>
        </div>

        <!-- 레시피 -->
        <div class="recipe-section">
          <h3>레시피 📖</h3>
          <div class="recipe-card">
            <h4>{{ lecture.recipe.title }}</h4>
            <p>{{ lecture.recipe.description }}</p>
            <div class="recipe-meta">
              <span>{{ lecture.recipe.servings }}</span>
              <span>{{ lecture.recipe.cookTime }}</span>
              <span>{{ lecture.recipe.difficulty }}</span>
            </div>
            
            <div class="ingredients">
              <h5>재료 ({{ lecture.recipe.servings }})</h5>
              <ul>
                <li v-for="ingredient in lecture.recipe.ingredients" :key="ingredient.name">
                  {{ ingredient.name }}: {{ ingredient.amount }}
                </li>
              </ul>
            </div>
            
            <div class="cooking-steps">
              <h5>조리 과정</h5>
              <ol>
                <li v-for="(step, index) in lecture.recipe.steps" :key="step">
                  <span class="step-number">{{ index + 1 }}</span>
                  <span class="step-text">{{ step }}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 로딩 상태 -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>강의 정보를 불러오는 중...</p>
    </div>

    <!-- 장바구니 추가 확인 모달 -->
    <div v-if="showCartModal" class="modal-overlay" @click="showCartModal = false">
      <div class="cart-modal" @click.stop>
        <div class="modal-header">
          <h3>장바구니 추가</h3>
          <button class="close-btn" @click="showCartModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="modal-icon">🛒</div>
          <p class="modal-message">장바구니에 추가하였습니다.</p>
          <p class="modal-submessage">장바구니로 이동하겠습니까?</p>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="goToCart">이동하기</button>
          <button class="btn-secondary" @click="showCartModal = false">취소</button>
        </div>
      </div>
    </div>

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

    <!-- 리뷰 작성 모달 -->
    <div v-if="showReviewModal" class="modal-overlay" @click="showReviewModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>리뷰 작성</h3>
          <button class="close-btn" @click="showReviewModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="rating-section">
            <label>평점</label>
            <div class="rating-input">
              <span 
                v-for="i in 5" 
                :key="i" 
                class="star-input" 
                :class="{ filled: i <= newReview.rating }"
                @click="newReview.rating = i"
              >★</span>
            </div>
          </div>
          <div class="content-section">
            <label>리뷰 내용</label>
            <textarea 
              v-model="newReview.content" 
              placeholder="강의에 대한 솔직한 리뷰를 작성해주세요."
              rows="5"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showReviewModal = false">취소</button>
          <button class="submit-btn" @click="submitReview">리뷰 등록</button>
        </div>
      </div>
    </div>

    <!-- Q&A 작성 모달 -->
    <div v-if="showQAModal" class="modal-overlay" @click="showQAModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>질문하기</h3>
          <button class="close-btn" @click="showQAModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="content-section">
            <label>질문 내용</label>
            <textarea 
              v-model="newQuestion.content" 
              placeholder="강의에 대한 궁금한 점을 질문해주세요."
              rows="5"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showQAModal = false">취소</button>
          <button class="submit-btn" @click="submitQuestion">질문 등록</button>
        </div>
      </div>
    </div>

    <!-- 알림 모달 -->
    <div v-if="showNotificationModal" class="modal-overlay" @click="showNotificationModal = false">
      <div class="cart-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ notificationData.title }}</h3>
          <button class="close-btn" @click="showNotificationModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="modal-icon">{{ notificationData.icon }}</div>
          <p class="modal-message">{{ notificationData.message }}</p>
          <p v-if="notificationData.submessage" class="modal-submessage">{{ notificationData.submessage }}</p>
        </div>
        <div class="modal-actions">
          <button 
            v-if="notificationData.primaryAction" 
            class="btn-primary" 
            @click="handlePrimaryAction"
          >
            {{ notificationData.primaryAction.text }}
          </button>
          <button class="btn-secondary" @click="showNotificationModal = false">확인</button>
        </div>
      </div>
    </div>

    <!-- 에러 모달 -->
    <div v-if="showErrorModal" class="modal-overlay" @click="showErrorModal = false">
      <div class="cart-modal" @click.stop>
        <div class="modal-header">
          <h3>오류</h3>
          <button class="close-btn" @click="showErrorModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="modal-icon">⚠️</div>
          <p class="modal-message">{{ errorMessage }}</p>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showErrorModal = false">확인</button>
        </div>
      </div>
    </div>

    <!-- 성공 모달 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="showSuccessModal = false">
      <div class="cart-modal" @click.stop>
        <div class="modal-header">
          <h3>완료</h3>
          <button class="close-btn" @click="showSuccessModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="modal-icon">✅</div>
          <p class="modal-message">{{ successMessage }}</p>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="showSuccessModal = false">확인</button>
        </div>
      </div>
    </div>

         <!-- 확인 모달 -->
     <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
       <div class="cart-modal" @click.stop>
         <div class="modal-header">
           <h3>{{ confirmData.title }}</h3>
           <button class="close-btn" @click="showConfirmModal = false">×</button>
         </div>
         <div class="modal-content">
           <div class="modal-icon">{{ confirmData.icon }}</div>
           <p class="modal-message">{{ confirmData.message }}</p>
           <p v-if="confirmData.submessage" class="modal-submessage">{{ confirmData.submessage }}</p>
         </div>
         <div class="modal-actions">
           <button class="btn-primary" @click="handleConfirmAction">{{ confirmData.confirmText }}</button>
           <button class="btn-secondary" @click="showConfirmModal = false">취소</button>
         </div>
       </div>
     </div>

     <!-- 구매 제한 모달 -->
     <div v-if="showPurchaseRequiredModal" class="modal-overlay" @click="showPurchaseRequiredModal = false">
       <div class="cart-modal" @click.stop>
         <div class="modal-header">
           <h3>구매 필요</h3>
           <button class="close-btn" @click="showPurchaseRequiredModal = false">×</button>
         </div>
         <div class="modal-content">
           <div class="modal-icon">🔒</div>
           <p class="modal-message">이 강의를 시청하려면 구매가 필요합니다.</p>
           <p class="modal-submessage">첫 번째 강의만 미리보기가 가능합니다.</p>
         </div>
         <div class="modal-actions">
           <button class="btn-primary" @click="showPurchaseRequiredModal = false">확인</button>
         </div>
       </div>
     </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import { useCartStore } from '@/views/cart/cart.js';
import { lectureService } from '@/views/home/lectureService';

export default {
  name: 'LectureDetail',
  components: { Header },
  data() {
    return {
      activeTab: 'reviews',
      lecture: null,
      showShareModal: false,
      showReviewModal: false,
      showQAModal: false,
      showCartModal: false,
             showNotificationModal: false,
       showErrorModal: false,
       showSuccessModal: false,
       showConfirmModal: false,
       showPurchaseRequiredModal: false,
      notificationData: {},
      errorMessage: '',
      successMessage: '',
      confirmData: {},
      newReview: {
        rating: 0,
        content: ''
      },
      newQuestion: {
        content: ''
      },
      // 구매 상태 (실제로는 API에서 확인)
      isPurchased: false,
             // 페이지네이션 설정
       reviewsPerPage: 5,
       qaPerPage: 5,
       currentReviewsPage: 1,
       currentQAPage: 1,
       // 비디오 재생 상태
       isVideoPlaying: false,
       previewVideoUrl: '',
       // 장바구니 스토어
       cartStore: null,
       // 백엔드에서 확인한 장바구니 상태
       isInCart: false,
               // 비디오 썸네일 관련
        videoThumb: null   // 생성된 영상 썸네일
    };
  },
  computed: {
    // 페이지네이션된 리뷰 목록
    paginatedReviews() {
      if (!this.lecture || !this.lecture.reviews) return [];
      const startIndex = 0;
      const endIndex = this.currentReviewsPage * this.reviewsPerPage;
      return this.lecture.reviews.slice(startIndex, endIndex);
    },
    
    // 페이지네이션된 Q&A 목록
    paginatedQA() {
      if (!this.lecture || !this.lecture.qa) return [];
      const startIndex = 0;
      const endIndex = this.currentQAPage * this.qaPerPage;
      return this.lecture.qa.slice(startIndex, endIndex);
    },
    
    // 리뷰 더 보기 버튼 표시 여부
    showReviewsMoreButton() {
      if (!this.lecture || !this.lecture.reviews) return false;
      return this.currentReviewsPage * this.reviewsPerPage < this.lecture.reviews.length;
    },
    
    // Q&A 더 보기 버튼 표시 여부
    showQAMoreButton() {
      if (!this.lecture || !this.lecture.qa) return false;
      return this.currentQAPage * this.qaPerPage < this.lecture.qa.length;
    }
  },
  methods: {
    // 장바구니 상태 확인 (백엔드 API 사용)
    async checkCartStatus(lectureId) {
      try {
        const response = await lectureService.getCartItems();
        if (response.success) {
          // 현재 강의가 장바구니에 있는지 확인
          this.isInCart = response.data.some(item => item.lectureId === lectureId);
          console.log('장바구니 상태 확인:', this.isInCart);
        }
      } catch (error) {
        console.error('장바구니 상태 확인 실패:', error);
        this.isInCart = false;
      }
    },

         // 강의 데이터를 받아오는 메서드 (백엔드 API 호출)
     async fetchLectureData(lectureId) {
       console.log('강의 ID:', lectureId, typeof lectureId);
       
               // 썸네일 상태 초기화
        this.videoThumb = null;
       
       try {
        const response = await lectureService.getLectureDetail(lectureId);
        
        if (response.success) {
          const lectureData = response.data;
          console.log('백엔드에서 받은 강의 데이터:', lectureData);
          
                     // 백엔드 데이터를 프론트엔드 형식으로 변환
           this.lecture = {
             id: lectureData.lectureId,
             title: lectureData.title,
             description: lectureData.description,
             category: this.getCategoryName(lectureData.category),
             level: this.getLevelName(lectureData.level),
             price: lectureData.price,
             reviewCount: lectureData.reviewCount,
             qnaCount: lectureData.qnaCount,
             totalDuration: this.calculateTotalDuration(lectureData.lectureVideoResDtoList),
             instructor: {
               name: lectureData.name,
               title: '요리 전문가'
             },
             lessons: this.convertVideosToLessons(lectureData.lectureVideoResDtoList),
             reviews: this.convertReviews(lectureData.lectureReviewResDtoList),
             qa: this.convertQA(lectureData.qnaList),
             recipe: this.convertRecipe(lectureData.ingredResDtoList, lectureData.lectureStepResDtoList),
             // 백엔드에서 제공하는 평균 평점 사용
             rating: lectureData.reviewAvg || 0,
             ratingCount: lectureData.reviewCount,
                           students: lectureData.purchaseCount || 0, // 구매한 수강생 수
             // 장바구니용 필드들
             image: lectureData.thumbUrl || '/src/assets/images/smu_mascort1.jpg', // 썸네일 URL
             teacher: lectureData.name // 강사명
           };
        } else {
          console.error('강의 상세 조회 실패:', response.message);
          this.showError('강의 정보를 불러오는데 실패했습니다.');
        }
        
                 // 장바구니 상태 확인
         await this.checkCartStatus(lectureId);
         
                   // 미리보기 비디오 URL 설정
          const previewLesson = this.lecture.lessons.find(lesson => lesson.isPreview && lesson.videoUrl);
          if (previewLesson && previewLesson.videoUrl) {
            this.previewVideoUrl = previewLesson.videoUrl;
            console.log('미리보기 비디오 URL 설정:', this.previewVideoUrl);
          } else {
            // 미리보기 강의가 없으면 첫 번째 강의 사용
            const firstLesson = this.lecture.lessons.find(lesson => lesson.videoUrl);
            if (firstLesson && firstLesson.videoUrl) {
              this.previewVideoUrl = firstLesson.videoUrl;
              console.log('첫 번째 강의 비디오 URL 설정:', this.previewVideoUrl);
            }
          }
          
          // 비디오 URL이 설정된 후 썸네일 생성을 위해 nextTick 사용
          if (this.previewVideoUrl) {
            this.$nextTick(() => {
              // 숨겨진 비디오가 로드되면 썸네일 생성
              if (this.$refs.hiddenVideo) {
                console.log('숨겨진 비디오 요소 확인됨, 썸네일 생성 시작');
              }
            });
          }
      } catch (error) {
        console.error('강의 상세 조회 오류:', error);
        this.showError('서버 연결에 실패했습니다.');
        setTimeout(() => {
          this.$router.push({ name: 'LectureList' });
        }, 2000);
      }
    },
    
    // 카테고리 이름 변환
    getCategoryName(category) {
      const categoryMap = {
        'KOREAN': '한식',
        'WESTERN': '양식',
        'JAPANESE': '일식',
        'CHINESE': '중식',
        'DESSERT': '디저트'
      };
      return categoryMap[category] || category;
    },
    
    // 난이도 이름 변환
    getLevelName(level) {
      const levelMap = {
        'LOW': '초급',
        'MEDIUM': '중급',
        'HIGH': '고급'
      };
      return levelMap[level] || level;
    },
    
    // 총 강의 시간 계산 (duration은 초 단위)
    calculateTotalDuration(videos) {
      if (!videos || videos.length === 0) return '0분';
      
      const totalSeconds = videos.reduce((total, video) => {
        return total + (video.duration || 0);
      }, 0);
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      if (hours > 0) {
        return `${hours}시간 ${minutes}분`;
      } else if (minutes > 0) {
        return `${minutes}분 ${seconds}초`;
      } else {
        return `${seconds}초`;
      }
    },
    
    // 비디오를 강의 목록으로 변환
    convertVideosToLessons(videos) {
      if (!videos || videos.length === 0) return [];
      
      return videos.map((video, index) => {
        // duration을 초 단위로 처리하여 분:초 형식으로 변환
        const durationSeconds = video.duration || 0;
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;
        const durationText = minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;
        
        return {
          title: video.title || `강의 ${index + 1}`,
          description: `강의 ${index + 1}입니다.`,
          duration: durationText,
          isPreview: video.preview || false,
          videoUrl: video.videoUrl,
          sequence: video.sequence || index + 1
        };
      });
    },
    
         // 리뷰 데이터 변환
     convertReviews(reviews) {
       if (!reviews || reviews.length === 0) return [];
       
       return reviews.map(review => ({
         id: Math.random().toString(36).substr(2, 9),
         writer: review.writer,
         rating: review.rating,
         content: review.content,
         date: new Date().toLocaleDateString('ko-KR')
       }));
     },
    
         // Q&A 데이터 변환 (질문-답글 구조)
     convertQA(qaList) {
       if (!qaList || qaList.length === 0) return [];
       
       return qaList.map(qa => ({
         id: Math.random().toString(36).substr(2, 9),
         questionerId: qa.parentName || '익명',
         question: qa.parentContent,
         questionDate: this.formatDate(qa.parentCreatedAt),
         // 답글이 있는 경우에만 답글 정보 포함
         hasAnswer: !!(qa.answerContent && qa.answerName),
         answer: qa.answerContent || null,
         answererId: qa.answerName || null,
         answerDate: qa.answerCreatedAt ? this.formatDate(qa.answerCreatedAt) : null
       }));
     },
     
     // 날짜 포맷팅 메서드
     formatDate(dateString) {
       if (!dateString) return '';
       const date = new Date(dateString);
       return date.toLocaleDateString('ko-KR');
     },
    
    // 레시피 데이터 변환
    convertRecipe(ingredients, steps) {
      return {
        title: '레시피',
        description: '강의에서 배우는 레시피입니다.',
        servings: '2인분',
        cookTime: '30분',
        difficulty: '초급',
        ingredients: ingredients ? ingredients.map(ing => ({
          name: ing.ingredientsName,
          amount: ing.amount
        })) : [],
        steps: steps ? steps.map(step => step.content) : []
      };
    },
    
         // 비디오 미리보기 재생 메서드
     playPreviewVideo() {
       // 첫 번째 미리보기 비디오 찾기
       const previewLesson = this.lecture.lessons.find(lesson => lesson.isPreview && lesson.videoUrl);
       
       if (previewLesson && previewLesson.videoUrl) {
         this.previewVideoUrl = previewLesson.videoUrl;
         this.isVideoPlaying = true;
         
         // 비디오 요소가 렌더링된 후 재생
         this.$nextTick(() => {
           if (this.$refs.previewVideo) {
             this.$refs.previewVideo.play().catch(error => {
               console.error('비디오 재생 실패:', error);
               this.showError('비디오 재생에 실패했습니다.');
               this.isVideoPlaying = false;
             });
           }
         });
       } else {
         this.showError('미리보기 비디오를 찾을 수 없습니다.');
       }
     },
     
     // 비디오 종료 시 처리
     onVideoEnded() {
       this.isVideoPlaying = false;
       this.previewVideoUrl = '';
     },
     
     // 비디오 재생 메서드
     playVideo(lesson) {
       console.log('비디오 재생 시도:', lesson);
       
       if (lesson.videoUrl) {
         console.log('비디오 URL:', lesson.videoUrl);
         
         // URL이 유효한지 확인
         try {
           const url = new URL(lesson.videoUrl);
           console.log('유효한 URL:', url.href);
           
           // 새 탭에서 비디오 URL 열기
           window.open(lesson.videoUrl, '_blank');
         } catch (error) {
           console.error('잘못된 URL 형식:', lesson.videoUrl);
           this.showError('잘못된 비디오 URL 형식입니다.');
         }
       } else {
         console.error('비디오 URL이 없음');
         this.showError('비디오 URL이 없습니다.');
       }
     },
    
    

    // 공유 기능 메서드들
    getShareUrl() {
      return `${window.location.origin}/lectures/${this.lecture.id}`;
    },

    getShareText() {
      return `${this.lecture.title} - ${this.lecture.description}`;
    },

    shareToFacebook() {
      const url = encodeURIComponent(this.getShareUrl());
      const text = encodeURIComponent(this.getShareText());
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
      this.showShareModal = false;
    },

    shareToKakaoTalk() {
      // Kakao SDK 초기화
      if (typeof Kakao !== 'undefined') {
        if (!Kakao.isInitialized()) {
          Kakao.init("3a1a982f8ee6ddbc64171c2f80850243");
        }
        
        // Kakao Link 전송
        Kakao.Link.sendDefault({
          objectType: 'feed',
          content: {
            title: `🔥 ${this.lecture.title}`,
            description: this.lecture.description,
            imageUrl: this.lecture.image || 'https://yourdomain.com/images/share-thumb.png',
            link: {
              mobileWebUrl: this.getShareUrl(),
              webUrl: this.getShareUrl(),
            },
          },
          buttons: [
            {
              title: '강의 보러가기',
              link: {
                mobileWebUrl: this.getShareUrl(),
                webUrl: this.getShareUrl(),
              },
            },
          ],
        });
      } else {
        // Kakao SDK가 로드되지 않은 경우 링크 복사로 대체
        this.copyToClipboard();
      }
      this.showShareModal = false;
    },

    shareToInstagram() {
      // 인스타그램 공유 개선: 모바일에서는 인스타그램 앱으로, 데스크톱에서는 링크 복사
      if (this.isMobile()) {
        // 모바일에서는 인스타그램 앱으로 공유 시도
        const shareUrl = `instagram://library?AssetPickerSourceType=1`;
        window.location.href = shareUrl;
        
        // 3초 후 링크 복사로 대체 (인스타그램 앱이 없거나 실패한 경우)
        setTimeout(() => {
          this.copyToClipboard();
        }, 3000);
      } else {
        // 데스크톱에서는 인스타그램 웹으로 이동
        const instagramUrl = `https://www.instagram.com/`;
        window.open(instagramUrl, '_blank');
        
        // 동시에 링크 복사
        setTimeout(() => {
          this.copyToClipboard();
        }, 1000);
      }
    },

    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    async copyToClipboard() {
      try {
        const shareText = `${this.getShareText()}\n\n${this.getShareUrl()}`;
        await navigator.clipboard.writeText(shareText);
        this.showNotification({
          title: '링크 복사',
          icon: '🔗',
          message: '링크가 클립보드에 복사되었습니다!'
        });
        this.showShareModal = false;
      } catch (err) {
        console.error('클립보드 복사 실패:', err);
        this.showError('링크 복사에 실패했습니다. 수동으로 복사해주세요.');
      }
    },

    // 리뷰 제출
    submitReview() {
      if (this.newReview.rating === 0) {
        this.showError('평점을 선택해주세요.');
        return;
      }
      
      if (!this.newReview.content.trim()) {
        this.showError('리뷰 내용을 작성해주세요.');
        return;
      }

      // 새로운 리뷰 객체 생성
      const review = {
        id: Date.now(),
        reviewerId: 'user123', // 실제로는 로그인된 사용자 ID
        rating: this.newReview.rating,
        content: this.newReview.content,
        date: new Date().toLocaleDateString('ko-KR')
      };

      // 리뷰 추가
      this.lecture.reviews.push(review);

      // 평점 업데이트
      this.updateLectureRating();

      // 모달 닫기 및 폼 초기화
      this.showReviewModal = false;
      this.newReview = { rating: 0, content: '' };

      this.showSuccess('리뷰가 등록되었습니다!');
    },

    // Q&A 제출
    submitQuestion() {
      if (!this.newQuestion.content.trim()) {
        this.showError('질문 내용을 작성해주세요.');
        return;
      }

      // 새로운 Q&A 객체 생성
      const qa = {
        id: Date.now(),
        questionerId: 'user123', // 실제로는 로그인된 사용자 ID
        question: this.newQuestion.content,
        questionDate: new Date().toLocaleDateString('ko-KR'),
        answer: null,
        answererId: null,
        answerDate: null
      };

      // Q&A 추가
      this.lecture.qa.push(qa);

      // 모달 닫기 및 폼 초기화
      this.showQAModal = false;
      this.newQuestion = { content: '' };

      this.showSuccess('질문이 등록되었습니다!');
    },

    // 강의 평점 업데이트
    updateLectureRating() {
      if (this.lecture.reviews.length === 0) {
        this.lecture.rating = 0;
        this.lecture.ratingCount = 0;
        return;
      }

      const totalRating = this.lecture.reviews.reduce((sum, review) => sum + review.rating, 0);
      this.lecture.rating = (totalRating / this.lecture.reviews.length).toFixed(1);
      this.lecture.ratingCount = this.lecture.reviews.length;
    },

    // 강의 구매
    purchaseLecture() {
      // 실제로는 결제 API 호출
      this.isPurchased = true;
      this.showNotification({
        title: '구매 완료',
        icon: '🎉',
        message: '강의가 구매되었습니다!',
        submessage: '이제 리뷰를 작성할 수 있습니다.'
      });
    },

    // 장바구니에 강의 추가/제거 (토글 기능)
    async enrollLecture() {
      console.log('enrollLecture 메서드 호출됨');
      console.log('현재 강의:', this.lecture);
      
      if (!this.lecture) {
        this.showError('강의 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // 이미 장바구니에 있는 경우 - 제거
      if (this.isInCart) {
        this.showConfirm({
          title: '장바구니 제거',
          icon: '🗑️',
          message: '장바구니에서 강의를 제거하시겠습니까?',
          confirmText: '제거하기',
          callback: async () => {
            try {
              // 백엔드 API로 장바구니 삭제 요청
              const response = await lectureService.removeFromCart(this.lecture.id);
              
              if (response.success) {
                // 백엔드 성공 시 상태 업데이트
                this.isInCart = false;
                this.showSuccess('장바구니에서 강의가 제거되었습니다.');
              } else {
                this.showError(response.message || '장바구니에서 제거에 실패했습니다.');
              }
            } catch (error) {
              console.error('장바구니 삭제 오류:', error);
              this.showError('장바구니에서 제거에 실패했습니다. 다시 시도해주세요.');
            }
          }
        });
        return;
      }

      try {
        // 백엔드 API로 장바구니 추가 요청
        const response = await lectureService.addToCart([this.lecture.id]);
        
        if (response.success) {
          // 백엔드 성공 시 상태 업데이트
          this.isInCart = true;
          this.showCartModal = true;
        } else {
          this.showError(response.message || '장바구니 추가에 실패했습니다.');
        }
      } catch (error) {
        console.error('장바구니 추가 오류:', error);
        if (error.message && error.message.includes('이미 장바구니에 담긴 강의입니다')) {
          this.showError('이미 장바구니에 담긴 강의입니다.');
        } else {
          this.showError('장바구니 추가에 실패했습니다. 다시 시도해주세요.');
        }
      }
    },

    // 장바구니로 이동
    goToCart() {
      this.showCartModal = false;
      this.$router.push('/cart');
    },
    
    // 리뷰 더 보기 버튼 클릭
    loadMoreReviews() {
      this.currentReviewsPage++;
    },
    
    // Q&A 더 보기 버튼 클릭
    loadMoreQA() {
      this.currentQAPage++;
    },

    // 모달 관련 헬퍼 메서드들
    showError(message) {
      this.errorMessage = message;
      this.showErrorModal = true;
    },

    showSuccess(message) {
      this.successMessage = message;
      this.showSuccessModal = true;
    },

    showNotification(data) {
      this.notificationData = data;
      this.showNotificationModal = true;
    },

    showConfirm(data) {
      this.confirmData = data;
      this.showConfirmModal = true;
    },

    handlePrimaryAction() {
      if (this.notificationData.primaryAction && this.notificationData.primaryAction.callback) {
        this.notificationData.primaryAction.callback();
      }
      this.showNotificationModal = false;
    },

    handleConfirmAction() {
      if (this.confirmData.callback) {
        this.confirmData.callback();
      }
      this.showConfirmModal = false;
    },

               // 별점 표시를 위한 클래스 계산
      getStarClass(starIndex, rating) {
        const numRating = parseFloat(rating);
        
        if (numRating === 0) {
          return ''; // 별 없음
        }
        
        // 정수 부분만큼 완전히 채워진 별
        if (starIndex <= Math.floor(numRating)) {
          return 'filled';
        }
        
        // 소수점이 있는 경우 부분적으로 채워진 별
        if (starIndex === Math.ceil(numRating) && numRating % 1 !== 0) {
          const decimal = numRating % 1;
          if (decimal <= 0.2) return 'partially-filled-1';
          if (decimal <= 0.4) return 'partially-filled-2';
          if (decimal <= 0.6) return 'partially-filled-3';
          if (decimal <= 0.8) return 'partially-filled-4';
          return 'partially-filled-5';
        }
        
        return ''; // 빈 별
      },

                                         // 비디오 메타데이터 로드 시 썸네일 생성
        async captureFirstFrame() {
          const v = this.$refs.hiddenVideo;
          if (!v) return;
          
          try {
            // 0.1초로 시킹 후 'seeked' 대기
            const waitSeeked = new Promise(resolve => 
              v.addEventListener('seeked', resolve, { once: true })
            );
            v.currentTime = 0.1;
            await waitSeeked;

            // 캔버스에 그려 dataURL로 만들기
            const canvas = document.createElement('canvas');
            canvas.width = v.videoWidth;
            canvas.height = v.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

            // 고품질 JPEG dataURL 생성
            this.videoThumb = canvas.toDataURL('image/jpeg', 0.9);
          } catch (e) {
            console.warn('썸네일 생성 실패:', e);
          }
        },

        // 비디오 로드 에러 처리
        onVideoError() {
          console.error('비디오 로드 실패');
        },

     // 강의 클릭 처리 (구매 상태 확인)
     handleLessonClick(lesson, index) {
       // 첫 번째 강의(인덱스 0)는 미리보기 가능
       if (index === 0) {
         this.playVideo(lesson);
         return;
       }
       
       // 구매하지 않은 사용자는 첫 번째 강의 외에는 접근 불가
       if (!this.isPurchased) {
         this.showPurchaseRequiredModal = true;
         return;
       }
       
       // 구매한 사용자는 모든 강의 접근 가능
       this.playVideo(lesson);
     },

     // 강의 제목 툴팁 생성
     getLessonTitle(lesson, index) {
       if (!lesson.videoUrl) {
         return '비디오를 사용할 수 없습니다';
       }
       
       if (index === 0) {
         return '클릭하여 비디오 재생 (미리보기)';
       }
       
       if (!this.isPurchased) {
         return '구매 후 시청 가능';
       }
       
       return '클릭하여 비디오 재생';
     },

     
  },
  mounted() {
    // 장바구니 스토어 초기화
    this.cartStore = useCartStore();
    
    // URL 파라미터에서 강의 ID를 가져와서 데이터 로드
    const lectureId = this.$route.params.id;
    if (lectureId) {
      this.fetchLectureData(lectureId);
    }
    
    // Kakao SDK 초기화
    if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
      Kakao.init("3a1a982f8ee6ddbc64171c2f80850243");
    }
  }
};
</script>

<style scoped>
.lecture-detail-page {
  background: #fafbfc;
  min-height: 100vh;
  margin-top: 64px;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
}

.main-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.lecture-header {
  margin-bottom: 40px;
}

.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.tag.cuisine {
  background: #e8f5e8;
  color: #2d5a2d;
}

.tag.level {
  background: #e3f2fd;
  color: #1565c0;
}

.lecture-title {
  font-size: 32px;
  font-weight: 700;
  color: #222;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.lecture-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.video-preview {
  margin-bottom: 40px;
}

.video-container {
  border-radius: 12px;
  overflow: hidden;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

 .video-placeholder {
   background: #2c3e50;
   height: 300px;
   display: flex;
   align-items: center;
   justify-content: center;
   position: relative;
   cursor: pointer;
   overflow: hidden;
 }
 
 .video-thumbnail-container {
   position: relative;
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   justify-content: center;
 }
 
     .preview-thumbnail {
   width: 100%;
   height: 100%;
   object-fit: cover;
   position: absolute;
   top: 0;
   left: 0;
   display: block;
 }

   .thumb-skeleton {
    width: 100%;
    height: 100%;
    background: #eee;
    position: absolute;
    top: 0;
    left: 0;
  }

  /* 세련된 플레이 버튼 스타일 */
  .play-button-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  }

  .video-thumbnail-container:hover .play-button-overlay {
    background: rgba(0, 0, 0, 0.5);
  }

  .play-button {
    width: 60px;
    height: 60px;
    background: rgba(255, 122, 0, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .play-button:hover {
    background: rgba(255, 122, 0, 1);
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
  }

  .play-button svg {
    width: 20px;
    height: 20px;
    margin-left: 2px; /* 삼각형을 정확히 중앙으로 조정 */
  }
  

 


.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

 

.video-info {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.video-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.video-info p {
  margin: 0;
  color: #666;
}

.curriculum-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.total-lessons {
  color: #666;
  font-size: 14px;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lesson-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lesson-item:hover {
  border-color: #ff7a00;
  box-shadow: 0 2px 8px rgba(255, 122, 0, 0.1);
}

.lesson-item.preview {
  border-color: #ff7a00;
  background: #fff8f0;
}

.lesson-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.lesson-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.play-icon {
  color: #ff7a00;
}

.lock-icon {
  color: #999;
}

.no-video-icon {
  color: #ff6b6b;
  font-size: 14px;
}

.lesson-content h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.lesson-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.duration {
  color: #666;
  font-size: 14px;
}

.preview-badge {
  background: #ff7a00;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.instructor-section {
  margin-bottom: 40px;
}

.instructor-section h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.instructor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: #666;
}

.instructor-details h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

.instructor-details p {
  margin: 0;
  color: #666;
}

.reviews-section {
  margin-bottom: 40px;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.tabs button {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  color: #ff7a00;
  border-bottom-color: #ff7a00;
}

.write-review-btn, .write-qa-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
}

.reviews-list, .qa-list {
  margin-top: 24px;
}

.review-item, .qa-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  background: white;
}

.review-header, .question-header, .answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-name, .questioner-name, .answerer-name {
  font-weight: 600;
  color: #333;
}

.review-date, .question-date, .answer-date {
  color: #999;
  font-size: 14px;
}

.rating {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 16px;
  cursor: pointer;
}

.star.filled {
  color: #ff7a00;
}

.review-content, .question-content, .answer-content {
  color: #666;
  line-height: 1.6;
}

.question {
  margin-bottom: 16px;
}

.questioner-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.answer {
  margin-top: 12px;
  margin-left: 20px;
  position: relative;
}

.answer-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #ff7a00;
}

.purchase-notice {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 24px;
}

.purchase-notice p {
  margin: 0 0 16px 0;
  color: #666;
}

.purchase-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.purchase-btn:hover {
  background: #e65c00;
}

.more-button-container {
  text-align: center;
  margin-top: 24px;
}

.more-button {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.more-button:hover {
  background: #e9ecef;
  color: #495057;
  border-color: #adb5bd;
}

.no-reviews, .no-qa {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.purchase-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: #ff7a00;
  margin-bottom: 16px;
}

.enroll-btn {
  width: 100%;
  background: #ff7a00;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.enroll-btn:hover {
  background: #e65c00;
  transform: translateY(-1px);
}

.enroll-btn.in-cart {
  background: #28a745;
  cursor: default;
}

.enroll-btn.in-cart:hover {
  background: #28a745;
  transform: none;
}

.share-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}



.course-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  color: #666;
  font-size: 14px;
}

.summary-item .value {
  font-weight: 600;
  color: #222;
}

.recipe-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.recipe-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recipe-card h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.recipe-card p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.recipe-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.ingredients, .cooking-steps {
  margin-bottom: 20px;
}

.ingredients h5, .cooking-steps h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.ingredients ul {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #666;
}

.ingredients li {
  margin-bottom: 4px;
}

.cooking-steps ol {
  margin: 0;
  padding-left: 0;
  font-size: 14px;
  color: #666;
  list-style: none;
}

.cooking-steps li {
  margin-bottom: 12px;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #ff7a00;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
}

@media (max-width: 1024px) {
  .detail-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 24px;
  }
  
  .lecture-title {
    font-size: 24px;
  }
  
  .lesson-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .lesson-meta {
    align-self: flex-end;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff7a00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
  font-size: 16px;
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
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.share-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
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
  border-radius: 12px;
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

/* 모달 스타일 */
.modal-overlay {
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

.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* 장바구니 모달 스타일 */
.cart-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #222;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
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
  background: #f5f5f5;
  color: #666;
}

.modal-content {
  margin-bottom: 32px;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-message {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 8px;
}

.modal-submessage {
  font-size: 14px;
  color: #666;
  margin-bottom: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  min-width: 100px;
}

.btn-primary {
  background: #FF6B35;
  color: white;
}

.btn-primary:hover {
  background: #e55a2b;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.modal-content {
  margin-bottom: 24px;
}

.rating-section, .content-section {
  margin-bottom: 20px;
}

.rating-section label, .content-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.rating-input {
  display: flex;
  gap: 8px;
}

.star-input {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star-input.filled {
  color: #ff7a00;
}

.star-input:hover {
  color: #ff7a00;
}

.content-section textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.content-section textarea:focus {
  outline: none;
  border-color: #ff7a00;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn, .submit-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.submit-btn {
  background: #ff7a00;
  color: white;
}

/* 별점 스타일 */
.stars {
  display: inline-flex;
  gap: 2px;
  margin-right: 8px;
}

.star {
  color: #ddd;
  font-size: 16px;
  position: relative;
}

.star.filled {
  color: #ffc107;
}

.star.partially-filled-1 {
  background: linear-gradient(90deg, #ffc107 20%, #ddd 20%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star.partially-filled-2 {
  background: linear-gradient(90deg, #ffc107 40%, #ddd 40%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star.partially-filled-3 {
  background: linear-gradient(90deg, #ffc107 60%, #ddd 60%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star.partially-filled-4 {
  background: linear-gradient(90deg, #ffc107 80%, #ddd 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star.partially-filled-5 {
  background: linear-gradient(90deg, #ffc107 100%, #ddd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

 .submit-btn:hover {
   background: #e65c00;
 }



 /* 구매하지 않은 강의 스타일 */
 .lesson-item:not(.preview) {
   opacity: 0.8;
   position: relative;
 }

 .lesson-item:not(.preview)::after {
   content: '🔒';
   position: absolute;
   top: 10px;
   right: 10px;
   font-size: 16px;
   color: #999;
 }
</style> 