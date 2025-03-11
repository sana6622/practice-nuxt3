<script setup>
import { useRoute, useRouter } from "vue-router";
// import { useAuthStore } from "@/store/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const showLoginModal = ref(false);
const showSuccessModal = ref(false);

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

    <!-- Google 登入彈窗 -->
    <button @click="showLoginModal = true">彈窗google登入</button>
    <LoginModal
      :show="showLoginModal"
      @close="showLoginModal = false"
      @login="loginWithGoogle"
    />

    <div class="hit">
      <p>使用這個方法: 沒有使用套件 https://reurl.cc/WAe3mx</p>
      <p>使用檔案:</p>
      <ul>
        <li>server/api/auth/google.ts 連接到google</li>
        <li>server/api/auth/google/callback.ts 接收google回傳資料</li>
        <li>成功後 到登入狀態頁查看</li>
        <li>最後執行第三方登出 (erver/api/auth/logout)</li>
      </ul>
      <p>
        注意: 這裡使用的OAuth 是我的帳號
        ，如果是公司要用要記得使用公司帳號去google cloud 申請
      </p>
    </div>
  </div>
</template>
