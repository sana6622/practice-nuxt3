import { defineEventHandler, getQuery, createError, sendRedirect } from "h3";
import { $fetch } from "ofetch";

export default defineEventHandler(async (event) => {
  console.log("✅3333 Google Callback API 被呼叫");

  const query = getQuery(event);
  const code = query.code as string;

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Authorization code is missing",
    });
  }

  // Google OAuth 憑證
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

  try {
    // 交換 OAuth Token
    const tokenResponse = await $fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      },
    });

    const { access_token, id_token } = tokenResponse;

    // 取得 Google 使用者資訊
    const userInfo = await $fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    console.log("33333 使用者登入成功:", userInfo);

    // ✅ 將使用者資訊放入 URL，並導向 `loginSuccess`
    const userParams = new URLSearchParams({
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      token: id_token, // 如果需要 token
    }).toString();

    // ✅ 登入成功後導向 loginSuccess 頁面，並帶上 token
    return sendRedirect(event, `/action/loginSuccess?${userParams}`);
    // return {
    //   success: true,
    //   user: {
    //     id: userInfo.id,
    //     email: userInfo.email,
    //     name: userInfo.name,
    //     picture: userInfo.picture,
    //   },
    //   token: id_token,
    // };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to authenticate",
    });
  }
});
