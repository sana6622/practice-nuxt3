export const useMenu = () => {
  const menu = ref([
    { title: "about", link: "/about" },
    {title:"ElementPage",link:"/elementPage"},
    {
      title: "功能",
      link: "/action",
      sub: [
        { subTitle: "轉換大小寫", link: "/action/changeWord" },
        { subTitle: "複製文字", link: "/action/copyWord" },
        {subTitle:"plugin proved使用" , link:"/action/pluginProvider"},
        {
          subTitle: "顏色選擇器",
          link: "/action/colorPicker",
        },
        {
          subTitle: "Loading...",
          link: "/action/laodingAct",
        },
        {
          subTitle: "pinia-todo...",
          link: "/action/piniaTodo",
        },
        {
          subTitle: "veeValidate",
          link: "/action/veeValidate",
        },
        {
          subTitle: "原生Swiper",
          link: "/action/useSwiper",
        },
        {
          subTitle: "組件寫法Swiper",
          link: "/action/useSwiper1",
        },
        {
          subTitle: "日曆",
          link: "/action/vCalendar",
        },
        {
          subTitle: "日期格式化",
          link: "/action/formatDate",
        },
        {
          subTitle: "驗證",
          link: "/action/veeValidate",
        },
        {
          subTitle: "sweetAlert",
          link: "/action/sweetAlert",
        },
       
        {
          subTitle: "nuxtIcon",
          link: "/action/nuxtIcon",
        },
      ],
    },
  ]);
  return { menu };
};
