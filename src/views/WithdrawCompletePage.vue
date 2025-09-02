<template>
  <div class="withdraw-complete-page">
    <div class="complete-container">
      <div class="complete-icon">
        <i class="mdi mdi-check-circle"></i>
      </div>
      
      <h1 class="complete-title">회원 탈퇴가 완료되었습니다</h1>
      
      <p class="complete-message">
        그동안 이용해 주셔서 감사했습니다.<br>
        더 나은 서비스로 다시 뵙기를 기원합니다.
      </p>
      
      <div class="action-buttons">
        <button class="home-btn" @click="goToHome">
          홈페이지로 이동
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WithdrawCompletePage',
  methods: {
    goToHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.withdraw-complete-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f1e8;
  padding: 20px;
}

.complete-container {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.complete-icon {
  margin-bottom: 30px;
}

.complete-icon i {
  font-size: 80px;
  color: var(--color-success);
}

.complete-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 20px 0;
  line-height: 1.3;
}

.complete-message {
  font-size: 16px;
  color: var(--color-text);
  line-height: 1.6;
  margin: 0 0 40px 0;
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
  .complete-container {
    padding: 40px 20px;
  }
  
  .complete-title {
    font-size: 24px;
  }
  
  .complete-message {
    font-size: 14px;
  }
  
  .home-btn {
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style>
