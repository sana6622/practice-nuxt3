<script setup>
import * as d3 from "d3";
import * as topojson from "topojson-client";

const mapContainer = ref(null);

const countyLabelPositions = {
  基隆市: null,
  新北市: { x: 70, y: -10 },
  臺北市: null,
  桃園市: { x: -40, y: -30 },
  新竹市: null,
  新竹縣: { x: -50, y: -30 },
  苗栗縣: { x: -40, y: -10 },
  彰化縣: null,
  雲林縣: null,
  臺中市: { x: -60, y: 10 },
  南投縣: { x: 10, y: 30 },
  嘉義市: null,
  嘉義縣: { x: -60, y: 0 },
  臺南市: { x: -45, y: 10 },
  高雄市: { x: -70, y: 60 },
  屏東縣: { x: -20, y: 40 },
  宜蘭縣: { x: 40, y: -5 },
  花蓮縣: { x: 35, y: 0 },
  臺東縣: { x: 35, y: 5 },
  澎湖縣: { x: -30, y: -5 },
  金門縣: { x: -10, y: -10 },
  連江縣: { x: 0, y: 0 },
};
const selectedRegion = ref("請選擇一個地區"); // 儲存被選中的地區名稱
const dynamicHighlightData = ref({
  新北市: ["石碇區", "坪林區", "平溪區", "雙溪區", "烏來區", "貢寮區"], // 當前標亮的鄉鎮市區
  桃園市: ["復興區"],
  新竹縣: ["五峰鄉", "尖石鄉", "關西鎮", "峨眉鄉"],
  苗栗縣: ["泰安鄉", "南庄鄉", "獅潭鄉", "三灣鄉"],
  臺中市: ["和平區"],
  南投縣: ["中寮鄉", "仁愛鄉", "信義鄉", "魚池鄉", "國姓鄉", "鹿谷鄉"],
  嘉義縣: ["番路鄉", "大埔鄉", "阿里山鄉"],
  臺南市: ["楠西區", "南化區", "左鎮區", "龍崎區", "大內區"],
  高雄市: [
    "田寮區",
    "六龜區",
    "甲仙區",
    "那瑪夏區",
    "桃源區",
    "茂林區",
    "杉林區",
  ],
  屏東縣: [
    "三地門鄉",
    "霧臺鄉",
    "瑪家鄉",
    "泰武鄉",
    "來義鄉",
    "春日鄉",
    "獅子鄉",
    "牡丹鄉",
    "滿州鄉",
    "琉球鄉",
  ],
  宜蘭縣: ["大同鄉", "南澳鄉"],
  花蓮縣: [
    "秀林鄉",
    "萬榮鄉",
    "卓溪鄉",
    "花蓮市",
    "吉安鄉",
    "新城鄉",
    "壽豐鄉",
    "鳳林鎮",
    "光復鄉",
    "豐濱鄉",
    "瑞穗鄉",
    "玉里鎮",
    "富里鄉",
  ],
  臺東縣: [
    "海端鄉",
    "延平鄉",
    "金峰鄉",
    "達仁鄉",
    "蘭嶼鄉",
    "臺東市",
    "卑南鄉",
    "大武鄉",
    "太麻里鄉",
    "東河鄉",
    "鹿野鄉",
    "池上鄉",
    "成功鎮",
    "關山鎮",
    "長濱鄉",
    "綠島鄉",
    "蘭嶼鄉",
  ],
  澎湖縣: ["馬公市", "西嶼鄉", "望安鄉", "七美鄉", "白沙鄉", "湖西鄉"],
  金門縣: ["金沙鎮", "金湖鎮", "金寧鄉", "金城鎮", "烈嶼鄉", "烏坵鄉"],
  連江縣: ["南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"],
});

// 初始化地圖，將標亮地區設為橘色
const initializeMap = () => {
  const svg = d3.select(mapContainer.value).select("svg");

  // 1. 鄉鎮市區線條
  svg
    .selectAll(".town-boundary")
    .attr("fill", (d) => {
      const countyName = d.properties.COUNTYNAME;
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[countyName] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede"; // 標亮區域填充綠色
    })
    .attr("stroke", (d) => {
      const countyName = d.properties.COUNTYNAME;
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[countyName] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede"; // 綠色或灰色
    })
    .attr("stroke-width", 1);

  // 2. 繪製縣市框線
  svg
    .selectAll(".county-boundary")
    .attr("fill", "none") // 不填充
    .attr("stroke", "#fff") // 白色框線
    .attr("stroke-width", 1.5); // 框線寬度
};

