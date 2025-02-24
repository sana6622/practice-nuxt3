<script setup>
import { useDraggable } from "@vueuse/core";

const props = defineProps({
  visible: Boolean,
  data: Object,
  title: { type: String, default: "詳細資訊" },
  fieldLabels: { type: Object, default: {} }, // 自訂標籤對應
  excludeFields: { type: Array, default: () => ["image"] }, // **要排除不顯示值的欄位**
  position: { type: Object, default: () => ({ x: 300, y: 200 }) }, // **點擊 icon 的座標**
});

const emit = defineEmits(["close"]);

const dialogRef = ref(null);
// const { x, y, style } = useDraggable(dialogRef); // ✅ VueUse 提供的拖曳功能
// 📌 **Dialog 預設寬高**
const dialogWidth = 400; // 假設 dialog 寬度 400px
const dialogHeight = 300; // 假設 dialog 高度 300px

// 📌 **計算對話框位置 (防止超出邊界)**
const calculatePosition = (pos) => {
  let x = pos.x - 50;
  let y = pos.y - 300;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // **防止 Dialog 超出右側**
  if (x + dialogWidth > screenWidth) {
    x = screenWidth - dialogWidth - 20; // 靠右邊界留 20px
  }

  // **防止 Dialog 超出左側**
  if (x < 20) {
    x = 20; // 靠左邊界留 20px
  }

  // **防止 Dialog 超出下方**
  if (y + dialogHeight > screenHeight) {
    y = screenHeight - dialogHeight - 20; // 靠下邊界留 20px
  }

  // **防止 Dialog 超出上方**
  if (y < 20) {
    y = 20; // 靠上邊界留 20px
  }

  return { x, y };
};

// 📌 **計算對話框初始位置**
const initialPos = calculatePosition(props.position);
// ✅ `ref` 確保 `useDraggable` 可以使用
const x = ref(initialPos.x);
const y = ref(initialPos.y);

// **✅ 使用 VueUse `useDraggable`**
const { style } = useDraggable(dialogRef, {
  initialValue: { x, y },
});

// **監聽 `props.position`，當 Icon 點擊時動態調整位置**
watch(
  () => props.position,
  (newPos) => {
    const adjustedPos = calculatePosition(newPos);
    x.value = adjustedPos.x;
    y.value = adjustedPos.y;
  },
  { immediate: true }
);
// watch(
//   () => props.position,
//   (newPos) => {
//     x.value = newPos.x - 50;
//     y.value = newPos.y - 300;
//   },
//   { immediate: true }
// );

// **監聽 `props.position`，當 Icon 點擊時動態調整位置**

// **預先過濾要顯示的資料**
const displayData = computed(() => {
  return Object.fromEntries(
    Object.entries(props.data || {}).filter(
      ([key, value]) =>
        !props.excludeFields.includes(key) &&
        value !== null &&
        value !== undefined &&
        value !== ""
    )
  );
});

const closeDialog = () => {
  emit("close");
};
</script>

<template>
  <teleport to="body">
    <div v-if="visible" ref="dialogRef" class="draggable-dialog" :style="style">
      <div class="dialog-header">
        <span>{{ title }}</span>
        <button @click="closeDialog">✖</button>
      </div>
      <div class="dialog-content">
        <slot>
          <div v-for="(value, key) in displayData" :key="key">
            <strong>{{ fieldLabels[key] || key }}：</strong> {{ value }}
          </div>
        </slot>
      </div>
    </div>
  </teleport>
</template>

<style lang="scss">
.draggable-dialog {
  position: fixed;
  width: 350px;
  background: white;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  padding: 10px;
  z-index: 1000;
  cursor: grab;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background: #2c3e50;
    color: white;
    border-radius: 8px 8px 0 0;
  }

  .dialog-header button {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
  }

  .dialog-content {
    padding: 15px;
    user-select: none; /* 防止選中文字時影響拖曳 */
  }
  .swiper-container {
    width: 100%; /* 可以調整這裡來增加或減少 Swiper 容器的寬度 */
    height: 200px;
    position: relative;
    margin: 0 auto; /* 居中 */
    padding-bottom: 50px;

    .swiper-slide {
      height: 200px;
    }
    .box {
      width: 80%; /* 保持容器的寬度 */
      height: 100%; /* 保持容器的高度 */
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden; /* 避免溢出 */
      margin: 0 auto;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain; /* 讓圖片保持比例，不變形 */
      }
    }
    .swiper-pagination {
      position: static; /* 將 pagination 的位置設為靜態，以避免覆蓋在圖片上 */
      margin-top: 10px; /* 增加與圖片的間距 */
      text-align: center; /* 將 pagination 點點居中 */
    }
  }

  .swiper-button-prev,
  .swiper-button-next {
    z-index: 99;
    background-color: #e44d7f;
    border-radius: 50%;
    border-color: #e44d7f;
    border: 0;
    width: 30px;
    height: 30px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    pointer-events: auto;
  }

  .swiper-button-prev:after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-right: 6px solid #fff;
    margin: auto;
  }
  .swiper-button-next:after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 6px solid #fff;
    margin: auto;
  }

  .swiper {
    --swiper-pagination-color: #e44d7f;
    --swiper-pagination-bullet-inactive-color: #a17373; //還未滑到時點點的顏色
    --swiper-pagination-bullet-size: 14px;
    --swiper-pagination-bullet-width: 14px;
    --swiper-pagination-bullet-height: 14px;
    --swiper-pagination-bullet-horizontal-gap: 15px; /* 點點之間的水平間距 */
  }
}
</style>
