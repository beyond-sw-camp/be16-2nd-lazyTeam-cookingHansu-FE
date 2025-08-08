/**
 * ISO 문자열을 상대적 시간으로 변환하는 함수
 * @param {string} isoString - ISO 형식의 시간 문자열
 * @returns {string} - 포맷된 시간 문자열
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  
  // 항상 시간만 표시
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const isPM = hours >= 12;
  const hour12 = hours % 12 || 12;
  return `${isPM ? '오후' : '오전'} ${hour12}:${minutes}`;
}

/**
 * 채팅용 상대적 시간 표시 함수
 * @param {string} isoString - ISO 형식의 시간 문자열
 * @returns {string} - 채팅용 상대적 시간 문자열
 */
export function formatChatTime(isoString) {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return '방금';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    // 7일 이상이면 날짜 표시
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }
}

/**
 * 공지사항용 날짜시간 포맷팅 함수
 * @param {string} isoString - ISO 형식의 시간 문자열
 * @returns {string} - 포맷된 날짜시간 문자열
 */
export function formatDateTime(isoString) {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 날짜만 포맷팅하는 함수
 * @param {string} isoString - ISO 형식의 시간 문자열
 * @returns {string} - 포맷된 날짜 문자열
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
} 