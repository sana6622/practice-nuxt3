<script setup>
import { useTableStore } from "@/stores/tableStore";

const store = useTableStore();
const router = useRouter();
const tableData = {
  headers: [
    { prop: "drag", label: "", minWidth: "50" },
    { prop: "id", label: "id", minWidth: "200" },
    { prop: "name", label: "景點", minWidth: "200" },
    { prop: "coords", label: "經緯度", minWidth: "200" },
    { prop: "image", label: "圖片位置", minWidth: "200" },
    { prop: "type", label: "icon類型", minWidth: "200" },
    { prop: "bgc", label: "背景色", minWidth: "200" },
  ],
};

//初始儲存資料
// store.setItems("group1", [
//   {
//     id: 1,
//     name: "紅毛城",
//     coords: [121.4329423, 25.1754348],
//     image: "/image/mapImage/紅毛城.png",
//     type: 1,
//     bgc: 1,
//   },
//   {
//     id: 2,
//     name: "淡水禮拜堂",
//     coords: [121.43851652739518, 25.17194656891169],
//     image: "/image/mapImage/淡水禮拜堂.png",
//     type: 11,
//     bgc: 2,
//   },
//   {
//     id: 3,
//     name: "淡水老牌阿給",
//     coords: [121.43775684210453, 25.173653858612827],
//     image: "/image/mapImage/淡水老牌阿給.png",
//     type: 13,
//     bgc: 4,
//   },
// ]);

const updateItems = (storeKey, newItems) => {
  store.setItems(storeKey, newItems); // 讓 Pinia 更新資料
  console.log("儲存pinia", store.tables["group1"]);
};
const nextClick = () => {
  router.push("/openlayer/openlayerStoryByTable");
};
</script>
<template>
  <div>
    <div>
      <button>上傳Excel</button>
      <p>注意: 重新進入這一頁會初始化資料(順序123)</p>
    </div>
    <DragTable
      :headers="tableData.headers"
      :items="store.tables['group1']"
      storeKey="group1"
      @update-items="updateItems"
    />
    <button @click="nextClick">下一步</button>
  </div>
</template>
