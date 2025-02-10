// src/constants/icons.ts
export interface IconData {
  id: number;
  name: string;
  label: string;
  path: string;
}

// 所有的 Icon 資料
export const iconList: IconData[] = [
  {
    id: 1,
    name: "attraction",
    label: "景點",
    path: "/image/mapIcon/attraction.svg",
  },
  { id: 2, name: "info", label: "資訊點", path: "/image/mapIcon/info.svg" },
  {
    id: 3,
    name: "hospital",
    label: "醫院",
    path: "/image/mapIcon/hospital.svg",
  },
  {
    id: 4,
    name: "monument",
    label: "紀念碑",
    path: "/image/mapIcon/monument.svg",
  },
  { id: 5, name: "tunnel", label: "隧道", path: "/image/mapIcon/tunnel.svg" },
  { id: 6, name: "school", label: "學校", path: "/image/mapIcon/school.svg" },
  {
    id: 7,
    name: "militaryCamp",
    label: "軍營",
    path: "/image/mapIcon/militaryCamp.svg",
  },
  {
    id: 8,
    name: "barrier",
    label: "障礙物",
    path: "/image/mapIcon/barrier.svg",
  },
  { id: 9, name: "prize", label: "獎勵", path: "/image/mapIcon/prize.svg" },
  { id: 10, name: "grave", label: "墳墓", path: "/image/mapIcon/grave.svg" },
  { id: 11, name: "temple", label: "廟宇", path: "/image/mapIcon/temple.svg" },
  { id: 12, name: "hotel", label: "飯店", path: "/image/mapIcon/hotel.svg" },
  {
    id: 13,
    name: "restaurant",
    label: "餐廳",
    path: "/image/mapIcon/restaurant.svg",
  },
  { id: 14, name: "drink", label: "飲料店", path: "/image/mapIcon/drink.svg" },
  { id: 15, name: "toilet", label: "廁所", path: "/image/mapIcon/toilet.svg" },
  {
    id: 16,
    name: "industry",
    label: "工業區",
    path: "/image/mapIcon/industry.svg",
  },
  { id: 17, name: "other", label: "其他", path: "/image/mapIcon/other.svg" },
];

export const getIconById = (id: number): IconData | undefined => {
  return iconList.find((icon) => icon.id === id);
};

export const getIconByName = (name: string): IconData | undefined => {
  return iconList.find((icon) => icon.name === name);
};
export const getIconPathById = (id: number | string) => {
  const icon = iconList.find((item) => item.id === Number(id));
  return icon ? icon.path : "/image/mapIcon/other.svg"; // 如果找不到，回傳預設 icon
};
