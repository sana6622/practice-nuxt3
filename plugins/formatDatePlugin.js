import { format } from 'date-fns';


export default defineNuxtPlugin((nuxtApp) => {
  // 日期格式化工具函式
  const formatDate = (value, type = 'default') => {
   
    try {
      if (!value) return ""; // 如果值為 null 或 undefined，返回空字串
      
      const date = new Date(value);
      if (type === 'mobile') {
        return format(date, 'MM/dd'); // 手機格式
      } else if (type === 'iso') {
        return format(date, 'yyyy-MM-dd'); // ISO 格式
      }  else {
        return format(date, 'yyyy/MM/dd'); // 默認格式
      }
    } catch (error) {
      console.error('Invalid date format:', value);
      return 'Invalid Date';
    }
  };

  // 將格式化函式注入到 Nuxt 應用中
  nuxtApp.provide('formatDate', formatDate);
});