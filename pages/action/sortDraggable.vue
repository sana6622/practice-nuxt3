<script setup>
import { ref } from "vue";

const items = ref([
  { id: 1, name: "項目 1", grabbed: false },
  { id: 2, name: "項目 2", grabbed: false },
  { id: 3, name: "項目 3", grabbed: false },
  { id: 4, name: "項目 4", grabbed: false },
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
    <h2>原生 HTML5 拖曳</h2>
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
.list-group-item:focus {
  outline: 2px solid blue;
  background-color: lightblue;
}
</style>
