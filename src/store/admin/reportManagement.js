import { defineStore } from 'pinia';
import { reportManagementService } from '../../services/admin/reportManagementService';

export const useReportManagementStore = defineStore('reportManagement', {
  state: () => ({
    // 신고 데이터
    reports: [],
    
    // UI 상태
    loading: false,
    error: null, // 네트워크 연결 오류
    successMessage: null,
    loadError: null, // 데이터 로딩 API 오류
    
    // 개별 신고 로딩 상태
    processingReports: new Set(),
    
    // 페이지네이션
    pagination: {
      totalPages: 0,
      currentPage: 0,
      totalElements: 0,
      pageSize: 10,
    },
  }),

  getters: {
    // 신고 목록
    getReports: (state) => state.reports,
    
    // UI 상태
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSuccessMessage: (state) => state.successMessage,
    getLoadError: (state) => state.loadError,
    
    // 개별 신고 로딩 상태
    isReportProcessing: (state) => (reportId) => state.processingReports.has(reportId),
    
    // 페이지네이션 정보
    getPaginationInfo: (state) => state.pagination,
    
    // 유틸리티 getters
    hasReports: (state) => state.reports.length > 0,
    getTotalReportCount: (state) => state.reports.length,
  },

  actions: {
    // 에러 처리 헬퍼 - 네트워크 에러는 전체 UI 에러로, API 에러는 throw만
    _handleError(error, defaultMessage) {
      console.error(defaultMessage, error);
      
      // 네트워크 연결 오류인지 확인 (api.js에서 처리된 메시지)
      if (error.message && (error.message.includes('서버와의 연결') || error.message.includes('네트워크 연결'))) {
        this.error = error.message;
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

    // 신고 목록 조회
    async fetchReports(page = 0, size = 10) {
      this._setLoading(true);
      this.error = null;
      this.loadError = null;
      
      try {
        const apiResponse = await reportManagementService.getReportList(page, size);
        const responseData = apiResponse.getData();
        
        this.reports = responseData.content;
        this.pagination = {
          totalPages: responseData.totalPages,
          currentPage: responseData.number,
          totalElements: responseData.totalElements,
          pageSize: size,
        };
      } catch (error) {
        console.error('신고 목록을 불러오는데 실패했습니다.', error);
        
        // 네트워크 연결 오류인지 확인 (api.js에서 처리된 메시지)
        if (error.message && (error.message.includes('서버와의 연결') || error.message.includes('네트워크 연결'))) {
          this.error = error.message;
        } else {
          // API 에러는 loadError에 저장하고 빈 목록 표시
          this.loadError = error.message || '신고 목록을 불러오는데 실패했습니다.';
          this.reports = [];
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

    // 신고 승인
    async approveReport(reportId) {
      this.processingReports.add(reportId);
      
      try {
        await reportManagementService.approveReport(reportId);
        this.setSuccessMessage('신고가 승인되었습니다.');
        
        // 로컬 상태만 업데이트 (API 재호출 없음)
        this.reports = this.reports.filter(report => report.id !== reportId);
        
        // 페이지네이션 정보 업데이트
        this.pagination.totalElements = Math.max(0, this.pagination.totalElements - 1);
      } catch (error) {
        this._handleError(error, '신고 승인에 실패했습니다.');
      } finally {
        this.processingReports.delete(reportId);
      }
    },

    // 신고 거절
    async rejectReport(reportId, rejectReason) {
      this.processingReports.add(reportId);
      
      try {
        await reportManagementService.rejectReport(reportId, rejectReason);
        this.setSuccessMessage('신고가 거절되었습니다.');
        
        // 로컬 상태만 업데이트 (API 재호출 없음)
        this.reports = this.reports.filter(report => report.id !== reportId);
        
        // 페이지네이션 정보 업데이트
        this.pagination.totalElements = Math.max(0, this.pagination.totalElements - 1);
      } catch (error) {
        this._handleError(error, '신고 거절에 실패했습니다.');
      } finally {
        this.processingReports.delete(reportId);
      }
    },

    // 에러 초기화
    clearError() {
      this.error = null;
    },

    // 전체 상태 초기화
    reset() {
      this.reports = [];
      this.loading = false;
      this.error = null;
      this.successMessage = null;
      this.loadError = null;
      this.processingReports.clear();
      this.pagination = {
        totalPages: 0,
        currentPage: 0,
        totalElements: 0,
        pageSize: 10,
      };
    },
  },
});
