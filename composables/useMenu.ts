export const useMenu = () => {
  const menu = ref([
    { title: "about", link: "/about" },
    {
      title: "功能",
      link: "/action",
      sub: [
        { subTitle: "轉換大小寫", link: "/action/changeWord" },
        {
          subTitle: "顏色選擇器",
          link: "/action/colorPicker",
        },
        {
          subTitle: "Loading...",
          link: "/action/laodingAct",
        },
        {
          subTitle: "pinia-toto...",
          link: "/action/pinia-todo",
        },
      ],
    },
  ]);
  return { menu };
};
