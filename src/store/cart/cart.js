import { defineStore } from 'pinia'
import { cartService } from '@/services/cart/cartService.js'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
    serverCartItems: [], // 서버에서 가져온 장바구니 아이템들
    isLoading: false,
    lastUpdate: null,
    cacheExpiry: 2 * 60 * 1000 // 2분 캐시
  }),

  getters: {
    cartCount: (state) => state.items.length,
    
    // 서버 장바구니 개수
    serverCartCount: (state) => state.serverCartItems.length,
    
    totalAmount: (state) => {
      return state.items.reduce((total, item) => total + item.price, 0)
    },

    isInCart: (state) => (itemId) => {
      return state.items.some(item => item.id === itemId)
    },

    // 캐시 유효성 검사
    isCacheValid: (state) => {
      if (!state.lastUpdate) return false;
      return Date.now() - state.lastUpdate < state.cacheExpiry;
    }
  },

  actions: {
    addToCart(item) {
      if (!this.isInCart(item.id)) {
        this.items.push(item)
        this.saveToLocalStorage()
      }
    },

    removeFromCart(itemId) {
      this.items = this.items.filter(item => item.id !== itemId)
      this.saveToLocalStorage()
    },

    clearCart() {
      this.items = []
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('cartItems', JSON.stringify(this.items))
    },

    // 서버에서 장바구니 목록 가져오기 (캐싱 적용)
    async fetchServerCartList(forceRefresh = false) {
      // 캐시가 유효하고 강제 새로고침이 아닌 경우 캐시된 데이터 반환
      if (!forceRefresh && this.isCacheValid) {
        return this.serverCartItems;
      }

      this.isLoading = true
      try {
        const cartItems = await cartService.getCartList()
        this.serverCartItems = cartItems || []
        this.lastUpdate = Date.now() // 캐시 시간 업데이트
        return cartItems
      } catch (error) {
        console.error('장바구니 스토어: 서버 장바구니 목록 가져오기 실패:', error)
        this.serverCartItems = []
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 개별 아이템 추가 (API 호출 없이 상태만 업데이트)
    updateCartItem(lectureId, isRemoved = false) {
      if (isRemoved) {
        // 장바구니에서 제거된 경우
        this.serverCartItems = this.serverCartItems.filter(item => item.lectureId !== lectureId);
      } else {
        // 장바구니에 추가된 경우 (임시 아이템 추가)
        const existingItem = this.serverCartItems.find(item => item.lectureId === lectureId);
        if (!existingItem) {
          // 임시 아이템 추가 (실제 데이터는 다음 fetchServerCartList에서 업데이트)
          this.serverCartItems.push({ 
            lectureId, 
            id: Date.now(),
            title: '강의 정보 로딩 중...',
            price: 0,
            instructorName: '로딩 중...',
            thumbnailUrl: null
          });
        } 
      }
      this.lastUpdate = Date.now(); // 캐시 무효화
    },

    // 전체 아이템 제거 (API 호출 없이 상태만 업데이트)
    clearAllItems() {
      this.serverCartItems = [];
      this.lastUpdate = Date.now(); // 캐시 무효화
    },

    // 개별 아이템 제거 (API 호출 없이 상태만 업데이트)
    removeCartItem(lectureId) {
      this.serverCartItems = this.serverCartItems.filter(item => item.lectureId !== lectureId);
      this.lastUpdate = Date.now(); // 캐시 무효화
    },

    // 캐시 무효화
    invalidateCache() {
      this.lastUpdate = null;
    }
  }
})
