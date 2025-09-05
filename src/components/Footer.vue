<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__section footer__intro">
        <h2 class="footer__title">요리한수</h2>
        <p class="footer__desc">한국 요리의 정수를 배우고 나누는 공간입니다.</p>
      </div>
      <div class="footer__section footer__service" v-if="!isMobile && !isTablet">
        <h3 class="footer__subtitle">서비스</h3>
        <ul>
          <li>레시피 공유</li>
          <li>온라인 강의</li>
          <li>1:1 채팅</li>
          <li>커뮤니티</li>
        </ul>
      </div>
      <div class="footer__section footer__support" v-if="!isMobile && !isTablet">
        <h3 class="footer__subtitle">지원</h3>
        <ul>
          <li>자주 묻는 질문</li>
          <li>고객센터</li>
          <li>이용약관</li>
          <li>개인정보처리방침</li>
        </ul>
      </div>
      <div class="footer__section footer__contact">
        <h3 class="footer__subtitle">연락처</h3>
        <ul>
          <li>이메일: support@yorihansu.com</li>
          <li>전화: 02-1234-5678</li>
          <li>운영시간: 평일 9:00-18:00</li>
        </ul>
      </div>
    </div>
    <div class="footer__copyright">
      © 2025 요리한수. All rights reserved.
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      isMobile: false, // max-width: 700px 이하
      isTablet: false, // max-width: 900px 이하
    };
  },
//   모바일 화면 크기 체크 
  mounted() {
    this.checkDevice();
    window.addEventListener('resize', this.checkDevice);
  },
//   컴포넌트 삭제 시 이벤트 리스너 삭제 
  beforeDestroy() {
    window.removeEventListener('resize', this.checkDevice);
  },
  methods: {
    // 모바일 & 태블릿릿 화면 크기 범위 체크 
    checkDevice() {
      const width = window.innerWidth;
      this.isMobile = width <= 700;
      this.isTablet = width > 700 && width <= 900;
    },
  },
};
</script>

<style scoped>
.footer {
  background: #F8F9FA;
  color: #495057;
  font-family: 'Noto Sans', 'Sans-Serif';
  padding: 40px 0 0 0;
  border-top: 1px solid #e9ecef;
}
.footer__container {
  display: flex;
  justify-content: space-between;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 32px;
  flex-wrap: wrap;
}
.footer__section {
  flex: 1 1 80px;
  margin-bottom: 24px;
}
.footer__intro {
  min-width: 220px;
}
.footer__title {
  color: #FF6B35;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.footer__desc {
  font-size: 1rem;
  color: #495057;
  word-break: keep-all;
}
.footer__subtitle {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #495057;
}
.footer__section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.footer__section li {
  margin-bottom: 8px;
  font-size: 1rem;
  color: #495057;
}
.footer__contact li {
  word-break: keep-all;
}
.footer__copyright {
  text-align: center;
  color: #868e96;
  font-size: 1rem;
  padding: 24px 0 16px 0;
  border-top: 1px solid #e9ecef;
  background: #F8F9FA;
  margin-top: 16px;
}
@media (max-width: 900px) {
  .footer__container {
    flex-direction: row;
    align-items: flex-start;
    padding: 0 16px;
  }
  .footer__section {
    width: 100%;
    margin-bottom: 16px;
  }
}
@media (max-width: 700px) {
  .footer__container {
    flex-direction: column;
    align-self: center;
    justify-content: center;
    padding: 0 8px;
  }
  .footer__section {
    width: 100%;
    margin-bottom: 12px;
  }
  .footer__service,
  .footer__support {
    display: none !important;
  }
  .footer__copyright {
    font-size: 0.95rem;
    padding: 16px 0 10px 0;
  }
}
</style> 