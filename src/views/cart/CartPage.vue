<template>
  <div class="cart-page">
    <div class="cart-container">
      <div class="cart-header">
        <h1>장바구니</h1>
        <p class="cart-subtitle">선택한 강의들을 확인하고 결제하세요</p>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>장바구니를 불러오는 중...</p>
      </div>

      <!-- 장바구니가 비어있을 때 -->
      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2>장바구니가 비어있습니다</h2>
        <p>강의를 선택하여 장바구니에 추가해보세요</p>
        <button class="go-to-lectures-btn" @click="goToLectures">
          강의 목록 보기
        </button>
      </div>

             <!-- 장바구니 아이템 목록 -->
       <div v-else-if="cartItems.length > 0" class="cart-content">
        <div class="cart-items">
          <!-- 전체 선택 체크박스 -->
          <div class="select-all-section">
            <div class="select-all-left">
              <label class="select-all-checkbox">
                <input 
                  type="checkbox" 
                  :checked="isAllSelected" 
                  @change="toggleSelectAll"
                />
                <span class="checkmark"></span>
                전체 선택 ({{ selectedItems.length }}/{{ cartItems.length }})
              </label>
            </div>
            <div class="select-all-right">
                                            <button 
                  class="clear-all-btn" 
                  @click="showClearCartConfirm"
                  :disabled="cartItems.length === 0"
                >
                 모두 비우기
               </button>
            </div>
          </div>
          
                     <div 
             v-for="item in cartItems" 
             :key="item.lectureId" 
             class="cart-item"
           >
            <div class="item-checkbox">
              <label class="checkbox">
                                 <input 
                   type="checkbox" 
                   :value="item.lectureId"
                   v-model="selectedItems"
                   @change="updateSelectAll"
                 />
                <span class="checkmark"></span>
              </label>
            </div>
                         <div class="item-thumbnail">
               <img 
                 :src="getThumbnailUrl(item.thumbnailUrl)" 
                 :alt="item.lectureTitle"
                 @error="handleImageError"
               />
             </div>
             <div class="item-info" @click="goToLectureDetail(item.lectureId)" style="cursor: pointer;">
               <h3 class="item-title">{{ item.lectureTitle }}</h3>
               <p class="item-instructor">{{ item.writerNickName }}</p>
               <p class="item-price">{{ formatPrice(item.price || 0) }}원</p>
             </div>
                           <button 
                class="remove-btn" 
                @click="showRemoveItemConfirm(item.lectureId)"
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
              <span>{{ selectedItems.length }}개</span>
            </div>
            <div class="summary-row total">
              <span>총 결제 금액</span>
              <span class="total-amount">{{ formatPrice(selectedTotalAmount) }}원</span>
            </div>
          </div>
          <button 
            class="payment-btn" 
            @click="proceedToPayment"
            :disabled="selectedItems.length === 0"
          >
            선택한 강의 결제하기
          </button>
        </div>
             </div>
     </div>

           
    </div>

    <!-- 장바구니 전체 비우기 확인 모달 -->
    <CommonModal
      v-model="showClearCartModal"
      title="장바구니 비우기"
      message="장바구니의 모든 강의를 삭제하시겠습니까?"
      confirm-text="모두 삭제"
      cancel-text="취소"
      @confirm="clearAllItems"
    />

    <!-- 개별 아이템 삭제 확인 모달 -->
    <CommonModal
      v-model="showRemoveItemModal"
      title="장바구니에서 제거"
      message="이 강의를 장바구니에서 제거하시겠습니까?"
      confirm-text="제거하기"
      cancel-text="취소"
      @confirm="removeFromCart(itemToRemove)"
    />
  </template>

<script>
import { useLectureStore } from '@/store/lecture/lecture'
import { useCartStore } from '@/store/cart/cart'
import CommonModal from '@/components/common/CommonModal.vue'
import { apiPost } from '@/utils/api'

