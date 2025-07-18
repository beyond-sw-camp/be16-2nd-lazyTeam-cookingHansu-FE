<template>
    <v-app>
      <AppHeader />
      <v-main>
        <v-container fluid class="d-flex pa-0">
          <AppSlider />
          
          <!-- 여기 반드시 있어야 라우터 child 컴포넌트가 렌더링됨 -->
          <v-container fluid class="pa-4">
            <router-view />
          </v-container>
  
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script setup>
  import AppHeader from '@/components/admin/layout/Appheader.vue'
  import AppSlider from '@/components/admin/layout/AppSlider.vue'
  </script>