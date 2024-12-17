<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";

// Swiper 核心與模組的樣式
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const modules = [Navigation, Pagination];
</script>

<template>
  <div class="swiper1">
    <h1>swiper組件化 + 自訂樣式</h1>
    <div class="swiper-container">
      <Swiper
        :slides-per-view="1"
        :space-between="30"
        :keyboard="{
          enabled: true,
        }"
        :pagination="{
          clickable: true,
        }"
        :navigation="true"
        :modules="modules"
        class="mySwiper"
      >
        <SwiperSlide>
          <div class="box">
            <img
              src="https://images.unsplash.com/photo-1636909798741-42d59f0265b0?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="圖片一"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div class="box">
            <img
              src="https://images.unsplash.com/photo-1516007146048-bfcffccbc95c?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="圖片二"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide><div class="box">Slide 3</div></SwiperSlide>
        <SwiperSlide><div class="box">Slide 3</div></SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<style lang="scss">
.swiper1 {
  .box {
    width: 300px;
    height: 200px;
    background-color: pink;
    margin: 0 auto;
    img {
      width: 100%;
    }
  }
  .swiper-container {
    width: 100%; /* 可以調整這裡來增加或減少 Swiper 容器的寬度 */
    height: auto;
    position: relative;
    margin: 0 auto; /* 居中 */
  }

  .swiper-button-prev,
  .swiper-button-next {
    z-index: 99;
    background-color: rgb(128, 86, 10);
    border-radius: 50%;
    border-color: rgb(128, 86, 10);
    border: 0;
    width: 60px;
    height: 60px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    pointer-events: auto;
  }

  .swiper-button-prev:after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 12px solid #fff;
    margin: auto;
  }
  .swiper-button-next:after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 12px solid #fff;
    margin: auto;
  }

  .swiper {
    --swiper-pagination-color: #e44d7f;
    --swiper-pagination-bullet-inactive-color: #ffffff; //還未滑到時點點的顏色
    --swiper-pagination-bullet-size: 14px;
    --swiper-pagination-bullet-width: 14px;
    --swiper-pagination-bullet-height: 14px;
    --swiper-pagination-bullet-horizontal-gap: 15px; /* 點點之間的水平間距 */
  }
}
</style>
