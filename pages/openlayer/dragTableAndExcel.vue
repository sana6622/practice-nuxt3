<script setup>
import { useTableStore } from "@/stores/tableStore";
import * as XLSX from "xlsx";
import { getIconPathById } from "@/constants/icons";
import { getIconColor } from "@/constants/color";

const store = useTableStore();
const router = useRouter();
const fileInput = ref(null); // 綁定 `<input type="file">`
const dialog = ref(false);

const dialogRef = ref(null);
const dialogMode = ref("add"); // "add" 或 "edit"
const selectedItem = ref({});
const tableData = {
  headers: [
    { prop: "drag", label: "", minWidth: "20" },
    { prop: "id", label: "id", minWidth: "200" },
    { prop: "name", label: "景點", minWidth: "200" },
    { prop: "coords", label: "經緯度", minWidth: "200" },
    { prop: "image", label: "圖片位置", minWidth: "200" },
    { prop: "images", label: "多圖片位置", minWidth: "200" },
    { prop: "icon", label: "icon類型", minWidth: "200" },
    { prop: "bgc", label: "背景色", minWidth: "200" },
    { prop: "des", label: "描述", minWidth: "200" },
    { prop: "action", label: "操作", minWidth: "200", type: "action" },
  ],
};

// **定義表單欄位**
const tableFields = ref([
  { prop: "id", label: "id", minWidth: "200", type: "number" },
  { prop: "name", label: "景點名稱", type: "text" },
  { prop: "coords", label: "經緯度", type: "coords" },
  { prop: "image", label: "圖片路徑", type: "text" },
  { prop: "images", label: "多圖片路徑", type: "multi" },
  { prop: "icon", label: "icon 類型", type: "icon" },
  { prop: "bgc", label: "背景顏色", type: "color" },
  { prop: "des", label: "描述", type: "textarea" },
]);

// 解析 Excel 並存入 Pinia
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsArrayBuffer(file);

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0]; // 讀取第一個工作表
    const worksheet = workbook.Sheets[sheetName];

    // 解析成 JSON，{ header: 1 } 代表讀取每一列作為陣列
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      console.error("Excel 檔案沒有內容！");
      return;
    }

    // 取得表頭 & 移除第一列標題
    let [header, ...rows] = jsonData;

    // **手動轉換表頭為 UTF-8**
    header = header.map((col) =>
      new TextDecoder("big5").decode(new Uint8Array([col]))
    );

    // 格式化 Excel 數據
    const formattedData = rows.map((row, index) => ({
      id: row[0] || `ID_${index + 1}`,
      name: row[1] || "",
      coords: row[2] ? JSON.parse(row[2]) : [],
      image: row[3] || "",
      images: row[4] ? row[4].split(",") : [], // 新增多圖片位置解析
      icon: row[5] || "",
      bgc: row[6] || "",
      des: row[7] || "",
    }));

    // 更新 Pinia
    store.setItems("group1", formattedData);

    console.log("已更新 Pinia:", store.tables["group1"]);
  };
};

// 觸發文件上傳
const triggerFileInput = () => {
  fileInput.value.click();
};

const openAddDialog = () => {
  dialogMode.value = "add";
  selectedItem.value = {}; // 清空資料
  dialogRef.value.openDialog();
};

// 開啟編輯 Dialog**
const openEditDialog = (item) => {
  dialogMode.value = "edit";
  selectedItem.value = { ...item };
  dialogRef.value.openDialog();
};

//驗證
const verify = (newItem) => {
  if (!newItem.id) {
    alert("id必填");
    return;
  }
  if (!newItem.coords) {
    alert("coords必填");
    return;
  }

  dialogRef.value.closeDialog();
};

const addItem = (newItem) => {
  verify(newItem);
  //經緯度=陣列
  newItem.coords = Array.isArray(newItem.coords)
    ? newItem.coords
    : JSON.parse(newItem.coords);

  store.setItems("group1", [...store.tables["group1"], newItem]);
  console.log("pina", store.tables["group1"]);
};

// const updateItem = (newItem) => {
//   console.log("✅ 更新後的 Pinia store111:", store.tables[props.storeKey]);
//   verify(newItem);
//   const items = store.tables["group1"]; // 取得當前的資料陣列
//   const index = items.findIndex((item) => item.id === newItem.id); // 找到對應 ID 的索引
//   newItem.coords = Array.isArray(newItem.coords)
//     ? newItem.coords
//     : JSON.parse(newItem.coords);

//   if (index !== -1) {
//     // 更新該筆資料
//     items[index] = { ...newItem };
//     store.setItems("group1", [...items]); // 觸發 Pinia 更新

//     console.log("✅ 已更新項目:", newItem);
//   } else {
//     console.warn("⚠️ 找不到對應 ID，無法更新");
//   }
// };

// 刪除項目
const deleteItem = (item) => {
  const confirmDelete = confirm(`確定要刪除 ${item.name} 嗎？`);
  if (confirmDelete) {
    store.setItems(
      "group1",
      store.tables["group1"].filter((i) => i.id !== item.id)
    );
    console.log("✅ 已刪除項目:", item);
  }
};

const nextClick = () => {
  router.push("/openlayer/openlayerStoryByTable");
};

onMounted(() => {
  console.log("✅ Dialog ref:", dialogRef.value); // 🟢 檢查是否有值
});
</script>
<template>
  <div>
    <div>
      <button @click="triggerFileInput">上傳Excel</button>
      <input
        type="file"
        ref="fileInput"
        @change="handleFileUpload"
        accept=".xlsx, .xls"
        style="display: none"
      />
      <button @click="openAddDialog">新增</button>
    </div>
    <DragTable
      :headers="tableData.headers"
      :items="store.tables['group1']"
      storeKey="group1"
      @edit-item="openEditDialog"
      @delete-item="deleteItem"
    />
    <button @click="nextClick">下一步</button>

    <!-- 新增/編輯 Dialog -->
    <Dialog
      ref="dialogRef"
      :mode="dialogMode"
      :dialogTitle="dialogMode === 'edit' ? '編輯景點' : '新增景點'"
      :fields="tableFields"
      :modelValue="selectedItem"
      @add-item="addItem"
    />

    <div class="hit">
      <p>使用檔案:</p>
      <ul>
        <li>store/tableStore</li>
        <li>靜態檔案: constants/color & constants/icon</li>
      </ul>
      <p>安裝:npm install xlsx</p>
      <p>功能:</p>
      <ul>
        <li>使用pinia:資料儲存與調用</li>
        <li>可用excel 上傳資料,副檔名必須是.xlsx</li>
        <li>
          可以使用這個excel檔案
          https://docs.google.com/spreadsheets/d/1TjRyCySb4TtQfP1tn-A3fHZ5AiQIQoEy-5ge7kKvuSo/edit?hl=zh-tw&gid=0#gid=0
        </li>
      </ul>
    </div>
  </div>
</template>
