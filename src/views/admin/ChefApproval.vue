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
        <v-icon size="64" color="grey lighten-2"
          >mdi-account-clock-outline</v-icon
        >
        <h3 class="mt-4">승인할 요청이 없습니다</h3>
        <p class="mt-2">
          요리사 또는 자영업자의 승인 요청이 도착하면 이곳에 표시됩니다.
        </p>
      </v-col>
    </v-row>

    <!-- 유저가 있을 경우 -->
    <template v-else>
      <v-row>
        <v-col cols="12" v-for="user in paginatedUsers" :key="user.id">
          <!-- 카드 내부 구조 -->
          <v-card class="pa-4">
            <v-row align="center" justify="space-between">
              <v-col cols="auto" class="d-flex align-center">
                <v-avatar size="56" class="mr-4">
                  <v-img :src="user.avatar || '/default.png'" />
                </v-avatar>
                <div>
                  <v-chip
                    :color="user.roleType === 'chef' ? '#43a047' : '#fb8c00'"
                    text-color="#fff"
                    class="mb-2"
                  >
                    {{
                      user.roleType === "chef" ? "요리사 신청" : "자영업자 신청"
                    }}
                  </v-chip>
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
                <v-btn color="success" class="mr-2" @click="approve(user.id)"
                  >✔ 승인</v-btn
                >
                <v-btn color="error" @click="reject(user.id)">✖ 거절</v-btn>
              </v-col>
            </v-row>

            <v-divider class="my-3" />

            <!-- 요리사 정보만 표시 -->
            <v-row v-if="user.roleType === 'chef'">
              <v-col cols="12">
                <div class="mb-2">👨‍🍳 <strong>요리사 상세 정보</strong></div>
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
            </v-row>

            <!-- 자영업자 정보만 표시 -->
            <v-row v-if="user.roleType === 'business'">
              <v-col cols="12">
                <div class="mb-2">🏪 <strong>자영업자 상세 정보</strong></div>
                <div>사업자등록번호: {{ user.businessNumber }}</div>
                <div>상호명: {{ user.shopName }}</div>
                <div>주소: {{ user.shopAddress }}</div>
                <div>업종: {{ user.shopType }}</div>
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
    nickname: "김요리사",
    roleType: "chef",
    createdAt: "2025-01-15",
    avatar: `https://i.pravatar.cc/150?img=${1}`,
    licenseNumber: "1234567890",
    specialty: "한식",
    licenseUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 2,
    nickname: "박자영업자",
    roleType: "business",
    createdAt: "2025-01-16",
    avatar: `https://i.pravatar.cc/150?img=${2}`,
    businessNumber: "9876543210",
    shopName: "맛있는 가게",
    shopAddress: "서울시 강남구 역삼동 123-45",
    shopType: "한식당",
    businessUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 3,
    nickname: "이셰프",
    roleType: "chef",
    createdAt: "2025-01-17",
    avatar: `https://i.pravatar.cc/150?img=${3}`,
    licenseNumber: "1122334455",
    specialty: "양식",
    licenseUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 4,
    nickname: "최자영업자",
    roleType: "business",
    createdAt: "2025-01-18",
    avatar: `https://i.pravatar.cc/150?img=${4}`,
    businessNumber: "5566778899",
    shopName: "맛있는 카페",
    shopAddress: "서울시 마포구 합정동 678-90",
    shopType: "카페",
    businessUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 5,
    nickname: "홍셰프",
    roleType: "chef",
    createdAt: "2025-01-19",
    avatar: `https://i.pravatar.cc/150?img=${5}`,
    licenseNumber: "2233445566",
    specialty: "일식",
    licenseUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 6,
    nickname: "정자영업자",
    roleType: "business",
    createdAt: "2025-01-20",
    avatar: `https://i.pravatar.cc/150?img=${6}`,
    businessNumber: "6677889900",
    shopName: "아름다운 꽃집",
    shopAddress: "서울시 종로구 청운동 101-11",
    shopType: "꽃집",
    businessUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 7,
    nickname: "이요리사",
    roleType: "chef",
    createdAt: "2025-01-21",
    avatar: `https://i.pravatar.cc/150?img=${7}`,
    licenseNumber: "3344556677",
    specialty: "중식",
    licenseUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 8,
    nickname: "김자영업자",
    roleType: "business",
    createdAt: "2025-01-22",
    avatar: `https://i.pravatar.cc/150?img=${8}`,
    businessNumber: "7788990011",
    shopName: "행복한 베이커리",
    shopAddress: "서울시 송파구 잠실동 234-56",
    shopType: "베이커리",
    businessUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 9,
    nickname: "박셰프",
    roleType: "chef",
    createdAt: "2025-01-23",
    avatar: `https://i.pravatar.cc/150?img=${9}`,
    licenseNumber: "4455667788",
    specialty: "퓨전 요리",
    licenseUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 10,
    nickname: "최자영업자2",
    roleType: "business",
    createdAt: "2025-01-24",
    avatar: `https://i.pravatar.cc/150?img=${10}`,
    businessNumber: "8899001122",
    shopName: "아름다운 꽃집2",
    shopAddress: "서울시 강서구 화곡동 345-67",
    shopType: "꽃집2",
    businessUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 11,
    nickname: "이셰프2",
    roleType: "chef",
    createdAt: "2025-01-25",
    avatar: `https://i.pravatar.cc/150?img=${11}`,
    licenseNumber: "5566778899",
    specialty: "디저트 요리",
    licenseUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
  },
  {
    id: 12,
    nickname: "홍자영업자2",
    roleType: "business",
    createdAt: "2025-01-26",
    avatar: `https://i.pravatar.cc/150?img=${12}`,
    businessNumber: "9900112233",
    shopName: "행복한 카페2",
    shopAddress: "서울시 강남구 신사동 456-78",
    shopType: "카페2",
    businessUrl: new URL("@/assets/images/smu_mascort2.jpg", import.meta.url)
      .href,
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
