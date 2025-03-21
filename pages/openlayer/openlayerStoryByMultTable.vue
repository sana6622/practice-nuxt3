<script setup>
import { ref, onMounted, nextTick } from "vue";
import OpenlayerMapBasic from "@/components/OpenlayerMapBasic.vue";
import { useMultTableStore } from "@/stores/multTableStore";

import { getIconPathById, iconList } from "@/constants/icons";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";
const {
  ordinaryMap,
  dmaps,
  urbanLandZone,
  streetMap,
  landsect,
  cartoPositron,
  cartoDarkMatter,
  esriImagery,
} = useLayerData();

// Swiper 核心與模組的樣式
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
const modules = [Navigation, Pagination];
const swiperRef = ref(null); // Swiper 的 ref
const swiperKey = ref(0);

const store = useMultTableStore();
const router = useRouter();

const landScape = ref([]);
const selectIcon = ref("");

const routsList = ref([...store.routes]);
const currentRouteId = ref("");

const activeImage = ref(""); // 當前顯示的圖片
const activeImageList = ref([]);
const activeSit = ref({});
const mapRef = ref(null); // OpenLayer Map 元件的 ref
const selectedBaseLayer = ref(null); //選擇底圖樣式
const baseLayers = [
  { label: "道路圖", value: streetMap },
  { label: "淺色地圖", value: cartoPositron },
  { label: "深色地圖", value: cartoDarkMatter },
  { label: "衛星地圖", value: esriImagery },
  { label: "預設地圖", value: null }, // 回到 ordinaryMap
];
const measurementResult = ref("");

//定位功能
const longitude = ref("121.41218480726137"); //經度
const latitude = ref("25.18327793537947"); //緯度
const landmark = ref("滬尾礮臺");
const address = ref("新北市淡水區中正路229-9號");
const searchFuzzyAddress = ref("中正路");
const searchFuzzyNum = ref(10);
const searchFuzzyResults = ref([]);

//環域功能
const lonRange = ref("121.44550050003362"); //經度
const latRange = ref("25.168811935403998"); //緯度
const radius = ref(500); // 預設環域半徑 500 公尺
const radius2 = ref(500);
//點擊地圖打點
const clickCoords = ref([]);
const recordedCoords = ref([]);
//路徑規劃
const transportation = ref("car");
const startPath = ref("121.43293257662818,25.1754506520644");
const endPath = ref("121.43835363903158,25.172986633737438");

// **滑鼠進入時，更新地圖與圖片**
const hoverLocation = (site) => {
  if (mapRef.value && mapRef.value.flyTo) {
    mapRef.value.flyTo(site.coords);
  } else {
    console.warn("flyTo function is not available on mapRef.value");
  }
  activeImage.value = site.image;
  activeImageList.value = site.images;
  console.log(" activeImageList.value", activeImageList.value);
};

// **滑鼠移開時，恢復地圖與圖片**
const resetView = () => {
  // console.log("Resetting View");
  // if (mapRef.value && mapRef.value.resetView) {
  //   mapRef.value.resetView();
  // } else {
  //   console.warn("resetView function is not available on mapRef.value");
  // }
  activeImage.value = "";
  activeImageList.value = [];
};

// 控制 icon 和 paths 顯示
const showIcon = ref(true);
const showPath = ref(true);

const toggleIcons = () => {
  showIcon.value = !showIcon.value;
  mapRef.value.updateIcons(showIcon.value);
};

const togglePaths = () => {
  showPath.value = !showPath.value;
  mapRef.value.updatePaths(showPath.value);
};

