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
      const response = await apiGet('/cart/list');
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
      const response = await apiDelete('/cart/deleteAll');
      console.log('장바구니 전체 삭제 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('장바구니 전체 삭제 실패:', error);
      throw error;
    }
  },

  // 강의 수정
  async updateLecture(lectureId, formData) {
    try {
      console.log('=== updateLecture 시작 ===');
      console.log('lectureId:', lectureId);
      console.log('formData:', formData);
      
      // 토큰 가져오기
      const token = localStorage.getItem('accessToken');
      console.log('token:', token);
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const url = `http://localhost:8080/lecture/update/${lectureId}`;
      console.log('요청 URL:', url);
      console.log('요청 헤더:', headers);
      
      // multipart/form-data에서는 Content-Type 헤더를 설정하지 않음 (브라우저가 자동 설정)
      const response = await fetch(url, {
        method: 'PATCH',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      
      console.log('강의 수정 응답:', response);
      console.log('응답 상태:', response.status);
      console.log('응답 헤더:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('에러 응답 내용:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('응답 데이터:', data);
      return data;
    } catch (error) {
      console.error('강의 수정 실패:', error);
      console.error('에러 상세:', error.message);
      throw error;
    }
  }
};
