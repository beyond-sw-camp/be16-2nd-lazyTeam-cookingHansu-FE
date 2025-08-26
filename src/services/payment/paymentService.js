import { apiGet } from '../../utils/api.js';

export const paymentService = {
  // 강의별 결제내역 조회
  async getPaymentHistory(lectureId) {
    try {
      console.log('API 호출 시작:', `/api/purchase/history/${lectureId}`);
      
      // 임시로 더미 데이터 반환 (API 오류 해결 전까지)
      console.log('더미 데이터 반환 (API 오류 해결 전까지)');
      return {
        id: lectureId,
        title: "강아지 사료만들기",
        price: 21000,
        thumbUrl: "https://minhyeong-board-bucket.s3.ap-northeast-2.amazonaws.com/lecture-f0fa993a-5e49-4a32-a9d1-7e3a201c2625-thumbnail.webp20250826_115543_afd6d688.jpg",
        createdAt: "2025-08-26T16:09:16.828145",
        orderId: "d6adcaf9-ceaf-4f80-9b5d-bbd3f1ae8cbe",
        payMethod: "EASY_PAY",
        buyerName: "조민형",
        buyerEmail: "jumbo0303@naver.com"
      };
      
      // 실제 API 호출 (주석 처리)
      /*
      const response = await apiGet(`/api/purchase/history/${lectureId}`);
      const data = await response.json();
      
      console.log('API 응답:', data);
      
      if (data.success) {
        console.log('성공적으로 데이터 반환:', data.data);
        return data.data;
      } else {
        throw new Error(data.message || '결제내역 조회에 실패했습니다.');
      }
      */
    } catch (error) {
      console.error('결제내역 조회 오류:', error);
      throw error;
    }
  }
};
