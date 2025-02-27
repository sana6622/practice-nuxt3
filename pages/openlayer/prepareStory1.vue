<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "ol/ol.css";
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import Point from "ol/geom/Point.js";
import View from "ol/View.js";
import { fromLonLat, toLonLat } from "ol/proj";
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
import { createEmpty, extend, getWidth, getHeight } from "ol/extent"; //群聚展開

// 🔹 **測量功能相關 Import**
import Draw from "ol/interaction/Draw.js"; // 📌 允許地圖上繪製線條
import Overlay from "ol/Overlay.js"; // 📌 讓測量距離顯示在地圖上
import { getLength, getArea } from "ol/sphere.js"; // 📌計算線長與面積

//環域
import Circle from "ol/geom/Circle.js"; // 用來繪製環域圓形
import { getDistance } from "ol/sphere"; // ✅ 用來計算經緯度距離

import { getIconPathById } from "@/constants/icons";
import { getIconColor } from "@/constants/color";
import { useWindowSize } from "@vueuse/core"; //監聽視窗大小的變化

//Todo:更改資料來源
const store = useMapDataStore();
const landScape = ref([]); //目前地圖使用景點

// **Props：接收父層傳來的景點資訊與當前選中點**
// const props = defineProps({
//   landScape: Array, // 所有景點資訊（父層傳入）
//   activeSite: Object, // 當前選中的景點
// });

const { ordinaryMap, dmaps, urbanLandZone, streetMap, landsect } =
  useLayerData();
const { width } = useWindowSize(); //監聽視窗大小的變化

// **地圖相關變數**
const mapContainer = ref(null);
const mapInstance = ref(null);
const vectorSource = new VectorSource();
const clusterSource = ref(null);
const clusterLayer = ref(null);
// const tamsuiCenter = ref(null);
const tamsuiCenter = fromLonLat([121.44572903840833, 25.16787143460989]); // 預設中心

const mapLocationCoord = ref([]);
const selectSpotName = ref(""); // 點擊的景點icon
const selectSpotId = ref(""); // 點擊的景點icon id
const showIcons = ref(true);
const showPaths = ref(true);

//dialog
const dialogVisible = ref(false);
const selectedFeature = ref(null); // 存儲選中的 Icon 資料
const modules = [Navigation, Pagination];
const swiperKey = ref(0); // 🔄 用來強制重新渲染 Swiper
const selectedImage = ref("");
const clickIconPosition = ref({ x: 0, y: 0 }); //點擊icon的畫面xy位置

const locationSource = new VectorSource(); // 📍 存放定位點
const locationLayer = new VectorLayer({
  source: locationSource,
  style: new Style({
    image: new Icon({
      anchor: [0.5, 1], // 控制圖示位置
      src: "/image/mapIcon/location-mark.svg", // 你的標記圖片
      scale: 2, // 縮放圖示大小
    }),
  }),
});

const bufferSpots = ref([]); // 存放篩選後的景點資料

//點擊地圖後標記
const clickPointSource = new VectorSource(); // 存放點擊標記
const clickPointLayer = new VectorLayer({
  source: clickPointSource,
  style: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: "/image/mapIcon/location-mark.svg",
      scale: 1.5,
    }),
  }),
});

//點擊地圖後多點標記
const recordedPoints = ref([]);
const recordedPointSource = new VectorSource(); // **記錄模式的 Source**
const recordedPointLayer = new VectorLayer({
  source: clickPointSource,
  style: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: "/image/mapIcon/location-mark.svg",
      scale: 1.5,
    }),
  }),
});
const isRecording = ref(false); //允許多點標記紀錄

