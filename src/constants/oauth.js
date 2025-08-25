// OAuth 설정 상수
export const OAUTH_CONFIG = {
  GOOGLE: {
    GOOGLE_URL: import.meta.env.VITE_GOOGLE_OAUTH_URL,
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URL: import.meta.env.VITE_GOOGLE_REDIRECT_URL,
    GOOGLE_SCOPE: import.meta.env.VITE_GOOGLE_SCOPE,
    GOOGLE_RESPONSE_TYPE: import.meta.env.VITE_GOOGLE_RESPONSE_TYPE || "code",
  },
  KAKAO: {
    KAKAO_URL: import.meta.env.VITE_KAKAO_OAUTH_URL,
    KAKAO_CLIENT_ID: import.meta.env.VITE_KAKAO_CLIENT_ID,
    KAKAO_REDIRECT_URL: import.meta.env.VITE_KAKAO_REDIRECT_URL,
    KAKAO_RESPONSE_TYPE: import.meta.env.VITE_KAKAO_RESPONSE_TYPE || "code",
  },
  NAVER: {
    NAVER_URL: import.meta.env.VITE_NAVER_OAUTH_URL,
    NAVER_CLIENT_ID: import.meta.env.VITE_NAVER_CLIENT_ID,
    NAVER_REDIRECT_URL: import.meta.env.VITE_NAVER_REDIRECT_URL,
    NAVER_RESPONSE_TYPE: import.meta.env.VITE_NAVER_RESPONSE_TYPE || "code",
  }
};

// API 설정 상수
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  ENDPOINTS: {
    LOGIN: "/user/login",
    GOOGLE_LOGIN: "/user/login/google",
    KAKAO_LOGIN: "/user/login/kakao",
    NAVER_LOGIN: "/user/login/naver",
    LOGOUT: "/user/logout",
    REFRESH: "/user/refresh",
  },
};

// OAuth URL 생성 헬퍼 함수
export const generateOAuthUrl = (provider) => {
  switch (provider) {
    case "google":
      const {
        GOOGLE_URL,
        GOOGLE_CLIENT_ID,
        GOOGLE_REDIRECT_URL,
        GOOGLE_SCOPE,
        GOOGLE_RESPONSE_TYPE,
      } = OAUTH_CONFIG.GOOGLE;

      if (!GOOGLE_CLIENT_ID) {
        throw new Error(
          "Google Client ID is not configured. Please check your environment variables."
        );
      }

      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URL,
        response_type: GOOGLE_RESPONSE_TYPE,
        scope: GOOGLE_SCOPE,
        access_type: "offline",
        prompt: "select_account consent", // 계정 선택과 동의 화면을 항상 표시
        state: generateRandomState(),
        // 추가 파라미터로 브라우저 캐싱 문제 해결
        include_granted_scopes: "true",
        // 로그아웃 후 재로그인 시에도 계정 선택 강제
        force_confirm: "true"
      });
      return `${GOOGLE_URL}?${params.toString()}`;
      
    case "kakao":
      const {
        KAKAO_URL,
        KAKAO_CLIENT_ID,
        KAKAO_REDIRECT_URL,
        KAKAO_RESPONSE_TYPE,
      } = OAUTH_CONFIG.KAKAO;

      if (!KAKAO_CLIENT_ID) {
        throw new Error(
          "KAKAO Client ID is not configured. Please check your environment variables."
        );
      }

      const kakaoParams = new URLSearchParams({
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: KAKAO_REDIRECT_URL,
        response_type: KAKAO_RESPONSE_TYPE,
        prompt: "login", 
        state: generateRandomState(),
      });
      return `${KAKAO_URL}?${kakaoParams.toString()}`;
      
    case "naver":
      const {
        NAVER_URL,
        NAVER_CLIENT_ID,
        NAVER_REDIRECT_URL,
        NAVER_RESPONSE_TYPE,
      } = OAUTH_CONFIG.NAVER;

      if (!NAVER_CLIENT_ID) {
        throw new Error(
          "NAVER Client ID is not configured. Please check your environment variables."
        );
      }

      const naverParams = new URLSearchParams({
        client_id: NAVER_CLIENT_ID,
        redirect_uri: NAVER_REDIRECT_URL,
        response_type: NAVER_RESPONSE_TYPE,
        auth_type: "reauthenticate", 
        state: generateRandomState(),
      });
      return `${NAVER_URL}?${naverParams.toString()}`;
      
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
};

// CSRF 방지를 위한 랜덤 state 생성 (강화된 버전)
function generateRandomState() {
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  const random3 = Math.random().toString(36).substring(2, 15);
  
  return `${timestamp}_${random1}_${random2}_${random3}`;
}
