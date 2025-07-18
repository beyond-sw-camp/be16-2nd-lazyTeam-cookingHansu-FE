<template>
  <v-app>
    <AppHeader /> <!-- app-bar는 반드시 v-app 바로 아래에 있어야 함 -->

    <v-main>
      <v-container fluid class="d-flex pa-0">
        <AppSlider />
        <router-view /> <!-- 또는 현재 페이지 컴포넌트 -->
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import AppHeader from '@/components/admin/layout/Appheader.vue'
import AppSlider from '@/components/admin/layout/AppSlider.vue'
</script>