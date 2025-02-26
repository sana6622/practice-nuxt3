<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";

const props = defineProps({
  mapLocationCoord: { type: Array, default: "" }, //點擊地圖任一點打點定位
  selectSpotName: { type: String, default: "" }, //點擊icon
});

const store = useMapDataStore();

const isCollapsed = ref(false); // 控制 queryList 收合
const widthExpanded = 320; // 展開時的寬度
const widthCollapsed = 0; // 收合時的寬度
const paddingExpanded = 20; // 展開時的寬度
const paddingCollapsed = 0; // 收合時的寬度
const activeName = ref("route");

const activePositionTab = ref("positionAddress"); // 預設為 "地址定位"

const routesList = ref([]); // 存放所有路線
const currentRouteId = ref("map1"); // **預設路線 ID**
const currentRoute = ref(""); //路線內所有資料
const currentSpots = ref([]);
const activeImage = ref("");
const activeImageList = ref([]);
const activeSit = ref({});

const bufferList = ref([]); //環域景點
const mapRef = ref(null); // OpenLayer Map 元件的 ref
const dialogVisible = ref(false);

const formData = reactive({
  address: "新北市淡水區中正路229-9號",
  lon: "121.41218480726137",
  lat: "25.18327793537947",
  radius: 200,
});

//Todo:景點路徑 假資料 */
const pathsData = ref([
  { distance: 100, time: 3 },
  { distance: 200, time: 5 },
  { distance: 150, time: 4 },
  // ... 這裡是每段路徑的資訊
]);

//景點+路徑
const landScapeWithPaths = computed(() => {
  if (!currentRoute.value || !currentRoute.value.pointList) {
    return []; // 確保 currentRoute.value.spots 不為 undefined
  }
  const result = [];
  console.log("currentRoute.value spots", currentRoute.value.pointList);
  currentRoute.value.pointList.forEach((site, index) => {
    result.push({ type: "site", data: site });

    // 插入對應的路徑資訊（最後一個景點後不插入）
    if (
      index < currentRoute.value.pointList.length - 1 &&
      pathsData.value[index]
    ) {
      result.push({ type: "path", data: pathsData.value[index] });
    }
  });
  return result;
});

// hover時，更新地圖與圖片
const hoverLocation = (site) => {
  emit("update-activeSpot", site.lonLat);
  activeImage.value = site.image;
  activeImageList.value = site.images;
};

// 🔹 動態計算 queryList 的寬度
const queryListWidth = computed(() =>
  isCollapsed.value ? `${widthCollapsed}px` : `${widthExpanded}px`
);
const queryListPadding = computed(() =>
  isCollapsed.value ? `${paddingCollapsed}px` : `${paddingExpanded}px`
);
const toggleQueryList = () => {
  isCollapsed.value = !isCollapsed.value;
};

const choseHandler = () => {
  dialogVisible.value = !dialogVisible.value;
};

// 🔹 當外層 Tab 被點擊時，更新 `activeName`
const handleClick = (tab) => {
  activeName.value = tab.props.name;
};

// 🔹 當內層 Tab 被點擊時，更新 `activePositionTab`
const handlePositionTabClick = (tab) => {
  activePositionTab.value = tab.props.name;
};

// **切換路線（確保一次只能開啟一條）**
const toggleRoute = (route) => {
  console.log("route222", route);
  console.log("currentRouteId", currentRouteId.value);
  if (currentRouteId.value === route.mapID) {
    // **如果已選中這條路線，則取消**
    currentRouteId.value = null;
  } else {
    // **切換到新路線**
    currentRouteId.value = route.mapID;
  }

  // ✅ 更新所有路線的 `enabled` 狀態
  routesList.value.forEach(
    (r) => (r.enabled = r.mapID === currentRouteId.value)
  );
  currentRoute.value =
    routesList.value.find((route) => route.mapID === currentRouteId.value) ||
    null;
  console.log("currentRoute", currentRoute.value);

  emit("update-landscape", route.pointList);
  ElMessage.success(`已切換至 ${route.enabled ? route.title : "無"} `);
};

// **發送事件給父層**
const emit = defineEmits([
  "update-landscape",
  "update-activeSpot",
  "update-position",
  "update-circleRange",
]);

const searchPosition = () => {
  console.log("activer", activePositionTab.value);
  console.log("searchAddress", formData);
  if (activePositionTab.value === "positionAddress") {
    positionAddressHandle();
  } else if (activePositionTab.value === "positionCoord") {
    positionCoordHandle();
  }
};

//***設定環域變數****************
const setCircleRange = async () => {
  await nextTick();
  console.log("formdata", formData);
  const rad = parseFloat(formData.radius);
  let lon, lat;
  if (isNaN(rad)) {
    alert("請輸入有效的經度和緯度");
    return;
  }

  if (activePositionTab.value === "positionAddress") {
    [lon, lat] = await positionAddressHandle();
    emit("updateCircleRange", lon, lat, rad);
  } else if (activePositionTab.value === "positionCoord") {
    [lon, lat] = positionCoordHandle();
    emit("updateCircleRange", lon, lat, rad);
  } else if (activePositionTab.value === "positionMap") {
    console.log("mapLocationCoord11", props.mapLocationCoord);
    emit(
      "updateCircleRange",
      props.mapLocationCoord[0],
      props.mapLocationCoord[1],
      rad
    );
  }
};

