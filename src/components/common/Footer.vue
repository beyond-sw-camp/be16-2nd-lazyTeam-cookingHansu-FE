<template>
  <v-footer color="grey-lighten-4" class="footer" padless>
    <v-container class="footer-container">
      <v-row no-gutters align="start" class="footer-row" justify="space-between">
        <v-col cols="12" md="auto" class="footer-col">
          <h3 class="footer-title">요리한수</h3>
          <p class="footer-desc">
            한국 요리의 정수를 배우고 나누는 공간입니다.
          </p>
        </v-col>

        <v-col cols="12" md="auto" class="footer-col">
          <h4 class="footer-heading">서비스</h4>
          <ul class="footer-list">
            <li>레시피 공유</li>
            <li>온라인 강의</li>
            <li>1:1 채팅</li>
            <li>커뮤니티</li>
          </ul>
        </v-col>

        <v-col cols="12" md="auto" class="footer-col">
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

<style scoped>
.footer {
  background-color: #f3f4f6 !important;
  padding: 24px 0 !important;
}

.footer-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-row {
  flex-wrap: nowrap !important;
  column-gap: 16px;
}

.footer-col {
  min-width: 0;
}

.footer-title {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 8px;
}

.footer-desc {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
}

.footer-heading {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 8px;
  color: #1f2937;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 1.8;
  font-size: 14px;
  color: #4b5563;
}

.footer-text {
  font-size: 14px;
  margin-bottom: 4px;
  color: #4b5563;
}

.footer-bottom {
  font-size: 12px;
  color: #9ca3af;
}
.footer-title {
  color: #fb6a11;
}
</style>
