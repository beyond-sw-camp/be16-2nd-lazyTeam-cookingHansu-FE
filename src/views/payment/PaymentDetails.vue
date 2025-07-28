<template>
  <div class="payment-details-page">
    <Header />
    
    <div class="payment-details-container">
      <!-- 페이지 제목 -->
      <div class="page-header">
        <h1>주문 상세 내역</h1>
        <p class="order-number">주문번호: {{ orderDetails.orderNumber }}</p>
      </div>

      <div class="details-grid">
        
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
              <span class="value">{{ orderDetails.orderDate }}</span>
            </div>
            <div class="info-item">
              <span class="label">주문번호:</span>
              <span class="value">{{ orderDetails.orderNumber }}</span>
            </div>
            <div class="info-item">
              <span class="label">결제수단:</span>
              <span class="value">{{ orderDetails.paymentMethod }}</span>
            </div>
            <div class="info-item">
              <span class="label">카드정보:</span>
              <span class="value">{{ orderDetails.cardInfo }}</span>
            </div>
            <div class="info-item">
              <span class="label">할부:</span>
              <span class="value">{{ orderDetails.installment }}</span>
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
              <div v-for="course in orderDetails.courses" :key="course.id" class="course-item">
                <div class="course-image">
                  <img :src="course.image" :alt="course.title" />
                </div>
                <div class="course-info">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <p class="course-instructor">{{ course.instructor }}</p>
                  <div class="course-price">
                    <span class="current-price">₩{{ course.currentPrice.toLocaleString() }}</span>
                    <span class="original-price">₩{{ course.originalPrice.toLocaleString() }}</span>
                    <span class="discount-rate">{{ course.discountRate }}% 할인</span>
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
              <span class="value">{{ orderDetails.buyerName }}</span>
            </div>
            <div class="info-item">
              <span class="label">이메일:</span>
              <span class="value">{{ orderDetails.buyerEmail }}</span>
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
              <div class="summary-item">
                <span class="label">상품금액:</span>
                <span class="value">₩{{ orderDetails.subtotal.toLocaleString() }}</span>
              </div>
              <div class="summary-item discount">
                <span class="label">할인금액:</span>
                <span class="value">-₩{{ orderDetails.discount.toLocaleString() }}</span>
              </div>
              <div class="summary-item total">
                <span class="label">최종 결제금액:</span>
                <span class="value">₩{{ orderDetails.total.toLocaleString() }}</span>
              </div>
            </div>
            <button class="study-btn">강의 수강하기</button>
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

export default {
  name: 'PaymentDetails',
  components: {
    Header,
    Footer
  },
  data() {
    return {
      orderDetails: {
        orderNumber: 'ORDER_20250111_001',
        orderDate: '2025년 1월 11일 16:32',
        paymentMethod: '신용카드',
        cardInfo: '****_****_****-1234',
        installment: '일시불',
        buyerName: '최지혜',
        buyerEmail: 'user@example.com',
        subtotal: 120000,
        discount: 40000,
        total: 80000,
        courses: [
          {
            id: 1,
            title: '한식 기초 요리법 완주 - 초보자도 쉽게 따라하는 집밥 레시피',
            instructor: '김미영 셰프',
            image: '/src/assets/images/smu_mascort1.jpg',
            currentPrice: 45000,
            originalPrice: 65000,
            discountRate: 30
          },
          {
            id: 2,
            title: '김치 담그기 마스터 클래스 - 전통 발효법부터 현대적 응용까지',
            instructor: '박정희 요리연구가',
            image: '/src/assets/images/smu_mascort2.jpg',
            currentPrice: 35000,
            originalPrice: 50000,
            discountRate: 30
          }
        ]
      }
    };
  },
  methods: {
    goToStudy() {
      // 강의 수강 페이지로 이동
      this.$router.push('/lectures');
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