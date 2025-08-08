import { defineStore } from 'pinia';
import { dashboardService } from '../../services/admin/dashboardService';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    // 대시보드 데이터
    dashboardData: {
      waitingLectures: 0,
      waitingApprovalUsers: 0,
      totalLectures: 0,
      totalUsers: 0,
    },
    
    // UI 상태
    loading: false,
    error: null,
  }),

  getters: {
    // 대시보드 데이터
    getDashboardData: (state) => state.dashboardData,
    
    // 개별 데이터 getters
    getWaitingLectures: (state) => state.dashboardData.waitingLectures,
    getWaitingApprovalUsers: (state) => state.dashboardData.waitingApprovalUsers,
    getTotalLectures: (state) => state.dashboardData.totalLectures,
    getTotalUsers: (state) => state.dashboardData.totalUsers,
    
    // UI 상태
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    // 유틸리티 getters
    hasPendingApprovals: (state) => 
      state.dashboardData.waitingLectures > 0 || state.dashboardData.waitingApprovalUsers > 0,
    
    getTotalPendingCount: (state) => 
      state.dashboardData.waitingLectures + state.dashboardData.waitingApprovalUsers,
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

    // 대시보드 데이터 조회
    async fetchDashboardData() {
      this._setLoading(true);
      this.error = null;
      
      try {
        const apiResponse = await dashboardService.getDashboardData();
        this.dashboardData = apiResponse.getData();
      } catch (error) {
        this._handleError(error, '대시보드 데이터를 불러오는데 실패했습니다.');
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
      this.dashboardData = {
        waitingLectures: 0,
        waitingApprovalUsers: 0,
        totalLectures: 0,
        totalUsers: 0,
      };
      this.loading = false;
      this.error = null;
    },
  },
});
