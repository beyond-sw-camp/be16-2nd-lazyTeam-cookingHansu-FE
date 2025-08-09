/**
 * 파일 타입 검증
 * @param {File} file - 검증할 파일
 * @param {string} fileType - 파일 타입 ('IMAGE' 또는 'VIDEO')
 * @returns {boolean} - 유효한 파일인지 여부
 */
export function validateFileType(file, fileType) {
  if (!file || !file.name) {
    return false;
  }

  const fileName = file.name;
  const extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

  switch (fileType) {
    case 'IMAGE':
      return extension.match(/^(jpg|jpeg|png|gif|webp)$/);
    case 'VIDEO':
      return extension.match(/^(mp4|avi|mov)$/);
    default:
      return false;
  }
}

/**
 * 파일 크기 검증 (10MB 제한)
 * @param {File} file - 검증할 파일
 * @returns {boolean} - 유효한 크기인지 여부
 */
export function validateFileSize(file) {
  const maxSize = 100 * 1024 * 1024; // 100MB
  return file.size <= maxSize;
}

/**
 * 파일 유효성 검사 (타입 + 크기)
 * @param {File} file - 검증할 파일
 * @param {string} fileType - 파일 타입
 * @returns {object} - 검증 결과 {isValid: boolean, error: string}
 */
export function validateFile(file, fileType) {
  if (!file) {
    return { isValid: false, error: '파일이 선택되지 않았습니다.' };
  }

  if (!validateFileSize(file)) {
    return { isValid: false, error: '파일 크기는 100MB 이하여야 합니다.' };
  }

  if (!validateFileType(file, fileType)) {
    const allowedTypes = fileType === 'IMAGE' 
      ? 'jpg, jpeg, png, gif, webp' 
      : 'mp4, avi, mov';
    return { 
      isValid: false, 
      error: `${fileType === 'IMAGE' ? '이미지' : '비디오'} 파일은 ${allowedTypes} 형식만 허용됩니다.` 
    };
  }

  return { isValid: true, error: null };
}




/**
 * 파일로부터 파일 타입 추정
 * @param {File} file - 파일
 * @returns {string} - 파일 타입 ('IMAGE' 또는 'VIDEO')
 */
function getFileTypeFromFile(file) {
  const fileName = file.name;
  const extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const videoExtensions = ['mp4', 'avi', 'mov'];
  
  if (imageExtensions.includes(extension)) {
    return 'IMAGE';
  } else if (videoExtensions.includes(extension)) {
    return 'VIDEO';
  } else {
    return 'UNKNOWN';
  }
} 