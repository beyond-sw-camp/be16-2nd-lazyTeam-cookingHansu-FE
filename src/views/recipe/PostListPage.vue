<template>
  <div class="post-list-page">
    <v-container class="py-8">
      <!-- 헤더 -->
      <div class="page-header mb-8">
        <h1 class="text-h3 font-weight-bold mb-3">레시피 게시글</h1>
        <p class="text-body-1 text-grey-darken-2">
          다양한 레시피와 요리 팁을 공유하고 소통해보세요
        </p>
      </div>

      <!-- 필터 및 검색 -->
      <v-card elevation="0" class="filter-section mb-6">
        <div class="pa-6">
          <v-row align="center">
            <!-- 카테고리 필터 -->
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedCategory"
                :items="categoryOptions"
                label="카테고리"
                variant="outlined"
                clearable
                @update:model-value="filterPosts"
              />
            </v-col>
            
            <!-- 난이도 필터 -->
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedDifficulty"
                :items="difficultyOptions"
                label="난이도"
                variant="outlined"
                clearable
                @update:model-value="filterPosts"
              />
            </v-col>
            
            <!-- 정렬 옵션 -->
            <v-col cols="12" md="3">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                label="정렬"
                variant="outlined"
                @update:model-value="sortPosts"
              />
            </v-col>
            
            <!-- 검색 -->
            <v-col cols="12" md="3">
              <v-text-field
                v-model="searchQuery"
                label="검색"
                placeholder="제목, 내용으로 검색"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                clearable
                @update:model-value="searchPosts"
              />
            </v-col>
          </v-row>
        </div>
      </v-card>

      <!-- 게시글 목록 -->
      <div class="posts-grid">
        <v-row>
          <v-col 
            v-for="post in filteredPosts" 
            :key="post.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card 
              class="post-card"
              elevation="2"
              @click="goToPostDetail(post.id)"
            >
              <!-- 썸네일 이미지 -->
              <v-img
                :src="post.thumbnailUrl"
                height="200"
                cover
                class="post-thumbnail"
              >
                <template v-slot:error>
                  <div class="d-flex align-center justify-center fill-height">
                    <div class="text-center">
                      <v-icon size="48" color="grey">mdi-image-off</v-icon>
                      <div class="text-body-2 text-grey mt-2">이미지 없음</div>
                    </div>
                  </div>
                </template>
              </v-img>

              <!-- 게시글 정보 -->
              <v-card-text class="pa-4">
                <!-- 카테고리 칩 -->
                <div class="mb-3">
                  <v-chip
                    :color="getCategoryColor(post.category)"
                    text-color="white"
                    size="small"
                    class="font-weight-bold"
                  >
                    {{ getCategoryText(post.category) }}
                  </v-chip>
                </div>

                <!-- 제목 -->
                <h3 class="text-h6 font-weight-bold mb-2 post-title">
                  {{ post.title }}
                </h3>

                <!-- 내용 미리보기 -->
                <p class="text-body-2 text-grey-darken-1 mb-3 post-content">
                  {{ truncateContent(post.content) }}
                </p>

                <!-- 메타 정보 -->
                <div class="post-meta d-flex align-center gap-4 mb-3">
                  <div class="d-flex align-center gap-1">
                    <v-icon size="16" color="grey-darken-1">mdi-account</v-icon>
                    <span class="text-caption text-grey-darken-1">{{ post.authorName }}</span>
                  </div>
                  <div class="d-flex align-center gap-1">
                    <v-icon size="16" color="grey-darken-1">mdi-calendar</v-icon>
                    <span class="text-caption text-grey-darken-1">{{ formatDate(post.createdAt) }}</span>
                  </div>
                </div>

                <!-- 레시피 정보 -->
                <div class="recipe-info d-flex gap-3 mb-3">
                  <div class="info-item">
                    <span class="text-caption text-grey-darken-1">인분</span>
                    <div class="text-body-2 font-weight-medium">{{ post.serving }}인분</div>
                  </div>
                  <div class="info-item">
                    <span class="text-caption text-grey-darken-1">난이도</span>
                    <div class="text-body-2 font-weight-medium">{{ getDifficultyText(post.level) }}</div>
                  </div>
                  <div class="info-item">
                    <span class="text-caption text-grey-darken-1">시간</span>
                    <div class="text-body-2 font-weight-medium">{{ post.cookTime }}분</div>
                  </div>
                </div>

                <!-- 상호작용 정보 -->
                <div class="interaction-info d-flex justify-space-between align-center">
                  <div class="d-flex gap-3">
                    <div class="d-flex align-center gap-1">
                      <v-icon size="16" color="red">mdi-heart</v-icon>
                      <span class="text-caption">{{ post.likeCount }}</span>
                    </div>
                    <div class="d-flex align-center gap-1">
                      <v-icon size="16" color="blue">mdi-bookmark</v-icon>
                      <span class="text-caption">{{ post.bookmarkCount }}</span>
                    </div>
                    <div class="d-flex align-center gap-1">
                      <v-icon size="16" color="grey">mdi-eye</v-icon>
                      <span class="text-caption">{{ post.viewCount }}</span>
                    </div>
                  </div>
                  
                  <!-- 공개/비공개 표시 -->
                  <v-chip
                    :color="post.isOpen ? 'success' : 'warning'"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ post.isOpen ? '공개' : '비공개' }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination-section mt-8">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          @update:model-value="changePage"
        />
      </div>

      <!-- 게시글이 없을 때 -->
      <div v-if="filteredPosts.length === 0" class="no-posts text-center py-12">
        <v-icon size="64" color="grey" class="mb-4">mdi-food-off</v-icon>
        <h3 class="text-h5 font-weight-bold mb-2">게시글이 없습니다</h3>
        <p class="text-body-1 text-grey-darken-1 mb-4">
          {{ searchQuery ? '검색 결과가 없습니다.' : '아직 등록된 게시글이 없습니다.' }}
        </p>
        <v-btn
          v-if="!searchQuery"
          color="primary"
          @click="goToPostWrite"
        >
          첫 게시글 작성하기
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 상태 관리
const selectedCategory = ref('')
const selectedDifficulty = ref('')
const sortBy = ref('latest')
const searchQuery = ref('')
const currentPage = ref(1)
const postsPerPage = 12

