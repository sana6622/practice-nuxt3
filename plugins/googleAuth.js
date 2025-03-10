import { defineNuxtPlugin } from "#app";
import GoogleLogin from "vue3-google-login";

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return; // 確保只在瀏覽器端執行
  nuxtApp.vueApp.use(GoogleLogin, {
    clientId: process.env.GOOGLE_CLIENT_ID,
  });
});
