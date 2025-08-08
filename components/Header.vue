<script setup>
import { ref, nextTick, watch, onBeforeUnmount } from 'vue';

const { menu } = useMenu();

// 手機：全畫面覆蓋
const isOpen = ref(false);
const toggleMenu = () => (isOpen.value = !isOpen.value);
watch(isOpen, (v) => {
  if (process.client) document.body.style.overflow = v ? 'hidden' : '';
});
onBeforeUnmount(() => {
  if (process.client) document.body.style.overflow = '';
});

// 桌機：第一層 hover 控制
const openIdx = ref(null);
let closeTimer = null;
const clearCloseTimer = () => {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
};
const scheduleClose = () => {
  clearCloseTimer();
  closeTimer = window.setTimeout(() => (openIdx.value = null), 120);
};

const onTitleEnter = (idx, e) => {
  clearCloseTimer();
  openIdx.value = idx;
  nextTick(() => positionSubmenu(e.currentTarget));
};
const onTitleLeave = () => scheduleClose();
const onSubmenuEnter = () => clearCloseTimer();
const onSubmenuLeave = () => scheduleClose();

// 量測定位第一層子選單，避免溢出右邊與首次閃動
const positionSubmenu = (titleEl) => {
  const submenuEl = titleEl.querySelector('.submenu');
  if (!submenuEl) return;

  submenuEl.style.visibility = 'hidden';
  submenuEl.style.display = 'block';

  const rect = titleEl.getBoundingClientRect();
  submenuEl.style.position = 'fixed';
  submenuEl.style.top = Math.round(rect.bottom) + 'px';
  submenuEl.style.left = Math.round(rect.left) + 'px';
  submenuEl.style.minWidth = Math.max(220, Math.round(rect.width)) + 'px';
  submenuEl.style.maxWidth = 'min(90vw, 720px)';

  const m = submenuEl.getBoundingClientRect();
  const overshoot = m.right - window.innerWidth;
  if (overshoot > 0) submenuEl.style.left = Math.max(8, m.left - overshoot - 8) + 'px';

  submenuEl.style.visibility = 'visible';
};
</script>

<template>
  <header class="header">
    <h1 class="logo"><nuxt-link to="/">Nuxt3</nuxt-link></h1>

    <!-- 漢堡 -->
    <button class="hamburger" :class="{ open: isOpen }" @click="toggleMenu" aria-label="切換選單">
      <span class="hamburger-line"></span>
    </button>

    <!-- 桌機 -->
    <ul class="menu-lg">
      <li
        v-for="(item, idx) in menu"
        :key="item.title"
        class="menu-title"
        @mouseenter="onTitleEnter(idx, $event)"
        @mouseleave="onTitleLeave"
        :class="{ 'is-open': openIdx === idx }"
      >
        <nuxt-link :to="item.link || '#'" class="title-link">{{ item.title }}</nuxt-link>

        <!-- 子選單（只有卷軸、不分欄；第三層在第二層下方展開） -->
        <div
          v-if="item.sub?.length"
          class="submenu"
          v-show="openIdx === idx"
          @mouseenter="onSubmenuEnter"
          @mouseleave="onSubmenuLeave"
        >
          <el-scrollbar max-height="70vh">
            <ul class="submenu-list">
              <li v-for="sub in item.sub" :key="sub.subTitle" class="submenu-item">
                <!-- 二層：有 link 一律 nuxt-link（即使同時有 children 也能點） -->
                <nuxt-link v-if="sub.link" :to="sub.link" class="submenu-2-trigger">{{
                  sub.subTitle
                }}</nuxt-link>
                <span v-else class="submenu-2-trigger">{{ sub.subTitle }}</span>

                <!-- 第三層：直向展開在二層下方（只卷軸） -->
                <div v-if="sub.children?.length" class="submenu-2">
                  <el-scrollbar max-height="50vh">
                    <ul>
                      <li
                        v-for="leaf in sub.children"
                        :key="leaf.title || leaf.subTitle"
                        class="submenu-3-item"
                      >
                        <nuxt-link :to="leaf.link">{{ leaf.title ?? leaf.subTitle }}</nuxt-link>
                      </li>
                    </ul>
                  </el-scrollbar>
                </div>
              </li>
            </ul>
          </el-scrollbar>
        </div>
      </li>
    </ul>

    <!-- 手機：全畫面覆蓋 -->
    <Teleport to="body">
      <transition name="fade">
        <div v-show="isOpen" class="m-overlay" @click.self="isOpen = false">
          <nav class="m-panel" aria-label="Mobile Menu">
            <button class="m-close" @click="isOpen = false" aria-label="關閉">×</button>
            <ul>
              <li v-for="item in menu" :key="item.title" class="m-item">
                <details>
                  <summary>
                    <nuxt-link :to="item.link || '#'" @click="isOpen = false">{{
                      item.title
                    }}</nuxt-link>
                  </summary>

                  <ul v-if="item.sub?.length">
                    <li v-for="sub in item.sub" :key="sub.subTitle" class="m-sub">
                      <details v-if="sub.children?.length">
                        <summary>
                          <span class="m-subtitle">{{ sub.subTitle }}</span>
                        </summary>
                        <ul>
                          <li v-for="leaf in sub.children" :key="leaf.title || leaf.subTitle">
                            <nuxt-link :to="leaf.link" @click="isOpen = false">{{
                              leaf.title ?? leaf.subTitle
                            }}</nuxt-link>
                          </li>
                        </ul>
                      </details>
                      <nuxt-link v-else :to="sub.link" @click="isOpen = false">{{
                        sub.subTitle
                      }}</nuxt-link>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </nav>
        </div>
      </transition>
    </Teleport>
  </header>
