<template>
  <v-container>
    <!-- 제목 -->
    <h2 class="text-h5 font-weight-bold mb-1">공지사항 관리</h2>
    <p class="mb-6">공지사항을 작성하고 관리하세요</p>

    <!-- 작성하기 버튼 -->
    <v-row justify="end mr-0" class="mb-4">
      <v-btn color="orange" @click="openForm">+ 새 공지사항 작성</v-btn>
    </v-row>

    <!-- 공지사항 작성 폼 -->
    <v-card
      v-if="formVisible"
      class="pa-4 mb-6"
      :border="isEdit ? 'orange' : 'grey'"
    >
      <h3
        class="text-subtitle-1 font-weight-bold mb-4"
        :style="{ color: isEdit ? '#fa541c' : 'inherit' }"
      >
        {{ isEdit ? "공지사항 수정" : "공지사항 작성" }}
      </h3>

      <v-text-field
        v-model="form.title"
        label="제목"
        placeholder="공지사항 제목을 입력하세요"
        density="comfortable"
      />

      <v-select
        v-model="form.category"
        label="카테고리"
        :items="categories"
        density="comfortable"
      />

      <v-textarea
        v-model="form.content"
        label="내용"
        rows="5"
        auto-grow
        placeholder="공지사항 내용을 입력해주세요"
      />

      <v-row class="justify-end mt-4">
        <v-col cols="auto">
          <v-btn color="primary" @click="submitForm">{{
            isEdit ? "수정하기" : "작성하기"
          }}</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn text @click="cancelForm">취소</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- 공지사항 목록 or 빈 상태 안내 -->
    <template v-if="notices.length > 0">
      <v-card>
        <v-table>
          <thead>
            <tr>
              <th>제목</th>
              <th>작성일</th>
              <th>조회수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(notice, idx) in paginatedNotices" :key="idx">
              <td>{{ notice.title }}</td>
              <td>{{ notice.date }}</td>
              <td>{{ notice.views }}</td>
              <td>
                <v-btn
                  icon
                  variant="plain"
                  density="compact"
                  class="pa-0 ma-0"
                  @click="editNotice(getOriginalIndex(idx))"
                >
                  <v-icon color="orange">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="plain"
                  density="compact"
                  class="pa-0 ma-0"
                  @click="deleteNotice(getOriginalIndex(idx))"
                >
                  <v-icon color="red">mdi-delete-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <v-row justify="center" class="mt-6">
        <v-pagination
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

    <!-- 공지사항이 없을 경우 -->
    <template v-else>
      <v-row justify="center" class="mt-10 mb-10">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="grey lighten-2">mdi-bell-outline</v-icon>
          <h3 class="mt-4">공지사항이 없습니다</h3>
          <p class="mt-2">새로운 공지사항을 작성해보세요!</p>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { computed } from "vue";
import { icons } from "@/assets/icons/icons.js";

