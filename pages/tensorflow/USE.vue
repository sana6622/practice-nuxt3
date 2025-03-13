<script setup>
import { onMounted, ref } from "vue";
import { useNuxtApp } from "#app";

const sentenceEmbedding = ref(null);
const template = ref("How are you feeling today?"); // 基準句
const candidate1 = ref("What is captial of China?");
const candidate2 = ref("I'm not feeling very well.");
const candidate3 = ref("Beijing is the capital of China.");
const candidate4 = ref("You have five fingers on your hand.");
const answer = ref("");

// 動態載入 Universal Sentence Encoder
let model = null;

// 計算相似度
// const myFunction = async () => {
//   console.log("計算");
//   if (!model) {
//     console.log(1);
//     answer.value = "模型尚未載入，請稍候...";
//     return;
//   }
//   // console.log(2);

//   // const input = {
//   //   queries: [template.value],
//   //   responses: [
//   //     candidate1.value,
//   //     candidate2.value,
//   //     candidate3.value,
//   //     candidate4.value,
//   //   ],
//   // };
//   // console.log("111111111input", input);

//   answer.value = "計算中...";

//   // 嵌向量計算
//   const embeddings = await model.embed([
//     template.value,
//     candidate1.value,
//     candidate2.value,
//     candidate3.value,
//     candidate4.value,
//   ]);
//   console.log("embeddings", embeddings);

//   // 擷取嵌向量
//   const embedQuery = embeddings["queryEmbedding"].arraySync();
//   console.log("embed", embedQuery);
//   const embedResponses = embeddings["responseEmbedding"].arraySync();
//   console.log("embedRes", embedResponses);

//   // 計算相似度
//   let scores = input.responses.map((_, i) =>
//     dotProduct(embedQuery[0], embedResponses[i])
//   );

//   // 取得最高相似度的候選句
//   let maxIndex = scores.indexOf(Math.max(...scores));

//   answer.value = `最佳答案: ${input.responses[maxIndex]} (相似度: ${scores[
//     maxIndex
//   ].toFixed(4)})`;
// };
const myFunction = async () => {
  console.log("計算");

  if (!model) {
    console.log("❌ 模型尚未載入");
    answer.value = "模型尚未載入，請稍候...";
    return;
  }

  console.log("✅ 模型已載入，開始計算");

  const sentences = [
    template.value,
    candidate1.value,
    candidate2.value,
    candidate3.value,
    candidate4.value,
  ];

  answer.value = "計算中...";

  // 嵌向量計算
  const embeddings = await model.embed(sentences);
  console.log("嵌向量結果:", embeddings);

  if (!embeddings) {
    console.error("❌ 無法取得嵌向量！");
    return;
  }

  const embedArray = embeddings.arraySync();
  const embedQuery = embedArray[0]; // 第一個是查詢
  const embedResponses = embedArray.slice(1); // 其餘是候選句

  // 計算相似度
  let scores = embedResponses.map((response) =>
    dotProduct(embedQuery, response)
  );

  // 取得最高相似度的候選句
  let maxIndex = scores.indexOf(Math.max(...scores));

  answer.value = `最佳答案: ${sentences[maxIndex + 1]} (相似度: ${scores[
    maxIndex
  ].toFixed(4)})`;
};

// 內積計算相似度
const dotProduct = (xs, ys) => xs.reduce((sum, x, i) => sum + x * ys[i], 0);

onMounted(async () => {
  if (process.server) return; // 確保只在 Client 端執行

  console.log("載入 Universal Sentence Encoder...");

  const use = await import("@tensorflow-models/universal-sentence-encoder"); // 改成動態匯入
  model = await use.load({
    modelUrl: "/models/universal-sentence-encoder/model.json", // 本地模型路徑
  });
  console.log("model", model);

  console.log("模型載入成功！");

  // 測試句子嵌入
  const sentences = ["你好", "這是一個測試句子"];
  const embeddings = await model.embed(sentences);

  sentenceEmbedding.value = await embeddings.array();
  console.log("文字嵌入結果：", sentenceEmbedding.value);
});
</script>
<template>
  <div>
    <h1>文字比對(英文)</h1>
    <div v-if="sentenceEmbedding">
      <!-- <pre>{{ sentenceEmbedding }}</pre> -->
    </div>
    <label>基準句:</label>
    <input v-model="template" type="text" placeholder="輸入基準句" />

    <label>候選句 1:</label>
    <input v-model="candidate1" type="text" placeholder="輸入候選句 1" />

    <label>候選句 2:</label>
    <input v-model="candidate2" type="text" placeholder="輸入候選句 2" />

    <label>候選句 3:</label>
    <input v-model="candidate3" type="text" placeholder="輸入候選句 3" />

    <label>候選句 4:</label>
    <input v-model="candidate4" type="text" placeholder="輸入候選句 4" />

    <button @click="myFunction">計算相似度</button>

    <p>{{ answer }}</p>
    <div class="hit">
      <p>使用 tensorflow.client.js檔</p>
      <p>
        下載到本地端
        https://www.kaggle.com/models/tensorflow/universal-sentence-encoder
      </p>
    </div>
  </div>
</template>
<style scoped>
.container {
  max-width: 600px;
  margin: auto;
  text-align: center;
}
input {
  display: block;
  width: 100%;
  margin: 8px 0;
  padding: 8px;
}
button {
  margin-top: 12px;
  padding: 10px 20px;
  background: #42b883;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