</template>

<style lang="scss">
.header {
  position: relative;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
  overflow-x: hidden;

  .logo a {
    text-decoration: none;
    color: #333;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* 桌機：大標題橫排 */
  .menu-lg {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
  }
  .menu-title .title-link {
    text-decoration: none;
    color: #333;
    padding: 8px 10px;
    display: inline-block;
    border-radius: 6px;
    &:hover {
      background: #f5f7fa;
    }
  }

  /* 子選單（第一層浮出） */
  .submenu {
    /* 位置由 JS 設定為 fixed + 座標 */
    background: #fff;
    border: 1px solid #eee;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
    padding: 8px;
    border-radius: 8px;
    min-width: 220px;
    max-width: min(90vw, 720px);
    z-index: 1100;

    .el-scrollbar__wrap {
      overflow-x: hidden !important;
    }
    .el-scrollbar__view {
      overflow: visible !important;
    }

    .submenu-list {
      display: block;
    }

    .submenu-item {
      position: relative;
      padding: 4px 0;

      .submenu-2-trigger {
        display: block;
        padding: 8px 10px;
        border-radius: 6px;
        color: #333;
        text-decoration: none;
        &:hover {
          background: #f5f7fa;
        }
      }

      /* 第三層：在第二層下方展開（只捲動，不分欄） */
      .submenu-2 {
        margin-top: 6px;
        margin-left: 4px;
        padding-left: 10px;
        border-left: 2px solid #f0f0f0;
        background: #fff;
        border-radius: 6px;

        .el-scrollbar__wrap {
          overflow-x: hidden !important;
        }

        .submenu-3-item > a {
          display: block;
          padding: 8px 10px;
          border-radius: 6px;
          text-decoration: none;
          color: #333;
          &:hover {
            background: #f5f7fa;
          }
        }
      }
    }
  }

  /* 漢堡按鈕 */
  .hamburger {
    display: none;
    margin-left: auto;
    width: 44px;
    height: 44px;
    position: relative;
    border: 0;
    background: transparent;
    cursor: pointer;
    .hamburger-line {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 28px;
      height: 3px;
      background: #333;
      border-radius: 2px;
      &::before,
      &::after {
        content: '';
        position: absolute;
        left: 0;
        width: 28px;
        height: 3px;
        background: #333;
        border-radius: 2px;
      }
      &::before {
        top: -8px;
      }
      &::after {
        top: 8px;
      }
    }
    &.open .hamburger-line {
      background: transparent;
    }
    &.open .hamburger-line::before {
      transform: translateY(8px) rotate(45deg);
    }
    &.open .hamburger-line::after {
      transform: translateY(-8px) rotate(-45deg);
    }
  }

  /* 手機：全畫面覆蓋面板 */
  .m-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    justify-content: flex-end;
  }
  .m-panel {
    width: min(86vw, 420px);
    height: 100%;
    background: #fff;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.12);
    padding: 16px;
    overflow-y: auto;
    position: relative;
    animation: slideIn 0.18s ease;
  }
  @keyframes slideIn {
    from {
      transform: translateX(10px);
      opacity: 0;
    }
    to {
      transform: none;
      opacity: 1;
    }
  }
  .m-close {
    position: absolute;
    top: 8px;
    right: 10px;
    width: 36px;
    height: 36px;
    border: 0;
    background: transparent;
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
  }
  .m-panel a {
    text-decoration: none;
    color: #333;
  }
  .m-item {
    padding: 6px 0;
  }
  .m-sub {
    padding-left: 12px;
  }
  details > summary {
    list-style: none;
    cursor: pointer;
  }
  details > summary::-webkit-details-marker {
    display: none;
  }
  .m-subtitle {
    display: inline-block;
    padding: 6px 0;
    color: #333;
  }

  /* 轉場 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.12s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  @media (max-width: 768px) {
    .menu-lg {
      display: none;
    }
    .hamburger {
      display: inline-block;
    }
  }
}
</style>

