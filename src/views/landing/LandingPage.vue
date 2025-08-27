<template>
    <v-app>
      <!-- Hero Section -->
      <section class="hero-section" data-aos="fade-up">
        <v-container>
          <v-row align="center" justify="space-between">
            <v-col align="center" class="hero-text">
              <h1 class="hero-title">
                요리의 <span class="highlight">한 수</span>를<br />배워보세요
              </h1>
              <p class="hero-subtitle">
                집에 요리하는 초보자부터 노련한 베테랑까지, 나만의 요리 레시피를 공유하고<br />
                전문 강의를 통해 요리 실력을 향상시켜보세요
              </p>
              <v-row class="hero-buttons">
                <v-btn @click="handleStart" color="primary" large>
                    지금 시작하기
                </v-btn>
                <v-btn @click="goToRecipe" outlined large class="recipe-btn">
                    게시글 둘러보기
                </v-btn>
              </v-row>
            </v-col>
        
          </v-row>
        </v-container>
      </section>
  
      <!-- Features Section -->
      <section class="features-section" data-aos="fade-up">
        <v-container>
          <h2 class="section-title text-center" style="font-size: 2rem; color: var(--color-text);">요리한수가 특별한 이유</h2>
          <p class="section-desc text-center mb-8" style="font-size: 1.125rem; color: var(--color-text);">
            누구나 쉽고 자유롭게 요리를 배우고 공유할 수 있는 플랫폼
          </p>

          <!-- 요리한수 특징 소개 카드 -->
          <!-- 커서가 들어가면 강조되는 애니메이션 & 이펙트 구현 -->
          <v-row>
            <v-col
              cols="12"
              sm="4"
              class="d-flex"
              v-for="(feature, idx) in features"
              :key="idx"
            >
              <v-card
                class="feature-card"
                elevation="2"
                @mouseover="hoverIndex = idx"
                @mouseleave="hoverIndex = null"
                :class="{ 'is-hovered': hoverIndex === idx }"
              >
                <v-avatar size="48" class="mb-3">
                  <v-icon color="primary">{{ feature.icon }}</v-icon>
                </v-avatar>
                <h3 class="card-title">{{ feature.title }}</h3>
                <p class="card-desc" v-html="feature.desc"></p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>
  
      <!-- Call to Action Section -->
      <section class="cta-section" data-aos="fade-up">
        <v-container align="center" justify="center">
          <v-row class="flex-column-reverse flex-md-row">
            <v-col class="cta-text">
              <h2 class="cta-title">지금 시작해보세요</h2>
              <p class="cta-desc">
                요리의 새로운 세계를 경험하고<br />여러분의 요리 실력을 한 단계 끌어올려보세요
              </p>
              <v-btn color="white" class="signup-btn" large @click="goToSignUp">
                지금 가입하기
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </section>
    </v-app>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import AOS from 'aos' // 스크롤 애니메이션 라이브러리 
  import 'aos/dist/aos.css'
  
  const router = useRouter()
  const isLoggedIn = ref(false) // 임시 로그인 상태
  const hoverIndex = ref(null)
  
  const features = [
    {
      icon: 'mdi-book-open-page-variant',
      title: '레시피 공유',
      desc: '자신만의 특별한 요리 레시피를 쉽게 등록하고 공유하세요.<br/>사진과 함께 단계별로 상세하게 설명할 수 있습니다.'
    },
    {
      icon: 'mdi-video',
      title: '강의 판매',
      desc: '요리 전문가라면 자신의 노하우를 담은 강의를<br/>제작하고 판매하여 수익을 창출할 수 있습니다.'
    },
    {
      icon: 'mdi-storefront',
      title: '홍보 플랫폼',
      desc: '음식점이나 요리 관련 사업체를 운영하시나요?<br/>플랫폼을 통해 효과적으로 홍보하세요.'
    }
  ]
  
  // route function 
  // develop 브랜치에 가져와서 작동이 안되는 부분이 있을 수 있음 -> 추후 fix 예정
  function handleStart() {
    router.push(isLoggedIn.value ? { name: 'MyPage' } : { name: 'Login' })
  }
  function goToRecipe() {
    router.push('/recipes')
  }
  function goToSignUp() {
    router.push({ name: 'Login' })
  }
  
  onMounted(() => {
    AOS.init({ duration: 800 })
  })
  </script>
  
  <style lang="scss" scoped>
  @import '@/assets/styles/layout.css';
  
  .hero-section {
    padding: 120px 0;
    background-color: var(--color-white);
    word-break: keep-all;
    .hero-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--color-text);
      .highlight {
        color: var(--color-primary);
      }
    }
    .hero-subtitle {
      margin-top: 16px;
      margin-bottom: 32px;
      font-size: 1.125rem;
      color: var(--color-text);
      line-height: 1.6;
    }
    .hero-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      @media (min-width: 768px) {
        flex-direction: row;
      }
      .v-btn.mb-3 {
        margin-bottom: 16px;
      }
      .recipe-btn {
        background-color: var(--color-white) !important;
        border: 1px solid var(--color-primary) !important;
        color: var(--color-primary) !important;
      }
    }
  }
  
  .features-section {
    padding: 80px 0;
    background-color: var(--color-background);
    .feature-card {
      padding: 24px;
      width: 100%;
      text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
      word-break: keep-all;
      &.is-hovered {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }
      .card-title {
        margin-top: 12px;
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--color-text);
      }
      .card-desc {
        margin-top: 8px;
        font-size: 0.95rem;
        color: var(--color-text);
        line-height: 1.5;
      }
    }
  }
  
  .cta-section {
    padding: 80px 0;
    background-color: var(--color-primary);
    color: var(--color-white);
    .cta-title {
      font-size: 2rem;
      font-weight: bold;
    }
    .cta-desc {
      margin-top: 8px;
      margin-bottom: 12px;
      font-size: 1rem;
      opacity: 0.9;
    }
    .signup-btn {
      background-color: var(--color-white) !important;
      color: var(--color-primary) !important;
    }
  }
  
  // 반응형 웹 (모바일)
  @media (max-width: 768px) {
    .hero-section {
      .hero-buttons {
        align-items: center;
      }
    }
    .cta-section {
      .cta-text {
        text-align: center !important;
        margin-bottom: 16px;
      }
      .v-btn.signup-btn {
        display: block;
        margin: 0 auto;
      }
    }
  }
  </style>
  