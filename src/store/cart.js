import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  
  getters: {
    // 장바구니에 있는 강의 개수
    cartCount: (state) => state.items.length,
    
    // 장바구니 총 금액
    totalPrice: (state) => state.items.reduce((total, item) => total + item.price, 0),
    
    // 특정 강의가 장바구니에 있는지 확인
    isInCart: (state) => (lectureId) => {
      return state.items.some(item => item.id === lectureId);
    }
  },
  
  actions: {
    // 강의를 장바구니에 추가
    addToCart(lecture) {
      // 이미 장바구니에 있는지 확인
      if (this.isInCart(lecture.id)) {
        return { success: false, message: '이미 장바구니에 있는 강의입니다.' };
      }
      
      // 장바구니에 추가할 강의 데이터 구조
      const cartItem = {
        id: lecture.id,
        title: lecture.title,
        price: lecture.price,
        teacher: lecture.teacher || lecture.instructor?.name,
        thumbnailUrl: lecture.image,
        category: lecture.category,
        level: lecture.level,
        addedAt: new Date().toISOString()
      };
      
      this.items.push(cartItem);
      
      return { success: true, message: '해당 강의가 장바구니에 추가되었습니다!' };
    },
    
    // 장바구니에서 강의 제거
    removeFromCart(lectureId) {
      const index = this.items.findIndex(item => item.id === lectureId);
      if (index > -1) {
        this.items.splice(index, 1);
        return { success: true, message: '강의가 장바구니에서 제거되었습니다.' };
      }
      return { success: false, message: '장바구니에서 해당 강의를 찾을 수 없습니다.' };
    },
    
    // 장바구니 비우기
    clearCart() {
      this.items = [];
    }
  }
}); 