const notices = ref([
    {
      title: "📌 새로운 기능 업데이트",
      date: "2025. 7. 13.",
      views: 23,
      category: "서비스 업데이트",
      content:
        "새로운 기능이 추가되었습니다. 자세한 내용은 공지사항을 확인해주세요.",
    },
    {
      title: "🔔 강의 일정 변경 안내",
      date: "2025. 7. 13.",
      views: 56,
      category: "일반 공지",
      content: "강의 일정이 변경되었습니다. 확인 후 수강 신청 부탁드립니다.",
    },
    {
      title: "📅 요리사 인증 절차 안내",
      date: "2025. 7. 13.",
      views: 78,
      category: "서비스 업데이트",
      content:
        "요리사 인증 절차가 변경되었습니다. 자세한 내용은 공지사항을 확인해주세요.",
    },
    {
      title: "🎉 여름 이벤트 안내",
      date: "2025. 7. 13.",
      views: 45,
      category: "이벤트",
      content: "여름 이벤트가 시작되었습니다! 많은 참여 부탁드립니다.",
    },
    {
      title: "🔧 시스템 점검 안내",
      date: "2025. 7. 13.",
      views: 12,
      category: "시스템",
      content: "시스템 점검이 예정되어 있습니다. 서비스 이용에 참고해주세요.",
    },
    {
      title: "📢 공지사항 작성 가이드",
      date: "2025. 7. 13.",
      views: 30,
      category: "일반 공지",
      content: "공지사항 작성 시 참고할 수 있는 가이드를 제공합니다.",
    },
    {
      title: "🛠️ 서비스 개선 안내",
      date: "2025. 7. 13.",
      views: 18,
      category: "서비스 업데이트",
      content:
        "서비스 개선 작업이 완료되었습니다. 자세한 내용은 공지사항을 확인해주세요.",
    },
    {
      title: "🎊 새해 이벤트 안내",
      date: "2025. 7. 13.",
      views: 60,
      category: "이벤트",
      content: "새해를 맞아 특별 이벤트가 진행됩니다! 많은 참여 부탁드립니다.",
    },
    {
      title: "🔒 보안 업데이트 안내",
      date: "2025. 7. 13.",
      views: 25,
      category: "시스템",
      content: "보안 업데이트가 완료되었습니다. 서비스 이용에 참고해주세요.",
    },
    {
      title: "📚 강의 자료 업데이트",
      date: "2025. 7. 13.",
      views: 40,
      category: "일반 공지",
      content: "강의 자료가 업데이트되었습니다. 확인 후 다운로드 부탁드립니다.",
    },
    {
      title: "🌐 웹사이트 리뉴얼 안내",
      date: "2025. 7. 13.",
      views: 35,
      category: "서비스 업데이트",
      content: "웹사이트가 새롭게 리뉴얼되었습니다. 많은 이용 부탁드립니다.",
    },
    {
      title: "🎁 추첨 이벤트 당첨자 발표",
      date: "2025. 7. 13.",
      views: 50,
      category: "이벤트",
      content:
        "추첨 이벤트 당첨자를 발표합니다! 확인 후 경품 수령 방법을 확인해주세요.",
    },
]);

const formVisible = ref(false);
const isEdit = ref(false);
const editIndex = ref(null);
const form = ref({ title: "", category: "", content: "" });
const categories = ["일반 공지", "서비스 업데이트", "이벤트", "시스템"];

function openForm() {
  formVisible.value = true;
  isEdit.value = false;
  form.value = { title: "", category: "", content: "" };
}

function cancelForm() {
  formVisible.value = false;
  isEdit.value = false;
  editIndex.value = null;
}

function submitForm() {
  const today = "2025. 7. 20.";
  if (isEdit.value && editIndex.value !== null) {
    notices.value[editIndex.value] = {
      ...notices.value[editIndex.value],
      title: form.value.title,
      category: form.value.category,
      content: form.value.content,
    };
  } else {
    notices.value.unshift({
      title: form.value.title,
      category: form.value.category,
      content: form.value.content,
      date: today,
      views: 0,
    });
  }
  cancelForm();
}

function editNotice(idx) {
  const notice = notices.value[idx];
  form.value = {
    title: notice.title,
    category: notice.category || "",
    content: notice.content || "",
  };
  isEdit.value = true;
  formVisible.value = true;
  editIndex.value = idx;
}

function deleteNotice(idx) {
  notices.value.splice(idx, 1);
}

function getOriginalIndex(paginatedIdx) {
  return (currentPage.value - 1) * perPage + paginatedIdx;
}

const currentPage = ref(1);
const perPage = 10;

const paginatedNotices = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return notices.value.slice(start, start + perPage);
});

const totalPages = computed(() => Math.ceil(notices.value.length / perPage));
</script>

<style scoped>
th,
td {
  padding: 14px;
  text-align: left;
}
</style>
