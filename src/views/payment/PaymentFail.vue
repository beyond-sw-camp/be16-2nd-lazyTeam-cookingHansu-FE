<template>
  <div class="payment-fail-page">
    <Header />
    
    <div class="fail-container">
      <div class="fail-card">
        <div class="fail-icon">❌</div>
        <h1>결제에 실패했습니다</h1>
        <p class="fail-message">결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.</p>
        
        <div class="error-info">
          <h2>오류 정보</h2>
          <div class="info-row">
            <span>오류 코드:</span>
            <span>{{ errorCode }}</span>
          </div>
          <div class="info-row">
            <span>오류 메시지:</span>
            <span>{{ errorMessage }}</span>
          </div>
          <div class="info-row">
            <span>주문번호:</span>
            <span>{{ orderId }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button class="primary-btn" @click="retryPayment">
            다시 결제하기
          </button>
          <button class="secondary-btn" @click="goToCart">
            장바구니로 돌아가기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'

export default {
  name: 'PaymentFail',
  components: {
    Header
  },
  data() {
    return {
      errorCode: '',
      errorMessage: '',
      orderId: ''
    }
  },
  mounted() {
    // URL 파라미터에서 오류 정보 가져오기
    const urlParams = new URLSearchParams(window.location.search)
    this.errorCode = urlParams.get('code') || 'UNKNOWN_ERROR'
    this.errorMessage = urlParams.get('message') || '알 수 없는 오류가 발생했습니다.'
    this.orderId = urlParams.get('orderId') || 'N/A'
  },
  methods: {
    retryPayment() {
      // 장바구니 페이지로 이동하여 다시 결제할 수 있도록 함
      this.$router.push('/cart')
    },

    goToCart() {
      this.$router.push('/cart')
    }
  }
}
</script>

<style scoped>
.payment-fail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.fail-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 60px 20px;
}

.fail-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.fail-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.fail-card h1 {
  color: #dc3545;
  font-size: 2rem;
  margin-bottom: 15px;
}

.fail-message {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.error-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  margin: 30px 0;
  text-align: left;
}

.error-info h2 {
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
  .fail-container {
    padding: 40px 15px;
  }

  .fail-card {
    padding: 30px 20px;
  }

  .fail-card h1 {
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