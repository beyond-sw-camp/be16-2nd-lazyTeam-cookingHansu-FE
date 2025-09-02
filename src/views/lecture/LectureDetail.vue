<template>
  <div class="lecture-detail-page">
    <div v-if="lecture" class="detail-container">
      <!-- 메인 콘텐츠 영역 -->
      <div class="main-content">
                 <!-- 강의 제목 및 설명 -->
         <div class="lecture-header">
           <div class="tags">
             <span class="tag cuisine">{{ lecture.category }}</span>
             <span class="tag level">{{ lecture.level }}</span>
           </div>
           <div class="title-section">
             <h1 class="lecture-title">{{ lecture.title }}</h1>
             <!-- 강의 상단 수정/삭제 버튼 -->
             <div v-if="ready && showEditButton" class="top-edit-button">
               <button 
                 class="edit-lecture-btn" 
                 @click="editLecture"
               >
                 ✏️ 강의 수정하기
               </button>
               <button 
                 class="delete-lecture-btn" 
                 @click="showDeleteConfirm"
               >
                 🗑️ 강의 삭제하기
               </button>
             </div>
           </div>
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
                   @timeupdate="onVideoTimeUpdate"
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
              :class="{ 
                'preview': lesson.isPreview,
                'can-watch': canWatchLecture,
                'active': activeLessonIndex === index
              }"
              @click="handleLessonClick(lesson, index)"
              :title="getLessonTitle(lesson, index)"
            >
              <div class="lesson-info">
                <div class="lesson-icon">
                  <span v-if="!lesson.videoUrl" class="no-video-icon">⚠️</span>
                  <span v-else-if="!canWatchLecture && !lesson.isPreview" class="lock-icon">🔒</span>
                  <span v-else class="play-icon">▶</span>
                </div>

                <div class="lesson-content">
                  <h3>{{ lesson.description }}</h3>
                  <p>{{ lesson.title }}</p>
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
          <div class="instructor-avatar" @click="handleProfileClick($event, lecture.instructor.id, lecture.instructor.name)">
            <img 
              v-if="lecture.submittedByProfile" 
              :src="lecture.submittedByProfile" 
              :alt="lecture.instructor.name + ' 프로필 이미지'"
              class="instructor-profile-img"
            />
            <span v-else>{{ lecture.instructor.name.charAt(0) }}</span>
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
             <!-- 리뷰 작성 버튼 (로그인한 사용자 중 리뷰 작성 가능하고 아직 리뷰를 작성하지 않은 사용자만 표시) -->
             <div v-if="showReviewWriteButton" class="review-actions">
               <button class="write-review-btn" @click="handleReviewWrite">리뷰 작성하기</button>
             </div>
            
            <!-- 리뷰 목록 -->
            <div v-if="lecture.reviews.length > 0" class="reviews-list">
                             <div v-for="review in paginatedReviews" :key="review.id" class="review-item">
                                  <div class="review-header">
                    <div class="reviewer-info">
                      <div class="reviewer-profile" @click="handleProfileClick($event, review.reviewerId, review.writer)">
                        <img 
                          v-if="review.profileUrl" 
                          :src="review.profileUrl" 
                          :alt="review.writer + ' 프로필 이미지'"
                          class="reviewer-profile-img"
                        />
                        <div v-else class="reviewer-profile-placeholder">
                          {{ review.writer.charAt(0) }}
                        </div>
                      </div>
                      <div class="reviewer-details">
                        <span class="reviewer-name">{{ review.writer }}</span>
                        <div class="rating">
                          <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">★</span>
                        </div>
                      </div>
                    </div>
                    <div class="review-actions">
                      <span class="review-date">{{ review.date }}</span>
                    </div>
                  </div>
                 <div class="review-content">
                   <p>{{ review.content }}</p>
                   <!-- 자신이 작성한 리뷰인 경우 수정/삭제 텍스트 표시 -->
                   <div v-if="canEditReview(review)" class="review-edit-actions">
                     <span class="edit-text" @click="editReview(review)">수정</span>
                     <span class="separator">|</span>
                     <span class="delete-text" @click="deleteReview(review)">삭제</span>
                   </div>
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
             <!-- Q&A 작성 버튼 (로그인한 사용자만 표시, 강사가 자기 강의를 볼 때는 숨김) -->
             <div v-if="!isGuest && !isAuthor" class="qa-actions">
               <button class="write-qa-btn" @click="handleQAWrite">질문하기</button>
             </div>
            
                         <!-- Q&A 목록 -->
             <div v-if="lecture.qa.length > 0" class="qa-list">
                               <div v-for="qa in paginatedQA" :key="qa.id" class="qa-item">
                  <div class="question">
                    <div class="question-header">
                      <div class="questioner-info">
                        <div class="questioner-profile" @click="handleProfileClick($event, qa.questionerUUID, qa.questionerId)">
                          <img 
                            v-if="qa.parentProfileUrl" 
                            :src="qa.parentProfileUrl" 
                            :alt="qa.questionerId + ' 프로필 이미지'"
                            class="questioner-profile-img"
                          />
                          <div v-else class="questioner-profile-placeholder">
                            {{ qa.questionerId.charAt(0) }}
                          </div>
                        </div>
                        <span class="questioner-name">{{ qa.questionerId }}</span>
                      </div>
                      <div class="question-actions">
                        <span class="question-date">{{ qa.questionDate }}</span>
                      </div>
                    </div>
                    <div class="question-content">
                      <p>{{ qa.question }}</p>
                      <!-- 자신이 작성한 질문인 경우 수정/삭제 텍스트 표시 -->
                      <div v-if="canEditQA(qa)" class="qa-edit-actions">
                        <span class="edit-text" @click="editQA(qa)">수정</span>
                        <span class="separator">|</span>
                        <span class="delete-text" @click="deleteQA(qa)">삭제</span>
                      </div>
                    </div>
                  </div>
                 
                 <!-- 답변하기 버튼 (강의 작성자만 표시, 답변이 없는 경우) -->
                 <div v-if="isAuthor && !qa.hasAnswer" class="qa-answer-action">
                   <button class="answer-btn" @click="handleAnswerQA(qa)">답변하기</button>
                 </div>
                 
                 <!-- 답글이 있는 경우에만 표시 -->
                 <div v-if="qa.hasAnswer" class="answer">
                   <div class="answer-content">
                     <div class="answer-header">
                       <div class="answerer-info">
                         <div class="answerer-profile" @click="handleProfileClick($event, qa.answererUUID, qa.answererId)">
                           <img 
                             v-if="qa.answerProfileUrl" 
                             :src="qa.answerProfileUrl" 
                             :alt="qa.answererId + ' 프로필 이미지'"
                             class="answerer-profile-img"
                           />
                           <div v-else class="answerer-profile-placeholder">
                             {{ qa.answererId.charAt(0) }}
                           </div>
                         </div>
                         <span class="answerer-name">{{ qa.answererId }}</span>
                       </div>
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
              <p>아직 질문이 없습니다.</p>
              <p class="no-qa-sub">첫 번째 질문을 남겨보세요!</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 사이드바 -->
      <div class="sidebar">
        <!-- 구매 정보 -->
        <div v-if="ready" class="purchase-section">
          <!-- 가격 표시 (구매한 사용자나 강의 작성자에게는 숨김) -->
          <div v-if="!isPurchaser && !isAuthor" class="price">{{ lecture.price.toLocaleString() }}원</div>
          
          <!-- 로그인한 사용자: 강의 구매하기 버튼 -->
          <button 
            v-if="showPurchaseButton"
            class="enroll-btn purchase-btn" 
            @click="purchaseLecture"
          >
            강의 구매하기
          </button>
          
          <!-- 일반 사용자: 장바구니 버튼 -->
           <button 
             v-if="showCartButton"
             class="enroll-btn" 
             @click="enrollLecture"
           >
             장바구니에 담기
           </button>
           
           <!-- 일반 사용자: 장바구니에서 제거 버튼 -->
           <button 
             v-if="showRemoveFromCartButton"
             class="enroll-btn in-cart" 
             @click="enrollLecture"
           >
             장바구니에서 제거
           </button>

           <!-- 강의 수강률 표시 (구매자에게만 표시) -->
           <div v-if="isPurchaser && lecture.progressPercent !== null" class="progress-section">
             <div class="progress-info">
               <span class="progress-label">학습률</span>
               <span class="progress-percent">{{ lecture.progressPercent }}%</span>
             </div>
             <div class="progress-bar">
               <div class="progress-fill" :style="{ width: lecture.progressPercent + '%' }"></div>
             </div>
           </div>

          <div class="action-buttons">
            <div class="share-section" @click="showShareModal = true">
              <span class="share-icon">📤</span>
              <span>공유하기</span>
            </div>
            <!-- 신고하기 버튼 (강사가 자기 강의를 볼 때는 숨김, 구매자만 가능) -->
            <div v-if="!isAuthor && !isGuest" class="report-section" @click="handleReportClick">
              <span class="report-icon">🚨</span>
              <span>신고하기</span>
            </div>
                         <!-- 좋아요 버튼 -->
             <div class="like-section">
               <button class="like-button" :class="{ 'liked': isLiked }" @click="toggleLike">
                 <span class="like-icon">❤️</span>
                 <span class="like-count">{{ lecture.likeCount || 0 }}</span>
               </button>
             </div>
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
             <div class="ingredients">
               <h5>재료</h5>
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

    <!-- 리뷰 작성/수정 모달 -->
    <div v-if="showReviewModal" class="modal-overlay" @click="closeReviewModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditingReview ? '리뷰 수정' : '리뷰 작성' }}</h3>
          <button class="close-btn" @click="closeReviewModal">×</button>
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
                @click="handleStarClick(i)"
                @mouseenter="handleStarHover(i)"
                @mouseleave="handleStarLeave"
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
          <button class="cancel-btn" @click="closeReviewModal">취소</button>
          <button class="submit-btn" @click="submitReview">{{ isEditingReview ? '리뷰 수정' : '리뷰 등록' }}</button>
        </div>
      </div>
    </div>

    <!-- Q&A 작성/수정 모달 -->
    <div v-if="showQAModal" class="modal-overlay" @click="showQAModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditingQA ? '질문 수정하기' : '질문하기' }}</h3>
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
          <button class="submit-btn" @click="submitQuestion">{{ isEditingQA ? '질문 수정' : '질문 등록' }}</button>
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

     <!-- 구매 필요 모달 -->
     <div v-if="showPurchaseRequiredModal" class="modal-overlay" @click="showPurchaseRequiredModal = false">
       <div class="cart-modal" @click.stop>
         <div class="modal-header">
           <h3>강의 구매 필요</h3>
           <button class="close-btn" @click="showPurchaseRequiredModal = false">×</button>
         </div>
         <div class="modal-content">
           <div class="modal-icon">🛒</div>
           <p class="modal-message">이 기능을 사용하려면 강의를 구매해야 합니다.</p>
           <p class="modal-submessage">강의를 구매하시면 리뷰 작성과 Q&A 참여가 가능합니다.</p>
         </div>
         <div class="modal-actions">
           <button class="btn-primary" @click="goToPurchase">강의 구매하기</button>
           <button class="btn-secondary" @click="showPurchaseRequiredModal = false">취소</button>
         </div>
       </div>
     </div>

     <!-- 구매 필요 모달 -->
     <div v-if="showPurchaseRequiredModal" class="modal-overlay" @click="showPurchaseRequiredModal = false">
       <div class="cart-modal" @click.stop>
         <div class="modal-header">
           <h3>강의 구매 필요</h3>
           <button class="close-btn" @click="showPurchaseRequiredModal = false">×</button>
         </div>
         <div class="modal-content">
           <div class="modal-icon">🛒</div>
           <p class="modal-message">이 기능을 사용하려면 강의를 구매해야 합니다.</p>
           <p class="modal-submessage">강의를 구매하시면 리뷰 작성과 Q&A 참여가 가능합니다.</p>
         </div>
         <div class="modal-actions">
           <button class="btn-primary" @click="goToPurchase">강의 구매하기</button>
           <button class="btn-secondary" @click="showPurchaseRequiredModal = false">취소</button>
         </div>
       </div>
     </div>

     <!-- 로그인 필요 모달 -->
     <div v-if="showLoginRequiredModal" class="modal-overlay" @click="showLoginRequiredModal = false">
       <div class="cart-modal" @click.stop>
         <div class="modal-header">
           <h3>로그인 필요</h3>
           <button class="close-btn" @click="showLoginRequiredModal = false">×</button>
         </div>
         <div class="modal-content">
           <div class="modal-icon">🔐</div>
           <p class="modal-message">로그인이 필요한 서비스입니다.</p>
           <p class="modal-submessage">로그인 후 리뷰 작성과 Q&A 참여가 가능합니다.</p>
         </div>
         <div class="modal-actions">
           <button class="btn-primary" @click="goToLogin">로그인하기</button>
           <button class="btn-secondary" @click="showLoginRequiredModal = false">취소</button>
         </div>
       </div>
     </div>

    <!-- 삭제 확인 모달 -->
    <DeleteConfirmModal
      v-model="showDeleteConfirmModal"
      :title="deleteConfirmData.title"
      :message="deleteConfirmData.message"
      :item-info="deleteConfirmData.itemInfo"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />

    <!-- 강의 삭제 확인 모달 -->
    <DeleteConfirmModal
      v-model="showLectureDeleteModal"
      title="강의 삭제"
      message="정말로 이 강의를 삭제하시겠습니까?"
      :item-info="`강의명: ${lecture?.title || ''}`"
      @confirm="deleteLecture"
      @cancel="cancelLectureDelete"
    />

    <!-- 신고 모달 -->
    <ReportModal
      v-model="showReportModal"
      :report-type="reportModalData.reportType"
      :target-id="reportModalData.targetId"
      :target-name="reportModalData.targetName"
      @success="handleReportSuccess"
      @error="handleReportError"
    />

    <!-- 사용자 프로필 모달 -->
    <UserProfileModal
      v-model="showUserProfileModal"
      :user="userProfileData"
      @chat="handleUserProfileChat"
      @report="handleUserProfileReport"
    />


  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue';
