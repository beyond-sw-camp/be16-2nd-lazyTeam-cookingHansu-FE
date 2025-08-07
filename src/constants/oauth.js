// OAuth 설정 상수
export const OAUTH_CONFIG = {
  GOOGLE: {
    URL: import.meta.env.VITE_GOOGLE_OAUTH_URL || "https://accounts.google.com/o/oauth2/v2/auth",
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    REDIRECT_URL: import.meta.env.VITE_GOOGLE_REDIRECT_URL || "http://localhost:3000/oauth/google/redirect",
    SCOPE: import.meta.env.VITE_GOOGLE_SCOPE || "email profile",
    RESPONSE_TYPE: import.meta.env.VITE_GOOGLE_RESPONSE_TYPE || "code",
  },
};

// API 설정 상수
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  ENDPOINTS: {
    LOGIN: "/user/login",
    GOOGLE_LOGIN: "/user/google/login",
    GOOGLE_REFRESH: "/user/google/refresh",
    LOGOUT: "/user/logout",
  },
};

// OAuth URL 생성 헬퍼 함수
export const generateOAuthUrl = (provider) => {
  switch (provider) {
    case "google":
      const { URL, CLIENT_ID, REDIRECT_URL, SCOPE, RESPONSE_TYPE } =
        OAUTH_CONFIG.GOOGLE;
      
      if (!CLIENT_ID) {
        throw new Error("Google Client ID is not configured. Please check your environment variables.");
      }
      
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URL,
        response_type: RESPONSE_TYPE,
        scope: SCOPE,
        access_type: "offline",
        prompt: "consent",
        state: generateRandomState(), // CSRF 방지를 위한 state 파라미터
      });
      return `${URL}?${params.toString()}`;
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
};

// CSRF 방지를 위한 랜덤 state 생성
function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
