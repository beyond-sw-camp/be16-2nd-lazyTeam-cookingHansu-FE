import { apiGet } from '../../utils/api.js';

export const paymentService = {
  // 강의별 결제내역 조회
  async getPaymentHistory(lectureId) {
    try {
      console.log('API 호출 시작:', `/purchase/history/${lectureId}`);
      
      const response = await apiGet(`/purchase/history/${lectureId}`);
      
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 데이터:', response.data);
      
      // axios는 자동으로 JSON 파싱을 하므로 response.data를 직접 사용
      const data = response.data;
      
      if (data.success) {
        console.log('성공적으로 데이터 반환:', data.data);
        return data.data;
      } else {
        throw new Error(data.message || '결제내역 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('결제내역 조회 오류:', error);
      throw error;
    }
  }
};
