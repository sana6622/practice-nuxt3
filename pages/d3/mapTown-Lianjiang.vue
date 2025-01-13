<script setup>
import * as d3 from "d3";
import * as topojson from "topojson-client";

const mapContainer = ref(null);

//文字位置
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
  澎湖縣: { x: -50, y: -10 },
  金門縣: { x: -30, y: -20 },
  連江縣: { x: -50, y: -20 },
};
const selectedRegion = ref("請選擇一個地區"); // 儲存被選中的地區名稱

//補助地區
const dynamicHighlightData = ref({
  新北市: ["石碇區", "坪林區", "平溪區", "雙溪區", "烏來區", "貢寮區"],
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
  琉球鄉: ["琉球鄉"],
  綠島鄉: ["綠島鄉"],
  蘭嶼鄉: ["蘭嶼鄉"],
});

//離島
const regions = [
  {
    region: "連江縣",
    class: ".lienchiang-town-boundary",
    typeName: "COUNTYNAME",
  },
  { region: "金門縣", class: ".kinmen-town-boundary", typeName: "COUNTYNAME" },
  { region: "澎湖縣", class: ".penghu-town-boundary", typeName: "COUNTYNAME" },
  {
    region: "琉球鄉",
    class: ".xiaoliuqiu-town-boundary",
    typeName: "TOWNNAME",
  },
  {
    region: "臺東縣",
    class: ".green-island-boundary,.lanyu-town-boundary",
    typeName: "COUNTYNAME",
  },
];

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

  // 隱藏地圖中原本的離島區域
  svg
    .selectAll(".town-boundary")
    .filter((d) => {
      const countyName = d.properties.COUNTYNAME;
      const townName = d.properties.TOWNNAME;
      return (
        countyName === "澎湖縣" ||
        countyName === "金門縣" ||
        townName === "琉球鄉" ||
        townName === "綠島鄉" ||
        townName === "蘭嶼鄉"
      );
    })
    .attr("display", "none")
    .attr("stroke", "none"); // 隱藏這些區域

  // 2. 繪製縣市框線
  svg
    .selectAll(".county-boundary")
    .attr("fill", "none") // 不填充
    // .attr("stroke", "#fff") // 白色框線
    .attr(
      "stroke",
      (d) =>
        ["澎湖縣", "金門縣", "連江縣"].includes(d.properties.COUNTYNAME) ||
        ["琉球鄉", "綠島鄉", "蘭嶼鄉"].includes(d.properties.TOWNNAME)
          ? "none"
          : "#fff" // 隱藏澎湖等離島框線
    )
    .attr("stroke-width", (d) =>
      ["澎湖縣", "金門縣", "連江縣"].includes(d.properties.COUNTYNAME) ||
      ["琉球鄉", "綠島鄉", "蘭嶼鄉"].includes(d.properties.TOWNNAME)
        ? 0
        : 1.5
    ) // 框線寬度
    .attr("stroke-width", 1.5); // 框線寬度
};

