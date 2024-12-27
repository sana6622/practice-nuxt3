import { format } from "date-fns";
import dayjs from "dayjs";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("formatDateDirective", {
    mounted(el, binding) {
      console.log(binding.value);
      const time = dayjs(binding.value).format("YYYY年MM月DD日");
      el.innerText = time;
    },
  });
});
