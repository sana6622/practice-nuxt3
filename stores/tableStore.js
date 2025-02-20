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
          images: ["/image/mapImage/紅毛城.png", "/image/mapImage/紅毛城.png"],
          icon: 1,
          bgc: 1,
          des: "這座山頂的西班牙堡壘建於 1629 年，可以俯瞰美麗的河景。",
        },
        {
          id: 2,
          name: "淡水禮拜堂",
          coords: [121.43851652739518, 25.17194656891169],
          image: "/image/mapImage/淡水禮拜堂.png",
          images: [
            "/image/mapImage/淡水禮拜堂.png",
            "/image/mapImage/淡水禮拜堂.png",
          ],
          icon: 11,
          bgc: 2,
          des: "淡水禮拜堂堪稱臺灣北部所成立最早的教會，也是馬偕牧師親手設立之教會",
        },
        {
          id: 3,
          name: "淡水老牌阿給",
          coords: [121.43761, 25.17366],
          image: "/image/mapImage/淡水老牌阿給.png",
          images: [
            "/image/mapImage/淡水老牌阿給.png",
            "/image/mapImage/淡水老牌阿給.png",
          ],
          icon: 13,
          bgc: 4,
          des: "我的早餐",
        },
      ],
    },
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