// 滑鼠移入時，將該縣市標亮區域設為深綠
const handleMouseOver = (region) => {
  //還原離島樣式
  clearMouseOverStyles();
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

//恢復離島原本樣式
const handleMouseOutRegion = (region) => {
  const regionInfo = regions.find((item) => item.region === region);
  // d3.select(mapContainer.value)
  //   .selectAll(`${regionInfo.class}`)
  //   .filter((d) => d.properties[regionInfo.typeName] === region)
  //   .attr("fill", (d) => {
  //     const townName = d.properties.TOWNNAME;
  //     const highlightTowns = dynamicHighlightData.value[region] || [];
  //     // 恢復標亮地區的顏色
  //     return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
  //   })
  //   .attr("stroke", "none");
  if (region === "金門縣") {
    d3.select(mapContainer.value)
      .selectAll(`.kinmen-town-boundary, .wuqiu-town-boundary`) // 包含金門縣和烏坵鄉
      .attr("fill", (d) => {
        const townName = d.properties.TOWNNAME;
        const highlightTowns = dynamicHighlightData.value["金門縣"] || [];
        return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
      })
      .attr("stroke", "none");
  } else {
    // 一般情況處理其他地區
    d3.select(mapContainer.value)
      .selectAll(`${regionInfo.class}`)
      .attr("fill", (d) => {
        const townName = d.properties.TOWNNAME;
        const highlightTowns = dynamicHighlightData.value[region] || [];
        return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
      })
      .attr("stroke", "none");
  }
};

//滑鼠移入(離島)
const handleMouseOverRegion = (region) => {
  clearMouseOverStyles();
  selectedRegion.value = region;
  const regionInfo = regions.find((item) => item.region === region);

  // d3.select(mapContainer.value)
  //   .selectAll(`${regionInfo.class}`)
  //   // .filter((d) => d.properties[regionInfo.typeName] === region)
  //   .attr("fill", (d) => {
  //     const townName = d.properties.TOWNNAME;
  //     const highlightTowns = dynamicHighlightData.value[region] || [];
  //     // 如果該地區原本是標亮的，改變為新顏色（例如深綠色）
  //     return highlightTowns.includes(townName) ? "#2e5c56" : "#dedede";
  //   })
  //   .attr("stroke", "none");
  // 修改金門縣的處理，包含"烏坵鄉"
  if (region === "金門縣") {
    d3.select(mapContainer.value)
      .selectAll(`.kinmen-town-boundary, .wuqiu-town-boundary`) // 包含金門縣和烏坵鄉
      .attr("fill", (d) => {
        const townName = d.properties.TOWNNAME;
        const highlightTowns = dynamicHighlightData.value["金門縣"] || [];
        return highlightTowns.includes(townName) ? "#2e5c56" : "#dedede";
      })
      .attr("stroke", "none");
  } else {
    // 一般情況處理其他地區
    d3.select(mapContainer.value)
      .selectAll(`${regionInfo.class}`)
      .attr("fill", (d) => {
        const townName = d.properties.TOWNNAME;
        const highlightTowns = dynamicHighlightData.value[region] || [];
        return highlightTowns.includes(townName) ? "#2e5c56" : "#dedede";
      })
      .attr("stroke", "none");
  }
};

// 顯示特定縣市和鄉鎮市區
const highlightRegion = (region) => {
  // 還原本島區域樣式
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

// 點擊按鈕時根據 dynamicHighlightData 標亮指定縣市
const updateHighlightByCity = (city) => {
  clearMouseOverStyles();
  selectedRegion.value = city;

  highlightRegion(city);
  if (city === "綠島和蘭嶼") {
    handleMouseOverRegion("臺東縣");
  } else if (
    city === "金門縣" ||
    city === "連江縣" ||
    city === "澎湖縣" ||
    city === "琉球鄉"
  ) {
    handleMouseOverRegion(city);
  } else {
    handleMouseOver(city);
  }

  // 觸發 mouseOver 樣式
  // handleMouseOver(city);
};

const clearMouseOverStyles = () => {
  regions.forEach((item) => {
    handleMouseOutRegion(item.region);
  });
};

const drawIsland = (svg, townGeo, dynamicHighlightData, options) => {
  const {
    region,
    hoverRegion,
    groupClass,
    borderClass,
    boundaryClass,
    labelClass,
    labelText,
    projectionConfig,
    position,
    customBorderPath,
    typeName,
    clipExtent,
  } = options;

  const projectionIsland = d3
    .geoMercator()
    .scale(projectionConfig.scale)
    .center(projectionConfig.center)
    .translate(projectionConfig.translate)
    .clipExtent(projectionConfig.clipExtent);

  const pathIsland = d3.geoPath().projection(projectionIsland);

  const islandGroup = svg
    .append("g")
    .attr("class", groupClass)
    .attr("transform", `translate(${position.x}, ${position.y})`);
  //邊框
  if (customBorderPath) {
    //自訂框線(利用自訂路徑 建立出缺邊的框線)
    islandGroup
      .append("path")
      .attr("class", borderClass)
      .attr("d", customBorderPath) // 套用自訂路徑
      .attr("fill", "none")
      .attr("stroke", "#5BB49F")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .on("mouseenter", () => handleMouseOverRegion(hoverRegion))
      .on("mouseleave", () => handleMouseOutRegion(hoverRegion));
  } else {
    //完整框線
    islandGroup
      .append("rect")
      .attr("class", borderClass)
      .attr("width", projectionConfig.width)
      .attr("height", projectionConfig.height)
      .attr("fill", "none")
      .attr("stroke", "#5BB49F")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .on("mouseenter", () => handleMouseOverRegion(hoverRegion))
      .on("mouseleave", () => handleMouseOutRegion(hoverRegion));
  }
  //地圖
  islandGroup
    .selectAll(`.${boundaryClass}`)
    .data(townGeo.features.filter((d) => d.properties[typeName] === region))
    .enter()
    .append("path")
    .attr("class", boundaryClass)
    .attr("d", pathIsland)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[region] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
    })
    .attr("stroke", "none")
    .on("mouseenter", () => handleMouseOverRegion(hoverRegion))
    .on("mouseleave", () => handleMouseOutRegion(hoverRegion));

  // 添加透明的背景矩形，用於監聽滑鼠事件
  islandGroup
    .append("rect")
    .attr("class", "hover-area")
    .attr("width", projectionConfig.width)
    .attr("height", projectionConfig.height)
    .attr("fill", "transparent") // 確保背景矩形透明
    .attr("pointer-events", "all") // 確保透明區域可以接收滑鼠事件
    .on("mouseenter", () => handleMouseOverRegion(hoverRegion)) // 滑鼠進入事件
    .on("mouseleave", () => handleMouseOutRegion(hoverRegion)); // 滑鼠離開事件

  //文字
  islandGroup
    .append("text")
    .attr("class", labelClass)
    .attr("x", projectionConfig.labelX)
    .attr("y", projectionConfig.labelY)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#7d7d7d")
    .text(labelText);
};

