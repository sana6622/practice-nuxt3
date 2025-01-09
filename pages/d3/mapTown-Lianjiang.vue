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
  澎湖縣: { x: -50, y: -10 },
  金門縣: { x: -30, y: -20 },
  連江縣: { x: -50, y: -20 },
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
  琉球鄉: ["琉球鄉"],
  綠島鄉: ["綠島鄉"],
  蘭嶼鄉: ["蘭嶼鄉"],
});

const regions = [
  {
    region: "連江縣",
    class: "lienchiang-town-boundary",
    typeName: "COUNTYNAME",
  },
  { region: "金門縣", class: "kinmen-town-boundary", typeName: "COUNTYNAME" },
  { region: "澎湖縣", class: "penghu-town-boundary", typeName: "COUNTYNAME" },
  { region: "琉球鄉", class: "lanyu-town-boundary", typeName: "TOWNNAME" },
  { region: "綠島鄉", class: "green-island-boundary", typeName: "TOWNNAME" },
  { region: "蘭嶼鄉", class: "lanyu-town-boundary", typeName: "TOWNNAME" },
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

  // 隱藏特定區域
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

// 滑鼠移入，連江縣
const handleMouseOverLienchiang = (region) => {
  d3.select(mapContainer.value)
    .selectAll(".lienchiang-town-boundary")
    .filter((d) => d.properties.COUNTYNAME === region)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[region] || [];
      // 如果該地區原本是標亮的，改變為新顏色（例如深綠色）
      return highlightTowns.includes(townName) ? "#2e5c56" : "#dedede";
    })
    .attr("stroke", "none"); // 邊框顏色也改變為深綠
};

// 滑鼠移出，連江縣
// const handleMouseOutLienchiang = (region) => {
//   clearMouseOverStyles();
//   d3.select(mapContainer.value)
//     .selectAll(".lienchiang-town-boundary")
//     .filter((d) => d.properties.COUNTYNAME === region)
//     .attr("fill", (d) => {
//       const townName = d.properties.TOWNNAME;
//       const highlightTowns = dynamicHighlightData.value[region] || [];
//       // 恢復標亮地區的顏色
//       return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
//     })
//     .attr("stroke", "none");
// };

// 滑鼠移入，金門縣
const handleMouseOverKinmen = (region) => {
  clearMouseOverStyles();
  d3.select(mapContainer.value)
    .selectAll(".kinmen-town-boundary")
    .filter((d) => d.properties.COUNTYNAME === region)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[region] || [];
      // 如果該地區原本是標亮的，改變為新顏色（例如深綠色）
      return highlightTowns.includes(townName) ? "#2e5c56" : "#dedede";
    })
    .attr("stroke", "none"); // 邊框顏色也改變為深綠
};

// 滑鼠移出，金門縣
// const handleMouseOutKinmen = (region) => {
//   d3.select(mapContainer.value)
//     .selectAll(".kinmen-town-boundary")
//     .filter((d) => d.properties.COUNTYNAME === region)
//     .attr("fill", (d) => {
//       const townName = d.properties.TOWNNAME;
//       const highlightTowns = dynamicHighlightData.value[region] || [];
//       // 恢復標亮地區的顏色
//       return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
//     })
//     .attr("stroke", "none");
// };

// 滑鼠移入，澎湖縣
const handleMouseOverPenghu = (region) => {
  d3.select(mapContainer.value)
    .selectAll(".penghu-town-boundary")
    .filter((d) => d.properties.COUNTYNAME === region)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[region] || [];
      // 如果該地區原本是標亮的，改變為新顏色（例如深綠色）
      return highlightTowns.includes(townName) ? "#2e5c56" : "#dedede";
    })
    .attr("stroke", "none"); // 邊框顏色也改變為深綠
};

// 滑鼠移出，澎湖縣
// const handleMouseOutPenghu = (region) => {
//   d3.select(mapContainer.value)
//     .selectAll(".penghu-town-boundary")
//     .filter((d) => d.properties.COUNTYNAME === region)
//     .attr("fill", (d) => {
//       const townName = d.properties.TOWNNAME;
//       const highlightTowns = dynamicHighlightData.value[region] || [];
//       // 恢復標亮地區的顏色
//       return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
//     })
//     .attr("stroke", "none");
// };

