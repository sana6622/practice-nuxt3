// src/constants/icons.ts
export interface IconData {
  id: number;
  name: string;
  path: string;
}

// 所有的 Icon 資料
export const iconList: IconData[] = [
  { id: 1, name: "attraction", path: "/image/mapIcon/attraction.svg" },
  { id: 2, name: "info", path: "/image/mapIcon/info.svg" },
  { id: 3, name: "hospital", path: "/image/mapIcon/hospital.svg" },
  { id: 4, name: "monument", path: "/image/mapIcon/monument.svg" },
  { id: 5, name: "tunnel", path: "/image/mapIcon/tunnel.svg" },
  { id: 6, name: "school", path: "/image/mapIcon/school.svg" },
  { id: 7, name: "militaryCamp", path: "/image/mapIcon/militaryCamp.svg" },
  { id: 8, name: "barrier", path: "/image/mapIcon/barrier.svg" },
  { id: 9, name: "prize", path: "/image/mapIcon/prize.svg" },
  { id: 10, name: "grave", path: "/image/mapIcon/grave.svg" },
  { id: 11, name: "temple", path: "/image/mapIcon/temple.svg" },
  { id: 12, name: "hotel", path: "/image/mapIcon/hotel.svg" },
  { id: 13, name: "restaurant", path: "/image/mapIcon/restaurant.svg" },
  { id: 14, name: "drink", path: "/image/mapIcon/drink.svg" },
  { id: 15, name: "toilet", path: "/image/mapIcon/toilet.svg" },
  { id: 16, name: "industry", path: "/image/mapIcon/industry.svg" },
  { id: 17, name: "other", path: "/image/mapIcon/other.svg" },
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
