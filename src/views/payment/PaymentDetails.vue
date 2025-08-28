<template>
  <div class="payment-details-page">
    <Header />
    
    <div class="payment-details-container">
      <!-- 로딩 화면 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>결제내역을 불러오는 중...</p>
      </div>

      <!-- 에러 화면 -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>오류가 발생했습니다</h3>
        <p>{{ error }}</p>
        <button @click="fetchPaymentHistory" class="retry-btn">다시 시도</button>
      </div>

      <!-- 페이지 제목 -->
      <div v-else class="page-header">
        <div class="header-content">
          <button @click="goBack" class="back-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            뒤로가기
          </button>
          <div class="title-section">
            <h1>주문 상세 내역</h1>
            <p class="order-number">주문번호: {{ orderDetails.orderId || '로딩 중...' }}</p>
          </div>
        </div>
      </div>

      <div v-if="!loading && !error" class="details-grid">
        
        <div class="left-column">
          <!-- 주문 정보 -->
          <div class="order-info-section">
            <h2>
              <svg class="calendar-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#ff7a00" stroke-width="2" fill="none"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="#ff7a00" stroke-width="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="#ff7a00" stroke-width="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="#ff7a00" stroke-width="2"/>
              </svg>
              주문 정보
            </h2>
            <div class="info-item">
              <span class="label">주문일시:</span>
              <span class="value">{{ formatDate(orderDetails.createdAt) || '로딩 중...' }}</span>
            </div>
            <div class="info-item">
              <span class="label">주문번호:</span>
              <span class="value">{{ orderDetails.orderId || '로딩 중...' }}</span>
            </div>
            <div class="info-item">
              <span class="label">결제수단:</span>
              <span class="value">{{ getPaymentMethodName(orderDetails.payMethod) || '로딩 중...' }}</span>
            </div>
          </div>

          <!-- 구매한 강의 -->
          <div class="courses-section">
            <h2>
              <svg class="lecture-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="14" rx="2" stroke="#ff7a00" stroke-width="2" fill="none"/>
                <polygon points="10,8 15,11 10,14" fill="#ff7a00"/>
                <line x1="6" y1="21" x2="18" y2="21" stroke="#ff7a00" stroke-width="2"/>
                <line x1="9" y1="17" x2="9" y2="21" stroke="#ff7a00" stroke-width="2"/>
                <line x1="15" y1="17" x2="15" y2="21" stroke="#ff7a00" stroke-width="2"/>
              </svg>
              구매한 강의
            </h2>
            <div class="courses-list">
              <div class="course-item">
                <div class="course-image">
                  <img :src="orderDetails.thumbUrl" :alt="orderDetails.title || '강의 이미지'" />
                </div>
                <div class="course-info">
                  <h3 class="course-title">{{ orderDetails.title || '로딩 중...' }}</h3>
                  <div class="course-price">
                    <span class="current-price">₩{{ orderDetails.price ? orderDetails.price.toLocaleString() : '로딩 중...' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      
        <div class="right-column">
          <!-- 구매자 정보 -->
          <div class="buyer-info-section">
            <h2>
              <svg class="person-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="#ff7a00" stroke-width="2" fill="none"/>
                <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#ff7a00" stroke-width="2" fill="none"/>
              </svg>
              구매자 정보
            </h2>
            <div class="info-item">
              <span class="label">이름:</span>
              <span class="value">{{ orderDetails.buyerName || '로딩 중...' }}</span>
            </div>
            <div class="info-item">
              <span class="label">이메일:</span>
              <span class="value">{{ orderDetails.buyerEmail || '로딩 중...' }}</span>
            </div>
          </div>

          <!-- 결제 정보 -->
          <div class="payment-info-section">
            <h2>
              <svg class="document-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="#ff7a00" stroke-width="2" fill="none"/>
                <line x1="3" y1="9" x2="21" y2="9" stroke="#ff7a00" stroke-width="2"/>
              </svg>
              결제 정보
            </h2>
            <div class="payment-summary">
              <div class="summary-item total">
                <span class="label">최종 결제금액:</span>
                <span class="value">₩{{ orderDetails.price ? orderDetails.price.toLocaleString() : '로딩 중...' }}</span>
              </div>
            </div>
            <button class="study-btn" @click="goToStudy">강의 수강하기</button>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { paymentService } from '@/services/payment/paymentService.js';

export default {
  name: 'PaymentDetails',
  components: {
    Header,
    Footer
  },
  data() {
    return {
      orderDetails: {
        id: '',
        title: '',
        price: 0,
        thumbUrl: '',
        createdAt: '',
        orderId: '',
        payMethod: '',
        buyerName: '',
        buyerEmail: '',
        lectureId: ''
      },
      loading: false,
      error: null
    };
  },
  computed: {
    hasData() {
      return this.orderDetails && this.orderDetails.id;
    }
  },
  async mounted() {
    await this.fetchPaymentHistory();
  },
  methods: {
    async fetchPaymentHistory() {
      try {
        this.loading = true;
        const lectureId = this.$route.params.lectureId;
        
        console.log('강의 ID:', lectureId);
        
        if (!lectureId) {
          console.error('강의 ID가 없습니다.');
          return;
        }

        const data = await paymentService.getPaymentHistory(lectureId);
        console.log('받은 데이터:', data);
        this.orderDetails = data;
        this.error = null;
        console.log('orderDetails 업데이트됨:', this.orderDetails);
      } catch (error) {
        console.error('결제내역 조회 실패:', error);
        this.error = '결제내역을 불러오는데 실패했습니다.';
        // 에러 처리 (필요시 사용자에게 알림)
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    },
    getPaymentMethodName(payMethod) {
      switch (payMethod) {
        case 'EASY_PAY':
          return '간편결제';
        case 'CARD':
          return '신용카드';
        case 'BANK_TRANSFER':
          return '계좌이체';
        case 'VIRTUAL_ACCOUNT':
          return '가상계좌';
        default:
          return payMethod || '결제수단';
      }
    },
    goToStudy() {
      // 구매한 강의의 상세 페이지로 이동
      if (this.orderDetails.lectureId) {
        this.$router.push(`/lectures/${this.orderDetails.lectureId}`);
      } else {
        // 구매한 강의가 없는 경우 강의 목록으로 이동
        this.$router.push('/lectures');
      }
    },
    goBack() {
      // 마이페이지의 구매한 강의목록으로 이동
      this.$router.push({ name: 'MyPage', query: { tab: 'lectures' } });
    }
  }
};
</script>

<style scoped>
.payment-details-page {
  min-height: 100vh;
  background-color: #fafbfc;
  margin-top: 80px;
}

.payment-details-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 40px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #f5f5f5;
  color: #333;
}

.back-button svg {
  width: 20px;
  height: 20px;
}

.title-section {
  flex: 1;
}

.title-section h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #222;
}

.order-number {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff7a00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-container h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #e74c3c;
}

.error-container p {
  color: #666;
  font-size: 16px;
  margin: 0 0 24px 0;
}

.retry-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #e66a00;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px 0;
}

