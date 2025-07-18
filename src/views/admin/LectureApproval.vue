<template>
    <v-container fluid>
        <h2 class="mt-4">강의 승인 관리</h2>
        <p class="mb-6">강의 승인 요청 현황</p>
        <v-row class="mb-4">
            <!-- 강의 검색창 꾸미기 -->
            <v-col cols="12" md="10">
                <v-text-field
                    label="강의명으로 검색..."
                    class="mb-4"
                    variant="outlined"
                />
            </v-col>
            <v-col cols="12" md="2">
                <v-select
                    :items="['승인 대기', '승인 완료', '거절']"
                    label="승인 상태"
                    class="mb-6"
                    variant="outlined"
                />
            </v-col>
        </v-row>
  
      <v-row v-for="lecture in lectures" :key="lecture.id" class="mb-4">
        <v-col cols="12">
          <v-card class="pa-4" outlined>
            <v-row no-gutters align="center" justify="space-between">
              <!-- 왼쪽: 이미지, 텍스트 -->
              <v-col cols="5" class="d-flex">
                <v-img :src="lecture.image" width="70" height="70" class="rounded mr-4" />
                <div>
                  <div class="font-weight-bold mb-1">{{ lecture.title }}</div>
                  <div class="text-body-2">강사: {{ lecture.chef }}</div>
                  <div class="text-body-2 text-grey">{{ lecture.description }}</div>
                  <div class="text-caption mt-2">
                    ⏱ {{ lecture.duration }} &nbsp;&nbsp; 💰 {{ lecture.price.toLocaleString() }}원 &nbsp;&nbsp; 📅 {{ lecture.date }}
                  </div>
                </div>
              </v-col>
  
              
              <!-- 오른쪽: 상태(왼쪽), 버튼(세로로 승인, 반려, 상세보기) -->
            
                <v-col cols="1" class="text-right">
                    <v-chip
                    class="mb-2"
                    :color="lecture.status === '승인 대기' ? 'orange' : lecture.status === '승인 완료' ? 'green' : 'red'"
                    text-color="white"
                    >
                    {{ lecture.status }}
                    </v-chip>
    
                    <div class="d-flex flex-column align-items-end gap-2">
                    <v-btn
                        v-if="lecture.status === '승인 대기'"
                        color="success"
                        size="small"
                        @click="approve(lecture.id)"
                    >
                        ✔ 승인
                    </v-btn>
                    <v-btn
                        v-if="lecture.status === '승인 대기'"
                        color="error"
                        size="small"
                        @click="reject(lecture.id)"
                    >
                        ✘ 거부
                    </v-btn>
    
                    <v-btn variant="outlined" color="orange" size="small">👁 상세보기</v-btn>
                    </div>
              
              <!-- <v-col cols="3" class="text-right">
                <v-chip
                  class="mb-2"
                  :color="lecture.status === '승인 대기' ? 'orange' : 'green'"
                  text-color="white"
                >
                  {{ lecture.status }}
                </v-chip>
  
                <div class="d-flex justify-end mb-2 gap-2">
                  <v-btn color="success" size="small" @click="approve(lecture.id)">✔ 승인</v-btn>
                  <v-btn color="error" size="small" @click="reject(lecture.id)">✘ 거부</v-btn>
                </div>
  
                <v-btn variant="outlined" color="orange" size="small">👁 상세보기</v-btn> -->
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        lectures: [
          {
            id: 1,
            title: '딤섬 제작 워크샵',
            chef: '정요리',
            description: '중식 딤섬의 정수를 배우는 특별한 시간입니다. 샤오롱바오, 교자, 슈마이까지!',
            duration: '3시간 30분',
            price: 78000,
            date: '2025. 7. 13.',
            status: '승인 대기',
            image: new URL('@/assets/images/smu_mascort1.jpg', import.meta.url).href,
          },
          {
            id: 2,
            title: '홈메이드 라멘 마스터',
            chef: '박셰프',
            description: '집에서도 맛있는 라멘을 만들 수 있는 모든 비법을 전수합니다. 육수부터 면, 토핑까지!',
            duration: '4시간',
            price: 95000,
            date: '2025. 7. 13.',
            status: '승인 대기',
            image: new URL('@/assets/images/smu_mascort2.jpg', import.meta.url).href,
          },
          {
            id: 3,
            title: '이탈리안 파스타 마스터클래스',
            chef: '김요리',
            description: '정통 이탈리안 파스타 제작법을 배우는 심화 과정입니다. 면 반죽부터 다양한 소스까지 완벽하게 마스터하세요.',
            duration: '3시간',
            price: 89000,
            date: '2025. 7. 12.',
            status: '승인 대기',
            image: new URL('@/assets/images/smu_mascort3.jpg', import.meta.url).href,
          },
        ],
      }
    },
    methods: {
      approve(id) {
        console.log(`${id} 승인`);
      },
      reject(id) {
        console.log(`${id} 거부`);
      },
    },
  }
  </script>
  
  <style scoped>
  .rounded {
    border-radius: 8px;
  }
  .gap-2 {
    gap: 8px;
  }
  </style>
  