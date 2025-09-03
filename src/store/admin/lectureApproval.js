import { defineStore } from 'pinia';
import { lectureApprovalService } from '../../services/admin/lectureApprovalService';

export const useLectureApprovalStore = defineStore('lectureApproval', {
  state: () => ({
    // 승인 대기 강의 데이터
    waitingLectures: [],
    
    // UI 상태
    loading: false,
    error: null,
    successMessage: null,
    
    // 개별 강의 로딩 상태
    processingLectures: new Set(),
    
    // 페이지네이션
    pagination: {
      totalPages: 0,
      currentPage: 0,
      totalElements: 0,
      pageSize: 10,
    },
  }),

  getters: {
    // 승인 대기 강의 목록
    getWaitingLectures: (state) => state.waitingLectures,
    
    // UI 상태
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSuccessMessage: (state) => state.successMessage,
    
    // 개별 강의 로딩 상태
    isLectureProcessing: (state) => (lectureId) => state.processingLectures.has(lectureId),
    
    // 페이지네이션 정보
    getPaginationInfo: (state) => state.pagination,
    
    // 유틸리티 getters
    hasWaitingLectures: (state) => state.waitingLectures.length > 0,
    getTotalWaitingCount: (state) => state.waitingLectures.length,
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

    // 승인 대기 강의 목록 조회
    async fetchWaitingLectures(page = 0, size = 10) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await lectureApprovalService.getWaitingLectures(page, size);
        
        if (response.success && response.data) {
          const responseData = response.data;
          
          this.waitingLectures = responseData.content || [];
          this.pagination = {
            totalPages: responseData.totalPages || 0,
            currentPage: responseData.number || 0,
            totalElements: responseData.totalElements || 0,
            pageSize: size,
          };
        } else {
          throw new Error(response.message || '강의 목록을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('승인 대기 강의 목록 조회 실패:', error);
        this.error = error.message || '강의 목록을 불러오는데 실패했습니다.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 강의 승인
    async approveLecture(lectureId) {
      this.processingLectures.add(lectureId);
      
      try {
        const response = await lectureApprovalService.approveLecture(lectureId);
        
        if (response.success) {
          // 승인된 강의를 목록에서 제거 (반응성을 위해 새 배열 생성)
          this.waitingLectures = [...this.waitingLectures.filter(lecture => lecture.id !== lectureId)];
          
          // 페이지네이션 정보 업데이트
          this.pagination.totalElements = Math.max(0, this.pagination.totalElements - 1);
          
          this.setSuccessMessage('강의가 승인되었습니다.');
          return response;
        } else {
          throw new Error(response.message || '강의 승인에 실패했습니다.');
        }
      } catch (error) {
        console.error('강의 승인 실패:', error);
        throw error;
      } finally {
        this.processingLectures.delete(lectureId);
      }
    },

    // 강의 거절
    async rejectLecture(lectureId, rejectReason) {
      this.processingLectures.add(lectureId);
      
      try {
        const response = await lectureApprovalService.rejectLecture(lectureId, rejectReason);
        
        if (response.success) {
          // 거절된 강의를 목록에서 제거 (반응성을 위해 새 배열 생성)
          this.waitingLectures = [...this.waitingLectures.filter(lecture => lecture.id !== lectureId)];
          
          // 페이지네이션 정보 업데이트
          this.pagination.totalElements = Math.max(0, this.pagination.totalElements - 1);
          
          this.setSuccessMessage('강의가 거절되었습니다.');
          return response;
        } else {
          throw new Error(response.message || '강의 거절에 실패했습니다.');
        }
      } catch (error) {
        console.error('강의 거절 실패:', error);
        throw error;
      } finally {
        this.processingLectures.delete(lectureId);
      }
    },

    // 에러 초기화
    clearError() {
      this.error = null;
    },

    // 전체 상태 초기화
    reset() {
      this.waitingLectures = [];
      this.loading = false;
      this.error = null;
      this.successMessage = null;
      this.processingLectures.clear();
      this.pagination = {
        totalPages: 0,
        currentPage: 0,
        totalElements: 0,
        pageSize: 10,
      };
    },
  },
});
