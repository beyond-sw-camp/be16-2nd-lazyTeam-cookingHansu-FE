import { defineStore } from 'pinia';
import { lectureService } from '@/services/lecture/lectureService';

export const useLectureStore = defineStore('lecture', {
  state: () => ({
    // 강의 목록 관련
    lectures: [],
    currentLecture: null,
    lectureList: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: 8
    },
    
    // 검색 관련
    searchResults: [],
    searchTerm: '',
    
    // 장바구니 관련
    cartItems: [],
    cartTotal: 0,
    
    // 좋아요/북마크 관련
    likedLectures: [],
    bookmarkedLectures: [],
    
    // 강의 진행률 관련
    lectureProgress: {},
    videoProgress: {},
    
    // 리뷰 관련
    reviews: [],
    
    // 로딩 상태
    loading: {
      lectures: false,
      lectureDetail: false,
      cart: false,
      like: false,
      bookmark: false,
      progress: false,
      review: false,
      create: false,
      update: false,
      delete: false
    },
    
    // 에러 상태
    error: null
  }),

  getters: {
    // 강의 목록 getter
    getLectures: (state) => state.lectures,
    getCurrentLecture: (state) => state.currentLecture,
    getLectureList: (state) => state.lectureList,
    
    // 검색 결과 getter
    getSearchResults: (state) => state.searchResults,
    getSearchTerm: (state) => state.searchTerm,
    
    // 장바구니 getter
    getCartItems: (state) => state.cartItems,
    getCartTotal: (state) => state.cartTotal,
    getCartItemCount: (state) => state.cartItems.length,
    
    // 좋아요/북마크 getter
    getLikedLectures: (state) => state.likedLectures,
    getBookmarkedLectures: (state) => state.bookmarkedLectures,
    
    // 진행률 getter
    getLectureProgress: (state) => (lectureId) => state.lectureProgress[lectureId] || 0,
    getVideoProgress: (state) => (videoId) => state.videoProgress[videoId] || 0,
    
    // 리뷰 getter
    getReviews: (state) => state.reviews,
    
    // 로딩 상태 getter
    isLoading: (state) => (type) => state.loading[type] || false,
    
    // 에러 getter
    getError: (state) => state.error,
    
    // 특정 강의가 좋아요/북마크 상태인지 확인
    isLiked: (state) => (lectureId) => state.likedLectures.includes(lectureId),
    isBookmarked: (state) => (lectureId) => state.bookmarkedLectures.includes(lectureId),
    
    // 장바구니에 특정 강의가 있는지 확인
    isInCart: (state) => (lectureId) => state.cartItems.some(item => item.lectureId === lectureId)
  },

  actions: {
    // 강의 목록 조회
    async fetchLectures(page = 0, size = 8) {
      this.loading.lectures = true;
      this.error = null;
      
      try {
        const response = await lectureService.getLectureList(page, size);
        this.lectureList = response;
        this.lectures = response.content || [];
        return response;
      } catch (error) {
        this.error = error.message || '강의 목록을 불러오는데 실패했습니다.';
        throw error;
      } finally {
        this.loading.lectures = false;
      }
    },

    // 강의 상세 조회
    async fetchLectureDetail(lectureId) {
      this.loading.lectureDetail = true;
      this.error = null;
      
      try {
        const response = await lectureService.getLectureDetail(lectureId);
        this.currentLecture = response;
        return response;
      } catch (error) {
        this.error = error.message || '강의 상세 정보를 불러오는데 실패했습니다.';
        throw error;
      } finally {
        this.loading.lectureDetail = false;
      }
    },

    // 강의 검색
    async searchLectures(searchTerm, page = 0, size = 8) {
      this.loading.lectures = true;
      this.error = null;
      this.searchTerm = searchTerm;
      
      try {
        const response = await lectureService.searchLectures(searchTerm, page, size);
        this.searchResults = response.content || [];
        return response;
      } catch (error) {
        this.error = error.message || '강의 검색에 실패했습니다.';
        throw error;
      } finally {
        this.loading.lectures = false;
      }
    },

    // 강의 생성
    async createLecture(lectureData) {
      this.loading.create = true;
      this.error = null;
      
      try {
        const response = await lectureService.createLecture(lectureData);
        // 생성 후 목록 새로고침
        await this.fetchLectures();
        return response;
      } catch (error) {
        this.error = error.message || '강의 생성에 실패했습니다.';
        throw error;
      } finally {
        this.loading.create = false;
      }
    },

    // 강의 수정
    async updateLecture(lectureId, formData) {
      this.loading.update = true;
      this.error = null;
      
      try {
        const response = await lectureService.updateLecture(lectureId, formData);
        // 수정 후 상세 정보 새로고침
        await this.fetchLectureDetail(lectureId);
        return response;
      } catch (error) {
        this.error = error.message || '강의 수정에 실패했습니다.';
        throw error;
      } finally {
        this.loading.update = false;
      }
    },

    // 강의 삭제
    async deleteLecture(lectureId) {
      this.loading.delete = true;
      this.error = null;
      
      try {
        const response = await lectureService.deleteLecture(lectureId);
        // 삭제 후 목록에서 제거
        this.lectures = this.lectures.filter(lecture => lecture.lectureId !== lectureId);
        // lectureList.content가 존재하는지 확인 후 필터링
        if (this.lectureList.content && Array.isArray(this.lectureList.content)) {
          this.lectureList.content = this.lectureList.content.filter(lecture => lecture.lectureId !== lectureId);
        }
        return response;
      } catch (error) {
        this.error = error.message || '강의 삭제에 실패했습니다.';
        throw error;
      } finally {
        this.loading.delete = false;
      }
    },

    // 장바구니 관련
    async fetchCartItems() {
      this.loading.cart = true;
      this.error = null;
      
      try {
        const response = await lectureService.getCartItems();
        // response가 배열인지 확인하고, 아니면 빈 배열로 설정
        this.cartItems = Array.isArray(response) ? response : [];
        this.cartTotal = this.cartItems.reduce((total, item) => total + (item.price || 0), 0);
        return response;
      } catch (error) {
        this.error = error.message || '장바구니를 불러오는데 실패했습니다.';
        // 에러 발생 시에도 빈 배열로 초기화
        this.cartItems = [];
        this.cartTotal = 0;
        throw error;
      } finally {
        this.loading.cart = false;
      }
    },

    async addToCart(lectureIds) {
      this.loading.cart = true;
      this.error = null;
      
      try {
        const response = await lectureService.addToCart(lectureIds);
        // 장바구니 새로고침
        await this.fetchCartItems();
        return response;
      } catch (error) {
        this.error = error.message || '장바구니 추가에 실패했습니다.';
        throw error;
      } finally {
        this.loading.cart = false;
      }
    },

    async removeFromCart(lectureId) {
      this.loading.cart = true;
      this.error = null;
      
      try {
        const response = await lectureService.removeFromCart(lectureId);
        // 장바구니에서 제거
        this.cartItems = this.cartItems.filter(item => item.lectureId !== lectureId);
        this.cartTotal = this.cartItems.reduce((total, item) => total + (item.price || 0), 0);
        return response;
      } catch (error) {
        this.error = error.message || '장바구니에서 제거하는데 실패했습니다.';
        throw error;
      } finally {
        this.loading.cart = false;
      }
    },

    async clearCart() {
      this.loading.cart = true;
      this.error = null;
      
      try {
        const response = await lectureService.clearCart();
        this.cartItems = [];
        this.cartTotal = 0;
        return response;
      } catch (error) {
        this.error = error.message || '장바구니 비우기에 실패했습니다.';
        throw error;
      } finally {
        this.loading.cart = false;
      }
    },

    // 좋아요 관련
    async toggleLectureLike(lectureId) {
      this.loading.like = true;
      this.error = null;
      
      try {
        const response = await lectureService.toggleLectureLike(lectureId);
        
        // 좋아요 상태 토글
        const index = this.likedLectures.indexOf(lectureId);
        if (index > -1) {
          this.likedLectures.splice(index, 1);
        } else {
          this.likedLectures.push(lectureId);
        }
        
        return response;
      } catch (error) {
        this.error = error.message || '좋아요 처리에 실패했습니다.';
        throw error;
      } finally {
        this.loading.like = false;
      }
    },

    // 북마크 관련
    async toggleLectureBookmark(lectureId) {
      this.loading.bookmark = true;
      this.error = null;
      
      try {
        const response = await lectureService.toggleLectureBookmark(lectureId);
        
        // 북마크 상태 토글
        const index = this.bookmarkedLectures.indexOf(lectureId);
        if (index > -1) {
          this.bookmarkedLectures.splice(index, 1);
        } else {
          this.bookmarkedLectures.push(lectureId);
        }
        
        return response;
      } catch (error) {
        this.error = error.message || '북마크 처리에 실패했습니다.';
        throw error;
      } finally {
        this.loading.bookmark = false;
      }
    },

    // 강의 진행률 관련
    async recordLectureProgress(lectureId, progress) {
      this.loading.progress = true;
      this.error = null;
      
      try {
        const response = await lectureService.recordLectureProgress(lectureId, progress);
        this.lectureProgress[lectureId] = progress;
        return response;
      } catch (error) {
        this.error = error.message || '강의 진행률 저장에 실패했습니다.';
        throw error;
      } finally {
        this.loading.progress = false;
      }
    },

    async fetchLectureProgress(lectureId) {
      this.loading.progress = true;
      this.error = null;
      
      try {
        const response = await lectureService.getLectureProgress(lectureId);
        this.lectureProgress[lectureId] = response.progress || 0;
        return response;
      } catch (error) {
        this.error = error.message || '강의 진행률 조회에 실패했습니다.';
        throw error;
      } finally {
        this.loading.progress = false;
      }
    },

    // 비디오 진행률 저장 (lectureProgressService 통합)
    async saveVideoProgress(videoId, second) {
      this.loading.progress = true;
      this.error = null;
      
      try {
        const response = await lectureService.saveVideoProgress(videoId, second);
        this.videoProgress[videoId] = second;
        return response;
      } catch (error) {
        this.error = error.message || '비디오 진행률 저장에 실패했습니다.';
        throw error;
      } finally {
        this.loading.progress = false;
      }
    },

    // 강의 구매
    async purchaseLecture(lectureIds) {
      this.loading.cart = true;
      this.error = null;
      
      try {
        const response = await lectureService.purchaseLecture(lectureIds);
        // 구매 후 장바구니 새로고침
        await this.fetchCartItems();
        return response;
      } catch (error) {
        this.error = error.message || '강의 구매에 실패했습니다.';
        throw error;
      } finally {
        this.loading.cart = false;
      }
    },

    // 리뷰 관련
    async createReview(reviewData) {
      this.loading.review = true;
      this.error = null;
      
      try {
        const response = await lectureService.createReview(reviewData);
        // 리뷰 목록 새로고침
        await this.fetchReviews(reviewData.lectureId);
        return response;
      } catch (error) {
        this.error = error.message || '리뷰 작성에 실패했습니다.';
        throw error;
      } finally {
        this.loading.review = false;
      }
    },

    async updateReview(reviewData) {
      this.loading.review = true;
      this.error = null;
      
      try {
        const response = await lectureService.modifyReview(reviewData);
        // 리뷰 목록 새로고침
        await this.fetchReviews(reviewData.lectureId);
        return response;
      } catch (error) {
        this.error = error.message || '리뷰 수정에 실패했습니다.';
        throw error;
      } finally {
        this.loading.review = false;
      }
    },

    async deleteReview(lectureId) {
      this.loading.review = true;
      this.error = null;
      
      try {
        const response = await lectureService.deleteReview(lectureId);
        // 리뷰 목록에서 제거
        this.reviews = this.reviews.filter(review => review.lectureId !== lectureId);
        return response;
      } catch (error) {
        this.error = error.message || '리뷰 삭제에 실패했습니다.';
        throw error;
      } finally {
        this.loading.review = false;
      }
    },

    async fetchReviews(lectureId) {
      this.loading.review = true;
      this.error = null;
      
      try {
        // 리뷰 조회 API가 있다면 추가, 없다면 임시로 빈 배열
        this.reviews = [];
        return this.reviews;
      } catch (error) {
        this.error = error.message || '리뷰 목록을 불러오는데 실패했습니다.';
        throw error;
      } finally {
        this.loading.review = false;
      }
    },

    // 상태 초기화
    clearError() {
      this.error = null;
    },

    clearCurrentLecture() {
      this.currentLecture = null;
    },

    clearSearchResults() {
      this.searchResults = [];
      this.searchTerm = '';
    },

    // 초기 데이터 로드
    async initializeStore() {
      try {
        await Promise.all([
          this.fetchLectures(),
          this.fetchCartItems()
        ]);
      } catch (error) {
        console.error('Store 초기화 실패:', error);
      }
    }
  }
});
