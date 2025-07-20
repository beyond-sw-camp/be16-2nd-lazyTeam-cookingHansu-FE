<template>
  <v-container>
    <!-- 제목 정렬 -->
    <h2 class="text-h5 font-weight-bold mb-1">대시보드</h2>
    <p class="mb-6">요리한수 플랫폼 관리 현황</p>

    <!-- 카드 그리드 -->
    <v-row dense>
      <v-col cols="12" sm="6" md="3" v-for="card in statCards" :key="card.label">
        <v-card class="pa-4 d-flex align-center" elevation="3" rounded="lg">
          <v-avatar size="48" class="mr-4" color="orange lighten-5">
            <v-img :src="card.icon" />
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-medium">{{ card.label }}</div>
            <div class="text-h6 font-weight-bold mt-1">{{ card.count.toLocaleString() }}</div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const statCards = ref([
  {
    icon: new URL('@/assets/icons/lecture_approval.ico', import.meta.url).href,
    label: '승인 대기 중 강의',
    count: 3,
  },
  {
    icon: new URL('@/assets/icons/chef_approval.ico', import.meta.url).href,
    label: '승인 대기 중 요리사',
    count: 5,
  },
  {
    icon: new URL('@/assets/icons/lecture_approval.ico', import.meta.url).href,
    label: '총 강의 수',
    count: 200,
  },
  {
    icon: new URL('@/assets/icons/user_mgmt.ico', import.meta.url).href,
    label: '총 사용자 수',
    count: 1200,
  },
])
</script>
