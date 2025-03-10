export default defineEventHandler((event) => {
  console.log("1111 登入呼叫google");
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
  console.log("22222", GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI);

  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing Google OAuth credentials",
    });
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;

  return sendRedirect(event, googleAuthUrl);
});
