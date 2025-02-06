<script setup>
import { ref, onMounted, nextTick } from "vue";
import OpenlayerMapBasic from "@/components/OpenlayerMapBasic.vue";

// **景點資訊**
const heritageSites = ref([
  {
    name: "紅毛城",
    coords: [121.4329423, 25.1754348],
    image: "/image/mapImage/紅毛城.png",
    type: 1,
    bgc: 1,
  },
  {
    name: "淡水禮拜堂",
    coords: [121.43851652739518, 25.17194656891169],
    image: "/image/mapImage/淡水禮拜堂.png",
    type: 11,
    bgc: 2,
  },
  {
    name: "淡水老牌阿給",
    coords: [121.43775684210453, 25.173653858612827],
    image: "/image/mapImage/淡水老牌阿給.png",
    type: 13,
    bgc: 4,
  },
  {
    name: "coco",
    coords: [121.44530842827339, 25.17046144068769],
    type: 14,
    bgc: 4,
  },
]);

const activeImage = ref(""); // 當前顯示的圖片
const activeSit = ref({});
const mapRef = ref(null); // OpenLayer Map 元件的 ref

// **確認 `mapRef` 是否正確獲取**
onMounted(() => {
  nextTick(() => {
    console.log("Map Instance:", mapRef.value);
  });
});

// **滑鼠進入時，更新地圖與圖片**
const hoverLocation = (site) => {
  console.log(`Hovering on ${site.name}`);
  if (mapRef.value && mapRef.value.flyTo) {
    mapRef.value.flyTo(site.coords);
  } else {
    console.warn("flyTo function is not available on mapRef.value");
  }
  activeImage.value = site.image;
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
</script>
<template>
  <div class="oplayerStory">
    <div>
      <button @click="toggleIcons">切換 Icon 顯示</button>
      <button @click="togglePaths">切換路線顯示</button>
      <p>icon:{{ showIcon ? "顯示" : "不顯示" }}</p>
      <p>路徑:{{ showPath ? "顯示" : "不顯示" }}</p>
    </div>
    <div class="story">
      <!-- **左邊地圖區塊** -->
      <div class="info-area">
        <!-- <div class="map-openlayer">
          <OpenlayerMapStory ref="mapRef" :heritageSites="heritageSites" />
        </div> -->
        <div class="info-img">
          <img v-if="activeImage" :src="activeImage" alt="景點圖片" />
        </div>

        <ul>
          <li
            v-for="(site, index) in heritageSites"
            :key="index"
            class="site"
            @mouseenter="hoverLocation(site)"
          >
            <h3>{{ site.name }}</h3>
            <p>這是 {{ site.name }} 的簡介內容...</p>
          </li>
        </ul>
      </div>

      <!-- **右側資訊區塊** -->
      <!-- <div class="image-area">
        <img v-if="activeImage" :src="activeImage" alt="景點圖片" />
      </div> -->
      <div class="map-area">
        <OpenlayerMapStory ref="mapRef" :heritageSites="heritageSites" />
      </div>
    </div>
    <div class="hit">
      <p>使用檔案: components/OpenlayerMapStory.vue</p>
      <p>安裝:npm install ol</p>
      <p>功能:</p>
      <ul>
        <li>由父層傳入子層地圖目前hover到的資料，地圖移動焦點</li>
        <li>點與點之間會依序產生線條</li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.oplayerStory {
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
        li {
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 8px;
          height: 100%;
          cursor: pointer;
          background: #ffebcd;
          transition: all 0.3s ease;
          :hover {
            background: #ffd700;
          }
        }
      }
    }
    .map-area {
      outline: 2px solid red;
      overflow: hidden;
      flex: 1;
      height: 100%;
    }
    // .image-area {
    //   flex: 1;
    //   // overflow: hidden;
    //   background: #f0f0f0;

    //   img {
    //     width: 100%;
    //     height: 100%;
    //     object-fit: contain;
    //   }
    // }
  }
}
</style>
