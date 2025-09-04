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
    successMessage: null,
    
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
    // 성공 메시지 설정
    setSuccessMessage(message) {
      this.successMessage = message;
      // 3초 후 자동으로 메시지 제거
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    },

    // 메시지 초기화
    clearMessages() {
      this.successMessage = null;
      this.error = null;
    },

    // 요리사 승인 대기 목록 조회
    async fetchWaitingChefs(page = 0, size = 10) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await userApprovalService.getWaitingChefs(page, size);
        
        if (response.success && response.data) {
          const responseData = response.data;
          
          this.waitingChefs = responseData.content || [];
          this.chefPagination = {
            totalPages: responseData.totalPages || 0,
            currentPage: responseData.number || 0,
            totalElements: responseData.totalElements || 0,
            pageSize: size,
          };
        } else {
          throw new Error(response.message || '요리사 목록을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('요리사 승인 대기 목록 조회 실패:', error);
        this.error = error.message || '요리사 목록을 불러오는데 실패했습니다.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 자영업자 승인 대기 목록 조회
    async fetchWaitingBusinesses(page = 0, size = 10) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await userApprovalService.getWaitingBusinesses(page, size);
        
        if (response.success && response.data) {
          const responseData = response.data;
          
          this.waitingBusinesses = responseData.content || [];
          this.businessPagination = {
            totalPages: responseData.totalPages || 0,
            currentPage: responseData.number || 0,
            totalElements: responseData.totalElements || 0,
            pageSize: size,
          };
        } else {
          throw new Error(response.message || '자영업자 목록을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('자영업자 승인 대기 목록 조회 실패:', error);
        this.error = error.message || '자영업자 목록을 불러오는데 실패했습니다.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 사용자 승인
    async approveUser(userId, userType) {
      this.processingUsers.add(userId);
      
      try {
        const response = await userApprovalService.approveUser(userId);
        
        if (response.success) {
          // 승인된 사용자를 해당 목록에서 제거 (반응성을 위해 새 배열 생성)
          if (userType === 'chef') {
            this.waitingChefs = [...this.waitingChefs.filter(user => user.userId !== userId)];
            this.chefPagination.totalElements = Math.max(0, this.chefPagination.totalElements - 1);
          } else if (userType === 'business') {
            this.waitingBusinesses = [...this.waitingBusinesses.filter(user => user.id !== userId)];
            this.businessPagination.totalElements = Math.max(0, this.businessPagination.totalElements - 1);
          }
          
          this.setSuccessMessage('사용자가 승인되었습니다.');
          return response;
        } else {
          throw new Error(response.message || '사용자 승인에 실패했습니다.');
        }
      } catch (error) {
        console.error('사용자 승인 실패:', error);
        throw error;
      } finally {
        this.processingUsers.delete(userId);
      }
    },

    // 사용자 거절
    async rejectUser(userId, rejectReason, userType) {
      this.processingUsers.add(userId);
      
      try {
        const response = await userApprovalService.rejectUser(userId, rejectReason);
        
        if (response.success) {
          // 거절된 사용자를 해당 목록에서 제거 (반응성을 위해 새 배열 생성)
          if (userType === 'chef') {
            this.waitingChefs = [...this.waitingChefs.filter(user => user.userId !== userId)];
            this.chefPagination.totalElements = Math.max(0, this.chefPagination.totalElements - 1);
          } else if (userType === 'business') {
            this.waitingBusinesses = [...this.waitingBusinesses.filter(user => user.id !== userId)];
            this.businessPagination.totalElements = Math.max(0, this.businessPagination.totalElements - 1);
          }
          
          this.setSuccessMessage('사용자가 거절되었습니다.');
          return response;
        } else {
          throw new Error(response.message || '사용자 거절에 실패했습니다.');
        }
      } catch (error) {
        console.error('사용자 거절 실패:', error);
        throw error;
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
