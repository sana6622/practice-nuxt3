import { defineStore } from "pinia";

export const useMultTableStore = defineStore("multTableStore", {
  state: () => ({
    routes: [
      {
        id: "route1",
        name: "台北一日遊",
        spots: [
          {
            id: "1",
            name: "台北101",
            coords: [121.564558, 25.033964], // 經緯度
            image: "/images/taipei101.jpg",
            images: ["/images/taipei101_1.jpg", "/images/taipei101_2.jpg"],
            icon: "3",
            bgc: "2",
            des: "台北的地標大樓，曾是世界最高建築。",
          },
          {
            id: "2",
            name: "中正紀念堂",
            coords: [121.519831, 25.036904],
            image: "/images/cks.jpg",
            images: ["/images/cks_1.jpg", "/images/cks_2.jpg"],
            icon: "4",
            bgc: "1",
            des: "紀念蔣中正總統的歷史建築，國家級景點。",
          },
        ],
      },
      {
        id: "route2",
        name: "淡水一日遊",
        spots: [
          {
            id: 1,
            name: "紅毛城",
            coords: [121.4329423, 25.1754348],
            image: "/image/mapImage/紅毛城.png",
            images: [
              "/image/mapImage/紅毛城.png",
              "/image/mapImage/紅毛城.png",
            ],
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
    ],
  }),
  actions: {
    addRoute(routeName) {
      const newRoute = {
        id: `route${this.routes.length + 1}`,
        name: routeName,
        spots: [],
      };
      this.routes.push(newRoute);
    },
    deleteRoute(routeId) {
      this.routes = this.routes.filter((route) => route.id !== routeId);
    },
    addSpotToRoute(routeId, spot) {
      const route = this.routes.find((r) => r.id === routeId);
      if (route) {
        route.spots.push(spot);
      }
    },
    updateSpotInRoute(routeId, updatedSpot) {
      const route = this.routes.find((r) => r.id === routeId);
      if (route) {
        const index = route.spots.findIndex((s) => s.id === updatedSpot.id);
        if (index !== -1) {
          route.spots[index] = updatedSpot;
        }
      }
    },
    setExcelSpotsInRoute(routeId, spots) {
      const route = this.routes.find((r) => r.id === routeId);
      if (route) {
        route.spots = spots;
      }
    },
    deleteSpotFromRoute(routeId, spotId) {
      const route = this.routes.find((r) => r.id === routeId);
      if (route) {
        route.spots = route.spots.filter((s) => s.id !== spotId);
      }
    },
  },
});