import ReportModal from '@/components/common/ReportModal.vue';
import UserProfileModal from '@/components/common/UserProfileModal.vue';

import { lectureService } from '@/store/lecture/lectureService';
import { useCartStore } from '@/store/cart/cart';
import { useChatStore } from '@/store/chat/chat';
import { useAuthStore } from '@/store/auth/auth';
import { getUserIdFromToken } from '@/utils/api';
import { reportService } from '@/services/report/reportService';
import { lectureProgressService } from '@/services/lecture/lectureProgressService';


export default {
  name: 'LectureDetail',
  components: { Header, DeleteConfirmModal, ReportModal, UserProfileModal },
  data() {
    return {
      ready: false, // 초기화 완료 상태
      cartStore: null, // 장바구니 스토어 인스턴스
      chatStore: null, // 채팅 스토어 인스턴스
      authStore: null, // 인증 스토어 인스턴스
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
      showLoginRequiredModal: false,
      showDeleteConfirmModal: false,
      showLectureDeleteModal: false,
      showReportModal: false,
      reportModalData: {
        reportType: 'LECTURE',
        targetId: '',
        targetName: ''
      },
      showUserProfileModal: false,
      userProfileData: {
        id: '',
        nickname: '',
        email: '',
        profileImage: '',
        joinDate: ''
      },
      deleteConfirmData: {},
      notificationData: {},
      errorMessage: '',
      successMessage: '',
      confirmData: {},
      newReview: {
        rating: 0,
        content: ''
      },
      selectedRating: 0, // 클릭으로 선택된 별점 저장용
      // 리뷰 수정 관련 상태
      isEditingReview: false, // 리뷰 수정 모드인지 여부
      editingReviewId: null, // 수정 중인 리뷰 ID
      // Q&A 수정 관련 상태
      isEditingQA: false, // Q&A 수정 모드인지 여부
      editingQAId: null, // 수정 중인 Q&A ID
      newQuestion: {
        content: '',
        parentId: null
      },
      // 구매 상태 (실제로는 API에서 확인)
      isPurchased: false,
      // 사용자 역할 관련 상태
      currentUserId: null, // 현재 로그인한 사용자 ID
      userRole: 'GENERAL', // GENERAL, CHEF, OWNER, PURCHASER, ADMIN
             // 페이지네이션 설정
       reviewsPerPage: 5,
       qaPerPage: 5,
       currentReviewsPage: 1,
       currentQAPage: 1,
       // 비디오 재생 상태
       isVideoPlaying: false,
       previewVideoUrl: '',
       activeLessonIndex: -1, // 현재 재생 중인 강의 인덱스

       // 백엔드에서 확인한 장바구니 상태
       isInCart: false,
               // 비디오 썸네일 관련
        videoThumb: null,   // 생성된 영상 썸네일
        // 좋아요 상태 (실제로는 API에서 확인)
        isLiked: false,
        // 비디오 진행도 추적 관련
        progressSaveTimer: null,
        lastSavedProgress: 0,
        progressSaveInterval: 5000, // 5초마다 자동 저장
        isProgressSaving: false
    };
  },
  computed: {
    // 페이지네이션된 리뷰 목록 (현재 사용자 작성글 우선, 나머지는 등록순)
    paginatedReviews() {
      if (!this.lecture || !this.lecture.reviews) return [];
      
      // 리뷰 정렬: 현재 사용자 작성글을 상단에, 나머지는 등록순
      const sortedReviews = [...this.lecture.reviews].sort((a, b) => {
        // 현재 사용자가 작성한 리뷰인지 확인
        const aIsCurrentUser = a.reviewerId === this.currentUserId;
        const bIsCurrentUser = b.reviewerId === this.currentUserId;
        
        // 현재 사용자 작성글이 우선순위
        if (aIsCurrentUser && !bIsCurrentUser) return -1;
        if (!aIsCurrentUser && bIsCurrentUser) return 1;
        
        // 둘 다 현재 사용자이거나 둘 다 다른 사용자인 경우 등록순 정렬
        // date 필드를 기준으로 최신순 정렬 (더 최근 날짜가 위로)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
      
      const startIndex = 0;
      const endIndex = this.currentReviewsPage * this.reviewsPerPage;
      return sortedReviews.slice(startIndex, endIndex);
    },
    
    // 페이지네이션된 Q&A 목록 (현재 사용자 작성글 우선, 나머지는 등록순)
    paginatedQA() {
      if (!this.lecture || !this.lecture.qa) return [];
      
      // Q&A 정렬: 현재 사용자 작성글을 상단에, 나머지는 등록순
      const sortedQA = [...this.lecture.qa].sort((a, b) => {
        // 현재 사용자가 작성한 Q&A인지 확인
        const aIsCurrentUser = a.questionerId === this.currentUserId;
        const bIsCurrentUser = b.questionerId === this.currentUserId;
        
        // 현재 사용자 작성글이 우선순위
        if (aIsCurrentUser && !bIsCurrentUser) return -1;
        if (!aIsCurrentUser && bIsCurrentUser) return 1;
        
        // 둘 다 현재 사용자이거나 둘 다 다른 사용자인 경우 등록순 정렬
        // questionDate 필드를 기준으로 최신순 정렬 (더 최근 날짜가 위로)
        const dateA = new Date(a.questionDate);
        const dateB = new Date(b.questionDate);
        return dateB - dateA;
      });
      
      const startIndex = 0;
      const endIndex = this.currentQAPage * this.qaPerPage;
      return sortedQA.slice(startIndex, endIndex);
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
    },
    
    // 사용자 역할별 화면 제어 computed 속성들
    // 강의 작성자인지 확인 (CHEF, OWNER)
    isAuthor() {
              // 사용자 정보에서 직접 역할 확인
        const userInfo = localStorage.getItem('user');
        let userRole = 'GENERAL';
        
        if (userInfo) {
          try {
            const user = JSON.parse(userInfo);
            userRole = user.role;
          } catch (error) {
            console.error('사용자 정보 파싱 오류:', error);
          }
        }
      
      const result = (userRole === 'CHEF' || userRole === 'OWNER') && this.currentUserId === this.lecture?.instructor?.id;
      return result;
    },
    
    // 강의 구매자인지 확인
    isPurchaser() {
      console.log('isPurchased 값:', this.isPurchased);
      return this.isPurchased;
    },
    
    // 관리자인지 확인
    isAdmin() {
      const isAdmin = this.userRole === 'ADMIN';
      return isAdmin;
    },
    
    // 로그인하지 않은 사용자인지 확인
    isGuest() {
      const result = !this.currentUserId;
      return result;
    },
    
    // 강의 구매하기 버튼 표시 여부 (로그인하지 않은 사용자만)
    showPurchaseButton() {
      return !this.currentUserId;
    },
    
    // 장바구니에 담기 버튼 표시 여부 (로그인한 사용자 중 구매하지 않은 사용자, 장바구니에 없는 경우, 강사이면서 강의 등록자가 아닌 경우)
    showCartButton() {
      // 강사이면서 강의 등록자인 경우 버튼 숨김
      if (this.isAuthor) {
        return false;
      }
      
      const result = this.currentUserId && !this.isPurchased && !this.isInCart;
      return result;
    },
    
    // 장바구니에서 제거 버튼 표시 여부 (로그인한 사용자 중 구매하지 않은 사용자, 강사이면서 강의 등록자가 아닌 경우)
    showRemoveFromCartButton() {
      // 강사이면서 강의 등록자인 경우 버튼 숨김
      if (this.isAuthor) {
        return false;
      }
      
      const result = this.currentUserId && !this.isPurchased && this.isInCart;
      return result;
    },
    
    // 강의 수정 버튼 표시 여부 (등록자만 표시)
    showEditButton() {
      // 토큰에서 현재 사용자 ID 가져오기
      const currentUserId = getUserIdFromToken();
      
      // 강의 정보가 없거나 등록자 정보가 없으면 false
      if (!this.lecture || !this.lecture.instructor || !currentUserId) {
        return false;
      }
      
      // 현재 사용자 ID와 강의 등록자 ID가 일치하는지 확인
      return currentUserId === this.lecture.instructor.id;
    },
    
    // 강의 삭제 버튼 표시 여부 (자영업자/요리사, 관리자)
    showDeleteButton() {
      return this.isAuthor || this.isAdmin;
    },
    
    // 리뷰 작성 가능 여부 (구매자만, 강의 작성자는 자신의 강의에 리뷰 작성 불가)
    canWriteReview() {
      const result = this.isPurchased && !this.isAuthor;
      return result;
    },
    
    // Q&A 작성 가능 여부 (구매자, 자영업자/요리사, 관리자)
    canWriteQA() {
      return this.isPurchased || this.isAuthor || this.isAdmin;
    },
    
    // 강의 시청 가능 여부 (구매자, 자영업자/요리사, 관리자)
    canWatchLecture() {
      return this.isPurchased || this.isAuthor || this.isAdmin;
    },
    

    
    // 이미 리뷰를 작성했는지 확인
    hasUserReviewed() {
      if (!this.currentUserId) {
        return false;
      }
      
      if (!this.lecture) {
        return false;
      }
      
      if (!this.lecture.reviews) {
        return false;
      }
      
      const matchingReviews = this.lecture.reviews.filter(review => {
        return review.reviewerId === this.currentUserId;
      });
      
      return matchingReviews.length > 0;
    },
    
    // 리뷰 작성 버튼 표시 여부 (로그인한 사용자 중 리뷰 작성 가능하고 아직 리뷰를 작성하지 않은 사용자)
    showReviewWriteButton() {
      const result = !this.isGuest && this.canWriteReview && !this.hasUserReviewed;
      return result;
    }
  },
  watch: {
    // previewVideoUrl이 변경될 때 썸네일 재생성
    previewVideoUrl(newUrl) {
      if (newUrl) {
        this.$nextTick(() => {
          if (this.$refs.hiddenVideo) {
            // 비디오가 이미 로드된 경우 썸네일 생성
            if (this.$refs.hiddenVideo.readyState >= 1) {
              this.captureFirstFrame();
            }
          }
        });
      }
    }
  },
  methods: {
    // 사용자 역할 확인 메서드
    async checkUserRole(lectureId) {
      try {
        // TODO: 실제 로그인 API에서 사용자 정보 가져오기
        // 현재는 localStorage에서 임시로 가져옴
        const userInfo = localStorage.getItem('user');
        
        if (userInfo) {
          const user = JSON.parse(userInfo);
          this.currentUserId = user.id;
          
          // 강의 작성자인지 확인 (CHEF, OWNER 모두 자영업자/요리사)
          if (this.lecture && this.lecture.instructor && user.id === this.lecture.instructor.id) {
            this.userRole = user.role === 'OWNER' ? 'OWNER' : 'CHEF';
          }
          // 관리자인지 확인
          else if (user.role === 'ADMIN') {
            this.userRole = 'ADMIN';
          }
          // 구매자인지 확인 (구매 상태는 별도로 확인)
          else if (this.isPurchased) {
            this.userRole = 'PURCHASER';
          }
          // 일반 사용자
          else {
            this.userRole = 'GENERAL';
          }
        } else {
          this.userRole = 'GENERAL';
        }
      } catch (error) {
        console.error('사용자 역할 확인 실패:', error);
        this.userRole = 'GENERAL';
      }
    },
    
             // 장바구니 상태 확인 (백엔드 API 사용)
    async checkCartStatus(lectureId) {
      try {
        const response = await lectureService.getCartItems();
        if (response.success) {
          // 장바구니 목록에서 현재 강의 ID가 있는지 확인
          this.isInCart = response.data.some(item => 
            item.lectureId === lectureId || item.id === lectureId
          );
        }
      } catch (error) {
        console.error('장바구니 상태 확인 실패:', error);
        this.isInCart = false;
      }
    },

     // 좋아요 상태 확인 (백엔드 API 사용)
     async checkLikeStatus(lectureId) {
       try {
         // 먼저 강의 데이터에서 좋아요 상태 확인 (백엔드에서 이미 제공된 경우)
         if (this.lecture && this.lecture.isLiked !== undefined) {
           this.isLiked = this.lecture.isLiked;
           return;
         }
         
         // 강의 데이터에 좋아요 상태가 없는 경우 별도 API 호출
         const response = await lectureService.checkLectureLikeStatus(lectureId);
         if (response.success) {
           this.isLiked = response.data.liked || false;
         }
       } catch (error) {
         console.error('좋아요 상태 확인 실패:', error);
         this.isLiked = false;
       }
     },

     

     // 구매 여부 확인 (백엔드 API 사용)
     async checkPurchaseStatus(lectureId) {
       try {
         const response = await lectureService.getPurchasedLectures();
         
         if (response.success) {
           // 구매한 강의 목록에서 현재 강의 ID가 있는지 확인
           // purchase 객체에서 id 또는 lectureId 필드를 확인
           const isPurchased = response.data.content.some(purchase => 
             purchase.id === lectureId || purchase.lectureId === lectureId
           );
           
           // 구매 상태가 변경된 경우에만 업데이트
           if (this.isPurchased !== isPurchased) {
             this.isPurchased = isPurchased;
             
             // UI 강제 업데이트
             this.$nextTick(() => {
               this.$forceUpdate();
             });
           }
         }
       } catch (error) {
         console.error('구매 상태 확인 실패:', error);
         this.isPurchased = false;
         this.$nextTick(() => {
           this.$forceUpdate();
         });
       }
     },

         // 강의 데이터를 받아오는 메서드 (백엔드 API 호출)
     async fetchLectureData(lectureId) {
       
               // 썸네일 상태 초기화
        this.videoThumb = null;
       
       try {
        const response = await lectureService.getLectureDetail(lectureId);
        
        if (response.success) {
          const lectureData = response.data;


          
          try {
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
                title: '요리 전문가',
                id: lectureData.submittedById
              },
              lessons: this.convertVideosToLessons(lectureData.lectureVideoResDtoList),
              reviews: this.convertReviews(lectureData.lectureReviewResDtoList || []),
              qa: this.convertQA(lectureData.qnaList || []),
              recipe: this.convertRecipe(lectureData.ingredResDtoList, lectureData.lectureStepResDtoList),
              // 백엔드에서 제공하는 평균 평점 사용
              rating: lectureData.reviewAvg || 0,
              ratingCount: lectureData.reviewCount,
              students: lectureData.purchaseCount || 0, // 구매한 수강생 수
              // 장바구니용 필드들
              image: lectureData.thumbUrl || '/src/assets/images/smu_mascort1.jpg', // 썸네일 URL
              teacher: lectureData.name, // 강사명
              // 강사 프로필 이미지 URL 추가
              submittedByProfile: lectureData.submittedByProfile,
              // 강사 가입일 추가
              submittedJoinedAt: lectureData.submittedJoinedAt,
              // 강사 이메일 추가
              submittedByEmail: lectureData.submittedByEmail,
              // 강의 수강률 추가
              progressPercent: lectureData.progressPercent,
              // 백엔드에서 제공하는 좋아요 정보 추가
              likeCount: lectureData.likeCount || 0,
              isLiked: lectureData.isLiked || false
            };
            

          } catch (error) {
            console.error('강의 데이터 변환 오류:', error);
            this.showError('강의 데이터를 처리하는 중 오류가 발생했습니다.');
            return;
          }
        } else {
          console.error('강의 상세 조회 실패:', response.message);
          this.showError('강의 정보를 불러오는데 실패했습니다.');
        }
        
                                              // 사용자 역할 및 장바구니 상태 확인
           await this.checkUserRole(lectureId);
           await this.checkCartStatus(lectureId);
           
           // 구매 상태 확인
           await this.checkPurchaseStatus(lectureId);
           
           // 좋아요 상태 확인
           await this.checkLikeStatus(lectureId);
           
           // 강의 데이터가 완전히 로드된 후 사용자 역할을 다시 확인
           this.$nextTick(async () => {
             if (this.lecture && this.lecture.instructor) {
               await this.checkUserRole(lectureId);
             }
           });
         
                   // 미리보기 비디오 URL 설정
          const previewLesson = this.lecture.lessons.find(lesson => lesson.isPreview && lesson.videoUrl);
          if (previewLesson && previewLesson.videoUrl) {
            this.previewVideoUrl = previewLesson.videoUrl;
          } else {
            // 미리보기 강의가 없으면 첫 번째 강의 사용
            const firstLesson = this.lecture.lessons.find(lesson => lesson.videoUrl);
            if (firstLesson && firstLesson.videoUrl) {
              this.previewVideoUrl = firstLesson.videoUrl;
            }
          }
          
          // 비디오 URL이 설정된 후 썸네일 생성을 위해 nextTick 사용
          if (this.previewVideoUrl) {
            this.$nextTick(() => {
              // 숨겨진 비디오가 로드되면 썸네일 생성
              if (this.$refs.hiddenVideo) {
                // 비디오가 이미 로드된 경우 썸네일 생성
                if (this.$refs.hiddenVideo.readyState >= 1) {
                  this.captureFirstFrame();
                }
              }
            });
          }
          
          // 모든 초기화가 완료되면 ready 상태를 true로 설정
          this.ready = true;
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
        'VERY_LOW': '매우쉬움',
        'LOW': '쉬움',
        'MEDIUM': '보통',
        'HIGH': '어려움',
        'VERY_HIGH': '매우어려움'
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
           description: `강의 ${index + 1}`,
           duration: durationText,
           isPreview: video.preview || false,
           videoUrl: video.videoUrl,
           sequence: video.sequence || index + 1,
           videoId: video.videoId || null,
           durationSeconds: video.duration || 0
         };
      });
    },
    
             // 리뷰 데이터 변환
    convertReviews(reviews) {
      if (!reviews || reviews.length === 0) return [];
      
      const self = this; // this 컨텍스트를 명시적으로 저장
      
      return reviews.map((review, index) => {
        try {
          const convertedReview = {
            id: Math.random().toString(36).substr(2, 9),
            writer: review.writer || '익명',
            rating: review.rating || 0,
            content: review.content || '',
            date: self.formatReviewDate(review.updateAt, review.createAt),
            reviewerId: review.reviewerId || null,
            profileUrl: review.profileUrl || null
          };
          
          return convertedReview;
        } catch (error) {
          console.error(`리뷰 ${index + 1} 변환 오류:`, error, '리뷰 데이터:', review);
          // 오류가 발생해도 기본값으로 반환
          return {
            id: Math.random().toString(36).substr(2, 9),
            writer: '익명',
            rating: 0,
            content: '리뷰를 불러오는 중 오류가 발생했습니다.',
            date: '',
            reviewerId: null,
            profileUrl: null
          };
        }
      });
    },
    
         // Q&A 데이터 변환 (질문-답글 구조)
     convertQA(qaList) {

       
       if (!qaList || qaList.length === 0) {

         return [];
       }
       
       const convertedQA = qaList.map(qa => ({
         id: qa.qnaId || qa.parentId, // Use qnaId if available, fallback to parentId
         qnaId: qa.qnaId, // Store the actual qnaId for API calls
         questionerId: qa.parentName || '익명',
         questionerUUID: qa.parentId, // Add UUID for comparison
         question: qa.parentContent,
         questionDate: this.formatQADate(qa.parentCreatedAt),
         questionUpdatedAt: qa.questionUpdatedAt ? this.formatQADate(qa.questionUpdatedAt) : null,
         // 답글이 있는 경우에만 답글 정보 포함
         hasAnswer: !!(qa.answerContent && qa.answerName),
         answer: qa.answerContent || null,
         answererId: qa.answerName || null,
         answererUUID: qa.answerId || null, // Add UUID for comparison
         answerDate: qa.answerCreatedAt ? this.formatQADate(qa.answerCreatedAt) : null,
         answerUpdatedAt: qa.answerUpdatedAt ? this.formatQADate(qa.answerUpdatedAt) : null,
         // 상태 정보
         parentStatus: qa.parentStatus,
         answerStatus: qa.answerStatus,
         // 프로필 이미지 URL 추가
         parentProfileUrl: qa.parentProfileUrl || null,
         answerProfileUrl: qa.answerProfileUrl || null
       }));
       
       
       return convertedQA;
     },
     
     // 날짜 포맷팅 메서드
     formatDate(dateString) {
       if (!dateString) return '';
       const date = new Date(dateString);
       return date.toLocaleDateString('ko-KR');
     },
     
     // Q&A 날짜 포맷팅 메서드 (updateAt 우선, 없으면 createAt 사용)
     formatQADate(updateAt, createAt) {
       try {
         const dateString = updateAt || createAt;
         if (!dateString) return '';
         
         // LocalDateTime 객체인 경우 처리
         if (typeof dateString === 'object' && dateString !== null) {
           // 객체에서 날짜 정보 추출 시도
           if (dateString.year && dateString.month && dateString.day) {
             const date = new Date(dateString.year, dateString.month - 1, dateString.day);
             return date.toLocaleDateString('ko-KR');
           }
           // 다른 형식의 객체인 경우 JSON으로 변환 시도
           return '';
         }
         
         // 문자열인 경우
         if (typeof dateString === 'string') {
           const date = new Date(dateString);
           if (isNaN(date.getTime())) {
             console.warn('유효하지 않은 날짜 문자열:', dateString);
             return '';
           }
           return date.toLocaleDateString('ko-KR');
         }
         
         console.warn('지원하지 않는 날짜 형식:', dateString);
         return '';
       } catch (error) {
         console.error('Q&A 날짜 포맷팅 오류:', error, '입력값:', updateAt, createAt);
         return '';
       }
     },
     
     // 리뷰 날짜 포맷팅 메서드 (updateAt 우선, 없으면 createAt 사용)
     formatReviewDate(updateAt, createAt) {
       try {
         const dateString = updateAt || createAt;
         if (!dateString) return '';
         
         // LocalDateTime 객체인 경우 처리
         if (typeof dateString === 'object' && dateString !== null) {
           // 객체에서 날짜 정보 추출 시도
           if (dateString.year && dateString.month && dateString.day) {
             const date = new Date(dateString.year, dateString.month - 1, dateString.day);
             return date.toLocaleDateString('ko-KR');
           }
           // 다른 형식의 객체인 경우 JSON으로 변환 시도
           return '';
         }
         
         // 문자열인 경우
         if (typeof dateString === 'string') {
           const date = new Date(dateString);
           if (isNaN(date.getTime())) {
             console.warn('유효하지 않은 날짜 문자열:', dateString);
             return '';
           }
           return date.toLocaleDateString('ko-KR');
         }
         
         console.warn('지원하지 않는 날짜 형식:', dateString);
         return '';
       } catch (error) {
         console.error('날짜 포맷팅 오류:', error, '입력값:', updateAt, createAt);
         return '';
       }
     },
    
    // 레시피 데이터 변환
    convertRecipe(ingredients, steps) {
      return {
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
                // 미리보기 강의의 인덱스 찾기
                const previewIndex = this.lecture.lessons.findIndex(lesson => lesson.isPreview && lesson.videoUrl);
                this.playVideo(previewLesson, previewIndex);
              } else {
         this.showError('미리보기 비디오를 찾을 수 없습니다.');
       }
     },
     
     // 비디오 로드 시작
     onVideoLoadStart() {

     },

     // 비디오 재생 가능
     onVideoCanPlay() {

     },

     // 비디오 에러 처리
     onVideoError(event) {
       console.error('비디오 에러:', event);
       this.showError('비디오를 재생할 수 없습니다.');
     },

     // 비디오 종료 시 처리
     onVideoEnded() {
       // 현재 재생 중인 강의의 진행도 저장
       this.saveVideoProgress();
       
       // 다음 강의가 있는지 확인
       if (this.activeLessonIndex >= 0 && this.activeLessonIndex < this.lecture.lessons.length - 1) {
         const nextIndex = this.activeLessonIndex + 1;
         const nextLesson = this.lecture.lessons[nextIndex];
         
         // 비로그인 사용자인 경우 자동 재생 방지
         if (this.isGuest) {
           this.showPurchaseRequiredModal = true;
           this.isVideoPlaying = false;
           this.previewVideoUrl = '';
           this.activeLessonIndex = -1;
           return;
         }
         
         // 다음 강의가 시청 가능한지 확인
         if (nextLesson && nextLesson.videoUrl && (this.canWatchLecture || nextLesson.isPreview)) {
           this.playVideo(nextLesson, nextIndex);
           return;
         }
       }
       
       // 다음 강의가 없거나 시청할 수 없는 경우
       this.isVideoPlaying = false;
       this.previewVideoUrl = '';
       this.activeLessonIndex = -1;
     },

     // 비디오 시간 업데이트 시 처리
     onVideoTimeUpdate() {
       if (this.$refs.previewVideo) {
         const currentTime = this.$refs.previewVideo.currentTime;
         this.setupProgressSaveTimer(currentTime);
       }
     },

     // 진행도 저장 타이머 설정
     setupProgressSaveTimer(currentTime) {
       // 이전 타이머가 있으면 제거
       if (this.progressSaveTimer) {
         clearTimeout(this.progressSaveTimer);
       }

       // 새로운 타이머 설정
       this.progressSaveTimer = setTimeout(() => {
         this.saveVideoProgress(currentTime);
       }, this.progressSaveInterval);
     },

     // 비디오 진행도 저장
     async saveVideoProgress(currentTime = null) {
       // 조건 확인: 로그인된 사용자, 구매자, 강의 작성자가 아닌 경우
       if (!this.currentUserId || !this.isPurchaser || this.isAuthor) {
         return;
       }

       const currentLesson = this.lecture.lessons[this.activeLessonIndex];
       if (!currentLesson) {
         return;
       }

       // 현재 시간이 없으면 비디오에서 가져오기
       if (currentTime === null && this.$refs.previewVideo) {
         currentTime = this.$refs.previewVideo.currentTime;
       }

       // 비디오가 끝까지 재생되었는지 확인
       if (currentTime >= currentLesson.durationSeconds) {
         try {
           // API 호출
           await lectureProgressService.saveVideoProgress(currentLesson.videoId, currentLesson.durationSeconds);
           
           // 진행도 저장 후 강의 정보 새로고침
           await this.refreshLectureProgress();
           
           console.log('비디오 진행도 저장 완료:', currentLesson.videoId);
         } catch (error) {
           console.error('비디오 진행도 저장 실패:', error);
         }
       }
     },

     // 강의 진행도 새로고침
     async refreshLectureProgress() {
       try {
         const response = await lectureService.getLectureDetail(this.lecture.id);
         if (response.success) {
           this.lecture.progressPercent = response.data.progressPercent;
         }
       } catch (error) {
         console.error('강의 진행도 새로고침 실패:', error);
       }
     },
     

     
     // 비디오 재생 메서드 (메인 영역에서 재생)
     playVideo(lesson, lessonIndex = -1) {
       if (lesson.videoUrl) {
         // URL이 유효한지 확인
         try {
           const url = new URL(lesson.videoUrl);
           
           // 이전 진행도 저장 타이머 정리
           if (this.progressSaveTimer) {
             clearTimeout(this.progressSaveTimer);
           }
           
           // 메인 비디오 영역에서 재생
           this.previewVideoUrl = lesson.videoUrl;
           this.isVideoPlaying = true;
           this.activeLessonIndex = lessonIndex; // 현재 재생 중인 강의 인덱스 설정
           
           // 비디오 요소가 렌더링된 후 재생
           this.$nextTick(() => {
             if (this.$refs.previewVideo) {
               this.$refs.previewVideo.load();
               this.$refs.previewVideo.play().catch(error => {
                 console.error('비디오 재생 실패:', error);
                 this.showError('비디오 재생에 실패했습니다.');
                 this.isVideoPlaying = false;
               });
             }
           });
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

    // 리뷰 제출 (등록 또는 수정)
    async submitReview() {
      if (this.newReview.rating === 0) {
        this.showError('평점을 선택해주세요.');
        return;
      }
      
      if (!this.newReview.content.trim()) {
        this.showError('리뷰 내용을 작성해주세요.');
        return;
      }

      try {
        // 디버깅: lecture 객체와 lectureId 확인
        
        
        // lectureId가 없으면 id를 사용
        const lectureId = this.lecture.lectureId || this.lecture.id;
        
        
        // 리뷰 데이터 준비
        const reviewData = {
          rating: this.newReview.rating,
          content: this.newReview.content,
          lectureId: lectureId
        };

        
        
        let response;
        if (this.isEditingReview) {
          // 리뷰 수정 API 호출
          
          response = await lectureService.modifyReview(reviewData);
          
        } else {
          // 리뷰 등록 API 호출
          
          response = await lectureService.createReview(reviewData);
          
        }

        // 백엔드 응답 구조에 따라 성공 여부 확인
        // ResponseDto.ok("리뷰가 등록되었습니다.", HttpStatus.CREATED) 형태의 응답
        if (response && (response.success === true || response.code === 201 || response.code === 200)) {
          // 성공 메시지 표시 (상태 변경 전에 저장)
          const successMessage = this.isEditingReview ? '리뷰가 성공적으로 수정되었습니다.' : '리뷰가 성공적으로 등록되었습니다.';
          
          // 모달 닫기 및 폼 초기화
          this.closeReviewModal();

          this.showSuccess(successMessage);

          // 강의 상세 정보 새로고침 (리뷰 목록 업데이트)
          await this.fetchLectureData(this.lecture.id);
        } else {
          // 실패 시에도 모달은 닫고 에러 메시지만 표시
          const wasEditing = this.isEditingReview;
          this.closeReviewModal();
          this.showError(wasEditing ? '리뷰 수정에 실패했습니다.' : '리뷰 등록에 실패했습니다.');
        }
      } catch (error) {
        console.error('리뷰 처리 오류:', error);
        // 에러 발생 시에도 모달은 닫기
        const wasEditing = this.isEditingReview;
        this.closeReviewModal();
        this.showError(wasEditing ? '리뷰 수정 중 오류가 발생했습니다.' : '리뷰 등록 중 오류가 발생했습니다.');
      }
    },

    // Q&A 제출 (API 연동)
    async submitQuestion() {
      if (!this.newQuestion.content.trim()) {
        this.showError('질문 내용을 작성해주세요.');
        return;
      }

      try {
        if (this.isEditingQA) {
          // Q&A 수정
          
          
          // Q&A 수정 데이터 준비
          const qnaData = {
            content: this.newQuestion.content.trim()
          };
          
          // API 호출
          const response = await lectureService.updateQna(this.editingQAId, qnaData);
          
          
          if (response && (response.success === true || response.code === 200)) {
            // 성공 시 모달 닫기 및 폼 초기화
            this.showQAModal = false;
            this.isEditingQA = false;
            this.editingQAId = null;
            this.newQuestion = { content: '', parentId: null };
            
            // 성공 메시지 표시
            this.showSuccess('질문이 성공적으로 수정되었습니다.');
            
            // 강의 데이터 새로고침 (Q&A 목록 업데이트)
            await this.fetchLectureData(this.lecture.id);
          } else {
            this.showError('질문 수정에 실패했습니다.');
          }
        } else {
          // Q&A 등록
          
          
          // Q&A 데이터 준비
          const qnaData = {
            content: this.newQuestion.content.trim(),
            parentId: this.newQuestion.parentId // 질문자의 경우 null, 답변자의 경우 질문 ID
          };
          
          // API 호출
          const response = await lectureService.createQna(this.lecture.id, qnaData);
          
          
          if (response && (response.success === true || response.code === 200 || response.code === 201)) {
            // 성공 시 모달 닫기 및 폼 초기화
            this.showQAModal = false;
            this.newQuestion = { content: '', parentId: null };
            
            // 성공 메시지 표시
            this.showSuccess('질문이 성공적으로 등록되었습니다.');
            
            // 강의 데이터 새로고침 (Q&A 목록 업데이트)
            await this.fetchLectureData(this.lecture.id);
          } else {
            this.showError('질문 등록에 실패했습니다.');
          }
        }
      } catch (error) {
        console.error('Q&A 처리 중 오류:', error);
        this.showError(this.isEditingQA ? '질문 수정 중 오류가 발생했습니다.' : '질문 등록 중 오류가 발생했습니다.');
      }
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
      async purchaseLecture() {
        try {
          // 실제로는 결제 API 호출
          // TODO: 실제 결제 API 호출 로직 추가
          
          // 구매 상태 업데이트
          this.isPurchased = true;
          this.userRole = 'PURCHASER';
          
          // 구매 상태를 백엔드에서 다시 확인하여 동기화
          await this.checkPurchaseStatus(this.lecture.id);
          
          this.showNotification({
            title: '구매 완료',
            icon: '🎉',
            message: '강의가 구매되었습니다!',
            submessage: '이제 리뷰를 작성할 수 있습니다.'
          });
        } catch (error) {
          console.error('구매 처리 중 오류:', error);
          this.showError('구매 처리 중 오류가 발생했습니다.');
        }
      },
      
      // 강의 시청 페이지로 이동
      goToLecturePlayer() {
        // TODO: 강의 시청 페이지로 라우팅
        this.$router.push(`/lecture/${this.lecture.id}/player`);
      },
      
                   // 강의 수정
      editLecture() {
        // 강의 수정 페이지로 라우팅
        this.$router.push(`/lectures/edit/${this.lecture.id}`);
      },

       // 강의 삭제 확인 모달 표시
       showDeleteConfirm() {
         this.showLectureDeleteModal = true;
       },

       // 강의 삭제 실행
       async deleteLecture() {
         try {
           await this.deleteLectureFromServer();
           this.showSuccess('강의가 삭제되었습니다.');
           this.$router.push('/lectures');
         } catch (error) {
           this.showError('강의 삭제에 실패했습니다.');
         } finally {
           this.showLectureDeleteModal = false;
         }
       },

             // 강의 삭제 취소
      cancelLectureDelete() {
        this.showLectureDeleteModal = false;
      },

      // 신고 성공 처리
      handleReportSuccess(response) {
        this.showSuccess('신고가 성공적으로 접수되었습니다.');
      },

      // 신고 실패 처리
      handleReportError(error) {
                  this.showError(error || '신고 처리 중 오류가 발생했습니다.');
        },      

      // 신고하기 버튼 클릭 처리 (중복 신고 확인)
      async handleReportClick() {
        try {
          // 중복 신고 확인
          const response = await reportService.checkReport(this.lecture.id);
          
          if (response.success && response.data) {
            // 중복 신고인 경우 경고 메시지 표시
            this.showError('이미 신고한 강의입니다. 신고가 처리된 이후에 다시 시도해주세요.');
          } else {
            // 중복 신고가 아닌 경우 신고 모달 표시
            this.reportModalData = {
              reportType: 'LECTURE',
              targetId: this.lecture.id,
              targetName: this.lecture.title
            };
            this.showReportModal = true;
          }
        } catch (error) {
          console.error('중복 신고 확인 중 오류:', error);
          // 오류 발생 시 신고 모달을 열지 않고 오류 메시지만 표시
          this.showError('신고 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      },

      // 프로필 클릭 처리
      handleProfileClick(event, userId, userName) {
        // 로그인하지 않은 사용자는 프로필 클릭 불가
        if (this.isGuest) {
          this.showLoginRequiredModal = true;
          return;
        }

        // 자신의 프로필은 클릭 불가
        if (userId === this.currentUserId) {
          return;
        }

        // API 응답에서 해당 사용자 정보 찾기
        let userInfo = null;
        let profileImageUrl = '';
        let joinDate = '';

        // 강사 정보인 경우
        if (userId === this.lecture.instructor.id) {
          // API 응답에서 강사 정보를 직접 가져옴
          const lectureData = this.lecture;
          userInfo = {
            id: userId,
            nickname: userName,
            email: lectureData.submittedByEmail || `${userName}@example.com`,
            profileImage: lectureData.submittedByProfile || '',
            joinDate: this.formatDate(lectureData.submittedJoinedAt) || '정보 없음'
          };
        }
        // 리뷰 작성자인 경우
        else {
          const reviewer = this.lecture.reviews.find(review => review.reviewerId === userId);
          if (reviewer) {
            userInfo = {
              id: userId,
              nickname: userName,
              email: reviewer.reviewerEmail || `${userName}@example.com`,
              profileImage: reviewer.profileUrl || '',
              joinDate: this.formatDate(reviewer.reviewerJoinedAt) || '정보 없음'
            };
          }
          // Q&A 작성자인 경우
          else {
            const qaAuthor = this.lecture.qa.find(qa => 
              qa.questionerUUID === userId || qa.answererUUID === userId
            );
            if (qaAuthor) {
              const isQuestioner = qaAuthor.questionerUUID === userId;
              userInfo = {
                id: userId,
                nickname: userName,
                email: isQuestioner ? qaAuthor.parentEmail || `${userName}@example.com` : qaAuthor.answerEmail || `${userName}@example.com`,
                profileImage: isQuestioner ? qaAuthor.parentProfileUrl || '' : qaAuthor.answerProfileUrl || '',
                joinDate: this.formatDate(isQuestioner ? qaAuthor.parentJoinedAt : qaAuthor.answerJoinedAt) || '정보 없음'
              };
            }
          }
        }

        // 기본값 설정 (사용자 정보를 찾지 못한 경우)
        if (!userInfo) {
          userInfo = {
            id: userId,
            nickname: userName,
            email: `${userName}@example.com`,
            profileImage: '',
            joinDate: '정보 없음'
          };
        }

        // 사용자 프로필 데이터 설정
        this.userProfileData = {
          id: userInfo.id,
          nickname: userInfo.nickname,
          email: userInfo.email,
          profileImage: userInfo.profileImage,
          joinDate: userInfo.joinDate
        };

        // 사용자 프로필 모달 표시
        this.showUserProfileModal = true;
      },

      // 사용자 프로필 채팅 처리
      async handleUserProfileChat(userId) {
        try {
          // 로그인 확인
          if (!this.authStore.user?.id) {
            this.showNotification({
              title: '로그인 필요',
              icon: '🔒',
              message: '채팅 기능을 사용하려면 로그인이 필요합니다.',
              submessage: '로그인 페이지로 이동합니다.'
            });
            setTimeout(() => {
              this.$router.push('/login');
            }, 1500);
            return;
          }

          // 자기 자신과는 채팅할 수 없음
          if (this.authStore.user.id === userId) {
            this.showNotification({
              title: '채팅 불가',
              icon: '❌',
              message: '자기 자신과는 채팅할 수 없습니다.',
              submessage: ''
            });
            this.showUserProfileModal = false;
            return;
          }

          const myId = this.authStore.user.id;
          console.log('채팅방 생성 시작:', { myId, userId });

          // 채팅방 생성
          const roomId = await this.chatStore.createRoom(myId, userId);
          console.log('채팅방 생성 성공, roomId:', roomId);

          // 바로 채팅방으로 이동
          this.$router.push(`/chat?autoSelect=true&roomId=${roomId}`);

          // 프로필 모달 닫기
          this.showUserProfileModal = false;

        } catch (error) {
          console.error('채팅방 생성 실패:', error);
          this.showNotification({
            title: '채팅 실패',
            icon: '❌',
            message: '채팅방 생성에 실패했습니다.',
            submessage: error.message || '알 수 없는 오류가 발생했습니다.'
          });
          this.showUserProfileModal = false;
        }
      },

      // 사용자 프로필 신고 처리
      async handleUserProfileReport(userId) {
        try {
          // 중복 신고 확인
          const response = await reportService.checkReport(userId);

          if (response.success && response.data) {
            // 중복 신고인 경우 경고 메시지 표시
            this.showError('이미 신고한 사용자입니다. 신고가 처리된 이후에 다시 시도해주세요.');
          } else {
            // 중복 신고가 아닌 경우 신고 모달 표시
            this.reportModalData = {
              reportType: 'USER',
              targetId: userId,
              targetName: this.userProfileData.nickname
            };
            this.showReportModal = true;
          }
        } catch (error) {
          console.error('중복 신고 확인 중 오류:', error);
          // 오류 발생 시에도 신고 모달을 열어서 사용자가 시도할 수 있도록 함
          this.reportModalData = {
            reportType: 'USER',
            targetId: userId,
            targetName: this.userProfileData.nickname
          };
          this.showReportModal = true;
        }
        this.showUserProfileModal = false;
      },

      
      // 서버에서 강의 삭제
      async deleteLectureFromServer() {
        try {
          const result = await lectureService.deleteLecture(this.lecture.id);
   
          return result;
        } catch (error) {
          console.error('강의 삭제 오류:', error);
          throw error;
        }
      },
      
      // 리뷰 수정 가능 여부 확인
      canEditReview(review) {
        return this.currentUserId && review.reviewerId && this.currentUserId === review.reviewerId;
      },
      
      // Q&A 수정 가능 여부 확인
      canEditQA(qa) {
        if (!this.currentUserId) { return false; }
        // 관리자는 모든 Q&A 수정/삭제 가능
        if (this.isAdmin) { return true; }
        // 질문자 본인만 수정/삭제 가능 (답변자는 수정/삭제 불가)
        return this.currentUserId && qa.questionerUUID && this.currentUserId === qa.questionerUUID;
      },
      
      // 리뷰 수정
      editReview(review) {
 
        this.isEditingReview = true;
        this.editingReviewId = review.id;
        this.newReview = {
          rating: review.rating,
          content: review.content
        };
        this.selectedRating = review.rating;
        this.showReviewModal = true;
      },
      
              // 리뷰 삭제
        deleteReview(review) {
   
          
          // 삭제 확인 모달 표시
          this.deleteConfirmData = {
            title: '리뷰 삭제',
            message: '정말로 이 리뷰를 삭제하시겠습니까?',
            itemInfo: {
              title: `"${review.content.substring(0, 30)}${review.content.length > 30 ? '...' : ''}"`
            },
            review: review
          };
          this.showDeleteConfirmModal = true;
        },

        // 리뷰 삭제 확인 처리
        async confirmDeleteReview() {
          try {
            const review = this.deleteConfirmData.review;
            const lectureId = this.lecture.lectureId || this.lecture.id;
     
            
            const response = await lectureService.deleteReview(lectureId);
     
            
            if (response && (response.success === true || response.code === 200)) {
              // 모달 닫기
              this.showDeleteConfirmModal = false;
              
              // 약간의 지연 후 성공 메시지 표시
              setTimeout(() => {
                this.showSuccess('리뷰가 성공적으로 삭제되었습니다.');
              }, 300);
              
              // 강의 데이터 새로고침
              await this.fetchLectureData(this.lecture.id);
            } else {
              this.showError('리뷰 삭제에 실패했습니다.');
            }
          } catch (error) {
            console.error('리뷰 삭제 중 오류:', error);
            this.showError('리뷰 삭제 중 오류가 발생했습니다.');
          } finally {
            this.showDeleteConfirmModal = false;
            this.deleteConfirmData = {};
          }
        },

        // 삭제 확인 모달 취소
        cancelDeleteReview() {
          this.showDeleteConfirmModal = false;
          this.deleteConfirmData = {};
        },

        // Q&A 삭제 확인 처리
        async confirmDeleteQA() {
          try {
            const qa = this.deleteConfirmData.qa;
     
            
            const response = await lectureService.deleteQna(qa.id);
     
            
            if (response && (response.success === true || response.code === 200)) {
              // 모달 닫기
              this.showDeleteConfirmModal = false;
              
              // 약간의 지연 후 성공 메시지 표시
              setTimeout(() => {
                this.showSuccess('질문이 성공적으로 삭제되었습니다.');
              }, 300);
              
              // 강의 데이터 새로고침
              await this.fetchLectureData(this.lecture.id);
            } else {
              this.showError('질문 삭제에 실패했습니다.');
            }
          } catch (error) {
            console.error('Q&A 삭제 중 오류:', error);
            this.showError('질문 삭제 중 오류가 발생했습니다.');
          } finally {
            this.showDeleteConfirmModal = false;
            this.deleteConfirmData = {};
          }
        },

        // Q&A 삭제 확인 모달 취소
        cancelDeleteQA() {
          this.showDeleteConfirmModal = false;
          this.deleteConfirmData = {};
        },

        // 삭제 확인 처리 (리뷰 또는 Q&A)
        handleDeleteConfirm() {
          if (this.deleteConfirmData.review) {
            this.confirmDeleteReview();
          } else if (this.deleteConfirmData.qa) {
            this.confirmDeleteQA();
          }
        },

        // 삭제 취소 처리 (리뷰 또는 Q&A)
        handleDeleteCancel() {
          if (this.deleteConfirmData.review) {
            this.cancelDeleteReview();
          } else if (this.deleteConfirmData.qa) {
            this.cancelDeleteQA();
          }
        },


      
      // Q&A 수정
      editQA(qa) {
 
        this.isEditingQA = true;
        this.editingQAId = qa.qnaId || qa.id; // Use qnaId if available, fallback to id
        this.newQuestion = {
          content: qa.question,
          parentId: null
        };
        this.showQAModal = true;
      },
      
      // Q&A 삭제
      deleteQA(qa) {
 
        
        // 삭제 확인 모달 표시
        this.deleteConfirmData = {
          title: 'Q&A 삭제',
          message: '정말로 이 질문을 삭제하시겠습니까?',
          itemInfo: {
            title: `"${qa.question.substring(0, 30)}${qa.question.length > 30 ? '...' : ''}"`
          },
          qa: qa
        };
        this.showDeleteConfirmModal = true;
      },
      

      


      // 리뷰 모달 닫기
      closeReviewModal() {
        this.showReviewModal = false;
        this.isEditingReview = false;
        this.editingReviewId = null;
        this.newReview = { rating: 0, content: '' };
        this.selectedRating = 0;
      },

      // 리뷰 작성 처리 (로그인 및 구매 확인)
      handleReviewWrite() {
        // 로그인하지 않은 경우
        if (this.isGuest) {
          this.showLoginRequiredModal = true;
          return;
        }
        
        // 강의 작성자는 자신의 강의에 리뷰를 작성할 수 없음
        if (this.isAuthor) {
          this.showError('강의 작성자는 자신의 강의에 리뷰를 작성할 수 없습니다.');
          return;
        }
        
        // 로그인했지만 구매하지 않은 경우
        if (!this.isPurchased) {
          this.showPurchaseRequiredModal = true;
          return;
        }
        
        // 구매한 경우 바로 작성 모달 열기
        // 새 리뷰 작성 모드로 설정
        this.isEditingReview = false;
        this.editingReviewId = null;
        this.newReview = { rating: 0, content: '' };
        this.selectedRating = 0;
        this.showReviewModal = true;
      },

      // Q&A 작성 처리 (로그인 및 구매 확인)
      handleQAWrite() {
        // 로그인하지 않은 경우
        if (this.isGuest) {
          this.showLoginRequiredModal = true;
          return;
        }
        
        // 로그인했지만 구매하지 않은 경우
        if (!this.isPurchased && !this.isAuthor && !this.isAdmin) {
          this.showPurchaseRequiredModal = true;
          return;
        }
        
        // 구매했거나 작성자/관리자인 경우 바로 작성 모달 열기
        // 새 질문 작성 모드로 설정
        this.isEditingQA = false;
        this.editingQAId = null;
        this.newQuestion = { content: '', parentId: null };
        this.showQAModal = true;
      },

      // Q&A 답변 작성 처리
      handleAnswerQA(qa) {
 
        
        // 답변 작성 모드로 설정
        this.isEditingQA = false;
        this.editingQAId = null;
        this.newQuestion = {
          content: '',
          parentId: qa.id // 질문의 ID를 parentId로 설정
        };
        this.showQAModal = true;
      },

      // 강의 구매 페이지로 이동
      goToPurchase() {
        this.showPurchaseRequiredModal = false;
        // 장바구니에 추가 후 장바구니 페이지로 이동
        this.enrollLecture();
      },

      // 로그인 페이지로 이동
      goToLogin() {
        this.showLoginRequiredModal = false;
        this.$router.push('/login');
      },

      // 강의 구매 처리 (기존 purchaseLecture 메서드 수정)
      async purchaseLecture() {
        try {
          // 장바구니에 추가
          await lectureService.addToCart([this.lecture.id]);
          
          this.isInCart = true;
          // 장바구니 페이지로 이동
          this.$router.push('/cart');
        } catch (error) {
          console.error('강의 구매 처리 오류:', error);
          this.showError('장바구니 추가에 실패했습니다.');
        }
      },

    // 장바구니에 강의 추가/제거 (토글 기능)
    async enrollLecture() {
      
      
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
              // 백엔드 API를 통해 장바구니에서 제거
              await lectureService.removeFromCart(this.lecture.id);
              
              // 성공 시 상태 업데이트
              this.isInCart = false;
              
              // 장바구니 스토어 업데이트
              if (this.cartStore) {
                await this.cartStore.fetchServerCartList();
              }
              
              this.showSuccess('장바구니에서 강의가 제거되었습니다.');
            } catch (error) {
              console.error('장바구니 삭제 오류:', error);
              this.showError('장바구니에서 제거에 실패했습니다. 다시 시도해주세요.');
            }
          }
        });
        return;
      }

      try {
        // 백엔드 API를 통해 장바구니에 추가
        await lectureService.addToCart([this.lecture.id]);
        
        // 성공 시 상태 업데이트
        this.isInCart = true;
        
        // 장바구니 스토어 업데이트
        if (this.cartStore) {
          await this.cartStore.fetchServerCartList();
        }
        
        this.showCartModal = true;
      } catch (error) {
        console.error('장바구니 추가 오류:', error);
        this.showError('장바구니 추가에 실패했습니다. 다시 시도해주세요.');
      }
    },

    // 강의 구매하기
    purchaseLecture() {
      
      
      if (!this.lecture) {
        this.showError('강의 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // 로그인 확인
      if (!this.currentUserId) {
        this.showLoginRequiredModal = true;
        return;
      }

      // 장바구니에 추가 후 장바구니 페이지로 이동
      this.enrollLecture();
    },

         // 장바구니로 이동
     goToCart() {
       this.showCartModal = false;
       this.$router.push('/cart');
     },

     // 좋아요 토글
     async toggleLike() {
       if (!this.lecture) {
         this.showError('강의 정보를 불러오는 중입니다.');
         return;
       }

       try {
         const response = await lectureService.toggleLectureLike(this.lecture.id);
         
         if (response.success) {
           // 좋아요 상태 토글
           this.isLiked = !this.isLiked;
           
           // 강의 데이터의 좋아요 상태도 업데이트
           this.lecture.isLiked = this.isLiked;
           
           // 좋아요 수 업데이트
           if (this.isLiked) {
             this.lecture.likeCount = (this.lecture.likeCount || 0) + 1;
           } else {
             this.lecture.likeCount = Math.max(0, (this.lecture.likeCount || 0) - 1);
           }
           
           // 성공 메시지 표시
           const message = this.isLiked ? '좋아요를 눌렀습니다!' : '좋아요를 취소했습니다.';
           this.showSuccess(message);
         } else {
           this.showError(response.message || '좋아요 처리에 실패했습니다.');
         }
       } catch (error) {
         console.error('좋아요 토글 오류:', error);
         this.showError('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
       }
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
    
    // 키보드 이벤트 핸들러
    handleKeydown(event) {
      if (event.key === 'Escape') {
        // ESC 키로 공유하기 모달만 닫기
        if (this.showShareModal) {
          this.showShareModal = false;
        }
      }
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

           // 강의 클릭 처리 (역할별 접근 제어)
      handleLessonClick(lesson, index) {
        // 비디오 URL이 없는 경우
        if (!lesson.videoUrl) {
          this.showError('비디오를 사용할 수 없습니다.');
          return;
        }

        // 강의 시청 가능한 사용자 (구매자, 작성자, 관리자) 또는 미리보기 강의
        if (this.canWatchLecture || lesson.isPreview) {
          // 모든 강의를 메인 영역에서 재생
          this.playVideo(lesson, index);
          return;
        }
        
        // 로그인하지 않은 사용자: 로그인 필요 안내
        if (this.isGuest) {
          this.showLoginRequiredModal = true;
          return;
        }
        
        // 로그인했지만 구매하지 않은 사용자: 구매 필요 안내
        this.showPurchaseRequiredModal = true;
      },

           // 강의 제목 툴팁 생성 (역할별)
      getLessonTitle(lesson, index) {
        if (!lesson.videoUrl) {
          return '비디오를 사용할 수 없습니다';
        }
        
        // 미리보기 강의인 경우
        if (lesson.isPreview) {
          return '클릭하여 비디오 재생 (미리보기)';
        }
        
        // 강의 시청 가능한 사용자 (구매자, 작성자, 관리자)
        if (this.canWatchLecture) {
          return '클릭하여 비디오 재생';
        }
        
        // 로그인하지 않은 사용자
        if (this.isGuest) {
          return '로그인 후 시청 가능';
        }
        
        // 로그인했지만 구매하지 않은 사용자
        return '구매 후 시청 가능';
      },

      // 별점 호버 기능
      handleStarHover(starIndex) {
        // 호버 시 해당 별까지 모두 채우기
        this.newReview.rating = starIndex;
      },

      // 별점 호버 해제
      handleStarLeave() {
        // 호버 해제 시 원래 선택된 별점으로 복원
        // 클릭으로 선택된 별점이 있다면 그 값으로, 없다면 0으로
        this.newReview.rating = this.selectedRating;
      },

      // 별점 클릭 시 선택된 별점 저장
      handleStarClick(starIndex) {
        this.newReview.rating = starIndex;
        // 클릭으로 선택된 별점을 저장 (호버 해제 시 복원용)
        this.selectedRating = starIndex;
      },

     
  },
      async mounted() {
      // 스토어 초기화
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
  
      if (tab === 'qa') {
        this.activeTab = 'qa';
      } else if (tab === 'reviews') {
        this.activeTab = 'reviews';
    }  
      // 장바구니 스토어 초기화
      this.cartStore = useCartStore();
      this.chatStore = useChatStore();
      this.authStore = useAuthStore();
      
      // 현재 사용자 ID 가져오기
      this.currentUserId = getUserIdFromToken();
      
      // URL 파라미터에서 강의 ID를 가져와서 데이터 로드
      const lectureId = this.$route.params.id;
      if (lectureId) {
        await this.fetchLectureData(lectureId);
        
        // URL 쿼리 파라미터에서 결제 완료 여부 확인
        const urlParams = new URLSearchParams(window.location.search);
        const paymentCompleted = urlParams.get('paymentCompleted');
        
        // 결제 완료 후 돌아온 경우 구매 상태를 다시 확인
        if (paymentCompleted === 'true') {
   
          setTimeout(async () => {
            await this.checkPurchaseStatus(lectureId);
            await this.checkCartStatus(lectureId);
            // URL에서 paymentCompleted 파라미터 제거
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete('paymentCompleted');
            window.history.replaceState({}, '', newUrl);
          }, 1000);
        }
      }
      
      // Kakao SDK 초기화
      if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
        Kakao.init("3a1a982f8ee6ddbc64171c2f80850243");
      }
      
      // 키보드 이벤트 리스너 추가
      document.addEventListener('keydown', this.handleKeydown);
    },

    // 컴포넌트 제거 시 타이머 정리
    beforeDestroy() {
      if (this.progressSaveTimer) {
        clearTimeout(this.progressSaveTimer);
      }
      
      // 키보드 이벤트 리스너 제거
      document.removeEventListener('keydown', this.handleKeydown);
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
 
 .title-section {
   display: flex;
   justify-content: space-between;
   align-items: flex-start;
   gap: 20px;
   margin-bottom: 16px;
 }
 
 .top-edit-button {
   flex-shrink: 0;
 }
 
 .edit-lecture-btn {
   background: #17a2b8;
   color: white;
   border: none;
   padding: 10px 16px;
   border-radius: 6px;
   font-size: 14px;
   font-weight: 600;
   cursor: pointer;
   transition: all 0.2s ease;
   white-space: nowrap;
 }
 
 .edit-lecture-btn:hover {
   background: #138496;
   transform: translateY(-1px);
   box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
 }

 .delete-lecture-btn {
   background: #dc3545;
   color: white;
   border: none;
   padding: 10px 16px;
   border-radius: 6px;
   font-size: 14px;
   font-weight: 600;
   cursor: pointer;
   transition: all 0.2s ease;
   white-space: nowrap;
   margin-left: 12px;
 }

 .delete-lecture-btn:hover {
   background: #c82333;
   transform: translateY(-1px);
   box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
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
  border: 1px solid #000000;
  border-radius: 8px;
  background: #fff8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.lesson-item:hover {
  border-color: #ff7a00;
  box-shadow: 0 4px 16px rgba(255, 122, 0, 0.15);
  transform: translateY(-2px);
  background: #fff5e6;
}

.lesson-item.preview {
  background: #fff8f0;
}

.lesson-item.active {
  border-color: #ff7a00;
  border-width: 2px;
  background: #fff8f0;
  box-shadow: 0 1px 4px rgba(255, 122, 0, 0.15);
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
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.instructor-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.instructor-profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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
  display: block;
  margin-left: auto;
  margin-right: auto;
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

.reviewer-profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reviewer-profile:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.reviewer-profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-profile-placeholder {
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #666;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.questioner-profile {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.questioner-profile:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.questioner-profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.questioner-profile-placeholder {
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #666;
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

.answerer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.answerer-profile {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.answerer-profile:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.answerer-profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.answerer-profile-placeholder {
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #666;
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
}

.no-qa {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 24px;
}

.no-qa p {
  margin: 0;
  color: #666;
}

.no-qa-sub {
  margin-top: 8px !important;
  font-size: 14px;
  color: #999 !important;
}

.qa-actions {
  text-align: center;
  margin-bottom: 24px;
}

.qa-edit-actions {
  display: flex;
  gap: 8px;
}

.qa-edit-actions button {
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.qa-edit-actions .edit-btn:hover {
  background: #e3f2fd;
  color: #1976d2;
}

.qa-edit-actions .delete-btn:hover {
  background: #ffebee;
  color: #d32f2f;
}

.qa-answer-action {
  margin-top: 12px;
  text-align: right;
}

.answer-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.answer-btn:hover {
  background: #138496;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(23, 162, 184, 0.3);
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

.enroll-btn.purchase-btn {
  background: #ff6b35;
  font-weight: 700;
}

.enroll-btn.purchase-btn:hover {
  background: #e55a2b;
  transform: translateY(-1px);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

/* 강의 수강률 스타일 */
.progress-section {
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.progress-percent {
  font-size: 16px;
  font-weight: 700;
  color: #ff7a00;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff7a00, #ff6b35);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.share-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 20px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.share-section:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateY(-2px);
}

.report-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 20px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.report-section:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateY(-2px);
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
  .lesson-item:not(.preview):not(.can-watch) {
    opacity: 0.8;
    position: relative;
  }

  .lesson-item:not(.preview):not(.can-watch)::after {
    content: '🔒';
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 16px;
    color: #999;
  }
  
  /* 역할별 버튼 스타일 */
  .watch-btn {
    background: #28a745 !important;
  }
  
  .watch-btn:hover {
    background: #218838 !important;
  }
  
  .author-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }
  
  .edit-btn {
    background: #17a2b8 !important;
  }
  
  .edit-btn:hover {
    background: #138496 !important;
  }
  
  .delete-btn {
    background: #dc3545 !important;
  }
  
  .delete-btn:hover {
    background: #c82333 !important;
  }
  
  /* 리뷰/Q&A 수정/삭제 버튼 스타일 */
  .review-actions, .question-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .review-edit-actions, .qa-edit-actions {
    display: flex;
    gap: 5px;
  }
  
  /* 리뷰 콘텐츠의 수정/삭제 텍스트 스타일 (우측 하단) */
  .review-content .review-edit-actions {
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #666;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 4px;
    border-radius: 4px;
  }
  
  .review-content .edit-text,
  .review-content .delete-text {
    cursor: pointer;
    transition: color 0.2s ease;
  }
  
  .review-content .edit-text:hover {
    color: #17a2b8;
  }
  
  .review-content .delete-text:hover {
    color: #dc3545;
  }
  
  .review-content .separator {
    color: #666;
  }

  .question-content .edit-text,
  .question-content .delete-text {
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .question-content .edit-text:hover {
    color: #17a2b8;
  }

  .question-content .delete-text:hover {
    color: #dc3545;
  }

  .question-content .separator {
    color: #666;
  }
  
  /* 리뷰 수정/삭제 텍스트 스타일 */
  .review-content {
    position: relative;
    padding-bottom: 25px; /* 수정/삭제 버튼을 위한 공간 */
    min-height: 40px; /* 최소 높이 보장 */
  }

  /* Q&A 콘텐츠의 수정/삭제 텍스트 스타일 (우측 하단) */
  .question-content .qa-edit-actions {
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #666;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 4px;
    border-radius: 4px;
  }

  /* Q&A 수정/삭제 텍스트 스타일 */
  .question-content {
    position: relative;
    padding-bottom: 25px; /* 수정/삭제 버튼을 위한 공간 */
    min-height: 40px; /* 최소 높이 보장 */
  }
  
  .review-edit-actions .edit-btn,
  .qa-edit-actions .edit-btn {
    background: #17a2b8;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }
  
  .review-edit-actions .delete-btn,
  .qa-edit-actions .delete-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }
  
   .review-edit-actions .edit-btn:hover,
 .qa-edit-actions .edit-btn:hover {
   background: #138496;
 }
 
 /* 좋아요 버튼 스타일 */
 .like-section {
   display: flex;
   align-items: center;
 }
 
 .like-button {
   display: flex;
   align-items: center;
   gap: 4px;
   padding: 6px 12px;
   background: #fff;
   border: 2px solid #ff6b6b;
   border-radius: 20px;
   color: #ff6b6b;
   font-weight: 600;
   font-size: 13px;
   cursor: pointer;
   transition: all 0.3s ease;
   box-shadow: 0 2px 4px rgba(255, 107, 107, 0.2);
   min-width: 70px;
   justify-content: center;
 }
 
 .like-button:hover {
   background: #ff6b6b;
   color: #fff;
   transform: translateY(-2px);
   box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
 }
 
 .like-button.liked {
   background: #ff6b6b;
   color: #fff;
   border-color: #ff6b6b;
 }
 
 .like-button.liked:hover {
   background: #ff5252;
   border-color: #ff5252;
 }
 
 .like-icon {
   font-size: 14px;
   transition: transform 0.3s ease;
 }
 
 .like-button:hover .like-icon {
   transform: scale(1.1);
 }
 
  .like-count {
   font-weight: 700;
   min-width: 20px;
   text-align: center;
 }
  
  .review-edit-actions .delete-btn:hover,
  .qa-edit-actions .delete-btn:hover {
    background: #c82333;
  }

  /* 비디오 모달 스타일 */
  .video-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
  }

  .video-modal {
    background: #000;
    border-radius: 12px;
    max-width: 90vw;
    max-height: 90vh;
    width: 100%;
    height: auto;
    position: relative;
    overflow: hidden;
  }

  .video-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #1a1a1a;
    color: white;
    border-bottom: 1px solid #333;
  }

  .video-modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .video-modal-header .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .video-modal-header .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .video-modal-content {
    padding: 0;
  }

  .video-player-container {
    width: 100%;
    height: auto;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .video-player {
    width: 100%;
    height: auto;
    max-height: 70vh;
    background: #000;
  }

  .video-error {
    padding: 40px;
    text-align: center;
    color: #999;
  }

  .video-error p {
    margin: 0;
    font-size: 16px;
  }

  @media (max-width: 768px) {
    .video-modal {
      max-width: 95vw;
      max-height: 95vh;
    }
    
    .video-modal-header {
      padding: 15px;
    }
    
    .video-modal-header h3 {
      font-size: 16px;
    }
    
    .video-player {
      max-height: 60vh;
    }
  }
</style> 