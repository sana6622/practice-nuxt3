<script setup>
import { ref } from "vue";
import { useDraggable } from "@vueuse/core";

const items = ref([
  { id: 1, name: "項目 1" },
  { id: 2, name: "項目 2" },
  { id: 3, name: "項目 3" },
  { id: 4, name: "項目 4" },
]);

const draggableRefs = ref(items.value.map(() => null));

const onDragStart = (event, index) => {
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", index);
};

const onDrop = (event, index) => {
  const draggedIndex = event.dataTransfer.getData("text/plain");
  const draggedItem = items.value.splice(draggedIndex, 1)[0];
  items.value.splice(index, 0, draggedItem);
};
</script>

<template>
  <div class="container">
    <h2>VueUse 拖曳</h2>
    <ul class="list-group">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        ref="draggableRefs"
        class="list-group-item"
        draggable="true"
        @dragstart="onDragStart($event, index)"
        @drop="onDrop($event, index)"
        @dragover.prevent
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: 20px auto;
  background-color: gray;
}
.list-group {
  list-style: none;
  padding: 0;
}
.list-group-item {
  padding: 10px;
  margin: 5px 0;
  background: #f0f0f0;
  border: 1px solid #ccc;
  cursor: grab;
}
</style>
