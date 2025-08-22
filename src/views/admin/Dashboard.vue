<template>
  <v-container>
    <!-- 제목 정렬 -->
    <h2 class="text-h5 font-weight-bold mb-1">대시보드</h2>
    <p class="mb-6">요리한수 플랫폼 관리 현황</p>

    <!-- 로딩 상태 -->
    <LoadingScreen 
      v-if="dashboardStore.isLoading"
      title="대시보드 데이터를 불러오는 중"
      description="플랫폼 현황 정보를 준비하고 있어요..."
    />

    <!-- 에러 상태 -->
    <div v-else-if="dashboardStore.getError" class="error-container">
      <ErrorAlert
        title="연결 오류"
        :message="dashboardStore.getError"
        @close="dashboardStore.clearError"
      />
    </div>

    <!-- 대시보드 카드 -->
    <v-row v-else dense>
      <v-col cols="12" sm="6" md="3" v-for="card in statCards" :key="card.label">
        <v-card class="pa-4 d-flex align-center" elevation="3" rounded="lg">
          <v-avatar size="48" class="mr-4" :color="card.color">
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
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/store/admin/dashboard'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import LoadingScreen from '@/components/common/LoadingScreen.vue'

const dashboardStore = useDashboardStore()

// 통계 카드 데이터 (computed로 실시간 반영)
const statCards = computed(() => [
  {
    icon: new URL('@/assets/icons/lecture_approval.ico', import.meta.url).href,
    label: '승인 대기 중 강의',
    count: dashboardStore.getWaitingLectures,
    color: 'orange lighten-5',
  },
  {
    icon: new URL('@/assets/icons/user_approval.ico', import.meta.url).href,
    label: '승인 대기 중 사용자',
    count: dashboardStore.getWaitingApprovalUsers,
    color: 'red lighten-5',
  },
  {
    icon: new URL('@/assets/icons/total_lectures.ico', import.meta.url).href,
    label: '총 강의 수',
    count: dashboardStore.getTotalLectures,
    color: 'blue lighten-5',
  },
  {
    icon: new URL('@/assets/icons/user_mgmt.ico', import.meta.url).href,
    label: '총 사용자 수',
    count: dashboardStore.getTotalUsers,
    color: 'green lighten-5',
  },
])

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  // 서버 연결 확인 후 데이터 로드
  try {
    await dashboardStore.fetchDashboardData()
  } catch (error) {
    // 에러는 ErrorAlert가 처리
    console.error('대시보드 데이터 로드 실패:', error)
  }
})
</script>

<style scoped>
.error-container {
  margin: 20px 0;
}
</style>
