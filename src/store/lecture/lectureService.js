import { apiGet, apiPost, apiDelete, apiPatch, apiPut } from '@/utils/api';

export const lectureService = {
  // 강의 목록 조회
  async getLectureList(page = 0, size = 8) {
    try {
      const response = await apiGet(`/lecture/list?page=${page}&size=${size}`);
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

  // 강의 좋아요 토글
  async toggleLectureLike(lectureId) {
    try {
      const response = await apiPost(`/api/interactions/lectures/${lectureId}/likes`);
      console.log('좋아요 토글 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      throw error;
    }
  },

  // 강의 좋아요 상태 확인
  async checkLectureLikeStatus(lectureId) {
    try {
      const response = await apiGet(`/api/interactions/lectures/${lectureId}/likes/status`);
      console.log('좋아요 상태 확인 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('좋아요 상태 확인 실패:', error);
      throw error;
    }
  },

  // 구매한 강의 목록 조회
  async getPurchasedLectures() {
    try {
      const response = await apiGet('/api/my/lectures');
      console.log('구매한 강의 목록 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('구매한 강의 목록 조회 실패:', error);
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
        method: 'PUT',
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
  },

  // 리뷰 등록
  async createReview(reviewData) {
    try {
      console.log('=== createReview 시작 ===');
      console.log('reviewData:', reviewData);
      console.log('reviewData.lectureId:', reviewData.lectureId);
      console.log('reviewData.lectureId 타입:', typeof reviewData.lectureId);
      console.log('reviewData.rating:', reviewData.rating);
      console.log('reviewData.content:', reviewData.content);
      
      // lectureId가 없거나 빈 값인지 확인
      if (!reviewData.lectureId) {
        console.error('lectureId가 누락되었습니다!');
        throw new Error('lectureId is required');
      }
      
      const response = await apiPost('/review/post', reviewData);
      console.log('리뷰 등록 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      throw error;
    }
  },

  // 리뷰 수정
  async modifyReview(reviewData) {
    try {
      console.log('=== modifyReview 시작 ===');
      console.log('reviewData:', reviewData);
      console.log('reviewData.lectureId:', reviewData.lectureId);
      console.log('reviewData.lectureId 타입:', typeof reviewData.lectureId);
      console.log('reviewData.rating:', reviewData.rating);
      console.log('reviewData.content:', reviewData.content);
      
      // lectureId가 없거나 빈 값인지 확인
      if (!reviewData.lectureId) {
        console.error('lectureId가 누락되었습니다!');
        throw new Error('lectureId is required');
      }
      
      const response = await apiPatch('/review/modify', reviewData);
      console.log('리뷰 수정 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('리뷰 수정 실패:', error);
      throw error;
    }
  },

  // 리뷰 삭제
  async deleteReview(lectureId) {
    try {
      console.log('=== deleteReview 시작 ===');
      console.log('lectureId:', lectureId);
      console.log('lectureId 타입:', typeof lectureId);
      
      // lectureId가 없거나 빈 값인지 확인
      if (!lectureId) {
        console.error('lectureId가 누락되었습니다!');
        throw new Error('lectureId is required');
      }
      
      const response = await apiDelete(`/review/delete/${lectureId}`);
      console.log('리뷰 삭제 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      throw error;
    }
  },

  // Q&A 등록
  async createQna(lectureId, qnaData) {
    try {
      console.log('=== createQna 시작 ===');
      console.log('lectureId:', lectureId);
      console.log('lectureId 타입:', typeof lectureId);
      console.log('qnaData:', qnaData);
      console.log('qnaData.content:', qnaData.content);
      console.log('qnaData.parentId:', qnaData.parentId);
      
      // lectureId가 없거나 빈 값인지 확인
      if (!lectureId) {
        console.error('lectureId가 누락되었습니다!');
        throw new Error('lectureId is required');
      }
      
      // content가 없거나 빈 값인지 확인
      if (!qnaData.content || !qnaData.content.trim()) {
        console.error('content가 누락되었습니다!');
        throw new Error('content is required');
      }
      
      const response = await apiPost(`/lecture/qna/${lectureId}/create`, qnaData);
      console.log('Q&A 등록 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Q&A 등록 실패:', error);
      throw error;
    }
  },

  // Q&A 수정
  async updateQna(qnaId, qnaData) {
    try {
      console.log('=== updateQna 시작 ===');
      console.log('qnaId:', qnaId);
      console.log('qnaId 타입:', typeof qnaId);
      console.log('qnaData:', qnaData);
      console.log('qnaData.content:', qnaData.content);
      
      // qnaId가 없거나 빈 값인지 확인
      if (!qnaId) {
        console.error('qnaId가 누락되었습니다!');
        throw new Error('qnaId is required');
      }
      
      // content가 없거나 빈 값인지 확인
      if (!qnaData.content || !qnaData.content.trim()) {
        console.error('content가 누락되었습니다!');
        throw new Error('content is required');
      }
      
      const response = await apiPut(`/lecture/qna/${qnaId}/update`, qnaData);
      console.log('Q&A 수정 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Q&A 수정 실패:', error);
      throw error;
    }
  },

  // Q&A 삭제
  async deleteQna(qnaId) {
    try {
      console.log('=== deleteQna 시작 ===');
      console.log('qnaId:', qnaId);
      console.log('qnaId 타입:', typeof qnaId);
      
      // qnaId가 없거나 빈 값인지 확인
      if (!qnaId) {
        console.error('qnaId가 누락되었습니다!');
        throw new Error('qnaId is required');
      }
      
      const response = await apiDelete(`/lecture/qna/${qnaId}/delete`);
      console.log('Q&A 삭제 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Q&A 삭제 실패:', error);
      throw error;
    }
  },

  // 강의 삭제
  async deleteLecture(lectureId) {
    try {
      console.log('=== deleteLecture 시작 ===');
      console.log('lectureId:', lectureId);
      console.log('lectureId 타입:', typeof lectureId);
      
      // lectureId가 없거나 빈 값인지 확인
      if (!lectureId) {
        console.error('lectureId가 누락되었습니다!');
        throw new Error('lectureId is required');
      }
      
      const response = await apiDelete(`/lecture/delete/${lectureId}`);
      console.log('강의 삭제 응답:', response);
      
      // response가 fetch Response 객체이므로 JSON으로 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('강의 삭제 실패:', error);
      throw error;
    }
  },
};
