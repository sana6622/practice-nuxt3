// import { setupCalendar, DatePicker, Calendar } from "v-calendar";
// import "v-calendar/style.css";

// export default defineNuxtPlugin((nuxtApp) => {
//   nuxtApp.vueApp.use(setupCalendar, {}); // 啟用 setupCalendar 預設設定
//   nuxtApp.vueApp.component("VCalendar", Calendar); // 註冊 VCalendar 為全域元件
//   nuxtApp.vueApp.component("VDatePicker", DatePicker); // 註冊 VDatePicker 為全域元件
// });

import "v-calendar/dist/style.css";
import VCalendar from "v-calendar";
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VCalendar);
});
