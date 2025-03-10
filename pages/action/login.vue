<script setup>
import { useRoute, useRouter } from "vue-router";
// import { useAuthStore } from "@/store/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loginWithGoogle = () => {
  navigateTo("/api/auth/google", { external: true });
};

// 只有當 URL 內有 `code`，才去請求 Google 回應
onMounted(async () => {
  if (route.query.code) {
    console.log("✅ Google OAuth 回應的 Code:", route.query.code);

    try {
      const { data, error } = await useFetch(
        `/api/auth/google/callback?code=${route.query.code}`
      );

      if (data.value?.success) {
        // ✅ 儲存使用者資訊到 Pinia
        auth.setUser(data.value.user, data.value.token);

        console.log("✅ 登入成功，使用者資訊已儲存:", auth.user);

        // ✅ 移除 URL 上的 `code`，避免重複觸發登入流程
        router.replace("/");
      } else {
        console.error("❌ 登入失敗:", error.value);
      }
    } catch (err) {
      console.error("❌ Google 回應 API 錯誤:", err);
    }
  }
});
</script>

<template>
  <div class="login-container">
    <button @click="loginWithGoogle">使用 Google 登入</button>
  </div>
</template>
