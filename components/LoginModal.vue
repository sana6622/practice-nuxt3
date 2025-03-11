<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>🔑 Google 登入</h2>
      <p>請點擊按鈕登入您的 Google 帳戶</p>
      <button @click="loginWithGoogle">使用 Google 登入</button>
      <button class="close-btn" @click="closeModal">取消</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  show: Boolean, // 控制彈窗是否顯示
});

const emit = defineEmits(["close", "login"]);

const loginWithGoogle = () => {
  emit("login"); // 觸發父元件登入邏輯
};

const closeModal = () => {
  emit("close"); // 關閉彈窗
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

button {
  margin: 10px;
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #357ae8;
}

.close-btn {
  background-color: #ccc;
  color: black;
}
</style>