// 滑鼠移入， 琉球縣
const handleMouseOverXiaoliuqiu = (region) => {
  d3.select(mapContainer.value)
    .selectAll(".xiaoliuqiu-town-boundary")
    .filter((d) => d.properties.TOWNNAME === region)
    .attr("fill", "#2e5c56") // 新顏色
    .attr("stroke", "#fff");
};

// 滑鼠移出，琉球縣
// const handleMouseOutXiaoliuqiu = (region) => {
//   d3.select(mapContainer.value)
//     .selectAll(".xiaoliuqiu-town-boundary")
//     .filter((d) => d.properties.TOWNNAME === region) // 修正為正確的屬性名稱
//     .attr("fill", (d) => {
//       const townName = d.properties.TOWNNAME;
//       const highlightTowns = dynamicHighlightData.value["琉球鄉"] || [];
//       return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede"; // 還原顏色
//     })
//     .attr("stroke", "none"); // 還原線條
// };

// 滑鼠移入，臺東(蘭嶼綠島)
const handleMouseOverTaitungIsland = (region) => {
  d3.select(mapContainer.value)
    .selectAll(".green-island-boundary,.lanyu-town-boundary")
    .filter((d) => d.properties.COUNTYNAME === region)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[region] || [];
      // 如果該地區原本是標亮的，改變為新顏色（例如深綠色）
      return highlightTowns.includes(townName) ? "#2e5c56" : "#dedede";
    })
    .attr("stroke", "none"); // 邊框顏色也改變為深綠
};

// 滑鼠移出，臺東(蘭嶼綠島)
// const handleMouseOutTaitungIsland = (region) => {
//   d3.select(mapContainer.value)
//     .selectAll(".green-island-boundary,.lanyu-town-boundary")
//     .filter((d) => d.properties.COUNTYNAME === region)
//     .attr("fill", (d) => {
//       const townName = d.properties.TOWNNAME;
//       const highlightTowns = dynamicHighlightData.value[region] || [];
//       // 恢復標亮地區的顏色
//       return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
//     })
//     .attr("stroke", "none");
// };

//恢復離島原本樣式
const handleMouseOutRegion = (region) => {
  const regionInfo = regions.find((item) => item.region === region);
  d3.select(mapContainer.value)
    .selectAll(`.${regionInfo.class}`)
    .filter((d) => d.properties[regionInfo.typeName] === region)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value[region] || [];
      // 恢復標亮地區的顏色
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
    })
    .attr("stroke", "none");
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

// 點擊按鈕時根據 dynamicHighlightData 標亮指定縣市
const updateHighlightByCity = (city) => {
  clearMouseOverStyles();
  selectedRegion.value = city;

  highlightRegion(city);
  if (city === "金門縣") {
    handleMouseOverKinmen("金門縣");
  } else if (city === "連江縣") {
    handleMouseOverLienchiang("連江縣");
  }
  // 觸發 mouseOver 樣式
  handleMouseOver(city);
};

