<script setup>
import "ol/ol.css";
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import Point from "ol/geom/Point.js";
import View from "ol/View.js";
import { fromLonLat } from "ol/proj";
import { Icon, Style } from "ol/style";
import Feature from "ol/Feature.js";
import { Circle as CircleStyle, Fill, Stroke, Text } from "ol/style.js";
import { Vector as VectorSource, Cluster } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";

//文化景觀 icon
import attraction from "@/assets/img/mapIcon/attraction.svg";
import info from "@/assets/img/mapIcon/info.svg";
import barrier from "@/assets/img/mapIcon/barrier.svg";
import hospital from "@/assets/img/mapIcon/hospital.svg";
import hotel from "@/assets/img/mapIcon/hotel.svg";
import industry from "@/assets/img/mapIcon/industry.svg";
import militaryCamp from "@/assets/img/mapIcon/militaryCamp.svg";
import monument from "@/assets/img/mapIcon/monument.svg";
import prize from "@/assets/img/mapIcon/prize.svg";
import other from "@/assets/img/mapIcon/other.svg";
import grave from "@/assets/img/mapIcon/grave.svg";
import school from "@/assets/img/mapIcon/school.svg";
import shooting from "@/assets/img/mapIcon/shooting.svg";
import temple from "@/assets/img/mapIcon/temple.svg";
import tunnel from "@/assets/img/mapIcon/tunnel.svg";
import Star from "@/assets/img/mapIcon/Star.svg";
import restaurant from "@/assets/img/mapIcon/restaurant.svg";
import toilet from "@/assets/img/mapIcon/toilet.svg";
import drink from "@/assets/img/mapIcon/drink.svg";

const { ordinaryMap, dmaps, urbanLandZone, streetMap, landsect } =
  useLayerData();
const mapContainer = ref(null);
const mapInstance = ref(null);
const vectorSource = ref(null);

const clusterSource = ref(null);
const clusterLayer = ref(null);

// 1.初始化地圖
const initMap = () => {
  if (!mapContainer.value) {
    console.error("地圖容器未找到！");
    return;
  }

  const layers = [
    ordinaryMap,
    dmaps,
    urbanLandZone,
    landsect,
    streetMap,
    // coreLayer.value,
    // landscapeLayer.value,
  ];
  const tamsuiCenter = fromLonLat([121.4374, 25.1676]); // 淡水區中心
  mapInstance.value = new Map({
    target: mapContainer.value,
    // layers: [
    //   new TileLayer({
    //     source: new OSM(),
    //   }),
    // ],
    layers: layers,
    view: new View({
      center: tamsuiCenter,
      zoom: 14,
      projection: "EPSG:3857",
      maxZoom: 20, //限制最大可放大的程度，如果不設定會需要處理cors問題
    }),
  });

  vectorSource.value = new VectorSource();
  const vectorLayer = new VectorLayer({
    source: vectorSource.value,
  });
  mapInstance.value.addLayer(vectorLayer);
};

// 2.加入標記
const addHeritageSites = () => {
  const heritageSites = [
    { name: "紅毛城", coords: [121.4329423, 25.1754348], type: 1, bgc: 1 },
    { name: "淡江中學", coords: [121.4385, 25.1727], type: 6, bgc: 2 },
    { name: "小白宮", coords: [121.43627, 25.1742], type: 3, bgc: 3 },
    {
      name: "淡水禮拜堂",
      coords: [121.43851652739518, 25.17194656891169],
      type: 11,
      bgc: 2,
    },
    {
      name: "滬尾街醫館",
      coords: [121.4386372, 25.1718687],
      type: 1,
      bgc: 3,
    },
    {
      name: "淡水老牌阿給",
      coords: [121.43775684210453, 25.173653858612827],
      type: 13,
      bgc: 4,
    },
    {
      name: "coco",
      coords: [121.44530842827339, 25.17046144068769],
      type: 14,
      bgc: 4,
    },
    {
      name: "龜記茗品",
      coords: [121.44564766059084, 125.16960613864715],
      type: 14,
      bgc: 4,
    },
    {
      name: "麻古茶坊",
      coords: [121.4457883313154, 25.171019566056646],
      type: 14,
      bgc: 4,
    },
    {
      name: "公廁",
      coords: [121.4387554289679, 25.17279643400147],
      type: 15,
      bgc: 3,
    },
  ];

  heritageSites.forEach((site) => {
    //--寫法1:沒有使用群聚功能時--//
    //const coordinates = fromLonLat(site.coords);
    // const feature = new Feature({
    //   geometry: new Point(coordinates),
    // });
    // // 背景圓圈顏色
    // const backgroundColor = getIconColor(site.bgc);
    // const iconStyle = new Style({
    //   image: new CircleStyle({
    //     radius: 18,
    //     fill: new Fill({ color: backgroundColor }),
    //     stroke: new Stroke({ color: "rgba(255, 255, 255, 1)", width: 2 }),
    //   }),
    // });
    // // 不同類型的 icon
    // const iconWithBackground = new Style({
    //   image: new Icon({
    //     anchor: [0.5, 0.5],
    //     src: getIcon(site.type),
    //     scale: 1,
    //   }),
    // });
    // feature.setStyle([iconStyle, iconWithBackground]);
    //  vectorSource.value.addFeature(feature);
    //---//

    //使用群聚
    const features = heritageSites.map((site) => {
      const coordinates = fromLonLat(site.coords);
      const feature = new Feature({
        geometry: new Point(coordinates),
        name: site.name,
        type: site.type,
        bgc: site.bgc,
      });

      return feature;
    });
    // 使用 Cluster 來源
    clusterSource.value = new Cluster({
      distance: 40, // 控制群聚的距離，單位：像素
      source: new VectorSource({ features }),
    });

    // 創建群聚圖層
    clusterLayer.value = new VectorLayer({
      source: clusterSource.value,
      style: clusterStyle, // 設定樣式
    });
    // 加入地圖
    mapInstance.value.addLayer(clusterLayer.value);
  });
};

