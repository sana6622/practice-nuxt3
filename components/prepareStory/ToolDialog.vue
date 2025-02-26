<script setup>
import { useWindowSize } from "@vueuse/core"; //監聽視窗大小的變化
import { windowStore } from "@/stores/prepareMap.js";
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  txt: {
    type: String,
    default: "",
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["close"]);
const { width } = useWindowSize();

const window = windowStore();

const showToolDialog = ref(false);

function slideWindow() {
  window.hide = !window.hide;
}
</script>
<template>
  <!-- <div class="mapToolWindow" :class="{ show: !window.hide }"> -->
  <div class="mapToolWindow">
    <div class="toolTitle">
      {{ title }}
      <div class="toolBtnGp">
        <ClientOnly>
          <span
            v-show="width < 1366"
            class="slideBtn"
            :class="{ open: window.hide === false }"
            @click="slideWindow"
            ><img
              src="~/assets/img/slideDown.svg"
              width="20px"
              height="20px"
              alt=""
          /></span>
        </ClientOnly>
        <span class="closeBtn" @click="emit('close')"
          ><img src="~/assets/img/close.svg" width="20px" height="20px" alt=""
        /></span>
      </div>
    </div>
    <div class="toolContent">
      <slot name="toolCont" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "../../assets/_variable.scss";
.mapToolWindow {
  position: absolute;
  top: 100px;
  left: 400px;
  width: 300px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0px 20px 20px 0px #596a7d0f;
  // @include pad {
  //   top: unset;
  //   right: unset;
  //   left: 0;
  //   bottom: 45px;
  //   width: 100%;
  //   z-index: 11;
  //   border-radius: 10px 10px 0 0;
  //   box-shadow: inset 0px 0px 0px 1px #d8d6d0;
  //   box-sizing: border-box;
  //   max-width: 100%;
  //   transition: all 0.3s ease-in-out;
  //   transform: translateY(calc(100% - 50px));
  //   &.show {
  //     transform: translateY(0);
  //   }
  // }
  .toolTitle {
    // @include setFont(20px, 40px, 500);
    color: $MainBrown;
    padding: 5px 20px;
    border-bottom: 1px solid #e5dfd1;
    box-sizing: border-box;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 20px;
    font-weight: 700;
    // @include mobile {
    //   @include setFont(20px, 40px, 700);
    // }
    .toolBtnGp {
      display: flex;
      gap: 10px;
      span {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        img {
          transform: scale(0.8);
        }
      }
      .slideBtn {
        transform: rotate(-180deg);
        transition: all 0.3s ease-in-out;
        &.open {
          transform: rotate(0deg);
        }
      }
    }
  }
  .toolContent {
    padding: 20px;
    box-sizing: border-box;

    // @include pad {
    //   padding: 10px 20px 20px 20px;
    //   transition: all 0.3s ease-in;
    //   height: 100%;
    //   &.hide {
    //     height: 0;
    //   }
    // }
  }
}
</style>
