<template>
  <div class="recipe-main-page">
    <Header />
    <!-- 상단 탭 -->
    <div class="nav-tabs">
      <button :class="{ active: currentTab === 'recipe' }" @click="currentTab = 'recipe'">
        레시피 게시글
      </button>
      <button :class="{ active: currentTab === 'lecture' }" @click="goToLecture">
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
  name: "RecipeMainPage",
  components: { Header, Footer },
  data() {
    return { currentTab: "recipe" };
  },
  methods: {
    goToLecture() {
      this.$router.push({ name: "LectureList" });
    },
  },
};
</script>
