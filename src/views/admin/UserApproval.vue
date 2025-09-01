<template>
  <v-container>
    <!-- 이미지 모달 -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card class="pa-4">
        <v-card-text class="pa-4">
          <div v-if="dialogImageUrl" class="text-center">
            <div v-if="isImageFile(dialogImageUrl)">
              <v-img
                :src="dialogImageUrl"
                max-height="70vh"
                class="rounded-lg mx-auto"
                contain
                :aspect-ratio="16/9"
                @error="handleModalImageError"
              />
            </div>
            <div v-else class="text-center py-8">
              <v-icon size="64" color="primary">mdi-file-document</v-icon>
              <p class="mt-4 text-h6">문서 파일</p>
              <p class="mt-2 text-grey-darken-1">
                이 파일은 이미지가 아닌 문서 파일입니다.
              </p>
              <v-btn
                class="mt-4"
                color="primary"
                variant="elevated"
                @click="downloadFile(dialogImageUrl, 'document.pdf')"
                prepend-icon="mdi-download"
              >
                파일 다운로드
              </v-btn>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <v-icon size="64" color="grey lighten-2">mdi-file-question</v-icon>
            <p class="mt-2 text-grey-darken-1">파일을 불러올 수 없습니다.</p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pa-4">
          <v-btn 
            color="primary" 
            variant="elevated"
            @click="dialog = false"
            prepend-icon="mdi-check"
            size="large"
          >
            확인
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 제목 -->
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">사용자 승인 관리</h2>
        <p>요리사 및 자영업자 승인 요청을 관리합니다</p>
      </v-col>
    </v-row>

    <!-- 로딩 상태 -->
    <LoadingScreen 
      v-if="userApprovalStore.isLoading"
      title="사용자 목록을 불러오는 중"
      description="승인 대기 중인 사용자들을 확인하고 있어요..."
    />

    <!-- 에러 상태 (네트워크 연결 오류만) -->
    <div v-else-if="userApprovalStore.getError" class="error-container">
      <ErrorAlert
        title="연결 오류"
        :message="userApprovalStore.getError"
        @close="userApprovalStore.clearError"
      />
    </div>

    <!-- 탭과 사용자 목록 -->
    <template v-else>
      <!-- 탭 네비게이션 -->
      <v-card class="mb-6" elevation="0">
        <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="custom-tabs">
          <v-tab value="all" class="tab-item">
            <v-icon start>mdi-account-multiple</v-icon>
            전체 ({{ allUsers.length }})
          </v-tab>
          <v-tab value="chef" class="tab-item">
            <v-icon start>mdi-chef-hat</v-icon>
            요리사 ({{ chefUsers.length }})
          </v-tab>
          <v-tab value="business" class="tab-item">
            <v-icon start>mdi-store</v-icon>
            자영업자 ({{ businessUsers.length }})
          </v-tab>
        </v-tabs>
      </v-card>

      <!-- 승인할 유저가 없을 경우 -->
      <v-row v-if="filteredUsers.length === 0" justify="center" class="mt-10 mb-10">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="grey lighten-2">mdi-account-clock-outline</v-icon>
          <h3 class="mt-4">{{ getEmptyMessage() }}</h3>
          <p class="mt-2">
            {{ getEmptyDescription() }}
          </p>
        </v-col>
      </v-row>

      <!-- 유저 목록 -->
      <template v-else>
      <v-row>
        <v-col cols="12" v-for="user in paginatedUsers" :key="user.id">
          <!-- 카드 내부 구조 -->
          <v-card 
            class="pa-4 user-card" 
            elevation="2"
            :class="{ 'processing': userApprovalStore.isUserProcessing(user.id) }"
          >
            <v-row align="center" justify="space-between">
              <v-col cols="auto" class="d-flex align-center">
                <v-avatar size="56" class="mr-4 user-avatar">
                  <v-img 
                    v-if="getUserAvatar(user)" 
                    :src="getUserAvatar(user)" 
                    @error="handleImageError"
                  />
                  <v-icon 
                    v-else
                    size="56" 
                    color="grey lighten-2"
                  >
                    mdi-account-circle
                  </v-icon>
                </v-avatar>
                <div>
                  <v-chip
                    :color="user.roleType === 'chef' ? 'success' : 'orange'"
                    text-color="white"
                    class="mb-2 role-chip"
                    size="small"
                  >
                    <v-icon start size="16">
                      {{ user.roleType === "chef" ? "mdi-chef-hat" : "mdi-store" }}
                    </v-icon>
                    {{ user.roleType === "chef" ? "요리사" : "자영업자" }}
                  </v-chip>
                  <h3 class="text-subtitle-1 font-weight-bold user-name">
                    {{ user.name }}
                  </h3>
                  <div class="text-caption text-grey-darken-1">
                    신청일: {{ formatDateTime(user.createdAt) }}
                  </div>
                </div>
              </v-col>

              <v-col cols="auto" class="d-flex align-center">
                <v-chip color="orange-darken-1" class="mr-3 status-chip" size="small">
                  <v-icon start size="14">mdi-clock-outline</v-icon>
                  승인 대기
                </v-chip>
                <v-btn 
                  color="success" 
                  variant="elevated"
                  class="mr-2 action-btn" 
                  @click="showApprovalDialog(user)"
                  :loading="userApprovalStore.isUserProcessing(user.id)"
                  :disabled="userApprovalStore.isUserProcessing(user.id)"
                >
                  <v-icon start>mdi-check</v-icon>
                  승인
                </v-btn>
                <v-btn 
                  color="error" 
                  variant="outlined"
                  class="action-btn"
                  @click="showRejectDialog(user)"
                  :loading="userApprovalStore.isUserProcessing(user.id)"
                  :disabled="userApprovalStore.isUserProcessing(user.id)"
                >
                  <v-icon start>mdi-close</v-icon>
                  거절
                </v-btn>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- 요리사 정보만 표시 -->
            <v-row v-if="user.roleType === 'chef'">
              <v-col cols="12">
                <div class="detail-section">
                  <div class="detail-header">
                    <v-icon color="success" class="mr-2">mdi-chef-hat</v-icon>
                    <strong>요리사 상세 정보</strong>
                  </div>
                  <div class="detail-content">
                    <div class="detail-item">
                      <span class="detail-label">자격번호:</span>
                      <span class="detail-value">{{ user.licenseNumber }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">전문 분야:</span>
                      <span class="detail-value">{{ user.cuisineType }}</span>
                    </div>
                    <v-btn
                      class="mt-3"
                      size="small"
                      variant="outlined"
                      color="success"
                      @click="openFile(user.licenseImageUrl)"
                    >
                      <v-icon start size="16">
                        {{ getFileIcon(user.licenseImageUrl) }}
                      </v-icon>
                      {{ getFileButtonText(user.licenseImageUrl) }}
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- 자영업자 정보만 표시 -->
            <v-row v-if="user.roleType === 'business'">
              <v-col cols="12">
                <div class="detail-section">
                  <div class="detail-header">
                    <v-icon color="orange" class="mr-2">mdi-store</v-icon>
                    <strong>자영업자 상세 정보</strong>
                  </div>
                  <div class="detail-content">
                    <div class="detail-item">
                      <span class="detail-label">사업자등록번호:</span>
                      <span class="detail-value">{{ user.businessNumber }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">상호명:</span>
                      <span class="detail-value">{{ user.businessName }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">주소:</span>
                      <span class="detail-value">{{ user.businessAddress }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">업종:</span>
                      <span class="detail-value">{{ user.businessType }}</span>
                    </div>
                    <v-btn
                      class="mt-3"
                      size="small"
                      variant="outlined"
                      color="orange"
                      @click="openFile(user.businessImageUrl)"
                    >
                      <v-icon start size="16">
                        {{ getFileIcon(user.businessImageUrl) }}
                      </v-icon>
                      {{ getFileButtonText(user.businessImageUrl) }}
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

        <!-- 페이지네이션 -->
        <div class="d-flex justify-center mt-6">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="currentPage = $event"
          />
        </div>
      </template>
    </template>

    <!-- 승인 확인 모달 -->
    <ApprovalConfirmModal
      v-model="approvalDialog"
      :item-name="selectedUserName"
      item-type="사용자"
      :loading="userApprovalStore.isUserProcessing(selectedUser?.id)"
      @confirm="approveUser"
    />

    <!-- 거절 확인 모달 -->
    <RejectConfirmModal
      v-model="rejectDialog"
      :item-name="selectedUserName"
      item-type="사용자"
      :loading="userApprovalStore.isUserProcessing(selectedUser?.id)"
      @confirm="rejectUser"
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
import { ref, computed, onMounted, watch } from "vue";
import { useUserApprovalStore } from '@/store/admin/userApproval'
import { useAuthStore } from '@/store/auth/auth'
import { useAdminLoginStore } from '@/store/admin/adminLogin'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import Pagination from "../../components/common/Pagination.vue";
import CommonSnackbar from "../../components/common/CommonSnackbar.vue";
import ApprovalConfirmModal from "../../components/common/ApprovalConfirmModal.vue";
import RejectConfirmModal from "../../components/common/RejectConfirmModal.vue";
import LoadingScreen from "../../components/common/LoadingScreen.vue";
import { formatDateTime } from '@/utils/timeUtils'

const userApprovalStore = useUserApprovalStore()
const authStore = useAuthStore()
const adminLoginStore = useAdminLoginStore()

// 관리자 권한 확인
const isAdmin = computed(() => {
  const userRole = authStore.getUserRole
  return userRole === 'ADMIN' || adminLoginStore.isLoggedIn
})

// 탭 상태
const activeTab = ref('all');

// 페이지네이션
const currentPage = ref(1);
const perPage = 4;

// 승인/거절 다이얼로그 관련
const approvalDialog = ref(false)
const rejectDialog = ref(false)
const selectedUser = ref(null)
const selectedUserName = ref('')

// 이미지 모달
const dialog = ref(false);
const dialogImageUrl = ref("");

// 스낵바 관련
const showSnackbar = ref(false);
const snackbarType = ref('success');
const snackbarTitle = ref('');
const snackbarMessage = ref('');

// 모든 사용자 목록 (요리사 + 자영업자)
const allUsers = computed(() => {
  const chefs = userApprovalStore.getWaitingChefs.map(chef => ({
    ...chef,
    roleType: 'chef',
    id: chef.userId,
    // 이미지 URL 필드명 통일
    imageUrl: chef.imageUrl || chef.profileImageUrl || chef.userImageUrl,
    licenseImageUrl: chef.licenseImageUrl || chef.licenseImage || chef.certificateImageUrl
  }));
  
  const businesses = userApprovalStore.getWaitingBusinesses.map(business => ({
    ...business,
    roleType: 'business',
    // 이미지 URL 필드명 통일
    imageUrl: business.imageUrl || business.profileImageUrl || business.userImageUrl,
    businessImageUrl: business.businessImageUrl || business.businessImage || business.registrationImageUrl
  }));
  
  // 생성일시 기준으로 정렬 (최신순)
  return [...chefs, ...businesses].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
});

// 요리사만 필터링
const chefUsers = computed(() => {
  return allUsers.value.filter(user => user.roleType === 'chef');
});

// 자영업자만 필터링
const businessUsers = computed(() => {
  return allUsers.value.filter(user => user.roleType === 'business');
});

// 탭에 따른 필터링된 사용자 목록
const filteredUsers = computed(() => {
  switch (activeTab.value) {
    case 'chef':
      return chefUsers.value;
    case 'business':
      return businessUsers.value;
    default:
      return allUsers.value;
  }
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredUsers.value.slice(start, start + perPage);
});

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / perPage));

// 탭이 변경될 때 첫 페이지로 이동
watch(activeTab, () => {
  currentPage.value = 1;
});

// 성공 메시지 감시
watch(() => userApprovalStore.getSuccessMessage, (newMessage) => {
  if (newMessage) {
    snackbarType.value = 'success';
    snackbarTitle.value = '성공';
    snackbarMessage.value = newMessage;
    showSnackbar.value = true;
    
    // 1초 후 자동으로 닫기
    setTimeout(() => {
      closeSnackbar();
    }, 1000);
  }
});

// 스낵바 닫기
const closeSnackbar = () => {
  showSnackbar.value = false;
  userApprovalStore.clearMessages();
};

// 사용자 정보 헬퍼 함수들
const getUserAvatar = (user) => {
  if (user.roleType === 'chef') {
    return user.imageUrl || null;
  } else {
    return user.imageUrl || null;
  }
};

// 이미지 로딩 실패 시 기본 아이콘으로 변경
const handleImageError = (event) => {
  event.target.src = '/default-avatar.png'; // 또는 기본 아이콘 경로
};

// 모달 이미지 에러 핸들러
const handleModalImageError = () => {
  dialogImageUrl.value = '';
  snackbarType.value = 'error';
  snackbarTitle.value = '오류';
  snackbarMessage.value = '이미지를 불러올 수 없습니다.';
  showSnackbar.value = true;
  setTimeout(() => closeSnackbar(), 2000);
};

// 승인 다이얼로그 표시
const showApprovalDialog = (user) => {
  selectedUser.value = user;
  selectedUserName.value = user.name;
  approvalDialog.value = true;
};

// 사용자 승인
const approveUser = async () => {
  try {
    await userApprovalStore.approveUser(selectedUser.value.id);
    approvalDialog.value = false;
  } catch (error) {
    console.error('사용자 승인 실패:', error);
    // 네트워크 오류가 아닌 경우에만 스낵바 메시지 표시
    if (!error.message || (!error.message.includes('서버와의 연결') && !error.message.includes('네트워크 연결'))) {
      snackbarType.value = 'error';
      snackbarTitle.value = '오류';
      snackbarMessage.value = error.message || '사용자 승인에 실패했습니다.';
      showSnackbar.value = true;
      
      // 1초 후 자동으로 닫기
      setTimeout(() => {
        closeSnackbar();
      }, 1000);
    }
  }
};

// 거절 다이얼로그 표시
const showRejectDialog = (user) => {
  selectedUser.value = user;
  selectedUserName.value = user.name;
  rejectDialog.value = true;
};

// 사용자 거절
const rejectUser = async (reason) => {
  try {
    await userApprovalStore.rejectUser(selectedUser.value.id, reason);
    rejectDialog.value = false;
  } catch (error) {
    console.error('사용자 거절 실패:', error);
    // 네트워크 오류가 아닌 경우에만 스낵바 메시지 표시
    if (!error.message || (!error.message.includes('서버와의 연결') && !error.message.includes('네트워크 연결'))) {
      snackbarType.value = 'error';
      snackbarTitle.value = '오류';
      snackbarMessage.value = error.message || '사용자 거절에 실패했습니다.';
      showSnackbar.value = true;
      
      // 1초 후 자동으로 닫기
      setTimeout(() => {
        closeSnackbar();
      }, 1000);
    }
  }
};

// 파일 열기
const openFile = (url) => {
  console.log('Opening file with URL:', url); // 디버깅용
  
  if (!url || url === 'null' || url === 'undefined') {
    snackbarType.value = 'warning';
    snackbarTitle.value = '알림';
    snackbarMessage.value = '업로드된 파일이 없습니다.';
    showSnackbar.value = true;
    setTimeout(() => closeSnackbar(), 2000);
    return;
  }
  
  // URL이 상대 경로인 경우 절대 경로로 변환
  let fullUrl = url;
  if (!url.startsWith('http') && !url.startsWith('data:')) {
    fullUrl = url.startsWith('/') ? url : `/${url}`;
  }
  
  // 파일 확장자로 타입 판단
  const fileExtension = getFileExtension(fullUrl);
  const isPdf = fileExtension === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  
  if (isPdf) {
    // PDF 파일인 경우 새 탭에서 열기
    window.open(fullUrl, '_blank');
  } else if (isImage) {
    // 이미지 파일인 경우 모달로 표시
    dialogImageUrl.value = fullUrl;
    dialog.value = true;
  } else {
    // 기타 파일인 경우 다운로드
    downloadFile(fullUrl, `document.${fileExtension || 'pdf'}`);
  }
};

// 파일 확장자 추출
const getFileExtension = (url) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const extension = pathname.split('.').pop()?.toLowerCase();
    return extension;
  } catch (e) {
    // URL 파싱 실패 시 경로에서 확장자 추출
    const pathParts = url.split('/');
    const filename = pathParts[pathParts.length - 1];
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension;
  }
};

