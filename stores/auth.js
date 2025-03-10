import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
  }),
  actions: {
    async fetchUser() {
      const response = await useFetch("/api/auth/google/callback");
      this.user = response.data?.user;
      this.token = response.data?.token;
    },
    setUser(user, token) {
      this.user = user;
      this.token = token;
      // localStorage.setItem("user_token", token);
      // localStorage.setItem("user_info", JSON.stringify(user));
    },
    logout() {
      this.user = null;
      this.token = null;
      // localStorage.removeItem("user_token");
      // localStorage.removeItem("user_info");
    },
  },
  // persist: true, // 持久化 Pinia 狀態（需要安裝 `@pinia/plugin-persistedstate`）
});
