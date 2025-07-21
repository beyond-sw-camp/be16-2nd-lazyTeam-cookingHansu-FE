<template>
  <v-app-bar app :color="colors.text" dark>
    <v-toolbar-title
      class="text-h5 font-weight-bold cursor-pointer" :style="{ color: colors.primary }" @click="goToAdmin">요리한수</v-toolbar-title>
    <v-spacer></v-spacer>
    <div class="user-info">
      <v-icon color="orange darken-2">mdi-account-cog</v-icon>
      <span>관리자님</span>
      <v-btn text :color="colors.white" @click="logout">로그아웃</v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import { colors } from "@/constants/color.js";

export default {
  data() {
    return { colors };
  },
  methods: {
    logout() {
      console.log("로그아웃");
    },
    goToAdmin() {
      this.$router.push("/admin");
    },
  },
};
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
}
</style>
