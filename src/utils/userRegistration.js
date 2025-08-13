// 회원가입 과정 localStorage 관리 유틸리티

const REGISTRATION_STORAGE_KEY = 'user_registration_data';

// 회원가입 데이터 저장
export const saveRegistrationData = (data) => {
  const existingData = getRegistrationData();
  const updatedData = { ...existingData, ...data };
  localStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(updatedData));
};

// 회원가입 데이터 조회
export const getRegistrationData = () => {
  const data = localStorage.getItem(REGISTRATION_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// 회원가입 데이터 초기화
export const clearRegistrationData = () => {
  localStorage.removeItem(REGISTRATION_STORAGE_KEY);
};

// 특정 단계 데이터 저장
export const saveStepData = (step, data) => {
  const existingData = getRegistrationData();
  existingData[step] = data;
  localStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(existingData));
};

// 특정 단계 데이터 조회
export const getStepData = (step) => {
  const data = getRegistrationData();
  return data[step] || null;
};

// 전체 회원가입 데이터 조회 (서버 전송용)
export const getCompleteRegistrationData = () => {
  const data = getRegistrationData();
  
  // 기본 사용자 정보
  const userData = {
    nickname: data.addInfo?.nickname,
    role: data.addInfo?.role,
    ...data.userInfo
  };
  
  // 역할별 추가 정보
  if (data.addInfo?.role === 'GENERAL') {
    userData.generalType = data.authDetail?.extra;
  } else if (data.addInfo?.role === 'CHEF') {
    userData.licenseNumber = data.authDetail?.certNum;
    userData.cuisineType = data.authDetail?.type;
    userData.licenseUrl = data.authDetail?.certFile;
  } else if (data.addInfo?.role === 'OWNER') {
    userData.businessNumber = data.authDetail?.bizNum;
    userData.businessName = data.authDetail?.shopName;
    userData.businessAddress = data.authDetail?.shopAddr;
    userData.shopCategory = data.authDetail?.type;
    userData.businessUrl = data.authDetail?.bizFile;
  }
  
  return userData;
};
