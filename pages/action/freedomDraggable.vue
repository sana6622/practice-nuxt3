<script setup>
const items = ref([
  { id: 1, name: "卡片 1" },
  { id: 2, name: "卡片 2" },
  { id: 3, name: "卡片 3" },
]);

const positions = ref(items.value.map(() => ({ x: 0, y: 0 })));
const draggingIndex = ref(null);
const startX = ref(0);
const startY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);

const startDrag = (index, event) => {
  draggingIndex.value = index;
  startX.value = event.clientX - positions.value[index].x;
  startY.value = event.clientY - positions.value[index].y;

  // 綁定滑鼠移動 & 放開事件
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

const onMouseMove = (event) => {
  if (draggingIndex.value === null) return;
  positions.value[draggingIndex.value].x = event.clientX - startX.value;
  positions.value[draggingIndex.value].y = event.clientY - startY.value;
};

const onMouseUp = () => {
  draggingIndex.value = null;

  // 移除事件監聽
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
};

// 確保組件卸載時移除事件監聽
onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
});
</script>
<template>
  <div class="useDragable">
    <div class="container">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        ref="cards"
        class="card"
        :class="{ dragging: draggingIndex === index }"
        :style="{
          transform: `translate(${positions[index].x}px, ${positions[index].y}px)`,
          zIndex: draggingIndex === index ? 10 : 1,
          cursor: draggingIndex === index ? 'grabbing' : 'grab',
        }"
        @mousedown="startDrag(index, $event)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="hit">
      <p>安裝: npm install @vueuse/core</p>
      <p>使用vueUse的 useDraggable</p>
      <p>功能:</p>
      <ul>
        <li>可隨意拖曳</li>
        <li>
          <a href="https://vueuse.org/core/useDraggable/" target="_blank"
            >官方網站</a
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.useDragable {
  .container {
    position: relative;
    width: 100%;
    height: 300px;
    background: #f8f8f8;
    overflow: hidden;
  }

  .card {
    width: 200px;
    height: 100px;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    position: absolute;
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    transition: box-shadow 0.2s;
  }

  .dragging {
    box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.2);
  }
}
</style>
