<script setup>
import { useRouter } from "vue-router";
// import { useAuthStore } from "@/store/auth";

const router = useRouter();
const auth = useAuthStore();

const logout = () => {
  console.log(1111);
  // 1️⃣ 清除登入資訊
  auth.logout();

  // 2️⃣ 先讓 Google 登出
  const logoutWindow = window.open(
    "https://accounts.google.com/Logout",
    "_blank"
  );
  if (logoutWindow) {
    logoutWindow.close(); // 關閉 Google 登出視窗
    router.push("/action/login");
  }
};
</script>

<template>
  <div class="logout-container">
    <button @click="logout">登出</button>
    <h2>🔄 您已成功登出，正在返回登入頁面...</h2>
  </div>
</template>

<style scoped>
.logout-container {
  text-align: center;
  margin-top: 50px;
}
</style>
