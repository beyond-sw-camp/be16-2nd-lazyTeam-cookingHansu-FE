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
 * 메시지와 파일 전송 유효성 검사
 * @param {string} message - 메시지 내용
 * @param {Array} files - 파일 배열
 * @returns {object} - 검증 결과 {isValid: boolean, error: string}
 */
export function validateMessageAndFiles(message, files) {
  const hasMessage = message && message.trim().length > 0;
  const hasFiles = files && files.length > 0;

  // 둘 다 없는 경우
  if (!hasMessage && !hasFiles) {
    return { isValid: false, error: '메시지 또는 파일 중 하나는 반드시 있어야 합니다.' };
  }

  // 둘 다 있는 경우 (허용하지 않음)
  if (hasMessage && hasFiles) {
    return { isValid: false, error: '메시지와 파일을 동시에 전송할 수 없습니다. 메시지 또는 파일 중 하나만 전송해주세요.' };
  }

  // 메시지만 있는 경우
  if (hasMessage && !hasFiles) {
    if (message.trim().length === 0) {
      return { isValid: false, error: '메시지 내용은 비어있을 수 없습니다.' };
    }
  }

  // 파일만 있는 경우
  if (!hasMessage && hasFiles) {
    if (files.length === 0) {
      return { isValid: false, error: '파일은 최소 1개 이상 있어야 합니다.' };
    }

    // 각 파일 검증
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = getFileTypeFromFile(file);
      
      // UNKNOWN 타입은 거부
      if (fileType === 'UNKNOWN') {
        return { isValid: false, error: `파일 ${i + 1}: 지원하지 않는 파일 형식입니다. 이미지는 jpg, jpeg, png, gif, webp, 비디오는 mp4, avi, mov 형식만 허용됩니다.` };
      }
      
      const validation = validateFile(file, fileType);
      
      if (!validation.isValid) {
        return { isValid: false, error: `파일 ${i + 1}: ${validation.error}` };
      }
    }
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