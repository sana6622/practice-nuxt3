<template>
  <div>
    <h1>Nuxt3 與 OpenAI 互動範例 (還沒申請openAI key)</h1>
    <form @submit.prevent="sendMessage">
      <textarea
        v-model="userMessage"
        rows="5"
        placeholder="請輸入您的訊息"
      ></textarea>
      <br />
      <button type="submit">發送</button>
    </form>
    <div v-if="aiResponse">
      <h2>回覆：</h2>
      <pre>{{ aiResponse }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const userMessage = ref("");
const aiResponse = ref("");

const sendMessage = async () => {
  try {
    // 呼叫我們後端的 API 路由 (在 server/api/openai.ts)
    const { data, error } = await useFetch("/api/openai", {
      method: "POST",
      body: { message: userMessage.value },
    });

    if (error.value) {
      aiResponse.value = "錯誤：" + error.value.message;
    } else {
      // 根據 OpenAI API 回傳的資料，取出回覆內容
      aiResponse.value = data.value.choices[0].message.content;
    }
  } catch (err) {
    aiResponse.value = "錯誤：" + err.message;
  }
};
</script>
