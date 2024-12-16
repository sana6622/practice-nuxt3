<script setup >
const {menu} = useMenu();
onMounted (()=>{
  console.log("onMounted", menu)
})
</script>

<template>
  <div class="header">
    <h1><nuxtLink to="/">Nuxt3</nuxtLink> </h1>
    <ul class="menu">
      <li v-for="item in menu" :key="item.title">
        <nuxt-link :to="item.link">{{item.title}}</nuxt-link>
        <ul>
          <li v-for="el in item.sub" :key="el.subTitle">
            <nuxt-link :to="el.link">{{el.subTitle}}</nuxt-link>
            </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.header{
  display: flex;
}

</style>