// 滑鼠移入時，將該縣市標亮區域設為深綠
const handleMouseOver = (region) => {
  // 移除目前選中的地區樣式
  if (selectedRegion.value) {
    d3.select(mapContainer.value)
      .selectAll(".town-boundary")
      .filter((d) => d.properties.COUNTYNAME === selectedRegion.value)
      .attr("fill", (d) => {
        const countyName = d.properties.COUNTYNAME;
        const townName = d.properties.TOWNNAME;
        const highlightTowns = dynamicHighlightData.value[countyName] || [];
        return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede"; // 還原選中樣式
      })
      .attr("stroke", "#dedede") // 還原線條顏色
      .attr("stroke-width", 1); // 還原線條寬度
  }
  d3.select(mapContainer.value)
    .selectAll(".town-boundary")
    .filter((d) => d.properties.COUNTYNAME === region)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[region] || [];
      return highlightTowns.includes(townName) ? "#2e5c56" : "#dedede";
    });

  // 改變縣市文字背景色
  d3.select(mapContainer.value)
    .selectAll(".county-label-bg")
    .filter((d) => d.properties.COUNTYNAME === region)
    .attr("fill", "#FFFFFF") // 將背景色設為白色
    .attr("fill-opacity", 1); // 設定不透明度
};

// 滑鼠移出時，恢復原本的綠色標亮
const handleMouseOut = (region) => {
  d3.select(mapContainer.value)
    .selectAll(".town-boundary")
    .filter((d) => d.properties.COUNTYNAME === region)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[region] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
    });

  // 恢復縣市文字背景色
  d3.select(mapContainer.value)
    .selectAll(".county-label-bg")
    .filter((d) => d.properties.COUNTYNAME === region)
    .attr("fill", "#F0F0F0") // 將背景色恢復為原本的淺灰色
    .attr("fill-opacity", 0.4); // 恢復透明度
};

// 顯示特定縣市和鄉鎮市區
const highlightRegion = (region) => {
  // 先還原所有區域樣式
  d3.select(mapContainer.value)
    .selectAll(".town-boundary")
    .attr("fill", (d) => {
      const countyName = d.properties.COUNTYNAME;
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[countyName] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede"; // 還原樣式
    })
    .attr("stroke", "#dedede") // 還原線條顏色
    .attr("stroke-width", 1); // 還原線條寬度

  // 只對選中的地區套用 mouseOver 樣式
  handleMouseOver(region);
};

// 點擊按鈕時根據 dynamicHighlightData 高亮指定縣市
const updateHighlightByCity = (city) => {
  selectedRegion.value = city;
  highlightRegion(city);
  // 觸發 mouseOver 樣式
  handleMouseOver(city);
};

