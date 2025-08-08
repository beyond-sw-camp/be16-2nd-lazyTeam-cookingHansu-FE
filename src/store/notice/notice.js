import { defineStore } from 'pinia';
import { noticeService } from '../../services/notice/noticeService';

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    // 공지사항 데이터
    notices: [],
    currentNotice: null,
    
    // UI 상태
    loading: false,
    error: null,
    
    // 페이지네이션
    pagination: {
      totalPages: 0,
      currentPage: 0,
      totalElements: 0,
      pageSize: 10,
    },
  }),

  getters: {
    // 공지사항 목록
    getNotices: (state) => state.notices,
    
    // 현재 선택된 공지사항
    getCurrentNotice: (state) => state.currentNotice,
    
    // UI 상태
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    // 페이지네이션 정보
    getPaginationInfo: (state) => state.pagination,
    
    // 유틸리티 getters
    hasNotices: (state) => state.notices.length > 0,
  },

  actions: {
    // 에러 처리 헬퍼
    _handleError(error, defaultMessage) {
      console.error(defaultMessage, error);
      this.error = error.message || defaultMessage;
      throw error;
    },

    // 로딩 상태 관리
    _setLoading(loading) {
      this.loading = loading;
    },

    // 공지사항 목록 조회
    async fetchNotices(page = 0, size = 10) {
      this._setLoading(true);
      this.error = null;
      
      try {
        const apiResponse = await noticeService.getNoticeList(page, size);
        const responseData = apiResponse.getData();
        
        this.notices = responseData.content;
        this.pagination = {
          totalPages: responseData.totalPages,
          currentPage: responseData.number,
          totalElements: responseData.totalElements,
          pageSize: size,
        };
      } catch (error) {
        this._handleError(error, '공지사항 목록을 불러오는데 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 공지사항 상세 조회
    async fetchNoticeDetail(id) {
      this._setLoading(true);
      this.error = null;
      
      try {
        const apiResponse = await noticeService.getNoticeDetail(id);
        this.currentNotice = apiResponse.getData();
      } catch (error) {
        this._handleError(error, '공지사항 상세 정보를 불러오는데 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 공지사항 생성 (관리자용)
    async createNotice(noticeData) {
      this._setLoading(true);
      this.error = null;
      
      try {
        const response = await noticeService.createNotice(noticeData);
        const newNotice = response.getData();
        
        // 서버에서 반환된 완전한 데이터로 목록 새로고침
        await this.fetchNotices(0, this.pagination.pageSize);
      } catch (error) {
        this._handleError(error, '공지사항 생성에 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 공지사항 수정 (관리자용)
    async updateNotice(id, noticeData) {
      this._setLoading(true);
      this.error = null;
      
      try {
        await noticeService.updateNotice(id, noticeData);
        // 수정 후 목록 새로고침으로 최신 데이터 확보
        await this.fetchNotices(this.pagination.currentPage, this.pagination.pageSize);
      } catch (error) {
        this._handleError(error, '공지사항 수정에 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 공지사항 삭제 (관리자용)
    async deleteNotice(id) {
      this._setLoading(true);
      this.error = null;
      
      try {
        await noticeService.deleteNotice(id);
        // 삭제 후 목록 새로고침 (현재 페이지 유지)
        await this.fetchNotices(this.pagination.currentPage, this.pagination.pageSize);
      } catch (error) {
        this._handleError(error, '공지사항 삭제에 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },



    // 상태 초기화
    clearCurrentNotice() {
      this.currentNotice = null;
    },

    clearError() {
      this.error = null;
    },

    // 전체 상태 초기화
    reset() {
      this.notices = [];
      this.currentNotice = null;
      this.loading = false;
      this.error = null;
      this.pagination = {
        totalPages: 0,
        currentPage: 0,
        totalElements: 0,
        pageSize: 10,
      };
    },
  },
});
