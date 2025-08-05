<template>
  <div class="cart-page">
    <Header />
    
    <div class="cart-container">
      <div class="cart-header">
        <h1>장바구니</h1>
        <p class="cart-count">총 {{ cartStore.cartCount }}개의 강의</p>
      </div>

      <div v-if="cartStore.cartCount === 0" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2>장바구니가 비어있습니다</h2>
        <p>강의를 추가해보세요!</p>
        <button class="browse-btn" @click="$router.push('/lectures')">강의 둘러보기</button>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id" 
            class="cart-item"
          >
            <div class="item-image">
              <img :src="item.thumbnailUrl" :alt="item.title" />
            </div>
            <div class="item-info">
              <h3>{{ item.title }}</h3>
              <p class="teacher">{{ item.teacher }}</p>
              <div class="item-meta">
                <span class="category">{{ item.category }}</span>
                <span class="level">{{ item.level }}</span>
              </div>
            </div>
            <div class="item-price">
              <span class="price">{{ item.price.toLocaleString() }}원</span>
              <button class="remove-btn" @click="removeFromCart(item.id)">삭제</button>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-item">
            <span>총 강의 수</span>
            <span>{{ cartStore.cartCount }}개</span>
          </div>
          <div class="summary-item total">
            <span>총 금액</span>
            <span>{{ cartStore.totalPrice.toLocaleString() }}원</span>
          </div>
          <button class="checkout-btn" @click="checkout">결제하기</button>
          <button class="clear-btn" @click="clearCart">장바구니 비우기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import { useCartStore } from '@/store/cart.js';

export default {
  name: 'CartPage',
  components: { Header },
  data() {
    return {
      cartStore: null
    };
  },
  mounted() {
    this.cartStore = useCartStore();
  },
  methods: {
    removeFromCart(lectureId) {
      const result = this.cartStore.removeFromCart(lectureId);
      alert(result.message);
    },
    
    clearCart() {
      if (confirm('장바구니를 비우시겠습니까?')) {
        this.cartStore.clearCart();
        alert('장바구니가 비워졌습니다.');
      }
    },
    
    checkout() {
      if (this.cartStore.cartCount === 0) {
        alert('장바구니가 비어있습니다.');
        return;
      }
      
      alert(`총 ${this.cartStore.totalPrice.toLocaleString()}원의 강의를 결제합니다.\n\n(실제 구현에서는 결제 페이지로 이동합니다.)`);
    }
  }
};
</script>

<style scoped>
.cart-page {
  background: #fafbfc;
  min-height: 100vh;
  margin-top: 64px;
}

.cart-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.cart-header {
  text-align: center;
  margin-bottom: 40px;
}

.cart-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px 0;
}

.cart-count {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-cart-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-cart h2 {
  font-size: 24px;
  font-weight: 600;
  color: #222;
  margin: 0 0 12px 0;
}

.empty-cart p {
  color: #666;
  margin: 0 0 32px 0;
}

.browse-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
}

.browse-btn:hover {
  background: #e65c00;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}

.cart-items {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.cart-item {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.teacher {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.item-meta {
  display: flex;
  gap: 8px;
}

.category, .level {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.category {
  background: #e8f5e8;
  color: #2d5a2d;
}

.level {
  background: #e3f2fd;
  color: #1565c0;
}

.item-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.price {
  font-size: 18px;
  font-weight: 700;
  color: #ff7a00;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.remove-btn:hover {
  background: #c82333;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: fit-content;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  font-size: 18px;
  font-weight: 700;
  color: #ff7a00;
  border-top: 2px solid #eee;
  border-bottom: none;
  margin-top: 16px;
  padding-top: 16px;
}

.checkout-btn {
  width: 100%;
  background: #ff7a00;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}

.checkout-btn:hover {
  background: #e65c00;
}

.clear-btn {
  width: 100%;
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.clear-btn:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .cart-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .item-price {
    align-items: flex-start;
  }
}
</style> 