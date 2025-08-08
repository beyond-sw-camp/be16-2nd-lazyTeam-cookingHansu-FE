import { 
  apiGet, 
  apiPost, 
  apiPostFormData, 
  apiPut, 
  apiPutFormData, 
  apiDelete 
} from '../../utils/api';
import { handleApiResponse } from '../../models/common/ApiResponse';

// FormData 생성 헬퍼
const createNoticeFormData = (noticeData) => {
  const formData = new FormData();
  formData.append('title', noticeData.title);
  formData.append('content', noticeData.content);
  
  if (noticeData.noticeImage) {
    formData.append('noticeImage', noticeData.noticeImage);
  }
  
  return formData;
};

// API 엔드포인트 상수
const API_ENDPOINTS = {
  LIST: '/notice/list',
  DETAIL: '/notice/detail',
  CREATE: '/admin/notice/create',
  UPDATE: '/admin/notice/update',
  DELETE: '/admin/notice/delete',
};

export const noticeService = {
  // 공지사항 목록 조회
  async getNoticeList(page = 0, size = 10) {
    const response = await apiGet(`${API_ENDPOINTS.LIST}?page=${page}&size=${size}`);
    return handleApiResponse(response);
  },

  // 공지사항 상세 조회
  async getNoticeDetail(id) {
    const response = await apiGet(`${API_ENDPOINTS.DETAIL}/${id}`);
    return handleApiResponse(response);
  },

  // 공지사항 생성 (관리자용)
  async createNotice(noticeData) {
    const formData = createNoticeFormData(noticeData);
    const response = await apiPostFormData(API_ENDPOINTS.CREATE, formData);
    return handleApiResponse(response);
  },

  // 공지사항 수정 (관리자용)
  async updateNotice(id, noticeData) {
    const formData = createNoticeFormData(noticeData);
    const response = await apiPutFormData(`${API_ENDPOINTS.UPDATE}/${id}`, formData);
    return handleApiResponse(response);
  },

  // 공지사항 삭제 (관리자용)
  async deleteNotice(id) {
    const response = await apiDelete(`${API_ENDPOINTS.DELETE}/${id}`);
    return handleApiResponse(response);
  },
};
