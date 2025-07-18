<template>
  <v-app>
    <Appheader />
    <v-layout>
      <AppSlider />
      <v-main>
        <AdminDashboard />
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import Appheader from '@/components/admin/layout/Appheader.vue'
import AppSlider from '@/components/admin/layout/AppSlider.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
</script>
