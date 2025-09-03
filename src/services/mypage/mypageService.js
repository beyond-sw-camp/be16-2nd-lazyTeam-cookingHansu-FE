import { apiClient } from '../../utils/interceptor';

// API 엔드포인트 상수
const API_ENDPOINTS = {
  PROFILE: '/api/my/profile',
  POSTS: '/api/my/posts',
  LECTURES: '/api/my/lectures',
  SOLD_LECTURES: '/lecture/mylist',
  BOOKMARKED_POSTS: '/api/my/bookmarked-posts',
  LIKED_POSTS: '/api/my/liked-posts',
  LIKED_LECTURES: '/api/my/liked-lectures',
};

export const mypageService = {
  // 프로필 수정
  async updateProfile(profileData) {
    const response = await apiClient.put(API_ENDPOINTS.PROFILE, profileData);
    return response.data;
  },

  // 프로필 이미지 업로드
  async uploadProfileImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post(`${API_ENDPOINTS.PROFILE}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 내 게시글 조회
  async getMyPosts(page = 0, size = 6) {
    const response = await apiClient.get(`${API_ENDPOINTS.POSTS}?page=${page}&size=${size}`);
    return response.data;
  },

  // 내가 구매한 강의 목록 조회
  async getMyLectures(page = 0, size = 6) {
    const response = await apiClient.get(`${API_ENDPOINTS.LECTURES}?page=${page}&size=${size}`);
    return response.data;
  },

  // 북마크한 게시글 조회
  async getMyBookmarkedPosts(page = 0, size = 6) {
    const response = await apiClient.get(`${API_ENDPOINTS.BOOKMARKED_POSTS}?page=${page}&size=${size}`);
    return response.data;
  },

  // 좋아요한 게시글 조회
  async getMyLikedPosts(page = 0, size = 6) {
    const response = await apiClient.get(`${API_ENDPOINTS.LIKED_POSTS}?page=${page}&size=${size}`);
    return response.data;
  },

  // 좋아요한 강의 조회
  async getMyLikedLectures(page = 0, size = 6) {
    const response = await apiClient.get(`${API_ENDPOINTS.LIKED_LECTURES}?page=${page}&size=${size}`);
    return response.data;
  },

  // 판매한 강의 조회
  async getSoldLectures(page = 0, size = 6) {
    const response = await apiClient.get(`${API_ENDPOINTS.SOLD_LECTURES}?page=${page}&size=${size}`);
    return response.data;
  },
};
