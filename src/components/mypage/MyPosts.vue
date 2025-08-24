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
      <div v-for="post in pagedPosts" :key="post.id" class="post-card" @click="goToPostDetail(post)">
        <div class="post-image">
          <img :src="post.image" :alt="post.title" />
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

    <!-- 삭제 확인 모달 제거 -->

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
    views: 22,
    likes: 51
  },
  {
    id: 5,
    title: '계절별 제철 요리 가이드',
    content: '봄, 여름, 가을, 겨울 제철 식재료와 요리법. 계절의 맛을 제대로 즐기는 방법...',
    image: '/src/assets/images/smu_mascort1.jpg',
    date: '2023.12.25',
    views: 16,
    likes: 38
  },
  {
    id: 6,
    title: '요리 실패담과 극복기',
    content: '처음 요리할 때 겪은 실패담들과 그걸 극복한 방법들. 실패는 성공의 어머니...',
    image: '/src/assets/images/smu_mascort2.jpg',
    date: '2023.12.22',
    views: 12,
    likes: 29
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

const goToPostDetail = (post) => {
  router.push({ path: `/recipe/post-detail/${post.id}` })
}

const changePage = (page) => {
  currentPage.value = page
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
  display: flex; /* Added for flex layout */
  flex-direction: column; /* Added for flex layout */
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.post-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 16px;
  flex-grow: 1;
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