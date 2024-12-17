<script setup>
const message = ref("abcde123FGHIJ");
</script>

<template>
  <div class="change-word">
    <h1>大小寫轉換</h1>
    <p>原本:{{ message }}</p>
    <p>大寫: <span v-textformat1:uppercase="message"></span></p>
    <p>小寫: <span v-textformat1:lowercase="message"></span></p>
    <div class="hit">
      <p>使用檔案: plugin/textformat.js</p>
      <p>使用技巧: plugin -> directive (自定義) , binding</p>
    </div>
  </div>
</template>

<style lang="scss">
.change-word {
  .hit {
    background-color: pink;
    padding: 15px;
    p {
      font-size: 18px;
    }
  }

  .text {
    padding: 10px;
    border: 1px solid blue;
    .text-area {
      background-color: plum;
    }
  }
}
</style>
