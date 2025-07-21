<template>
    <v-container>
      <!-- 사용자 관리 제목 -->
      <h2 class="text-h5 font-weight-bold mb-1">사용자 관리</h2>
      <p class="mb-6">플랫폼 사용자들을 관리하세요</p>
  
      <!-- 사용자 목록 -->
      <v-card>
        <v-table>
          <thead>
            <tr>
              <th>프로필</th>
              <th>이름</th>
              <th>이메일</th>
              <th>가입일</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, idx) in paginatedUsers" :key="idx">
              <td>
                <v-avatar size="32">
                  <v-img :src="user.avatar" alt="profile" />
                </v-avatar>
              </td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.joined }}</td>
              <td>
                <v-chip :color="user.active ? 'green' : 'red'" variant="elevated" size="small">
                  {{ user.active ? '활성' : '비활성' }}
                </v-chip>
              </td>
              <td>
                <v-btn icon variant="plain" size="small" @click="toggleUser(idx)">
                  <v-icon color="red">mdi-close-circle-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
  
      <!-- Pagination -->
      <v-row justify="center" class="mt-6">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          color="orange"
          size="small"
          prev-icon="mdi-chevron-left"
          next-icon="mdi-chevron-right"
        />
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const users = ref([
    ...Array.from({ length: 42 }).map((_, i) => ({
      name: `유저 ${i + 1}`,
      email: `user${i + 1}@example.com`,
      joined: `2025. 7.${(i % 30) + 1}.`,
      avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      active: true,
    })),
  ])
  
  const currentPage = ref(1)
  const perPage = 20
  
  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * perPage
    return users.value.slice(start, start + perPage)
  })
  
  const totalPages = computed(() =>
    Math.ceil(users.value.length / perPage)
  )
  
  function toggleUser(idx) {
    const globalIdx = (currentPage.value - 1) * perPage + idx
    users.value[globalIdx].active = !users.value[globalIdx].active
  }
  </script>
  
  <style scoped>
  th,
  td {
    padding: 14px;
    text-align: left;
  }
  </style>