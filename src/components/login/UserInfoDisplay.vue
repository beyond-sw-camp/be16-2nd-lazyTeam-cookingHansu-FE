<template>
  <div v-if="userInfo" class="user-info-display">
    <div class="profile-section">
      <img :src="userInfo.picture" alt="프로필" class="profile-image" />
      <div class="user-details">
        <div class="user-name">{{ userInfo.name }}</div>
        <div class="user-email">{{ userInfo.email }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  userInfo: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.user-info-display {
  width: 100%;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 1.1rem;
}

.user-email {
  color: #6c757d;
  font-size: 0.9rem;
}
</style>
