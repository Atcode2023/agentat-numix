import { defineStore } from 'pinia';
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export const useShareStore = defineStore('share', {
    state: () => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mainPaymentMethod: null as any,
        shareMessage: '',
        lastAmount: null as number | null,
        lastConverted: null as number | null,
        lastMode: 'dollar' as 'dollar' | 'bolivar',
        lastRateKey: 'usd' as string,
        lastRateValue: null as number | null,
    }),
    actions: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMainPaymentMethod(method: any) {
            this.mainPaymentMethod = method;
        },
        setShareMessage(message: string) {
            this.shareMessage = message;
        },
        setConversion(amount: number, converted: number, rateKey: string, rateValue: number, mode: 'dollar' | 'bolivar') {
            this.lastAmount = amount;
            this.lastConverted = converted;
            this.lastRateKey = rateKey;
            this.lastRateValue = rateValue;
            this.lastMode = mode;
        },
        clearShare() {
            this.mainPaymentMethod = null;
            this.shareMessage = '';
            this.lastAmount = null;
            this.lastConverted = null;
            this.lastRateKey = 'usd';
            this.lastRateValue = null;
            this.lastMode = 'dollar';
        },
    },
});
