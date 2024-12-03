<script setup lang="ts">
const route = useRoute();
const event = useRequestEvent(); // 獲取當前請求的事件
// 設定 HTTP 404 狀態碼
setResponseStatus(event, 404);
</script>

<template>
  <div>
    Page: 404 
    <p>頁面失蹤了</p>
  </div>
</template>

<style scoped></style>
