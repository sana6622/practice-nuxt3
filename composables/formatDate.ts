import { format } from "date-fns";

export const useFormatDate = (date: string | number | Date) => {
  return format(new Date(date), "yyyy/MM/dd");
};

//Thu Jun 13 2024 00:00:00 GMT+0800 轉換為 2024-06-13
export const useFormatDateToYMD = (date: string | number | Date) => {
  return format(new Date(date), "yyyy-MM-dd");
};

export const useFormatDateTime = (date: string | number | Date) => {
  return format(new Date(date), "yyyy/MM/dd HH:mm:ss");
};

// Thu Jun 13 2024 00:00:00 GMT+0800 轉換為 "YYYY-MM-DDTHH:MM:SS"
export const useFormatDateToISOString = (date: string | number | Date) => {
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm:ss");
};
