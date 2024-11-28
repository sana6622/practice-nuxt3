// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  css:[
    '@/assets/stylesheets/all.scss',
  ],
  // 在全部的元件都引入 _variables.scss
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/stylesheets/_variables.scss"; 
          `,
        },
      },
    },
  },
})
