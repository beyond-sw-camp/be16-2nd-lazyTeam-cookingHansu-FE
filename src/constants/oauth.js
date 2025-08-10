// OAuth 설정 상수
export const OAUTH_CONFIG = {
  GOOGLE: {
    GOOGLE_URL:
      import.meta.env.VITE_GOOGLE_OAUTH_URL ||
      "https://accounts.google.com/o/oauth2/v2/auth",
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URL:
      import.meta.env.VITE_GOOGLE_REDIRECT_URL ||
      "http://localhost:3000/oauth/google/redirect",
    GOOGLE_SCOPE: import.meta.env.VITE_GOOGLE_SCOPE || "email profile",
    GOOGLE_RESPONSE_TYPE: import.meta.env.VITE_GOOGLE_RESPONSE_TYPE || "code",
  },
  KAKAO: {
    KAKAO_URL: import.meta.env.VITE_KAKAO_OAUTH_URL,
    KAKAO_CLIENT_ID: import.meta.env.VITE_KAKAO_CLIENT_ID,
    KAKAO_REDIRECT_URL: import.meta.env.VITE_KAKAO_REDIRECT_URL,
    KAKAO_RESPONSE_TYPE: import.meta.env.VITE_KAKAO_RESPONSE_TYPE,
    // KAKAO는 SCOPE 설정 필요 X -> 콘솔에서 자동으로 설정
  },
};

// API 설정 상수
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  ENDPOINTS: {
    LOGIN: "/user/login",
    GOOGLE_LOGIN: "/user/google/login",
    GOOGLE_REFRESH: "/user/google/refresh",
    KAKAO_LOGIN: "/user/kakao/login",
    KAKAO_REFRESH: "/user/kakao/refresh",
    LOGOUT: "/user/logout",
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
        prompt: "consent",
        state: generateRandomState(), // CSRF 방지를 위한 state 파라미터
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
        state: generateRandomState(), // CSRF 방지를 위한 state 파라미터
      });
      return `${KAKAO_URL}?${kakaoParams.toString()}`;
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
};

// CSRF 방지를 위한 랜덤 state 생성
function generateRandomState() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
