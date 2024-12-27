<script setup>
const date = ref(new Date());
const dateRange = ref({
  start: new Date(2024, 11, 24),
  end: new Date(2024, 11, 26),
});
const isDark = ref(false);

const dateRange1 = ref({
  start: "",
  end: "",
});
const weekNumber = ref(2); //顯示 周一
</script>

<template>
  <div>
    <h1>VCalendar套件</h1>
    <div>
      <h2>只顯示日曆</h2>
      <VCalendar />
    </div>
    <div>
      <h2>選擇一個日期</h2>
      <VDatePicker v-model="date" />
      <p>選擇日期: {{ date }}</p>
    </div>

    <div>
      <h2>選擇區間</h2>
      <h3>起始日是今天</h3>
      <VDatePicker v-model="dateRange" is-range />
      <p>起始日 : {{ dateRange.start }}</p>
      <p>結束日:{{ dateRange.end }}</p>
    </div>

    <div class="date-picker">
      <h1>使用自訂顏色+周一開始+多欄列</h1>
      <VDatePicker
        v-model="dateRange1"
        is-range
        color="sky-blue"
        class="my-calendar"
        :first-day-of-week="weekNumber"
        :columns="2"
      />
      <p>起始日 : {{ dateRange1.start }}</p>
      <p>結束日:{{ dateRange1.end }}</p>
    </div>
    <div class="hit">
      <p>使用檔案: plugin/vCalendar.js</p>
      <p>使用技巧: VCalendar</p>
    </div>
  </div>
</template>

<style lang="scss">
.hit {
  background-color: pink;
  padding: 15px;
  p {
    font-size: 18px;
  }
}
/*六日標題為紅色*/
.my-calendar .vc-weekday-1,
.my-calendar .vc-weekday-7 {
  color: red;
}
/*自訂顏色*/
.vc-sky-blue {
  --vc-accent-50: #f0f9ff;
  --vc-accent-100: #e0f2fe;
  --vc-accent-200: #bae6fd;
  --vc-accent-300: #7dd3fc;
  --vc-accent-400: #38bdf8;
  --vc-accent-500: #0ea5e9;
  --vc-accent-600: #0284c7;
  --vc-accent-700: #0369a1;
  --vc-accent-800: #075985;
  --vc-accent-900: #0c4a6e;
}
</style>
