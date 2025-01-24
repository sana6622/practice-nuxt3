<script setup></script>

<template>
  <div class="copy-word">
    <h1>點擊後可以複製文字</h1>
    <p v-copy class="copy">點擊這段文字後可以複製</p>
    <div class="hit">
      <p>安裝 : npm i clipboard</p>
      <p>使用檔案: plugin/clipboard.js</p>
      <p>使用技巧: plugin -> directive (自定義) , binding</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.copy-word {
  .copy {
    padding: 10px;
    background-color: rgb(255, 244, 145);
    display: inline-block;
    cursor: pointer;
  }
  .hit {
    background-color: pink;
    padding: 15px;
    p {
      font-size: 18px;
    }
  }
}
</style>
