<template>
  <div class="my-posts">
    <div class="section-header">
      <h2>내 게시글</h2>
      <button class="write-post-btn" @click="goToRecipePostWrite">
        <span class="plus-icon">+</span>
        게시글 작성
      </button>
    </div>

    <div class="posts-grid">
      <div v-for="post in pagedPosts" :key="post.id" class="post-card">
        <div class="post-image">
          <img :src="post.image" :alt="post.title" />
          <!-- 액션 버튼들 -->
          <div class="post-actions">
            <button class="action-btn edit-btn" @click="editPost(post)">
              <span class="action-icon">✏️</span>
            </button>
            <button class="action-btn delete-btn" @click="confirmDelete(post)">
              <span class="action-icon">🗑️</span>
            </button>
          </div>
        </div>
        <div class="post-content">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-description">{{ post.content }}</p>
          <div class="post-meta">
            <div class="post-date">{{ post.date }}</div>
            <div class="post-stats">
              <span class="stat-item">
                <span class="stat-icon">🔖</span>
                {{ post.views }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">❤️</span>
                {{ post.likes }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="delete-modal">
        <h3>게시글 삭제</h3>
        <p>"{{ postToDelete?.title }}" 게시글을 삭제하시겠습니까?</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteModal = false">취소</button>
          <button class="delete-confirm-btn" @click="deletePost">삭제</button>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <Pagination 
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="changePage"
    />

    <div v-if="posts.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>아직 작성한 게시글이 없어요</h3>
      <p>첫 번째 게시글을 작성해보세요!</p>
      <button class="write-first-post-btn" @click="goToRecipePostWrite">
        <span class="plus-icon">+</span>
        게시글 작성하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Pagination from '../common/Pagination.vue'

const router = useRouter()

// 상태 관리
const currentPage = ref(1)
const postsPerPage = ref(6)
const showDeleteModal = ref(false)
const postToDelete = ref(null)

// 게시글 데이터
const posts = ref([
  {
    id: 1,
    title: '김치찌개 만들면서 깨달은 요리 철학',
    content: '오늘 김치찌개를 끓이면서 느낀 점들을 공유해요. 요리는 정말 마음이 중요한 것 같아요...',
    image: '/src/assets/images/smu_mascort1.jpg',
    date: '2024.01.05',
    views: 18,
    likes: 42
  },
  {
    id: 2,
    title: '한국 요리 초보자를 위한 팁',
    content: '요리를 시작한 지 6개월된 초보가 공유하는 실용적인 팁들. 실패담도 포함...',
    image: '/src/assets/images/smu_mascort2.jpg',
    date: '2024.01.03',
    views: 9,
    likes: 28
  },
  {
    id: 3,
    title: '요리 도구 추천 리뷰',
    content: '1년간 사용해본 요리 도구들 솔직 후기. 꼭 필요한 것과 불필요한 것들...',
    image: '/src/assets/images/smu_mascort3.jpg',
    date: '2024.01.01',
    views: 14,
    likes: 35
  },
  {
    id: 4,
    title: '집밥 vs 외식, 나의 선택은?',
    content: '한 달간 집밥만 해먹기 도전 후기. 건강과 경제적 효과, 그리고 의외의 발견들...',
    image: '/src/assets/images/smu_mascort4.jpg',
    date: '2023.12.28',
    views: 11,
    likes: 29
  },
  {
    id: 5,
    title: '요리 초보자를 위한 기초 팁',
    content: '요리를 처음 시작하는 분들을 위한 기본적인 팁들을 모아봤어요...',
    image: '/src/assets/images/smu_mascort1.jpg',
    date: '2023.12.25',
    views: 15,
    likes: 31
  },
  {
    id: 6,
    title: '집에서 만드는 간단한 디저트',
    content: '집에서 쉽게 만들 수 있는 디저트 레시피를 공유해요...',
    image: '/src/assets/images/smu_mascort2.jpg',
    date: '2023.12.22',
    views: 12,
    likes: 26
  },
  {
    id: 7,
    title: '건강한 아침 식사 아이디어',
    content: '바쁜 아침에도 건강하게 먹을 수 있는 식사 아이디어...',
    image: '/src/assets/images/smu_mascort3.jpg',
    date: '2023.12.20',
    views: 8,
    likes: 19
  },
  {
    id: 8,
    title: '계절별 요리 재료 활용법',
    content: '계절에 맞는 재료를 활용한 요리 팁들을 정리해봤어요...',
    image: '/src/assets/images/smu_mascort4.jpg',
    date: '2023.12.18',
    views: 10,
    likes: 22
  }
])

// 계산된 속성
const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage.value
  const end = start + postsPerPage.value
  return posts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(posts.value.length / postsPerPage.value)
})

// 메서드
const goToRecipePostWrite = () => {
  router.push('/recipe/post-write')
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const editPost = (post) => {
  router.push({ path: '/recipe/post-write', query: { id: post.id } })
}

const confirmDelete = (post) => {
  postToDelete.value = post
  showDeleteModal.value = true
}

const deletePost = () => {
  if (postToDelete.value) {
    posts.value = posts.value.filter(p => p.id !== postToDelete.value.id)
    showDeleteModal.value = false
    postToDelete.value = null
  }
}

onMounted(() => {
  // 초기 데이터 로딩
})
</script>

<style scoped>
.my-posts {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.write-post-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.write-post-btn:hover {
  background: #e66a00;
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  position: relative; /* Added for action buttons positioning */
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.post-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 16px;
}

.post-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.post-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.post-date {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
}

.post-stats {
  display: flex;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-icon {
  font-size: 14px;
}

.post-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 10; /* Ensure buttons are above other content */
}

.action-btn {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.action-icon {
  font-size: 16px;
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

.write-first-post-btn {
  background: #ff7a00;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.write-first-post-btn:hover {
  background: #e66a00;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.delete-modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
}

.delete-modal h3 {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin-bottom: 16px;
}

.delete-modal p {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.cancel-btn, .delete-confirm-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.delete-confirm-btn {
  background: #ff4d4f;
  color: white;
  border: none;
}

.delete-confirm-btn:hover {
  background: #d9363e;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .write-post-btn {
    justify-content: center;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style> 