export default defineNuxtPlugin((nuxtApp) => {
  console.log("在Plugin .server 只會在server操作,瀏覽器上看不到此console");
});
