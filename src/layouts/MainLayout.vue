<!-- 임시 레이아웃 -->
<template>
  <v-app>
    <Header />
    <v-main>
      <v-container fluid class="pa-4" style="padding-top:80px;">
        <router-view />
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>
<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script> 