const compass = ref(null); // 指南針 DOM
const compassRotation = ref(0); // 🔄 追蹤指南針的角度

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
      rotation: 0, //地圖旋轉
    }),
    controls: [], //地圖旋轉控制項
  });
  mapInstance.value.addLayer(lineLayer);
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  mapInstance.value.addLayer(vectorLayer);
  addlandScape();

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
const addlandScape = () => {
  vectorSource.clear(); // 清除舊的標記
  lineSource.clear(); // 清除舊的線段

  const features = landScape.value.map((site) => {
    const coordinates = fromLonLat(site.lonLat);
    const feature = new Feature({
      geometry: new Point(coordinates),
      id: site.id,
      name: site.title,
      order: String(site.order),
      icon: site.icon,
      bgc: site.bgc,
    });

    feature.setProperties({
      styleType: "icon", // 這行確保這個 feature 被標記為 icon
    });

    return feature;
  });

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

    clusterLayer.value.setZIndex(100); // **確保標記層始終在最上方**

    mapInstance.value.addLayer(clusterLayer.value); // **將群聚層加入地圖**
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
  if (landScape.value.length > 1) {
    const lineCoordinates = landScape.value.map((site) =>
      fromLonLat(site.lonLat)
    );
    const lineFeature = new Feature({
      geometry: new LineString(lineCoordinates),
    });

    lineSource.addFeature(lineFeature);
  }
  lineLayer.setZIndex(99); //線段在塗層最上面
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
        //icon 圖示
        // image: new Icon({
        //   anchor: [0.5, 0.5],
        //   // src: getIcon(item.type),
        //   src: getIconPathById(item.icon),
        //   scale: 1,
        // }),

        //icon 文字
        text: new Text({
          text: item.order, // 顯示 order
          offsetY: 2,
          font: "bold 14px Arial",
          fill: new Fill({ color: "#fff" }),
        }),
      }),
    ];
  }
};

// 定義群聚點擊 & icon點擊
const handleFeatureClick = (event) => {
  if (!mapInstance.value) return;

  mapInstance.value.forEachFeatureAtPixel(event.pixel, (feature) => {
    let properties = feature.getProperties();

    if (properties.features && properties.features.length > 1) {
      // **傳遞群聚內的標記**
      expandCluster(properties.features);
    } else if (properties.features && properties.features.length == 1) {
      console.log("點擊icon");
      // **這是單個標記**
      const firstFeature = properties.features[0]; // 取第一個 feature
      const firstFeatureProps = firstFeature.getProperties(); // 再取 properties

      const selectId = firstFeatureProps.id;
      // const iconName = firstFeatureProps.name;
      const coords = firstFeature.getGeometry().getCoordinates();

      selectedFeature.value = landScape.value.find(
        (site) => site.id === selectId
      );
      dialogVisible.value = true;
      console.log("slectFeature", selectedFeature.value);

      const pixel = event.pixel; // 取得點擊位置
      console.log("pixel", pixel);
      clickIconPosition.value = { x: pixel[0], y: pixel[1] }; // **存入 clickPosition**
      console.log("clickIcon", clickIconPosition.value);
      mapInstance.value.getView().animate({
        center: coords,
        zoom: 18,
        duration: 500,
        maxZoom: 20,
      });
      // selectSpotName.value = iconName;
      selectSpotId.value = selectId;
      // emit("select-site", iconName); // 傳遞點擊的 Icon 名稱給父層
    }
  });
};

// **點擊群聚後展開**
const expandCluster = (clusterFeatures) => {
  if (!mapInstance.value) return;

  const view = mapInstance.value.getView();

  if (clusterFeatures.length === 1) {
    // **只剩一個標記，不再放大**
    console.log("✅ 只剩一個標記，停止放大");
    return;
  }

  // 取得所有標記的座標
  const coordinates = clusterFeatures.map((f) =>
    f.getGeometry().getCoordinates()
  );

  // 計算標記的 **最小範圍**
  const extent = createEmpty();
  coordinates.forEach((coord) =>
    extend(extent, [coord[0], coord[1], coord[0], coord[1]])
  );
  let padding;

  if (width.value < 768) {
    padding = [0, 0, 0, 0];
  } else {
    padding = [200, 200, 200, 200];
  }

  // **調整視野**，讓這些標記顯示得更明顯
  view.fit(extent, {
    duration: 600, //轉場時間
    padding: padding, // 避免標記太貼近邊界
    maxZoom: 20, // 限制最大縮放
  });

  console.log(`🔍 放大視野，包含 ${clusterFeatures.length} 個標記`);
};