const clearMouseOverStyles = () => {
  regions.forEach((item) => {
    handleMouseOutRegion(item.region);
  });
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

  // 6. 繪製鄉鎮市區（第一層）
  svg
    .selectAll(".town-boundary")
    // .data(townGeo.features)
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

  //連江縣
  const projectionLienchiang = d3
    .geoMercator()
    .scale(15000) // 調整比例尺
    .center([119.95, 26.2]) // 連江縣（馬祖）中心點
    .translate([50, 70]); // 地圖放置位置

  const pathLienchiang = d3.geoPath().projection(projectionLienchiang);

  const lienchiangGroup = svg
    .append("g")
    .attr("class", "lienchiang-group")
    .attr("transform", `translate(0, 0)`); // 框框位置調整

  // 連江縣框框
  lienchiangGroup
    .append("rect")
    .attr("class", "lienchiang-border")
    .attr("width", 200)
    .attr("height", 200)
    .attr("fill", "none")
    .attr("stroke", "#5BB49F")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .on("mouseenter", () => handleMouseOverLienchiang("連江縣")) // 滑鼠移入時改變顏色
    .on("mouseleave", () => handleMouseOutRegion("連江縣")); // 滑鼠移出時恢復顏色

  // 繪製連江縣地圖
  lienchiangGroup
    .selectAll(".lienchiang-town-boundary")
    .data(townGeo.features.filter((d) => d.properties.COUNTYNAME === "連江縣"))
    .enter()
    .append("path")
    .attr("class", "lienchiang-town-boundary")
    .attr("d", pathLienchiang)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value["連江縣"] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
    })
    .attr("stroke", "none")
    .attr("stroke-width", 1)
    .on("mouseenter", () => handleMouseOverLienchiang("連江縣")) // 滑鼠移入時改變顏色
    .on("mouseleave", () => handleMouseOutRegion("連江縣")); // 滑鼠移出時恢復顏色

  // 連江縣文字
  lienchiangGroup
    .append("text")
    .attr("class", "lienchiang-label")
    .attr("x", 75) // 框框內水平居中
    .attr("y", 175) // 框框底部上方
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#7d7d7d")
    .text("連江縣(馬祖)");

  //金門
  const projectionKinmen = d3
    .geoMercator()
    .scale(20000)
    .center([118.318, 24.43]) // 金門中心點
    .translate([70, 80]) //地圖放置位置
    .clipExtent([
      [0, 0],
      [700, 300],
    ]); //指定大小(左上角座標)(右下角座標)

  const pathKinmen = d3.geoPath().projection(projectionKinmen);

  const kinmenGroup = svg
    .append("g")
    .attr("class", "kinmen-group")
    .attr("transform", `translate(0, 220)`); //框縣地圖放置位置

  // 金門添加邊框
  kinmenGroup
    .append("rect")
    .attr("class", "kinmen-border")
    .attr("width", 150) // 邊框寬度
    .attr("height", 150) // 邊框高度
    .attr("fill", "none")
    .attr("stroke", "#5BB49F") // 邊框顏色
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5") // 設定為虛線，5px 實線，5px 空白
    .on("mouseenter", () => handleMouseOverKinmen("金門縣"))
    .on("mouseleave", () => handleMouseOutRegion("金門縣"));

  // 繪製金門的鄉鎮市區
  kinmenGroup
    .selectAll(".kinmen-town-boundary")
    .data(townGeo.features.filter((d) => d.properties.COUNTYNAME === "金門縣"))
    .enter()
    .append("path")
    .attr("class", "kinmen-town-boundary")
    .attr("d", pathKinmen)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value["金門縣"] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
    })
    .attr("stroke", "none")
    .attr("stroke-width", 1)
    .on("mouseenter", () => handleMouseOverKinmen("金門縣"))
    .on("mouseleave", () => handleMouseOutRegion("金門縣"));

  //金門文字
  kinmenGroup
    .append("text")
    .attr("class", "xiaoliuqiu-label")
    .attr("x", 75) // 文字水平位置，框框中心
    .attr("y", 135) // 文字垂直位置，接近框框底部
    .attr("text-anchor", "middle") // 文字水平居中對齊
    .attr("alignment-baseline", "middle") // 文字垂直居中對齊
    .attr("font-size", "14px")
    .attr("fill", "#7d7d7d") // 字體顏色
    .text("金門縣"); // 文字內容

  //澎湖縣
  const projectionPenghu = d3
    .geoMercator()
    .scale(15000)
    .center([119.566, 23.571]) // 澎湖縣中心點
    .translate([80, 70]) //地圖放置位置
    .clipExtent([
      [0, 0],
      [200, 200],
    ]); //指定大小(左上角座標)(右下角座標)

  const pathPenghu = d3.geoPath().projection(projectionPenghu);

  const penghuGroup = svg
    .append("g")
    .attr("class", "penghu-group")
    .attr("transform", `translate(0, ${height - 400})`); //框縣地圖放置位置

  // 澎湖縣添加邊框
  penghuGroup
    .append("rect")
    .attr("class", "penghu-border")
    .attr("width", 150) // 邊框寬度，包含地圖和內邊距
    .attr("height", 200) // 邊框高度，包含地圖和內邊距
    .attr("fill", "none") // 無填充
    .attr("stroke", "#5BB49F") // 邊框顏色
    .attr("stroke-width", 2) // 邊框線條寬度
    .attr("stroke-dasharray", "5,5") // 設定為虛線，5px 實線，5px 空白
    .on("mouseenter", () => handleMouseOverPenghu("澎湖縣")) // 滑鼠移入時改變顏色
    .on("mouseleave", () => handleMouseOutRegion("澎湖縣")); // 滑鼠移出時恢復顏色

  // 繪製澎湖縣的鄉鎮市區
  penghuGroup
    .selectAll(".penghu-town-boundary")
    .data(townGeo.features.filter((d) => d.properties.COUNTYNAME === "澎湖縣"))
    .enter()
    .append("path")
    .attr("class", "penghu-town-boundary")
    .attr("d", pathPenghu)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value["澎湖縣"] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
    })
    .attr("stroke", "none")
    .attr("stroke-width", 1)
    .on("mouseenter", () => handleMouseOverPenghu("澎湖縣")) // 確保琉球地圖也會觸發
    .on("mouseleave", () => handleMouseOutRegion("澎湖縣"));

  // 澎湖縣文字
  penghuGroup
    .append("text")
    .attr("class", "penghu-label")
    .attr("x", 75) // 文字水平位置，框框中心
    .attr("y", 185) // 文字垂直位置，接近框框底部
    .attr("text-anchor", "middle") // 文字水平居中對齊
    .attr("alignment-baseline", "middle") // 文字垂直居中對齊
    .attr("font-size", "14px") // 字體大小
    .attr("fill", "#7d7d7d") // 字體顏色
    .text("澎湖縣"); // 文字內容

  //琉球鄉
  const projectionXiaoliuqiu = d3
    .geoMercator()
    .scale(80000)
    .center([120.371, 22.345]) // 琉球鄉中心點
    .translate([80, 70]) //地圖放置位置
    .clipExtent([
      [0, 0],
      [200, 200],
    ]); //指定大小(左上角座標)(右下角座標)

  const pathXiaoliuqiu = d3.geoPath().projection(projectionXiaoliuqiu);

  const xiaoliuqiuGroup = svg
    .append("g")
    .attr("class", "xiaoliuqiu-group")
    .attr("transform", `translate(0, ${height - 150})`); //框縣地圖放置位置

  // 琉球鄉添加邊框
  xiaoliuqiuGroup
    .append("rect")
    .attr("class", "xiaoliuqiu-border")
    .attr("width", 150) // 邊框寬度，包含地圖和內邊距
    .attr("height", 150) // 邊框高度，包含地圖和內邊距
    .attr("fill", "none") // 無填充
    .attr("stroke", "#5BB49F") // 邊框顏色
    .attr("stroke-width", 2) // 邊框線條寬度
    .attr("stroke-dasharray", "5,5") // 設定為虛線，5px 實線，5px 空白
    .on("mouseenter", () => handleMouseOverXiaoliuqiu("琉球鄉")) // 滑鼠移入時改變顏色
    .on("mouseleave", () => handleMouseOutRegion("琉球鄉")); // 滑鼠移出時恢復顏色

  // 繪製琉球鄉的鄉鎮市區
  xiaoliuqiuGroup
    .selectAll(".xiaoliuqiu-town-boundary")
    .data(townGeo.features.filter((d) => d.properties.TOWNNAME === "琉球鄉"))
    .enter()
    .append("path")
    .attr("class", "xiaoliuqiu-town-boundary")
    .attr("d", pathXiaoliuqiu)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value["琉球鄉"] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
    })
    .attr("stroke", "none")
    .attr("stroke-width", 1)
    .on("mouseenter", () => handleMouseOverXiaoliuqiu("琉球鄉")) // 確保琉球地圖也會觸發
    .on("mouseleave", () => handleMouseOutRegion("琉球鄉"));

  // 琉球文字
  xiaoliuqiuGroup
    .append("text")
    .attr("class", "xiaoliuqiu-label")
    .attr("x", 75) // 文字水平位置，框框中心
    .attr("y", 135) // 文字垂直位置，接近框框底部
    .attr("text-anchor", "middle") // 文字水平居中對齊
    .attr("alignment-baseline", "middle") // 文字垂直居中對齊
    .attr("font-size", "14px") // 字體大小
    .attr("fill", "#7d7d7d") // 字體顏色
    .text("屏東縣(小琉球)"); // 文字內容

  // 綠島
  const projectionGreenIsland = d3
    .geoMercator()
    .scale(50000)
    .center([121.49, 22.661]) // 綠島中心點
    .translate([80, 70]); // 框框位置

  const pathGreenIsland = d3.geoPath().projection(projectionGreenIsland);

  const greenIslandGroup = svg
    .append("g")
    .attr("class", "green-island-group")
    .attr("transform", `translate(${width - 160}, ${height - 350})`); // 框框位置調整

  // 綠島框框
  greenIslandGroup
    // .append("rect")
    .append("path")
    .attr("class", "green-island-border")
    .attr("width", 150)
    .attr("height", 150)
    .attr(
      "d",
      `M0,150 V0 H150 V150 ` // 自訂路徑，上->右->下，沒有畫底部框線
    )
    .attr("fill", "none")
    .attr("stroke", "#5BB49F")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .on("mouseenter", () => handleMouseOverTaitungIsland("臺東縣")) // 滑鼠移入時改變顏色
    .on("mouseleave", () => handleMouseOutRegion("綠島鄉")); // 滑鼠移出時恢復顏色

  // 繪製綠島地圖
  greenIslandGroup
    .selectAll(".green-island-boundary")
    .data(townGeo.features.filter((d) => d.properties.TOWNNAME === "綠島鄉"))
    .enter()
    .append("path")
    .attr("class", "green-island-boundary")
    .attr("d", pathGreenIsland)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value["臺東縣"] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
    })
    .attr("stroke", "none")
    .on("mouseenter", () => handleMouseOverTaitungIsland("臺東縣")) // 滑鼠移入時改變顏色
    .on("mouseleave", () => handleMouseOutRegion("綠島鄉")); // 滑鼠移出時恢復顏色

  // 綠島文字
  greenIslandGroup
    .append("text")
    .attr("class", "green-island-label")
    .attr("x", 75) // 框框內水平居中
    .attr("y", 135) // 框框底部上方
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#7d7d7d")
    .text("臺東縣(綠島)");

  // 蘭嶼
  const projectionLanyu = d3
    .geoMercator()
    .scale(40000)
    .center([121.55, 22.045]) // 蘭嶼中心點
    .translate([80, 70]);

  const pathLanyu = d3.geoPath().projection(projectionLanyu);

  const lanyuGroup = svg
    .append("g")
    .attr("class", "lanyu-group")
    .attr("transform", `translate(${width - 160}, ${height - 200})`); // 框框位置調整

  // 蘭嶼框框
  lanyuGroup
    // .append("rect")
    .append("path")
    .attr("class", "lanyu-border")
    .attr("width", 150)
    .attr("height", 250)
    .attr(
      "d",
      `M150,0 V150 H0 V0 ` // 自訂框線的路徑， 右 -> 下 -> 左
    )
    .attr("fill", "none")
    .attr("stroke", "#5BB49F")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .on("mouseenter", () => handleMouseOverTaitungIsland("臺東縣")) // 滑鼠移入時改變顏色
    .on("mouseleave", () => handleMouseOutRegion("蘭嶼鄉")); // 滑鼠移出時恢復顏色;

  // 繪製蘭嶼地圖
  lanyuGroup
    .selectAll(".lanyu-town-boundary")
    .data(townGeo.features.filter((d) => d.properties.TOWNNAME === "蘭嶼鄉"))
    .enter()
    .append("path")
    .attr("class", "lanyu-town-boundary")
    .attr("d", pathLanyu)
    .attr("fill", (d) => {
      const townName = d.properties.TOWNNAME;
      const highlightTowns = dynamicHighlightData.value["臺東縣"] || [];
      return highlightTowns.includes(townName) ? "#5BB49F" : "#dedede";
    })
    .attr("stroke", "none")
    .on("mouseenter", () => handleMouseOverTaitungIsland("臺東縣")) // 滑鼠移入時改變顏色
    .on("mouseleave", () => handleMouseOutRegion("蘭嶼鄉")); // 滑鼠移出時恢復顏色;

  // 蘭嶼文字
  lanyuGroup
    .append("text")
    .attr("class", "lanyu-label")
    .attr("x", 75) // 框框內水平居中
    .attr("y", 135) // 框框底部上方
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#7d7d7d")
    .text("臺東縣(蘭嶼)");

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
  .kinmen {
    // outline: 1px solid red;
    // border-top: 10px solid #000;
  }
}
.city {
  background-color: gray;
  color: red;
  border-radius: 10px;
}
</style>