// 파일 다운로드
const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 파일 타입에 따른 아이콘 반환
const getFileIcon = (url) => {
  if (!url) return 'mdi-file-question';
  
  const extension = getFileExtension(url);
  if (extension === 'pdf') return 'mdi-file-pdf-box';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'mdi-image';
  return 'mdi-file-document';
};

// 파일 타입에 따른 버튼 텍스트 반환
const getFileButtonText = (url) => {
  if (!url) return '파일 없음';
  
  const extension = getFileExtension(url);
  if (extension === 'pdf') return 'PDF 보기';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return '이미지 보기';
  return '파일 보기';
};

// 모달 제목 반환
const getModalTitle = (url) => {
  if (!url) return '파일 확인';
  
  const extension = getFileExtension(url);
  if (extension === 'pdf') return 'PDF 문서 확인';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return '이미지 확인';
  return '문서 확인';
};

// 이미지 파일 여부 확인
const isImageFile = (url) => {
  if (!url) return false;
  
  const extension = getFileExtension(url);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
};

// 빈 상태 메시지
const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'chef':
      return '승인 대기 중인 요리사가 없습니다';
    case 'business':
      return '승인 대기 중인 자영업자가 없습니다';
    default:
      return '승인할 요청이 없습니다';
  }
};

const getEmptyDescription = () => {
  switch (activeTab.value) {
    case 'chef':
      return '요리사 승인 요청이 도착하면 이곳에 표시됩니다.';
    case 'business':
      return '자영업자 승인 요청이 도착하면 이곳에 표시됩니다.';
    default:
      return '요리사 또는 자영업자의 승인 요청이 도착하면 이곳에 표시됩니다.';
  }
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  // 관리자 권한 확인
  if (!isAdmin.value) {
    console.error('관리자 권한이 없습니다.')
    return
  }
  
  await Promise.all([
    userApprovalStore.fetchWaitingChefs(),
    userApprovalStore.fetchWaitingBusinesses()
  ]);
});
</script>