export default {
  name: 'CartPage',
  components: {
    CommonModal
  },
  setup() {
    const lectureStore = useLectureStore();
    return {
      lectureStore
    };
  },
  data() {
    return {
      cartStore: null, // 장바구니 스토어 인스턴스
      selectedItems: [], // 선택된 아이템들의 ID 배열
      loading: false,
      // 모달 관련 상태
      showClearCartModal: false,
      showRemoveItemModal: false,
      itemToRemove: null
    }
  },
  computed: {
    // 장바구니 스토어에서 아이템 가져오기
    cartItems() {
      return this.cartStore ? this.cartStore.serverCartItems : []
    },
    // 선택된 아이템들의 총 금액
    selectedTotalAmount() {
      return this.cartItems
        .filter(item => this.selectedItems.includes(item.lectureId))
        .reduce((total, item) => total + (item.price || 0), 0)
    },
    // 전체 선택 여부
    isAllSelected() {
      return this.cartItems.length > 0 && 
             this.selectedItems.length === this.cartItems.length
    }
  },
  methods: {
  // 장바구니 스토어 초기화
  initCartStore() {
    if (!this.cartStore) {
      this.cartStore = useCartStore()
    }
  },
  
  // 썸네일 URL 처리 (없거나 깨진 경우 기본 이미지 반환)
  getThumbnailUrl(thumbnailUrl) {
    if (!thumbnailUrl || thumbnailUrl === 'undefined' || thumbnailUrl === 'null') {
      return '/src/assets/images/smu_mascort1.jpg'
    }
    return thumbnailUrl
  },

  // 이미지 로드 에러 처리
  handleImageError(event) {
    event.target.src = '/src/assets/images/smu_mascort1.jpg'
  },

  // 가격 포맷 (예: 20000 → 20,000)
  formatPrice(price) {
    if (!price && price !== 0) return '0';
    return Number(price).toLocaleString();
  },

  // 전체 선택/해제 토글
  toggleSelectAll() {
    if (this.isAllSelected) {
      this.selectedItems = []
    } else {
      this.selectedItems = this.cartItems.map(item => item.lectureId)
    }
  },

  // 개별 체크박스 변경 시 전체 선택 상태 업데이트
  updateSelectAll() {
    // 별도 처리 필요 없음 (computed에서 자동 계산)
  },

  // 장바구니에서 강의 제거 확인 모달 표시
  showRemoveItemConfirm(lectureId) {
    this.itemToRemove = lectureId;
    this.showRemoveItemModal = true;
  },

  // 장바구니에서 강의 제거 (단건)
  async removeFromCart(lectureId) {
    try {
      await this.lectureStore.removeFromCart(lectureId);
      // 선택된 아이템에서도 제거
      this.selectedItems = this.selectedItems.filter(id => id !== lectureId)
      // 모달 닫기
      this.showRemoveItemModal = false;
      // 장바구니 스토어 상태 업데이트
      if (this.cartStore) {
        this.cartStore.removeCartItem(lectureId);
        // 헤더 업데이트를 위해 강제 새로고침
        await this.cartStore.fetchServerCartList(true);
      }
    } catch (error) {
      console.error('장바구니 삭제 오류:', error);
      alert('장바구니에서 제거에 실패했습니다. 다시 시도해주세요.');
    }
  },

  // 장바구니 전체 비우기 확인 모달 표시
  showClearCartConfirm() {
    if (this.cartItems.length === 0) {
      return;
    }
    this.showClearCartModal = true;
  },

  // 장바구니 전체 비우기
  async clearAllItems() {
    try {
      await this.lectureStore.clearCart();
      this.selectedItems = [];
      // 모달 닫기
      this.showClearCartModal = false;
      // 장바구니 스토어 상태만 업데이트 (API 호출 없음)
      if (this.cartStore) {
        this.cartStore.clearAllItems();
      }
    } catch (error) {
      console.error('장바구니 전체 삭제 오류:', error);
      alert('장바구니 비우기에 실패했습니다. 다시 시도해주세요.');
    }
  },

  // 장바구니 데이터 가져오기
  async fetchCartItems(forceRefresh = false) {
    if (!this.cartStore) {
      console.error('장바구니 스토어가 초기화되지 않았습니다.')
      return
    }
    
    this.loading = true;
    try {
      await this.cartStore.fetchServerCartList(forceRefresh);
    } catch (error) {
      console.error('장바구니 조회 오류:', error);
    } finally {
      this.loading = false;
    }
  },

  // 강의 목록 페이지로 이동
  goToLectures() {
    this.$router.push('/lectures')
  },

  // 강의 상세 페이지로 이동
  goToLectureDetail(lectureId) {
    this.$router.push(`/lectures/${lectureId}`)
  },

  // 결제 버튼 눌렀을 때 실행되는 메인 함수
  async proceedToPayment() {
    if (this.selectedItems.length === 0) {
      alert('결제할 강의를 선택해주세요.')
      return
    }

    try {
      const orderId = this.generateUUID()
      const amount = this.selectedTotalAmount
      const lectureIds = this.selectedItems

      // 1. 백엔드에 사전 주문 정보 저장
      await this.saveOrderToBackend(orderId, amount, lectureIds)

      // 2. 선택된 아이템 정보를 localStorage에 저장 (결제 성공 후 제거용)
      localStorage.setItem('selectedItemsForPayment', JSON.stringify(this.selectedItems))

      // 3. Toss 결제창 열기 (결제수단은 Toss UI에서 선택)
      await this.requestTossPayment(orderId, amount)

    } catch (error) {
      console.error('결제 처리 중 오류:', error)
      alert('결제에 실패했습니다. 다시 시도해주세요.')
    }
  },

  // 결제 성공 후 선택된 아이템들을 장바구니에서 제거
  async removeSelectedItemsFromCart() {
    for (const itemId of this.selectedItems) {
      await this.lectureStore.removeFromCart(itemId);
      // 장바구니 스토어에서도 제거
      if (this.cartStore) {
        this.cartStore.removeCartItem(itemId);
      }
    }
    this.selectedItems = []
    
    // 헤더 업데이트를 위해 강제 새로고침
    if (this.cartStore) {
      await this.cartStore.fetchServerCartList(true);
    }
  },

  // UUID 생성기
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  // prepay: 백엔드에 주문 정보 저장
  async saveOrderToBackend(orderId, amount, lectureIds) {
    try {
      const response = await apiPost('/purchase/prepay', { 
        orderId, 
        amount, 
        lectureIds 
      })


      if (response.data && response.data.success) {
        return response.data
      } else {
        throw new Error('백엔드 사전 저장 실패')
      }
    } catch (error) {
      console.error('Prepay 저장 오류:', error)
      throw error
    }
  },

  // Toss 결제창 열기 (결제수단 선택은 Toss UI 제공)
  async requestTossPayment(orderId, amount) {
    return new Promise((resolve, reject) => {
      if (!window.TossPayments) {
        reject(new Error('Toss Payments SDK가 로드되지 않았습니다.'))
        return
      }

      const tossPayments = window.TossPayments('test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq') // 테스트 키

      tossPayments.requestPayment({
        amount: amount,
        orderId: orderId,
        orderName: '요리한수 강의 결제',
        customerName: '익명',
        customerEmail: 'anonymous@example.com',
        customerMobilePhone: '01012345678',
        successUrl: `${window.location.origin}/payment/PaymentSuccess`,
        failUrl: `${window.location.origin}/payment/PaymentFail`,
      }).then((result) => {
        resolve(result)
      }).catch((error) => {
        console.error('결제창 호출 실패:', error)
        reject(error)
      })
    })
  }
   },

   mounted() {
     // 장바구니 스토어 초기화
     this.initCartStore();
     // 페이지 로드 시 장바구니 데이터 가져오기 (강제 새로고침)
     this.fetchCartItems(true);
   }
 
 }
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 80px; /* 헤더 높이만큼 상단 여백 추가 */
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

