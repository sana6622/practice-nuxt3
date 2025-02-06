<script setup>
// import Openlayer from "~/components/Openlayer.vue";
</script>

<template>
  <div class="openlayer">
    <h1>淡水區 OpenLayers 基本地圖</h1>
    <div>
      <ClientOnly>
        <OpenlayerMapBasic />
      </ClientOnly>
    </div>

    <div class="hit">
      <p>使用檔案: components/OpenlayerMapBasic.vue</p>
      <p>安裝:npm install ol</p>
      <p>使用技巧:</p>
      <ul>
        <li>要使用 'ClientOnly'</li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.openlayer {
  display: flex;
  flex-direction: column;
  .hit {
    margin-top: 20px;
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
