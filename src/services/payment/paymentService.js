import { apiGet } from '../../utils/api.js';

export const paymentService = {
  // 강의별 결제내역 조회
  async getPaymentHistory(lectureId) {
    try {
      console.log('API 호출 시작:', `/purchase/history/${lectureId}`);
      
      const response = await apiGet(`/purchase/history/${lectureId}`);
      
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 헤더:', response.headers);
      
      if (!response.ok) {
        console.error('HTTP 에러:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('에러 응답 내용:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API 응답 데이터:', data);
      
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
