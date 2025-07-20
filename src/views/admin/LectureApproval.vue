
import { colors } from '@/constants/color';

import { colors } from '@/constants/color';
<template>
  <v-container fluid>
    <h2 class="mt-4">강의 승인 관리</h2>
    <p class="mb-6">강의 승인 요청 현황</p>
    <v-row class="mb-4">
      <!-- 강의 검색창 꾸미기 -->
      <v-col cols="12" md="10">
        <v-text-field
          label="강의명으로 검색..."
          class="mb-4"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          :items="['승인 대기', '승인 완료', '거절']"
          label="승인 상태"
          class="mb-6"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-row v-for="lecture in lectures" :key="lecture.id" class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" outlined>
          <v-row no-gutters align="center" justify="space-between">
            <!-- 왼쪽: 이미지, 텍스트 -->
            <v-col cols="5" class="d-flex">
              <v-img
                :src="lecture.image"
                width="70"
                height="70"
                class="rounded mr-4"
              />
              <div>
                <div class="font-weight-bold mb-1">{{ lecture.title }}</div>
                <div class="text-body-2">강사: {{ lecture.chef }}</div>
                <div class="text-body-2 text-grey">
                  {{ lecture.description }}
                </div>
                <div class="text-caption mt-2">
                  ⏱ {{ lecture.duration }} &nbsp;&nbsp; 💰
                  {{ lecture.price.toLocaleString() }}원 &nbsp;&nbsp; 📅
                  {{ lecture.date }}
                </div>
              </div>
            </v-col>

            <!-- 오른쪽: 상태(왼쪽), 버튼(세로로 승인, 반려, 상세보기) -->

            <v-col cols="1" class="text-right">
              <v-chip
                class="mb-2"
                :color="
                  lecture.status === '승인 대기'
                    ? 'orange'
                    : lecture.status === '승인 완료'
                    ? 'green'
                    : 'red'
                "
                text-color="white"
              >
                {{ lecture.status }}
              </v-chip>

              <div class="d-flex flex-column align-items-end gap-2">
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

                <v-btn variant="outlined" color="orange" size="small"
                  >👁 상세보기</v-btn
                >
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <!-- 페이지네이션 -->
    <v-row justify="center">
      <v-pagination
        class="pagination"
        v-model="page"
        :length="pageCount"
        total-visible="10"
        prev-icon="mdi-chevron-left"
        next-icon="mdi-chevron-right"
        size="small"
      />
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      page: 1,
      perPage: 1,
      lectures: Array.from({ length: 10 }, (_, i) => {
        const baseLectures = [
          {
            title: '딤섬 제작 워크샵',
            chef: '정요리',
            description: '샤오롱바오, 교자, 슈마이까지!',
            duration: '3시간 30분',
            price: 78000,
            date: '2025. 7. 13.',
            status: '승인 대기',
            image: new URL(
              '@/assets/images/smu_mascort2.jpg',
              import.meta.url
            ).href,
          },
          {
            title: '홈메이드 라멘 마스터',
            chef: '박셰프',
            description: '육수부터 면, 토핑까지!',
            duration: '4시간',
            price: 95000,
            date: '2025. 7. 13.',
            status: '승인 대기',
            image: new URL(
              '@/assets/images/smu_mascort2.jpg',
              import.meta.url
            ).href,
          },
          {
            title: '이탈리안 파스타 마스터클래스',
            chef: '김요리',
            description: '면 반죽부터 다양한 소스까지!',
            duration: '3시간',
            price: 89000,
            date: '2025. 7. 12.',
            status: '승인 대기',
            image: new URL(
             '@/assets/images/smu_mascort2.jpg',
              import.meta.url
            ).href,
          },
        ];
        const item = baseLectures[i % 3];
        return {
          id: i + 1,
          ...item,
        };
      }),
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.lectures.length / this.perPage);
    },
    paginatedLectures() {
      const start = (this.page - 1) * this.perPage;
      const end = this.page * this.perPage;
      return this.lectures.slice(start, end);
    },
  },
  methods: {
    approve(id) {
      console.log(`${id} 승인`);
    },
    reject(id) {
      console.log(`${id} 거부`);
    },
  },
};
</script>

<style scoped>
.rounded {
  border-radius: 8px;
}
.gap-2 {
  gap: 8px;
}
</style>
