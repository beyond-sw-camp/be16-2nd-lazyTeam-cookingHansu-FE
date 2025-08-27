// 신고 유형
export const REPORT_TYPES = {
  RECIPE: 'RECIPE', // 레시피 공유 게시글
  USER: 'USER', // 사용자
  COMMENT: 'COMMENT' // 댓글
};

// 신고 사유 유형
export const REPORT_REASON_TYPES = {
  SPAM_OR_ADS: 'SPAM_OR_ADS', // 스팸 또는 광고
  INCORRECT_CONTENTS: 'INCORRECT_CONTENTS', // 부적절한 콘텐츠
  BOTHER_OR_SPIT: 'BOTHER_OR_SPIT', // 괴롭힘 또는 욕설
  FRAUD_INFORMATION: 'FRAUD_INFORMATION', // 가짜 정보 또는 사기
  AUTHORIZATION: 'AUTHORIZATION', // 저작권 침해
  ETC: 'ETC' // 기타
};

// 신고 사유 라벨
export const REPORT_REASON_LABELS = {
  [REPORT_REASON_TYPES.SPAM_OR_ADS]: '스팸 또는 광고',
  [REPORT_REASON_TYPES.INCORRECT_CONTENTS]: '부적절한 콘텐츠',
  [REPORT_REASON_TYPES.BOTHER_OR_SPIT]: '괴롭힘 또는 욕설',
  [REPORT_REASON_TYPES.FRAUD_INFORMATION]: '가짜 정보 또는 사기',
  [REPORT_REASON_TYPES.AUTHORIZATION]: '저작권 침해',
  [REPORT_REASON_TYPES.ETC]: '기타'
};

// 신고 유형 라벨
export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.RECIPE]: '게시글 신고',
  [REPORT_TYPES.USER]: '사용자 신고',
  [REPORT_TYPES.COMMENT]: '댓글 신고'
};
