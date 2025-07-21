<template>
  <v-footer color="grey-lighten-4" class="footer" padless>
    <v-container class="footer-container">
      <v-row no-gutters align="start" class="footer-row" justify="space-between">
        <v-col cols="12" md="auto" class="footer-col" >
          <h3 class="footer-title">요리한수</h3>
          <p class="footer-desc">
            한국 요리의 정수를 배우고 나누는 공간입니다.
          </p>
        </v-col>
        <v-col cols="12" md="auto" class="footer-col" v-if="!isMobile && !isTablet">
          <h4 class="footer-heading">서비스</h4>
          <ul class="footer-list">
            <li>레시피 공유</li>
            <li>온라인 강의</li>
            <li>1:1 채팅</li>
            <li>커뮤니티</li>
          </ul>
        </v-col>
        <v-col cols="12" md="auto" class="footer-col" v-if="!isMobile && !isTablet">
          <h4 class="footer-heading">지원</h4>
          <ul class="footer-list">
            <li>자주 묻는 질문</li>
            <li>고객센터</li>
            <li>이용약관</li>
            <li>개인정보처리방침</li>
          </ul>
        </v-col>
        <v-col cols="12" md="auto" class="footer-col">
          <h4 class="footer-heading">연락처</h4>
          <p class="footer-text">이메일: support@yorihansu.com</p>
          <p class="footer-text">전화: 02-1234-5678</p>
          <p class="footer-text">운영시간: 평일 9:00-18:00</p>
        </v-col>
      </v-row>
      <v-divider class="my-8" />
      <div class="footer-bottom text-center">
        © 2024 요리한수. All rights reserved.
      </div>
    </v-container>
  </v-footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
const width = ref(window.innerWidth)
const isMobile = computed(() => width.value <= 600)
const isTablet = computed(() => width.value > 600 && width.value <= 960)
function handleResize() {
  width.value = window.innerWidth
}
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.footer {
  background-color: #f3f4f6 !important;
  padding: 16px 0 !important;
}

.footer-container {
  max-width: 1440px;
  margin: 0;
  padding: 0 16px;
}

.footer-row {
  flex-wrap: wrap !important;
  column-gap: 16px;
  row-gap: 0;
  justify-content: center !important;
}

.footer-col {
  min-width: 180px;
  max-width: 100%;
  margin-bottom: 8px;
  text-align: left;
  box-sizing: border-box;
}

.footer-title {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 8px;
  color: #fb6a11;
}

.footer-desc {
  color: #4b5563;
  font-size: 13px;
  line-height: 1.5;
}

.footer-heading {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: #1f2937;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 1.7;
  font-size: 13px;
  color: #4b5563;
}

.footer-text {
  font-size: 13px;
  margin-bottom: 4px;
  color: #4b5563;
}

.footer-bottom {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 8px;
}

.v-divider {
  margin: 16px 0 !important;
}

@media (max-width: 1200px) {
  .footer-container {
    max-width: 100vw;
    margin: 0 auto;
    padding: 0 8px;
  }
  .footer-row {
    column-gap: 8px;
    row-gap: 8px;
    justify-content: center !important;
  }
  .footer-col {
    min-width: 160px;
    max-width: 100%;
    flex: 1 1 220px;
    text-align: center;
  }
}
@media (max-width: 960px) {
  .footer-row {
    flex-wrap: wrap !important;
    column-gap: 0;
    row-gap: 8px;
    justify-content: center !important;
  }
  .footer-col {
    min-width: 0;
    max-width: 100%;
    flex: 1 1 320px;
    text-align: center;
    margin-bottom: 8px;
  }
}
/* @media (max-width: 600px) {
  .footer-container {
    padding: 0 6px;
  }
  .footer-row {
    flex-direction: column !important;
    align-items: center !important;
    row-gap: 8px;
  }
  .footer-col {
    min-width: 0;
    max-width: 100%;
    margin-bottom: 4px;
    text-align: center;
  }
  .footer-title {
    font-size: 16px;
  }
  .footer-heading {
    font-size: 13px;
  }
  .footer-desc, .footer-list, .footer-text {
    font-size: 12px;
  }
  .footer-bottom {
    font-size: 10px;
    margin-top: 4px;
  }
  .v-divider {
    margin: 10px 0 !important;
  }
} */
</style>
