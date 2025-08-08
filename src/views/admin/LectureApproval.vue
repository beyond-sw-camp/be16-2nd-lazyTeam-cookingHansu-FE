<template>
    <v-container>
      <!-- 강의 승인 제목 -->
      <h2 class="text-h5 font-weight-bold mb-1">강의 승인 관리</h2>
      <p class="mb-6">강의 승인 요청 현황</p>
  
      <!-- 강의가 없을 경우 -->
      <v-row v-if="lectures.length === 0" justify="center" class="mt-10 mb-10">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="grey lighten-2">mdi-teach</v-icon>
          <h3 class="mt-4">승인 요청 강의가 없습니다</h3>
          <p class="mt-2">강의가 등록되면 이곳에서 확인할 수 있습니다.</p>
        </v-col>
      </v-row>
  
      <!-- 강의가 있을 경우 -->
      <template v-else>
        <v-card
          v-for="lecture in paginatedLectures"
          :key="lecture.id"
          class="mb-4 pa-4"
        >
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
                ⏱ {{ lecture.duration }} &nbsp;&nbsp;
                💰 {{ lecture.price.toLocaleString() }}원 &nbsp;&nbsp;
                📅 {{ lecture.date }}
              </div>
            </v-col>
            <v-col cols="auto" class="text-right">
              <v-chip
                :color="
                  lecture.status === '승인 대기'
                    ? 'orange'
                    : lecture.status === '승인 완료'
                    ? 'green'
                    : 'red'
                "
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
                >
                  ✔ 승인
                </v-btn>
                <v-btn
                  v-if="lecture.status === '승인 대기'"
                  color="error"
                  size="small"
                  @click="reject(lecture.id)"
                >
                  ✘ 거부
                </v-btn>
                <v-btn variant="outlined" color="orange" size="small">
                  👁 상세보기
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
  
        <!-- Pagination -->
        <Pagination
          :current-page="page"
          :total-pages="pageCount"
          @page-change="page = $event"
        />
      </template>
    </v-container>
  </template>
  
  
  <script setup>
  import { ref, computed } from 'vue'
import Pagination from '../../components/common/Pagination.vue'
  
  const page = ref(1)
  const perPage = 5
  
  const lectures = ref([
    {
      id: 1,
      title: '초보자를 위한 요리 강의',
      chef: '홍길동',
      description: '기본적인 요리 기술을 배우는 강의입니다.',
      duration: '2시간',
      price: 30000,
      date: '2025-07-13',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 2,
      title: '이탈리안 요리 마스터 클래스',
      chef: '김철수',
      description: '이탈리안 요리를 전문적으로 배우는 강의입니다.',
      duration: '3시간',
      price: 50000,
      date: '2025-07-14',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 3,
      title: '프랑스 요리 기초',
      chef: '이영희',
      description: '프랑스 요리의 기본을 배우는 강의입니다.',
      duration: '1시간 30분',
      price: 40000,
      date: '2025-07-15',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 4,
      title: '일식 요리의 정석',
      chef: '박준호',
      description: '일식 요리를 전문적으로 배우는 강의입니다.',
      duration: '2시간 30분',
      price: 45000,
      date: '2025-07-16',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 5,
      title: '베이킹 기초부터 고급까지',
      chef: '최지우',
      description: '베이킹의 기초부터 고급 기술까지 배우는 강의입니다.',
      duration: '3시간',
      price: 60000,
      date: '2025-07-17',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 6,
      title: '채식 요리의 모든 것',
      chef: '정수현',
      description: '채식 요리를 전문적으로 배우는 강의입니다.',
      duration: '2시간',
      price: 35000,
      date: '2025-07-18',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 7,
      title: '디저트 만들기 기초',
      chef: '이수진',
      description: '디저트 만드는 법을 배우는 강의입니다.',
      duration: '1시간 45분',
      price: 32000,
      date: '2025-07-19',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 8,
      title: '세계 각국의 요리 탐방',
      chef: '김민수',
      description: '세계 각국의 요리를 배우는 강의입니다.',
      duration: '4시간',
      price: 70000,
      date: '2025-07-20',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 9,
      title: '건강한 요리 레시피',
      chef: '박지영',
      description: '건강한 요리 레시피를 배우는 강의입니다.',
      duration: '2시간 15분',
      price: 38000,
      date: '2025-07-21',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 10,
      title: '요리사 자격증 취득 준비반',
      chef: '최영수',
      description:
        '요리사 자격증 취득을 위한 준비반 강의입니다.',
      duration: '3시간 30분',
      price: 55000,
      date: '2025-07-22',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 11,
      title: '퓨전 요리의 매력',
      chef: '이하늘',
      description: '퓨전 요리의 다양한 레시피를 배우는 강의입니다.',
      duration: '2시간 30분',
      price: 48000,
      date: '2025-07-23',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
    {
      id: 12,
      title: '요리의 과학',
      chef: '김하늘',
      description: '요리의 과학적 원리를 배우는 강의입니다.',
      duration: '1시간 30분',
      price: 36000,
      date: '2025-07-24',
      image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
      status: '승인 대기'
    },
  ])
  
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