<template>
  <v-btn
    :color="isBookmarked ? 'amber' : 'grey-lighten-1'"
    :variant="isBookmarked ? 'flat' : 'outlined'"
    :loading="loading"
    @click="handleClick"
    class="bookmark-button"
  >
    <v-icon 
      :icon="isBookmarked ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
      :color="isBookmarked ? 'white' : 'amber'"
      start
    />
    <span :class="{ 'text-white': isBookmarked, 'text-amber': !isBookmarked }">
      북마크
    </span>
  </v-btn>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  postId: {
    type: String,
    required: true
  },
  initialBookmarked: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default'
  }
})

// Emits
const emit = defineEmits(['bookmark-changed'])

// Reactive data
const isBookmarked = ref(props.initialBookmarked)
const loading = ref(false)

// Watch for prop changes
watch(() => props.initialBookmarked, (newVal) => {
  isBookmarked.value = newVal
})

// Methods
const toggleBookmark = async () => {
  if (loading.value) return

  // 로그인 확인
  if (!checkAuthentication()) {
    return
  }

  const previousBookmarked = isBookmarked.value

  // Optimistic update
  isBookmarked.value = !isBookmarked.value

  loading.value = true

  try {
    if (isBookmarked.value) {
      // 북마크 추가
      const response = await fetch(`/api/posts/${props.postId}/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('북마크 추가 실패')
      }

      showSuccessMessage('북마크에 추가되었습니다.')
    } else {
      // 북마크 취소
      const response = await fetch(`/api/posts/${props.postId}/bookmarks`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('북마크 취소 실패')
      }

      showSuccessMessage('북마크에서 제거되었습니다.')
    }

    // 부모 컴포넌트에 변경사항 알림
    emit('bookmark-changed', {
      postId: props.postId,
      isBookmarked: isBookmarked.value
    })

  } catch (error) {
    console.error('북마크 처리 실패:', error)
    
    // 에러 발생 시 이전 상태로 복원
    isBookmarked.value = previousBookmarked

    // 사용자에게 에러 알림
    showErrorMessage('북마크 처리 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// 인증 토큰 가져오기
const getAuthToken = () => {
  return localStorage.getItem('authToken') || ''
}

// 로그인 확인
const checkAuthentication = () => {
  const token = getAuthToken()
  if (!token) {
    showErrorMessage('로그인이 필요한 기능입니다.')
    return false
  }
  return true
}

// 성공 메시지 표시
const showSuccessMessage = (message) => {
  // 실제 구현에서는 Vuetify의 snackbar 사용
  console.log(message)
}

// 에러 메시지 표시
const showErrorMessage = (message) => {
  // 실제 구현에서는 Vuetify의 snackbar 사용
  console.error(message)
}

// 컴포넌트가 클릭될 때 인증 확인
const handleClick = () => {
  if (checkAuthentication()) {
    toggleBookmark()
  }
}
</script>

<style scoped>
.bookmark-button {
  transition: all 0.3s ease;
  text-transform: none;
}

.bookmark-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.bookmark-button .v-icon {
  transition: transform 0.2s ease;
}

.bookmark-button:active .v-icon {
  transform: scale(1.1);
}
</style>