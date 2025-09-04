import { defineStore } from 'pinia';
import { userManagementService } from '../../services/admin/userManagementService';

export const useUserManagementStore = defineStore('userManagement', {
  state: () => ({
    // 사용자 목록 데이터
    userList: [],
    
    // UI 상태
    loading: false,
    error: null,
    successMessage: null,
    
    // 개별 사용자 로딩 상태
    loadingUsers: new Set(),
    
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
    
    // 페이지네이션 정보
    getPaginationInfo: (state) => state.pagination,
    
    // 유틸리티 getters
    hasUsers: (state) => state.userList.length > 0,
    getTotalUserCount: (state) => state.pagination.totalElements,
    
    // 특정 사용자의 로딩 상태 확인
    isUserLoading: (state) => (userId) => state.loadingUsers.has(userId),
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
      
      try {
        const response = await userManagementService.getUserList(page, size);
        
        if (response.success && response.data) {
          const responseData = response.data;
          
          this.userList = responseData.content || [];
          this.pagination = {
            totalPages: responseData.totalPages || 0,
            currentPage: responseData.number || 0,
            totalElements: responseData.totalElements || 0,
            pageSize: size,
          };
        } else {
          throw new Error(response.message || '사용자 목록을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('사용자 목록을 불러오는데 실패했습니다.', error);
        
        this.error = error.message || '사용자 목록을 불러오는데 실패했습니다.';
        this.userList = [];
        this.pagination = {
          totalPages: 0,
          currentPage: 0,
          totalElements: 0,
          pageSize: size,
        };
      } finally {
        this._setLoading(false);
      }
    },

    // 사용자 활성화
    async activateUser(userId) {
      // 개별 사용자 로딩 상태 설정
      this.loadingUsers.add(userId);
      
      try {
        await userManagementService.activateUser(userId);
        this.setSuccessMessage('사용자가 활성화되었습니다.');
        
        // 로컬 상태만 업데이트 (API 재호출 없음)
        const userIndex = this.userList.findIndex(user => user.userId === userId);
        if (userIndex !== -1) {
          this.userList[userIndex].loginStatus = 'ACTIVE';
        }
      } catch (error) {
        this._handleError(error, '사용자 활성화에 실패했습니다.');
      } finally {
        // 개별 사용자 로딩 상태 해제
        this.loadingUsers.delete(userId);
      }
    },

    // 사용자 비활성화
    async inactiveUser(userId) {
      // 개별 사용자 로딩 상태 설정
      this.loadingUsers.add(userId);
      
      try {
        await userManagementService.inactiveUser(userId);
        this.setSuccessMessage('사용자가 비활성화되었습니다.');
        
        // 로컬 상태만 업데이트 (API 재호출 없음)
        const userIndex = this.userList.findIndex(user => user.userId === userId);
        if (userIndex !== -1) {
          this.userList[userIndex].loginStatus = 'INACTIVE';
        }
      } catch (error) {
        this._handleError(error, '사용자 비활성화에 실패했습니다.');
      } finally {
        // 개별 사용자 로딩 상태 해제
        this.loadingUsers.delete(userId);
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
      this.loadingUsers.clear();
      this.pagination = {
        totalPages: 0,
        currentPage: 0,
        totalElements: 0,
        pageSize: 10,
      };
    },
  },
});
