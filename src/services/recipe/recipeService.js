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
      const response = await apiClient.post('/api/posts/create', recipeData, {
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
      const response = await apiClient.post(`/api/interactions/posts/${recipeId}/likes`);
      return response.data;
    } catch (error) {
      console.error('레시피 좋아요 실패:', error);
      throw error;
    }
  },

  // 레시피 북마크
  async bookmarkRecipe(recipeId) {
    try {
      const response = await apiClient.post(`/api/interactions/posts/${recipeId}/bookmarks`);
      return response.data;
    } catch (error) {
      console.error('레시피 북마크 실패:', error);
      throw error;
    }
  },

  // 댓글 목록 조회
  async getComments(postId) {
    try {
      const response = await apiClient.get(`/post/comment/list/${postId}`);
      return response.data;
    } catch (error) {
      console.error('댓글 목록 조회 실패:', error);
      throw error;
    }
  },

  // 댓글 생성
  async createComment(postId, commentData) {
    try {
      const response = await apiClient.post('/post/comment/create', {
        postId,
        ...commentData
      });
      return response.data;
    } catch (error) {
      console.error('댓글 생성 실패:', error);
      throw error;
    }
  },

  // 댓글 수정
  async updateComment(commentId, commentData) {
    try {
      const response = await apiClient.patch(`/post/comment/update/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      throw error;
    }
  },

  // 댓글 삭제
  async deleteComment(commentId) {
    try {
      const response = await apiClient.delete(`/post/comment/delete/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      throw error;
    }
  },

  // 조회수 증가
  async incrementViews(postId) {
    try {
      const response = await apiClient.post(`/api/interactions/posts/${postId}/views`);
      return response.data;
    } catch (error) {
      console.error('조회수 증가 실패:', error);
      throw error;
    }
  },


};
