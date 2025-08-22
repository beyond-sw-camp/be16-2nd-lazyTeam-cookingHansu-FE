<template>
  <div class="file-upload-wrapper">
    <label v-if="label" class="form-label">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>
    <div class="file-upload">
      <input
        type="file"
        :accept="accept"
        @change="handleFileChange"
        :id="inputId"
        style="display: none"
        :required="required"
      />
      <label :for="inputId" class="file-label">
        <span v-if="fileName">{{ fileName }}</span>
        <span v-else class="file-placeholder">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            style="vertical-align: middle; margin-right: 6px"
          >
            <path
              d="M10 3v10m0 0l-3-3m3 3l3-3"
              stroke="#bdbdbd"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
            />
          </svg>
          {{ placeholder }}
        </span>
      </label>
    </div>
    <div v-if="errorMessage && hasError" class="input-error">
      <span class="error-icon">&#10006;</span> {{ errorMessage }}
    </div>
    <!-- 파일 정보 표시 -->
    <div v-if="fileInfo" class="file-info">
      <small class="text-caption text-medium-emphasis">
        파일 크기: {{ formatFileSize(fileInfo.size) }} | 
        형식: {{ fileInfo.type || '알 수 없음' }}
      </small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: File,
    default: null,
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "파일을 선택하세요",
  },
  accept: {
    type: String,
    default: "image/*,.pdf",
  },
  required: {
    type: Boolean,
    default: false,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const inputId = computed(
  () => `file-upload-${Math.random().toString(36).substr(2, 9)}`
);

const fileName = computed(() => {
  return props.modelValue ? props.modelValue.name : "";
});

const fileInfo = computed(() => {
  return props.modelValue;
});

function handleFileChange(event) {
  const file = event.target.files[0];
  
  if (file) {
    // 파일 유효성 검증
    if (!validateFile(file)) {
      // 파일 선택을 초기화
      event.target.value = '';
      emit("update:modelValue", null);
      return;
    }
    
    console.log('파일 선택됨:', file.name, file.size, file.type);
    emit("update:modelValue", file);
  } else {
    emit("update:modelValue", null);
  }
}

function validateFile(file) {
  // 파일 크기 검증 (100MB 제한)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    alert("파일 크기는 100MB를 초과할 수 없습니다.");
    return false;
  }
  
  // 파일 형식 검증
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/webp', 'application/pdf'
  ];
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|webp|pdf)$/i)) {
    alert("지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp, pdf만 허용)");
    return false;
  }
  
  return true;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 파일 변경 감지
watch(() => props.modelValue, (newFile) => {
  if (newFile && !(newFile instanceof File)) {
    console.warn('FileUpload: modelValue는 File 객체여야 합니다.');
  }
});
</script>

<style scoped>
.file-upload-wrapper {
  width: 100%;
  margin-bottom: 4px;
}

.form-label {
  font-size: 1.05rem;
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: 2px;
  display: block;
}

.required {
  color: #ff884d;
  font-size: 1.1em;
  margin-left: 2px;
}

.file-upload {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.file-label {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 52px;
  border-radius: 8px;
  background: #f3f3f3;
  border: 1.5px solid #e9ecef;
  cursor: pointer;
  padding: 0 14px;
  font-size: 1.08rem;
  color: #bdbdbd;
  transition: border 0.18s;
}

.file-label:hover {
  border: 1.5px solid var(--color-primary);
}

.file-placeholder {
  color: #bdbdbd;
  display: flex;
  align-items: center;
  font-size: 1.05rem;
}

.input-error {
  color: #e53935;
  font-size: 0.97rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 2px;
}

.error-icon {
  font-size: 1.1em;
  margin-right: 2px;
}

.file-info {
  margin-top: 4px;
  margin-left: 2px;
  color: #666;
}
</style>