// 📌 ***地籍圖切換功能******************
// 透過取得 OpenLayers 地圖實例 (`getMap()`) 來操作地圖圖層
// 使用以下 API 來控制圖層顯示：
// - `getLayers()` → 取得所有圖層
// - `getView()` → 取得地圖視角
// - `addLayer(layer)` → 新增圖層
// - `removeLayer(layer)` → 移除圖層
// - `updateSize()` → 更新地圖尺寸，確保 UI 正確顯示
//地籍圖 &段籍圖
const toggleOverLayer = (layer, layerName) => {
  if (!mapRef.value || !mapRef.value.getMap) {
    console.warn("地圖未初始化");
    return;
  }

  const map = mapRef.value.getMap();
  const currentVisibility = layer.getVisible();

  if (!currentVisibility) {
    // 當前為隱藏狀態，啟用圖層並加入地圖
    layer.setVisible(true);
    layer.setZIndex(10);

    if (!map.getLayers().getArray().includes(layer)) {
      map.addLayer(layer);
    }

    console.log(`✅ 已顯示圖層 (${layerName})`);
  } else {
    //當前為顯示狀態，隱藏圖層並從地圖移除
    layer.setVisible(false);

    if (map.getLayers().getArray().includes(layer)) {
      map.removeLayer(layer);
    }

    console.log(`🚫 已隱藏圖層 (${layerName})`);
  }

  // **強制更新地圖**
  map.updateSize();
};

const setBaseLayer = (selectedLayerName) => {
  const map = mapRef.value.getMap();
  const baseLayerObjects = baseLayers.map((l) => l.value).filter(Boolean); // 取得所有底圖

  // 隱藏所有底圖
  baseLayerObjects.forEach((layer) => {
    layer.setVisible(false);
    map.removeLayer(layer);
  });

  // 找出選擇的圖層
  const selectedLayer = baseLayers.find(
    (l) => l.label === selectedLayerName
  )?.value;

  if (selectedLayer) {
    // 顯示選中的底圖
    selectedLayer.setVisible(true);
    selectedLayer.setZIndex(0);
    map.addLayer(selectedLayer);
    console.log(`✅ 已切換至: ${selectedLayer.get("name")}`);
  } else {
    ordinaryMap.setVisible(true);
    map.addLayer(ordinaryMap);
    console.log("✅ 回復顯示原本的地圖");
  }

  map.updateSize();
};

const clearBaseLayer = () => {
  setBaseLayer("預設地圖");
  selectedBaseLayer.value = null;
};

