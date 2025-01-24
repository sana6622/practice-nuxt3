import ClipboardJS from "clipboard";
export default defineNuxtPlugin((nuxtApp) => {
  //使用directive 建立點擊後複製的功能
  nuxtApp.vueApp.directive("copy", {
    /*只在客戶端執行*/
    mounted(el, binding) {
      // 使用 clipboard.js 將點擊元素與複製功能綁定
      const clipboard = new ClipboardJS(el, {
        text: () => binding.value || el.innerText, // 若有傳遞值則使用，否則默認使用內部文字
      });

      clipboard.on("success", () => {
        alert("複製成功：" + (binding.value || el.innerText));
      });

      clipboard.on("error", () => {
        alert("複製失敗，請檢查瀏覽器支援");
      });

      // 將 clipboard 實例存儲於元素，方便在 unmounted 時銷毀
      el._clipboardInstance = clipboard;
    },
    unmounted(el) {
      // 清除綁定事件，防止內存洩漏
      if (el._clipboardInstance) {
        el._clipboardInstance.destroy();
        delete el._clipboardInstance;
      }
    },
    /*只在伺服器端執行*/
    // getSSRProps(binding){ /*複製的文字會放在binding.value*/
    //   console.log('getSSRPro binding',binding)

    //   return {
    //     title: binding.value
    //   }
    // }
  });
});
