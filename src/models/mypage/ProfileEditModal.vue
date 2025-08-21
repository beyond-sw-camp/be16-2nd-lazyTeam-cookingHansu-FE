<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>프로필 수정</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <!-- 프로필 이미지 업로드 -->
        <div class="profile-image-section">
          <div class="profile-image-container">
            <img 
              v-if="profileImagePreview" 
              :src="profileImagePreview" 
              alt="프로필 이미지 미리보기" 
              class="profile-image-preview"
            />
            <div v-else-if="userData.profileImageUrl" class="profile-image-preview">
              <img :src="userData.profileImageUrl" alt="현재 프로필 이미지" />
            </div>
            <div v-else class="profile-image-placeholder">
              <v-icon size="48" color="#ccc">mdi-account</v-icon>
            </div>
            <div class="image-upload-overlay" @click="triggerFileInput">
              <v-icon size="24" color="white">mdi-camera</v-icon>
            </div>
          </div>
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            @change="handleImageUpload" 
            style="display: none"
          />
          <p class="image-hint">클릭하여 프로필 이미지 변경</p>
          <p class="image-requirements">JPG, PNG, GIF (최대 5MB)</p>
        </div>

        <div class="form-group">
          <label for="nickname">닉네임</label>
          <input 
            id="nickname"
            v-model="formData.nickname" 
            type="text" 
            placeholder="닉네임을 입력하세요"
            maxlength="20"
          />
        </div>

        <div class="form-group">
          <label for="email">이메일</label>
          <input 
            id="email"
            v-model="formData.email" 
            type="email" 
            placeholder="이메일을 입력하세요"
            disabled
          />
          <small class="disabled-hint">이메일은 변경할 수 없습니다</small>
        </div>

        <div class="form-group">
          <label for="info">자기소개</label>
          <textarea 
            id="info"
            v-model="formData.info" 
            placeholder="자기소개를 입력하세요 (선택사항)"
            rows="3"
            maxlength="200"
          ></textarea>
          <small class="char-count">{{ formData.info.length }}/200</small>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="cancel-btn" @click="closeModal">취소</button>
        <button type="button" class="save-btn" @click="saveProfile" :disabled="loading">
          {{ loading ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileEditModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    userData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'update'],
  data() {
    return {
      loading: false,
      profileImagePreview: null,
      selectedFile: null,
      formData: {
        nickname: '',
        email: '',
        info: ''
      }
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeForm();
      }
    },
    userData: {
      handler(newVal) {
        if (newVal && this.visible) {
          this.initializeForm();
        }
      },
      deep: true
    }
  },
  methods: {
    initializeForm() {
      this.formData = {
        nickname: this.userData.nickname || '',
        email: this.userData.email || '',
        info: this.userData.info || ''
      };
      this.profileImagePreview = null;
      this.selectedFile = null;
    },
    
    closeModal() {
      this.$emit('close');
    },
    
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // 파일 크기 검증
        if (file.size > 5 * 1024 * 1024) {
          this.$emit('showMessage', {
            type: 'error',
            title: '파일 크기 초과',
            message: '프로필 이미지는 5MB 이하여야 합니다.'
          });
          return;
        }
        
        // 파일 타입 검증
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          this.$emit('showMessage', {
            type: 'error',
            title: '지원하지 않는 파일 형식',
            message: 'JPG, PNG, GIF 파일만 업로드 가능합니다.'
          });
          return;
        }
        
        this.selectedFile = file;
        
        // 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
          this.profileImagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    
    async saveProfile() {
      if (!this.formData.nickname.trim()) {
        this.$emit('showMessage', {
          type: 'error',
          title: '입력 오류',
          message: '닉네임을 입력해주세요.'
        });
        return;
      }
      
      this.loading = true;
      
      try {
        // 이미지 업로드 처리
        let imageUrl = this.userData.profileImageUrl;
        if (this.selectedFile) {
          // S3 업로드 API 호출
          const formData = new FormData();
          formData.append('image', this.selectedFile);
          
          const uploadResponse = await fetch('http://localhost:8080/api/my/profile/image', {
            method: 'POST',
            body: formData
          });
          
          if (!uploadResponse.ok) {
            throw new Error('이미지 업로드 실패');
          }
          
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.data;
        }
        
        // 프로필 업데이트 API 호출
        const updateResponse = await fetch('http://localhost:8080/api/my/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nickname: this.formData.nickname,
            info: this.formData.info,
            profileImageUrl: imageUrl
          })
        });
        
        if (!updateResponse.ok) {
          throw new Error('프로필 업데이트 실패');
        }
        
        const updateResult = await updateResponse.json();
        
        this.$emit('update', updateResult.data);
        this.$emit('showMessage', {
          type: 'success',
          title: '성공',
          message: '프로필이 성공적으로 수정되었습니다.'
        });
        this.closeModal();
      } catch (error) {
        console.error('프로필 수정 오류:', error);
        this.$emit('showMessage', {
          type: 'error',
          title: '오류',
          message: '프로필 수정 중 오류가 발생했습니다.'
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 24px;
}

/* 프로필 이미지 업로드 */
.profile-image-section {
  text-align: center;
  margin-bottom: 32px;
}

.profile-image-container {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.profile-image-preview,
.profile-image-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ff7a00;
  overflow: hidden;
}

.profile-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-image-placeholder {
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: #ff7a00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.image-upload-overlay:hover {
  background: #e66a00;
  transform: scale(1.1);
}

.image-hint {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #666;
}

.image-requirements {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff7a00;
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.disabled-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.char-count {
  display: block;
  text-align: right;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.save-btn {
  background: #ff7a00;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #e66a00;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 20px;
    max-height: calc(100vh - 40px);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
}
</style>
