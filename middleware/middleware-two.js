export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('middleware 222',{to, from})
  const token = useCookie("auth");
  if (!token.value) return false;

  const userInfo = await $fetch(
    "https://todolist-api.hexschool.io/users/checkout",
    {
      method: "GET",
      headers: {
        Authorization: token.value,
      },
    }
  ).catch(() => {
    return null;
  });

  if (userInfo?.status !== undefined) {
    // 驗證成功，終止函式執行
    return;
  }
  console.log("isLoggedIn", userInfo);

  // 驗證失敗，導引回登入頁面
  // 在伺服器端和客戶端操作路由
  return navigateTo("/login");
})
