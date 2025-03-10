import { defineNuxtConfig } from "nuxt/config";
import type { NuxtConfig } from "nuxt/schema";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  ssr: true,
  vite: {
    plugins: [],
  },
  app: {
    head: {
      title: "Nuxt project",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "My Nuxt web" },
        /*分享設定*/
        { property: "og:title", content: "Nuxt3 Day11 Global head 練習" },
        { property: "og:url", content: "http://localhost:3000/" },
        {
          property: "og:description",
          content: "透過今天的學習，將會學習到 Nuxt3 Global head 的設定方法",
        },
        {
          property: "og:image",
          content:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },

        /*文字設定*/
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&display=swap",
        },
      ],
      htmlAttrs: {
        lang: "zh-TW", // 設置全局 lang 屬性
      },
    },
  },
  modules: [
    "@pinia/nuxt",
    "@vee-validate/nuxt",
    "nuxt-swiper",
    "@element-plus/nuxt",
    "@nuxt/icon",
  ],
  css: ["@/assets/all.scss"],

  plugins: ["~/plugins/formatDatePlugin.js", "~/plugins/element-plus.js"],

  runtimeConfig: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  },

  veeValidate: {
    componentNames: {
      Form: "VForm",
      Field: "VField",
      ErrorMessage: "VErrorMessage",
    },
  },
} as NuxtConfig & {
  veeValidate: {
    componentNames: {
      Form: string;
      Field: string;
      ErrorMessage: string;
    };
  };
});
console.log("Nuxt 3 Config:", process.env.GOOGLE_REDIRECT_URI);
