<script setup>
const productData=[{
  id: 'productAA',
  title:'product-AA'
},{
  id: 'productBB',
  title:'product-BB'
}]
</script>

<template>
  <div>
  
    
    <h1>商品列表頁</h1>
    <h2>固定路由</h2>
    <ul>
      <li><nuxt-link to="product/productA">A</nuxt-link></li>
    </ul>
    <h2>動態路由</h2>
    <ul>
      <li v-for="product in productData" :key="product.id">
        <nuxt-link :to="`/product/${[product.id]}`">{{product.title}}</nuxt-link>
      </li>
    </ul>
 
    
  </div>
</template>


