<script setup>
const toggle = ref(false);

const clickHandler = () => {
  toggle.value = !toggle.value;
};

const customizeStar = (content, name, prefix, provider) => {
  // console.log("Customize123 called with:", { content, name, prefix, provider });
  // if (prefix !== "tabler") return content; // Ignore Prefix

  return content
    .replace(/stroke-width="[^"]*"/g, `stroke-width="2"`) // Change stroke width to 2
    .replace(/stroke="[^"]*"/g, `stroke="#FF5733"`) // Change stroke color to red
    .replace(/fill="[^"]*"/g, `fill="yellow"`) // Change fill color to red
    .replace(/animation-duration="[^"]*"/g, `animation-duration="3s"`) // Change animation duration to 1s (for animated icons)
    .replace(/opacity="[^"]*"/g, `opacity="0.8"`); // Change opacity to 0.8
};
</script>
<template>
  <div class="nuxt-icon">
    <Icon name="ph:arrow-down-duotone" size="40" style="color: red" />
    <Icon
      name="line-md:chat-round-dots-filled"
      size="24"
      style="color: green"
    ></Icon>
    <Icon
      name="line-md:cellphone-arrow-down-twotone"
      size="42"
      style="color: green"
    ></Icon>

    <Icon
      name="line-md:cellphone-arrow-up-twotone"
      size="42"
      style="color: blue"
    ></Icon>

    <div @click="clickHandler">
      <span>這是動態切換</span>
      <Icon
        :name="
          toggle
            ? 'line-md:cellphone-arrow-up-twotone'
            : 'line-md:cellphone-arrow-down-twotone'
        "
        size="42"
        :style="toggle ? 'color: blue' : 'color:red'"
      ></Icon>
    </div>
    <div>
      <span>
        <Icon name="tabler:star" size="100" :customize="customizeStar"
      /></span>
      <span> <Icon name="tabler:jewish-star" size="100" /></span>
    </div>

    <div class="hit">
      <p>可使用的icon資料庫:https://icones.js.org/</p>
      <p>使用技巧:</p>
      <ul>
        <li>安裝: npx nuxi module add icon</li>
        <li>
          例: Icon name="ph:arrow-down-duotone" size="40" style="color: red"
        </li>
        <li>name:icon 名稱</li>
        <li>size: 可調整大小</li>
        <li>style="color:blue" 可調顏色</li>
      </ul>
    </div>
  </div>
</template>
