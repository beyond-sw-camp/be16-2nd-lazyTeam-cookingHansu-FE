import { apiGet, API_BASE_URL } from '@/utils/api.js'

export const cartService = {
  // 장바구니 목록 조회
  async getCartList() {
    try {
      console.log('장바구니 목록 조회 시작...')
      console.log('API_BASE_URL:', API_BASE_URL)
      
      const response = await apiGet('/cart/list')
      
      console.log('API 응답 상태:', response.status)
      console.log('API 응답 헤더:', response.headers)
      
      if (!response.ok) {
        console.error('API 응답 실패:', response.status, response.statusText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('API 응답 데이터:', result)
      
      if (result.success) {
        console.log('장바구니 데이터 성공적으로 가져옴:', result.data)
        return result.data
      } else {
        console.error('API 응답에서 success가 false:', result)
        throw new Error(result.message || '장바구니 목록을 가져오는데 실패했습니다.')
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
