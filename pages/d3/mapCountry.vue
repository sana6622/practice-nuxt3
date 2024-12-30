<script setup>
import * as d3 from "d3";
import * as topojson from "topojson-client"; // 引入 TopoJSON 解析工具

const mapContainer = ref(null);
const selectedRegion = ref("請選擇一個地區"); // 儲存被選中的地區名稱
const select = ref(null);

const buttonClick = (city) => {
  select.value = city;
  highlightRegion(city); // 高亮對應地區
};

const more = ["宜蘭縣", "花蓮縣"];
const buttonMore = () => {
  select.value = more;
  highlightRegion(more);
};

const highlightRegion = (regions) => {
  d3.select(mapContainer.value)
    .selectAll("path")
    .attr(
      "fill",
      (d) => (regions.includes(d.properties.COUNTYNAME) ? "#FFA500" : "#67D5B5") // 高亮選中的地區
    );
};

onMounted(async () => {
  // 1. 加載 TopoJSON 文件
  const topoData = await d3.json("/data/topoCountry.json");
  console.log("topo", topoData);

  // 2. 提取地理數據
  const geoData = topojson.feature(
    topoData,
    topoData.objects.COUNTY_MOI_1130718
  ); // 替換 "districts" 為 TopoJSON 中對應的地區名稱

  console.log("geoData", geoData);

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
    .geoMercator() // 使用 Mercator 投影
    .scale(1000 * zoomFactor)
    .center([121, 23.5]) // 設置地圖的中心為台灣
    .translate([width / 2, height / 2]); // 設置中心點
  const path = d3.geoPath().projection(projection);

  // 6. 繪製地圖
  svg
    .selectAll("path")
    .data(geoData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "#0B6623") // 邊界顏色
    .attr("fill", "#67D5B5") // 填充顏色
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill", "#FFA500"); // 滑鼠移入時變色
    })
    .on("mouseout", function (event, d) {
      d3.select(this).attr("fill", "#67D5B5"); // 滑鼠移出時恢復
    })
    .on("click", function (event, d) {
      // 點擊地區時更新 Vue 的響應式變數
      selectedRegion.value = d.properties.COUNTYNAME || "未知地區";
    });
  // 7. 添加地名（可選）
  svg
    .selectAll("text")
    .data(geoData.features)
    .enter()
    .append("text")
    .attr("x", (d) => path.centroid(d)[0])
    .attr("y", (d) => path.centroid(d)[1])
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .text((d) => d.properties.COUNTYNAM); // 使用 TopoJSON 中的地名屬性

  svg
    .selectAll("text")
    .data(geoData.features)
    .enter()
    .append("text")
    .attr("x", (d) => path.centroid(d)[0])
    .attr("y", (d) => path.centroid(d)[1])
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .text((d) => d.properties.COUNTYNAME || "Unknown");
});
</script>

<template>
  <div>
    <div>
      <button @click="buttonClick('臺北市')">臺北市</button>
      <button @click="buttonClick('新北市')">新北市</button>
      <button @click="buttonClick('南投縣')">南投縣</button>
      <button @click="buttonMore()">宜蘭縣、花蓮縣</button>
      <span>{{ select }}</span>
    </div>
    <div class="map">
      <div ref="mapContainer" class="map-city"></div>
      <div class="map-item">{{ selectedRegion }}</div>
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
