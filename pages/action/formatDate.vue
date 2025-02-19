<script setup>
import { ref, onMounted } from "vue";
import { useDraggable } from "@vueuse/core";

const items = ref([
  { id: 1, name: "項目 1" },
  { id: 2, name: "項目 2" },
  { id: 3, name: "項目 3" },
  { id: 4, name: "項目 4" },
]);

const elements = ref([]);

onMounted(() => {
  items.value.forEach((_, index) => {
    useDraggable(elements.value[index]);
  });
});
</script>

<template>
  <div class="container">
    <h2>VueUse 拖曳</h2>
    <ul class="list-group">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        ref="elements"
        class="list-group-item"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>
