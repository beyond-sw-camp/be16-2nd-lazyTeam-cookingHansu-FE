<template>
  <div class="lecture-edit-page">
    <Header />
    
    <div class="edit-container">
             <div class="edit-header">
         <h1>강의 수정하기</h1>
       </div>
      
      <form @submit.prevent="submitForm" class="edit-form">
        <!-- 기본 정보 섹션 -->
        <div class="form-section">
          <h2>기본 정보</h2>
          
          <div class="form-group">
            <label for="title">강의 제목</label>
            <input 
              id="title"
              v-model="formData.title" 
              type="text" 
              placeholder="강의 제목을 입력하세요"
            />
          </div>
          
          <div class="form-group">
            <label for="description">강의 설명</label>
            <textarea 
              id="description"
              v-model="formData.description" 
              placeholder="강의에 대한 설명을 입력하세요"
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="category">카테고리</label>
              <select id="category" v-model="formData.category">
                <option value="">카테고리 선택</option>
                <option value="KOREAN">한식</option>
                <option value="WESTERN">양식</option>
                <option value="JAPANESE">일식</option>
                <option value="CHINESE">중식</option>
                <option value="DESSERT">디저트</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="level">난이도</label>
              <select id="level" v-model="formData.level">
                <option value="">난이도 선택</option>
                <option value="VERY_LOW">매우쉬움</option>
                <option value="LOW">쉬움</option>
                <option value="MEDIUM">보통</option>
                <option value="HIGH">어려움</option>
                <option value="VERY_HIGH">매우어려움</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="price">가격</label>
              <input 
                id="price"
                v-model.number="formData.price" 
                type="number" 
                placeholder="가격을 입력하세요"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <!-- 썸네일 이미지 섹션 -->
        <div class="form-section">
          <h2>썸네일 이미지</h2>
          <div class="image-upload">
            <div class="current-image" v-if="currentThumbnail">
              <img :src="currentThumbnail" alt="현재 썸네일" />
              <p>현재 썸네일</p>
            </div>
            <div class="upload-area" @click="triggerFileInput('thumbnail')">
                                                                            <input 
                   ref="thumbnailInput"
                   type="file" 
                   accept=".png,.jpg,.jpeg,.bmp" 
                   @change="handleThumbnailUpload"
                   style="display: none"
                 />
              <div class="upload-content">
                <span class="upload-icon">📷</span>
                <p>클릭하여 썸네일 이미지 변경</p>
                                                                   <p class="upload-hint">JPG, PNG, GIF (최대 5MB)</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 재료 섹션 -->
        <div class="form-section">
          <h2>재료</h2>
          <div class="ingredients-list">
            <div 
              v-for="(ingredient, index) in formData.ingredients" 
              :key="index" 
              class="ingredient-item"
            >
              <input 
                v-model="ingredient.ingredientsName" 
                type="text" 
                placeholder="재료명"
                class="ingredient-name"
              />
              <input 
                v-model="ingredient.amount" 
                type="text" 
                placeholder="수량"
                class="ingredient-amount"
              />
              <button 
                type="button" 
                @click="removeIngredient(index)"
                class="remove-btn"
              >
                삭제
              </button>
            </div>
          </div>
          <button 
            type="button" 
            @click="addIngredient"
            class="add-btn"
          >
            + 재료 추가
          </button>
        </div>
        
        <!-- 조리 과정 섹션 -->
        <div class="form-section">
          <h2>조리 과정</h2>
          <div class="steps-list">
            <div 
              v-for="(step, index) in formData.steps" 
              :key="index" 
              class="step-item"
            >
              <div class="step-header">
                <span class="step-number">{{ index + 1 }}</span>
                <button 
                  type="button" 
                  @click="removeStep(index)"
                  class="remove-btn"
                >
                  삭제
                </button>
              </div>
              <textarea 
                v-model="step.content" 
                placeholder="조리 과정을 입력하세요"
                rows="3"
                class="step-content"
              ></textarea>
            </div>
          </div>
          <button 
            type="button" 
            @click="addStep"
            class="add-btn"
          >
            + 과정 추가
          </button>
        </div>
        
        <!-- 강의 영상 섹션 -->
        <div class="form-section">
          <h2>강의 영상</h2>
          <div class="videos-list">
            <div 
              v-for="(video, index) in formData.videos" 
              :key="index" 
              class="video-item"
            >
              <div class="video-header">
                <span class="video-number">{{ index + 1 }}강</span>
                <button 
                  type="button" 
                  @click="removeVideo(index)"
                  class="remove-btn"
                >
                  삭제
                </button>
              </div>
              
              <div class="video-content">
                <input 
                  v-model="video.title" 
                  type="text" 
                  placeholder="강의 제목"
                  class="video-title"
                />
                
                <div class="video-upload">
                  <div class="current-video" v-if="video.videoUrl">
                    <video :src="video.videoUrl" controls style="max-width: 200px; max-height: 150px;"></video>
                    <p>현재 영상</p>
                  </div>
                  <div class="upload-area" @click="triggerFileInput(`video-${index}`)">
                                                                                                          <input 
                         :ref="`videoInput-${index}`"
                         type="file" 
                         accept=".mp4,.mov,.avi" 
                         @change="(event) => handleVideoUpload(event, index)"
                         style="display: none"
                       />
                    <div class="upload-content">
                      <span class="upload-icon">🎥</span>
                      <p>클릭하여 영상 변경</p>
                                                                                           <p class="upload-hint">MP4, AVI, MOV (최대 100MB)</p>
                    </div>
                  </div>
                </div>
                

              </div>
            </div>
          </div>
          <button 
            type="button" 
            @click="addVideo"
            class="add-btn"
          >
            + 강의 추가
          </button>
        </div>
        
        <!-- 제출 버튼 -->
        <div class="form-actions">
          <button type="button" @click="goBack" class="cancel-btn">
            취소
          </button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '수정 중...' : '강의 수정하기' }}
          </button>
        </div>
      </form>
    </div>
    
         <!-- 로딩 오버레이 -->
     <div v-if="isSubmitting" class="loading-overlay">
       <div class="loading-spinner"></div>
       <p>강의를 수정하고 있습니다...</p>
     </div>

     <!-- 성공 모달 -->
     <CommonModal
       v-model="showModal"
       :type="modalType"
       :title="modalTitle"
       :message="modalMessage"
       :confirm-text="modalConfirmText"
       :cancel-text="modalCancelText"
       :show-cancel-button="modalShowCancelButton"
       :loading="modalLoading"
       @confirm="handleModalConfirm"
       @cancel="handleModalCancel"
     />

   </div>
 </template>

