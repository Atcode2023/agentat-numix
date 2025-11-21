import { defineStore } from 'pinia';

export const useUi = defineStore('ui', {
    state: () => ({
        isSettingsOpen: false as boolean,
    }),
    actions: {
        openSettings() {
            this.isSettingsOpen = true;
        },
        closeSettings() {
            this.isSettingsOpen = false;
        },
        setSettingsOpen(val: boolean) {
            this.isSettingsOpen = val;
        },
    },
});
