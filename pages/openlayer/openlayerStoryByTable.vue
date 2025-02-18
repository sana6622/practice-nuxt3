<script setup>
import { ref, onMounted, nextTick } from "vue";
import OpenlayerMapBasic from "@/components/OpenlayerMapBasic.vue";
import { useTableStore } from "@/stores/tableStore";

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

const store = useTableStore();
const router = useRouter();

const heritageSites = ref([...store.tables["group1"]]);
const selectIcon = ref("");

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
const address = ref("滬尾礮臺");

//環域功能
const lonRange = ref("121.44550050003362"); //經度
const latRange = ref("25.168811935403998"); //緯度
const radius = ref(500); // 預設環域半徑 500 公尺
const radius2 = ref(500);
//點擊地圖打點
const clickCoords = ref([]);

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

// 📌 地籍圖切換功能
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
    // **當前為隱藏狀態，啟用圖層並加入地圖**
    layer.setVisible(true);
    layer.setZIndex(10);

    if (!map.getLayers().getArray().includes(layer)) {
      map.addLayer(layer);
    }

    console.log(`✅ 已顯示圖層 (${layerName})`);
  } else {
    // **當前為顯示狀態，隱藏圖層並從地圖移除**
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
  const targetSite = heritageSites.value.find((site) => site.name === siteName);

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
  router.push("/openlayer/dragTableAndExcel");
};

const clearHandle = () => {
  heritageSites.value = [...store.tables["group1"]];
  selectIcon.value = "";
  mapRef.value.updateSites(heritageSites.value);
  mapRef.value.flyTo(heritageSites.value[0].coords);
  activeImage.value = heritageSites.value[0].image;
  activeImageList.value = heritageSites.value[0].images;
};

//測量
const startMeasure = (type) => {
  mapRef.value.startMeasure(type);
};

const clearMeasure = () => {
  mapRef.value.clearMeasurements();
};

const updateMeasurement = (result) => {
  measurementResult.value = result;
};
//////

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

// ⭐️ 地址轉換經緯度（Geocoding）
const searchLocation = async () => {
  if (!address.value) {
    alert("請輸入地址！");
    return;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address.value
      )}`
    );
    const data = await response.json();
    console.log("地址轉經緯度", data);

    if (data.length > 0) {
      // latitude.value = data[0].lat;
      // longitude.value = data[0].lon;

      // ⭐️ 直接將結果傳給 `updateMapLocation`
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
  address.value = "";
};

//設定環域變數
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

//點擊地圖任一點+環域
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

watch(
  () => selectIcon.value,
  (newIconId) => {
    if (newIconId) {
      heritageSites.value = store.tables["group1"].filter(
        (site) => site.icon === newIconId
      );
      console.log("watch", heritageSites.value.length);
      if (heritageSites.value.length > 0) {
        console.log("select heritageSite", heritageSites);
        mapRef.value.updateSites(heritageSites.value);
        mapRef.value.flyTo(heritageSites.value[0].coords);
        activeImage.value = heritageSites.value[0].image;
        activeImageList.value = heritageSites.value[0].images;
      } else {
        //沒有資料 回到預設值
        alert("沒有資料");
        clearHandle();
      }
    } else {
      // 如果沒有選擇 icon，回復所有數據
      heritageSites.value = [...store.tables["group1"]];
    }
  }
);

// 當 `activeImageList` 變更時，回到第一張圖片
watch(activeImageList, (newList) => {
  swiperKey.value += 1;
});

onMounted(() => {
  console.log("取出Pinia資料", store.tables["group1"]);
  activeImage.value = heritageSites.value[0].image;
  activeImageList.value = heritageSites.value[0].images;
  mapRef.value.flyTo(heritageSites.value[0].coords);
  console.log("iconList", iconList);
});
</script>
<template>
  <div class="oplayerStory">
    <div>
      <button @click="preventClick">回資料表</button>
      <button @click="toggleIcons">切換 Icon 顯示</button>
      <button @click="togglePaths">切換線條顯示</button>
      <button @click="toggleOverLayer(dmaps, '地籍圖')">切換地籍圖</button>
      <button @click="toggleOverLayer(landsect, '段籍圖')">切換段籍圖</button>
      <button @click="startMeasure('length')">測量長度</button>
      <button @click="startMeasure('area')">測量面積</button>
      <button @click="clearMeasure">清空測量</button>

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
          <el-input v-model="address" placeholder="輸入著名地標"></el-input>
        </div>

        <el-button @click="searchLocation">設定定位點</el-button>
        <el-button @click="removeSearchLocation"> 取消定位點</el-button>
        <!-- <el-button @click="setCircleRange">設定環域範圍</el-button>
        <el-button @click="clearCircle">清除環域</el-button> -->
        <span>使用openstreetmap資料不太完整</span>
      </div>
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
                <img :src="image" alt="圖片一" />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <ul>
          <li
            v-for="(site, index) in heritageSites"
            :key="index"
            class="site"
            :data-name="site.name"
            @mouseenter="hoverLocation(site)"
          >
            <h3>{{ site.name }}</h3>
            <p>這是 {{ site.name }} 的簡介內容...</p>
            <p>{{ site.des }}</p>
          </li>
        </ul>
      </div>

      <!-- **右側區塊** -->
      <div class="map-area">
        <OpenlayerMapStory
          ref="mapRef"
          :heritageSites="heritageSites"
          @select-site="scrollToSite"
          @update-measurement="updateMeasurement"
          @click-site="clickSite"
        />
      </div>
    </div>
    <div class="hit">
      <p>使用檔案: components/OpenlayerMapStory.vue</p>
      <p>安裝:npm install ol (openlayer)</p>
      <p>
        安裝:npm install @vueuse/core (其中一個功能 useWindowSize
        監聽視窗大小的變化)
      </p>
      <p>功能:</p>
      <ul>
        <li>hover左側景點時，地圖會移動到對應景點</li>
        <li>在地圖點選icon時，左側文字與圖片會產生對應景點資料</li>
        <li>點與點之間會依序產生線條</li>
        <li>button調整圖層顯示(icon&線條)</li>
        <li>資料來源是table(回資料表可看到詳細資訊)</li>
        <li>
          使用這隻API "https://nominatim.openstreetmap.org/search?format=json"
          取得 "著名地標 "的經緯度
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.oplayerStory {
  h4 {
    margin: 0;
    background-color: #beeccd;
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
        width: 90px;
      }
    }
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
        :hover {
          background: #f8ddb3;
        }
        li {
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 8px;
          height: 100%;
          cursor: pointer;
          background: #ffebcd;
          transition: all 0.3s ease;
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
