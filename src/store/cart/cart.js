import { defineStore } from 'pinia'
import { cartService } from '@/services/cart/cartService.js'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
    serverCartItems: [], // 서버에서 가져온 장바구니 아이템들
    isLoading: false
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

    // 서버에서 장바구니 목록 가져오기
    async fetchServerCartList() {
      console.log('장바구니 스토어: 서버에서 장바구니 목록 가져오기 시작')
      this.isLoading = true
      try {
        console.log('장바구니 스토어: cartService.getCartList() 호출')
        const cartItems = await cartService.getCartList()
        console.log('장바구니 스토어: 서버에서 받은 데이터:', cartItems)
        this.serverCartItems = cartItems || []
        console.log('장바구니 스토어: serverCartItems 업데이트 완료:', this.serverCartItems)
        return cartItems
      } catch (error) {
        console.error('장바구니 스토어: 서버 장바구니 목록 가져오기 실패:', error)
        this.serverCartItems = []
        throw error
      } finally {
        this.isLoading = false
        console.log('장바구니 스토어: 로딩 상태 해제')
      }
    }
  }
})
