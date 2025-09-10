<template>
  <div class="fail-container">
    <h1>❌ 결제 실패</h1>
    <p>결제 도중 오류가 발생했습니다.</p>
    <p>다시 시도하거나, 문제가 지속되면 관리자에게 문의해주세요.</p>
    <button @click="goToCart">장바구니로 돌아가기</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToCart() {
  router.push('/cart')
}
</script>

<style scoped>
.payment-fail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.fail-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 60px 20px;
}

.fail-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  padding: 80px 20px;
}

.fail-container h1 {
  font-size: 32px;
  color: #e74c3c;
  margin-bottom: 16px;
}

.fail-container p {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.fail-container button {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.fail-container button:hover {
  background-color: #c0392b;
}
</style>
