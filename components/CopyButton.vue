<script setup>
import { ref } from "vue";

// 定義 props，允許設定按鈕顯示的文字
const props = defineProps({
  text: {
    type: String,
    default: "點擊複製這段文字",
  },
});

const isCopied = ref(false);

// 使用 clipboard API，並提供 HTTP 備用方案
const copyText = async (event) => {
  const textToCopy = event.target.textContent.trim(); // 取得按鈕內的文字

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.warn("clipboard API 不支援，使用備用方案:", err);
      copyTextFallback(textToCopy);
    }
  } else {
    console.warn("clipboard API 不支援，使用備用方案");
    copyTextFallback(textToCopy);
  }

  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 1500);
};

// 備用方案：使用 textarea + execCommand
const copyTextFallback = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};
</script>

<template>
  <button @click="copyText" class="copy-button">
    {{ text }}
  </button>
</template>

<style scoped>
.copy-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.3s;
  font-size: 16px;
}

.copy-button:hover {
  background-color: #45a049;
}
</style>
