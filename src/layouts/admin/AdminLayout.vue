<template>
    <v-app>
      <AppHeader />
      <AppSlider />
  
      <v-main>
        <v-container fluid class="pa-4">
          <router-view />
        </v-container>
      </v-main>

      <!-- 회원 복구 모달 -->
      <UserRestoreModal
        v-model:visible="showRestoreModal"
        @confirm="handleRestoreConfirm"
      />
    </v-app>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useAuthStore } from '@/store/auth/auth';
  import AppHeader from '@/components/admin/Appheader.vue';
  import AppSlider from '@/components/admin/AppSlider.vue';
  import UserRestoreModal from '@/components/common/UserRestoreModal.vue';

  const authStore = useAuthStore();

  // 회원 복구 모달 표시 여부
  const showRestoreModal = computed(() => authStore.showRestoreModal);

  // 회원 복구 모달 확인 처리
  const handleRestoreConfirm = () => {
    authStore.closeRestoreModal();
  };
  </script>