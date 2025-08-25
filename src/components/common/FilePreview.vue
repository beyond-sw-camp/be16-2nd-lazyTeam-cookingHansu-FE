<template>
  <div class="file-preview-wrapper">
    <div class="file-preview-header">
      <div class="header-left">
        <v-icon size="18" color="primary" class="mr-2">mdi-paperclip</v-icon>
        <span class="file-count">{{ selectedFiles.length }}개 파일</span>
      </div>
      <v-btn 
        variant="text" 
        size="small" 
        color="error" 
        @click="$emit('removeAll')"
        class="clear-all-btn"
      >
        <v-icon size="16" class="mr-1">mdi-close</v-icon>
        모두 제거
      </v-btn>
    </div>
    
    <div class="file-preview-grid">
      <div 
        v-for="(fileItem, index) in selectedFiles" 
        :key="index"
        class="file-item"
        :class="{ 'image-file': isImageFile(fileItem.file) }"
      >
        <!-- 이미지 파일 -->
        <div v-if="isImageFile(fileItem.file)" class="image-container">
          <v-img 
            :src="fileItem.preview" 
            :alt="fileItem.file.name"
            width="80" 
            height="80" 
            cover 
            class="image-preview"
          />
          <div class="file-overlay">
            <v-btn 
              icon 
              size="small" 
              color="white" 
              variant="text"
              @click="$emit('remove', index)"
              class="remove-btn"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        
        <!-- 비디오 파일 -->
        <div v-else-if="isVideoFile(fileItem.file)" class="video-container">
          <div class="video-thumbnail">
            <v-icon size="32" color="white">mdi-video</v-icon>
            <div class="play-button">
              <v-icon size="20" color="white">mdi-play</v-icon>
            </div>
          </div>
          <div class="file-overlay">
            <v-btn 
              icon 
              size="small" 
              color="white" 
              variant="text"
              @click="$emit('remove', index)"
              class="remove-btn"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        
        <!-- 기타 파일 -->
        <div v-else class="document-container">
          <div class="document-icon">
            <v-icon size="28" color="primary">{{ getFileIcon(fileItem.file.type) }}</v-icon>
          </div>
          <div class="file-overlay">
            <v-btn 
              icon 
              size="small" 
              color="white" 
              variant="text"
              @click="$emit('remove', index)"
              class="remove-btn"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        
        <!-- 파일 정보 -->
        <div class="file-details">
          <div class="file-name" :title="fileItem.file.name">
            {{ truncateFileName(fileItem.file.name) }}
          </div>
          <div class="file-size">{{ formatFileSize(fileItem.file.size) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getFileTypeFromFile } from '@/utils/fileValidation';

const props = defineProps({
  selectedFiles: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['remove', 'removeAll']);

// 파일 타입 확인
const isImageFile = (file) => {
  const fileType = getFileTypeFromFile(file);
  return fileType === 'IMAGE';
};

const isVideoFile = (file) => {
  const fileType = getFileTypeFromFile(file);
  return fileType === 'VIDEO';
};

// 파일 아이콘 결정
const getFileIcon = (mimeType) => {
  if (mimeType.includes('pdf')) return 'mdi-file-pdf-box';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'mdi-file-word-box';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'mdi-file-excel-box';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'mdi-file-powerpoint-box';
  if (mimeType.includes('text')) return 'mdi-file-document';
  return 'mdi-file';
};

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// 파일명 길이 제한
const truncateFileName = (fileName) => {
  if (fileName.length <= 20) return fileName;
  return fileName.substring(0, 17) + '...';
};
</script>

<style scoped>
.file-preview-wrapper {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px;
  margin: 8px 16px 16px 16px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
}

.file-count {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.clear-all-btn {
  font-size: 12px;
  font-weight: 500;
  text-transform: none;
  padding: 4px 8px;
  min-width: auto;
  height: 28px;
}

.file-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.file-item {
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.2s ease;
  border: 1px solid #f1f3f4;
  cursor: pointer;
}

.file-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
}

.image-container,
.video-container,
.document-container {
  position: relative;
  margin-bottom: 8px;
}

.image-preview {
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.video-thumbnail {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 auto;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.document-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.file-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-item:hover .file-overlay {
  opacity: 1;
}

.remove-btn {
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(4px);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  min-width: 24px;
}

.file-details {
  text-align: center;
}

.file-name {
  font-size: 12px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 4px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 11px;
  color: #6c757d;
  font-weight: 400;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .file-preview-wrapper {
    margin: 8px 8px 16px 8px;
    padding: 12px;
  }
  
  .file-preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .file-item {
    padding: 8px;
  }
  
  .image-preview,
  .video-thumbnail,
  .document-icon {
    width: 60px;
    height: 60px;
  }
}
</style>
