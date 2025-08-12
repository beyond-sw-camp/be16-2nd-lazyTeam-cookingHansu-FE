import { ref } from 'vue';
import { getFileTypeFromFile, validateFile } from '../utils/fileValidation';

export function useFileUpload() {
  const selectedFiles = ref([]);
  const selectedFileNames = ref([]);
  const selectedFileTypes = ref([]);
  const fileInput = ref(null);

  const handleFileChange = (e, messageRef) => {
    const files = Array.from(e.target.files);
    
    // 텍스트가 입력되어 있으면 자동으로 텍스트 지우기
    if (messageRef.value.trim()) {
      messageRef.value = '';
    }
    
    // 최대 10개 제한 확인
    if (selectedFiles.value.length + files.length > 10) {
      alert('최대 10개까지만 선택할 수 있습니다.');
      e.target.value = '';
      return;
    }
    
    // 파일 유효성 검사
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = getFileTypeFromFile(file);
      
      // UNKNOWN 타입은 거부
      if (fileType === 'UNKNOWN') {
        alert(`파일 "${file.name}": 지원하지 않는 파일 형식입니다. 이미지는 jpg, jpeg, png, gif, webp, 비디오는 mp4, avi, mov 형식만 허용됩니다.`);
        e.target.value = '';
        return;
      }
      
      const validation = validateFile(file, fileType);
      
      if (!validation.isValid) {
        alert(`파일 "${file.name}": ${validation.error}`);
        e.target.value = '';
        return;
      }
    }
    
    files.forEach(file => {
      // 원본 파일 객체와 미리보기 URL 모두 저장
      selectedFiles.value.push({
        file: file, // 원본 파일 객체
        preview: URL.createObjectURL(file) // 미리보기용 URL
      });
      selectedFileNames.value.push(file.name);
      selectedFileTypes.value.push(file.type);
    });
    
    // input 초기화
    e.target.value = '';
  };

  const removeSelectedFile = (index) => {
    // 미리보기 URL 해제
    if (selectedFiles.value[index] && selectedFiles.value[index].preview) {
      URL.revokeObjectURL(selectedFiles.value[index].preview);
    }
    selectedFiles.value.splice(index, 1);
    selectedFileNames.value.splice(index, 1);
    selectedFileTypes.value.splice(index, 1);
  };

  const removeAllFiles = () => {
    // 모든 미리보기 URL 해제
    selectedFiles.value.forEach(item => {
      if (item && item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    selectedFiles.value = [];
    selectedFileNames.value = [];
    selectedFileTypes.value = [];
  };

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const onTextInput = (messageRef) => {
    // 텍스트가 입력되면 파일들 모두 제거
    if (messageRef.value.trim() && selectedFiles.value.length > 0) {
      removeAllFiles();
    }
  };

  return {
    selectedFiles,
    selectedFileNames,
    selectedFileTypes,
    fileInput,
    handleFileChange,
    removeSelectedFile,
    removeAllFiles,
    triggerFileInput,
    onTextInput
  };
}; 