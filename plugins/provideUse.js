export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      hello: (mes) => `Hello ${mes}`,
      hello1: (mes) => `這是第二個provide: ${mes}`,
    },
  };
});
