import { defineStore } from 'pinia';
import { userApprovalService } from '../../services/admin/userApprovalService';

export const useUserApprovalStore = defineStore('userApproval', {
  state: () => ({
    // 승인 대기 사용자 데이터
    waitingChefs: [],
    waitingBusinesses: [],
    
    // UI 상태
    loading: false,
    error: null,
    
    // 페이지네이션
    chefPagination: {
      totalPages: 0,
      currentPage: 0,
      totalElements: 0,
      pageSize: 10,
    },
    businessPagination: {
      totalPages: 0,
      currentPage: 0,
      totalElements: 0,
      pageSize: 10,
    },
  }),

  getters: {
    // 승인 대기 사용자 목록
    getWaitingChefs: (state) => state.waitingChefs,
    getWaitingBusinesses: (state) => state.waitingBusinesses,
    
    // UI 상태
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    // 페이지네이션 정보
    getChefPaginationInfo: (state) => state.chefPagination,
    getBusinessPaginationInfo: (state) => state.businessPagination,
    
    // 유틸리티 getters
    hasWaitingChefs: (state) => state.waitingChefs.length > 0,
    hasWaitingBusinesses: (state) => state.waitingBusinesses.length > 0,
    getTotalWaitingCount: (state) => state.waitingChefs.length + state.waitingBusinesses.length,
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

    // 요리사 승인 대기 목록 조회
    async fetchWaitingChefs(page = 0, size = 10) {
      this._setLoading(true);
      this.error = null;
      
      try {
        const apiResponse = await userApprovalService.getWaitingChefs(page, size);
        const responseData = apiResponse.getData();
        
        this.waitingChefs = responseData.content;
        this.chefPagination = {
          totalPages: responseData.totalPages,
          currentPage: responseData.number,
          totalElements: responseData.totalElements,
          pageSize: size,
        };
      } catch (error) {
        this._handleError(error, '요리사 승인 대기 목록을 불러오는데 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 자영업자 승인 대기 목록 조회
    async fetchWaitingBusinesses(page = 0, size = 10) {
      this._setLoading(true);
      this.error = null;
      
      try {
        const apiResponse = await userApprovalService.getWaitingBusinesses(page, size);
        const responseData = apiResponse.getData();
        
        this.waitingBusinesses = responseData.content;
        this.businessPagination = {
          totalPages: responseData.totalPages,
          currentPage: responseData.number,
          totalElements: responseData.totalElements,
          pageSize: size,
        };
      } catch (error) {
        this._handleError(error, '자영업자 승인 대기 목록을 불러오는데 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 사용자 승인
    async approveUser(userId) {
      this._setLoading(true);
      this.error = null;
      
      try {
        await userApprovalService.approveUser(userId);
        // 승인 후 목록 새로고침
        await this.fetchWaitingChefs(this.chefPagination.currentPage, this.chefPagination.pageSize);
        await this.fetchWaitingBusinesses(this.businessPagination.currentPage, this.businessPagination.pageSize);
      } catch (error) {
        this._handleError(error, '사용자 승인에 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 사용자 거절
    async rejectUser(userId, rejectReason) {
      this._setLoading(true);
      this.error = null;
      
      try {
        await userApprovalService.rejectUser(userId, rejectReason);
        // 거절 후 목록 새로고침
        await this.fetchWaitingChefs(this.chefPagination.currentPage, this.chefPagination.pageSize);
        await this.fetchWaitingBusinesses(this.businessPagination.currentPage, this.businessPagination.pageSize);
      } catch (error) {
        this._handleError(error, '사용자 거절에 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 에러 초기화
    clearError() {
      this.error = null;
    },

    // 전체 상태 초기화
    reset() {
      this.waitingChefs = [];
      this.waitingBusinesses = [];
      this.loading = false;
      this.error = null;
      this.chefPagination = {
        totalPages: 0,
        currentPage: 0,
        totalElements: 0,
        pageSize: 10,
      };
      this.businessPagination = {
        totalPages: 0,
        currentPage: 0,
        totalElements: 0,
        pageSize: 10,
      };
    },
  },
});