//建立群聚
const clusterStyle = (feature) => {
  const size = feature.get("features").length;
  const innerCircle = new CircleStyle({
    radius: size > 31 ? 60 : size > 11 && size < 30 ? 50 : 25, //數量越多，圓就越大
    fill: new Fill({ color: "rgba(160, 189, 137, 0.5)" }),
  });
  const outerCircle = new CircleStyle({
    radius: size > 31 ? 75 : size > 11 && size < 30 ? 60 : 35,
    fill: new Fill({ color: "rgba(160, 189, 137, 0.1)" }),
  });
  const originalFeature = feature.get("features")[0];
  const item = originalFeature.getProperties();

  const circleStyle = new CircleStyle({
    radius: 15, // 圈圈半径
    scale: 1,
    fill: new Fill({
      color: getIconColor(item.Rank),
    }),
    stroke: new Stroke({
      color: "rgba(255, 255, 255, 1)",
      width: 2,
    }),
  });
  const textSize = size.toString();

  if (size > 1) {
    return [
      //做出雙圓疊圖效果
      new Style({
        image: outerCircle,
      }),
      new Style({
        image: innerCircle,
        text: new Text({
          text: size.toString(),
          fill: new Fill({ color: "#fff" }),
          scale: 1,
          font: "bold 18px Noto Sans TC",
          textAlign: "center",
        }),
      }),
    ];
  } else {
    // 單獨的標記點，顯示原始圖示
    return [
      new Style({
        image: new CircleStyle({
          radius: 18,
          fill: new Fill({ color: getIconColor(item.bgc) }),
          stroke: new Stroke({ color: "rgba(255, 255, 255, 1)", width: 2 }),
        }),
        //icon下方文字
        text: new Text({
          text: item.name,
          offsetY: 35, // 垂直偏移
          font: "bold 12px Noto Sans TC",
          textAlign: "center",
          fill: new Fill({
            color: "#6C6C6C",
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 1,
          }),
          backgroundFill: new Fill({
            color: "rgba(255, 255, 255, 0.2)", // 文字背景色，白色半透明
          }),
          backgroundStroke: new Stroke({
            color: "rgba(169, 169, 169, 0.1)", // 背景外框顏色
            width: 4,
          }),
          padding: [1, 3, 1, 3], // 內邊距，讓背景色有適當間距
        }),
      }),
      new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          src: getIcon(item.type),
          scale: 1,
        }),
      }),
    ];
  }
};

// 根據類型設定不同 icon
const getIcon = (type) => {
  const icons = {
    1: attraction, // 觀光景點
    2: info, // 一般資訊地點
    3: hospital, // 醫院
    4: monument, // 紀念碑
    5: tunnel, // 隧道
    6: school,
    7: militaryCamp, // 軍營
    8: barrier, // 障礙物（可能指圍欄、封閉區域等）
    9: prize, // 獎勵（可能為獎盃、標誌）
    10: grave, // 墳墓
    11: temple, // 廟宇
    12: hotel,
    13: restaurant,
    14: drink,
    15: toilet,
    16: industry, // 工業區
    17: other, // 其他類別
    starPoint: Star, // 注意這裡是字串 key
  };
  return icons[type] || other; // 如果找不到對應的 type，就回傳 other
};

// 根據類型設定不同背景顏色
const getIconColor = (type, opacity = 1) =>
  ({
    1: `rgba(178, 99, 94, ${opacity})`,
    2: `rgba(97, 151, 168, ${opacity})`,
    3: `rgba(215, 166, 71, ${opacity})`,
    4: `rgba(72, 68, 59, ${opacity})`,
    5: `rgba(202, 178, 132, ${opacity})`,
  }[type] || "rgba(202, 178, 132, 0.8)"); // 預設顏色

//  在 `onMounted` 呼叫函式
onMounted(() => {
  initMap();
  addHeritageSites();
});
</script>

<template>
  <div>
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
}
</style>