// 게시글 데이터 (임시)
const posts = ref([
  {
    id: '1',
    title: '오늘 만든 김치찌개 후기',
    content: '신 김치로 만든 얼큰한 김치찌개입니다. 돼지고기를 충분히 볶아서 김치와 함께 끓이니 정말 맛있어요! 특히 김치국물을 넣을 때는 물을 조금씩 넣어가며 간을 맞춰주세요.',
    thumbnailUrl: '/src/assets/images/smu_mascort1.jpg',
    category: 'KOREAN',
    level: 'MEDIUM',
    cookTime: 30,
    serving: 4,
    createdAt: '2024-01-15T10:00:00Z',
    authorName: '요리마스터',
    viewCount: 156,
    likeCount: 23,
    bookmarkCount: 8,
    isOpen: true
  },
  {
    id: '2',
    title: '부드러운 계란찜 만들기',
    content: '폭신폭신한 계란찜 만드는 비법을 공유해요. 계란과 물의 비율이 중요하고, 찜기에 넣을 때는 중간 불로 천천히 찝니다.',
    thumbnailUrl: '/src/assets/images/smu_mascort2.jpg',
    category: 'KOREAN',
    level: 'LOW',
    cookTime: 15,
    serving: 2,
    createdAt: '2024-01-14T15:30:00Z',
    authorName: '홈쿡러',
    viewCount: 89,
    likeCount: 15,
    bookmarkCount: 5,
    isOpen: true
  },
  {
    id: '3',
    title: '간단한 파스타 만들기',
    content: '집에서 쉽게 만드는 크림 파스타입니다. 생크림 대신 우유를 사용해도 맛있고, 베이컨이나 햄을 넣으면 더욱 풍성해져요.',
    thumbnailUrl: '/src/assets/images/smu_mascort3.jpg',
    category: 'WESTERN',
    level: 'MEDIUM',
    cookTime: 25,
    serving: 2,
    createdAt: '2024-01-13T12:00:00Z',
    authorName: '파스타러버',
    viewCount: 203,
    likeCount: 31,
    bookmarkCount: 12,
    isOpen: true
  },
  {
    id: '4',
    title: '매운 마파두부 레시피',
    content: '정통 중국식 마파두부입니다. 두부를 너무 오래 끓이면 부서질 수 있으니 마지막에 넣어주세요. 고추기름을 충분히 넣어야 맛이 나요.',
    thumbnailUrl: '/src/assets/images/smu_mascort4.jpg',
    category: 'CHINESE',
    level: 'HIGH',
    cookTime: 35,
    serving: 3,
    createdAt: '2024-01-12T18:00:00Z',
    authorName: '중국요리전문가',
    viewCount: 178,
    likeCount: 28,
    bookmarkCount: 9,
    isOpen: true
  },
  {
    id: '5',
    title: '스시롤 만드는 법',
    content: '집에서 만드는 스시롤입니다. 밥을 만들 때 식초를 넣어주고, 김을 너무 오래 굽지 마세요. 신선한 생선을 사용하는 것이 중요해요.',
    thumbnailUrl: '/src/assets/images/smu_mascort5.jpg',
    category: 'JAPANESE',
    level: 'HIGH',
    cookTime: 45,
    serving: 4,
    createdAt: '2024-01-11T20:00:00Z',
    authorName: '스시마스터',
    viewCount: 245,
    likeCount: 42,
    bookmarkCount: 18,
    isOpen: true
  }
])

