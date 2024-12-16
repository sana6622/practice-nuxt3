// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  app: {
    head: {
      title: "Nuxt project",

      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "My Nuxt web" },
        /*分享設定*/
        { property: "og:title", content: "Nuxt3 Day11  Global head 練習" },
        { property: "og:url", content: "http://localhost:3000/" },
        {
          property: "og:description",
          content: "透過今天的學習，將會學習到 Nuxt3  Global head  的設定方法",
        },
        {
          property: "og:image",
          content:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        /*文字*/
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
    },
  },
  modules: ["@pinia/nuxt", "@vee-validate/nuxt"],
  veeValidate: {
    // 修改 VeeValidate 元件的名稱
    componentNames: {
      Form: "VForm",
      Field: "VField",
      ErrorMessage: "VErrorMessage",
    },
  },
  css: ["@/assets/all.scss"],

  // 在全部的元件都引入 _variables.scss
  // vite: {
  //   css: {
  //     preprocessorOptions: {
  //       scss: {
  //         additionalData: `
  //           @import "@/assets/stylesheets/_variables.scss";
  //         `,
  //       },
  //     },
  //   },
  // },
});
