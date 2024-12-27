<script setup>
const { $hello, $hello1 } = useNuxtApp();
const name = ref("");
</script>

<template>
  <div>
    <h1>plugin provide 使用</h1>
    <p>{{ $hello("Yetta") }}</p>
    <p>{{ $hello1("Yetta") }}</p>

    <div>
      <label for="">姓名:</label>
      <input type="text " v-model="name" placeholder="請輸入姓名" />
      <span v-if="name">{{ $hello(name) }}</span>
    </div>

    <div class="hit">
      <p>使用檔案: plugin/provideUse.js</p>
      <p>使用技巧:</p>
      <ul>
        <li>plugin provide 注入</li>
        <li>使用時要記得加 $ 字號</li>
        <li>const { $xxx} = useNuxtApp();</li>
      </ul>
    </div>
  </div>
</template>
