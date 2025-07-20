<template>
    <v-container>
      <!-- 이미지 모달 (변동 없음) -->
      <v-dialog v-model="dialog" max-width="600px" persistent>
        <v-card class="pa-2">
          <v-img
            :src="dialogImageUrl"
            max-height="80vh"
            class="rounded-lg"
            cover
          />
          <v-card-actions class="justify-end">
            <v-btn text color="black" @click="dialog = false">닫기</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- 제목 -->
      <v-row>
        <v-col cols="12">
          <h2 class="text-h5 font-weight-bold mb-4">요리사 승인</h2>
          <p>사업자등록증 혹은 요리사 자격을 확인하고 승인해주세요</p>
        </v-col>
      </v-row>
  
      <!-- 승인할 유저가 없을 경우 -->
      <v-row v-if="users.length === 0" justify="center" class="mt-10 mb-10">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="grey lighten-2">mdi-account-clock-outline</v-icon>
          <h3 class="mt-4">승인할 요청이 없습니다</h3>
          <p class="mt-2">요리사 또는 자영업자의 승인 요청이 도착하면 이곳에 표시됩니다.</p>
        </v-col>
      </v-row>
  
      <!-- 유저가 있을 경우 -->
      <template v-else>
        <v-row>
          <v-col
            cols="12"
            v-for="user in paginatedUsers"
            :key="user.id"
          >
            <v-card class="pa-4">
              <v-row align="center" justify="space-between">
                <v-col cols="auto" class="d-flex align-center">
                  <v-avatar size="56" class="mr-4">
                    <v-img :src="user.avatar || '/default.png'" />
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-medium">
                      {{ user.nickname }}
                    </h3>
                    <div class="text-caption text-grey">
                      신청일: {{ user.createdAt }}
                    </div>
                  </div>
                </v-col>
  
                <v-col cols="auto" class="d-flex align-center">
                  <v-chip color="amber-lighten-1" class="mr-2">승인 대기</v-chip>
                  <v-btn color="success" class="mr-2" @click="approve(user.id)">
                    ✔ 승인
                  </v-btn>
                  <v-btn color="error" @click="reject(user.id)">✖ 거절</v-btn>
                </v-col>
              </v-row>
  
              <v-divider class="my-3" />
  
              <v-row>
                <!-- 요리사 정보 -->
                <v-col cols="12" md="6" v-if="user.isChef">
                  <div class="mb-2">👨‍🍳 <strong>전문 요리사</strong></div>
                  <div>자격번호: {{ user.licenseNumber }}</div>
                  <div>전문 분야: {{ user.specialty }}</div>
                  <v-btn
                    class="mt-2"
                    size="small"
                    variant="outlined"
                    @click="openFile(user.licenseUrl)"
                  >
                    자격증 보기
                  </v-btn>
                </v-col>
  
                <!-- 자영업자 정보 -->
                <v-col cols="12" md="6" v-if="user.isBusiness">
                  <div class="mb-2">🏪 <strong>자영업자</strong></div>
                  <div>사업자등록번호: {{ user.businessNumber }}</div>
                  <div>가게 상호명: {{ user.shopName }}</div>
                  <div>가게 주소: {{ user.shopAddress }}</div>
                  <div>가게 업종: {{ user.shopType }}</div>
                  <v-btn
                    class="mt-2"
                    size="small"
                    variant="outlined"
                    @click="openFile(user.businessUrl)"
                  >
                    사업자등록증 보기
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
  
        <!-- 페이지네이션 -->
        <v-row justify="center" class="mt-6">
          <v-pagination
            :key="totalPages"
            v-model="currentPage"
            :length="totalPages"
            :total-visible="10"
            color="orange"
            size="small"
            class="pagination"
            prev-icon="mdi-chevron-left"
            next-icon="mdi-chevron-right"
          />
        </v-row>
      </template>
    </v-container>
  </template>
<script setup>
import { ref, computed } from "vue";

const users = ref([
  {
    id: 1,
    nickname: "요리사 #1",
    createdAt: "2025. 7. 11.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "123-45-67890",
    specialty: "이탈리안 요리, 파스타, 피자",
    licenseUrl: "/licenses/license1.pdf",
    businessNumber: "123-45-67890",
    shopName: "마스터키친",
    shopAddress: "서울시 강남구 XX동",
    shopType: "양식",
    businessUrl: "/businesses/business1.pdf",
  },
  {
    id: 2,
    nickname: "요리사 #2",
    createdAt: "2025. 7. 12.",
    isChef: true,
    isBusiness: false,
    licenseNumber: "098-76-54321",
    specialty: "일식, 초밥, 덮밥, 알밥",
    licenseUrl: "/licenses/license2.pdf",
  },
  {
    id: 3,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },
  {
    id: 4,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },
  {
    id: 5,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },
  {
    id: 6,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },
  {
    id: 7,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },
  {
    id: 8,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },
  {
    id: 9,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },
  {
    id: 10,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },
  {
    id: 11,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },
  {
    id: 12,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },

  {
    id: 13,
    nickname: "요리사 #3",
    createdAt: "2025. 7. 13.",
    isChef: true,
    isBusiness: true,
    licenseNumber: "456-78-90123",
    specialty: "한식, 찌개, 김치요리",
    licenseUrl: "/licenses/license3.pdf",
    businessNumber: "456-78-90123",
    shopName: "한식당",
    shopAddress: "서울시 종로구",
    shopType: "한식",
    businessUrl: "/businesses/business3.pdf",
  },
]);

const currentPage = ref(1);
const perPage = 4;

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return users.value.slice(start, start + perPage);
});

const totalPages = computed(() => Math.ceil(users.value.length / perPage));

function approve(id) {
  alert(`사용자 ${id} 승인`);
}

function reject(id) {
  alert(`사용자 ${id} 거절`);
}
const dialog = ref(false);
const dialogImageUrl = ref("");

function openFile(url) {
  dialogImageUrl.value = url;
  dialog.value = true;
}
</script>

<style scoped>
.v-avatar img {
  object-fit: cover;
}
.v-overlay__scrim {
  backdrop-filter: blur(30px);
  background-color: rgba(0, 0, 0, 0.8) !important;
}
</style>
