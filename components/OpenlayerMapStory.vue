<script setup>
import "ol/ol.css";
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import Point from "ol/geom/Point.js";
import View from "ol/View.js";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature.js";
import { Vector as VectorSource, Cluster } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import {
  Style,
  Icon,
  Text,
  Fill,
  Stroke,
  Circle as CircleStyle,
} from "ol/style.js";
import LineString from "ol/geom/LineString.js";

import { getIconPathById } from "@/constants/icons";
import { getIconColor } from "@/constants/color";

const { ordinaryMap, dmaps, urbanLandZone, streetMap, landsect } =
  useLayerData();

// **Props：接收父層傳來的景點資訊與當前選中點**
const props = defineProps({
  heritageSites: Array, // 所有景點資訊（父層傳入）
  activeSite: Object, // 當前選中的景點
});

// **地圖相關變數**
const mapContainer = ref(null);
const mapInstance = ref(null);
const vectorSource = new VectorSource();
const clusterSource = ref(null);
const clusterLayer = ref(null);
const tamsuiCenter = fromLonLat([121.44572903840833, 25.16787143460989]); // 預設中心
const heritageSites = ref([...props.heritageSites]);
const showIcons = ref(true);
const showPaths = ref(true);
// **初始化地圖**
const initMap = () => {
  const layers = [
    ordinaryMap,
    dmaps,
    urbanLandZone,
    landsect,
    streetMap,
    // coreLayer.value,
    // landscapeLayer.value,
  ];
  mapInstance.value = new Map({
    target: mapContainer.value,
    layers: layers,
    view: new View({
      center: tamsuiCenter,
      zoom: 18,
      projection: "EPSG:3857",
      maxZoom: 20, //限制最大可放大的程度，如果不設定會需要處理cors問題
    }),
  });
  mapInstance.value.addLayer(lineLayer);
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  mapInstance.value.addLayer(vectorLayer);
  addHeritageSites();

  mapInstance.value.on("moveend", () => {
    if (!showPaths.value) {
      // console.log("showPaths 為 false，不顯示線條");
      return; // 不執行 checkClusterStatus()
    }
    // console.log("視野變更，重新檢查群聚");
    checkClusterStatus();
  });
};

// **新增線段的 VectorSource & VectorLayer**
const lineSource = new VectorSource();
const lineLayer = new VectorLayer({
  source: lineSource,
  style: new Style({
    stroke: new Stroke({
      color: "rgba(0, 0, 255, 0.8)", // 藍色線條
      width: 2,
    }),
  }),
});

// **加入標記（包含父層傳入的資料）**
const addHeritageSites = () => {
  vectorSource.clear(); // 清除舊的標記
  lineSource.clear(); // 清除舊的線段

  const features = heritageSites.value.map((site) => {
    const coordinates = fromLonLat(site.coords);
    const feature = new Feature({
      geometry: new Point(coordinates),
      name: site.name,
      icon: site.icon,
      bgc: site.bgc,
    });

    feature.setProperties({
      styleType: "icon", // 這行確保這個 feature 被標記為 icon
    });

    return feature;
  });
  console.log("features", features);

  // **初始化 Cluster**
  if (!clusterSource.value) {
    clusterSource.value = new Cluster({
      distance: 40,
      source: new VectorSource({ features }),
    });

    clusterLayer.value = new VectorLayer({
      source: clusterSource.value,
      style: clusterStyle,
    });

    // **將群聚層加入地圖**
    mapInstance.value.addLayer(clusterLayer.value);
  } else {
    // **更新群聚數據**
    clusterSource.value.getSource().clear();
    clusterSource.value.getSource().addFeatures(features);
  }

  checkClusterStatus();
};

//畫線
const checkClusterStatus = () => {
  if (!clusterSource.value) return;

  const clusters = clusterSource.value.getFeatures();

  let hasCluster = false;

  clusters.forEach((cluster) => {
    const clusterFeatures = cluster.get("features");

    if (!clusterFeatures || clusterFeatures.length === 0) {
      return;
    }

    // if (clusterFeatures.length > 1) {
    //   hasCluster = true; // **發現群聚，標記為 true**
    // }
  });

  //有群聚不畫線功能
  // if (hasCluster) {
  //   console.log("群聚存在，不畫線");
  //   lineSource.clear(); // **如果有群聚，就清除線條**
  //   return;
  // }

  //畫線
  lineSource.clear();
  if (heritageSites.value.length > 1) {
    const lineCoordinates = heritageSites.value.map((site) =>
      fromLonLat(site.coords)
    );
    const lineFeature = new Feature({
      geometry: new LineString(lineCoordinates),
    });
    lineSource.addFeature(lineFeature);
  }
};

