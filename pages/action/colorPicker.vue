<script setup>
const colorData = ref({
  pureColor: 'green',
  gradientColor: 'linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)',
});
</script>

<template>
<div>
  <h1>顏色選擇器</h1>
  <ClientOnly>
    <ColorPicker
    v-model="colorData"
    />
  </ClientOnly>
   <div class="hit">
      <p>使用檔案: plugin/colorPicker.client.js</p>
      <p>使用技巧: plugin 整合vue3插件 -> .component() , .use()</p>
    </div>

</div>
  
</template>
