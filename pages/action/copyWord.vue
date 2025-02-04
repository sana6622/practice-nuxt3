<script setup></script>

<template>
  <div class="copy-word">
    <h1>點擊後可以複製文字</h1>
    <h2>方法1</h2>
    <p v-copy class="copy">點擊這段文字後可以複製</p>
    <h2>方法2</h2>
    <CopyButton text="這是要被複製的按鈕文字" />
    <div class="hit">
      <h2>方法1:(舊方法)</h2>
      <p>安裝 : npm i clipboard</p>
      <p>使用檔案: plugin/clipboard.js</p>
      <p>使用技巧: plugin -> directive (自定義) , binding</p>
      <h2>方法2:(新方法)</h2>
      <ul>
        <li>1.不須安裝clipboard</li>
        <li>2.使用 原生的 navigator.clipboard API</li>
        <li>
          3.這個方法適用在https及localhost(http)內，但如果執行npm run dev --
          --host 0.0.0.0取得的網址，會無法使用
        </li>
        <li>所以要處理這種狀況，寫備用方法 textarea + execCommand</li>
      </ul>
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
