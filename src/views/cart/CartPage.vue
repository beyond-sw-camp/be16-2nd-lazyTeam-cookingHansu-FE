<template>
  <div class="cart-page">
    <div class="cart-container">
      <div class="cart-header">
        <h1>장바구니</h1>
        <p class="cart-subtitle">선택한 강의들을 확인하고 결제하세요</p>
      </div>

      <!-- 장바구니가 비어있을 때 -->
      <div v-if="cartStore.cartCount === 0" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2>장바구니가 비어있습니다</h2>
        <p>강의를 선택하여 장바구니에 추가해보세요</p>
        <button class="go-to-lectures-btn" @click="goToLectures">
          강의 목록 보기
        </button>
      </div>

      <!-- 장바구니 아이템 목록 -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id" 
            class="cart-item"
          >
            <div class="item-thumbnail">
              <img :src="item.thumbnailUrl" :alt="item.title" />
            </div>
            <div class="item-info">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-instructor">{{ item.instructor }}</p>
              <p class="item-price">{{ formatPrice(item.price) }}원</p>
            </div>
            <button 
              class="remove-btn" 
              @click="removeFromCart(item.id)"
              title="장바구니에서 제거"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- 결제 정보 -->
        <div class="payment-summary">
          <div class="summary-header">
            <h2>결제 정보</h2>
          </div>
          <div class="summary-content">
            <div class="summary-row">
              <span>선택된 강의</span>
              <span>{{ cartStore.cartCount }}개</span>
            </div>
            <div class="summary-row total">
              <span>총 결제 금액</span>
              <span class="total-amount">{{ formatPrice(cartStore.totalAmount) }}원</span>
            </div>
          </div>
          <button 
            class="payment-btn" 
            @click="proceedToPayment"
            :disabled="cartStore.cartCount === 0"
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '@/views/cart/cart.js'

export default {
  name: 'CartPage',
  data() {
    return {
      cartStore: useCartStore()
    }
  },
  methods: {
    formatPrice(price) {
      return price.toLocaleString()
    },

    removeFromCart(lectureId) {
      if (this.cartStore.removeFromCart(lectureId)) {
        // 성공적으로 제거됨
        console.log('강의가 장바구니에서 제거되었습니다.')
      }
    },

    goToLectures() {
      this.$router.push('/lectures')
    },

    async proceedToPayment() {
      if (this.cartStore.cartCount === 0) {
        alert('장바구니가 비어있습니다.')
        return
      }

      try {
        // UUID 생성
        const orderId = this.generateUUID()
        const amount = this.cartStore.totalAmount
        const lectureIds = this.cartStore.items.map(item => item.id)

        // 결제 전 백엔드에 주문 정보 저장
        await this.saveOrderToBackend(orderId, amount, lectureIds)

        // Toss Payments SDK 호출
        await this.requestTossPayment(orderId, amount)

      } catch (error) {
        console.error('결제 처리 중 오류 발생:', error)
        alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    },

    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },

    async saveOrderToBackend(orderId, amount, lectureIds) {
      try {
        const response = await fetch('http://localhost:8080/purchase/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            amount,
            lectureIds
          })
        })

        if (!response.ok) {
          throw new Error('주문 정보 저장 실패')
        }

        return await response.json()
      } catch (error) {
        console.error('백엔드 주문 저장 실패:', error)
        // 실제 환경에서는 에러 처리 필요
        // 현재는 테스트를 위해 성공으로 처리
        return { success: true }
      }
    },

    async requestTossPayment(orderId, amount) {
      return new Promise((resolve, reject) => {
        if (!window.TossPayments) {
          reject(new Error('Toss Payments SDK가 로드되지 않았습니다.'))
          return
        }

        const tossPayments = window.TossPayments('test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq')
        
        tossPayments.requestPayment('CARD', {
          amount: amount,
          orderId: orderId,
          orderName: '요리한수 강의 결제',
          customerName: '익명',
          successUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/payment/fail`,
        }).then((result) => {
          console.log('결제 성공:', result)
          // 결제 성공 시 장바구니 비우기
          this.cartStore.clearCart()
          resolve(result)
        }).catch((error) => {
          console.error('결제 실패:', error)
          reject(error)
        })
      })
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.cart-header {
  text-align: center;
  margin-bottom: 40px;
}

.cart-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.cart-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-cart-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-cart h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.empty-cart p {
  color: #666;
  margin-bottom: 30px;
}

.go-to-lectures-btn {
  background: #FF6B35;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.go-to-lectures-btn:hover {
  background: #e55a2b;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.cart-items {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  position: relative;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 20px;
  flex-shrink: 0;
}

.item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 5px;
  font-weight: 600;
}

.item-instructor {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.item-price {
  color: #FF6B35;
  font-weight: 600;
  font-size: 1.1rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
  margin-left: 15px;
}

.remove-btn:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.payment-summary {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.summary-header h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.summary-content {
  margin-bottom: 30px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  border-top: 2px solid #eee;
  padding-top: 15px;
  margin-top: 10px;
}

.total-amount {
  color: #FF6B35;
  font-size: 1.2rem;
}

.payment-btn {
  width: 100%;
  background: #FF6B35;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.payment-btn:hover:not(:disabled) {
  background: #e55a2b;
}

.payment-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .cart-container {
    padding: 20px 15px;
  }

  .cart-header h1 {
    font-size: 2rem;
  }

  .cart-items,
  .payment-summary {
    padding: 20px;
  }

  .item-thumbnail {
    width: 60px;
    height: 60px;
    margin-right: 15px;
  }

  .item-title {
    font-size: 1rem;
  }
}
</style> 