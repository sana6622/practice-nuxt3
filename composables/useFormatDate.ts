
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

// export const useFormatDate = (date: string | number | Date) => {
//   return format(new Date(date), "yyyy/MM/dd");
// };

// //Thu Jun 13 2024 00:00:00 GMT+0800 轉換為 2024-06-13
// export const useFormatDateToYMD = (date: string | number | Date) => {
//   return format(new Date(date), "yyyy-MM-dd");
// };

// export const useFormatDateTime = (date: string | number | Date) => {
//   return format(new Date(date), "yyyy/MM/dd HH:mm:ss");
// };

// // Thu Jun 13 2024 00:00:00 GMT+0800 轉換為 "YYYY-MM-DDTHH:MM:SS"
// export const useFormatDateToISOString = (date: string | number | Date) => {
//   return format(new Date(date), "yyyy-MM-dd'T'HH:mm:ss");
// };

export const useFormatDate = {
  toSlash:(date:string|number|Date|null|undefined) =>{
    if(!date) return "";
    try{
      return format(new Date(date),"yyyy/MM/dd")
    }catch{
      return '資料錯誤'
    }
  }  ,
  //Thu Jun 13 2024 00:00:00 GMT+0800 轉換為 2024-06-13
  toDash:(date:string|number|Date|null|undefined) =>{
    if(!date) return "";
    try{
      return format(new Date(date),"yyyy-MM-dd")
    }catch{
      return '資料錯誤'
    }
  },
  toDateSlashTime(date:|number|Date|null|undefined){
    if(!date) return "";
    try{
      return format(new Date(date),"yyyy/mm/dd HH:mm:ss")
    }catch{
      return '資料錯誤'
    }
  },
  // Thu Jun 13 2024 00:00:00 GMT+0800 轉換為 "YYYY-MM-DDTHH:MM:SS"
  toDateDashTime(date:|number|Date|null|undefined){
    if(!date) return "";
    try{
      return format(new Date(date),"yyyy-mm-dd HH:mm:ss")
    }catch{
      return '資料錯誤'
    }
  },

  toDashWithDay: (date: string | number | Date | null | undefined) => {
   if(!date) return "";
    try{
      return format(new Date(date), "yyyy-MM-dd (EEEE)", { locale: zhTW }); // 格式為 "YYYY-MM-DD (星期一)"
    }catch{
       return '資料錯誤'
    }
   
  },

  
}