<template>
  <div class="inactive-user-page">
    <div class="inactive-container">
      <div class="inactive-icon">
        <i class="mdi mdi-account-off"></i>
      </div>
      
      <h1 class="inactive-title">계정이 비활성화되었습니다</h1>
      
      <p class="inactive-message">
        현재 귀하의 계정은 관리자에 의해 비활성화되었습니다.<br>
        서비스 이용에 제한이 있으니 문의사항이 있으시면 고객센터로 연락해 주세요.
      </p>
      
      <div class="contact-info">
        <div class="contact-item">
          <i class="mdi mdi-email"></i>
          <span>고객센터: support@cookinghansu.com</span>
        </div>
        <div class="contact-item">
          <i class="mdi mdi-phone"></i>
          <span>전화: 1588-0000</span>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="home-btn" @click="goToHome">
          홈페이지로 이동
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth/auth';

export default {
  name: 'InactiveUserPage',
  methods: {
    async goToHome() {
      try {
        const authStore = useAuthStore();
        // 로그인 정보 완전히 정리
        authStore.clearAuth();
        // 홈페이지로 이동
        this.$router.push('/');
      } catch (error) {
        // 실패해도 홈페이지로 이동
        this.$router.push('/');
      }
    }
  }
};
</script>

<style scoped>
.inactive-user-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f1e8;
  padding: 20px;
}

.inactive-container {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.inactive-icon {
  margin-bottom: 30px;
}

.inactive-icon i {
  font-size: 80px;
  color: #ff6b35;
}

.inactive-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 20px 0;
  line-height: 1.3;
}

.inactive-message {
  font-size: 16px;
  color: var(--color-text);
  line-height: 1.6;
  margin: 0 0 30px 0;
}

.contact-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 0 0 40px 0;
  text-align: left;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--color-text);
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-item i {
  margin-right: 10px;
  color: var(--color-primary);
  font-size: 16px;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.home-btn {
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.home-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .inactive-container {
    padding: 40px 20px;
  }
  
  .inactive-title {
    font-size: 24px;
  }
  
  .inactive-message {
    font-size: 14px;
  }
  
  .home-btn {
    padding: 12px 24px;
    font-size: 14px;
    width: 100%;
    max-width: 200px;
  }
}
</style>
