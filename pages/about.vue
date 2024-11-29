<script setup>
definePageMeta({
  layout: "admin-layout",
});
const title = ref("計數器");
const { count, increment, decrement } = useCounter();
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <p>現在的計數器值：{{ count }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<style scoped></style>
