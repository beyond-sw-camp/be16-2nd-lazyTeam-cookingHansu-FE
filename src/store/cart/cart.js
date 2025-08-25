import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cartItems') || '[]')
  }),

  getters: {
    cartCount: (state) => state.items.length,
    
    totalAmount: (state) => {
      return state.items.reduce((total, item) => total + item.price, 0)
    },

    isInCart: (state) => (lectureId) => {
      return state.items.some(item => item.id === lectureId)
    }
  },

  actions: {
    addToCart(lecture) {
      // 중복 체크
      if (this.isInCart(lecture.id)) {
        return false
      }

      // 장바구니에 추가
      this.items.push({
        id: lecture.id,
        title: lecture.title,
        price: lecture.price,
        thumbnailUrl: lecture.image || lecture.thumbUrl, // image 또는 thumbUrl 필드를 thumbnailUrl로 저장
        instructor: lecture.teacher || lecture.instructor?.name || '강사명' // teacher 또는 instructor.name 필드를 instructor로 저장
      })

      // localStorage에 저장
      this.saveToLocalStorage()
      return true
    },

    removeFromCart(lectureId) {
      const index = this.items.findIndex(item => item.id === lectureId)
      if (index > -1) {
        this.items.splice(index, 1)
        // localStorage에 저장
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    // 여러 아이템을 한 번에 제거
    removeMultipleFromCart(lectureIds) {
      let removedCount = 0
      lectureIds.forEach(id => {
        if (this.removeFromCart(id)) {
          removedCount++
        }
      })
      return removedCount
    },

    clearCart() {
      this.items = []
      // localStorage에서 삭제
      localStorage.removeItem('cartItems')
    },

    saveToLocalStorage() {
      localStorage.setItem('cartItems', JSON.stringify(this.items))
    }
  }
})
