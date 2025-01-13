<script setup>
import * as d3 from "d3";

// 定義一個引用元素
const chart1 = ref(null);
const chart2 = ref(null);

// 繪製條狀圖的函數
const drawBarChart = ({
  container,
  data,
  xKey,
  yKey,
  width,
  height,
  margin,
  colorRange,
  singleColor, // 新增參數：單一顏色
  xLabel,
  yLabel,
}) => {
  // 設定比例尺
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d[xKey])) // 根據 xKey 提取 x 軸標籤
    .range([0, width])
    .padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yKey])]) // 縱軸最大值
    .range([height, 0]);

  const colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yKey])]) // 顏色根據數據範圍
    .range(colorRange);

  // 創建 SVG 畫布
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // 添加條形圖
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d[xKey]))
    .attr("y", (d) => yScale(d[yKey]))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d[yKey]))
    .attr("fill", (d) => (singleColor ? singleColor : colorScale(d[yKey]))); // 切換單一顏色或動態色

  // 添加橫軸
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.bottom - 10)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text(xLabel);

  // 添加縱軸
  svg
    .append("g")
    .call(d3.axisLeft(yScale).ticks(10))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 10)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text(yLabel);
};

// 使用 onMounted 來調用繪製函數
onMounted(() => {
  // 條狀圖1設定
  drawBarChart({
    container: chart1.value,
    data: [
      { year: 2014, num: 10 },
      { year: 2016, num: 20 },
      { year: 2018, num: 30 },
      { year: 2020, num: 40 },
    ],
    xKey: "year",
    yKey: "num",
    width: 400,
    height: 200,
    margin: { top: 20, right: 20, bottom: 40, left: 50 },
    colorRange: ["lightblue", "darkblue"],
    singleColor: null,
    xLabel: "Year",
    yLabel: "Value",
  });

  // 條狀圖2設定
  drawBarChart({
    container: chart2.value,
    data: [
      { year: 2014, num: 10 },
      { year: 2016, num: 20 },
      { year: 2018, num: 30 },
      { year: 2020, num: 40 },
      { year: 2022, num: 80 },
      { year: 2024, num: 60 },
    ],
    xKey: "year",
    yKey: "num",
    width: 600,
    height: 200,
    margin: { top: 20, right: 20, bottom: 40, left: 40 }, // 外邊距
    colorRange: ["lightblue", "darkblue"], // 動態顏色仍需定義
    singleColor: "red", // 單一顏色，將所有條形設為紅色
    xLabel: "Category",
    yLabel: "Value",
  });
});

// onMounted(() => {
//   // 數據
//   const data = [
//     { year: 2014, num: 10 },
//     { year: 2016, num: 20 },
//     { year: 2018, num: 30 },
//     { year: 2020, num: 40 },
//     { year: 2022, num: 80 },
//     { year: 2024, num: 60 },
//   ];
//   const width = 400; // 畫布寬度
//   const height = 200; // 畫布高度
//   const margin = { top: 20, right: 20, bottom: 40, left: 40 }; // 外邊距

//   // 創建 SVG 畫布
//   const svg = d3
//     .select(chart.value)
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left}, ${margin.top})`);

//   //橫軸
//   const xScale = d3
//     .scaleBand()
//     .domain(data.map((d) => d.year)) // 使用年份作為標籤
//     .range([0, width])
//     .padding(0.2);

//   //縱軸
//   const yScale = d3
//     .scaleLinear()
//     .domain([0, d3.max(data, (d) => d.num)]) // 縱軸最大值為數據中的最大值
//     .range([height, 0]);

//   // 繪製條形圖
//   svg
//     .selectAll("rect")
//     .data(data)
//     .enter()
//     .append("rect")
//     .attr("x", (d) => xScale(d.year)) // 根據年份設置 x 座標
//     .attr("y", (d) => yScale(d.num)) // 根據數據值設置 y 座標
//     .attr("width", xScale.bandwidth()) // 條形寬度由比例尺計算
//     .attr("height", (d) => height - yScale(d.num)) // 高度根據數據值計算
//     // .attr("fill", "red")
//     .attr("fill", (d) => (d.num > 50 ? "#f1627e" : "#64b5f6")); // 數據值 > 50 為綠色，否則為橙色

//   // 添加橫軸 (年份)
//   svg
//     .append("g")
//     .attr("transform", `translate(0, ${height})`)
//     .call(d3.axisBottom(xScale))
//     .selectAll("text")
//     .attr("transform", "rotate(-45)") // 標籤旋轉避免重疊
//     .style("text-anchor", "end");

//   // 添加縱軸 (數據值)
//   svg.append("g").call(d3.axisLeft(yScale).ticks(10)); // 每 10 單位顯示一個刻度
// });
</script>

<template>
  <div>
    <div ref="chart1"></div>
    <div ref="chart2"></div>
  </div>
</template>

<style scoped>
div {
  margin: 20px;
}
</style>