// 옵션 데이터
const categoryOptions = [
  { title: '전체', value: '' },
  { title: '한식', value: 'KOREAN' },
  { title: '중식', value: 'CHINESE' },
  { title: '양식', value: 'WESTERN' },
  { title: '일식', value: 'JAPANESE' }
]

const difficultyOptions = [
  { title: '전체', value: '' },
  { title: '매우 쉬움', value: 'VERY_LOW' },
  { title: '쉬움', value: 'LOW' },
  { title: '보통', value: 'MEDIUM' },
  { title: '어려움', value: 'HIGH' },
  { title: '매우 어려움', value: 'VERY_HIGH' }
]

const sortOptions = [
  { title: '최신순', value: 'latest' },
  { title: '인기순', value: 'popular' },
  { title: '조회순', value: 'views' },
  { title: '좋아요순', value: 'likes' }
]

// 계산된 속성
const filteredPosts = computed(() => {
  let filtered = [...posts.value]

  // 카테고리 필터
  if (selectedCategory.value) {
    filtered = filtered.filter(post => post.category === selectedCategory.value)
  }

  // 난이도 필터
  if (selectedDifficulty.value) {
    filtered = filtered.filter(post => post.level === selectedDifficulty.value)
  }

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    )
  }

  // 정렬
  switch (sortBy.value) {
    case 'latest':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'popular':
      filtered.sort((a, b) => b.viewCount - a.viewCount)
      break
    case 'views':
      filtered.sort((a, b) => b.viewCount - a.viewCount)
      break
    case 'likes':
      filtered.sort((a, b) => b.likeCount - a.likeCount)
      break
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / postsPerPage)
})

// 메서드들
const getCategoryColor = (category) => {
  const colors = {
    'KOREAN': '#ff7a00',
    'CHINESE': '#e74c3c',
    'WESTERN': '#3498db',
    'JAPANESE': '#9b59b6'
  }
  return colors[category] || '#666'
}

const getCategoryText = (category) => {
  const texts = {
    'KOREAN': '한식',
    'CHINESE': '중식',
    'WESTERN': '양식',
    'JAPANESE': '일식'
  }
  return texts[category] || category
}

const getDifficultyText = (level) => {
  const texts = {
    'VERY_LOW': '매우 쉬움',
    'LOW': '쉬움',
    'MEDIUM': '보통',
    'HIGH': '어려움',
    'VERY_HIGH': '매우 어려움'
  }
  return texts[level] || level
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '오늘'
  if (diffDays === 2) return '어제'
  if (diffDays <= 7) return `${diffDays - 1}일 전`
  
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  })
}

const truncateContent = (content) => {
  if (!content) return ''
  return content.length > 80 ? content.substring(0, 80) + '...' : content
}

const filterPosts = () => {
  currentPage.value = 1
}

const searchPosts = () => {
  currentPage.value = 1
}

const sortPosts = () => {
  currentPage.value = 1
}

const changePage = (page) => {
  currentPage.value = page
  // 페이지 상단으로 스크롤
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToPostDetail = (postId) => {
  router.push(`/recipe/post-detail/${postId}`)
}

const goToPostWrite = () => {
  router.push('/recipe/post-write')
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  // TODO: API 호출로 게시글 목록 로드
  console.log('게시글 목록 로드')
})
</script>

<style scoped>
.post-list-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  text-align: center;
}

.filter-section {
  background: white;
  border-radius: 12px;
}

.posts-grid {
  margin-bottom: 32px;
}

.post-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.post-thumbnail {
  border-radius: 12px 12px 0 0;
}

.post-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.post-content {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.post-meta {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.recipe-info {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.info-item {
  text-align: center;
  flex: 1;
}

.interaction-info {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.pagination-section {
  display: flex;
  justify-content: center;
}

.no-posts {
  background: white;
  border-radius: 12px;
  margin-top: 32px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .filter-section .v-row {
    gap: 16px;
  }
  
  .post-card {
    margin-bottom: 16px;
  }
  
  .recipe-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .interaction-info {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
