export default defineNuxtPlugin((nuxtApp) => {
  //使用directive 建立點擊後複製的功能
  nuxtApp.vueApp.directive('copy',{
    /*只在客戶端執行*/
    mounted(el) {
      el.addEventListener('click', (e) => {
        navigator.clipboard.writeText(e.target.innerText);
        alert('成功複製內容')
      })
    },
    /*只在伺服器端執行*/
    // getSSRProps(binding){ /*複製的文字會放在binding.value*/
    //   console.log('getSSRPro binding',binding)
      
    //   return {
    //     title: binding.value
    //   }
    // }
  })
})
