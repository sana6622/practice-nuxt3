<script setup>
import { useRoute, useRouter } from "vue-router";
// import { useAuthStore } from "@/store/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// 取得登入資訊
const userInfo = {
  id: route.query.id,
  email: route.query.email,
  name: route.query.name,
  picture: route.query.picture,
  token: route.query.token,
};

if (userInfo.token) {
  console.log("✅ Google 登入成功，獲取使用者資訊:", userInfo);

  // ✅ 儲存到 Pinia
  auth.setUser(
    {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    },
    userInfo.token
  );

  // ✅ 移除 URL 上的 `token`，避免暴露 Token
  setTimeout(() => {
    // router.replace("/");
  }, 2000);
}
</script>

<template>
  <div class="success-container">
    <p>{{ auth.user }}</p>
    <h2>🎉 登入成功！正在跳轉...</h2>
  </div>
</template>

<style scoped>
.success-container {
  text-align: center;
  margin-top: 50px;
}
</style>