// 📌 將 `handleFeatureClick` 綁定到地圖點擊事件
const registerClickEvent = () => {
  if (!mapInstance.value) return;

  // **先移除舊的監聽，避免重複**
  mapInstance.value.un("singleclick", handleFeatureClick);

  // **重新綁定點擊事件**
  mapInstance.value.on("singleclick", handleFeatureClick);
};

// **飛到指定景點**
const flyTo = (coords) => {
  mapInstance.value.getView().animate({
    center: fromLonLat(coords), // 轉成 EPSG:3857
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

// **更新 線條 顯示狀態**
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
  landScape.value = [...newSites]; // 重新賦值
  addlandScape(); // 重新繪製標示
};

//加入定位點
const setLocation = (lon, lat) => {
  console.log("setLocat", lon, lat);
  //清空
  clearLocation(), clearCircleRange(), clearHandleMapClick();

  if (!mapInstance.value) return;

  const coords = fromLonLat([lon, lat]); // 轉換成地圖座標
  locationSource.clear(); // 移除舊標記

  const locationFeature = new Feature({
    geometry: new Point(coords),
  });

  locationSource.addFeature(locationFeature);

  // 確保標記圖層加入地圖
  if (!mapInstance.value.getLayers().getArray().includes(locationLayer)) {
    mapInstance.value.addLayer(locationLayer);
  }

  // 🚀 平滑移動到標記位置
  mapInstance.value.getView().animate({
    center: coords,
    zoom: 18,
    duration: 500,
  });
};

//清除定位點
const clearLocation = () => {
  locationSource.clear();
};

//**建立環域圖型 */
const circleSource = new VectorSource();
const circleLayer = new VectorLayer({
  source: circleSource,
  style: new Style({
    stroke: new Stroke({
      color: "rgba(0, 0, 255, 0.8)", // 藍色邊框
      width: 2,
      lineDash: [10, 5], // 虛線樣式
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.2)", // 淡藍色填充
    }),
  }),
});
const drawCircleRange = (lon, lat, radius) => {
  const center = fromLonLat([lon, lat]); // 轉換經緯度到地圖座標

  // **清除舊的環域範圍**
  circleSource.clear();

  // **建立新圓形**
  const circleFeature = new Feature({
    geometry: new Circle(center, radius), // OpenLayers 的 Circle 幾何
  });

  circleSource.addFeature(circleFeature);
  // **篩選景點**
  filterPOIWithinRange(lon, lat, radius);
};

const clearCircleRange = () => {
  circleSource.clear(); // 清除所有圓形
  poiSource.clear();
};

/*建立環域景點******/
const poiSource = new VectorSource(); // ✅ 景點標記來源
// **景點標記圖層**
const poiLayer = new VectorLayer({
  source: poiSource,
  style: (feature) => {
    return [
      // 🔵 背景圓圈
      new Style({
        image: new CircleStyle({
          radius: 12, // 控制圓圈大小
          fill: new Fill({ color: "rgba(255, 223, 0, 0.8)" }), // 黃色背景
          stroke: new Stroke({ color: "#FFD700", width: 2 }), // 金色邊框
        }),
      }),

      // ⭐️ 景點標記 Icon
      new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          src: "/image/mapIcon/star.svg",
          scale: 1.2,
        }),
      }),
    ];
  },
});
//  **取得台灣觀光景點 Open Data**
const tourismData = ref([]); // 存放觀光景點資料
const fetchTourismData = async () => {
  try {
    const response = await fetch(
      "https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot?%24format=JSON"
    );
    const data = await response.json();
    tourismData.value = data.filter(
      (spot) =>
        spot.Position && spot.Position.PositionLon && spot.Position.PositionLat
    ); // 確保景點有經緯度
    console.log("✅ 取得景點資料:", tourismData.value);
  } catch (error) {
    console.error("❌ 取得景點資料失敗:", error);
  }
};
//  **篩選環域內的景點**
const filterPOIWithinRange = (lon, lat, radius) => {
  poiSource.clear(); // 清除舊標記
  bufferSpots.value = [];
  const centerCoords = [lon, lat]; // 原始經緯度

  tourismData.value.forEach((spot) => {
    const spotLon = spot.Position.PositionLon;
    const spotLat = spot.Position.PositionLat;
    const distance = getDistance(centerCoords, [spotLon, spotLat]); // 計算距離
    console.log("distance radius)", distance, radius);
    // 該景點在範圍內
    if (distance <= radius) {
      //左側欄位資料
      bufferSpots.value.push({
        // ...spot,
        id: spot.ScenicSpotID,
        title: spot.ScenicSpotName,
        images: spot.Picture
          ? Object.values(spot.Picture).filter(
              (url) => typeof url === "string" && url.startsWith("http")
            ) // 確保是圖片 URL
          : [],
        content: spot.Description || "無描述",
        distance: distance.toFixed(2),
      });

      const spotCoords = fromLonLat([spotLon, spotLat]);

      //dialog內呈現資料
      const poiFeature = new Feature({
        geometry: new Point(spotCoords),
        title: spot.ScenicSpotName,
        type: "POI", // 標記為 POI，方便判斷
        location: spot.Address || "未知地址",
        // images: spot.Picture.PictureUrl1 ? [spot.Picture.PictureUrl1] : [], // 取得所有圖片
        images: spot.Picture
          ? Object.values(spot.Picture).filter(
              (url) => typeof url === "string" && url.startsWith("http")
            ) // 確保是圖片 URL
          : [],
        content: spot.Description || "無描述",
        lonLat: [spotLon, spotLat],
      });

      poiSource.addFeature(poiFeature);
    }
  });
};