<script>
import Header from '@/components/Header.vue';
import CommonModal from '@/components/common/CommonModal.vue';
import { lectureService } from '@/views/home/lectureService';

export default {
  name: 'LectureEdit',
  components: { Header, CommonModal },
  data() {
    return {
      lectureId: null,
      isSubmitting: false,
      currentThumbnail: null,
      
      // 모달 관련 데이터
      showModal: false,
      modalType: 'info',
      modalTitle: '',
      modalMessage: '',
      modalConfirmText: '확인',
      modalCancelText: '취소',
      modalShowCancelButton: true,
      modalLoading: false,
      modalCallback: null,

      formData: {
        title: '',
        description: '',
        category: '',
        level: '',
        price: 0,
        ingredients: [],
        steps: [],
        videos: []
      }
    };
  },
  async mounted() {
    this.lectureId = this.$route.params.id;
    if (this.lectureId) {
      await this.loadLectureData();
    }
  },
  methods: {
    // 강의 데이터 로드
    async loadLectureData() {
      try {
        const response = await lectureService.getLectureDetail(this.lectureId);
        if (response.success) {
          const lectureData = response.data;
          
          // 폼 데이터 설정
          this.formData = {
            title: lectureData.title || '',
            description: lectureData.description || '',
            category: lectureData.category || '',
            level: lectureData.level || '',
            price: lectureData.price || 0,
            ingredients: lectureData.ingredResDtoList?.map(ing => ({
              ingredientsName: ing.ingredientsName || '',
              amount: ing.amount || ''
            })) || [],
            steps: lectureData.lectureStepResDtoList?.map(step => ({
              content: step.content || ''
            })) || [],
            videos: lectureData.lectureVideoResDtoList?.map(video => ({
              title: video.title || '',
              videoUrl: video.videoUrl || '',
              preview: video.preview || false
            })) || []
          };
          
          // 현재 썸네일 설정
          this.currentThumbnail = lectureData.thumbUrl;
        }
      } catch (error) {
        console.error('강의 데이터 로드 실패:', error);
        this.showError('강의 정보를 불러오는데 실패했습니다.');
      }
    },
    
    // 재료 추가
    addIngredient() {
      this.formData.ingredients.push({
        ingredientsName: '',
        amount: ''
      });
    },
    
    // 재료 삭제
    removeIngredient(index) {
      this.formData.ingredients.splice(index, 1);
    },
    
    // 과정 추가
    addStep() {
      this.formData.steps.push({
        content: ''
      });
    },
    
    // 과정 삭제
    removeStep(index) {
      this.formData.steps.splice(index, 1);
    },
    
    // 강의 추가
    addVideo() {
      this.formData.videos.push({
        title: '',
        videoUrl: '',
        preview: false
      });
    },
    
    // 강의 삭제
    removeVideo(index) {
      this.formData.videos.splice(index, 1);
    },
    
    // 파일 입력 트리거
    triggerFileInput(type) {
      if (type === 'thumbnail') {
        this.$refs.thumbnailInput.click();
      } else if (type.startsWith('video-')) {
        const index = parseInt(type.split('-')[1]);
        this.$refs[`videoInput-${index}`][0].click();
      }
    },
    
               // 썸네일 업로드 처리
      handleThumbnailUpload(event) {
        const file = event.target.files[0];
        if (file) {
          // 파일 타입 검증
          const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];
          if (!allowedTypes.includes(file.type)) {
            this.showModalDialog('error', '파일 타입 오류', '썸네일은 PNG, JPG, JPEG, BMP 파일만 업로드 가능합니다.', '확인', '', false);
            event.target.value = '';
            return;
          }
          
          // 파일 크기 검증
          if (file.size > 5 * 1024 * 1024) {
            this.showModalDialog('error', '파일 크기 오류', '파일 크기는 5MB 이하여야 합니다.', '확인', '', false);
            event.target.value = '';
            return;
          }
          
          // 미리보기 생성
          const reader = new FileReader();
          reader.onload = (e) => {
            this.currentThumbnail = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      },
    
               // 영상 업로드 처리
      handleVideoUpload(event, index) {
        const file = event.target.files[0];
        if (file) {
          // 파일 타입 검증
          const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
          if (!allowedTypes.includes(file.type)) {
            this.showModalDialog('error', '파일 타입 오류', '동영상은 MP4, MOV, AVI 파일만 업로드 가능합니다.', '확인', '', false);
            event.target.value = '';
            return;
          }
          
          // 파일 크기 검증
          if (file.size > 100 * 1024 * 1024) {
            this.showModalDialog('error', '파일 크기 오류', '파일 크기는 100MB 이하여야 합니다.', '확인', '', false);
            event.target.value = '';
            return;
          }
          
          // 미리보기 URL 생성
          const videoUrl = URL.createObjectURL(file);
          this.formData.videos[index].videoUrl = videoUrl;
        }
      },
    
         // 폼 제출
     async submitForm() {
       if (this.isSubmitting) return;
       
       // 유효성 검사
       if (!this.validateForm()) {
         return;
       }
       
       this.isSubmitting = true;
       
       try {
         // FormData 생성
         const formData = new FormData();
         
         // ✅ JSON은 반드시 Blob(application/json)으로
         const lectureUpdateDto = {
           title: this.formData.title,
           description: this.formData.description,
           category: this.formData.category,
           level: this.formData.level,
           price: this.formData.price
         };
         
                   const lectureIngredientsListDto = this.formData.ingredients.length > 0 
            ? this.formData.ingredients.map((ing, index) => ({
                ...ing,
                sequence: index + 1
              }))
            : [];
          
          const lectureStepDto = this.formData.steps.length > 0
            ? this.formData.steps.map((step, index) => ({
                stepSequence: index + 1,
                content: step.content
              }))
            : [];
          
          const lectureVideoDto = this.formData.videos.length > 0
            ? this.formData.videos.map((video, index) => ({
                title: video.title,
                sequence: index + 1
              }))
            : [];

                   formData.append('lectureUpdateDto',
            new Blob([JSON.stringify(lectureUpdateDto)], { type: 'application/json' })
          );
          
          formData.append('lectureIngredientsListDto',
            new Blob([JSON.stringify(lectureIngredientsListDto)], { type: 'application/json' })
          );
          
          formData.append('lectureStepDto',
            new Blob([JSON.stringify(lectureStepDto)], { type: 'application/json' })
          );
          
          formData.append('lectureVideoDto',
            new Blob([JSON.stringify(lectureVideoDto)], { type: 'application/json' })
          );
          
          // 파일들 추가
          const thumbnailInput = this.$refs.thumbnailInput;
          if (thumbnailInput.files[0]) {
            formData.append('multipartFile', thumbnailInput.files[0], thumbnailInput.files[0].name);
          }
          
          // 영상 파일들 추가
          this.formData.videos.forEach((video, index) => {
            const videoInput = this.$refs[`videoInput-${index}`];
            if (videoInput && videoInput[0] && videoInput[0].files[0]) {
              formData.append('lectureVideoFiles', videoInput[0].files[0], videoInput[0].files[0].name);
            }
          });
         
         // API 호출
         const response = await lectureService.updateLecture(this.lectureId, formData);
        
                 if (response.success) {
           this.showModalDialog('success', '수정 완료', '강의가 성공적으로 수정되었습니다!', '확인', '', false, () => {
             this.$router.push(`/lectures/${this.lectureId}`);
           });
         } else {
           this.showError(response.message || '강의 수정에 실패했습니다.');
         }
             } catch (error) {
         console.error('강의 수정 실패:', error);
         
         // 415 에러 처리 (파일 타입 불일치)
         if (error.status === 415 || error.message?.includes('415')) {
           this.showModalDialog('error', '파일 타입 오류', '업로드한 파일의 타입이 서버에서 지원하지 않는 형식입니다. 썸네일은 PNG, JPG, JPEG, BMP, 동영상은 MP4, MOV, AVI 파일만 업로드 가능합니다.', '확인', '', false);
         } else {
           this.showError('강의 수정에 실패했습니다. 다시 시도해주세요.');
         }
       } finally {
         this.isSubmitting = false;
       }
    },
    
    // 폼 유효성 검사
    validateForm() {
      if (!this.formData.title.trim()) {
        this.showError('강의 제목을 입력해주세요.');
        return false;
      }
      
      if (!this.formData.description.trim()) {
        this.showError('강의 설명을 입력해주세요.');
        return false;
      }
      
      if (!this.formData.category) {
        this.showError('카테고리를 선택해주세요.');
        return false;
      }
      
      if (!this.formData.level) {
        this.showError('난이도를 선택해주세요.');
        return false;
      }
      
      if (!this.formData.price || this.formData.price <= 0) {
        this.showError('올바른 가격을 입력해주세요.');
        return false;
      }
      
      if (this.formData.ingredients.length === 0) {
        this.showError('최소 하나의 재료를 추가해주세요.');
        return false;
      }
      
      if (this.formData.steps.length === 0) {
        this.showError('최소 하나의 조리 과정을 추가해주세요.');
        return false;
      }
      
      if (this.formData.videos.length === 0) {
        this.showError('최소 하나의 강의 영상을 추가해주세요.');
        return false;
      }
      
      return true;
    },
    
    // 뒤로 가기
    goBack() {
      this.$router.go(-1);
    },
    

    
         // 모달 관련 메서드
     showModalDialog(type, title, message, confirmText = '확인', cancelText = '취소', showCancelButton = true, callback = null) {
       this.modalType = type;
       this.modalTitle = title;
       this.modalMessage = message;
       this.modalConfirmText = confirmText;
       this.modalCancelText = cancelText;
       this.modalShowCancelButton = showCancelButton;
       this.modalCallback = callback;
       this.showModal = true;
     },

     handleModalConfirm() {
       if (this.modalCallback) {
         this.modalCallback();
       }
       this.showModal = false;
     },

     handleModalCancel() {
       this.showModal = false;
     },
     
     // 에러 표시
     showError(message) {
       alert(message);
     },
     
     // 성공 표시
     showSuccess(message) {
       alert(message);
     }
  }
};
</script>

<style scoped>
.lecture-edit-page {
  background: #fafbfc;
  min-height: 100vh;
  margin-top: 64px;
  padding: 40px 20px;
}

.edit-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.edit-header {
  text-align: center;
  margin-bottom: 40px;
}

.edit-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b35;
  margin: 0 0 8px 0;
}