.select-all-section {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.select-all-left {
  display: flex;
  align-items: center;
}

.select-all-right {
  display: flex;
  align-items: center;
}

.select-all-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  color: #333;
}

.checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox input[type="checkbox"],
.select-all-checkbox input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
  position: relative;
  background: white;
  transition: all 0.3s;
}

.checkbox input[type="checkbox"]:checked + .checkmark,
.select-all-checkbox input[type="checkbox"]:checked + .checkmark {
  background: #FF6B35;
  border-color: #FF6B35;
}

.checkbox input[type="checkbox"]:checked + .checkmark::after,
.select-all-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox:hover .checkmark,
.select-all-checkbox:hover .checkmark {
  border-color: #FF6B35;
}

.clear-all-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-all-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.clear-all-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  position: relative;
}

.item-checkbox {
  margin-right: 15px;
  flex-shrink: 0;
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

 .loading-container {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   min-height: 60vh;
   gap: 20px;
 }

 .loading-spinner {
   width: 40px;
   height: 40px;
   border: 4px solid #f3f3f3;
   border-top: 4px solid #FF6B35;
   border-radius: 50%;
   animation: spin 1s linear infinite;
 }

 @keyframes spin {
   0% { transform: rotate(0deg); }
   100% { transform: rotate(360deg); }
 }

 .loading-container p {
   color: #666;
   font-size: 16px;
 }
</style> 