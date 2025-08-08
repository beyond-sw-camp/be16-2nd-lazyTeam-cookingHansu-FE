<template>
    <v-container>
      <h2 class="text-h5 font-weight-bold mb-1">신고 관리</h2>
      <p class="mb-6">신고한 게시글, 댓글, 사용자를 관리하세요</p>
  
      <!-- 신고가 있는 경우 -->
      <template v-if="visibleReports.length > 0">
        <v-card
          v-for="(report, idx) in visibleReports"
          :key="idx"
          class="mb-4 report-card"
          elevation="1"
        >
          <!-- 카드 상단 분홍 헤더 -->
          <div class="report-header d-flex justify-space-between align-center pa-5">
            <div class="d-flex align-center">
              <v-icon color="red" class="mr-2">mdi-alert-circle</v-icon>
              <span class="font-weight-bold">{{ report.type }} 신고</span>
            </div>
            <span class="text-caption font-weight-bold text-red">대기 중</span>
          </div>
  
          <!-- 카드 본문 (흰 배경) -->
          <div class="pa-4 white-area">
            <v-row class="mb-2">
              <v-col cols="12" class="text-caption text-grey">
                <span class="font-weight-bold">{{ report.type }}</span> -
                {{ report.date }}
              </v-col>
            </v-row>
  
            <v-row class="mb-2">
              <v-col cols="12">
                <div class="text-caption font-weight-bold mb-1">신고 사유</div>
                <v-chip class="custom-chip" variant="outlined" size="small" label>
                  {{ report.reason }}
                </v-chip>
              </v-col>
            </v-row>
  
            <v-row class="mb-4">
              <v-col cols="12">
                <div class="text-caption font-weight-bold mb-1">상세 설명</div>
                <v-sheet class="pa-2" color="#f9fafc">
                  {{ report.detail }}
                </v-sheet>
              </v-col>
            </v-row>
  
            <!-- 버튼 그룹 -->
            <v-row class="justify-end mt-4 pr-3 pb-3">
              <div class="d-flex" style="gap: 8px">
                <v-btn variant="outlined" size="small" color="grey">
                  해당 {{ report.type }}로 이동
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="small"
                  color="orange"
                  @click="dismissReport(idx)"
                >
                  ✖ 기각
                </v-btn>
                <v-btn size="small" color="success" @click="resolveReport(idx)">
                  ✔ 해결됨으로 처리
                </v-btn>
              </div>
            </v-row>
          </div>
        </v-card>
  
        <Pagination
          :current-page="page"
          :total-pages="pageCount"
          @page-change="page = $event"
        />
      </template>
  
      <!-- 신고가 없는 경우 -->
      <template v-else>
        <v-row justify="center" class="mt-16 mb-16">
          <v-col cols="12" md="6" class="text-center">
            <v-icon color="grey" size="40" class="mb-3">mdi-alert-circle-outline</v-icon>
            <div class="text-subtitle-1 font-weight-medium mb-1">
              처리할 신고가 없습니다
            </div>
            <div class="text-body-2 text-grey">
              현재 접수된 신고가 존재하지 않습니다.
            </div>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
import Pagination from "../../components/common/Pagination.vue";
  
  const page = ref(1);
  const perPage = 2;
  
  const reports = ref([
    {
      type: "사용자",
      date: "2025년 7월 13일 오후 01:54",
      reason: "스팸/광고",
      detail: "계속해서 광고성 댓글을 남깁니다.",
    },
    {
      type: "강의",
      date: "2025년 7월 12일 오후 03:54",
      reason: "부적절한 내용",
      detail: "강의 내용이 제목과 다릅니다.",
    },
    {
      type: "게시글",
      date: "2025년 7월 10일 오후 10:30",
      reason: "욕설/비방",
      detail: "댓글에 욕설이 포함되어 있습니다.",
    },
    {
      type: "댓글",
      date: "2025년 7월 9일 오전 11:20",
      reason: "스팸/광고",
      detail: "이 댓글은 광고성 내용입니다. 사용자가 부적절한 언어를 사용했습니다.",
    },
    {
      type: "사용자",
      date: "2025년 7월 8일 오후 02:15",
      reason: "부적절한 언어 사용",
      detail: "사용자가 부적절한 언어를 사용했습니다.",
    },
    {
      type: "강의",
      date: "2025년 7월 7일 오전 09:45",
      reason: "저작권 침해",
      detail: "강의 내용이 저작권을 침해하고 있습니다.",
    },
    {
      type: "게시글",
      date: "2025년 7월 6일 오후 04:30",
      reason: "허위 정보",
      detail: "게시글에 허위 정보가 포함되어 있습니다.",
    },
  ]);
  
  const visibleReports = computed(() => {
    const start = (page.value - 1) * perPage;
    return reports.value.slice(start, start + perPage);
  });
  
  const pageCount = computed(() => Math.ceil(reports.value.length / perPage));
  
  function dismissReport(index) {
    const globalIndex = (page.value - 1) * perPage + index;
    reports.value.splice(globalIndex, 1);
  }
  
  function resolveReport(index) {
    const globalIndex = (page.value - 1) * perPage + index;
    reports.value.splice(globalIndex, 1);
  }
  </script>
  
  <style scoped>
  .report-card {
    border-radius: 12px;
    overflow: hidden;
    background-color: #ffffff;
    padding: 0;
  }
  
  .report-header {
    background-color: #ffe5e5;
    border-bottom: 1px solid #ffd6d6;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  
  .white-area {
    background-color: #ffffff;
  }
  
  .v-sheet {
    background-color: #f9fafc !important;
    white-space: pre-wrap;
    border-radius: 8px;
  }
  
  .custom-chip {
    border-color: #f4caca;
    color: #444;
    font-weight: 500;
    font-size: 13px;
    background-color: transparent;
    border-radius: 16px;
    padding: 2px 10px;
  }
  </style>
  