//地址定位
const positionAddressHandle = async () => {
  if (!formData.address) {
    alert("請輸入地址！");
    return;
  }
  try {
    const response = await fetch(
      `https://api.nlsc.gov.tw/idc/TextQueryMap/${encodeURIComponent(
        formData.address
      )}`
    );

    console.log("response", response);
    const responseText = await response.text(); // 取得回應的 XML 文字

    // 🔹 解析 XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, "application/xml");

    // 🔹 取得 `<LOCATION>` 節點
    const locationNode = xmlDoc.querySelector("LOCATION");
    console.log("locationNode", locationNode);

    // 🔹 解析經緯度
    const locationText = locationNode.textContent;
    if (!locationText) {
      alert("找不到該地址對應的經緯度");
      return;
    }

    const [lon, lat] = locationText.split(",").map(parseFloat);

    emit("updatePosition", [lon, lat]);
    return [lon, lat];
    // mapRef.value.setLocation(lon, lat);
  } catch (error) {
    console.error("地址轉換失敗", error);
    alert("無法獲取位置信息，請稍後再試！");
  }
};

//座標定位
const positionCoordHandle = () => {
  const lon = parseFloat(formData.lon);
  const lat = parseFloat(formData.lat);
  if (!isNaN(lon) && !isNaN(lat)) {
    emit("updatePosition", [lon, lat]);
    return [lon, lat];
  } else {
    alert("請輸入有效的經度和緯度");
  }
};

const clearHandle = () => {
  Object.keys(formData).forEach((key) => {
    formData[key] = "";
  });
  emit("clearMap"); // 觸發事件，通知父層
};

/**滑動到對應 景點物件*/
const scrollToSite = (siteName) => {
  const targetSite = currentRoute.value.spots.find((site) => {
    return site.name === siteName;
  });
  console.log("targetSite", targetSite);

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

// 🔍 監聽 props.selectSpotName，當變更時執行 scrollToSite
watch(
  () => props.selectSpotName,
  (newSpotName) => {
    if (newSpotName) {
      console.log("new", newSpotName);
      scrollToSite(newSpotName);
    }
  }
);

onMounted(() => {
  routesList.value = store.mapList.map((route) => ({
    ...route,
    enabled: route.mapID === currentRouteId.value, // **只開啟預設路線**
  }));
  console.log("onMounted222 routesList.value", routesList.value);
  currentRoute.value = routesList.value.find(
    (route) => route.mapID === currentRouteId.value
  ) || { pointList: [] };
  console.log("onMounted222 currentRoute.value", currentRoute.value);
});
</script>

<template>
  <div
    class="queryList"
    :style="{
      width: queryListWidth,
      paddingRight: queryListPadding,
      paddingLeft: queryListPadding,
    }"
  >
    <div v-if="!isCollapsed" class="content">
      <div class="tabTool">
        <el-tabs v-model="activeName" @tab-click="handleClick" stretch>
          <el-tab-pane label="路線查詢" name="route">
            <div class="tabToolBox">
              <div class="tabToolTop">
                <p>
                  目前路線:<span>{{ currentRoute?.mapTitle || "無" }}</span>
                </p>
                <el-button @click="choseHandler">路線選擇</el-button>
              </div>
              <pre>{{ landScapeWithPaths }}</pre>
              <ul class="spots">
                <li
                  v-for="(item, index) in landScapeWithPaths"
                  :key="index"
                  class="site"
                  :class="{ 'path-info': item.type === 'path' }"
                  :data-name="item.type === 'site' ? item.data.name : ''"
                  @mouseenter="
                    item.type === 'site' ? hoverLocation(item.data) : null
                  "
                >
                  <template v-if="item.type === 'site'">
                    <p>{{ item.data.title }}</p>
                    <!-- <div class="spotsImage">
                      <img :src="item.data?.images[0]" alt="" />
                    </div> -->

                    <p>{{ item.data.content }}</p>
                  </template>

                  <template v-else>
                    <p>
                      公尺: {{ item.data.distance }} | 時間:
                      {{ item.data.time }}分
                    </p>
                  </template>
                </li>
              </ul>
            </div>
          </el-tab-pane>
          <el-tab-pane label="定位查詢" name="position" class="positionTab">
            <el-tabs
              v-model="activePositionTab"
              @tab-click="handlePositionTabClick"
            >
              <el-tab-pane label="地址定位" name="positionAddress">
                <PrepareStoryInputTool
                  v-model="formData.address"
                  label="地址"
                  placeholder="請輸入地址"
                />
              </el-tab-pane>
              <el-tab-pane
                label="座標定位"
                name="positionCoord"
                class="positionCoord"
              >
                <PrepareStoryInputTool
                  v-model="formData.lon"
                  type="coordinate"
                  label="經度"
                  placeholder="請輸入經度"
                  required
                />
                <PrepareStoryInputTool
                  v-model="formData.lat"
                  type="coordinate"
                  label="緯度"
                  placeholder="請輸入緯度"
                  required
                />
              </el-tab-pane>
              <el-tab-pane label="地圖定位" name="positionMap">
                <div>
                  <p>
                    經度:
                    <span>
                      {{ parseFloat(mapLocationCoord[0]).toFixed(5) }}</span
                    >
                  </p>
                  <p>
                    緯度:
                    <span>{{
                      parseFloat(mapLocationCoord[1]).toFixed(5)
                    }}</span>
                  </p>
                </div>
              </el-tab-pane>
            </el-tabs>

            <PrepareStoryInputTool
              v-model="formData.radius"
              type="coordinate"
              label="環域"
              placeholder="請輸入環域範圍"
            />
            <el-button @click="clearHandle">清除</el-button>
            <el-button
              v-if="activePositionTab !== 'positionMap'"
              @click="searchPosition"
              >定位查詢</el-button
            >
            <el-button @click="setCircleRange">環域查詢</el-button>
            <ul class="spots buffer">
              <!--Todo:改環域景點-->
              <li v-for="spot in currentRoute?.spots" :key="spot.id">
                <p>{{ spot.name }}</p>
                <div class="spotsImage">
                  <img :src="spot.images[0]" alt="" />
                </div>

                <p>{{ spot.des }}</p>
              </li>
            </ul>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 📌 查詢列表按鈕 (黏在 queryList 右側外邊) -->
    <button class="toggle-btn" @click="toggleQueryList">
      {{ isCollapsed ? "▶查詢列表" : "◀查詢列表" }}
    </button>

    <PrepareStoryToolDialog
      v-show="dialogVisible"
      :visible="dialogVisible"
      :title="'路線選擇'"
      @close="dialogVisible = false"
    >
      <template #toolCont>
        <ul class="routeBox">
          <li v-for="route in routesList" :key="route.mapID">
            <span>{{ route.mapTitle }}</span>
            <ElementUiSwitch
              v-model="route.enabled"
              @change="toggleRoute(route)"
            />
          </li>
        </ul>
      </template>
    </PrepareStoryToolDialog>
  </div>
