<template>
    <v-navigation-drawer app permanent :color="colors.white">
      <v-list dense nav>
        <v-list-item v-for="item in items" :key="item.text" link>
          <v-list-item-icon>
            <img :src="item.icon" alt="icon" width="20" />
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>
  
  <script>
  import { colors } from '@/constants/color.js'
  
  export default {
    data() {
      return {
        colors,
        items: [
          { text: '대시보드', icon: new URL('@/assets/icons/dashboard.ico', import.meta.url).href },
          { text: '강의 승인', icon: new URL('@/assets/icons/lecture_approval.ico', import.meta.url).href },
          { text: '요리사 승인', icon: new URL('@/assets/icons/chef_approval.ico', import.meta.url).href },
          { text: '공지사항 관리', icon: new URL('@/assets/icons/announcement_mgmt.ico', import.meta.url).href },
          { text: '사용자 관리', icon: new URL('@/assets/icons/user_mgmt.ico', import.meta.url).href },
        ],
      }
    },
  }
  </script>
  