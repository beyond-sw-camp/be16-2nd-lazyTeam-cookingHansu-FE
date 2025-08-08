<template>
  <v-container>
    <!-- 제목 -->
    <h2 class="text-h5 font-weight-bold mb-1">공지사항 관리</h2>
    <p class="mb-6">공지사항을 작성하고 관리하세요</p>

    <!-- 작성하기 버튼 -->
    <v-row justify="end mr-0" class="mb-4">
      <v-btn color="orange" @click="openForm">+ 새 공지사항 작성</v-btn>
    </v-row>

    <!-- 공지사항 작성/수정 폼 -->
    <v-card
      v-if="formVisible"
      class="pa-4 mb-6"
      :border="isEdit ? 'orange' : 'grey'"
    >
      <h3
        class="text-subtitle-1 font-weight-bold mb-4"
        :style="{ color: isEdit ? '#fa541c' : 'inherit' }"
      >
        {{ isEdit ? "공지사항 수정" : "공지사항 작성" }}
      </h3>

      <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
        <v-text-field
          v-model="formData.title"
          label="제목"
          placeholder="공지사항 제목을 입력하세요"
          density="comfortable"
          :rules="titleRules"
          required
        />

        <v-textarea
          v-model="formData.content"
          label="내용"
          rows="5"
          auto-grow
          placeholder="공지사항 내용을 입력해주세요"
          :rules="contentRules"
          required
        />

        <!-- 이미지 업로드 -->
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

          <!-- 기존 이미지 -->
          <div v-if="isEdit && editingNotice && editingNotice.imageUrl" class="existing-image">
            <p class="existing-image-label">현재 이미지:</p>
            <img
              :src="editingNotice.imageUrl"
              alt="현재 이미지"
              class="existing-image-content"
            />
          </div>

          <!-- 이미지 미리보기 -->
          <div v-if="imagePreview" class="image-preview">
            <p class="preview-label">이미지 변경하기:</p>
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

        <v-row class="justify-end mt-4">
          <v-col cols="auto">
            <v-btn 
              color="primary" 
              type="submit"
              :loading="submitting"
              :disabled="!valid"
            >
              {{ isEdit ? "수정하기" : "작성하기" }}
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn text @click="cancelForm">취소</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>

    <!-- 로딩 상태 -->
    <div v-if="noticeStore.isLoading" class="text-center pa-8">
      <v-progress-circular indeterminate color="orange"></v-progress-circular>
      <p class="mt-4">공지사항을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="noticeStore.getError" class="text-center pa-8">
      <ErrorAlert
        title="연결 오류"
        :message="noticeStore.getError"
        @close="noticeStore.clearError"
      />
    </div>

    <!-- 공지사항 목록 -->
    <template v-else-if="noticeStore.hasNotices">
      <v-card>
        <v-table>
          <thead>
            <tr>
              <th>제목</th>
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in noticeStore.getNotices" :key="notice.id">
              <td>{{ notice.title }}</td>
              <td>{{ formatDate(notice.createdAt) }}</td>
              <td>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click.stop="editNotice(notice)"
                  color="orange"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="plain"
                  density="compact"
                  class="pa-0 ma-0"
                  @click="confirmDelete(notice)"
                >
                  <v-icon color="red">mdi-delete-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <!-- 페이지네이션 -->
      <Pagination
        :current-page="currentPage"
        :total-pages="noticeStore.getPaginationInfo.totalPages"
        @page-change="handlePageChange"
      />
    </template>

    <!-- 공지사항이 없을 경우 -->
    <template v-else>
      <v-row justify="center" class="mt-10 mb-10">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="grey lighten-2">mdi-bell-outline</v-icon>
          <h3 class="mt-4">공지사항이 없습니다</h3>
          <p class="mt-2">새로운 공지사항을 작성해보세요!</p>
        </v-col>
      </v-row>
    </template>

    <!-- 성공 스낵바 -->
    <v-snackbar
      v-model="successSnackbar"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
    </v-snackbar>

    <!-- 에러 스낵바 -->
    <v-snackbar
      v-model="errorSnackbar"
      color="error"
      timeout="5000"
    >
      {{ errorMessage }}
    </v-snackbar>

    <!-- 공용 삭제 확인 모달 -->
    <DeleteConfirmModal
      v-model="deleteDialog"
      title="공지사항을 삭제하시겠습니까?"
      message="삭제된 공지사항은 복구할 수 없습니다."
      :item-info="deleteItemInfo"
      :loading="deleting"
      @confirm="deleteNotice"
      @cancel="cancelDelete"
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useNoticeStore } from '../../store/notice/notice';
import { validateFile } from '../../utils/fileValidation';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal.vue';
import Pagination from '../../components/common/Pagination.vue';
import ErrorAlert from '../../components/common/ErrorAlert.vue';

const noticeStore = useNoticeStore();

// 폼 관련
const form = ref(null);
const valid = ref(false);
const submitting = ref(false);
const formVisible = ref(false);
const isEdit = ref(false);
const editingNotice = ref(null);

// 파일 관련
const fileInput = ref(null);
const selectedFile = ref(null);
const imagePreview = ref(null);

// 스낵바 상태
const successSnackbar = ref(false);
const errorSnackbar = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// 페이지네이션
const currentPage = ref(1);

