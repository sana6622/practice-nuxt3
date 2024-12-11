import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css';
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Loading', Loading);

  // 提供全局默認配置
  nuxtApp.provide('loadingDefaults', {
    color: '#f1627e', // 設定加載圖標顏色
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // 背景顏色
    isFullPage: true, // 全頁模式
    zIndex:9999,
  
  });

})
