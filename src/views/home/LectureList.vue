<template>
  <div class="lecture-list-page">
    <Header />
    <!-- 상단 탭 -->
    <div class="nav-tabs">
      <button :class="{ active: currentTab === 'recipe' }" @click="goToRecipe">
        레시피 게시글
      </button>
      <button :class="{ active: currentTab === 'lecture' }" @click="currentTab = 'lecture'">
        강의 목록
      </button>
    </div>
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

export default {
  name: 'LectureList',
  components: { Header, Footer },
  data() {
    return { currentTab: 'lecture' };
  },
  methods: {
    goToRecipe() { this.$router.push({ name: 'RecipeMainPage' }); },
  },
};
</script>

<style scoped>
.lecture-list-page { background: #fafbfc; min-height: 100vh; margin-top: 80px; }
.nav-tabs { display: flex; justify-content: center; margin: 32px 0 24px 0; gap: 12px; }
.nav-tabs button { padding: 10px 24px; border: none; background: #fff; color: #ff7a00; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.nav-tabs button.active { background: #ff7a00; color: #fff; }
</style>