</template>

<style lang="scss" scoped>
.queryList {
  height: 100%;
  outline: 1px solid red;
  z-index: 99;
  position: absolute;
  left: 0;
  top: 0;
  background-color: #fff;
  transition: width 0.3s ease-in-out;
  padding: 15px 0px;

  .toggle-btn {
    position: absolute;
    right: -45px;
    top: 10%;
    writing-mode: vertical-lr;
    letter-spacing: 10px;
    font-size: 18px;
    font-weight: 900;
    border-radius: 5px;
    border: 0px;
    color: #fff;
    background-color: pink;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    padding: 10px;
  }
  .tabToolBox {
    .tabToolTop {
      display: flex;
      justify-content: space-between;
      align-items: center;
      p {
        font-weight: 18px;
        font-weight: 700;
      }
      span {
        margin-left: 10px;
      }
    }
  }

  .spots {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    max-height: 700px;

    //捲軸底色
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    //捲軸寬度
    &::-webkit-scrollbar {
      width: 14px;
    }

    //捲軸本體顏色
    &::-webkit-scrollbar-thumb {
      background-color: rgba(221, 190, 190, 0.842);
      border-radius: 20px;
    }
    li {
      background-color: rgb(233, 233, 174);
      border: 1px solid transparent;
      border-radius: 10px;
      margin-bottom: 10px;
      padding: 10px;

      &:last-child {
        margin-bottom: 0;
      }
      .spotsImage {
        width: 150px;
        height: 100px;

        img {
          width: 100%;
          height: 100%;
          // object-fit: contain;
          object-fit: cover;
          border-radius: 10px;
        }
      }
    }
    .site:hover {
      border: 1px solid rgb(112, 145, 128);
      cursor: pointer;
    }
    .path-info {
      background: #f0f0f0;
      background-color: transparent;
      border-left: 3px solid black;
      border-radius: 0;
      margin-left: 20px;
    }
    .path-info:hover {
      border: 1px solid transparent;
      border-left: 3px solid black;
      cursor: default;
    }
  }
  .buffer {
    max-height: 500px;
  }
  .routeBox {
    list-style-type: none;
    padding-left: 0;
    margin: 0;

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgb(202, 201, 201);

      padding: 5px 0;
      font-size: 18px;
      font-weight: 700;
      span {
        margin-right: 20px;
      }
    }
  }
  .positionTab {
    width: 100%;
    :deep(.el-tabs__item) {
      color: rgb(216, 133, 65);
    }
    .positionCoord {
      display: flex;
    }

    .input-container {
      width: 94%;
    }
  }
}
</style>
