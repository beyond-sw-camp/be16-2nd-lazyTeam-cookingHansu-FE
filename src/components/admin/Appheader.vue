<template>
  <v-app-bar app :color="colors.text" dark>
    <v-toolbar-title
      class="text-h5 font-weight-bold cursor-pointer" :style="{ color: colors.primary }" @click="goToAdmin">요리한수</v-toolbar-title>
    <v-spacer></v-spacer>
    <div class="user-info">
      <v-icon color="orange darken-2">mdi-account-cog</v-icon>
      <span>{{ adminName }}</span>
      <v-btn text :color="colors.white" @click="logout" :loading="isLoggingOut">로그아웃</v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import { colors } from "@/constants/color.js";
import { useAdminLoginStore } from "@/store/admin/adminLogin";
import { computed, ref } from "vue";

export default {
  data() {
    return { 
      colors,
      isLoggingOut: false
    };
  },
  setup() {
    const adminLoginStore = useAdminLoginStore();
    
    const adminName = computed(() => adminLoginStore.adminName);
    
    return {
      adminName,
      adminLoginStore
    };
  },
  methods: {
    async logout() {
      this.isLoggingOut = true;
      try {
        await this.adminLoginStore.logout();
      } catch (error) {
        console.error('로그아웃 중 오류:', error);
      } finally {
        this.isLoggingOut = false;
      }
    },
    goToAdmin() {
      this.$router.push("/admin/dashboard");
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
