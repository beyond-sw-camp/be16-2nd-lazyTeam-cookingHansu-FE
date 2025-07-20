<template>
    <v-container>
      <!-- 강의 승인 제목 -->
      <h2 class="text-h5 font-weight-bold mb-1">강의 승인 관리</h2>
      <p class="mb-6">강의 승인 요청 현황</p>
  
      <!-- 강의 목록 -->
      <v-card v-for="lecture in paginatedLectures" :key="lecture.id" class="mb-4 pa-4">
        <v-row align="center" justify="space-between">
          <v-col cols="auto">
            <v-img
              :src="lecture.image"
              width="120"
              height="90"
              class="rounded thumbnail"
            />
          </v-col>
          <v-col>
            <div class="font-weight-bold mb-1">{{ lecture.title }}</div>
            <div class="text-caption text-grey">강사: {{ lecture.chef }}</div>
            <div class="text-caption text-grey">{{ lecture.description }}</div>
            <div class="text-caption mt-2">
              ⏱ {{ lecture.duration }} &nbsp;&nbsp; 💰 {{ lecture.price.toLocaleString() }}원 &nbsp;&nbsp; 📅 {{ lecture.date }}
            </div>
          </v-col>
          <v-col cols="auto" class="text-right">
            <v-chip
              :color="lecture.status === '승인 대기' ? 'orange' : lecture.status === '승인 완료' ? 'green' : 'red'"
              text-color="white"
              class="mb-2"
              size="small"
            >
              {{ lecture.status }}
            </v-chip>
            <div class="d-flex flex-column align-end gap-2">
              <v-btn
                v-if="lecture.status === '승인 대기'"
                color="success"
                size="small"
                @click="approve(lecture.id)"
              >✔ 승인</v-btn>
              <v-btn
                v-if="lecture.status === '승인 대기'"
                color="error"
                size="small"
                @click="reject(lecture.id)"
              >✘ 거부</v-btn>
              <v-btn variant="outlined" color="orange" size="small">👁 상세보기</v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>
  
      <!-- Pagination -->
      <v-row justify="center" class="mt-6">
        <v-pagination
          v-model="page"
          :length="pageCount"
          :total-visible="7"
          color="orange"
          size="small"
          prev-icon="mdi-chevron-left"
          next-icon="mdi-chevron-right"
        />
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const page = ref(1)
  const perPage = 5
  
  const lectures = ref(
    Array.from({ length: 10 }, (_, i) => {
      const baseLectures = [
        {
          title: '딤섬 제작 워크샵',
          chef: '정요리',
          description: '샤오롱바오, 교자, 슈마이까지!',
          duration: '3시간 30분',
          price: 78000,
          date: '2025. 7. 13.',
          status: '승인 대기',
          image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
        },
        {
          title: '홈메이드 라멘 마스터',
          chef: '박셰프',
          description: '육수부터 면, 토핑까지!',
          duration: '4시간',
          price: 95000,
          date: '2025. 7. 13.',
          status: '승인 대기',
          image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
        },
        {
          title: '이탈리안 파스타 마스터클래스',
          chef: '김요리',
          description: '면 반죽부터 다양한 소스까지!',
          duration: '3시간',
          price: 89000,
          date: '2025. 7. 12.',
          status: '승인 대기',
          image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
        },
      ]
      const item = baseLectures[i % 3]
      return { id: i + 1, ...item }
    })
  )
  
  const pageCount = computed(() => Math.ceil(lectures.value.length / perPage))
  
  const paginatedLectures = computed(() => {
    const start = (page.value - 1) * perPage
    return lectures.value.slice(start, start + perPage)
  })
  
  function approve(id) {
    const target = lectures.value.find(l => l.id === id)
    if (target) target.status = '승인 완료'
  }
  
  function reject(id) {
    const target = lectures.value.find(l => l.id === id)
    if (target) target.status = '거절'
  }
  </script>
  
  <style scoped>
  .gap-2 {
    gap: 8px;
  }
  th,
  td {
    padding: 14px;
    text-align: left;
  }
  .thumbnail {
    object-fit: cover;
    border-radius: 8px;
  }
  </style>