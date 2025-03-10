import { defineEventHandler } from "h3";

export default defineEventHandler((event) => {
  console.log("✅ 使用者登出");

  // 清除 Cookie 或 Session
  setCookie(event, "user_token", "", { maxAge: -1 });

  return { success: true, message: "已成功登出" };
});
