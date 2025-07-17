<script setup>
import Appheader from './components/admin/layout/Appheader.vue';
import AppSlider from './components/admin/layout/AppSlider.vue';
import AdminDashboard from './views/admin/AdminDashboard.vue';

</script>

<template>
  <v-app>
    <v-header>
      <Appheader />
    </v-header>
    <AppSlider />
    <v-main>
      <router-view />
      <AdminDashboard />
    </v-main>
  </v-app>
</template>