onMounted(async () => {
  // 1. 加載 TopoJSON 文件
  const countyData = await d3.json("/data/topo.json"); // 縣市邊界檔案
  const townData = await d3.json("/data/topoTown.json"); // 鄉鎮市區邊界檔案

  // 2. 提取地理數據
  const countyGeo = topojson.feature(
    countyData,
    countyData.objects.COUNTY_MOI_1130718
  ); // 替換為你的縣市物件名稱
  const townGeo = topojson.feature(townData, townData.objects.TOWN_MOI_1131028); // 替換為你的鄉鎮物件名稱

  // 3. 設置地圖尺寸
  const width = 700;
  const height = 800;
  const zoomFactor = 10;

  // 4. 創建 SVG 畫布
  const svg = d3
    .select(mapContainer.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 5. 定義地理投影和地理路徑生成器
  const projection = d3
    .geoMercator()
    .scale(1000 * zoomFactor)
    .center([121, 23.5])
    .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  // 6. 繪製鄉鎮市區（第一層）
  svg
    .selectAll(".town-boundary")
    .data(townGeo.features)
    .enter()
    .append("path")
    .attr(
      "class",
      (d) =>
        `town-boundary town-boundary-${d.properties.COUNTYNAME.replace(
          / /g,
          "-"
        )}`
    )
    .attr("class", "town-boundary")
    .attr("d", path)
    .attr("fill", "none") // 確保沒有填充色
    .attr("stroke", "none") // 確保邊界線條為空
    .attr("stroke-width", 0) // 確保邊界線條寬度為 0
    .on("mouseover", function (event, d) {
      const region = d.properties.COUNTYNAME;
      selectedRegion.value = region || "未知地區";
      handleMouseOver(region); // 顯示對應的鄉鎮市區
    })
    .on("mouseout", function (event, d) {
      const region = d.properties.COUNTYNAME;
      handleMouseOut(region); // 滑鼠移出恢復橘色
    });

  // 7. 繪製縣市框線（第二層，蓋在上方）
  svg
    .selectAll(".county-boundary")
    .data(countyGeo.features)
    .enter()
    .append("path")
    .attr("class", "county-boundary")
    .attr("d", path)
    .attr("stroke", "#fff") // 白色框線
    .attr("fill", "none") // 不填充
    .attr("stroke-width", 1.5) // 框線寬度
    .on("mouseover", function (event, d) {
      const region = d.properties.COUNTYNAME;
      selectedRegion.value = region || "未知地區";
      handleMouseOver(region); // 顯示對應的鄉鎮市區
    })
    .on("mouseout", function (event, d) {
      const region = d.properties.COUNTYNAME;
      handleMouseOut(region); // 滑鼠移出恢復橘色
    });

  svg
    .selectAll(".county-label")
    .data(countyGeo.features)
    .enter()
    .filter((d) => countyLabelPositions[d.properties.COUNTYNAME] !== null) // 過濾掉不顯示的縣市
    .append("g") // 使用 <g> 元素包裹文字和背景
    .attr("class", "county-label-group")
    .each(function (d) {
      const group = d3.select(this);
      const [cx, cy] = path.centroid(d); // 縣市中心點
      const countyName = d.properties.COUNTYNAME;
      const position = countyLabelPositions[countyName] || { x: 0, y: 0 }; // 讀取偏移值

      // 添加背景矩形
      group
        .append("rect")
        .attr("class", "county-label-bg")
        .attr("x", cx + position.x - 30) // 調整矩形位置，確保文字居中
        .attr("y", cy + position.y - 17)
        .attr("width", 60) // 背景矩形的寬度
        .attr("height", 30) // 背景矩形的高度
        .attr("fill", "#f0f0f0") // 背景顏色（淺灰色）
        .attr("fill-opacity", 0.4)
        .attr("rx", "15px") // 圓角半徑
        .attr("ry", "15px"); // 圓角半徑

      // 添加文字
      group
        .append("text")
        .attr("class", "county-label-text")
        .attr("x", cx + position.x)
        .attr("y", cy + position.y)
        .text(countyName) // 顯示縣市名稱
        .attr("text-anchor", "middle") // 文本居中
        .attr("alignment-baseline", "middle") // 垂直居中
        .attr("font-size", "12px") // 字體大小
        .attr("fill", "#7d7d7d"); // 文字顏色（深灰色）
    });

  initializeMap();
});
</script>

<template>
  <div>
    <div>
      <button @click="updateHighlightByCity('新北市')">新北市</button>
      <button @click="updateHighlightByCity('桃園市')">桃園市</button>
      <button @click="updateHighlightByCity('新竹縣')">新竹縣</button>
      <button @click="updateHighlightByCity('南投縣')">南投縣</button>
    </div>
    <div class="map">
      <div ref="mapContainer" class="map-city"></div>
      <div class="map-item">選擇地區：{{ selectedRegion }}</div>
    </div>
  </div>
</template>

<style lang="scss">
.map {
  outline: 1px solid red;
  width: 100%;
  display: flex;

  .map-city {
    background-color: #dff9ff;
  }
  .town-boundary {
    stroke: none !important;
    stroke-width: 0 !important;
  }
}
.city {
  background-color: gray;
  color: red;
  border-radius: 10px;
}
</style>
