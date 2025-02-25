<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";
import { ElMessage } from "element-plus";
const props = defineProps({
  modelValue: String,
  type: {
    type: String,
    default: "text", // 可選 'coordinate' 或 'address'
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "請輸入",
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  maxLength: {
    type: Number,
    default: 50,
  },
});

const emit = defineEmits(["update:modelValue"]);
const inputValue = ref(props.modelValue || "");

// 🔹 定義坐標數字驗證的正則表達式
const regx = reactive({
  coordinate: /^-?\d*\.?\d{0,6}$/, // 經緯度格式
});

// 🔹 格式化函數 (只允許數字、負號、小數點)
const formatCoordinate = (value) => {
  let originalVal = value; // 記錄原始輸入
  value = value.replace(/[^0-9.-]/g, ""); // 只允許數字、小數點、負號

  // 🔸 確保負號只能出現在開頭
  if (value.includes("-")) {
    value = "-" + value.replace(/-/g, "");
  }

  // 🔸 確保只能有一個小數點
  if (value.split(".").length > 2) {
    value = value.split(".")[0] + "." + value.split(".").slice(1).join("");
  }

  // 🔸 限制小數點後最多 6 位
  value = value.replace(/(\.\d{6})\d+/, "$1");

  // 🛑 如果輸入內容被修改，則顯示警告
  if (originalVal !== value) {
    ElMessage.warning("請輸入正確的經緯度格式");
  }

  return value;
};

// 🔹 `computed()` 用來即時格式化輸入
const formattedValue = computed({
  get: () => inputValue.value,
  set: (val) => {
    if (props.type === "coordinate") {
      val = formatCoordinate(val); // 使用格式化函數
    }
    inputValue.value = val;
  },
});
</script>

<template>
  <div class="input-container" :class="{ disabled }">
    <label v-if="label" class="input-label"
      >{{ label }} <span v-if="required">*</span></label
    >
    <input
      v-model="formattedValue"
      :type="type === 'coordinate' ? 'text' : 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength"
      class="input-field"
    />
  </div>
</template>

<style scoped>
.input-container {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  padding: 8px;
  border: 1px solid #dad5c4;
  border-radius: 8px;
  transition: border 0.3s ease-in-out;
  background: #fff;
}

.input-container.disabled {
  background: #f5f5f5;
  border-color: #ddd;
  pointer-events: none;
}

.input-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.input-field {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: none;
  outline: none;
  background: transparent;
}

.input-field::placeholder {
  color: #bbb;
}
</style>
