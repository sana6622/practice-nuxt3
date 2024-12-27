<script setup>
const { $formatDate } = useNuxtApp();

const today = new Date();
const todayPlugin = $formatDate(today);
const todayWithDayPlugin = $formatDate(today, "isoWidthDay");
const todayComposable = useFormatDate.toDash(today);
const todayComposableW = useFormatDate.toDashWithDay(today);
</script>

<template>
  <div>
    <div>
      <h1>日期</h1>
      <p>{{ today }}</p>
      <p>方法1 : plugin - provide: {{ todayPlugin }}</p>
      <p>方法2: composable:{{ todayComposable }}</p>
      <p>
        方法3 : plugin - directive 自定義模板:
        <span v-formatDateDirective="today"></span>
      </p>

      <p>星期</p>
      <p>plugin : {{ todayWithDayPlugin }}</p>
      <p>composable: {{ todayComposableW }}</p>
    </div>
    <div class="hit">
      <p>安裝 : npm i date-fns</p>
      <h3>1.plugin</h3>
      <p>使用檔案: plugin/formatDatePlugin.js</p>
      <p>使用技巧</p>
      <ul>
        <li>到nuxt.config.ts 註冊</li>
        <li>plugin : provide , binding</li>
        <li>引入: const { $formatDate } = useNuxtApp();</li>
        <li>使用: const todayPlugin = $formatDate(today);</li>
      </ul>

      <h3>2.composable</h3>
      <p>使用檔案: composable/usFormatDate.ts</p>
      <p>使用技巧</p>
      <ul>
        <li>元件</li>
        <li>const todayComposable = useFormatDate.toDash(today);</li>
      </ul>
    </div>
  </div>
</template>
