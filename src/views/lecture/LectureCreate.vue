<template>
  <div class="lecture-create-page">
    <div class="content">
      <div class="form-container">
        <h1 class="page-title">강의 등록</h1>
        
        <form @submit.prevent="submitForm" class="lecture-form">
          <!-- 강의 기본 정보 -->
          <div class="form-section">
            <h2 class="section-title">강의 기본 정보</h2>
            
            <div class="form-group">
              <label for="title" class="form-label">강의 제목 *</label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                class="form-input"
                placeholder="강의 제목을 입력하세요"
                required
              />
            </div>

            <div class="form-group">
              <label for="description" class="form-label">강의 설명 *</label>
              <textarea
                id="description"
                v-model="formData.description"
                class="form-textarea"
                placeholder="강의에 대한 자세한 설명을 입력하세요"
                rows="4"
                required
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="level" class="form-label">난이도 *</label>
                <select
                  id="level"
                  v-model="formData.level"
                  class="form-select"
                  required
                >
                  <option value="">난이도를 선택하세요</option>
                  <option value="VERY_LOW">매우 쉬움</option>
                  <option value="LOW">쉬움</option>
                  <option value="MEDIUM">보통</option>
                  <option value="HIGH">어려움</option>
                  <option value="VERY_HIGH">매우 어려움</option>
                </select>
              </div>

              <div class="form-group">
                <label for="category" class="form-label">카테고리 *</label>
                <select
                  id="category"
                  v-model="formData.category"
                  class="form-select"
                  required
                >
                  <option value="">카테고리를 선택하세요</option>
                  <option value="KOREAN">한식</option>
                  <option value="CHINESE">중식</option>
                  <option value="WESTERN">양식</option>
                  <option value="JAPANESE">일식</option>
                </select>
              </div>

              <div class="form-group">
                <label for="price" class="form-label">가격 (원) *</label>
                <input
                  id="price"
                  v-model.number="formData.price"
                  type="number"
                  class="form-input"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <!-- 썸네일 이미지 -->
          <div class="form-section">
            <h2 class="section-title">썸네일 이미지 *</h2>
            <div class="thumbnail-upload">
              <div
                class="thumbnail-area"
                @click="triggerThumbnailUpload"
                @dragover.prevent
                @drop.prevent="handleThumbnailDrop"
              >
                                                   <input
                    ref="thumbnailInput"
                    type="file"
                    accept=".png,.jpg,.jpeg,.bmp"
                    @change="handleThumbnailChange"
                    style="display: none"
                    required
                  />
                <div v-if="!thumbnailPreview" class="upload-placeholder">
                  <div class="upload-icon">📷</div>
                  <p>이미지를 클릭하여 등록</p>
                </div>
                <img
                  v-else
                  :src="thumbnailPreview"
                  alt="썸네일 미리보기"
                  class="thumbnail-preview"
                />
              </div>
            </div>
          </div>

          <!-- 강의 비디오 -->
          <div class="form-section">
            <h2 class="section-title">강의 비디오 *</h2>
            <div class="video-section">
              <div class="video-list">
                <div
                  v-for="(video, index) in formData.videos"
                  :key="index"
                  class="video-item"
                >
                  <div class="video-header">
                    <h3>강의 {{ index + 1 }}</h3>
                    <button
                      type="button"
                      @click="removeVideo(index)"
                      class="remove-btn"
                    >
                      삭제
                    </button>
                  </div>
                  <div class="video-content">
                    <div class="form-group video-title-group">
                      <label class="form-label">강의 제목 *</label>
                      <input
                        v-model="video.title"
                        type="text"
                        class="form-input"
                        placeholder="강의 제목을 입력하세요"
                        required
                      />
                    </div>
                    <div class="form-group video-file-group">
                      <label class="form-label">비디오 파일 *</label>
                                                                     <input
                          type="file"
                          accept=".mp4,.mov,.avi"
                          @change="handleVideoFileChange($event, index)"
                          class="form-input"
                          required
                        />
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
          </div>

          <!-- 재료 목록 -->
          <div class="form-section">
            <h2 class="section-title">재료 목록 *</h2>
            <div class="ingredients-section">
              <div class="ingredients-list">
                <div
                  v-for="(ingredient, index) in formData.ingredients"
                  :key="index"
                  class="ingredient-item"
                >
                  <div class="ingredient-header">
                    <h3>재료 {{ index + 1 }}</h3>
                    <button
                      type="button"
                      @click="removeIngredient(index)"
                      class="remove-btn"
                    >
                      삭제
                    </button>
                  </div>
                  <div class="ingredient-content">
                    <div class="form-group">
                      <label class="form-label">재료명 *</label>
                      <input
                        v-model="ingredient.ingredientsName"
                        type="text"
                        class="form-input"
                        placeholder="재료명을 입력하세요"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">양 *</label>
                      <input
                        v-model="ingredient.amount"
                        type="text"
                        class="form-input"
                        placeholder="양을 입력하세요 (예: 200g)"
                        required
                      />
                    </div>
                  </div>
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
          </div>

          <!-- 조리 순서 -->
          <div class="form-section">
            <h2 class="section-title">조리 순서 *</h2>
            <div class="steps-section">
              <div class="steps-list">
                <div
                  v-for="(step, index) in formData.steps"
                  :key="index"
                  class="step-item"
                >
                  <div class="step-header">
                    <h3>단계 {{ index + 1 }}</h3>
                    <button
                      type="button"
                      @click="removeStep(index)"
                      class="remove-btn"
                    >
                      삭제
                    </button>
                  </div>
                  <div class="step-content">
                    <div class="form-group step-process-group">
                      <label class="form-label">조리과정 *</label>
                      <textarea
                        v-model="step.content"
                        class="form-textarea step-process-textarea"
                        placeholder="내용을 입력해주세요"
                        rows="3"
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="addStep"
                class="add-btn"
              >
                + 조리 순서 추가
              </button>
            </div>
          </div>

          <!-- 하단 버튼 -->
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? '등록 중...' : '강의 등록' }}
            </button>
            <button type="button" @click="cancelForm" class="cancel-btn">
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 통합 모달 -->
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

