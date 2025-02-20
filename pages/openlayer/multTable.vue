<script setup>
import { useMultTableStore } from "@/stores/multTableStore";
import * as XLSX from "xlsx";
import { ElMessage, ElMessageBox } from "element-plus";

const store = useMultTableStore();
const router = useRouter();
const currentRouteId = ref(store.routes.length > 0 ? store.routes[0].id : ""); // 預設選擇第一條路線
const fileInput = ref(null); // 綁定 `<input type="file">`
const newRouteName = ref(""); // 新增路線名稱
const dialogRef = ref(null);
const dialogMode = ref("add"); // "add" 或 "edit"
const selectedSpot = ref(null); // 被選中的景點

const tableHeaders = [
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
];

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

// **取得當前選中的路線**
const currentRoute = computed(() => {
  return store.routes.find((r) => r.id === currentRouteId.value);
});

// **切換路線**
const switchRoute = (routeId) => {
  currentRouteId.value = routeId;
};

// **新增路線**
const addNewRoute = () => {
  if (!newRouteName.value.trim()) {
    ElMessage.error("請輸入路線名稱！");
    return;
  }
  store.addRoute(newRouteName.value.trim());
  newRouteName.value = ""; // 清空輸入框
};

// **刪除路線**
const deleteRoute = (routeId) => {
  ElMessageBox.confirm("確定要刪除這條路線嗎？刪除後無法恢復！", "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    store.deleteRoute(routeId);
    if (currentRouteId.value === routeId) {
      currentRouteId.value = store.routes.length > 0 ? store.routes[0].id : "";
    }
    ElMessage.success("成功刪除路線");
  });
};

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
    store.setExcelSpotsInRoute(currentRouteId.value, formattedData);

    console.log("已更新 Pinia:", store.routes);
  };
};

// 觸發文件上傳
const triggerFileInput = () => {
  fileInput.value.click();
};

// **開啟新增景點對話框**
const openAddDialog = () => {
  dialogMode.value = "add";
  selectedSpot.value = { name: "", coords: "" };
  dialogRef.value.openDialog();
};

// **開啟編輯景點對話框**
const openEditDialog = (spot) => {
  dialogMode.value = "edit";
  selectedSpot.value = { ...spot };
  dialogRef.value.openDialog();
};

// **新增/編輯景點**
const saveSpot = (spot) => {
  console.log("spot", spot);
  if (!spot.name.trim() || !spot.coords) {
    ElMessage.error("請輸入完整的景點名稱和經緯度！");
    return;
  }
  // if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
  //   ElMessage.error("請輸入有效的經緯度格式，例如：121.5,25.0");
  //   return;
  // }

  const coords = Array.isArray(spot.coords)
    ? spot.coords
    : JSON.parse(newItem.coords);
  const spotData = {
    id: spot.id,
    name: spot.name.trim(),
    coords: coords,
    image: spot.image,
    images: spot.images,
    des: spot.des,
    icon: spot.icon,
    bgc: spot.bgc,
  };

  if (dialogMode.value === "edit") {
    store.updateSpotInRoute(currentRouteId.value, spotData);
    ElMessage.success("成功更新景點");
  } else {
    store.addSpotToRoute(currentRouteId.value, spotData);
    ElMessage.success("成功新增景點");
  }
  dialogRef.value.closeDialog();
};

// **刪除景點**
const deleteSpot = (spotId) => {
  ElMessageBox.confirm("確定要刪除這個景點嗎？", "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    store.deleteSpotFromRoute(currentRouteId.value, spotId);
    ElMessage.success("成功刪除景點");
  });
};

const nextClick = () => {
  router.push("/openlayer/openlayerStoryByMultTable");
};
</script>

<template>
  <div class="multTable">
    <h2>路線管理</h2>

    <!-- 🏷️ 路線切換 -->
    <div class="tabs">
      <el-button
        v-for="route in store.routes"
        :key="route.id"
        @click="switchRoute(route.id)"
        :class="{ active: currentRouteId === route.id }"
      >
        {{ route.name }}
      </el-button>
    </div>

    <!-- ➕ 新增/刪除路線 -->
    <div class="route-controls">
      <el-input v-model="newRouteName" placeholder="輸入新路線名稱" />
      <el-button @click="addNewRoute">新增路線</el-button>
      <el-button
        v-if="store.routes.length > 1"
        @click="deleteRoute(currentRouteId)"
        class="delete-route"
      >
        刪除當前路線
      </el-button>
    </div>

    <!-- 🗺️ 當前路線 & 景點管理 -->
    <h3 v-if="currentRoute">當前路線：{{ currentRoute.name }}</h3>
    <div v-if="currentRoute">
      <h4>景點管理</h4>

      <!-- ➕ 新增景點 -->
      <el-button @click="openAddDialog">新增景點</el-button>
      <el-button @click="triggerFileInput">上傳Excel</el-button>
      <input
        type="file"
        ref="fileInput"
        @change="handleFileUpload"
        accept=".xlsx, .xls"
        style="display: none"
      />
      <el-button @click="nextClick">前往前台</el-button>

      <!-- 📋 景點列表 (使用 DragTable) -->
      <DragTable
        :headers="tableHeaders"
        :items="currentRoute.spots"
        @edit-item="openEditDialog"
        @delete-item="deleteSpot"
      />
    </div>

    <!-- 📌 新增/編輯景點 Dialog -->
    <Dialog
      ref="dialogRef"
      :mode="dialogMode"
      :dialogTitle="dialogMode === 'edit' ? '編輯景點' : '新增景點'"
      :fields="tableFields"
      :modelValue="selectedSpot"
      @add-item="saveSpot"
      @update-item="saveSpot"
    />
  </div>
</template>

<style lang="scss">
.multTable {
  margin: auto;
  padding: 20px;

  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  // button {
  //   padding: 8px;
  //   cursor: pointer;
  //   border: none;
  //   // background-color: #409eff;
  //   // color: white;
  //   border-radius: 5px;
  // }
  // button:hover {
  //   opacity: 0.8;
  // }
  .active {
    font-weight: bold;
    background-color: #ecc884;
  }
  .route-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  // .delete-route {
  //   background-color: red;
  // }
}
</style>
