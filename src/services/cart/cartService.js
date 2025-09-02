import { apiClient } from '@/utils/interceptor'

export const cartService = {
  // 장바구니 목록 조회
  async getCartList() {
    try {
      console.log('장바구니 목록 조회 시작...')
      
      const response = await apiClient.get('/cart/list')
      
      console.log('API 응답 상태:', response.status)
      console.log('API 응답 데이터:', response.data)
      
      if (response.data.success) {
        console.log('장바구니 데이터 성공적으로 가져옴:', response.data.data)
        return response.data.data
      } else {
        console.error('API 응답에서 success가 false:', response.data)
        throw new Error(response.data.message || '장바구니 목록을 가져오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('장바구니 목록 조회 실패:', error)
      console.error('에러 상세 정보:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      throw error
    }
  }
}
