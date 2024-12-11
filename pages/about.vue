<script setup>

definePageMeta({
  layout: "admin-layout",

   middleware: async () => {
    // 檢查 token 是否有值
    const token = useCookie("auth");
    if (!token.value) return false;
    console.log('taoken',token)
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
  },
});

const title = ref("計數器");
const { count, increment, decrement } = useCounter();
const route = useRoute();
const routeParams = route.params;
const id =ref('')

const { $showAlert } = useNuxtApp();
const text = ref('')

</script>

<template>
  <div class="about">
    <h1>{{ title }}</h1>
    <p>現在的計數器值：{{ count }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <h2>middleware</h2>
    <h3>匿名middlweare</h3>
     <button
    @click="$showAlert({ showDenyButton: true, denyButtonText: `Don't save` })">
    開啟
  </button>

  </div>
</template>

<style lang="scss" scoped>
.about {
  .copy{
    padding: 10px;
    background-color: pink;
    display: inline-block;
    cursor: pointer;
  }
  .text{
    padding: 10px;
    border:1px solid blue;
    .text-area{
      background-color: plum;
    }

  }
}

</style>
