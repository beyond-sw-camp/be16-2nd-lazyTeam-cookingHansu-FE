import { defineStore } from 'pinia';
import { userApprovalService } from '../../services/admin/userApprovalService';

export const useUserApprovalStore = defineStore('userApproval', {
  state: () => ({
    // 승인 대기 사용자 데이터
    waitingChefs: [],
    waitingBusinesses: [],
    
    // UI 상태
    loading: false,
    error: null, // 네트워크 연결 오류
    successMessage: null,
    loadError: null, // 데이터 로딩 API 오류
    
    // 개별 사용자 로딩 상태
    processingUsers: new Set(),
    
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
    getSuccessMessage: (state) => state.successMessage,
    getLoadError: (state) => state.loadError,
    
    // 개별 사용자 로딩 상태
    isUserProcessing: (state) => (userId) => state.processingUsers.has(userId),
    
    // 페이지네이션 정보
    getChefPaginationInfo: (state) => state.chefPagination,
    getBusinessPaginationInfo: (state) => state.businessPagination,
    
    // 유틸리티 getters
    hasWaitingChefs: (state) => state.waitingChefs.length > 0,
    hasWaitingBusinesses: (state) => state.waitingBusinesses.length > 0,
    getTotalWaitingCount: (state) => state.waitingChefs.length + state.waitingBusinesses.length,
  },

  actions: {
    // 에러 처리 헬퍼 - 네트워크 에러는 전체 UI 에러로, API 에러는 throw만
    _handleError(error, defaultMessage) {
      console.error(defaultMessage, error);
      
      // 네트워크 연결 오류인지 확인 (api.js에서 처리된 메시지)
      if (error.message && (error.message.includes('서버와의 연결') || error.message.includes('네트워크 연결'))) {
        this.error = error.message || defaultMessage;
      }
      
      throw error;
    },

    // 로딩 상태 관리
    _setLoading(loading) {
      this.loading = loading;
    },

    // 성공 메시지 설정
    setSuccessMessage(message) {
      this.successMessage = message;
      // 1초 후 자동으로 메시지 제거
      setTimeout(() => {
        this.successMessage = null;
      }, 1000);
    },

    // 메시지 초기화
    clearMessages() {
      this.successMessage = null;
      this.error = null;
      this.loadError = null;
    },

    // 요리사 승인 대기 목록 조회
    async fetchWaitingChefs(page = 0, size = 10) {
      this._setLoading(true);
      this.error = null;
      this.loadError = null;
      
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
        console.error('요리사 승인 대기 목록을 불러오는데 실패했습니다.', error);
        
        // 네트워크 연결 오류인지 확인 (api.js에서 처리된 메시지)
        if (error.message && (error.message.includes('서버와의 연결') || error.message.includes('네트워크 연결'))) {
          this.error = error.message;
        } else {
          // API 에러는 loadError에 저장하고 빈 목록 표시
          this.loadError = error.message || '요리사 승인 대기 목록을 불러오는데 실패했습니다.';
          this.waitingChefs = [];
          this.chefPagination = {
            totalPages: 0,
            currentPage: 0,
            totalElements: 0,
            pageSize: size,
          };
        }
      } finally {
        this._setLoading(false);
      }
    },

    // 자영업자 승인 대기 목록 조회
    async fetchWaitingBusinesses(page = 0, size = 10) {
      this._setLoading(true);
      this.error = null;
      this.loadError = null;
      
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
        console.error('자영업자 승인 대기 목록을 불러오는데 실패했습니다.', error);
        
        // 네트워크 연결 오류인지 확인 (api.js에서 처리된 메시지)
        if (error.message && (error.message.includes('서버와의 연결') || error.message.includes('네트워크 연결'))) {
          this.error = error.message;
        } else {
          // API 에러는 loadError에 저장하고 빈 목록 표시
          this.loadError = error.message || '자영업자 승인 대기 목록을 불러오는데 실패했습니다.';
          this.waitingBusinesses = [];
          this.businessPagination = {
            totalPages: 0,
            currentPage: 0,
            totalElements: 0,
            pageSize: size,
          };
        }
      } finally {
        this._setLoading(false);
      }
    },

    // 사용자 승인
    async approveUser(userId) {
      this.processingUsers.add(userId);
      
      try {
        await userApprovalService.approveUser(userId);
        this.setSuccessMessage('사용자 승인이 완료되었습니다.');
        
        // 로컬 상태만 업데이트 (API 재호출 없음)
        // 요리사 목록에서 제거
        this.waitingChefs = this.waitingChefs.filter(chef => chef.userId !== userId);
        // 자영업자 목록에서 제거
        this.waitingBusinesses = this.waitingBusinesses.filter(business => business.id !== userId);
        
        // 페이지네이션 정보 업데이트
        this.chefPagination.totalElements = Math.max(0, this.chefPagination.totalElements - 1);
        this.businessPagination.totalElements = Math.max(0, this.businessPagination.totalElements - 1);
      } catch (error) {
        this._handleError(error, '사용자 승인에 실패했습니다.');
      } finally {
        this.processingUsers.delete(userId);
      }
    },

    // 사용자 거절
    async rejectUser(userId, rejectReason) {
      this.processingUsers.add(userId);
      
      try {
        await userApprovalService.rejectUser(userId, rejectReason);
        this.setSuccessMessage('사용자 거절이 완료되었습니다.');
        
        // 로컬 상태만 업데이트 (API 재호출 없음)
        // 요리사 목록에서 제거
        this.waitingChefs = this.waitingChefs.filter(chef => chef.userId !== userId);
        // 자영업자 목록에서 제거
        this.waitingBusinesses = this.waitingBusinesses.filter(business => business.id !== userId);
        
        // 페이지네이션 정보 업데이트
        this.chefPagination.totalElements = Math.max(0, this.chefPagination.totalElements - 1);
        this.businessPagination.totalElements = Math.max(0, this.businessPagination.totalElements - 1);
      } catch (error) {
        this._handleError(error, '사용자 거절에 실패했습니다.');
      } finally {
        this.processingUsers.delete(userId);
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
      this.successMessage = null;
      this.loadError = null;
      this.processingUsers.clear();
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
