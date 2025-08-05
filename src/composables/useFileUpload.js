import { ref } from 'vue';

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
    
    files.forEach(file => {
      selectedFiles.value.push(URL.createObjectURL(file));
      selectedFileNames.value.push(file.name);
      selectedFileTypes.value.push(file.type);
    });
    
    // input 초기화
    e.target.value = '';
  };

  const removeSelectedFile = (index) => {
    selectedFiles.value.splice(index, 1);
    selectedFileNames.value.splice(index, 1);
    selectedFileTypes.value.splice(index, 1);
  };

  const removeAllFiles = () => {
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
} 