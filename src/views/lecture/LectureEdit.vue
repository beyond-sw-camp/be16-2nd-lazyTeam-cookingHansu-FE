<template>
  <div class="lecture-edit-page">
    
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
import { lectureService } from '@/store/lecture/lectureService';

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
               duration: video.duration || 0,
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
          
          // 미리보기 URL 생성
          const videoUrl = URL.createObjectURL(file);
          this.formData.videos[index].videoUrl = videoUrl;
        }
      },
    
                   // 폼 제출
      async submitForm() {
        console.log('=== submitForm 시작 ===');
        if (this.isSubmitting) {
          console.log('이미 제출 중입니다.');
          return;
        }
        
        console.log('유효성 검사 시작');
        // 유효성 검사
        if (!this.validateForm()) {
          console.log('유효성 검사 실패');
          return;
        }
        console.log('유효성 검사 통과');
       
               this.isSubmitting = true;
        
        // FormData 생성
        const formData = new FormData();
        
        try {
         
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
          
                     // 현재 화면에 있는 강의들만 새로 생성
            const lectureVideoDto = this.formData.videos.length > 0
              ? this.formData.videos.map((video, index) => {
                  const videoInput = this.$refs[`videoInput-${index}`];
                  const hasNewVideo = videoInput && Array.isArray(videoInput) && videoInput[0] && videoInput[0].files[0];
                  const hasExistingVideo = video.videoUrl && video.videoUrl.trim();
                  const hasTitle = video.title.trim();
                  
                  // 제목이 있는 모든 비디오를 DTO에 포함 (비디오 파일은 나중에 별도로 처리)
                  if (hasTitle) {
                    return {
                      title: video.title,
                      sequence: index + 1,
                      videoUrl: hasNewVideo ? '' : (hasExistingVideo ? video.videoUrl : ''), // 새 파일이면 빈 문자열, 기존 영상이면 URL, 둘 다 없으면 빈 문자열
                      duration: video.duration || 0
                    };
                  }
                  return null;
                }).filter(item => item !== null) // null 값 제거
              : [];

                     // 필수 데이터가 있는 경우에만 Blob 생성하여 추가
           const hasValidUpdateDto = lectureUpdateDto.title && 
                                    lectureUpdateDto.description && 
                                    lectureUpdateDto.category && 
                                    lectureUpdateDto.level && 
                                    lectureUpdateDto.price > 0;
           
           if (hasValidUpdateDto) {
             formData.append('lectureUpdateDto',
               new Blob([JSON.stringify(lectureUpdateDto)], { type: 'application/json' })
             );
           }
           
           if (lectureIngredientsListDto.length > 0) {
             formData.append('lectureIngredientsListDto',
               new Blob([JSON.stringify(lectureIngredientsListDto)], { type: 'application/json' })
             );
           }
           
           if (lectureStepDto.length > 0) {
             formData.append('lectureStepDto',
               new Blob([JSON.stringify(lectureStepDto)], { type: 'application/json' })
             );
           }
           
           if (lectureVideoDto.length > 0) {
             formData.append('lectureVideoDto',
               new Blob([JSON.stringify(lectureVideoDto)], { type: 'application/json' })
             );
           }
          
          // 파일들 추가
          const thumbnailInput = this.$refs.thumbnailInput;
          if (thumbnailInput.files[0]) {
            formData.append('multipartFile', thumbnailInput.files[0], thumbnailInput.files[0].name);
          }
          
                                // 새로 업로드된 파일만 추가 (순서 보장)
            let videoFilesCount = 0;
            const newVideoIndices = []; // 새 비디오 파일의 인덱스 추적
            const newVideoFiles = []; // 새 비디오 파일들을 순서대로 저장
            
            // 먼저 새 비디오 파일들을 수집
            this.formData.videos.forEach((video, index) => {
              const videoInput = this.$refs[`videoInput-${index}`];
              const hasNewVideo = videoInput && Array.isArray(videoInput) && videoInput[0] && videoInput[0].files[0];
              const hasTitle = video.title.trim();
              
              // 새로 업로드된 파일이 있는 경우 수집
              if (hasNewVideo && hasTitle) {
                newVideoIndices.push(index); // 새 비디오의 인덱스 저장
                newVideoFiles.push({
                  file: videoInput[0].files[0],
                  index: index,
                  sequence: index + 1
                });
                videoFilesCount++;
              }
            });
            
            // 순서대로 파일을 FormData에 추가
            newVideoFiles.forEach((videoFile, fileIndex) => {
              formData.append('lectureVideoFiles', videoFile.file, videoFile.file.name);
              // 파일 순서와 인덱스 정보를 함께 전송
              formData.append(`lectureVideoFile_${fileIndex}_index`, videoFile.index.toString());
              formData.append(`lectureVideoFile_${fileIndex}_sequence`, videoFile.sequence.toString());
            });
            
                         // 새 비디오 파일의 인덱스 정보도 함께 전송
             if (newVideoIndices.length > 0) {
               formData.append('newVideoIndices', 
                 new Blob([JSON.stringify(newVideoIndices)], { type: 'application/json' })
               );
               // 파일 순서 정보도 추가
               formData.append('newVideoFileOrder', 
                 new Blob([JSON.stringify(newVideoFiles.map(vf => vf.index))], { type: 'application/json' })
               );
             }
          
          console.log('lectureVideoDto 사이즈:', lectureVideoDto.length);
          console.log('lectureVideoFiles 사이즈:', videoFilesCount);
          
          // FormData 추가 전 검증 로그
          console.log('=== FormData 추가 전 검증 ===');
          console.log('hasValidUpdateDto:', hasValidUpdateDto);
          console.log('lectureIngredientsListDto.length:', lectureIngredientsListDto.length);
          console.log('lectureStepDto.length:', lectureStepDto.length);
          console.log('lectureVideoDto.length:', lectureVideoDto.length);
                     console.log('썸네일 파일 존재:', !!thumbnailInput.files[0]);
           console.log('비디오 파일 개수:', videoFilesCount);
           console.log('새 비디오 인덱스:', newVideoIndices);
           console.log('새 비디오 파일 순서:', newVideoFiles.map(vf => ({ index: vf.index, sequence: vf.sequence, filename: vf.file.name })));
         
                     // 백엔드로 보내는 데이터 콘솔 출력
           console.log('=== 강의 수정 데이터 ===');
           console.log('lectureId:', this.lectureId);
           console.log('lectureUpdateDto:', lectureUpdateDto);
           console.log('lectureIngredientsListDto:', lectureIngredientsListDto);
           console.log('lectureStepDto:', lectureStepDto);
           console.log('lectureVideoDto:', lectureVideoDto);
           
           // 각 비디오의 상세 정보 출력
           console.log('=== 각 비디오 상세 정보 ===');
           this.formData.videos.forEach((video, index) => {
             const videoInput = this.$refs[`videoInput-${index}`];
             const hasNewVideo = videoInput && Array.isArray(videoInput) && videoInput[0] && videoInput[0].files[0];
             const hasExistingVideo = video.videoUrl && video.videoUrl.trim();
             
             console.log(`비디오 ${index + 1}:`, {
               title: video.title,
               originalVideoUrl: video.videoUrl,
               hasNewVideo: hasNewVideo,
               hasExistingVideo: hasExistingVideo,
               newVideoFile: hasNewVideo ? videoInput[0].files[0].name : null,
               finalVideoUrl: hasNewVideo ? '' : (hasExistingVideo ? video.videoUrl : '')
             });
           });
                     console.log('FormData 내용:');
           let formDataEntryCount = 0;
           for (let [key, value] of formData.entries()) {
             formDataEntryCount++;
             if (value instanceof Blob) {
               // 파일인지 JSON인지 구분
               if (key === 'lectureVideoFiles' || key === 'multipartFile') {
                 console.log(`${key}:`, `파일 (${value.size} bytes, ${value.type})`);
               } else {
                 try {
                   const text = await value.text();
                   if (text && text.trim()) {
                     const parsedData = JSON.parse(text);
                     console.log(`${key}:`, parsedData);
                     
                     // lectureVideoDto인 경우 각 비디오의 URL 상태 확인
                     if (key === 'lectureVideoDto') {
                       console.log('=== lectureVideoDto 내 각 비디오 URL 상태 ===');
                       parsedData.forEach((video, index) => {
                         console.log(`DTO 비디오 ${index + 1}:`, {
                           title: video.title,
                           videoUrl: video.videoUrl,
                           sequence: video.sequence,
                           duration: video.duration
                         });
                       });
                     }
                   } else {
                     console.log(`${key}:`, '빈 Blob');
                   }
                 } catch (parseError) {
                   console.log(`${key}:`, 'Blob (파싱 실패)');
                 }
               }
             } else {
               console.log(`${key}:`, value);
             }
           }
          console.log(`총 FormData 항목 수: ${formDataEntryCount}`);
          console.log('FormData 키 목록:');
          for (let [key] of formData.entries()) {
            console.log(`- ${key}`);
          }
          console.log('=====================');
         
         // API 호출
         console.log('lectureService.updateLecture 호출 직전');
         console.log('this.lectureId:', this.lectureId);
         console.log('FormData 키 개수:', Array.from(formData.keys()).length);
         console.log('FormData 키들:', Array.from(formData.keys()));
         console.log('lectureService:', lectureService);
         
                   const response = await lectureService.updateLecture(this.lectureId, formData);
          
          console.log('=== 강의 수정 응답 ===');
          console.log('응답 성공 여부:', response.success);
          console.log('응답 메시지:', response.message);
          console.log('응답 데이터:', response.data);
          
                     if (response.success) {
             console.log('강의 수정 성공!');
             
             // 수정된 강의 데이터를 다시 조회하여 확인
             try {
               console.log('=== 수정된 강의 데이터 재조회 ===');
               const updatedLectureResponse = await lectureService.getLectureDetail(this.lectureId);
               if (updatedLectureResponse.success) {
                 console.log('수정된 강의 데이터:', updatedLectureResponse.data);
                 console.log('수정된 비디오 목록:', updatedLectureResponse.data.lectureVideoResDtoList);
                 
                 // 새로 추가된 비디오들의 URL 상태 확인
                 const newVideos = updatedLectureResponse.data.lectureVideoResDtoList.filter((video, index) => 
                   newVideoIndices.includes(index)
                 );
                 console.log('새로 추가된 비디오들의 URL 상태:', newVideos);
               }
             } catch (error) {
               console.error('수정된 강의 데이터 조회 실패:', error);
             }
             
             this.showModalDialog('success', '수정 완료', '강의가 성공적으로 수정되었습니다!', '확인', '', false, () => {
               this.$router.push(`/lectures/${this.lectureId}`).then(() => {
                 // 라우터 이동 완료 후 스크롤
                 this.$nextTick(() => {
                   window.scrollTo(0, 0);
                 });
               });
             });
           } else {
             console.log('강의 수정 실패:', response.message);
             this.showError(response.message || '강의 수정에 실패했습니다.');
           }
             } catch (error) {
                 console.log('=== 에러 발생 시 FormData ===');
                 console.log('FormData 객체:', formData);
                 console.log('FormData entries:');
                                   for (let [key, value] of formData.entries()) {
                    if (value instanceof Blob) {
                      // 파일인지 JSON인지 구분
                      if (key === 'lectureVideoFiles' || key === 'multipartFile') {
                        console.log(`${key}:`, `파일 (${value.size} bytes, ${value.type})`);
                      } else {
                        try {
                          const text = await value.text();
                          if (text && text.trim()) {
                            console.log(`${key}:`, JSON.parse(text));
                          } else {
                            console.log(`${key}:`, '빈 Blob');
                          }
                        } catch (parseError) {
                          console.log(`${key}:`, 'Blob (파싱 실패)');
                        }
                      }
                    } else {
                      console.log(`${key}:`, value);
                    }
                  }
                 console.log('=====================');
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
       console.log('=== validateForm 시작 ===');
       console.log('formData:', this.formData);
       
       if (!this.formData.title.trim()) {
         console.log('제목 검증 실패');
         this.showError('강의 제목을 입력해주세요.');
         return false;
       }
      
             if (!this.formData.description.trim()) {
         console.log('설명 검증 실패');
         this.showError('강의 설명을 입력해주세요.');
         return false;
       }
       
       if (!this.formData.category) {
         console.log('카테고리 검증 실패');
         this.showError('카테고리를 선택해주세요.');
         return false;
       }
       
       if (!this.formData.level) {
         console.log('난이도 검증 실패');
         this.showError('난이도를 선택해주세요.');
         return false;
       }
       
       if (!this.formData.price || this.formData.price <= 0) {
         console.log('가격 검증 실패');
         this.showError('올바른 가격을 입력해주세요.');
         return false;
       }
       
       if (this.formData.ingredients.length === 0) {
         console.log('재료 검증 실패');
         this.showError('최소 하나의 재료를 추가해주세요.');
         return false;
       }
       
       if (this.formData.steps.length === 0) {
         console.log('조리과정 검증 실패');
         this.showError('최소 하나의 조리 과정을 추가해주세요.');
         return false;
       }
       
               if (this.formData.videos.length === 0) {
          console.log('비디오 검증 실패');
          this.showError('최소 하나의 강의 영상을 추가해주세요.');
          return false;
        }
        
                          // 비디오와 제목 일관성 검증
          for (let i = 0; i < this.formData.videos.length; i++) {
            const video = this.formData.videos[i];
            const videoInput = this.$refs[`videoInput-${i}`];
            // $refs가 존재하지 않거나 배열이 아닌 경우 처리
            const hasNewVideo = videoInput && Array.isArray(videoInput) && videoInput[0] && videoInput[0].files[0];
            const hasExistingVideo = video.videoUrl && video.videoUrl.trim();
            const hasVideo = hasNewVideo || hasExistingVideo; // 새 파일 또는 기존 영상 URL
            const hasTitle = video.title.trim();
            
            // 제목 길이 검증 (50자 제한)
            if (hasTitle && video.title.length > 50) {
              console.log(`비디오 ${i + 1} 제목 길이 검증 실패`);
              this.showError(`${i + 1}번째 강의의 제목은 50자 이하여야 합니다.`);
              return false;
            }
            
            // 비디오 파일이 있는데 제목이 없는 경우만 에러
            if (hasVideo && !hasTitle) {
              console.log(`비디오 ${i + 1} 제목 검증 실패`);
              this.showError(`${i + 1}번째 강의의 제목을 입력해주세요.`);
              return false;
            }
          }
       
       console.log('모든 유효성 검사 통과');
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
       console.log('showError 호출:', message);
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
