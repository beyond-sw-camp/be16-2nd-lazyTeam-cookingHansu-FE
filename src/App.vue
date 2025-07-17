<script setup>
import Appheader from './components/admin/layout/Appheader.vue';
import AppSlider from './components/admin/layout/AppSlider.vue';

</script>

<template>
  <v-app>
    <Appheader />
    <AppSlider />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
