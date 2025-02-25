<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";

const store = useMultTableStore();

const isCollapsed = ref(false); // 控制 queryList 收合
const widthExpanded = 320; // 展開時的寬度
const widthCollapsed = 0; // 收合時的寬度
const paddingExpanded = 20; // 展開時的寬度
const paddingCollapsed = 0; // 收合時的寬度
const activeName = ref("route");

const activePositionTab = ref("positionAddress"); // 預設為 "地址定位"

const routesList = ref([]); // 存放所有路線
const currentRouteId = ref("route2"); // **預設路線 ID**
const activeImage = ref("");
const activeImageList = ref([]);
const activeSit = ref({});

const bufferList = ref([]); //環域景點
const mapRef = ref(null); // OpenLayer Map 元件的 ref
const dialogVisible = ref(false);

const formData = reactive({
  address: "",
  lat: "",
  lon: "",
});

const currentRoute = computed(() => {
  return (
    routesList.value.find((route) => route.id === currentRouteId.value) || null
  );
});

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
  if (currentRouteId.value === route.id) {
    // **如果已選中這條路線，則取消**
    currentRouteId.value = null;
  } else {
    // **切換到新路線**
    currentRouteId.value = route.id;
  }

  // ✅ 更新所有路線的 `enabled` 狀態
  routesList.value.forEach((r) => (r.enabled = r.id === currentRouteId.value));

  ElMessage.success(`已切換至 ${route.enabled ? route.name : "無"} `);
};

// **onMounted：初始化 routesList**
onMounted(() => {
  routesList.value = store.routes.map((route) => ({
    ...route,
    enabled: route.id === currentRouteId.value, // **只開啟預設路線**
  }));

  console.log("routesList.value", routesList.value);
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
                  目前路線:<span>{{ currentRoute?.name || "無" }}</span>
                </p>
                <el-button @click="choseHandler">路線選擇</el-button>
              </div>

              <ul class="spots">
                <li v-for="spot in currentRoute?.spots" :key="spot.id">
                  <p>{{ spot.name }}</p>
                  <div class="spotsImage">
                    <img :src="spot.images[0]" alt="" />
                  </div>

                  <p>{{ spot.des }}</p>
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
                  v-model="formData.lat"
                  type="coordinate"
                  label="緯度"
                  placeholder="請輸入緯度"
                  required
                />
                <PrepareStoryInputTool
                  v-model="formData.lon"
                  type="coordinate"
                  label="經度"
                  placeholder="請輸入經度"
                  required
                />
              </el-tab-pane>
              <el-tab-pane label="地圖定位" name="positionMap">
                <div>
                  <p>經度:</p>
                  <p>緯度:</p>
                </div>
              </el-tab-pane>
            </el-tabs>

            <PrepareStoryInputTool
              v-model="formData.lon"
              type="coordinate"
              label="環域"
              placeholder="請輸入環域範圍"
            />
            <el-button>清除</el-button>
            <el-button v-if="activePositionTab !== 'positionMap'"
              >定位查詢</el-button
            >
            <el-button>環域查詢</el-button>
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
          <li v-for="route in routesList" :key="route.id">
            <span>{{ route.name }}</span>
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
    li:hover {
      border: 1px solid rgb(112, 145, 128);
      cursor: pointer;
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
