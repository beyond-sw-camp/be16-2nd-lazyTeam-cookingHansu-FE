<template>
  <v-app-bar color="white" elevation="1" app flat class="custom-app-bar">
    <v-container class="app-bar-inner" fluid>
      <!-- 왼쪽: 로고 -->
      <div class="left">
        <div class="logo" @click="goTo('/')">요리한수</div>
      </div>

      <!-- 가운데: 메뉴 -->
      <div class="center">
        <v-btn variant="text" @click="goTo('/recipes')" class="menu-btn"
          >레시피 공유 게시글</v-btn
        >
        <v-btn variant="text" @click="goTo('/courses')" class="menu-btn"
          >판매중인 강의</v-btn
        >
        <v-btn variant="text" @click="goTo('/chat')" class="menu-btn"
          >1:1채팅</v-btn
        >
        <v-btn
          variant="text"
          v-if="userType !== 'ADMIN'"
          @click="goTo('/mypage')"
          class="menu-btn"
        >
          마이페이지
        </v-btn>
        <v-btn
          variant="text"
          v-else
          @click="goTo('/admin/dashboard')"
          class="menu-btn"
        >
          관리자 대시보드
        </v-btn>
      </div>

      <!-- 오른쪽: 알림 + 사용자 + 로그인/로그아웃 -->
      <div class="right">
        <v-badge
          :content="notificationCount"
          color="red"
          overlap
          v-if="isLoggedIn && notificationCount > 0"
        >
          <template #badge>
            <v-icon>mdi-bell</v-icon>
          </template>
        </v-badge>
        <v-icon v-else-if="isLoggedIn">mdi-bell-outline</v-icon>

        <span v-if="isLoggedIn" class="welcome-text"
          >{{ userName }}님 반갑습니다!</span
        >

        <v-btn
          v-if="isLoggedIn"
          @click="goTo('/logout')"
          variant="outlined"
          size="small"
        >
          로그아웃
        </v-btn>

        <v-btn @click="goTo('/login')" color="orange" class="login-btn" rounded>
          로그인
        </v-btn>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const goTo = (path) => router.push(path);

const isLoggedIn = ref(false);
const userName = ref("김요리");
const userType = ref("ADMIN"); // GENERAL | CHEF | OWNER | ADMIN
const notificationCount = ref(3);
</script>

<style scoped>
.custom-app-bar {
  padding: 0;
}

.app-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}
.login-btn {
  color: white !important;
  background-color: #fb6a11 !important;
  font-weight: 600;
  font-size: 14px;
  border-radius: 10px;
  min-width: 72px;
  text-transform: none;
  box-shadow: none;
}

.left {
  flex: 0 0 auto;
}

.center {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  gap: 24px;
}

.right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-weight: bold;
  font-size: 20px;
  color: #fb6a11;
  cursor: pointer;
}

.menu-btn {
  font-size: 14px;
  color: #4a4a4a;
  min-width: 0;
  padding: 0 6px;
  text-transform: none;
}

.welcome-text {
  font-size: 14px;
  color: #4a4a4a;
}
</style>
