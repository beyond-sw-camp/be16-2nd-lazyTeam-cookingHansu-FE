<template>
  <v-navigation-drawer app permanent :color="colors.white">
    <v-list dense nav>
      <v-list-item
        v-for="item in items"
        :key="item.text"
        link
        @click="navigate(item.route)"
      >
        <!-- 아이콘과 컨텐트 같이 -->
        <div class="container">
          <v-list-item-icon>
            <img :src="item.icon" alt="icon" width="20" />
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item-content>
        </div>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { useRouter } from "vue-router";
import { colors } from "@/constants/color";

export default {
  setup() {
    const router = useRouter();
    const navigate = (path) => router.push(path);

    const items = [
      {
        text: "대시보드",
        icon: new URL("@/assets/icons/dashboard.ico", import.meta.url).href,
        route: "/admin/dashboard",
      },
      {
        text: "강의 승인",
        icon: new URL("@/assets/icons/lecture_approval.ico", import.meta.url)
          .href,
        route: "/admin/lecture-approval",
      },
      {
        text: "요리사 승인",
        icon: new URL("@/assets/icons/chef_approval.ico", import.meta.url).href,
        route: "/admin/chef-approval",
      },
      {
        text: "공지사항 관리",
        icon: new URL("@/assets/icons/announcement_mgmt.ico", import.meta.url).href,
        route: "/admin/notice-management",
      },
      {
        text: "사용자 관리",
        icon: new URL("@/assets/icons/user_mgmt.ico", import.meta.url).href,
        route: "/admin/user-management",
      },
    ];

    return { items, navigate, colors };
  },
};
</script>


<style>
.container {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>