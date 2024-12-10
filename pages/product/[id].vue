<script setup >
const route = useRoute();



onMounted(() => {
  console.log('Product',route.params);
  id.value = routeParams.id;
}) 


</script>

<template>
  <div>
    <h1>使用route.params 取得 路由id</h1>
    <p>routeParams:{{routeParams}}</p>
    <p>id是{{id}}</p>
  </div>
</template>

<style scoped></style>
