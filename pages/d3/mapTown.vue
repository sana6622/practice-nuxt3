<script setup>
import * as d3 from "d3";
import * as topojson from "topojson-client";

const mapContainer = ref(null);
const selectedRegion = ref("請選擇一個地區"); // 儲存被選中的地區名稱
const dynamicHighlightData = ref({
  新北市: ["石碇區", "坪林區", "平溪區", "雙溪區", "烏來區", "貢寮區"], // 當前標亮的鄉鎮市區
  桃園市: ["復興區"],
  新竹縣: ["五峰鄉", "尖石鄉", "關西鎮", "峨眉鄉"],
  苗栗縣: ["泰安鄉", "南庄鄉", "獅潭鄉", "三灣鄉"],
  臺中市: ["和平區"],
  南投縣: ["中寮鄉", "仁愛鄉", "信義鄉", "魚池鄉", "國姓鄉", "鹿谷鄉"],
});

// 顯示特定縣市和鄉鎮市區
const highlightRegion = (region) => {
  const highlightTowns = dynamicHighlightData.value[region] || [];

  // 更新鄉鎮市區的顯示狀態
  d3.select(mapContainer.value)
    .selectAll(".town-boundary")
    .attr("fill", (d) => {
      const countyName = d.properties.COUNTYNAME;
      const townName = d.properties.TOWNNAME;
      if (countyName === region) {
        return highlightTowns.includes(townName) ? "#FFA500" : "#D3D3D3"; // 高亮橘色，其他灰色
      }
      return "none"; // 非選中縣市不顯示
    })
    .attr("stroke", (d) => {
      const countyName = d.properties.COUNTYNAME;
      const townName = d.properties.TOWNNAME;
      if (countyName === region) {
        return highlightTowns.includes(townName) ? "#333" : "none"; // 高亮區域顯示線條，灰色區域不顯示線條
      }
      return "none"; // 非選中縣市不顯示線條
    })
    .attr("stroke-width", (d) => {
      const countyName = d.properties.COUNTYNAME;
      const townName = d.properties.TOWNNAME;
      if (countyName === region) {
        return highlightTowns.includes(townName) ? 1 : 0; // 高亮區域的線條寬度
      }
      return 0; // 非選中區域無線條
    });

  // 確保縣市範圍顯示完整
  d3.select(mapContainer.value)
    .selectAll(".county")
    .attr("fill", "#5bb49f") //初始 灰色
    .attr("stroke", "#0B6623"); //初始 線條
};

// 點擊按鈕時根據 dynamicHighlightData 高亮指定縣市
const updateHighlightByCity = (city) => {
  selectedRegion.value = city;
  highlightRegion(city);
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

  // 6. 繪製縣市範圍
  svg
    .selectAll(".county")
    .data(countyGeo.features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", path)
    .attr("stroke", "#0B6623") // 縣市邊界
    .attr("fill", "#67D5B5") // 縣市填充色
    .on("mouseover", function (event, d) {
      const region = d.properties.COUNTYNAME;
      selectedRegion.value = region || "未知地區";
      highlightRegion(region); // 顯示對應的鄉鎮市區
    });

  // 7. 繪製鄉鎮市區範圍
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
    .attr("d", path)
    .attr("fill", "none") // 初始不顯示
    .attr("stroke", "none"); // 移除邊界線條
});
</script>

<template>
  <div>
    <div>
      <button @click="updateHighlightByCity('新北市')">顯示新北市</button>
      <button @click="updateHighlightByCity('桃園市')">顯示桃園市</button>
      <button @click="updateHighlightByCity('新竹縣')">顯示新竹縣</button>
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
}
</style>
