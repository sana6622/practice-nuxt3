<script setup>
  const props=defineProps({
    data:{
      type: Object,
      default: () => {}
    }
  })
  const emit = defineEmits(['clickHandler'])
  const clickHandler = () => emit('clickHandler');
</script>

<template>
  <el-button 
    :style="data.style"
    :class="data.class"
    :disabled="data.disabled"
    @click="clickHandler()" 
  >{{ data.text }}</el-button> 
</template>