//****取得目前位置****
const showCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("❌ 你的瀏覽器不支援 Geolocation API");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log("position", position);
      const { latitude, longitude, accuracy } = position.coords;
      const coords = fromLonLat([longitude, latitude]);
      // if (accuracy > 1000) {
      //   console.warn(`⚠️ 位置誤差過大 (${accuracy}m)，等待更精確的定位...`);
      //   return;
      // }

      // 清除舊標記
      locationSource.clear();

      // 新增定位標記
      const locationFeature = new Feature({
        geometry: new Point(coords),
      });

      locationSource.addFeature(locationFeature);

      // 平滑移動到當前位置
      mapInstance.value.getView().animate({
        center: coords,
        zoom: 16,
        duration: 800,
      });
    },
    (error) => {
      console.error("❌ 獲取位置失敗:", error);
      alert("無法獲取位置，請確認你已允許位置存取");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};

//** 點擊任一點 進行打點標記**********
const handleMapClick = (event) => {
  if (!mapInstance.value) return;

  const clickedCoordinate = event.coordinate; // 取得點擊的地圖座標
  const lonLat = toLonLat(clickedCoordinate); // 轉換為經緯度
  mapLocationCoord.value = lonLat;

  // ✅ 檢查是否點擊到 環域景點 POI
  let clickedPOI = null;
  mapInstance.value.forEachFeatureAtPixel(event.pixel, (feature) => {
    if (feature.get("type") === "POI") {
      clickedPOI = feature.getProperties();
    }
  });

  if (clickedPOI) {
    console.log("✅ 點擊了 POI:", clickedPOI);
    selectedFeature.value = clickedPOI;
    dialogVisible.value = true;

    // 設定 dialog 位置
    clickIconPosition.value = { x: event.pixel[0], y: event.pixel[1] };
    return;
  }

  //清空畫面(環域景點以外的狀態)
  clearCircleRange();
  clearLocation();

  if (isRecording.value) {
    // 記錄模式：允許多個標記
    const clickFeature = new Feature({
      geometry: new Point(clickedCoordinate),
    });

    clickPointSource.addFeature(clickFeature);
    recordedPoints.value.push({
      lon: lonLat[0].toFixed(5),
      lat: lonLat[1].toFixed(5),
    });
    emit("recorded-sites", recordedPoints.value);
  } else {
    // 單點模式：清除舊點，新增新標記
    clickPointSource.clear();
    const clickFeature = new Feature({
      geometry: new Point(clickedCoordinate),
    });

    clickPointSource.addFeature(clickFeature);

    // emit("click-site", lonLat);
  }
};
const clearHandleMapClick = () => {
  clickPointSource.clear();
};

// **開始記錄**
const startRecording = () => {
  clickPointSource.clear(); //清空之前的其他點擊紀錄
  recordedPoints.value = [];
  isRecording.value = true;
};

