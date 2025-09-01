// API Interceptor - 중앙 집중식 토큰 관리 및 인증 처리
class ApiInterceptor {
  constructor() {
    // 공개 엔드포인트 (인증 불필요)
    this.publicEndpoints = [
      '/api/posts', '/api/post', '/lecture/qna', '/post/comment/list',
      '/lecture/list', '/lecture/detail', '/notice/list', '/notice/detail',
      '/landing', '/login', '/oauth', '/add-info', '/user/refresh'
    ];
    
    // 인증 관련 엔드포인트 (토큰 불필요)
    this.authEndpoints = [
      '/user/login', '/user/register', '/user/social', '/user/refresh',
      '/admin/login' // 관리자 로그인 추가
    ];

    // 디바운싱을 위한 타이머
    this.debounceTimers = new Map();
    this.debounceDelay = 300; // 300ms
  }

  // 엔드포인트가 공개인지 확인
  isPublicEndpoint(endpoint) {
    return this.publicEndpoints.some(pattern => endpoint.includes(pattern));
  }

  // 엔드포인트가 인증 관련인지 확인
  isAuthEndpoint(endpoint) {
    return this.authEndpoints.some(pattern => endpoint.includes(pattern));
  }

  // 토큰을 추가해야 하는지 확인
  shouldAddToken(endpoint) {
    return !this.isPublicEndpoint(endpoint) && !this.isAuthEndpoint(endpoint);
  }

  // 헤더에 토큰 추가
  addToken(headers, endpoint) {
    if (this.shouldAddToken(endpoint)) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return headers;
  }

  // 관리자 토큰 추가
  addAdminToken(headers) {
    const adminAccessToken = localStorage.getItem('adminAccessToken');
    if (adminAccessToken) {
      headers.Authorization = `Bearer ${adminAccessToken}`;
    }
    return headers;
  }

  // 토큰 만료 확인
  isTokenExpired() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return true;

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('토큰 파싱 오류:', error);
      return true;
    }
  }

  // 토큰 갱신
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/user/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('토큰 갱신 실패');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        return data.data.accessToken;
      } else {
        throw new Error(data.message || '토큰 갱신 실패');
      }
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      // 토큰 갱신 실패 시 로그아웃 처리
      this.clearTokens();
      throw error;
    }
  }

  // 토큰 정리
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminAccessToken');
  }

  // 디바운싱된 API 호출
  debounceApiCall(key, apiCall, delay = null) {
    const actualDelay = delay || this.debounceDelay;
    
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.debounceTimers.delete(key);
        }
      }, actualDelay);

      this.debounceTimers.set(key, timer);
    });
  }

  // 디바운싱 타이머 정리
  clearDebounceTimers() {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// 싱글톤 인스턴스로 export
export const interceptor = new ApiInterceptor();
