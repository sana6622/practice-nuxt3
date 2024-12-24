import { defineNuxtPlugin } from '#app'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhTw from 'element-plus/es/locale/lang/zh-tw'
// import dayjs from 'dayjs'
// import 'dayjs/locale/zh-cn'

// // 設置 Day.js 的語言為中文
// dayjs.locale('zh-tw')

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ElementPlus, { locale: zhTw })
})
