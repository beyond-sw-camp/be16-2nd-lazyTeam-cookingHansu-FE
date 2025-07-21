<template>
    <v-app>
      <AppHeader />
      <AppSlider />
  
      <v-main>
        <v-container fluid class="pa-4">
          <router-view />
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script setup>
  import AppHeader from '@/components/admin/Appheader.vue'
  import AppSlider from '@/components/admin/AppSlider.vue'
  </script>