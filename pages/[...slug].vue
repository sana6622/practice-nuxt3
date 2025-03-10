<script setup lang="ts">
const route = useRoute();
const event = useRequestEvent(); // 獲取當前請求的事件
// 設定 HTTP 404 狀態碼
setResponseStatus(event, 404);
</script>

<template>
  <div>
    找不到 頁面
    <p>route.params:{{ route.params }}</p>
    <h1>route.params.slug 取得頁面路徑: {{ route.params.slug }}</h1>
    <p>頁面失蹤了</p>
    <p>你所請求的頁面：{{ route.params.slug.join("/") }}，不存在。</p>
  </div>
</template>

<style scoped></style>
