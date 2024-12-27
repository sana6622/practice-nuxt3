<script setup>
const loginFormData = ref({
  email: "",
  password: "",
});
const isEnabled = ref(false);
console.log("111");

const signInUser = async (body) => {
  isEnabled.value = true;
  /*使用fetch方法*/

  //  $fetch("https://todolist-api.hexschool.io/users/sign_in", {
  //   method: "POST",
  //   body,
  // }).then(({token,exp}) =>{
  //   const cookie = useCookie("auth",{
  //     expires: new Date(exp*1000),
  //     path: "/",
  //   })
  //   cookie.value = token;
  //   alert('success')
  // }).catch(error =>{
  //   console.dir('error',error)
  //   const { message } = error.response._data;
  //     // message 有 陣列 [] 和字串 "" 兩種回應格式
  //     if (Array.isArray(message)) {
  //       alert(message.join("、"));
  //       return;
  //     }
  //     alert(message);
  // }).finally(()=>{
  //   loginFormData.value = {};
  //   isEnabled.value = false;
  // })

  /*--------------*/
  /*使用useFetch方法*/
  try {
    const { data, error } = await useFetch(
      "https://todolist-api.hexschool.io/users/sign_in",
      {
        method: "POST",
        body,
      }
    );

    if (error.value) {
      throw new Error(error.value.message || "發生錯誤");
    }
    // 取得資料後的邏輯
    if (data.value) {
      console.log("取得response", data.value);
      const { token, exp } = data.value;
      const cookie = useCookie("auth", {
        expires: new Date(exp * 1000),
        path: "/",
      });

      cookie.value = token;

      alert("success");
    }
  } catch (err) {
    console.error("Error:", err.message);
    alert("登入失敗，請稍後再試");
  }
};
</script>

<template>
  <div class="login">
    <h2 class="h3 mb-4">登入</h2>
    <form @submit.prevent="signInUser(loginFormData)">
      <div class="mb-4">
        <label for="loginemail">信箱 <span class="text-danger">*</span></label>
        <input
          type="email"
          class="form-control"
          id="loginemail"
          placeholder="example@gmail.com"
          required
          v-model="loginFormData.email"
        />
      </div>
      <div class="mb-4">
        <label for="loginpassword"
          >密碼 <span class="text-danger">*</span></label
        >
        <input
          type="password"
          class="form-control"
          id="loginpassword"
          placeholder="請輸入密碼"
          required
          v-model="loginFormData.password"
        />
      </div>
      <button
        class="btn btn-secondary w-100"
        type="submit"
        :disabled="isEnabled"
      >
        登入
      </button>
    </form>
  </div>
</template>

<style lang="scss">
.login {
  background-color: bisque;
}
</style>
>
