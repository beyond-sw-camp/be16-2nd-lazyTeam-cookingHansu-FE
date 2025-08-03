// OAuth 설정 상수
export const OAUTH_CONFIG = {
  GOOGLE: {
    URL: import.meta.env.VITE_GOOGLE_OAUTH_URL,
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    REDIRECT_URL: import.meta.env.VITE_GOOGLE_REDIRECT_URL,
    SCOPE: import.meta.env.VITE_GOOGLE_SCOPE,
    RESPONSE_TYPE: import.meta.env.VITE_GOOGLE_RESPONSE_TYPE,
  },
};

// API 설정 상수
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  ENDPOINTS: {
    LOGIN: "/user/login",
    OAUTH_CALLBACK: "/oauth/callback",
  },
};

// OAuth URL 생성 헬퍼 함수
export const generateOAuthUrl = (provider) => {
  switch (provider) {
    case "google":
      const { URL, CLIENT_ID, REDIRECT_URL, SCOPE, RESPONSE_TYPE } =
        OAUTH_CONFIG.GOOGLE;
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URL,
        response_type: RESPONSE_TYPE,
        scope: SCOPE,
        access_type: "offline",
        prompt: "consent",
      });
      return `${URL}?${params.toString()}`;
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
};
