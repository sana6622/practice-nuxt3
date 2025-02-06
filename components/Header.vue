<script setup>
const { menu } = useMenu();
const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
  console.log("isOpen", isOpen.value);
};
onMounted(() => {});
</script>

<template>
  <div class="header">
    <h1><nuxtLink to="/">Nuxt3</nuxtLink></h1>
    <button class="hamburger" :class="{ open: isOpen }" @click="toggleMenu">
      <div class="hamburger-line"></div>
    </button>

    <ul class="menu-lg">
      <li v-for="item in menu" :key="item.title" class="menu-title">
        <nuxt-link :to="item.link">{{ item.title }}</nuxt-link>
        <ul v-if="item.sub?.length > 0">
          <li v-for="el in item.sub" :key="el.subTitle">
            <nuxt-link :to="el.link">{{ el.subTitle }}</nuxt-link>
          </li>
        </ul>
      </li>
    </ul>

    <ul class="menu-sm">
      <li v-for="item in menu" :key="item.title" class="menu-title">
        <nuxt-link :to="item.link">{{ item.title }}</nuxt-link>
        <ul v-if="item.sub?.length > 0">
          <li v-for="el in item.sub" :key="el.subTitle">
            <nuxt-link :to="el.link">{{ el.subTitle }}</nuxt-link>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.header {
  display: flex;
  ul {
    list-style-type: none;
    a {
      text-decoration: none;
    }
  }

  .menu-sm {
    display: none;
  }
  .menu-lg {
    display: flex;
    li {
      margin-right: 10px;
    }
  }
  .hamburger {
    display: none;
  }
  @media (max-width: 768px) {
    .hamburger {
      display: block;
      background-color: pink;
      width: 50px;
      height: 50px;
      position: relative;
      padding: 0;
      padding-left: 6px;

      .hamburger-line {
        width: 35px;
        height: 5px;
        background-color: #d36d6d;
        border-radius: 2px;
        &::before,
        &::after {
          content: "";
          width: 35px;
          height: 5px;
          border-radius: 2px;
          position: absolute;
          background-color: #d36d6d;
        }
        &::before {
          top: 5px;
          left: 6px;
        }
        &::after {
          bottom: 5px;
          left: 6px;
        }
      }
    }
    .open {
      .hamburger-line {
        width: 35px;
        height: 5px;
        background-color: transparent;
        border-radius: 2px;
        &::before {
          transform: rotate(45deg) translateY(11px) translateX(13px);
        }
        &::after {
          transform: rotate(-45deg) translateY(-11px) translateX(12px);
        }
      }
    }

    .menu-lg {
      display: none;
    }
    .menu-sm {
      display: flex;
      flex-direction: row;
      .menu-title {
        margin-right: 20px;
      }
    }
  }
}
</style>
