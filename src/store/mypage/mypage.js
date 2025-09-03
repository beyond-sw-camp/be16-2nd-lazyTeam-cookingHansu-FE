import { defineStore } from 'pinia';
import { mypageService } from '../../services/mypage/mypageService';

export const useMypageStore = defineStore('mypage', {
  state: () => ({
    // 프로필 데이터
    userProfile: {
      nickname: '',
      email: '',
      info: '',
      picture: null, // 백엔드 DTO의 picture 필드 사용
      userType: ''
    },
    
    // 게시글 데이터
    myPosts: [],
    myPostsPagination: {
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      size: 6
    },
    
    // 강의 데이터
    myLectures: [],
    myLecturesPagination: {
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      size: 6
    },
    myLikedLectures: [],
    myLikedLecturesPagination: {
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      size: 6
    },
    
    // 북마크/좋아요 데이터
    bookmarkedPosts: [],
    bookmarkedPostsPagination: {
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      size: 6
    },
    likedPosts: [],
    likedPostsPagination: {
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      size: 6
    },
    
    // UI 상태
    loading: false,
    error: null,
    successMessage: null,
    
    // 개별 로딩 상태
    loadingProfile: false,
    loadingPosts: false,
    loadingLectures: false,
  }),

  getters: {
    // 프로필 관련
    getUserProfile: (state) => state.userProfile,
    isProfileLoading: (state) => state.loadingProfile,
    
    // 게시글 관련
    getMyPosts: (state) => state.myPosts,
    isPostsLoading: (state) => state.loadingPosts,
    hasPosts: (state) => state.myPosts.length > 0,
    
    // 강의 관련
    getMyLectures: (state) => state.myLectures,
    getMyLikedLectures: (state) => state.myLikedLectures,
    isLecturesLoading: (state) => state.loadingLectures,
    hasLectures: (state) => state.myLectures.length > 0,
    
    // 북마크/좋아요 관련
    getBookmarkedPosts: (state) => state.bookmarkedPosts,
    getLikedPosts: (state) => state.likedPosts,
    hasBookmarks: (state) => state.bookmarkedPosts.length > 0,
    hasLikes: (state) => state.likedPosts.length > 0,
    
    // UI 상태
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSuccessMessage: (state) => state.successMessage,
  },

  actions: {
    // 에러 처리 헬퍼
    _handleError(error, defaultMessage) {
      console.error(defaultMessage, error);
      
      // 네트워크 연결 오류인지 확인
      if (error.message && (error.message.includes('서버와의 연결') || error.message.includes('네트워크 연결'))) {
        this.error = error.message || defaultMessage;
      }
      
      throw error;
    },

    // 성공 메시지 설정
    setSuccessMessage(message) {
      this.successMessage = message;
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    },

    // 메시지 초기화
    clearMessages() {
      this.successMessage = null;
      this.error = null;
    },



    // 프로필 수정
    async updateProfile(profileData) {
      this.loadingProfile = true;
      this.error = null;
      
      try {
        const response = await mypageService.updateProfile(profileData);
        
        if (response.success && response.data) {
          this.userProfile = { ...this.userProfile, ...response.data };
          this.setSuccessMessage('프로필이 성공적으로 수정되었습니다.');
        } else {
          throw new Error(response.message || '프로필 수정에 실패했습니다.');
        }
      } catch (error) {
        this._handleError(error, '프로필 수정 실패');
        throw error;
      } finally {
        this.loadingProfile = false;
      }
    },

    // 프로필 이미지 업로드
    async uploadProfileImage(imageFile) {
      this.loadingProfile = true;
      this.error = null;
      
      try {
        const response = await mypageService.uploadProfileImage(imageFile);
        
        if (response.success && response.data) {
          this.userProfile.picture = response.data.picture; // 백엔드 DTO의 picture 필드 사용
          this.setSuccessMessage('프로필 이미지가 성공적으로 업로드되었습니다.');
        } else {
          throw new Error(response.message || '프로필 이미지 업로드에 실패했습니다.');
        }
      } catch (error) {
        this._handleError(error, '프로필 이미지 업로드 실패');
        throw error;
      } finally {
        this.loadingProfile = false;
      }
    },

    // 내 게시글 조회
    async fetchMyPosts(page = 0, size = 6) {
      this.loadingPosts = true;
      this.error = null;
      
      try {
        const response = await mypageService.getMyPosts(page, size);
        
        if (response.success && response.data) {
          this.myPosts = response.data.content || [];
          this.myPostsPagination = {
            currentPage: response.data.number || 0,
            totalPages: response.data.totalPages || 0,
            totalElements: response.data.totalElements || 0,
            size: response.data.size || size
          };
          
          console.log(`🔍 내 게시글: ${this.myPosts.length}개, 총 ${this.myPostsPagination.totalElements}개`);
        } else {
          throw new Error(response.message || '게시글을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        this._handleError(error, '게시글 조회 실패');
        throw error;
      } finally {
        this.loadingPosts = false;
      }
    },

    // 내가 구매한 강의 조회
    async fetchMyLectures(page = 0, size = 6) {
      this.loadingLectures = true;
      this.error = null;
      
      try {
        const response = await mypageService.getMyLectures(page, size);
        
        if (response.success && response.data) {
          this.myLectures = response.data.content || [];
          this.myLecturesPagination = {
            currentPage: response.data.number || 0,
            totalPages: response.data.totalPages || 0,
            totalElements: response.data.totalElements || 0,
            size: response.data.size || size
          };
          
          console.log(`🔍 내 강의: ${this.myLectures.length}개, 총 ${this.myLecturesPagination.totalElements}개`);
        } else {
          throw new Error(response.message || '강의를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        this._handleError(error, '강의 조회 실패');
        throw error;
      } finally {
        this.loadingLectures = false;
      }
    },

    // 북마크한 게시글 조회
    async fetchBookmarkedPosts(page = 0, size = 6) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await mypageService.getMyBookmarkedPosts(page, size);
        
        if (response.success && response.data) {
          this.bookmarkedPosts = response.data.content || [];
          this.bookmarkedPostsPagination = {
            currentPage: response.data.number || 0,
            totalPages: response.data.totalPages || 0,
            totalElements: response.data.totalElements || 0,
            size: response.data.size || size
          };
          
          console.log(`🔍 북마크: ${this.bookmarkedPosts.length}개, 총 ${this.bookmarkedPostsPagination.totalElements}개`);
        } else {
          throw new Error(response.message || '북마크한 게시글을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        this._handleError(error, '북마크한 게시글 조회 실패');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 좋아요한 게시글 조회
    async fetchLikedPosts(page = 0, size = 6) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await mypageService.getMyLikedPosts(page, size);
        
        if (response.success && response.data) {
          this.likedPosts = response.data.content || [];
          this.likedPostsPagination = {
            currentPage: response.data.number || 0,
            totalPages: response.data.totalPages || 0,
            totalElements: response.data.totalElements || 0,
            size: response.data.size || size
          };
          
          console.log(`🔍 좋아요: ${this.likedPosts.length}개, 총 ${this.likedPostsPagination.totalElements}개`);
        } else {
          throw new Error(response.message || '좋아요한 게시글을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        this._handleError(error, '좋아요한 게시글 조회 실패');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 좋아요한 강의 조회
    async fetchLikedLectures(page = 0, size = 6) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await mypageService.getMyLikedLectures(page, size);
        
        if (response.success && response.data) {
          this.myLikedLectures = response.data.content || [];
          this.myLikedLecturesPagination = {
            currentPage: response.data.number || 0,
            totalPages: response.data.totalPages || 0,
            totalElements: response.data.totalElements || 0,
            size: response.data.size || size
          };
          
          console.log(`🔍 강의 좋아요: ${this.myLikedLectures.length}개, 총 ${this.myLikedLecturesPagination.totalElements}개`);
        } else {
          throw new Error(response.message || '좋아요한 강의를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        this._handleError(error, '좋아요한 강의 조회 실패');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 전체 상태 초기화
    reset() {
      this.userProfile = {
        nickname: '',
        email: '',
        info: '',
        picture: null, // 백엔드 DTO의 picture 필드 사용
        userType: ''
      };
      this.myPosts = [];
      this.myLectures = [];
      this.myLikedLectures = [];
      this.bookmarkedPosts = [];
      this.likedPosts = [];
      this.loading = false;
      this.loadingProfile = false;
      this.loadingPosts = false;
      this.loadingLectures = false;
      this.error = null;
      this.successMessage = null;
    },
  },
});
