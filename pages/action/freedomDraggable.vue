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

const dialogVisible = ref(false);
const selectedFeature = ref({
  id: 1,
  name: "淡水阿給",
  des: "我的早餐",
  icon: 1,
  bgc: 2,
  image: "../../public/image/mapImage/淡水老牌阿給.png",
});
const clickHandle = () => {
  dialogVisible.value = true;
};
</script>
<template>
  <div class="freedomDraggable">
    <h4>可拖曳卡片</h4>
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
    <h4>可拖曳dialog</h4>
    <button @click="clickHandle">可拖曳的dialog</button>
    <DraggableDialog
      v-if="dialogVisible"
      :visible="dialogVisible"
      :title="'景點資訊'"
      :data="selectedFeature"
      :excludeFields="['images', 'id', 'icon', 'bgc']"
      :fieldLabels="{
        name: '名稱',
        des: '描述',
        image: '圖片',
      }"
      @close="dialogVisible = false"
    />
    <div class="hit">
      <p>安裝: npm install @vueuse/core</p>
      <p>使用vueUse的 useDraggable</p>
      s
      <p>功能:</p>
      <ul>
        <li>1. 第一種: 原生寫法 使用mouse事件完成拖曳</li>
        <li>2. 第二種: 寫在comonents/draggableDialog</li>
        <li>2-1.excludeFields 不顯示在dialog的文字資料</li>
        <li>2-2. 另外有額外做- 當變數資料有缺時 不會顯示那個變數的label</li>
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
.freedomDraggable {
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
