import { apiPost } from '@/utils/api';

export const lectureProgressService = {
  // 영상 진행도 저장
  async saveVideoProgress(videoId, second) {
    try {
      const response = await apiPost(`/lecture/progress/${videoId}?second=${second}`);
      return response;
    } catch (error) {
      console.error('영상 진행도 저장 실패:', error);
      throw error;
    }
  }
};
