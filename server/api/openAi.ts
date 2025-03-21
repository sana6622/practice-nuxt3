// server/api/openai.ts
import { defineEventHandler, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userText = body.message;

  // 組合老師的提示邏輯，並要求模型回覆不要超過20個中文字
  const prompt = `
以小於20個中文字回答問題：
;;;${userText};;;
  `;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("未設定 OpenAI API 金鑰");
  }

  // 呼叫 OpenAI 的 API，並設置 max_tokens 參數限制回覆 token 數
  const result = await $fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 30, // 可根據需求調整，此處設定最大輸出 token 數
    },
  });

  return result;
});