const scrollToSite = (siteName) => {
  console.log("要滑動到:", siteName);
  // 找到對應的景點物件
  const targetSite = landScape.value.find((site) => site.name === siteName);

  if (targetSite) {
    // 更新圖片
    activeImage.value = targetSite.image;
    activeImageList.value = targetSite.images;

    nextTick(() => {
      const targetLi = document.querySelector(`li[data-name="${siteName}"]`);
      if (targetLi) {
        targetLi.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  } else {
    console.warn("找不到對應的景點:", siteName);
  }
};

const preventClick = () => {
  router.push("/openlayer/multTable");
};

const clearHandle = () => {
  landScape.value = store.routes.find(
    (route) => route.id === currentRouteId.value
  ).spots;
  console.log("clearHandle", landScape.value);
  selectIcon.value = "";
  mapRef.value.updateSites(landScape.value);
  mapRef.value.flyTo(landScape.value[0].coords);
  activeImage.value = landScape.value[0].image;
  activeImageList.value = landScape.value[0].images;
};

//**測量***
const startMeasure = (type) => {
  mapRef.value.startMeasure(type);
};

const clearMeasure = () => {
  mapRef.value.clearMeasurements();
};

const updateMeasurement = (result) => {
  measurementResult.value = result;
};

//定位點
const updateMapLocation = () => {
  const lon = parseFloat(longitude.value);
  const lat = parseFloat(latitude.value);
  if (!isNaN(lon) && !isNaN(lat)) {
    mapRef.value.setLocation(lon, lat);
  } else {
    alert("請輸入有效的經度和緯度");
  }
};
//清除定位點
const removeLocation = () => {
  console.log(1);
  mapRef.value.clearLocation();
  longitude.value = "";
  latitude.value = "";
};

// ****地標轉換經緯度（Geocoding）*******
const searchLocation = async () => {
  if (!landmark.value) {
    alert("請輸入地標！");
    return;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        landmark.value
      )}`
    );
    const data = await response.json();
    console.log("地址轉經緯度", data);

    if (data.length > 0) {
      // latitude.value = data[0].lat;
      // longitude.value = data[0].lon;

      mapRef.value.setLocation(data[0].lon, data[0].lat);
    } else {
      alert("找不到該地址！");
    }
  } catch (error) {
    console.error("地址轉換失敗", error);
    alert("無法獲取位置信息，請稍後再試！");
  }
};
const removeSearchLocation = () => {
  mapRef.value.clearLocation();
  landmark.value = "";
};

//***地址搜尋+轉換經緯度***********
const searchAddress = async () => {
  console.log(
    "searchAddress",
    address.value,
    `https://api.nlsc.gov.tw/idc/TextQueryMap/${address.value}`
  );
  if (!address.value) {
    alert("請輸入地址！");
    return;
  }
  try {
    const response = await fetch(
      `https://api.nlsc.gov.tw/idc/TextQueryMap/${encodeURIComponent(
        address.value
      )}`
    );

    console.log("response", response);
    const responseText = await response.text(); // 取得回應的 XML 文字

    // 🔹 解析 XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, "application/xml");

    // 🔹 取得 `<LOCATION>` 節點
    const locationNode = xmlDoc.querySelector("LOCATION");
    if (!locationNode) {
      alert("找不到該地址對應的經緯度");
      return;
    }
    // 🔹 解析經緯度
    const locationText = locationNode.textContent;
    const [lon, lat] = locationText.split(",").map(parseFloat);
    console.log("lon, lat", lon, lat);
    mapRef.value.setLocation(lon, lat);
  } catch (error) {
    console.error("地址轉換失敗", error);
    alert("無法獲取位置信息，請稍後再試！");
  }
};

//**地址模糊搜尋************
const searchFuzzy = async () => {
  console.log(
    "searchAddress",
    address.value,
    `https://api.nlsc.gov.tw/idc/TextQueryMap/${searchFuzzyAddress.value}/${searchFuzzyNum.value}`
  );
  if (!address.value) {
    alert("請輸入地址！");
    return;
  }
  try {
    const response = await fetch(
      `https://api.nlsc.gov.tw/idc/TextQueryMap/${encodeURIComponent(
        searchFuzzyAddress.value
      )}/${searchFuzzyNum.value}`
    );

    console.log("response", response);
    const responseText = await response.text(); // 取得回應的 XML 文字

    // 🔹 解析 XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, "application/xml");

    // 🔹 取得所有 `<ITEM>` 元素
    const items = xmlDoc.querySelectorAll("ITEM");
    searchFuzzyResults.value = Array.from(items).map((item) => {
      return {
        name: item.querySelector("CONTENT").textContent,
        lon: parseFloat(
          item.querySelector("LOCATION").textContent.split(",")[0]
        ),
        lat: parseFloat(
          item.querySelector("LOCATION").textContent.split(",")[1]
        ),
      };
    });

    console.log("🔍 搜尋結果：", searchFuzzyResults.value);
  } catch (error) {
    console.error("地址搜尋失敗", error);
    alert("搜尋失敗，請稍後再試！");
  }
};

const setMapLocation = (item) => {
  console.log("🗺️ 定位到：", item);
  mapRef.value.setLocation(item.lon, item.lat); // 讓地圖飛到該位置
};
const removeSearchFuzzyLocation = () => {
  mapRef.value.clearLocation();
  searchFuzzyResults.value = [];
  searchFuzzyAddress.value = "";
};

//***設定環域變數****************
const setCircleRange = () => {
  const lon = parseFloat(lonRange.value);
  const lat = parseFloat(latRange.value);
  const rad = parseFloat(radius.value);

  if (!isNaN(lon) && !isNaN(lat)) {
    mapRef.value.setLocation(lon, lat);
  } else {
    alert("請輸入有效的經度和緯度");
    return;
  }

  if (!isNaN(lon) && !isNaN(lat) && !isNaN(rad)) {
    mapRef.value.drawCircleRange(lon, lat, rad);
  } else {
    alert("請輸入有效半徑！");
  }
};
const removeSetCircleRange = () => {
  mapRef.value.clearLocation();
  mapRef.value.clearCircleRange();
  lonRange.value = "";
  latRange.value = "";
  radius.value = "";
};

//***點擊地圖任一點+環域***************
const clickSite = (coords) => {
  mapRef.value.clearCircleRange();
  clickCoords.value = coords;
};
const clickSiteCircleRange = () => {
  const rad = parseFloat(radius2.value);
  if (!clickCoords.value.length) {
    alert("請先點擊地圖任一點！");
    return;
  }
  if (!isNaN(rad)) {
    mapRef.value.drawCircleRange(
      clickCoords.value[0],
      clickCoords.value[1],
      rad
    );
  } else {
    alert("請輸入有效半徑！");
  }
  console.log(clickCoords.value[0], clickCoords.value[1]);
  mapRef.value.drawCircleRange(clickCoords.value[0], clickCoords.value[1], rad);
};
const removeClickSiteCircleRange = () => {
  mapRef.value.clearCircleRange();
  radius2.value = "";
};
const removeClickSite = () => {
  mapRef.value.clearHandleMapClick();
  mapRef.value.clearCircleRange();
  clickCoords.value = [];
};

//***多點紀錄*****************
const recordedSites = (sites) => {
  console.log("recordedSites", sites);
  recordedCoords.value = sites;
};
// 開始記錄
const startRecording = () => {
  recordedCoords.value = [];
  mapRef.value.startRecording(); // 呼叫子元件
};

// 結束記錄
const stopRecording = () => {
  mapRef.value.stopRecording();
  recordedCoords.value = [];
};

// 清除標記
const clearMarkers = () => {
  mapRef.value.clearMarkers();
  recordedSites.value = [];
};

//****更改路線故事*******
const changeRoute = (id) => {
  console.log("changeRoute", id);
  currentRouteId.value = id;
  landScape.value = routsList.value.find((route) => route.id === id).spots;
  console.log("landScape", landScape.value);

  init();
};

//****最短路徑規劃*******

// const setStartPathPlan = () => {
//   shortestPathPlan();
// };

// const shortestPathPlan = async () => {
//   try {
//     const response = await fetch(
//       `https://api.nlsc.gov.tw/other/RoutesQueryByDist/${startPath.value}/${endPath.value}/json/${transportation.value}?barrier=120.635516,24.178946,120.637716,24.177746`
//     );

//     // 🚀 解析 JSON
//     const blob = await response.blob();
//     const jsonText = await blob.text(); // 先轉為文本
//     const jsonData = JSON.parse(jsonText); // 再解析成 JSON

//     console.log("📜 解析 JSON 內容:", jsonData);

//     // 確保 JSON 內有 "features" 並包含 "geometry.coordinates"
//     if (!jsonData.features || jsonData.features.length === 0) {
//       throw new Error("JSON 內沒有有效的路線數據");
//     }

//     // 取得所有路徑的經緯度
//     const pathCoordinates = jsonData.features
//       .map((feature) => feature.geometry.coordinates)
//       .flat(); // 合併所有座標點

//     console.log("🚀 解析後的路線座標:", pathCoordinates);

//     // ✅ 在地圖上繪製路線
//     mapRef.value.drawPathPlan(pathCoordinates);
//   } catch (error) {
//     console.error("路線搜尋失敗", error);
//     alert("搜尋失敗，請稍後再試！");
//   }
// };

//**景點路徑 */
const pathsData = ref([
  { distance: 100, time: 3 },
  { distance: 200, time: 5 },
  { distance: 150, time: 4 },
  // ... 這裡是每段路徑的資訊
]);

const landScapeWithPaths = computed(() => {
  const result = [];
  landScape.value.forEach((site, index) => {
    result.push({ type: "site", data: site });

    // 插入對應的路徑資訊（最後一個景點後不插入）
    if (index < landScape.value.length - 1 && pathsData.value[index]) {
      result.push({ type: "path", data: pathsData.value[index] });
    }
  });
  return result;
});

watch(
  () => selectIcon.value,
  (newIconId) => {
    if (newIconId) {
      let currentAllSpots = store.routes.find(
        (route) => route.id === currentRouteId.value
      ).spots;

      landScape.value = currentAllSpots.filter(
        (site) => site.icon === newIconId
      );

      console.log("watch", landScape.value.length);
      if (landScape.value.length > 0) {
        console.log("select heritageSite", landScape);
        mapRef.value.updateSites(landScape.value);
        mapRef.value.flyTo(landScape.value[0].coords);
        activeImage.value = landScape.value[0].image;
        activeImageList.value = landScape.value[0].images;
      } else {
        //沒有資料 回到預設值
        alert("沒有資料");
        clearHandle();
      }
    } else {
      // 如果沒有選擇 icon，回復所有數據
      landScape.value = store.routes.find(
        (route) => route.id === currentRouteId.value
      ).spots;
    }
  }
);

// 當 `activeImageList` 變更時，回到第一張圖片
watch(activeImageList, (newList) => {
  swiperKey.value += 1;
});

//初始化
const init = () => {
  mapRef.value.updateSites(landScape.value);
  activeImage.value = landScape.value[0].image;
  activeImageList.value = landScape.value[0].images;
  mapRef.value.flyTo(landScape.value[0].coords);
};

onMounted(() => {
  console.log("取出Pinia資料", store.routes);
  currentRouteId.value = store.routes[0].id;
  landScape.value = [...store.routes[0].spots];
  init();
  // console.log("iconList", iconList);
});
</script>
<template>
  <div class="oplayerStoryMultTable">
    <div>
      <el-button @click="preventClick">回資料表</el-button>
      <h4>切換路線</h4>
      <ul class="change-route">
        <li v-for="route in routsList" :key="route.id">
          <el-button
            @click="changeRoute(route.id)"
            :class="{ active: currentRouteId === route.id }"
            >{{ route.name }}</el-button
          >
        </li>
      </ul>
      <h4>功能切換</h4>

      <el-button @click="toggleIcons">切換 Icon 顯示</el-button>
      <el-button @click="togglePaths">切換線條顯示</el-button>
      <el-button @click="toggleOverLayer(dmaps, '地籍圖')"
        >切換地籍圖</el-button
      >
      <el-button @click="toggleOverLayer(landsect, '段籍圖')"
        >切換段籍圖</el-button
      >
      <el-button @click="startMeasure('length')">測量長度</el-button>
      <el-button @click="startMeasure('area')">測量面積</el-button>
      <el-button @click="clearMeasure">清空測量</el-button>

      <div>
        <span>icon:{{ showIcon ? "顯示" : "不顯示" }} || </span>
        <span>線條:{{ showPath ? "顯示" : "不顯示" }} ||</span>
        <span>測量結果: {{ measurementResult }}</span>
      </div>
      <div class="select-section">
        <div class="select-area">
          <p>底圖選擇:</p>
          <el-select v-model="selectedBaseLayer" @change="setBaseLayer">
            <el-option
              v-for="layer in baseLayers"
              :key="layer.label"
              :label="layer.label"
              :value="layer.label"
            ></el-option>
          </el-select>
          <el-button @click="clearBaseLayer()">清除篩選</el-button>
        </div>
        <div class="select-area">
          <p>景點類別:</p>
          <el-select v-model="selectIcon" aria-placeholder="請選擇">
            <el-option
              :label="icon.name"
              :value="icon.id"
              v-for="icon in iconList"
              :key="icon.id"
              >{{ icon.name }}</el-option
            >
          </el-select>
          <el-button @click="clearHandle()">清除篩選</el-button>
        </div>
      </div>
      <h4>定位</h4>
      <div class="select-section">
        <div class="select-area">
          <p>經度:</p>
          <el-input v-model="longitude" placeholder="輸入經度"></el-input>
        </div>
        <div class="select-area">
          <p>緯度:</p>
          <el-input v-model="latitude" placeholder="輸入緯度"></el-input>
        </div>
        <el-button @click="updateMapLocation">設定定位點</el-button>
        <el-button @click="removeLocation"> 取消定位點</el-button>
      </div>
      <div class="select-section">
        <div class="select-area">
          <p>著名地標:</p>
          <el-input v-model="landmark" placeholder="輸入著名地標"></el-input>
        </div>

        <el-button @click="searchLocation">設定定位點</el-button>
        <el-button @click="removeSearchLocation"> 取消定位點</el-button>
        <span>使用openstreetmap資料不太完整</span>
      </div>
      <div class="select-section">
        <div class="select-area">
          <p>地址:</p>
          <el-input v-model="address" placeholder="輸入地址"></el-input>
        </div>

        <el-button @click="searchAddress">設定定位點</el-button>
        <el-button @click="removeSearchLocation"> 取消定位點</el-button>
        <span>使用國圖測繪 TextQueryMap ，取得尋找的第一個定位資料</span>
      </div>

      <div class="select-section">
        <div class="select-area">
          <p>模糊查詢地址:</p>
          <el-input
            v-model="searchFuzzyAddress"
            placeholder="輸入地址"
          ></el-input>
          <el-input v-model="searchFuzzyNum" type="number" class="inputnumber"
            >搜尋筆數</el-input
          >
        </div>
        <el-button @click="searchFuzzy">模糊搜尋</el-button>
        <el-button @click="removeSearchFuzzyLocation"> 取消搜尋</el-button>
        <span>使用國圖測繪 TextQueryMap ，依據筆數取得定位資料</span>
      </div>
      <ul v-if="searchFuzzyResults.length > 0">
        <li v-for="(item, index) in searchFuzzyResults" :key="index">
          {{ item.name }}
          <el-button @click="setMapLocation(item)"> 定位 </el-button>
        </li>
      </ul>

      <h4>環域</h4>
      <div class="select-section">
        <div class="select-area">
          <p>經度:</p>
          <el-input v-model="lonRange" placeholder="輸入經度"></el-input>
        </div>
        <div class="select-area">
          <p>緯度:</p>
          <el-input v-model="latRange" placeholder="輸入緯度"></el-input>
        </div>
        <div class="select-area">
          <p>環域半徑 (公尺):</p>
          <el-input v-model="radius" placeholder="輸入半徑"></el-input>
        </div>
        <el-button @click="setCircleRange">設定環域範圍</el-button>
        <el-button @click="removeSetCircleRange">清除環域</el-button>
      </div>
      <h4>點擊地圖任一點+環域</h4>
      <div class="select-section">
        <div class="select-area">
          <p>經度:</p>
          <span>{{ clickCoords[0] }}</span>
        </div>
        <div class="select-area">
          <p>緯度:</p>
          <span>{{ clickCoords[1] }}</span>
        </div>
        <div class="select-area">
          <p>環域半徑 (公尺):</p>
          <el-input v-model="radius2" placeholder="輸入半徑"></el-input>
        </div>
        <el-button @click="clickSiteCircleRange">設定環域範圍</el-button>
        <el-button @click="removeClickSiteCircleRange">清除環域</el-button>
        <el-button @click="removeClickSite">清除打點</el-button>
      </div>
      <h4>多打點紀錄 (路徑使用)</h4>
      <div class="select-section">
        <el-button @click="startRecording">開起多點紀錄</el-button>
        <el-button @click="stopRecording">清空記錄+關閉多點</el-button>
        <ul>
          <li v-for="(point, index) in recordedCoords" :key="index">
            📍 點 {{ index + 1 }}：{{ point.lon }}, {{ point.lat }}
          </li>
        </ul>
      </div>
      <!-- <h4>路徑規劃</h4>
      <div class="select-section">
        <p>交通工具:</p>
        <el-button
          @click="transportation = 'car'"
          :class="{ active: transportation === 'car' }"
          >汽車</el-button
        >
        <el-button
          @click="transportation = 'foot'"
          :class="{ active: transportation === 'foot' }"
          >走路</el-button
        >
        <el-button
          @click="transportation = 'avoid_highways'"
          :class="{ active: transportation === 'avoid_highways' }"
          >機車</el-button
        >
        <ul>
          <li v-for="(point, index) in recordedCoords" :key="index">
            📍 點 {{ index + 1 }}：{{ point.lon }}, {{ point.lat }}
          </li>
        </ul>
      </div>
      <div class="select-section">
        <el-button @click="enableSelectStart">設定起點</el-button>
        <span>起點: {{ startPath }}</span>
      </div>

      <div class="select-section">
        <el-button @click="enableSelectEnd">設定終點</el-button>
        <span>終點: {{ endPath }}</span>
      </div>

      <div class="select-section">
        <el-button @click="shortestPathPlan">路徑規劃</el-button>
        <ul>
          <li v-for="(point, index) in recordedCoords" :key="index">
            📍 點 {{ index + 1 }}：{{ point.lon }}, {{ point.lat }}
          </li>
        </ul>
      </div> -->
    </div>
    <div class="story">
      <!-- **左邊區塊** -->
      <div class="info-area">
        <!-- <div class="info-img">
          <img v-if="activeImage" :src="activeImage" alt="景點圖片" />
        </div> -->
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
              v-for="(image, index) in activeImageList"
              :key="`image-${index}`"
            >
              <div class="box">
                <img :src="image" alt="照片" />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <!-- <ul>
          <li
            v-for="(site, index) in landScape"
            :key="index"
            class="site"
            :data-name="site.name"
            @mouseenter="hoverLocation(site)"
          >
            <h3>{{ site.name }}</h3>
            <p>這是 {{ site.name }} 的簡介內容...</p>
            <p>{{ site.des }}</p>
          </li>
        </ul> -->
        <ul>
          <p></p>
          <li
            v-for="(item, index) in landScapeWithPaths"
            :key="index"
            class="site"
            :class="{ 'path-info': item.type === 'path' }"
            :data-name="item.type === 'site' ? item.data.name : ''"
            @mouseenter="item.type === 'site' ? hoverLocation(item.data) : null"
          >
            <template v-if="item.type === 'site'">
              <h3>{{ item.data.name }}</h3>
              <p>這是 {{ item.data.name }} 的簡介內容...</p>
              <p>{{ item.data.des }}</p>
            </template>

            <template v-else>
              <p>
                公尺: {{ item.data.distance }} | 時間: {{ item.data.time }}分
              </p>
            </template>
          </li>
        </ul>
      </div>

      <!-- **右側區塊** -->
      <div class="map-area">
        <OpenlayerMapStory
          ref="mapRef"
          :landScape="landScape"
          @select-site="scrollToSite"
          @update-measurement="updateMeasurement"
          @click-site="clickSite"
          @recorded-sites="recordedSites"
        />
      </div>
    </div>
    <div class="hit">
      <p>
        使用檔案: components/OpenlayerMapStory.vue,component/DraggableDialog
      </p>
      <p>安裝:npm install ol (openlayer)</p>
      <p>
        安裝:npm install @vueuse/core (其中一個功能 useWindowSize
        監聽視窗大小的變化)
      </p>
      <p>功能:</p>
      <ol>
        <li>hover左側景點時，地圖會移動到對應景點</li>
        <li>在地圖點選icon時，左側文字與圖片會產生對應景點資料</li>
        <li>點與點之間會依序產生線條</li>
        <li>button調整圖層顯示(icon&線條)</li>
        <li>資料來源是table(回資料表可看到詳細資訊)</li>
        <li>
          使用這隻API "https://nominatim.openstreetmap.org/search?format=json"
          取得 "著名地標 "的經緯度
        </li>
        <li>
          使用國圖測繪這隻API "https://api.nlsc.gov.tw/idc/TextQueryMap/" 取得
          "地址" 的經緯度
        </li>
        <li>
          取得目前位置功能(房子按鈕): 在localhost 可以使用
          ,但在"http://192.168.1.96:3000/" 無法使用
        </li>
      </ol>
      <p>新功能</p>
      <ol>
        <li>可切換路線故事</li>
        <li>景點描述加入路徑(目前路徑資料寫死)</li>
      </ol>
    </div>
  </div>
</template>

<style lang="scss">
.oplayerStoryMultTable {
  button {
    margin: 5px;
  }
  h4 {
    margin: 0;
    background-color: #beeccd;
    font-size: 16px;
    padding: 5px;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  .change-route {
    display: flex;
  }
  .select-section {
    display: flex;
    align-items: center;
    flex: 1;
    .select-area {
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      gap: 10px;
      p {
        white-space: nowrap;
      }
      .inputnumber {
        width: 100px;
      }
    }
  }
  .active {
    font-weight: bold;
    background-color: rgb(236, 93, 117);
    color: white;
  }

  .story {
    display: flex;
    width: 100%;
    height: 100vh;
    position: relative;

    .info-area {
      display: flex;
      flex-direction: column;
      width: 40%;
      // .map-openlayer {
      //   height: 300px;
      //   outline: 2px solid red;
      //   overflow: hidden;
      // }
      .info-img {
        // flex: 1;
        overflow: hidden;
        height: 300px;
        background: #f0f0f0;
        outline: 1px solid blue;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
      ul {
        font: 1px;
        padding: 20px;
        background: #fffaf0;
        overflow-y: auto;

        .site {
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 8px;
          cursor: pointer;
          background: #ffebcd;
          transition: all 0.3s ease;
        }
        .path-info {
          background: #f0f0f0;
          background-color: transparent;
          border-left: 3px solid black;
          border-radius: 0;
          margin-left: 20px;
        }
      }
    }
    .map-area {
      outline: 2px solid red;
      overflow: hidden;
      flex: 1;
      height: 100%;
    }

    .swiper-container {
      width: 100%; /* 可以調整這裡來增加或減少 Swiper 容器的寬度 */
      height: 300px;
      position: relative;
      margin: 0 auto; /* 居中 */
      padding-bottom: 50px;

      .swiper-slide {
        height: 300px;
      }
      .box {
        width: 80%; /* 保持容器的寬度 */
        height: 100%; /* 保持容器的高度 */
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden; /* 避免溢出 */
        margin: 0 auto;

        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain; /* 讓圖片保持比例，不變形 */
        }
      }
      .swiper-pagination {
        position: static; /* 將 pagination 的位置設為靜態，以避免覆蓋在圖片上 */
        margin-top: 10px; /* 增加與圖片的間距 */
        text-align: center; /* 將 pagination 點點居中 */
      }
    }

    .swiper-button-prev,
    .swiper-button-next {
      z-index: 99;
      background-color: #e44d7f;
      border-radius: 50%;
      border-color: #e44d7f;
      border: 0;
      width: 30px;
      height: 30px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      pointer-events: auto;
    }

    .swiper-button-prev:after {
      content: "";
      display: block;
      width: 0;
      height: 0;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      border-right: 6px solid #fff;
      margin: auto;
    }
    .swiper-button-next:after {
      content: "";
      display: block;
      width: 0;
      height: 0;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      border-left: 6px solid #fff;
      margin: auto;
    }

    .swiper {
      --swiper-pagination-color: #e44d7f;
      --swiper-pagination-bullet-inactive-color: #a17373; //還未滑到時點點的顏色
      --swiper-pagination-bullet-size: 14px;
      --swiper-pagination-bullet-width: 14px;
      --swiper-pagination-bullet-height: 14px;
      --swiper-pagination-bullet-horizontal-gap: 15px; /* 點點之間的水平間距 */
    }
  }
}
</style>
