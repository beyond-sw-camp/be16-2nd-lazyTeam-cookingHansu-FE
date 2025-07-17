<template>
    <v-container fluid>
      <h2 class="mt-4">대시보드</h2>
      <p class="mb-6">요리한수 플랫폼 관리 현황</p>
      <v-row>
        <v-col cols="12" md="3" v-for="card in statCards" :key="card.label">
          <StatCard :icon="card.icon" :iconColor="card.color" :label="card.label" :count="card.count" />
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import StatCard from '@/components/admin/layout/StatCard.vue'
  import { ref } from 'vue'
  
  const statCards = ref([
    { label: '승인 대기 강의', count: 3, icon: 'mdi-clock-outline', color: 'orange' },
    { label: '승인 대기 요리사', count: 4, icon: 'mdi-lock-outline', color: 'red' },
    { label: '총 강의 수', count: 7, icon: 'mdi-book-open-page-variant-outline', color: 'green' },
    { label: '총 사용자', count: 14, icon: 'mdi-account-group-outline', color: 'grey' },
  ])
  </script>
  