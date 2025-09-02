<template>
  <div class="deleted-user-confirm-page">
    <v-container class="fill-height">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6" lg="6" xl="4">
          <v-card class="pa-6" elevation="3">
            <!-- 헤더 -->
            <div class="text-center mb-6">
              <v-icon size="64" color="warning" class="mb-4">mdi-account-remove</v-icon>
              <h2 class="text-h4 font-weight-bold mb-2">탈퇴한 회원입니다</h2>
              <p class="text-body-1 text-grey-darken-1">
                이전에 탈퇴한 계정으로 로그인하셨습니다.
              </p>
            </div>

            <!-- 사용자 정보 표시 -->
            <v-card class="mb-6" variant="outlined">
              <v-card-text>
                <div class="d-flex align-center mb-3">
                  <v-avatar size="48" class="me-3">
                    <v-img 
                      :src="userInfo.profileImageUrl" 
                      alt="profile"
                      cover
                      @error="handleImageError"
                    />
                  </v-avatar>
                  <div>
                    <h3 class="text-h6 font-weight-medium">{{ userInfo.name }}</h3>
                    <p class="text-body-2 text-grey-darken-1">{{ userInfo.email }}</p>
                  </div>
                </div>
                <v-chip 
                  :color="getOAuthColor(userInfo.oauthType)" 
                  variant="elevated" 
                  size="small"
                >
                  {{ getOAuthName(userInfo.oauthType) }} 로그인
                </v-chip>
              </v-card-text>
            </v-card>

            <!-- 안내 메시지 -->
            <v-alert
              type="info"
              variant="tonal"
              class="mb-6"
            >
              <template v-slot:prepend>
                <v-icon>mdi-information</v-icon>
              </template>
              <p class="mb-2">
                <strong>계정을 복구하시겠습니까?</strong>
              </p>
              <ul class="text-body-2">
                <li>기존 계정 정보가 복구됩니다</li>
                <li>복구 후 정상적으로 서비스를 이용하실 수 있습니다</li>
              </ul>
            </v-alert>

            <!-- 버튼 그룹 -->
            <div class="d-flex gap-3">
              <v-btn
                color="orange"
                size="large"
                block
                @click="handleRestore"
                :loading="isLoading"
                :disabled="isLoading"
              >
                <v-icon start>mdi-account-check</v-icon>
                계정 복구하기
              </v-btn>
            </div>

            <div class="text-center mt-4">
              <v-btn
                variant="text"
                color="grey"
                @click="handleCancel"
                :disabled="isLoading"
              >
                취소하고 다른 계정으로 로그인
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 복구 성공 모달 -->
    <v-dialog v-model="showSuccessModal" max-width="400" persistent>
      <v-card>
        <v-card-text class="text-center pa-6">
          <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
          <h3 class="text-h5 font-weight-bold mb-2">복구 완료!</h3>
          <p class="text-body-1">
            계정이 성공적으로 복구되었습니다.
          </p>
        </v-card-text>
        <v-card-actions class="justify-center pb-6">
          <v-btn
            color="primary"
            size="large"
            @click="handleSuccessConfirm"
          >
            확인
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth/auth'
import { useNotifications } from '@/composables/useNotifications'
import { useNotificationStore } from '@/store/notification/notification'

const router = useRouter()
const authStore = useAuthStore()
const { showNotification } = useNotifications()
const notificationStore = useNotificationStore()

// 상태 관리
const isLoading = ref(false)
const showSuccessModal = ref(false)

// 라우터에서 전달받은 사용자 정보 (프로필 이미지 URL 포함)
const userInfo = computed(() => {
  try {
    const route = router.currentRoute.value;
    const userInfoParam = route.params.userInfo || route.query.userInfo;
    console.log('route: ', route);
    console.log('userInfoParam: ', userInfoParam);
    
    if (userInfoParam) {
      const decoded = decodeURIComponent(userInfoParam);
      const parsed = JSON.parse(decoded);
      console.log('parsed: ', parsed);
      
      // 프로필 이미지 URL 정규화
      const normalizedUserInfo = {
        ...parsed,
        // 프로필 이미지 URL을 표준화된 필드로 설정
        profileImageUrl: parsed.picture || parsed.profileImageUrl || parsed.profileImage || parsed.avatar || parsed.image || '/default-avatar.png'
      };
      
      console.log('탈퇴한 사용자 정보 (정규화됨):', normalizedUserInfo);
      return normalizedUserInfo;
    }
    
    console.warn('사용자 정보를 찾을 수 없습니다.');
    return { profileImageUrl: '/default-avatar.png' };
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error);
    return { profileImageUrl: '/default-avatar.png' };
  }
})



// 이미지 로드 에러 처리
const handleImageError = (event) => {
  console.warn('프로필 이미지 로드 실패:', event.target.src);
  event.target.src = '/default-avatar.png';
}

// OAuth 타입별 색상
const getOAuthColor = (oauthType) => {
  const colors = {
    'GOOGLE': 'red',
    'KAKAO': 'yellow',
    'NAVER': 'green'
  }
  return colors[oauthType] || 'grey'
}

// OAuth 타입별 이름
const getOAuthName = (oauthType) => {
  const names = {
    'GOOGLE': 'Google',
    'KAKAO': 'Kakao',
    'NAVER': 'Naver'
  }
  return names[oauthType] || oauthType
}

    // 계정 복구 처리
    const handleRestore = async () => {
      try {
        isLoading.value = true

        // 회원 복구 API 호출
        const restoreData = {
          socialId: userInfo.value.socialId,
          oauthType: userInfo.value.oauthType,
          picture: userInfo.value.profileImageUrl // 정규화된 프로필 이미지 URL 사용
        }

        const response = await authStore.restoreUser(restoreData)
        
        if (response.success) {
          showSuccessModal.value = true
        } else {
          throw new Error(response.message || '회원 복구에 실패했습니다.')
        }
      } catch (error) {
        console.error('User restoration failed:', error)
        showNotification(error.message || '회원 복구에 실패했습니다.', 'error')
      } finally {
        isLoading.value = false
      }
    }

// 복구 성공 확인
const handleSuccessConfirm = () => {
  showSuccessModal.value = false
  
  // 실시간 알림 재연결
  if (authStore.user?.id) {
    try {
      notificationStore.connectToNotificationStream(authStore.user.id)
      console.log('회원 복구 후 실시간 알림 재연결 완료')
    } catch (error) {
      console.error('실시간 알림 재연결 실패:', error)
    }
  }
  
  router.push('/')
}

// 취소 처리
const handleCancel = () => {
  authStore.clearAuth()
  router.push('/login')
}
</script>

<style scoped>
.deleted-user-confirm-page {
  min-height: 100vh;
  background: #f5f1e8;
}

.v-card {
  border-radius: 16px;
}
</style>
