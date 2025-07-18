<template>
    <v-app-bar app :color="colors.text" dark>
      <v-toolbar-title :style="{ color: colors.primary }">요리한수</v-toolbar-title>
      <v-spacer></v-spacer>
      <div class="user-info">
        <div class="icon-wrapper">
            <img src="@/assets/icons/dashboard.ico" alt="user" width="20" />
        </div>
        <span>관리자님</span>
        <v-btn text :color="colors.white" @click="logout">로그아웃</v-btn>
      </div>
    </v-app-bar>
  </template>
  
  <script>
  import { colors } from '@/constants/color.js'
  
  export default {
    data() {
      return { colors }
    },
    methods: {
      logout() {
        console.log('로그아웃')
      },
    },
  }
  </script>
  
  <style scoped>
  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
  }
  .icon-wrapper {
  background-color: transparent;
}

  </style>