.edit-header p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.form-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #17a2b8;
}

.image-upload {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.current-image {
  text-align: center;
}

.current-image img {
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.current-image p {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #666;
}

.upload-area {
  flex: 1;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #17a2b8;
  background: #f8f9fa;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 32px;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.ingredients-list,
.steps-list,
.videos-list {
  margin-bottom: 20px;
}

.ingredient-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.ingredient-name {
  flex: 2;
}

.ingredient-amount {
  flex: 1;
}

.step-item,
.video-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  background: #f8f9fa;
}

.step-header,
.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.step-number,
.video-number {
  font-weight: 600;
  color: #17a2b8;
  font-size: 16px;
}

.step-content {
  width: 100%;
  resize: vertical;
}

.video-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.video-title {
  width: 100%;
}

.video-upload {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.current-video {
  text-align: center;
}

.current-video p {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #666;
}

.video-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.add-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #218838;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #c82333;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
}

.cancel-btn,
.submit-btn {
  padding: 12px 30px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 16px;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.submit-btn {
  background: #17a2b8;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #138496;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #17a2b8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: white;
  font-size: 16px;
  margin: 0;
}

@media (max-width: 768px) {
  .edit-container {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .image-upload,
  .video-upload {
    flex-direction: column;
  }
  
  .ingredient-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
