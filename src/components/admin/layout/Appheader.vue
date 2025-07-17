<template>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>요리한수</v-toolbar-title>
      <v-spacer></v-spacer>
      <div class="user-info">
        <v-icon>관리자 아이콘</v-icon>
        <span>관리자</span>
        <v-btn text @click="logout">로그아웃</v-btn>
      </div>
    </v-app-bar>
  </template>
  
  <script setup>
  const logout = () => {
    console.log('로그아웃')
  }
  </script>
  
  <style scoped>
  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  </style>