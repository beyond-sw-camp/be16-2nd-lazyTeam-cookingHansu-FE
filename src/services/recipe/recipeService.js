import { apiClient } from '@/utils/interceptor';

export const recipeService = {
  // 레시피 목록 조회
  async getRecipeList(params = {}) {
    try {
      let response;
      try {
        response = await apiClient.get('/api/posts', { params });
      } catch (error) {
        console.error('레시피 목록 조회 실패:', error);
      }
      
      // API 응답 데이터를 프론트엔드 형식에 맞게 변환
      const transformedData = {
        ...response.data,
        content: (response.data.content || response.data.data?.content || []).map(post => ({
          id: post.id,
          image: post.thumbnailUrl || '/src/assets/images/smu_mascort1.jpg',
          category: post.category,
          title: post.title,
          authorType: post.user?.role || 'GENERAL',
          description: post.description,
          likes: post.likeCount || 0,
          bookmarks: post.bookmarkCount || 0,
          views: post.viewCount || 0,
          commentCount: post.commentCount || 0,
          time: post.createdAt,
          isLiked: post.isLiked || false,
          isBookmarked: post.isBookmarked || false
        }))
      };
      
      return transformedData;
    } catch (error) {
      console.error('레시피 목록 조회 실패:', error);
      throw error;
    }
  },

  // 레시피 상세 조회
  async getRecipeDetail(recipeId) {
    try {
      const response = await apiClient.get(`/api/posts/${recipeId}`);
      return response.data;
    } catch (error) {
      console.error('레시피 상세 조회 실패:', error);
      throw error;
    }
  },

  // 레시피 생성
  async createRecipe(recipeData) {
    try {
      const response = await apiClient.post('/api/posts', recipeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('레시피 생성 실패:', error);
      throw error;
    }
  },

  // 레시피 수정
  async updateRecipe(recipeId, recipeData) {
    try {
      const response = await apiClient.put(`/api/posts/${recipeId}`, recipeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('레시피 수정 실패:', error);
      throw error;
    }
  },

  // 레시피 삭제
  async deleteRecipe(recipeId) {
    try {
      const response = await apiClient.delete(`/api/posts/${recipeId}`);
      return response.data;
    } catch (error) {
      console.error('레시피 삭제 실패:', error);
      throw error;
    }
  },

  // 레시피 좋아요
  async likeRecipe(recipeId) {
    try {
      const response = await apiClient.post(`/api/posts/${recipeId}/like`);
      return response.data;
    } catch (error) {
      console.error('레시피 좋아요 실패:', error);
      throw error;
    }
  },

  // 레시피 북마크
  async bookmarkRecipe(recipeId) {
    try {
      const response = await apiClient.post(`/api/posts/${recipeId}/bookmark`);
      return response.data;
    } catch (error) {
      console.error('레시피 북마크 실패:', error);
      throw error;
    }
  }
};