// **停止記錄**
const stopRecording = () => {
  isRecording.value = false;
  clickPointSource.clear();
  recordedPoints.value = [];
};

//**旋轉地圖***
const rotateMap = (angle) => {
  if (!mapInstance.value) return;
  const view = mapInstance.value.getView();
  const newRotation = view.getRotation() + angle;

  view.setRotation(view.getRotation() + angle); // ✅ 旋轉地圖
  compassRotation.value = newRotation * (180 / Math.PI); // 📌 更新指南針角度 (轉換成角度)
  updateCompass();
};

const resetRotation = () => {
  if (!mapInstance.value) return;
  mapInstance.value.getView().setRotation(0); // ✅ 重置角度
  compassRotation.value = 0; // 📌 重置指南針角度
  updateCompass();
};
const updateCompass = () => {
  if (compass.value) {
    compass.value.style.transform = `rotate(${compassRotation.value}deg)`; // 📌 套用旋轉
  }
};

/**滑鼠移到icon 變手手 */
const enablePointerCursor = () => {
  if (!mapInstance.value) return;

  mapInstance.value.on("pointermove", (event) => {
    const hasFeature = mapInstance.value.forEachFeatureAtPixel(
      event.pixel,
      (feature) => {
        const properties = feature.getProperties();
        return properties.features?.length > 0 || properties.type === "POI"; // 有 features 代表是標記或群聚點
      }
    );

    // ✅ 根據 `hasFeature` 設定游標樣式
    mapInstance.value.getTargetElement().style.cursor = hasFeature
      ? "pointer"
      : "";
  });
};

/*swiper***/
// 當 `selectedFeature` 變更時，回到第一張圖片
watch(selectedFeature, (newList) => {
  swiperKey.value += 1;
});
/*🔍 點擊圖片開啟預覽*/

const openImagePreview = (image) => {
  selectedImage.value = image;
};

/***放大 縮小按鈕 */
const zoomHandle = (type) => {
  const currentZoom = mapInstance.value.getView().getZoom();
  const zoomNum = type == "zoomIn" ? currentZoom + 1 : currentZoom - 1;
  mapInstance.value.getView().animate({
    zoom: zoomNum,
    duration: 500,
  });
};

// **處理來自子層事件**
const updateLandscape = (newSpots) => {
  landScape.value = [...newSpots];
  addlandScape(); // 重新繪製標示
  flyTo(landScape.value[0].lonLat);
};

const updateActiveSpot = (spot) => {
  flyTo(spot);
};
const updatePosition = (spot) => {
  console.log("updatePosition", spot);
  setLocation(spot[0], spot[1]);
};
const updateCircleRange = (lon, lat, rad) => {
  console.log("draw", lon, lat, rad);
  drawCircleRange(lon, lat, rad);
};
const clearMap = () => {
  clearLocation(), clearCircleRange(), clearHandleMapClick();
  mapLocationCoord.value = [];
};

onMounted(() => {
  console.log("store", store.mapList[0].pointList);
  landScape.value = [...store.mapList[0].pointList];
  console.log("landScape.value", landScape.value);

  console.log(
    "landScape.value",
    landScape.value[0].lonLat[0],
    landScape.value[0].lonLat[1]
  );
  // tamsuiCenter.value = fromLonLat([
  //   landScape.value[0].coords[0],
  //   landScape.value[0].coords[1],
  // ]); // 預設中心
  // console.log(
  //   "fromLonLat)",
  //   fromLonLat([landScape.value[0].coords[0], landScape.value[0].coords[1]])
  // );
  // const tamsuiCenter = fromLonLat([121.44572903840833, 25.16787143460989]);
  initMap();
  //綁定群聚點擊事件
  registerClickEvent();

  fetchTourismData();
  mapInstance.value.addLayer(locationLayer); //加入定位點
  mapInstance.value.addLayer(poiLayer); // 加入環域景點圖層
  mapInstance.value.addLayer(circleLayer); // 加入環域範圍圖層

  locationLayer.setZIndex(10); // 定位圖層在最上面
  poiLayer.setZIndex(10); // 景點圖層在最上面
  circleLayer.setZIndex(5); // 環域圖層
  clickPointLayer.setZIndex(10); // 📍 點擊標記圖層在最上面

  mapInstance.value.on("singleclick", handleMapClick); // 📍 監聽地圖點擊事件
  mapInstance.value.addLayer(clickPointLayer); // 📍 加入點擊標記圖層

  // **監聽地圖旋轉事件**
  compass.value = document.getElementById("compass");
  if (mapInstance.value) {
    mapInstance.value.getView().on("change:rotation", () => {
      compassRotation.value =
        -mapInstance.value.getView().getRotation() * (180 / Math.PI);
      updateCompass();
    });
  }
  enablePointerCursor(); // ✋ 啟用指標游標
});

