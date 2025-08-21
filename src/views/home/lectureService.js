import { apiGet, apiPost, apiDelete } from '@/utils/api';

export const lectureService = {
  // 강의 목록 조회
  async getLectureList() {
    try {
      const response = await apiGet('/lecture/list');
      console.log(response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('강의 목록 조회 실패:', error);
      throw error;
    }
  },

  // 강의 상세 조회
  async getLectureDetail(lectureId) {
    try {
      const response = await apiGet(`/lecture/detail/${lectureId}`);
      console.log('강의 상세 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('강의 상세 조회 실패:', error);
      throw error;
    }
  },

  // 장바구니에 강의 추가
  async addToCart(lectureIds) {
    try {
      const response = await apiPost('/cart/add', {
        lectureIds: lectureIds
      });
      console.log('장바구니 추가 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      throw error;
    }
  },

  // 장바구니에서 강의 삭제 (단건)
  async removeFromCart(lectureId) {
    try {
      const response = await apiDelete('/cart/delete', {
        lectureId: lectureId
      });
      console.log('장바구니 삭제 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('장바구니 삭제 실패:', error);
      throw error;
    }
  },

  // 장바구니 조회
  async getCartItems() {
    try {
      // 테스트용 유저 ID (백엔드에서 사용하는 UUID)
      const testUserId = "00000000-0000-0000-0000-000000000000";
      
      const response = await apiGet(`/cart/list/${testUserId}`);
      console.log('장바구니 조회 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('장바구니 조회 실패:', error);
      throw error;
    }
  },

  // 장바구니 전체 비우기
  async clearCart() {
    try {
      // 테스트용 유저 ID (백엔드에서 사용하는 UUID)
      const testUserId = "00000000-0000-0000-0000-000000000000";
      
      const response = await apiDelete('/cart/deleteAll', {
        userId: testUserId
      });
      console.log('장바구니 전체 삭제 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('장바구니 전체 삭제 실패:', error);
      throw error;
    }
  }
};
