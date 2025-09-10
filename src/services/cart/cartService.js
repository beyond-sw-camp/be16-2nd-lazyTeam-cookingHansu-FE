import { apiClient } from '@/utils/interceptor'

export const cartService = {
  // 장바구니 목록 조회
  async getCartList() {
    try {
      const response = await apiClient.get('/cart/list')
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '장바구니 목록을 가져오는데 실패했습니다.')
      }
    } catch (error) {
      throw error
    }
  }
}