.order-number {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.details-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 50px;
  margin-bottom: 40px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.order-info-section,
.buyer-info-section,
.payment-info-section,
.courses-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}



.order-info-section h2,
.buyer-info-section h2,
.payment-info-section h2,
.courses-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.info-item .label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.info-item .value {
  font-weight: 600;
  color: #222;
}

.payment-summary {
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 0;
}

.summary-item.discount .value {
  color: #ff7a00;
}

.summary-item.total {
  border-top: 2px solid #f0f0f0;
  padding-top: 15px;
  margin-top: 15px;
  font-size: 18px;
  font-weight: 700;
}

.summary-item.total .value {
  color: #ff7a00;
  font-size: 20px;
}

.study-btn {
  width: 100%;
  background: #ff7a00;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.study-btn:hover {
  background: #e66a00;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.course-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.course-image {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info {
  flex: 1;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.course-instructor {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.course-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff7a00;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.discount-rate {
  font-size: 12px;
  color: #ff6b6b;
  background: #ffe6e6;
  padding: 2px 6px;
  border-radius: 4px;
}

.lecture-icon {
  margin-right: 4px;
  vertical-align: sub;
}

.calendar-icon {
  margin-right: 4px;
  vertical-align: sub;
}

.person-icon {
  margin-right: 4px;
  vertical-align: sub;
}

.document-icon {
  margin-right: 4px;
  vertical-align: sub;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .course-item {
    flex-direction: column;
  }
  
  .course-image {
    width: 100%;
    height: 120px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
}
</style> 