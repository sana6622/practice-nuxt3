<script setup>
//  Swiper JS 核心功能
import Swiper from "swiper";

// Swiper 模組
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Swiper 核心與模組的樣式
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
const swiperRef = ref(null);

onMounted(() => {
  new Swiper(swiperRef.value, {
    loop: true, // 開啟循環模式
    slidesPerView: 1, // 預設每次顯示 1 個輪播
    breakpoints: {
      // 992px 以上套用響應式斷點設定
      992: {
        slidesPerView: 2, // 在 992px 以上顯示 2 個輪播
        spaceBetween: 20, // 輪播之間的間距為 20px
      },
    },
    // 設定頁碼模組的功能 ( 需要搭配 Pagination 模組使用 )
    pagination: {
      el: ".swiper-pagination", // 頁碼操作的元素
      type: "bullets", //  頁碼的外觀
    },
    // 設定導航模組的功能 ( 需要搭配 Navigation 模組使用 )
    navigation: {
      nextEl: ".swiper-button-next", // 下一個按鈕操作的元素
      prevEl: ".swiper-button-prev", // 上一個按鈕操作的元素
    },
    autoplay: { delay: 1000 }, // 自動輪播，延遲 1000 毫秒
    modules: [Navigation, Pagination, Autoplay], // 載入輪播需要用到的模組
  });
});
</script>

<template>
  <div>
    <h1>swiper原生html 寫法</h1>
    <!-- Swiper 的容器 -->
    <div class="swiper" ref="swiperRef">
      <!-- 放置所有的輪播內容 -->
      <div class="swiper-wrapper">
        <!-- 每個 swiper-slide 都是一個輪播內容 -->
        <div class="swiper-slide">
          <img
            src="https://images.unsplash.com/photo-1636909798741-42d59f0265b0?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="圖片一"
          />
        </div>
        <div class="swiper-slide">
          <img
            src="https://images.unsplash.com/photo-1516007146048-bfcffccbc95c?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="圖片二"
          />
        </div>
        <div class="swiper-slide">
          <img
            src="https://images.unsplash.com/photo-1516007112993-555f24caca6d?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="圖片三"
          />
        </div>
      </div>

      <!-- 有使用 Pagination 模組必需要加入 -->
      <div class="swiper-pagination"></div>

      <!-- 有使用 Navigation 模組必需要加入 -->
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
  </div>
</template>

<style scoped></style>
