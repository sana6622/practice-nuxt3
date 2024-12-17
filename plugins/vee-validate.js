import { defineRule } from "vee-validate";
import { required } from "@vee-validate/rules";

import { configure } from 'vee-validate';
import { localize, setLocale } from "@vee-validate/i18n";
import zhTW from "@vee-validate/i18n/dist/locale/zh_TW.json";

export default defineNuxtPlugin((nuxtApp) => {

  // 設定預設語言為繁體中文
  setLocale("zh_TW");

  // 定義全域的規則
  defineRule("required", required);

  // 自訂驗證規則
  defineRule("username", (value) => {
    const regex = /^[a-zA-Z0-9_]{3,15}$/;
    return (
      regex.test(value) ||
      "使用者名稱只能包含字母、數字與底線，且長度須為 3 至 15 字元"
    );
  });

  defineRule("phone", (value) => {
    const phoneRegex = /^09\d{8}$/;;
    return (
      phoneRegex.test(value) ||
      "手機號碼10個字，09開頭"
    );
  });

    // 驗證訊息
    configure({
      generateMessage: localize({
        zh_TW: {
          messages: zhTW.messages,
          //將需要驗證的變數名稱 ， 在提示文字時改為中文
          names: {
            username: "姓名", //提示文字改為中文
            phone: "電話",
            userDescription: "使用者簡介",
          },
          messages: {
            required: "{field} 為必填項目", //未填寫的提示文字
          },
        },
      }),
      validateOnInput: true, // 輸入時進行即時驗證
    });  


});
