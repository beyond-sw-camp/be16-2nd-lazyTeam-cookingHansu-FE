<template>
    <v-navigation-drawer app permanent color="#FFE3E3">
      <v-list dense nav>
        <v-list-item v-for="item in items" :key="item.text" link>
          <v-list-item-icon><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>{{ item.text }}</v-list-item-title></v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>
  
  <script setup>
  const items = [
    { text: '대시보드', icon: 'mdi-view-dashboard' },
    { text: '강의 승인', icon: 'mdi-check-circle-outline' },
    { text: '요리사 승인', icon: 'mdi-account-tie' },
    { text: '공지사항 관리', icon: 'mdi-bullhorn' },
    { text: '사용자 관리', icon: 'mdi-account-multiple' },
  ]
  </script>