export default {
  name: 'LectureCreate',
  components: { Header, CommonModal },
  data() {
    return {
      isSubmitting: false,
      thumbnailPreview: null,
      thumbnailFile: null,
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
        level: '',
        category: '',
        price: 0,
        ingredients: [
          { ingredientsName: '', amount: '' }
        ],
        steps: [
          { stepSequence: 1, content: '' }
        ],
        videos: [
          { title: '', sequence: 1 }
        ]
      },
      videoFiles: []
    };
  },
  methods: {
    // 썸네일 관련 메서드
    triggerThumbnailUpload() {
      this.$refs.thumbnailInput.click();
    },
                   handleThumbnailChange(event) {
        const file = event.target.files[0];
        if (file) {
          // 파일 타입 검증
          const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];
          if (!allowedTypes.includes(file.type)) {
            this.showModalDialog('error', '파일 타입 오류', '썸네일은 PNG, JPG, JPEG, BMP 파일만 업로드 가능합니다.', '확인', '', false);
            event.target.value = '';
            return;
          }
          
          // 파일명 길이 검증
          if (file.name.length > 20) {
            this.showModalDialog('error', '파일명 오류', '파일명은 20자 이하여야 합니다.', '확인', '', false);
            event.target.value = '';
            return;
          }
          
          // 파일 크기 검증
          if (file.size > 5 * 1024 * 1024) {
            this.showModalDialog('error', '파일 크기 오류', '파일 크기는 5MB 이하여야 합니다.', '확인', '', false);
            event.target.value = '';
            return;
          }
          
          this.thumbnailFile = file;
          this.createThumbnailPreview(file);
        }
      },
                   handleThumbnailDrop(event) {
        const file = event.dataTransfer.files[0];
        if (file) {
          // 파일 타입 검증
          const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];
          if (!allowedTypes.includes(file.type)) {
            this.showModalDialog('error', '파일 타입 오류', '썸네일은 PNG, JPG, JPEG, BMP 파일만 업로드 가능합니다.', '확인', '', false);
            return;
          }
          
          // 파일명 길이 검증
          if (file.name.length > 20) {
            this.showModalDialog('error', '파일명 오류', '파일명은 20자 이하여야 합니다.', '확인', '', false);
            return;
          }
          
          // 파일 크기 검증
          if (file.size > 5 * 1024 * 1024) {
            this.showModalDialog('error', '파일 크기 오류', '파일 크기는 5MB 이하여야 합니다.', '확인', '', false);
            return;
          }
          
          this.thumbnailFile = file;
          this.createThumbnailPreview(file);
        }
      },
    createThumbnailPreview(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.thumbnailPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    // 비디오 관련 메서드
    addVideo() {
      this.formData.videos.push({
        title: '',
        sequence: this.formData.videos.length + 1
      });
      this.videoFiles.push(null);
    },
    removeVideo(index) {
      this.formData.videos.splice(index, 1);
      this.videoFiles.splice(index, 1);
    },
                   handleVideoFileChange(event, index) {
        const file = event.target.files[0];
        if (file) {
          // 파일 타입 검증
          const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
          if (!allowedTypes.includes(file.type)) {
            this.showModalDialog('error', '파일 타입 오류', '동영상은 MP4, MOV, AVI 파일만 업로드 가능합니다.', '확인', '', false);
            event.target.value = '';
            return;
          }
          
          // 파일명 길이 검증
          if (file.name.length > 20) {
            this.showModalDialog('error', '파일명 오류', '파일명은 20자 이하여야 합니다.', '확인', '', false);
            event.target.value = '';
            return;
          }
          
          // 파일 크기 검증
          if (file.size > 100 * 1024 * 1024) {
            this.showModalDialog('error', '파일 크기 오류', '파일 크기는 100MB 이하여야 합니다.', '확인', '', false);
            event.target.value = '';
            return;
          }
          
          this.videoFiles[index] = file;
        }
      },

    // 재료 관련 메서드
    addIngredient() {
      this.formData.ingredients.push({
        ingredientsName: '',
        amount: ''
      });
    },
    removeIngredient(index) {
      this.formData.ingredients.splice(index, 1);
    },

    // 조리 순서 관련 메서드
    addStep() {
      this.formData.steps.push({
        stepSequence: this.formData.steps.length + 1,
        content: ''
      });
    },
    removeStep(index) {
      this.formData.steps.splice(index, 1);
      // 순서 재정렬
      this.formData.steps.forEach((step, idx) => {
        step.stepSequence = idx + 1;
      });
    },

         // 폼 제출
     async submitForm() {
       if (!this.validateForm()) {
         return;
       }

       this.isSubmitting = true;

       try {
         const formData = new FormData();

         // ✅ JSON은 반드시 Blob(application/json)으로
         const lectureCreateDto = {
           title: this.formData.title,
           description: this.formData.description,
           level: this.formData.level,
           category: this.formData.category,
           price: this.formData.price
         };
         
                   const lectureIngredientsListDto = this.formData.ingredients.filter(ing => ing.ingredientsName && ing.amount).length > 0
            ? this.formData.ingredients.filter(ing => ing.ingredientsName && ing.amount)
            : [];
          const lectureStepDto = this.formData.steps.filter(step => step.content).length > 0
            ? this.formData.steps.filter(step => step.content)
            : [];
          const lectureVideoDto = this.formData.videos.filter(video => video.title).length > 0
            ? this.formData.videos.filter(video => video.title)
            : [];

                   formData.append('lectureCreateDto',
            new Blob([JSON.stringify(lectureCreateDto)], { type: 'application/json' })
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

          // 파일 배열 (같은 키로 여러 번 append)
          (this.videoFiles || []).forEach(file => {
            if (file) {
              formData.append('lectureVideoFiles', file, file.name);
            }
          });

          // 썸네일(선택)
          if (this.thumbnailFile) {
            formData.append('multipartFile', this.thumbnailFile, this.thumbnailFile.name);
          }

         // Authorization 헤더 추가
         const token = localStorage.getItem('accessToken');
         const response = await fetch('http://localhost:8080/lecture/post', {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${token}`
           },
           body: formData
         });

        if (response.ok) {
          const result = await response.json();
          this.showModalDialog('success', '등록 완료', '강의가 성공적으로 등록되었습니다!', '확인', '', false, () => {
            this.$router.push({ name: 'LectureList' });
          });
        } else {
          throw new Error('강의 등록에 실패했습니다.');
        }
             } catch (error) {
         console.error('강의 등록 오류:', error);
         
         // 415 에러 처리 (파일 타입 불일치)
         if (error.status === 415 || error.message?.includes('415')) {
           this.showModalDialog('error', '파일 타입 오류', '업로드한 파일의 타입이 서버에서 지원하지 않는 형식입니다. 썸네일은 PNG, JPG, JPEG, BMP, 동영상은 MP4, MOV, AVI 파일만 업로드 가능합니다.', '확인', '', false);
         } else {
           this.showModalDialog('error', '등록 실패', '강의 등록 중 오류가 발생했습니다.', '확인', '', false);
         }
       } finally {
         this.isSubmitting = false;
       }
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

    validateForm() {
      if (!this.formData.title.trim()) {
        this.showModalDialog('warning', '입력 오류', '강의 제목을 입력해주세요.', '확인', '', false);
        return false;
      }
      if (!this.formData.description.trim()) {
        this.showModalDialog('warning', '입력 오류', '강의 설명을 입력해주세요.', '확인', '', false);
        return false;
      }
      if (!this.formData.level) {
        this.showModalDialog('warning', '입력 오류', '난이도를 선택해주세요.', '확인', '', false);
        return false;
      }
      if (!this.formData.category) {
        this.showModalDialog('warning', '입력 오류', '카테고리를 선택해주세요.', '확인', '', false);
        return false;
      }
      if (!this.formData.price || this.formData.price <= 0) {
        this.showModalDialog('warning', '입력 오류', '가격을 입력해주세요.', '확인', '', false);
        return false;
      }
      if (!this.thumbnailFile) {
        this.showModalDialog('warning', '입력 오류', '썸네일 이미지를 등록해주세요.', '확인', '', false);
        return false;
      }
      
      // 비디오 검증
      for (let i = 0; i < this.formData.videos.length; i++) {
        if (!this.formData.videos[i].title.trim()) {
          this.showModalDialog('warning', '입력 오류', `강의 ${i + 1}의 제목을 입력해주세요.`, '확인', '', false);
          return false;
        }
        
        // 제목 길이 검증 (50자 제한)
        if (this.formData.videos[i].title.length > 50) {
          this.showModalDialog('warning', '입력 오류', `강의 ${i + 1}의 제목은 50자 이하여야 합니다.`, '확인', '', false);
          return false;
        }
        
        if (!this.videoFiles[i]) {
          this.showModalDialog('warning', '입력 오류', `강의 ${i + 1}의 비디오 파일을 등록해주세요.`, '확인', '', false);
          return false;
        }
      }
      
      // 재료 검증
      for (let i = 0; i < this.formData.ingredients.length; i++) {
        if (!this.formData.ingredients[i].ingredientsName.trim()) {
          this.showModalDialog('warning', '입력 오류', `재료 ${i + 1}의 재료명을 입력해주세요.`, '확인', '', false);
          return false;
        }
        if (!this.formData.ingredients[i].amount.trim()) {
          this.showModalDialog('warning', '입력 오류', `재료 ${i + 1}의 양을 입력해주세요.`, '확인', '', false);
          return false;
        }
      }
      
      // 조리순서 검증
      for (let i = 0; i < this.formData.steps.length; i++) {
        if (!this.formData.steps[i].content.trim()) {
          this.showModalDialog('warning', '입력 오류', `단계 ${i + 1}의 조리과정을 입력해주세요.`, '확인', '', false);
          return false;
        }
      }
      
      return true;
    },

    cancelForm() {
      this.showModalDialog('warning', '작성 취소', '작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?', '취소', '계속 작성', true, () => {
        this.$router.push({ name: 'LectureList' });
      });
    }
  }
};
</script>

<style scoped>
.lecture-create-page {
  background: linear-gradient(135deg, #fff5f0 0%, #fafbfc 100%);
  min-height: 100vh;
  margin-top: 64px;
  padding: 20px 0;
  overflow-y: scroll;
}

.content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
  min-height: calc(100vh - 64px - 40px);
  padding-bottom: 100px;
}

.form-container {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
  padding: 50px;
  border: 1px solid rgba(255, 122, 0, 0.1);
  position: relative;
  overflow: visible;
  margin-bottom: 100px;
}

.form-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff7a00, #ff9500, #ff7a00);
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff7a00, #ff9500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 50px;
  text-align: center;
  letter-spacing: -0.5px;
}

.form-section {
  margin-bottom: 50px;
  position: relative;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 25px;
  padding: 16px 20px;
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 122, 0, 0.03) 0%, rgba(255, 149, 0, 0.03) 100%);
  border-radius: 12px;
  border-left: 4px solid #ff7a00;
  box-shadow: 0 2px 8px rgba(255, 122, 0, 0.08);
}

.section-title::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #ff7a00;
  border-radius: 50%;
  margin-right: 12px;
  opacity: 0.8;
}

.form-group {
  margin-bottom: 25px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 25px;
}

.form-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e8f0fe;
  border-radius: 12px;
  font-size: 15px;
  background: #fafbfc;
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-input:hover,
.form-select:hover,
.form-textarea:hover {
  border-color: #ff7a00;
  background: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 122, 0, 0.1);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ff7a00;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 122, 0, 0.15);
  transform: translateY(-2px);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

/* 썸네일 업로드 */
.thumbnail-upload {
  margin-top: 25px;
}

.thumbnail-area {
  width: 100%;
  height: 250px;
  border: 3px dashed #e8f0fe;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
  position: relative;
}

.thumbnail-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 122, 0, 0.05) 0%, rgba(255, 149, 0, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.thumbnail-area:hover {
  border-color: #ff7a00;
  background: linear-gradient(135deg, #fff5f0 0%, #fff9f0 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 122, 0, 0.15);
}

.thumbnail-area:hover::before {
  opacity: 1;
}

.upload-placeholder {
  text-align: center;
  color: #7f8c8d;
  z-index: 1;
  position: relative;
}

.upload-icon {
  font-size: 56px;
  margin-bottom: 15px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.thumbnail-area:hover .upload-icon {
  opacity: 1;
  transform: scale(1.1);
}

.thumbnail-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

/* 비디오 섹션 */
.video-section,
.ingredients-section,
.steps-section {
  margin-top: 25px;
}

.video-item,
.ingredient-item,
.step-item {
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 122, 0, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.video-item::before,
.ingredient-item::before,
.step-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff7a00, #ff9500);
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* 섹션 호버링 제거 - 추가 버튼 호버링은 유지 */

 .video-header,
 .ingredient-header,
 .step-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 16px;
 }

       .video-header h3,
   .ingredient-header h3,
   .step-header h3 {
     font-size: 16px;
     font-weight: 600;
     color: #2c3e50;
     margin: 0;
     letter-spacing: 0.3px;
     position: relative;
     padding-left: 12px;
   }

               .video-header h3::after,
     .ingredient-header h3::after,
     .step-header h3::after {
       content: '';
       position: absolute;
       left: 12px;
       bottom: -4px;
       width: 20px;
       height: 2px;
       background: #ff7a00;
       border-radius: 1px;
     }

   .video-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

   

  .ingredient-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: end;
  }

     .step-content {
     display: flex;
     flex-direction: column;
     gap: 16px;
   }

       

 .step-process-group {
   margin-bottom: 0;
 }

 .step-process-textarea {
   min-height: 80px;
   resize: vertical;
 }

.remove-btn {
  padding: 10px 18px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.remove-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.add-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ff7a00, #ff9500);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 122, 0, 0.3);
  letter-spacing: 0.5px;
}

.add-btn:hover {
  background: linear-gradient(135deg, #ff9500, #ff7a00);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 122, 0, 0.4);
}

/* 폼 액션 */
.form-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 50px;
  padding-top: 50px;
  border-top: 2px solid rgba(255, 122, 0, 0.1);
  position: relative;
}

.form-actions::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, #ff7a00, #ff9500);
  border-radius: 2px;
}

.submit-btn {
  padding: 18px 40px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
  letter-spacing: 0.5px;
  min-width: 160px;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

.submit-btn:disabled {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(149, 165, 166, 0.3);
}

.cancel-btn {
  padding: 18px 40px;
  background: #fff;
  color: #7f8c8d;
  border: 2px solid #bdc3c7;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 160px;
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #7f8c8d, #95a5a6);
  color: #fff;
  border-color: #7f8c8d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(127, 140, 141, 0.3);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .content {
    padding: 10px;
  }
  
  .form-container {
    padding: 30px 20px;
    border-radius: 16px;
  }
  
  .page-title {
    font-size: 28px;
    margin-bottom: 40px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  
  
  .ingredient-content {
    grid-template-columns: 1fr;
  }

  
  
  .form-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .submit-btn,
  .cancel-btn {
    min-width: auto;
    width: 100%;
  }
}
</style>
