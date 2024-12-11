<script setup>

const isLoading = ref(false);

const openLoading = () =>{
  isLoading.value = true;
 
  setTimeout(() =>{ 
   isLoading.value = false;
  },2000)
}


</script>

<template>
<div class="loading-act">
  <h1>Loading</h1>
  <button type="button" @click="openLoading">開啟 Loading 效果</button>

    <Loading :active="isLoading"
        :color="$loadingDefaults.color"
        :background-color="$loadingDefaults.backgroundColor"
        :is-full-page="$loadingDefaults.isFullPage"
        :z-index="$loadingDefaults.zIndex"
        loader="dots"
        ></Loading>

   <div class="hit">
      <p>使用檔案: plugin/loading.client.js</p>
      <p>使用技巧: plugin 整合Vue3插件</p>
      <p>使用套件: vue-loading-overlay</p>
    </div>
</div>

  
</template>
<style lang="scss" scope>
.loading-act{
  .hit{ 
    margin-top: 20px;
  background-color: pink;
  padding: 15px;
  p{
    font-size: 18px;
  }
}

}
  
</style>
