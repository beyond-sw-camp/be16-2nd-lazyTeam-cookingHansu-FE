<template>
  <v-container>
    <!-- 사용자 관리 제목 -->
    <h2 class="text-h5 font-weight-bold mb-1">사용자 관리</h2>
    <p class="mb-6">플랫폼 사용자들을 관리하세요</p>

    <!-- 에러 메시지 -->
    <v-alert
      v-if="userManagementStore.getError"
      type="error"
      variant="tonal"
      closable
      @click:close="userManagementStore.clearError()"
      class="mb-4"
    >
      {{ userManagementStore.getError }}
    </v-alert>

    <!-- 로딩 상태 -->
    <div v-if="userManagementStore.isLoading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="loading-text">사용자 목록을 불러오는 중...</p>
    </div>

    <!-- 사용자 목록 -->
    <v-card v-else-if="!userManagementStore.getLoadError">
      <v-table>
        <thead>
          <tr>
            <th>프로필</th>
            <th>닉네임</th>
            <th>이메일</th>
            <th>가입일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userManagementStore.getUserList" :key="user.userId">
            <td>
              <v-avatar size="32">
                <v-img 
                  :src="user.profileImageUrl || '/default-avatar.png'" 
                  alt="profile"
                  cover
                />
              </v-avatar>
            </td>
            <td>{{ user.nickname }}</td>
            <td>{{ user.email }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <v-chip 
                :color="user.loginStatus === 'ACTIVE' ? 'green' : 'red'" 
                variant="elevated" 
                size="small"
              >
                {{ user.loginStatus === 'ACTIVE' ? '활성' : '비활성' }}
              </v-chip>
            </td>
            <td>
              <v-btn 
                v-if="user.loginStatus === 'INACTIVE'"
                icon 
                variant="plain" 
                size="small" 
                color="green"
                @click="activateUser(user.userId)"
                :loading="userManagementStore.isLoading"
              >
                <v-icon>mdi-check-circle-outline</v-icon>
              </v-btn>
              <v-btn 
                v-else
                icon 
                variant="plain" 
                size="small" 
                color="red"
                @click="inactiveUser(user.userId)"
                :loading="userManagementStore.isLoading"
              >
                <v-icon>mdi-close-circle-outline</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- 데이터가 없을 때 -->
      <v-card-text v-if="!userManagementStore.hasUsers && !userManagementStore.isLoading" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1">mdi-account-group-outline</v-icon>
        <p class="text-h6 text-grey mt-4">등록된 사용자가 없습니다.</p>
      </v-card-text>
    </v-card>

    <!-- 로드 에러 메시지 -->
    <v-card v-if="userManagementStore.getLoadError" class="text-center py-8">
      <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
      <p class="text-h6 text-error mt-4">{{ userManagementStore.getLoadError }}</p>
      <v-btn 
        color="primary" 
        class="mt-4"
        @click="loadUserList"
      >
        다시 시도
      </v-btn>
    </v-card>

    <!-- Pagination -->
    <Pagination
      v-if="userManagementStore.hasUsers"
      :current-page="userManagementStore.getPaginationInfo.currentPage + 1"
      :total-pages="userManagementStore.getPaginationInfo.totalPages"
      :total-elements="userManagementStore.getPaginationInfo.totalElements"
      :page-size="userManagementStore.getPaginationInfo.pageSize"
      @page-change="handlePageChange"
    />

    <!-- 공용 스낵바 -->
    <CommonSnackbar
      v-if="showSnackbar"
      :type="snackbarType"
      :title="snackbarTitle"
      :message="snackbarMessage"
      @close="closeSnackbar"
    />
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUserManagementStore } from '../../store/admin/userManagement'
import Pagination from '../../components/common/Pagination.vue'
import CommonSnackbar from '../../components/common/CommonSnackbar.vue'
import { formatDate } from '../../utils/timeUtils'

const userManagementStore = useUserManagementStore()
const showSnackbar = ref(false)
const snackbarType = ref('success')
const snackbarTitle = ref('')
const snackbarMessage = ref('')

// 성공 메시지 감시
watch(() => userManagementStore.getSuccessMessage, (newMessage) => {
  if (newMessage) {
    snackbarType.value = 'success'
    snackbarTitle.value = '성공'
    snackbarMessage.value = newMessage
    showSnackbar.value = true
    
    // 1초 후 자동으로 닫기
    setTimeout(() => {
      closeSnackbar()
    }, 1000)
  }
})

// 스낵바 닫기
const closeSnackbar = () => {
  showSnackbar.value = false
  userManagementStore.clearMessages()
}

// 페이지 변경 핸들러
const handlePageChange = (page) => {
  userManagementStore.fetchUserList(page - 1, userManagementStore.getPaginationInfo.pageSize)
}

// 사용자 활성화
const activateUser = async (userId) => {
  try {
    await userManagementStore.activateUser(userId)
  } catch (error) {
    console.error('사용자 활성화 실패:', error)
    // 에러 스낵바 표시
    snackbarType.value = 'error'
    snackbarTitle.value = '오류'
    snackbarMessage.value = error.message || '사용자 활성화에 실패했습니다.'
    showSnackbar.value = true
    
    // 1초 후 자동으로 닫기
    setTimeout(() => {
      closeSnackbar()
    }, 1000)
  }
}

// 사용자 비활성화
const inactiveUser = async (userId) => {
  try {
    await userManagementStore.inactiveUser(userId)
  } catch (error) {
    console.error('사용자 비활성화 실패:', error)
    // 에러 스낵바 표시
    snackbarType.value = 'error'
    snackbarTitle.value = '오류'
    snackbarMessage.value = error.message || '사용자 비활성화에 실패했습니다.'
    showSnackbar.value = true
    
    // 1초 후 자동으로 닫기
    setTimeout(() => {
      closeSnackbar()
    }, 1000)
  }
}

// 사용자 목록 로드
const loadUserList = () => {
  userManagementStore.fetchUserList(0, 10)
}

// 컴포넌트 마운트 시 사용자 목록 로드
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
th,
td {
  padding: 14px;
  text-align: left;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-text {
  margin-top: 20px;
  color: #666;
  font-size: 1.1rem;
}
</style>