//建立群聚
const clusterStyle = (feature) => {
  const size = feature.get("features").length;
  const innerCircle = new CircleStyle({
    radius: size > 31 ? 60 : size > 11 && size < 30 ? 50 : 25, //數量越多，圓就越大
    fill: new Fill({ color: "rgba(160, 189, 137, 1)" }),
  });
  const outerCircle = new CircleStyle({
    radius: size > 31 ? 75 : size > 11 && size < 30 ? 60 : 35,
    fill: new Fill({ color: "rgba(160, 189, 137, 0.8)" }),
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
            color: "rgba(255, 255, 255, 0.6)", // 文字背景色，白色半透明
          }),
          backgroundStroke: new Stroke({
            color: "rgba(169, 169, 169, 0.1)", // 背景外框顏色
            width: 4,
          }),
          padding: [1, 3, 1, 4], // 內邊距，讓背景色有適當間距
        }),
      }),
      new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          // src: getIcon(item.type),
          src: getIconPathById(item.icon),
          scale: 1,
        }),
      }),
    ];
  }
};

// **飛到指定景點**
const flyTo = (coords) => {
  mapInstance.value.getView().animate({
    center: fromLonLat(coords),
    zoom: 18,
    duration: 500,
    maxZoom: 20, //限制最大可放大的程度，如果不設定會需要處理cors問題
  });
};

// **恢復預設地圖視角**
const resetView = () => {
  mapInstance.value.getView().animate({
    center: tamsuiCenter,
    zoom: 18,
    duration: 500,
    maxZoom: 20, //限制最大可放大的程度，如果不設定會需要處理cors問題
  });
};

// **更新 Icons 顯示狀態**
const updateIcons = (showIcon) => {
  console.log("show", showIcon);
  showIcons.value = showIcon;
  if (showIcon) {
    if (
      !mapInstance.value.getLayers().getArray().includes(clusterLayer.value)
    ) {
      mapInstance.value.addLayer(clusterLayer.value);
    }
  } else {
    mapInstance.value.removeLayer(clusterLayer.value);
  }
};

// **更新 Paths 顯示狀態**
const updatePaths = (showPath) => {
  showPaths.value = showPath;
  if (showPath) {
    checkClusterStatus();
    if (!mapInstance.value.getLayers().getArray().includes(lineLayer)) {
      mapInstance.value.addLayer(lineLayer);
    }
  } else {
    lineSource.clear(); // 清除線條
    mapInstance.value.removeLayer(lineLayer);
  }
};

//重新賦值(當父層做景點篩選時)
const updateSites = (newSites) => {
  console.log("123123");
  heritageSites.value = [...newSites]; // 重新賦值
  console.log(" 子heritageSites.value ", heritageSites.value);
  addHeritageSites(); // 重新繪製標示
};

onMounted(() => {
  initMap();
  //點擊Icon 取得icon的name 傳到父層
  mapInstance.value.on("singleclick", (event) => {
    mapInstance.value.forEachFeatureAtPixel(event.pixel, (feature) => {
      let properties = feature.getProperties();

      if (properties.features) {
        const firstFeature = properties.features[0]; // 取第一個 feature
        properties = firstFeature.getProperties(); // 重新取 properties
      }

      // **確保 styleType 存在**
      if (properties.styleType === "icon") {
        console.log("✅ 點擊了 Icon:", properties.name);
        emit("select-site", properties.name);
      }
    });
  });
});
// 定義 emit 事件，讓父層接收點擊結果
const emit = defineEmits(["select-site"]);

// **暴露方法供父層 (`OpenlayerBasic.vue`) 呼叫**
defineExpose({
  flyTo,
  updateIcons,
  updatePaths,
  updateSites,
  // resetView,
});
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
