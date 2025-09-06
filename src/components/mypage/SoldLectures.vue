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
                class="delete-btn" 
                @click.stop="openDeleteModal(lecture)"
                title="강의 삭제"
              >
                삭제하기
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
      :message="`'${deleteTargetLecture?.title}' 강의를 정말 삭제하시겠습니까? 삭제된 강의는 복구할 수 없습니다.`"
      confirm-text="삭제"
      cancel-text="취소"
      @confirm="confirmDeleteLecture"
      @cancel="closeDeleteModal"
    />


  </div>
</template>

<script>
import Pagination from '../common/Pagination.vue';
import CommonModal from '../common/CommonModal.vue';
import { mypageService } from '../../services/mypage/mypageService.js';

export default {
  name: 'SoldLectures',
  components: {
    Pagination,
    CommonModal
  },
  data() {
    return {
      currentPage: 1,
      lecturesPerPage: 8,
      lectures: [],
      totalPages: 0,
      totalElements: 0,
      loading: false,
      showUnapprovedModal: false,
      modalType: 'warning',
      modalTitle: '',
      modalMessage: '',
      showDeleteModal: false,
      deleteTargetLecture: null
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
        const response = await mypageService.getSoldLectures(this.currentPage - 1, this.lecturesPerPage);

        if (response && response.success) {
          this.lectures = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
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
      return category ? `cat-${category.toLowerCase()}` : '';
    },
    getCategoryName(category) {
      switch (category) {
        case 'KOREAN': return '한식';
        case 'WESTERN': return '양식';
        case 'JAPANESE': return '일식';
        case 'CHINESE': return '중식';
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
      
      if (lecture.status === 'APPROVED') {
        this.$router.push(`/lectures/${lecture.id}`);
      } else if (lecture.status === 'REJECTED') {
        // 수정 후 판매된 강의 페이지로 돌아오기 위한 플래그 설정
        localStorage.setItem('lectureEditFrom', 'sold-lectures');
        this.$router.push(`/lectures/edit/${lecture.id}`);
      } else {
        this.openUnapprovedModal(lecture.status);
      }
    },
    createLecture() {
      this.$router.push('/lectures/create');
    },
    openUnapprovedModal(status) {
      
      if (status === 'PENDING') {
        this.modalType = 'warning';
        this.modalTitle = '승인 대기 중';
        this.modalMessage = '이 강의는 현재 승인 대기 중입니다. 승인 후에 상세 페이지를 확인할 수 있습니다.';
      } else if (status === 'REJECTED') {
        this.modalType = 'error';
        this.modalTitle = '승인 거부됨';
        this.modalMessage = '이 강의는 승인이 거부되었습니다. 상세 페이지를 확인할 수 없습니다.';
      }
      

      
      this.showUnapprovedModal = true;
    },
    closeUnapprovedModal() {
      this.showUnapprovedModal = false;
    },
    openDeleteModal(lecture) {
      this.deleteTargetLecture = lecture;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteTargetLecture = null;
    },
    async confirmDeleteLecture() {
      if (!this.deleteTargetLecture) return;
      
      try {
        this.loading = true;
        await mypageService.deleteLecture(this.deleteTargetLecture.id);
        
        // 삭제 성공 후 목록 새로고침
        await this.fetchSoldLectures();
        
        // 모달 닫기
        this.closeDeleteModal();
        
        // 성공 메시지 표시 (선택사항)
        console.log('강의가 성공적으로 삭제되었습니다.');
        
      } catch (error) {
        console.error('강의 삭제 실패:', error);
        // 에러 처리 (선택사항)
        alert('강의 삭제에 실패했습니다. 다시 시도해주세요.');
      } finally {
        this.loading = false;
      }
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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 1040px;
  margin: 0 auto 24px auto;
  min-height: 480px;
}

.lectures-grid:empty {
  min-height: 0;
}

.lecture-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1.5px solid #f3f3f3;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 220px;
  max-height: 220px;
}

.lecture-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.lecture-image {
  position: relative;
  width: 100%;
  height: 90px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
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
  padding: 10px 12px 8px 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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

.delete-btn {
  background: #ff3b3b;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 16px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.delete-btn:hover {
  background: #e63434;
  transform: translateY(-1px);
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
  line-clamp: 2;
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
