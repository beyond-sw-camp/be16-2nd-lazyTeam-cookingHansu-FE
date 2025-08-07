<template>
  <div class="notice-create-container">
    <div class="notice-create-header">
      <div class="back-button">
        <v-btn
          icon
          variant="text"
          @click="goBack"
          prepend-icon="mdi-arrow-left"
        >
          뒤로가기
        </v-btn>
      </div>
      <h1 class="notice-create-title">공지사항 작성</h1>
    </div>

    <div class="notice-create-content">
      <v-form ref="form" v-model="valid" @submit.prevent="submitNotice">
        <div class="form-section">
          <v-text-field
            v-model="noticeData.title"
            label="제목"
            placeholder="공지사항 제목을 입력하세요"
            :rules="titleRules"
            required
            variant="outlined"
            class="form-field"
          ></v-text-field>

          <v-textarea
            v-model="noticeData.content"
            label="내용"
            placeholder="공지사항 내용을 입력하세요"
            :rules="contentRules"
            required
            variant="outlined"
            rows="10"
            auto-grow
            class="form-field"
          ></v-textarea>

          <div class="image-upload-section">
            <div class="file-input-container">
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-camera"
                @click="triggerFileInput"
                class="file-select-btn"
              >
                이미지 첨부 (선택사항)
              </v-btn>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="d-none"
                @change="handleFileChange"
              />
            </div>

            <!-- 선택된 파일 표시 -->
            <div v-if="selectedFile" class="selected-file">
              <v-chip
                size="small"
                label
                class="me-2"
                closable
                @click:close="removeFile"
              >
                {{ selectedFile.name }}
              </v-chip>
            </div>

            <!-- 이미지 미리보기 -->
            <div v-if="imagePreview" class="image-preview">
              <img
                :src="imagePreview"
                alt="이미지 미리보기"
                class="preview-image"
              />
              <v-btn
                icon
                size="small"
                color="error"
                class="remove-image-btn"
                @click="removeFile"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <v-btn
            color="grey"
            variant="outlined"
            @click="goBack"
            class="action-btn"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            type="submit"
            :loading="submitting"
            :disabled="!valid"
            class="action-btn"
          >
            공지사항 등록
          </v-btn>
        </div>
      </v-form>
    </div>

    <!-- 성공 스낵바 -->
    <v-snackbar
      v-model="successSnackbar"
      color="success"
      timeout="3000"
    >
      공지사항이 성공적으로 등록되었습니다.
    </v-snackbar>

    <!-- 에러 스낵바 -->
    <v-snackbar
      v-model="errorSnackbar"
      color="error"
      timeout="5000"
    >
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNoticeStore } from '../../store/notice/notice';
import { validateFile } from '../../utils/fileValidation';

const router = useRouter();
const noticeStore = useNoticeStore();

// 폼 관련
const form = ref(null);
const valid = ref(false);
const submitting = ref(false);

// 공지사항 데이터
const noticeData = reactive({
  title: '',
  content: '',
  noticeImage: null,
});

// 이미지 미리보기
const imagePreview = ref(null);

// 스낵바 상태
const successSnackbar = ref(false);
const errorSnackbar = ref(false);
const errorMessage = ref('');

// 유효성 검사 규칙
const titleRules = [
  v => !!v || '제목은 필수입니다.',
  v => v.length <= 100 || '제목은 100자 이하여야 합니다.',
];

const contentRules = [
  v => !!v || '내용은 필수입니다.',
  v => v.length <= 2000 || '내용은 2000자 이하여야 합니다.',
];

const imageRules = [
  v => {
    if (!v) return true;
    const validation = validateFile(v, 'IMAGE');
    return validation.isValid || validation.error;
  },
];

// 관리자 권한 확인 (테스팅용)
const isAdmin = computed(() => {
  // 테스팅을 위해 관리자로 설정
  localStorage.setItem('userRole', 'ADMIN');
  return true;
});

// 뒤로가기
const goBack = () => {
  router.push('/notice');
};

// 파일 입력 트리거
const fileInput = ref(null);
const selectedFile = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // 파일 검증
    const validation = validateFile(file, 'IMAGE');
    if (!validation.isValid) {
      errorMessage.value = validation.error;
      errorSnackbar.value = true;
      // 파일 입력 초기화
      selectedFile.value = null;
      imagePreview.value = null;
      return;
    }

    // 파일 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.onerror = () => {
      errorMessage.value = '이미지 파일을 읽을 수 없습니다.';
      errorSnackbar.value = true;
      selectedFile.value = null;
      imagePreview.value = null;
    };
    reader.readAsDataURL(file);
    selectedFile.value = file;
  } else {
    imagePreview.value = null;
    selectedFile.value = null;
  }
};

const removeFile = () => {
  selectedFile.value = null;
  imagePreview.value = null;
};

// 공지사항 제출
const submitNotice = async () => {
  if (!form.value.validate()) {
    return;
  }

  if (!isAdmin.value) {
    errorMessage.value = '관리자만 공지사항을 작성할 수 있습니다.';
    errorSnackbar.value = true;
    return;
  }

  // 선택된 파일을 noticeData에 할당
  if (selectedFile.value) {
    noticeData.noticeImage = selectedFile.value;
  }

  try {
    submitting.value = true;
    await noticeStore.createNotice(noticeData);
    
    // 성공 후 바로 목록 페이지로 이동
    router.push('/notice');
  } catch (error) {
    errorMessage.value = error.message || '공지사항 등록에 실패했습니다.';
    errorSnackbar.value = true;
  } finally {
    submitting.value = false;
  }
};

// 컴포넌트 마운트 시 관리자 권한 확인
onMounted(() => {
  if (!isAdmin.value) {
    errorMessage.value = '관리자만 접근할 수 있는 페이지입니다.';
    errorSnackbar.value = true;
    setTimeout(() => {
      router.push('/notice');
    }, 2000);
  }
});
</script>

<style scoped>
.notice-create-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  margin-top: 60px;
  min-height: calc(100vh - 60px);

}

.notice-create-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  position: relative;
}

.back-button {
  position: absolute;
  left: 25px;
  display: flex;
  align-items: center;
}

.back-button {
  display: flex;
  align-items: center;
}

.notice-create-title {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, #FF8E53 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.notice-create-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  padding: 25px;
  backdrop-filter: blur(10px);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  margin-bottom: 20px;
}

.image-upload-section {
  position: relative;
}

.file-input-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.file-select-btn {
  min-width: 200px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

.selected-file {
  margin-top: 10px;
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-top: 10px;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: white;
  border: 1px solid #ddd;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 25px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  min-width: 140px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .notice-create-container {
    padding: 15px;
  }

  .notice-create-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .notice-create-title {
    font-size: 1.5rem;
  }

  .notice-create-content {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