<style scoped>
.error-container {
  margin: 20px 0;
}

/* 탭 스타일 */
.custom-tabs {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  overflow: hidden;
}

/* 사용자 카드 애니메이션 */
.user-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-card.processing {
  opacity: 0.6;
  transform: scale(0.98);
  pointer-events: none;
}

/* 부드러운 제거 애니메이션 */
.user-card-enter-active,
.user-card-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-card-leave-to {
  opacity: 0;
  transform: translateX(-100%);
  height: 0;
  margin: 0;
  padding: 0;
}

.tab-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  border-radius: 10px !important;
  margin: 4px;
  position: relative;
  overflow: hidden;
}

.tab-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.tab-item:hover::before {
  left: 100%;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.8) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border-radius: 10px !important;
}

.v-tab--selected {
  background: rgba(25, 118, 210, 0.1) !important;
  color: #1976d2 !important;
  border-radius: 10px !important;
}

.v-tab--selected:hover {
  background: rgba(25, 118, 210, 0.15) !important;
}

/* 사용자 카드 스타일 */
.user-card {
  border-radius: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.user-avatar {
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}



.role-chip {
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-chip {
  font-weight: 500;
}

.user-name {
  color: #2c3e50;
  margin: 8px 0 4px 0;
}

.action-btn {
  font-weight: 600;
  min-width: 80px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 상세 정보 스타일 */
.detail-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #2c3e50;
}

.detail-content {
  margin-left: 24px;
}

.detail-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
}

.detail-value {
  color: #2c3e50;
  flex: 1;
}

.v-avatar img {
  object-fit: cover;
}

.v-overlay__scrim {
  backdrop-filter: blur(30px);
  background-color: rgba(0, 0, 0, 0.8) !important;
}

/* 이미지 모달 스타일 */
.v-dialog .v-card {
  border-radius: 16px;
  overflow: hidden;
}

.v-dialog .v-card-title {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.v-dialog .v-img {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .user-card {
    margin-bottom: 12px;
  }
  
  .detail-section {
    padding: 12px;
  }
  
  .detail-content {
    margin-left: 0;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .detail-label {
    min-width: auto;
    font-size: 0.9rem;
  }
  
  .action-btn {
    min-width: 70px;
    font-size: 0.9rem;
  }
}
</style>
