<script setup>
const buttonNone = ref({ text: "取消", disabled: false, class: "none" });
const buttonCheck = ref({ text: "確定", disabled: false, class: "none" });
</script>
<template>
  <div>
     <ElementUiButton :data="buttonNone" @clickHandler="close" />
     <ElementUiButton :data="buttonCheck"  />
  </div>
</template>