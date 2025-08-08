// 공통 API 응답 모델

export class ApiResponse {
  constructor(success, code, message, data = null) {
    this.success = success;
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static fromJson(json) {
    return new ApiResponse(
      json.success,
      json.code,
      json.message,
      json.data
    );
  }

  isSuccess() {
    return this.success === true;
  }

  getData() {
    return this.data;
  }

  getMessage() {
    return this.message;
  }

  getCode() {
    return this.code;
  }
}

// API 응답 처리를 위한 유틸리티 함수
export const handleApiResponse = async (response) => {
  console.log('API Response Status:', response.status);
  console.log('API Response URL:', response.url);
  
  const responseText = await response.text();
  console.log('API Response Text:', responseText);
  
  try {
    const jsonResponse = JSON.parse(responseText);
    const apiResponse = ApiResponse.fromJson(jsonResponse);
    
    if (!apiResponse.isSuccess()) {
      throw new Error(apiResponse.getMessage() || `API 요청 실패: ${apiResponse.getCode()}`);
    }
    
    return apiResponse;
  } catch (parseError) {
    console.error('JSON 파싱 실패:', parseError);
    
    // HTML 응답인지 확인
    if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
      throw new Error(`서버가 HTML을 반환했습니다. API 서버가 실행 중인지 확인해주세요. (Status: ${response.status})`);
    }
    
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }
}; 