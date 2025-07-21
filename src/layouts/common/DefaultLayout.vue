<template>
    <v-app>
      <Header />
  
      <v-main class="bg-grey-lighten-5">
        <v-container class="py-6" fluid>
          <router-view />
        </v-container>
      </v-main>
  
      <Footer />
    </v-app>
  </template>

<script setup>
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
</script>