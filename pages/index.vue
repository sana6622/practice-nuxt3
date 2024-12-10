<script setup>
console.log("middleware之前");
definePageMeta({
  // middleware: "middleware-one",
   middleware: ["middleware-one","middleware-two"],
});
console.log("middleware之後");
</script>

<template>
  <div>
    <h1>首頁的h1</h1>
    <p class="title">全域的title</p>
       <h2>
      <nuxt-link to="/product">商品列表
    </nuxt-link></h2>
  </div>
</template>

<style lang="scss">
$primary: blue;
h1 {
  color: $primary;
  font-size: $fs-xl;
}
</style>
