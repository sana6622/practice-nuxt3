import { defineStore } from "pinia";

export const useTableStore = defineStore("tableStore", {
  state: () => ({
    tables: {
      group1: [
        {
          id: 1,
          name: "紅毛城",
          coords: [121.4329423, 25.1754348],
          image: "/image/mapImage/紅毛城.png",
          type: 1,
          bgc: 1,
        },
        {
          id: 2,
          name: "淡水禮拜堂",
          coords: [121.43851652739518, 25.17194656891169],
          image: "/image/mapImage/淡水禮拜堂.png",
          type: 11,
          bgc: 2,
        },
        {
          id: 3,
          name: "淡水老牌阿給",
          coords: [121.43775684210453, 25.173653858612827],
          image: "/image/mapImage/淡水老牌阿給.png",
          type: 13,
          bgc: 4,
        },
      ],
    }, // 這裡存儲不同頁面的表格資料
  }),
  actions: {
    setItems(key, newItems) {
      if (!this.tables[key]) {
        this.tables[key] = [];
      }
      this.tables[key] = newItems;
    },
    reorderItems(key, draggedIndex, dropIndex) {
      if (!this.tables[key]) return;
      const draggedItem = this.tables[key].splice(draggedIndex, 1)[0];
      this.tables[key].splice(dropIndex, 0, draggedItem);
    },
  },
});
