// TableComponent.vue
<script setup>
import { ref, watch } from "vue";
import { useTableStore } from "@/stores/tableStore";
import { getIconPathById } from "@/constants/icons";
import { getIconColor } from "@/constants/color";

const props = defineProps({
  headers: Array,
  items: Array,
  storeKey: String, // 傳入不同的 key 來區分不同的資料來源
});
const emit = defineEmits(["update-items"]);

const store = useTableStore();
const tableItems = ref([...props.items]);

let draggedIndex = null;
const onDragStart = (index) => {
  draggedIndex = index;
};

const onDrop = (index) => {
  console.log(11111);
  const draggedItem = tableItems.value.splice(draggedIndex, 1)[0];
  tableItems.value.splice(index, 0, draggedItem);
  draggedIndex = null;
  // **更新 Pinia 狀態**
  store.setItems(props.storeKey, [...tableItems.value]);
  console.log("✅ 更新後的 Pinia store:", store.tables[props.storeKey]);
  emit("update-items", props.storeKey, [...tableItems.value]); // 通知父層更新資料
};

const saveToStore = () => {
  store.setItems(props.storeKey, [...tableItems.value]); // 儲存拖曳後的結果到 Pinia
};
// 觸發編輯
const editItem = (item) => {
  emit("edit-item", item);
};

// 觸發刪除
const deleteItem = (item) => {
  emit("delete-item", item);
};

// **計算屬性 - 取得 icon 路徑**
const getIconPath = (iconId) => {
  return getIconPathById(iconId) || ""; // 確保即使找不到，也回傳空字串
};

watch(
  () => props.items,
  (newItems) => {
    tableItems.value = [...newItems];
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div>
    <table class="panorama-table">
      <thead>
        <tr>
          <th></th>
          <!-- Placeholder for drag handle column -->
          <th v-for="item in headers" :key="item.prop">
            {{ item.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in tableItems"
          :key="index"
          draggable="true"
          @dragstart="onDragStart(index)"
          @dragover.prevent
          @drop="onDrop(index)"
        >
          <td class="handle">=</td>
          <td v-for="header in headers" :key="header.prop">
            <template v-if="header.prop === 'icon'">
              <img
                v-if="item.icon"
                :src="getIconPath(item.icon)"
                alt=""
                class="icon"
              />
            </template>
            <template v-else-if="header.prop === 'bgc'">
              <div
                class="color-box"
                :style="{ backgroundColor: getIconColor(item.bgc) }"
              ></div>
            </template>
            <template v-else-if="header.prop === 'action'">
              <button @click="editItem(item)">編輯</button>
              <button @click="deleteItem(item)">刪除</button>
            </template>
            <template v-else>
              {{ item[header.prop] }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss">
.panorama-table {
  color: black;
  width: 100%;
  border-collapse: collapse;
  background-color: transparent;
  td,
  th {
    padding: 10px;
    border-bottom: 1px solid black;
    text-align: left;
  }
  .handle {
    cursor: move;
    font-size: 20px;
    text-align: center;
    width: 50px;
  }
  tbody tr {
    background-color: transparent;
  }
  tbody tr:hover {
    background-color: rgba(255, 255, 255, 0.18);
  }
  .icon {
    background-color: black;
  }
  .color-box {
    width: 25px;
    height: 25px;
  }
}
</style>
