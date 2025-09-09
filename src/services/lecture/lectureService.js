import { apiClient } from '@/utils/interceptor';

export const lectureService = {
  // 강의 목록 조회
  async getLectureList(page = 0, size = 8) {
    try {
      const response = await apiClient.get(`/lecture/list?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('강의 목록 조회 실패:', error);
      throw error;
    }
  },

  // 강의 상세 조회
  async getLectureDetail(lectureId) {
    try {
      const response = await apiClient.get(`/lecture/detail/${lectureId}`);
      return response.data;
    } catch (error) {
      console.error('강의 상세 조회 실패:', error);
      throw error;
    }
  },

  // 장바구니에 강의 추가
  async addToCart(lectureIds) {
    try {
      const response = await apiClient.post('/cart/add', {
        lectureIds: lectureIds
      });
      return response.data;
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      throw error;
    }
  },

  // 장바구니에서 강의 삭제 (단건)
  async removeFromCart(lectureId) {
    try {
      const response = await apiClient.delete('/cart/delete', {
        data: { lectureId: lectureId }
      });
      return response.data;
    } catch (error) {
      console.error('장바구니 삭제 실패:', error);
      throw error;
    }
  },

  // 장바구니 조회
  async getCartItems() {
    try {
      const response = await apiClient.get('/cart/list');
      return response.data;
    } catch (error) {
      console.error('장바구니 조회 실패:', error);
      throw error;
    }
  },

  // 장바구니 전체 비우기
  async clearCart() {
    try {
      const response = await apiClient.delete('/cart/deleteAll');
      return response.data;
    } catch (error) {
      console.error('장바구니 전체 삭제 실패:', error);
      throw error;
    }
  },

  // Q&A 등록
  async createQna(lectureId, qnaData) {
    try {
      const response = await apiClient.post(`/lecture/qna/${lectureId}/create`, qnaData);
      return response.data;
    } catch (error) {
      console.error('Q&A 등록 실패:', error);
      throw error;
    }
  },

  // Q&A 수정
  async updateQna(qnaId, qnaData) {
    try {
      const response = await apiClient.put(`/lecture/qna/${qnaId}/update`, qnaData);
      return response.data;
    } catch (error) {
      console.error('Q&A 수정 실패:', error);
      throw error;
    }
  },

  // Q&A 삭제
  async deleteQna(qnaId) {
    try {
      const response = await apiClient.delete(`/lecture/qna/${qnaId}/delete`);
      return response.data;
    } catch (error) {
      console.error('Q&A 삭제 실패:', error);
      throw error;
    }
  },

  // 강의 좋아요 토글
  async toggleLectureLike(lectureId) {
    try {
      const response = await apiClient.post(`/api/interactions/lectures/${lectureId}/likes`);
      return response.data;
    } catch (error) {
      console.error('강의 좋아요 토글 실패:', error);
      throw error;
    }
  },

  // 강의 검색
  async searchLectures(searchTerm, page = 0, size = 8) {
    try {
      const response = await apiClient.get(`/lecture/search?term=${searchTerm}&page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('강의 검색 실패:', error);
      throw error;
    }
  },

  // 강의 생성
  async createLecture(lectureData) {
    try {
      const response = await apiClient.post('/lecture/post', lectureData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5분으로 설정 (대용량 파일 업로드 고려)
      });
      return response.data;
    } catch (error) {
      console.error('강의 생성 실패:', error);
      throw error;
    }
  },

  // 영상 진행도 저장 (lectureProgressService 통합)
  async saveVideoProgress(videoId, second) {
    try {
      const response = await apiClient.post(`/lecture/progress/${videoId}?second=${second}`);
      return response.data;
    } catch (error) {
      console.error('영상 진행도 저장 실패:', error);
      throw error;
    }
  },

  // 강의 수정
  async updateLecture(lectureId, formData) {
    try {
      const response = await apiClient.patch(`/lecture/update/${lectureId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5분으로 설정 (대용량 파일 업로드 고려)
      });
      return response.data;
    } catch (error) {
      console.error('강의 수정 실패:', error);
      throw error;
    }
  },

  // 강의 삭제
  async deleteLecture(lectureId) {
    try {
      const response = await apiClient.delete(`/lecture/delete/${lectureId}`);
      return response.data;
    } catch (error) {
      console.error('강의 삭제 실패:', error);
      throw error;
    }
  },

  // 리뷰 등록
  async createReview(reviewData) {
    try {
      const response = await apiClient.post('/review/post', reviewData);
      return response.data;
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      throw error;
    }
  },

  // 리뷰 수정
  async modifyReview(reviewData) {
    try {
      const response = await apiClient.patch('/review/modify', reviewData);
      return response.data;
    } catch (error) {
      console.error('리뷰 수정 실패:', error);
      throw error;
    }
  },

  // 리뷰 삭제
  async deleteReview(lectureId) {
    try {
      const response = await apiClient.delete(`/review/delete/${lectureId}`);
      return response.data;
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      throw error;
    }
  },

  // 강의 구매
  async purchaseLecture(lectureIds) {
    try {
      const response = await apiClient.post('/lecture/purchase', {
        lectureIds: lectureIds
      });
      return response.data;
    } catch (error) {
      console.error('강의 구매 실패:', error);
      throw error;
    }
  },

  // 강의 시청 기록
  async recordLectureProgress(lectureId, progress) {
    try {
      const response = await apiClient.post('/lecture/progress', {
        lectureId: lectureId,
        progress: progress
      });
      return response.data;
    } catch (error) {
      console.error('강의 시청 기록 실패:', error);
      throw error;
    }
  },

  // 강의 시청 진행률 조회
  async getLectureProgress(lectureId) {
    try {
      const response = await apiClient.get(`/lecture/progress/${lectureId}`);
      return response.data;
    } catch (error) {
      console.error('강의 시청 진행률 조회 실패:', error);
      throw error;
    }
  }
};
