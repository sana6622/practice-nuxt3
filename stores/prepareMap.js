import { defineStore } from "pinia";

export const windowStore = defineStore("window", {
  state: () => ({
    hide: false,
    active: "",
  }),
});
