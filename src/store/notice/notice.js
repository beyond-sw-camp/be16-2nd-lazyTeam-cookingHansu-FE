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

    // 캐싱 시스템
    lastUpdate: null,
    cacheExpiry: 5 * 60 * 1000, // 5분 캐시
    noticeCache: new Map(), // 개별 공지사항 캐시
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

    // 캐시 유효성 검사
    isCacheValid: (state) => {
      if (!state.lastUpdate) return false;
      return Date.now() - state.lastUpdate < state.cacheExpiry;
    },

    // 개별 공지사항 캐시 유효성 검사
    isNoticeCacheValid: (state) => (id) => {
      const cached = state.noticeCache.get(id);
      if (!cached) return false;
      return Date.now() - cached.timestamp < state.cacheExpiry;
    }
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

    // 공지사항 목록 조회 (캐싱 적용)
    async fetchNotices(page = 0, size = 10, forceRefresh = false) {
      // 캐시가 유효하고 강제 새로고침이 아닌 경우 캐시된 데이터 반환
      if (!forceRefresh && this.isCacheValid && page === 0) {
        return this.notices;
      }

      this._setLoading(true);
      this.error = null;
      
      try {
        const response = await noticeService.getNoticeList(page, size);
        
        if (response.success && response.data) {
          const responseData = response.data;
          
          this.notices = responseData.content || [];
          this.pagination = {
            totalPages: responseData.totalPages || 0,
            currentPage: responseData.number || 0,
            totalElements: responseData.totalElements || 0,
            pageSize: size,
          };
        } else {
          throw new Error(response.message || '공지사항 목록을 불러오는데 실패했습니다.');
        }
        
        // 캐시 시간 업데이트
        this.lastUpdate = Date.now();
      } catch (error) {
        this._handleError(error, '공지사항 목록을 불러오는데 실패했습니다.');
      } finally {
        this._setLoading(false);
      }
    },

    // 공지사항 상세 조회 (캐싱 적용)
    async fetchNoticeDetail(id, forceRefresh = false) {
      // 캐시가 유효하고 강제 새로고침이 아닌 경우 캐시된 데이터 반환
      if (!forceRefresh && this.isNoticeCacheValid(id)) {
        this.currentNotice = this.noticeCache.get(id).data;
        return this.currentNotice;
      }

      this._setLoading(true);
      this.error = null;
      
      try {
        const response = await noticeService.getNoticeDetail(id);
        
        if (response.success && response.data) {
          this.currentNotice = response.data;
        } else {
          throw new Error(response.message || '공지사항 상세 정보를 불러오는데 실패했습니다.');
        }
        
        // 개별 공지사항 캐시 업데이트
        this.noticeCache.set(id, {
          data: this.currentNotice,
          timestamp: Date.now()
        });
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
        
        if (response.success && response.data) {
          const newNotice = response.data;
          
          // 새로 생성된 공지사항을 목록 맨 앞에 추가 (API 호출 없이 즉시 반영)
          this.notices.unshift(newNotice);
          
          // 페이지네이션 정보 업데이트
          this.pagination.totalElements += 1;
          
          // 마지막 업데이트 시간 갱신
          this.lastUpdate = Date.now();
          
          // 공지사항 생성 후 알림 생성 및 개수 업데이트 (실시간 반영)
          try {
            // NoticeResDto 구조: { id, title, content, imageUrl, createdAt }
            if (newNotice.id && newNotice.title) {
              const { useNotificationStore } = await import('@/store/notification/notification');
              const notificationStore = useNotificationStore();
              await notificationStore.handleNoticeNotification(newNotice, 'create');
            }
          } catch (error) {
            console.warn('공지사항 알림 생성 실패:', error);
          }
        } else {
          throw new Error(response.message || '공지사항 생성에 실패했습니다.');
        }
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
        const response = await noticeService.updateNotice(id, noticeData);
        
        if (response.success && response.data) {
          const updatedNotice = response.data;
          
          
          // 수정된 공지사항을 목록에서 직접 업데이트 (API 호출 없이 즉시 반영)
          const noticeIndex = this.notices.findIndex(notice => notice.id === id);
          if (noticeIndex !== -1) {
            // 서버에서 반환된 NoticeResDto로 업데이트
            this.notices[noticeIndex] = updatedNotice;
          }
          
          // 현재 공지사항도 업데이트
          if (this.currentNotice && this.currentNotice.id === id) {
            this.currentNotice = updatedNotice;
          }
          
          // 캐시도 업데이트
          if (this.noticeCache.has(id)) {
            this.noticeCache.set(id, {
              data: updatedNotice,
              timestamp: Date.now()
            });
          }
          
          // 공지사항 수정 후 알림 생성 및 개수 업데이트
          try {
            // NoticeResDto 구조: { id, title, content, imageUrl, createdAt }
            if (updatedNotice.id && updatedNotice.title) {
              const { useNotificationStore } = await import('@/store/notification/notification');
              const notificationStore = useNotificationStore();
              await notificationStore.handleNoticeNotification(updatedNotice, 'update');
            } else {
              console.warn('공지사항 수정 응답에 필수 필드가 없습니다:', updatedNotice);
            }
          } catch (error) {
            console.warn('공지사항 알림 생성 실패:', error);
          }
        } else {
          throw new Error(response.message || '공지사항 수정에 실패했습니다.');
        }
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
        
        // 삭제된 공지사항을 목록에서 즉시 제거 (API 호출 없이 즉시 반영)
        const noticeIndex = this.notices.findIndex(notice => notice.id === id);
        if (noticeIndex !== -1) {
          this.notices.splice(noticeIndex, 1);
        }
        
        // 페이지네이션 정보 업데이트
        this.pagination.totalElements = Math.max(0, this.pagination.totalElements - 1);
        
        // 현재 공지사항도 초기화 (삭제된 공지사항이 현재 선택된 경우)
        if (this.currentNotice && this.currentNotice.id === id) {
          this.currentNotice = null;
        }
        
        // 캐시에서도 제거
        if (this.noticeCache.has(id)) {
          this.noticeCache.delete(id);
        }
        
        // 마지막 업데이트 시간 갱신
        this.lastUpdate = Date.now();
        
        // 공지사항 삭제 후 알림 생성 및 개수 업데이트
        try {
          const { useNotificationStore } = await import('@/store/notification/notification');
          const notificationStore = useNotificationStore();
          await notificationStore.handleNoticeNotification({ id, title: '삭제된 공지사항' }, 'delete');
        } catch (error) {
          console.warn('공지사항 알림 생성 실패:', error);
        }
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
      this.lastUpdate = null;
      this.noticeCache.clear();
    },
  },
});
