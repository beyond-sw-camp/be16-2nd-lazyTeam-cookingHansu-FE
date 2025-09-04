import { defineStore } from 'pinia';
import { recipeService } from '../../services/recipe/recipeService';

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    // 레시피 데이터
    recipes: [],
    currentRecipe: null,
    
    // UI 상태
    loading: false,
    error: null,
    
    // 페이지네이션
    pagination: {
      totalPages: 0,
      currentPage: 0,
      totalElements: 0,
      pageSize: 8,
    },

    // 필터링 및 정렬
    filters: {
      role: '',
      category: '',
      sort: 'latest'
    },

    // 캐싱 시스템
    lastUpdate: null,
    cacheExpiry: 5 * 60 * 1000, // 5분 캐시
  }),

  getters: {
    // 레시피 목록
    getRecipes: (state) => state.recipes,
    
    // 현재 선택된 레시피
    getCurrentRecipe: (state) => state.currentRecipe,
    
    // UI 상태
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    // 페이지네이션 정보
    getPaginationInfo: (state) => state.pagination,
    
    // 필터 정보
    getFilters: (state) => state.filters,
    
    // 유틸리티 getters
    hasRecipes: (state) => state.recipes.length > 0,
    getTotalRecipeCount: (state) => state.recipes.length,
    
    // 캐시 유효성 확인
    isCacheValid: (state) => {
      if (!state.lastUpdate) return false;
      return Date.now() - state.lastUpdate < state.cacheExpiry;
    },
  },

  actions: {
    // 에러 처리 헬퍼
    handleError(error, context = '') {
      console.error(`레시피 스토어 오류 ${context}:`, error);
      this.error = error.message || '알 수 없는 오류가 발생했습니다.';
      throw error;
    },

    // 에러 초기화
    clearError() {
      this.error = null;
    },

    // 레시피 목록 조회
    async fetchRecipes(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        // 기본 파라미터 설정
        const defaultParams = {
          page: 0,
          size: this.pagination.pageSize,
          sort: 'createdAt,desc',
          ...this.filters,
          ...params
        };

        console.log('🔍 레시피 목록 조회 시작:', defaultParams);
        
        const response = await recipeService.getRecipeList(defaultParams);
        
        this.recipes = response.content || response.data || [];
        this.pagination = {
          totalPages: response.totalPages || 0,
          currentPage: response.number || 0,
          totalElements: response.totalElements || 0,
          pageSize: response.size || this.pagination.pageSize,
        };
        
        this.lastUpdate = Date.now();
        console.log('✅ 레시피 목록 조회 성공:', this.recipes.length, '개');
        
        return response;
      } catch (error) {
        this.handleError(error, '레시피 목록 조회');
      } finally {
        this.loading = false;
      }
    },

    // 레시피 상세 조회
    async fetchRecipeDetail(recipeId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.getRecipeDetail(recipeId);
        this.currentRecipe = response;
        return response;
      } catch (error) {
        this.handleError(error, '레시피 상세 조회');
      } finally {
        this.loading = false;
      }
    },

    // 레시피 생성
    async createRecipe(recipeData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.createRecipe(recipeData);
        // 새 레시피를 목록에 추가
        this.recipes.unshift(response);
        return response;
      } catch (error) {
        this.handleError(error, '레시피 생성');
      } finally {
        this.loading = false;
      }
    },

    // 레시피 수정
    async updateRecipe(recipeId, recipeData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.updateRecipe(recipeId, recipeData);
        
        // 목록에서 해당 레시피 업데이트
        const index = this.recipes.findIndex(recipe => recipe.id === recipeId);
        if (index !== -1) {
          this.recipes[index] = response;
        }
        
        // 현재 레시피가 수정된 것이라면 업데이트
        if (this.currentRecipe && this.currentRecipe.id === recipeId) {
          this.currentRecipe = response;
        }
        
        return response;
      } catch (error) {
        this.handleError(error, '레시피 수정');
      } finally {
        this.loading = false;
      }
    },

    // 레시피 삭제
    async deleteRecipe(recipeId) {
      this.loading = true;
      this.error = null;

      try {
        await recipeService.deleteRecipe(recipeId);
        
        // 목록에서 해당 레시피 제거
        this.recipes = this.recipes.filter(recipe => recipe.id !== recipeId);
        
        // 현재 레시피가 삭제된 것이라면 초기화
        if (this.currentRecipe && this.currentRecipe.id === recipeId) {
          this.currentRecipe = null;
        }
        
        return true;
      } catch (error) {
        this.handleError(error, '레시피 삭제');
      } finally {
        this.loading = false;
      }
    },

    // 레시피 좋아요 토글
    async toggleRecipeLike(recipeId) {
      try {
        const response = await recipeService.toggleRecipeLike(recipeId);
        
        // 목록에서 해당 레시피의 좋아요 상태 업데이트
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (recipe) {
          recipe.isLiked = response.isLiked;
          recipe.likeCount = response.likeCount;
        }
        
        // 현재 레시피가 좋아요 토글된 것이라면 업데이트
        if (this.currentRecipe && this.currentRecipe.id === recipeId) {
          this.currentRecipe.isLiked = response.isLiked;
          this.currentRecipe.likeCount = response.likeCount;
        }
        
        return response;
      } catch (error) {
        this.handleError(error, '레시피 좋아요 토글');
      }
    },

    // 레시피 북마크 토글
    async toggleRecipeBookmark(recipeId) {
      try {
        const response = await recipeService.toggleRecipeBookmark(recipeId);
        
        // 목록에서 해당 레시피의 북마크 상태 업데이트
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (recipe) {
          recipe.isBookmarked = response.isBookmarked;
        }
        
        // 현재 레시피가 북마크 토글된 것이라면 업데이트
        if (this.currentRecipe && this.currentRecipe.id === recipeId) {
          this.currentRecipe.isBookmarked = response.isBookmarked;
        }
        
        return response;
      } catch (error) {
        this.handleError(error, '레시피 북마크 토글');
      }
    },

    // 레시피 검색
    async searchRecipes(searchTerm, page = 0, size = 8) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.searchRecipes(searchTerm, page, size);
        this.recipes = response.content || response.data || [];
        this.pagination = {
          totalPages: response.totalPages || 0,
          currentPage: response.number || 0,
          totalElements: response.totalElements || 0,
          pageSize: response.size || size,
        };
        return response;
      } catch (error) {
        this.handleError(error, '레시피 검색');
      } finally {
        this.loading = false;
      }
    },

    // 필터 설정
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
    },

    // 필터 초기화
    clearFilters() {
      this.filters = {
        role: '',
        category: '',
        sort: 'latest'
      };
    },

    // 캐시 무효화
    invalidateCache() {
      this.lastUpdate = null;
    },

    // 상태 초기화
    reset() {
      this.recipes = [];
      this.currentRecipe = null;
      this.loading = false;
      this.error = null;
      this.pagination = {
        totalPages: 0,
        currentPage: 0,
        totalElements: 0,
        pageSize: 8,
      };
      this.filters = {
        role: '',
        category: '',
        sort: 'latest'
      };
      this.lastUpdate = null;
    }
  }
});
