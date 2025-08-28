<template>
  <div v-if="totalPages > 1" class="pagination">
    <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
      &lt;
    </button>
    <button
      v-for="page in visiblePages"
      :key="page"
      :class="{ active: page === currentPage }"
      @click="changePage(page)"
      class="page-btn"
    >
      {{ page }}
    </button>
    <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">
      &gt;
    </button>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    maxVisible: {
      type: Number,
      default: 5
    }
  },
  computed: {
    visiblePages() {
      const pages = [];
      let start = Math.max(1, this.currentPage - Math.floor(this.maxVisible / 2));
      let end = Math.min(this.totalPages, start + this.maxVisible - 1);
      
      if (end - start + 1 < this.maxVisible) {
        start = Math.max(1, end - this.maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    changePage(page) {
      console.log('Pagination: 페이지 변경 요청', page, '총 페이지:', this.totalPages, '현재 페이지:', this.currentPage);
      
      // 페이지 범위 체크 및 현재 페이지와 다른지 확인
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        console.log('Pagination: 페이지 변경 이벤트 발생', page);
        this.$emit('page-change', page);
      } else {
        console.log('Pagination: 페이지 변경 불가 (범위 초과 또는 같은 페이지)');
      }
    }
  }
};
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
}

.page-btn {
  border: 1px solid #ddd;
  background: white;
  color: #666;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 40px;
}

.page-btn:hover:not(:disabled) {
  border-color: #ff7a00;
  color: #ff7a00;
}

.page-btn.active {
  background: #ff7a00;
  color: white;
  border-color: #ff7a00;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .pagination {
    gap: 4px;
  }
  
  .page-btn {
    padding: 6px 10px;
    min-width: 36px;
    font-size: 14px;
  }
}
</style>
