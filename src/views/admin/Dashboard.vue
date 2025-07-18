<template>
    <v-container fluid>
      <h2 class="mt-4" :style="{ color: colors.text }">대시보드</h2>
      <p class="mb-6" :style="{ color: colors.text }">요리한수 플랫폼 관리 현황</p>
      <v-row>
        <v-col cols="12" md="3" v-for="card in statCards" :key="card.label">
          <StatCard :icon="card.icon" :label="card.label" :count="card.count" />
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import StatCard from '@/components/admin/layout/StatCard.vue'
  import { colors } from '@/constants/color.js'
  
  export default {
    components: { StatCard },
    data() {
      return {
        colors,
        statCards: [
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
        ],
      }
    },
  }
  </script>