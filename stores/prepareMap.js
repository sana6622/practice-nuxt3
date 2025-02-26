import { defineStore } from "pinia";

export const windowStore = defineStore("window", {
  state: () => ({
    hide: false,
    active: "",
  }),
});

export const useMapDataStore = defineStore("mapDataStore", {
  state: () => ({
    mapList: [
      {
        mapTitle: "淡水一日遊",
        mapType: "customMap",
        theme: "light",
        isDefaultMap: true,
        mapID: "map0",
        pointList: [
          {
            title: "紅毛城",
            content: "這座山頂的西班牙堡壘建於 1629 年，可以俯瞰美麗的河景。",
            geometry: "",
            id: "Point0",
            lonLat: [121.4329423, 25.1754348], // 經緯度
            coordinates: [], // 轉換後的投影座標（EPSG:3857）
            type: "Point",
            order: 0,
            tagType: ["default"],
            tagTxt: ["default"],
            isStreetView: false,
            icon: 1, //資料中可能沒有 記得刪掉
            bgc: 1, //資料中可能沒有 記得刪掉
          },
          {
            title: "淡水禮拜堂",
            content:
              "淡水禮拜堂堪稱臺灣北部所成立最早的教會，也是馬偕牧師親手設立之教會。",
            geometry: "",
            id: "Point1",
            lonLat: [121.43851652739518, 25.17194656891169], // 經緯度
            coordinates: [], // 轉換後的投影座標（EPSG:3857）
            type: "Point",
            order: 1,
            tagType: ["default"],
            tagTxt: ["default"],
            isStreetView: false,
            icon: 1, //資料中可能沒有 記得刪掉
            bgc: 1, //資料中可能沒有 記得刪掉
          },
          {
            title: "淡水老牌阿給",
            content: "我的早餐",
            geometry: "",
            id: "Point2",
            lonLat: [121.43761, 25.17366], // 經緯度
            coordinates: [], // 轉換後的投影座標（EPSG:3857）
            type: "Point",
            order: 2,
            tagType: ["default"],
            tagTxt: ["default"],
            isStreetView: false,
            icon: 1, //資料中可能沒有 記得刪掉
            bgc: 1, //資料中可能沒有 記得刪掉
          },
        ],
      },
      {
        mapTitle: "台北一日遊",
        mapType: "customMap",
        theme: "light",
        isDefaultMap: false,
        mapID: "map1",
        pointList: [
          {
            title: "台北101",
            content: "台北的地標大樓，曾是世界最高建築。",
            geometry: "",
            id: "Point3",
            lonLat: [121.564558, 25.033964], // 經緯度
            coordinates: [], // 轉換後的投影座標（EPSG:3857）
            type: "Point",
            order: 0,
            tagType: ["default"],
            tagTxt: ["default"],
            isStreetView: false,
            icon: 1, ///資料中可能沒有 記得刪掉
            bgc: 1, ///資料中可能沒有 記得刪掉
          },
          {
            title: "中正紀念堂",
            content: "紀念蔣中正總統的歷史建築，國家級景點。",
            geometry: "",
            id: "Point4",
            lonLat: [121.519831, 25.036904], // 經緯度
            coordinates: [], // 轉換後的投影座標（EPSG:3857）
            type: "Point",
            order: 1,
            tagType: ["default"],
            tagTxt: ["default"],
            isStreetView: false,
            icon: 1, //資料中可能沒有 記得刪掉
            bgc: 1, //資料中可能沒有 記得刪掉
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
      console.log("pinia 被更新囉");
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