// 폼 데이터
const formData = reactive({
  title: '',
  content: '',
  noticeImage: null,
});

// 유효성 검사 규칙
const titleRules = [
  v => !!v || '제목은 필수입니다.',
  v => v.length <= 100 || '제목은 100자 이하여야 합니다.',
];

const contentRules = [
  v => !!v || '내용은 필수입니다.',
  v => v.length <= 2000 || '내용은 2000자 이하여야 합니다.',
];

// 폼 열기
const openForm = () => {
  formVisible.value = true;
  isEdit.value = false;
  editingNotice.value = null;
  resetForm();
};

// 폼 취소
const cancelForm = () => {
  formVisible.value = false;
  isEdit.value = false;
  editingNotice.value = null;
  resetForm();
};

// 폼 초기화
const resetForm = () => {
  formData.title = '';
  formData.content = '';
  formData.noticeImage = null;
  selectedFile.value = null;
  imagePreview.value = null;
  valid.value = false;
};

// 파일 입력 트리거
const triggerFileInput = () => {
  fileInput.value.click();
};

// 파일 변경 핸들러
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    console.log('파일 정보:', {
      name: file.name,
      size: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2),
      type: file.type
    });
    
    // 파일 검증
    const validation = validateFile(file, 'IMAGE');
    console.log('파일 검증 결과:', validation);
    
    if (!validation.isValid) {
      errorMessage.value = validation.error;
      errorSnackbar.value = true;
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

// 파일 제거
const removeFile = () => {
  selectedFile.value = null;
  imagePreview.value = null;
};

// 공지사항 수정
const editNotice = async (notice) => {
  // 먼저 폼을 열고 기본 데이터 설정
  editingNotice.value = notice;
  formData.title = notice.title;
  formData.content = notice.content;
  formData.noticeImage = null;
  selectedFile.value = null;
  imagePreview.value = null;
  
  isEdit.value = true;
  formVisible.value = true;
  
  // 백그라운드에서 상세 정보 로드
  try {
    await noticeStore.fetchNoticeDetail(notice.id);
    const currentNotice = noticeStore.getCurrentNotice;
    
    if (currentNotice) {
      // 상세 정보로 업데이트
      formData.title = currentNotice.title;
      formData.content = currentNotice.content;
      
      // 기존 이미지가 있으면 미리보기에 표시
      if (currentNotice.imageUrl) {
        imagePreview.value = currentNotice.imageUrl;
      }
    }
  } catch (error) {
    console.error('상세 정보 로드 실패:', error);
    // 에러가 발생해도 기본 데이터는 유지
  }
};

// 삭제 확인
const confirmDelete = (notice) => {
  noticeToDelete.value = notice;
  deleteDialog.value = true;
};

// 삭제 취소
const cancelDelete = () => {
  deleteDialog.value = false;
  noticeToDelete.value = null;
};

// 공지사항 삭제
const deleteNotice = async () => {
  if (!noticeToDelete.value) return;

  try {
    deleting.value = true;
    await noticeStore.deleteNotice(noticeToDelete.value.id);
    deleteDialog.value = false;
    noticeToDelete.value = null;
    successMessage.value = '공지사항이 삭제되었습니다.';
    successSnackbar.value = true;
  } catch (error) {
    errorMessage.value = error.message || '공지사항 삭제에 실패했습니다.';
    errorSnackbar.value = true;
  } finally {
    deleting.value = false;
  }
};

// 폼 제출
const submitForm = async () => {
  if (!form.value.validate()) {
    return;
  }

  // 선택된 파일을 formData에 할당
  if (selectedFile.value) {
    formData.noticeImage = selectedFile.value;
  }

  try {
    submitting.value = true;
    
    if (isEdit.value && editingNotice.value) {
      await noticeStore.updateNotice(editingNotice.value.id, formData);
      successMessage.value = '공지사항이 수정되었습니다.';
    } else {
      await noticeStore.createNotice(formData);
      successMessage.value = '공지사항이 작성되었습니다.';
    }
    
    successSnackbar.value = true;
    cancelForm();
  } catch (error) {
    errorMessage.value = error.message || '공지사항 저장에 실패했습니다.';
    errorSnackbar.value = true;
  } finally {
    submitting.value = false;
  }
};

// 페이지 변경
const handlePageChange = (page) => {
  currentPage.value = page;
  noticeStore.fetchNotices(page - 1, noticeStore.getPaginationInfo.pageSize);
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 컴포넌트 마운트 시 공지사항 목록 로드
onMounted(async () => {
  await noticeStore.fetchNotices(0, 10);
});

// 삭제 관련
const deleteDialog = ref(false);
const deleting = ref(false);
const noticeToDelete = ref(null);

// 삭제할 항목 정보 (공용 모달용)
const deleteItemInfo = computed(() => {
  if (!noticeToDelete.value) return null;
  return {
    title: noticeToDelete.value.title
  };
});


</script>

<style scoped>
th,
td {
  padding: 14px;
  text-align: left;
}

.image-upload-section {
  position: relative;
  margin-top: 20px;
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

.existing-image {
  margin-top: 10px;
  margin-bottom: 15px;
}

.existing-image-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.existing-image-content {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview {
  position: relative;
  display: block;
  margin-top: 15px;
}

.preview-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
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



</style>
