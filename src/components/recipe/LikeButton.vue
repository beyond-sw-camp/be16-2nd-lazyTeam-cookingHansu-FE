<template>
  <v-btn
    :color="isLiked ? 'red' : 'grey-lighten-1'"
    :variant="isLiked ? 'flat' : 'outlined'"
    :loading="loading"
    @click="handleClick"
    class="like-button"
  >
    <v-icon 
      :icon="isLiked ? 'mdi-heart' : 'mdi-heart-outline'"
      :color="isLiked ? 'white' : 'red'"
      start
    />
    <span :class="{ 'text-white': isLiked, 'text-red': !isLiked }">
      {{ likeCount }}
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
  initialCount: {
    type: Number,
    default: 0
  },
  initialLiked: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default'
  }
})

// Emits
const emit = defineEmits(['like-changed'])

// Reactive data
const isLiked = ref(props.initialLiked)
const likeCount = ref(props.initialCount)
const loading = ref(false)

// Watch for prop changes
watch(() => props.initialLiked, (newVal) => {
  isLiked.value = newVal
})

watch(() => props.initialCount, (newVal) => {
  likeCount.value = newVal
})

// Methods
const toggleLike = async () => {
  if (loading.value) return

  const previousLiked = isLiked.value
  const previousCount = likeCount.value

  // Optimistic update
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1

  loading.value = true

  try {
    if (isLiked.value) {
      // 좋아요 추가
      const response = await fetch(`/api/posts/${props.postId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('좋아요 추가 실패')
      }

      const data = await response.json()
      likeCount.value = data.likeCount
    } else {
      // 좋아요 취소
      const response = await fetch(`/api/posts/${props.postId}/likes`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('좋아요 취소 실패')
      }

      const data = await response.json()
      likeCount.value = data.likeCount
    }

    // 부모 컴포넌트에 변경사항 알림
    emit('like-changed', {
      postId: props.postId,
      isLiked: isLiked.value,
      likeCount: likeCount.value
    })

  } catch (error) {
    console.error('좋아요 처리 실패:', error)
    
    // 에러 발생 시 이전 상태로 복원
    isLiked.value = previousLiked
    likeCount.value = previousCount

    // 사용자에게 에러 알림
    showErrorMessage('좋아요 처리 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// 인증 토큰 가져오기 (실제 구현에서는 store나 composable에서 가져올 것)
const getAuthToken = () => {
  return localStorage.getItem('authToken') || ''
}

// 에러 메시지 표시 (실제 구현에서는 toast나 snackbar 사용)
const showErrorMessage = (message) => {
  // Vuetify의 snackbar나 toast 컴포넌트 사용
  console.error(message)
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

// 컴포넌트가 클릭될 때 인증 확인
const handleClick = () => {
  if (checkAuthentication()) {
    toggleLike()
  }
}
</script>

<style scoped>
.like-button {
  transition: all 0.3s ease;
  text-transform: none;
}

.like-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.like-button .v-icon {
  transition: transform 0.2s ease;
}

.like-button:active .v-icon {
  transform: scale(1.2);
}
</style>