onMounted(async () => {
  // 1. 加載 TopoJSON 文件
  const countyData = await d3.json("/data/topo.json"); // 縣市邊界檔案
  const townData = await d3.json("/data/topoTown.json"); // 鄉鎮市區邊界檔案

  // 2. 提取地理數據
  const countyGeo = topojson.feature(
    countyData,
    countyData.objects.COUNTY_MOI_1130718
  ); // COUNTY_MOI_1130718替換縣市物件名稱
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

  // 6. 繪製鄉鎮市區（第一層）(移除離島)
  svg
    .selectAll(".town-boundary")
    .data(
      townGeo.features.filter(
        (d) =>
          !["澎湖縣", "金門縣", "連江縣"].includes(d.properties.COUNTYNAME) &&
          !["琉球鄉", "綠島鄉", "蘭嶼鄉"].includes(d.properties.TOWNNAME)
      ) // 過濾掉離島
    )
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
    // .attr("stroke", "#fff") // 白色框線
    .attr(
      "stroke",
      (d) =>
        ["澎湖縣", "金門縣", "連江縣"].includes(d.properties.COUNTYNAME)
          ? "none"
          : "#fff" // 隱藏澎湖等離島框線
    )
    .attr("stroke-width", (d) =>
      ["澎湖縣", "金門縣", "連江縣"].includes(d.properties.COUNTYNAME) ? 0 : 1.5
    ) // 框線寬度
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
    .filter(
      (d) =>
        countyLabelPositions[d.properties.COUNTYNAME] !== null &&
        !["澎湖縣", "金門縣", "連江縣"].includes(d.properties.COUNTYNAME)
    ) // 過濾掉不顯示的縣市
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

  drawIsland(svg, townGeo, dynamicHighlightData, {
    region: "連江縣",
    hoverRegion: "連江縣",
    groupClass: "lienchiang-group",
    borderClass: "lienchiang-border",
    boundaryClass: "lienchiang-town-boundary",
    labelClass: "lienchiang-label",
    labelText: "連江縣", //文字
    projectionConfig: {
      scale: 10000, //放大比例
      center: [119.95, 26.2], //離島中心點
      translate: [50, 70], //地圖在方框內的位置
      width: 200, //框線寬度
      height: 200, //框線高度
      labelX: 75, //文字在框內的水平位置
      labelY: 175, //文字在框內的垂直位置
    },
    position: { x: 0, y: 0 }, //框線放置在地圖的位置
    typeName: "COUNTYNAME",
  });

  drawIsland(svg, townGeo, dynamicHighlightData, {
    region: "金門縣",
    hoverRegion: "金門縣",
    groupClass: "kinmen-group",
    borderClass: "kinmen-border",
    boundaryClass: "kinmen-town-boundary",
    labelClass: "kinmen-label",
    labelText: "金門縣",
    projectionConfig: {
      scale: 20000,
      center: [118.318, 24.43],
      translate: [70, 80],
      width: 150,
      height: 150,
      labelX: 75,
      labelY: 135,
      clipExtent: [
        [0, 0],
        [700, 300],
      ], //裁切指定大小(左上角座標)(右下角座標)
    },
    position: { x: 0, y: 220 },
    typeName: "COUNTYNAME",
  });

  drawIsland(svg, townGeo, dynamicHighlightData, {
    region: "澎湖縣",
    hoverRegion: "澎湖縣",
    groupClass: "penghu-group",
    borderClass: "penghu-border",
    boundaryClass: "penghu-town-boundary",
    labelClass: "penghu-label",
    labelText: "澎湖縣",
    projectionConfig: {
      scale: 15000,
      center: [119.566, 23.571],
      translate: [80, 70],
      width: 150,
      height: 200,
      labelX: 75,
      labelY: 185,
    },
    position: { x: 0, y: height - 400 },
    typeName: "COUNTYNAME",
  });

  drawIsland(svg, townGeo, dynamicHighlightData, {
    region: "琉球鄉",
    hoverRegion: "琉球鄉",
    groupClass: "xiaoliuqiu-group",
    borderClass: "xiaoliuqiu-border",
    boundaryClass: "xiaoliuqiu-town-boundary",
    labelClass: "xiaoliuqiu-label",
    labelText: "屏東縣(小琉球)",
    projectionConfig: {
      scale: 80000,
      center: [120.371, 22.345],
      translate: [70, 60],
      width: 150,
      height: 150,
      labelX: 75,
      labelY: 135,
    },
    position: { x: 0, y: height - 150 },
    typeName: "TOWNNAME",
  });

  drawIsland(svg, townGeo, dynamicHighlightData, {
    region: "綠島鄉",
    hoverRegion: "臺東縣",
    groupClass: "green-island-group",
    borderClass: "green-island-border",
    boundaryClass: "green-island-boundary",
    labelClass: "green-island-label",
    labelText: "臺東縣(綠島)",
    projectionConfig: {
      scale: 50000,
      center: [121.49, 22.661],
      translate: [80, 70],
      width: 150,
      height: 150,
      labelX: 75,
      labelY: 135,
    },
    position: { x: width - 160, y: height - 350 },
    customBorderPath: `M0,150 V0 H150 V150`, // 自訂路徑，上->右->下，沒有畫底部框線
    typeName: "TOWNNAME",
  });

  drawIsland(svg, townGeo, dynamicHighlightData, {
    region: "蘭嶼鄉",
    hoverRegion: "臺東縣",
    groupClass: "lanyu-group",
    borderClass: "lanyu-border",
    boundaryClass: "lanyu-town-boundary",
    labelClass: "lanyu-label",
    labelText: "臺東縣(蘭嶼)",
    projectionConfig: {
      scale: 40000,
      center: [121.55, 22.045],
      translate: [80, 70],
      width: 150,
      height: 250,
      labelX: 75,
      labelY: 135,
    },
    position: { x: width - 160, y: height - 200 },
    customBorderPath: `M150,0 V150 H0 V0`, // 自訂框線的路徑， 右 -> 下 -> 左 畫沒有上方的框線
    typeName: "TOWNNAME",
  });

  //金門烏坵鄉
  const kinmenGroup = svg
    .append("g")
    .attr("class", "kinmen-group")
    .attr("transform", `translate(0, 220)`);
  // 新增 金門烏坵鄉" 的 projection 和 path (因為烏坵鄉距離金門太遠所以需要抓烏坵鄉放到金門的框框中)
  const projectionWuqiu = d3
    .geoMercator()
    .scale(20000) // 縮放比例，讓烏坵鄉的大小合適
    .center([118.318, 24.43]) // 使用金門的中心點作為參考
    .translate([-265, 245]); // 偏移量，調整烏坵鄉在框框內的位置
  const pathWuqiu = d3.geoPath().projection(projectionWuqiu);
  // 添加 "烏坵鄉" 到金門框框內
  kinmenGroup
    .selectAll(".wuqiu-town-boundary")
    .data(townGeo.features.filter((d) => d.properties.TOWNNAME === "烏坵鄉"))
    .enter()
    .append("path")
    .attr("class", "wuqiu-town-boundary")
    .attr("d", pathWuqiu) // 使用新的 path
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value["金門縣"] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede"; // 與金門框框內其他區域一致
    })
    .attr("stroke", "none")
    .attr("stroke-width", 1)
    .on("mouseenter", () => handleMouseOverRegion("金門縣"))
    .on("mouseleave", () => handleMouseOutRegion("金門縣"));

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
      <button @click="updateHighlightByCity('金門縣')">金門縣</button>
      <button @click="updateHighlightByCity('連江縣')">連江縣</button>
      <button @click="updateHighlightByCity('澎湖縣')">澎湖縣</button>
      <button @click="updateHighlightByCity('琉球鄉')">琉球鄉</button>
      <button @click="updateHighlightByCity('綠島和蘭嶼')">綠島和蘭嶼</button>
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
  // .town-boundary {
  //   stroke: none !important;
  //   stroke-width: 0 !important;
  // }
}
.city {
  background-color: gray;
  color: red;
  border-radius: 10px;
}
</style>
