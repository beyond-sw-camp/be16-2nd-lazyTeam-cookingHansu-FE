import { defineStore } from 'pinia';
import { userManagementService } from '../../services/admin/userManagementService';

export const useUserManagementStore = defineStore('userManagement', {
  state: () => ({
    // 사용자 목록 데이터
    userList: [],
    
    // UI 상태
    loading: false,
    error: null, // 네트워크 연결 오류
    successMessage: null,
    loadError: null, // 데이터 로딩 API 오류
    
    // 페이지네이션
    pagination: {
      totalPages: 0,
      currentPage: 0,
      totalElements: 0,
      pageSize: 10,
    },
  }),

  getters: {
    // 사용자 목록
    getUserList: (state) => state.userList,
    
    // UI 상태
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSuccessMessage: (state) => state.successMessage,
    getLoadError: (state) => state.loadError,
    
    // 페이지네이션 정보
    getPaginationInfo: (state) => state.pagination,
    
    // 유틸리티 getters
    hasUsers: (state) => state.userList.length > 0,
    getTotalUserCount: (state) => state.pagination.totalElements,
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

    // 사용자 목록 조회
    async fetchUserList(page = 0, size = 10) {
      this._setLoading(true);
      this.error = null;
      this.loadError = null;
      
      try {
        const apiResponse = await userManagementService.getUserList(page, size);
        const responseData = apiResponse.getData();
        
        this.userList = responseData.content;
        this.pagination = {
          totalPages: responseData.totalPages,
          currentPage: responseData.number,
          totalElements: responseData.totalElements,
          pageSize: size,
        };
      } catch (error) {
        console.error('사용자 목록을 불러오는데 실패했습니다.', error);
        
        // 네트워크 연결 오류인지 확인 (api.js에서 처리된 메시지)
        if (error.message && (error.message.includes('서버와의 연결') || error.message.includes('네트워크 연결'))) {
          this.error = error.message;
        } else {
          // API 에러는 loadError에 저장하고 빈 목록 표시
          this.loadError = error.message || '사용자 목록을 불러오는데 실패했습니다.';
          this.userList = [];
          this.pagination = {
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

    // 사용자 활성화
    async activateUser(userId) {
      this._setLoading(true);
      
      try {
        await userManagementService.activateUser(userId);
        this.setSuccessMessage('사용자가 활성화되었습니다.');
        // 활성화 후 목록 새로고침
        await this.fetchUserList(this.pagination.currentPage, this.pagination.pageSize);
      } catch (error) {
        this._handleError(error, '사용자 활성화에 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 사용자 비활성화
    async inactiveUser(userId) {
      this._setLoading(true);
      
      try {
        await userManagementService.inactiveUser(userId);
        this.setSuccessMessage('사용자가 비활성화되었습니다.');
        // 비활성화 후 목록 새로고침
        await this.fetchUserList(this.pagination.currentPage, this.pagination.pageSize);
      } catch (error) {
        this._handleError(error, '사용자 비활성화에 실패했습니다.');
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
      this.userList = [];
      this.loading = false;
      this.error = null;
      this.successMessage = null;
      this.loadError = null;
      this.pagination = {
        totalPages: 0,
        currentPage: 0,
        totalElements: 0,
        pageSize: 10,
      };
    },
  },
});
