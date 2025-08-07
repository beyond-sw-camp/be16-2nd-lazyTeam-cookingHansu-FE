<template>
  <div class="payment-success-page">
    <Header />
    
    <div class="success-container">
      <div class="success-card">
        <div class="success-icon">✅</div>
        <h1>결제가 완료되었습니다!</h1>
        <p class="success-message">강의 구매가 성공적으로 완료되었습니다.</p>
        
        <div class="order-info">
          <h2>주문 정보</h2>
          <div class="info-row">
            <span>주문번호:</span>
            <span>{{ orderId }}</span>
          </div>
          <div class="info-row">
            <span>결제금액:</span>
            <span>{{ formatPrice(amount) }}원</span>
          </div>
          <div class="info-row">
            <span>결제일시:</span>
            <span>{{ paymentDate }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button class="primary-btn" @click="goToMyPage">
            마이페이지로 이동
          </button>
          <button class="secondary-btn" @click="goToLectures">
            강의 목록으로 이동
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import { useCartStore } from '@/views/cart/cart.js'

export default {
  name: 'PaymentSuccess',
  components: {
    Header
  },
  data() {
    return {
      orderId: '',
      amount: 0,
      paymentDate: '',
      cartStore: useCartStore()
    }
  },
  mounted() {
    // URL 파라미터에서 결제 정보 가져오기
    const urlParams = new URLSearchParams(window.location.search)
    const paymentKey = urlParams.get('paymentKey')
    this.orderId = urlParams.get('orderId') || 'N/A'
    this.amount = parseInt(urlParams.get('amount')) || 0
    this.paymentDate = new Date().toLocaleString('ko-KR')
    
    // 백엔드에 결제 승인 요청
    if (paymentKey && this.orderId && this.amount) {
      this.approvePayment(paymentKey)
    }
  },
  methods: {
    formatPrice(price) {
      return price.toLocaleString()
    },

    async approvePayment(paymentKey) {
      try {
        // 선택된 강의 ID 목록 가져오기
        const selectedItems = JSON.parse(localStorage.getItem('selectedItemsForPayment') || '[]')
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
        const lectureIds = selectedItems.length > 0 ? selectedItems : cartItems.map(item => item.id)

        const response = await fetch('http://localhost:8080/purchase/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId: this.orderId,
            amount: this.amount,
            lectureIds
          })
        })

        if (!response.ok) {
          console.error('결제 승인 처리 실패')
          throw new Error('결제 승인 처리 실패')
        } else {
          console.log('결제 승인 처리 완료')
          // 결제 성공 시 선택된 아이템만 장바구니에서 제거
          this.removeSelectedItemsFromCart()
        }
      } catch (error) {
        console.error('결제 승인 요청 중 오류:', error)
        // 에러가 발생해도 사용자에게는 성공 페이지를 보여줌
        // 실제 환경에서는 에러 처리 로직 추가 필요
      }
    },

    // 선택된 아이템들을 장바구니에서 제거
    removeSelectedItemsFromCart() {
      try {
        const selectedItems = JSON.parse(localStorage.getItem('selectedItemsForPayment') || '[]')
        
        if (selectedItems.length > 0) {
          // 장바구니 스토어를 사용하여 선택된 아이템들 제거
          this.cartStore.removeMultipleFromCart(selectedItems)
          console.log('선택된 강의들이 장바구니에서 제거되었습니다.')
        }
        
        // 선택된 아이템 정보 삭제
        localStorage.removeItem('selectedItemsForPayment')
      } catch (error) {
        console.error('장바구니에서 아이템 제거 중 오류:', error)
      }
    },

    goToMyPage() {
      this.$router.push('/mypage')
    },

    goToLectures() {
      this.$router.push('/lectures')
    }
  }
}
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.success-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 60px 20px;
}

.success-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-card h1 {
  color: #28a745;
  font-size: 2rem;
  margin-bottom: 15px;
}

.success-message {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.order-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  margin: 30px 0;
  text-align: left;
}

.order-info h2 {
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 15px;
  text-align: center;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row span:first-child {
  color: #666;
  font-weight: 500;
}

.info-row span:last-child {
  color: #333;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.primary-btn,
.secondary-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.primary-btn {
  background: #FF6B35;
  color: white;
}

.primary-btn:hover {
  background: #e55a2b;
}

.secondary-btn {
  background: white;
  color: #FF6B35;
  border: 2px solid #FF6B35;
}

.secondary-btn:hover {
  background: #FF6B35;
  color: white;
}

@media (max-width: 768px) {
  .success-container {
    padding: 40px 15px;
  }

  .success-card {
    padding: 30px 20px;
  }

  .success-card h1 {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style> 