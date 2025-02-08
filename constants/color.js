// color.ts
export const colorList = [
  { id: 1, color: "rgba(178, 99, 94, 1)" }, // 紅色
  { id: 2, color: "rgba(97, 151, 168, 1)" }, // 藍色
  { id: 3, color: "rgba(215, 166, 71, 1)" }, // 黃色
  { id: 4, color: "rgba(67, 139, 100,1)" }, // 綠色
  { id: 5, color: "rgba(148, 121, 70,1)" }, // 卡其色
];

// 取得對應顏色，並允許調整透明度
export const getIconColor = (bgcId, opacity = 1) => {
  const colorObj = colorList.find((color) => color.id === bgcId);
  if (!colorObj) return `rgba(202, 178, 132, ${opacity})`; // 預設顏色
  return colorObj.color.replace("1)", `${opacity})`); // 調整透明度
};