// 定義 emit 事件，讓父層接收點擊結果
const emit = defineEmits([
  "select-site",
  "update-measurement",

  "recorded-sites",
]);

// **暴露方法供父層 (`OpenlayerBasic.vue`) 呼叫**
defineExpose({
  flyTo,
  updateIcons,
  updatePaths, //畫線
  updateSites,
  // resetView,
  getMap: () => mapInstance.value, //為了新增圖層(如地籍圖)

  setLocation,
  clearLocation,
  drawCircleRange,
  clearCircleRange,
  clearHandleMapClick,
  startRecording,
  stopRecording,
});
</script>

<template>
  <div class="prepareStory">
    <PrepareStoryQueryList1
      @update-landscape="updateLandscape"
      @update-activeSpot="updateActiveSpot"
      @update-position="updatePosition"
      @update-circleRange="updateCircleRange"
      @clear-map="clearMap"
      :mapLocationCoord="mapLocationCoord"
      :selectSpotId="selectSpotId"
      :bufferSpots="bufferSpots"
    ></PrepareStoryQueryList1>

    <div ref="mapContainer" class="map-container"></div>

    <div class="buttonList">
      <el-button @click="showCurrentLocation">
        <img src="../../assets/img/postion.svg" alt="" />
      </el-button>
      <el-button @click="zoomHandle('zoomIn')">+</el-button>
      <el-button @click="zoomHandle('zoomOut')">-</el-button>
      <div id="compass" class="compass"></div>
    </div>
    <DraggableDialog
      v-if="dialogVisible"
      :visible="dialogVisible"
      :data="selectedFeature"
      title="景點詳細資訊"
      :position="clickIconPosition"
      @close="dialogVisible = false"
    >
      <template v-if="selectedFeature">
        <div class="swiper-container">
          <Swiper
            ref="swiperRef"
            :key="swiperKey"
            :slides-per-view="1"
            :space-between="30"
            :keyboard="{
              enabled: true,
            }"
            :pagination="{
              clickable: true,
            }"
            :navigation="true"
            :modules="modules"
            class="mySwiper"
          >
            <SwiperSlide
              v-for="(image, index) in selectedFeature.images"
              :key="`image-${index}`"
            >
              <div class="box">
                <img :src="image" alt="圖片" @click="openImagePreview(image)" />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <h3>{{ selectedFeature.title }}</h3>
        <p v-if="selectedFeature.content">{{ selectedFeature.content }}</p>

        <p v-if="selectedFeature.location">
          📍 位置：{{ selectedFeature.location }}
        </p>
      </template>
    </DraggableDialog>

    <!-- 🔍 圖片放大預覽 -->
    <div
      v-if="selectedImage"
      class="image-overlay"
      @click="selectedImage = null"
    >
      <div class="image-container">
        <img :src="selectedImage" class="preview-image" />
        <button class="close-btn" @click.stop="selectedImage = null">✖</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.prepareStory {
  position: relative;
  .map-container {
    width: 100%;
    height: 800px;
    position: relative;
  }
  .buttonList {
    outline: 3px solid red;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 99;
  }
  /* 🔍 全螢幕圖片預覽 */
  .image-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .image-container {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .preview-image {
    max-width: 90vw;
    max-height: 90vh;
    min-width: 50vw;
    object-fit: contain;
    border-radius: 8px;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    color: white;
    font-size: 20px;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 50%;
  }

  .close-btn:hover {
    background: rgba(0, 0, 0, 0.8);
  }
}
</style>
