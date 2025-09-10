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
    <LoadingScreen 
      v-if="userManagementStore.isLoading"
      title="사용자 목록을 불러오는 중"
      description="플랫폼 사용자 정보를 확인하고 있어요..."
    />

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
          <tr v-for="user in userList" :key="user.userId">
            <td>
              <v-avatar size="32">
                <v-img 
                  :src="user.picture || '/default-avatar.png'" 
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
                :loading="userManagementStore.isUserLoading(user.userId)"
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
                :loading="userManagementStore.isUserLoading(user.userId)"
              >
                <v-icon>mdi-close-circle-outline</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- 데이터가 없을 때 -->
      <v-card-text v-if="!hasUsers && !userManagementStore.isLoading" class="text-center py-8">
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
      v-if="hasUsers"
      :current-page="paginationInfo.currentPage + 1"
      :total-pages="paginationInfo.totalPages"
      :total-elements="paginationInfo.totalElements"
      :page-size="paginationInfo.pageSize"
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
import { ref, computed, watch, onMounted } from 'vue'
import { useUserManagementStore } from '../../store/admin/userManagement'
import { useAuthStore } from '../../store/auth/auth'
import { useAdminLoginStore } from '../../store/admin/adminLogin'
import Pagination from '../../components/common/Pagination.vue'
import CommonSnackbar from '../../components/common/CommonSnackbar.vue'
import LoadingScreen from '../../components/common/LoadingScreen.vue'
import { formatDate } from '../../utils/timeUtils'

const userManagementStore = useUserManagementStore()
const authStore = useAuthStore()
const adminLoginStore = useAdminLoginStore()

// 관리자 권한 확인
const isAdmin = computed(() => {
  const userRole = authStore.getUserRole
  return userRole === 'ADMIN' || adminLoginStore.isLoggedIn
})

const showSnackbar = ref(false)
const snackbarType = ref('success')
const snackbarTitle = ref('')
const snackbarMessage = ref('')

// 사용자 목록 computed 속성 추가
const userList = computed(() => userManagementStore.getUserList)
const hasUsers = computed(() => userManagementStore.hasUsers)
const paginationInfo = computed(() => userManagementStore.getPaginationInfo)

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
  userManagementStore.fetchUserList(page - 1, paginationInfo.value.pageSize)
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
  // 관리자 권한 확인
  if (!isAdmin.value) {
    console.error('관리자 권한이 없습니다.')
    return
  }
  
  loadUserList()
})
</script>

<style scoped>
th,
td {
  padding: 14px;
  text-align: left;
}
</style>