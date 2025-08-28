<template>
  <div class="sold-lectures">
    <div class="section-header">
      <h2>판매한 강의</h2>
    </div>

    <div class="lectures-grid">
      <div v-for="lecture in pagedLectures" :key="lecture.id" class="lecture-card">
        <div class="lecture-image" @click="goToLectureDetail(lecture)">
          <img :src="lecture.thumbUrl" :alt="lecture.title" />
        </div>
        <div class="lecture-content">
          <div class="lecture-header">
            <span class="category-badge" :class="categoryClass(lecture.category)">{{ getCategoryName(lecture.category) }}</span>
            <div class="header-right">
              <span class="status-badge" :class="statusClass(lecture.status)">{{ getStatusName(lecture.status) }}</span>
              <button 
                v-if="lecture.status === 'REJECTED'"
                class="delete-lecture-btn"
                @click.stop="showDeleteConfirm(lecture)"
              >
                삭제
              </button>
            </div>
          </div>
          <h3 class="lecture-title" @click="goToLectureDetail(lecture)">{{ lecture.title }}</h3>
          <p class="lecture-description">{{ lecture.description }}</p>
          <div class="lecture-price">
            <span class="price">{{ lecture.price.toLocaleString() }}원</span>
          </div>
          <div class="lecture-rating-stats">
            <div class="lecture-rating">
              <span class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(lecture.reviewAvg || 0) }">
                  ★
                </span>
              </span>
              <span class="rating-count">({{ lecture.reviewCount }})</span>
            </div>
            <div class="lecture-stats">
              <span class="stat-item">
                <span class="stat-icon">❤️</span>
                {{ lecture.likeCount }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">💬</span>
                {{ lecture.qnaCount }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">👥</span>
                {{ lecture.purchaseCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Pagination 
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <div v-if="lectures.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>아직 판매한 강의가 없어요</h3>
      <p>첫 번째 강의를 만들어서 판매를 시작해보세요!</p>
      <button class="create-lecture-btn" @click="createLecture">강의 만들기</button>
    </div>

    <!-- 승인되지 않은 강의 안내 모달 -->
    <CommonModal
      v-model="showUnapprovedModal"
      :type="modalType"
      :title="modalTitle"
      :message="modalMessage"
      :confirm-text="'확인'"
      :show-cancel-button="false"
      @confirm="closeUnapprovedModal"
    />

    <!-- 강의 삭제 확인 모달 -->
    <CommonModal
      v-model="showDeleteModal"
      type="warning"
      title="강의 삭제"
      message="정말로 이 강의를 삭제하시겠습니까? 삭제된 강의는 복구할 수 없습니다."
      confirm-text="삭제"
      cancel-text="취소"
      :show-cancel-button="true"
      @confirm="deleteLecture"
      @cancel="closeDeleteModal"
    />

    <!-- 삭제 완료 모달 -->
    <CommonModal
      v-model="showDeleteSuccessModal"
      type="success"
      title="삭제 완료"
      message="강의가 성공적으로 삭제되었습니다."
      confirm-text="확인"
      :show-cancel-button="false"
      @confirm="closeDeleteSuccessModal"
    />
  </div>
</template>

<script>
import Pagination from '../common/Pagination.vue';
import CommonModal from '../common/CommonModal.vue';
import { apiGet } from '../../utils/api.js';

export default {
  name: 'SoldLectures',
  components: {
    Pagination,
    CommonModal
  },
  data() {
    return {
      currentPage: 1,
      lecturesPerPage: 6,
      lectures: [],
      totalPages: 0,
      totalElements: 0,
      loading: false,
      showUnapprovedModal: false,
      modalType: 'warning',
      modalTitle: '',
      modalMessage: '',
      showDeleteModal: false,
      lectureToDelete: null,
      showDeleteSuccessModal: false
    };
  },
  computed: {
    pagedLectures() {
      return this.lectures;
    }
  },
  async mounted() {
    await this.fetchSoldLectures();
  },
  methods: {
    async fetchSoldLectures() {
      try {
        this.loading = true;
        const params = new URLSearchParams({
          page: this.currentPage - 1,
          size: this.lecturesPerPage
        });
        
        const response = await apiGet(`/lecture/mylist?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          this.lectures = data.data.content;
          this.totalPages = data.data.totalPages;
          this.totalElements = data.data.totalElements;
        }
      } catch (error) {
        console.error('판매한 강의 조회 실패:', error);
      } finally {
        this.loading = false;
      }
    },
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        await this.fetchSoldLectures();
      }
    },
    categoryClass(category) {
      switch (category) {
        case 'KOREAN': return 'cat-korean';
        case 'WESTERN': return 'cat-western';
        case 'JAPANESE': return 'cat-japanese';
        case 'CHINESE': return 'cat-chinese';
        case 'DESSERT': return 'cat-dessert';
        default: return '';
      }
    },
    getCategoryName(category) {
      switch (category) {
        case 'KOREAN': return '한식';
        case 'WESTERN': return '양식';
        case 'JAPANESE': return '일식';
        case 'CHINESE': return '중식';
        case 'DESSERT': return '디저트';
        default: return category;
      }
    },
    statusClass(status) {
      switch (status) {
        case 'APPROVED': return 'status-approved';
        case 'PENDING': return 'status-pending';
        case 'REJECTED': return 'status-rejected';
        default: return '';
      }
    },
    getStatusName(status) {
      switch (status) {
        case 'APPROVED': return '승인됨';
        case 'PENDING': return '대기중';
        case 'REJECTED': return '거부됨';
        default: return status;
      }
    },
    goToLectureDetail(lecture) {
      console.log('goToLectureDetail 호출됨, lecture:', lecture);
      console.log('강의 상태:', lecture.status);
      
      if (lecture.status === 'APPROVED') {
        console.log('승인된 강의 - 상세 페이지로 이동');
        this.$router.push(`/lectures/${lecture.id}`);
      } else {
        console.log('승인되지 않은 강의 - 모달 표시');
        this.openUnapprovedModal(lecture.status);
      }
    },
    createLecture() {
      this.$router.push('/lectures/create');
    },
    openUnapprovedModal(status) {
      console.log('openUnapprovedModal 호출됨, status:', status);
      
      if (status === 'PENDING') {
        this.modalType = 'warning';
        this.modalTitle = '승인 대기 중';
        this.modalMessage = '이 강의는 현재 승인 대기 중입니다. 승인 후에 상세 페이지를 확인할 수 있습니다.';
      } else if (status === 'REJECTED') {
        this.modalType = 'error';
        this.modalTitle = '승인 거부됨';
        this.modalMessage = '이 강의는 승인이 거부되었습니다. 상세 페이지를 확인할 수 없습니다.';
      }
      
      console.log('모달 설정:', {
        type: this.modalType,
        title: this.modalTitle,
        message: this.modalMessage
      });
      
      this.showUnapprovedModal = true;
      console.log('showUnapprovedModal 상태:', this.showUnapprovedModal);
    },
    closeUnapprovedModal() {
      this.showUnapprovedModal = false;
    },
    showDeleteConfirm(lecture) {
      this.lectureToDelete = lecture;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.lectureToDelete = null;
    },
    async deleteLecture() {
      if (!this.lectureToDelete) return;
      
      try {
        const response = await fetch(`http://localhost:8080/lecture/delete/${this.lectureToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          this.lectures = this.lectures.filter(lecture => lecture.id !== this.lectureToDelete.id);
          this.closeDeleteModal();
          this.showDeleteSuccessModal = true;
        } else {
          throw new Error('강의 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('강의 삭제 실패:', error);
        alert('강의 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    },
    closeDeleteSuccessModal() {
      this.showDeleteSuccessModal = false;
    }
  }
};
</script>

<style scoped>
.sold-lectures {
  width: 100%;
}

.section-header {
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.lectures-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.lecture-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.lecture-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.lecture-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.lecture-image:hover {
  transform: scale(1.02);
}

.lecture-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lecture-content {
  padding: 20px;
}

.lecture-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-lecture-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-lecture-btn:hover {
  background: #c82333;
}

.category-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.cat-korean {
  background: #ffe5c2;
  color: #ff7a00;
}

.cat-western {
  background: #e2f0ff;
  color: #007aff;
}

.cat-japanese {
  background: #e2ffe7;
  color: #00b86b;
}

.cat-chinese {
  background: #ffe2e2;
  color: #ff3b3b;
}

.cat-dessert {
  background: #fff3e2;
  color: #ff7a00;
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.status-approved {
  background: #e2ffe7;
  color: #00b86b;
}

.status-pending {
  background: #fff3e2;
  color: #ff7a00;
}

.status-rejected {
  background: #ffe2e2;
  color: #ff3b3b;
}

.lecture-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px 0;
  line-height: 1.3;
  cursor: pointer;
  transition: color 0.2s;
}

.lecture-title:hover {
  color: #ff7a00;
}

.lecture-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lecture-price {
  margin-bottom: 12px;
}

.price {
  font-size: 18px;
  font-weight: 700;
  color: #ff7a00;
}

.lecture-rating-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.lecture-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  color: #ddd;
  font-size: 14px;
}

.star.filled {
  color: #ffc107;
}

.rating-count {
  font-size: 12px;
  color: #888;
}

.lecture-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-icon {
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #444;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 32px 0;
  color: #666;
}

.create-lecture-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.create-lecture-btn:hover {
  background: #e66a00;
}

@media (max-width: 768px) {
  .lectures-grid {
    grid-template-columns: 1fr;
  }
  
  .lecture-content {
    padding: 16px;
  }
}
</style>
