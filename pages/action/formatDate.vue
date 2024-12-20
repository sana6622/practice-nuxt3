<script setup>
const { $formatDate } = useNuxtApp();

const today = new Date();
const todayPlugin = $formatDate(today);
const todayComposable = useFormatDate(today);
</script>

<template>
  <div>
    <div>
      <h1>日期</h1>
      <p>{{ today }}</p>
      <p>plugin: {{ todayPlugin }}</p>
      <p>composable:{{ todayComposable }}</p>
    </div>
    <div class="hit">
      <p>安裝 : npm i date-fns</p>
      <h3>1.plugin</h3>
      <p>使用檔案: plugin/formatDatePlugin.js</p>
      <p>使用技巧</p>
      <ul>
        <li>到nuxt.config.ts 註冊</li>
        <li>plugin -> provide , binding</li>
      </ul>

      <h3>2.composable</h3>
      <p>使用檔案: composable/formatDateComposable.ts</p>
      <p>使用技巧: 元件</p>
    </div>
  </div>
</template>
