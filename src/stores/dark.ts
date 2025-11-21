import { defineStore } from 'pinia';

export const useDark = defineStore('dark', {
  state: () => ({
    isDarkMode: false,
  }),
  actions: {
    setDark() {
      this.isDarkMode = !this.isDarkMode;
      console.log('this.isDarkMode: ', this.isDarkMode);
    },
  },
});
