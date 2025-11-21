import { defineStore } from 'pinia';

export type QuickAmount = number;

interface SettingsState {
    quick_amounts_dollar: QuickAmount[];
    quick_amounts_bolivar: QuickAmount[];
    product_limit: number;
}

const DOLLAR_DEFAULTS: QuickAmount[] = [1, 5, 10, 20, 50, 100];
const BOLIVAR_DEFAULTS: QuickAmount[] = [100, 500, 1000, 2000, 5000, 10000];

const LS_KEY = 'settings.v2';
const PRODUCT_LIMIT_DEFAULT = 5;

function loadFromLocalStorage(): SettingsState | null {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed) return null;
        const dollar = Array.isArray(parsed.quick_amounts_dollar)
            ? parsed.quick_amounts_dollar
            : DOLLAR_DEFAULTS;
        const bolivar = Array.isArray(parsed.quick_amounts_bolivar)
            ? parsed.quick_amounts_bolivar
            : BOLIVAR_DEFAULTS;
        const limitRaw = Number(parsed.product_limit);
        const limit = Number.isFinite(limitRaw)
            ? Math.max(1, Math.min(20, Math.floor(limitRaw)))
            : PRODUCT_LIMIT_DEFAULT;
        return {
            quick_amounts_dollar: sanitizeList(dollar),
            quick_amounts_bolivar: sanitizeList(bolivar),
            product_limit: limit,
        };
    } catch {
        return null;
    }
}

function persistToLocalStorage(state: SettingsState): void {
    const payload: SettingsState = {
        quick_amounts_dollar: sanitizeList(state.quick_amounts_dollar),
        quick_amounts_bolivar: sanitizeList(state.quick_amounts_bolivar),
        product_limit: Math.max(1, Math.min(20, Math.floor(state.product_limit || PRODUCT_LIMIT_DEFAULT))),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
}

function sanitizeList(list: unknown): QuickAmount[] {
    return (Array.isArray(list) ? list : [])
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v) && v > 0)
        .map((v) => Math.round(v * 100) / 100)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .sort((a, b) => a - b);
}

export const useSettings = defineStore('settings', {
    state: (): SettingsState =>
        loadFromLocalStorage() || {
            quick_amounts_dollar: [...DOLLAR_DEFAULTS],
            quick_amounts_bolivar: [...BOLIVAR_DEFAULTS],
            product_limit: PRODUCT_LIMIT_DEFAULT,
        },
    actions: {
        setQuickAmountsDollar(list: QuickAmount[]): void {
            this.quick_amounts_dollar = sanitizeList(list).slice(0, 6);
            persistToLocalStorage(this.$state);
        },
        setQuickAmountsBolivar(list: QuickAmount[]): void {
            this.quick_amounts_bolivar = sanitizeList(list).slice(0, 6);
            persistToLocalStorage(this.$state);
        },
        addQuickAmountDollar(value: QuickAmount): void {
            if (this.quick_amounts_dollar.length >= 6) return;
            this.quick_amounts_dollar = sanitizeList([
                ...this.quick_amounts_dollar,
                value,
            ]).slice(0, 6);
            persistToLocalStorage(this.$state);
        },
        addQuickAmountBolivar(value: QuickAmount): void {
            if (this.quick_amounts_bolivar.length >= 6) return;
            this.quick_amounts_bolivar = sanitizeList([
                ...this.quick_amounts_bolivar,
                value,
            ]).slice(0, 6);
            persistToLocalStorage(this.$state);
        },
        removeQuickAmountDollar(value: QuickAmount): void {
            this.quick_amounts_dollar = this.quick_amounts_dollar.filter(
                (v) => v !== value
            );
            persistToLocalStorage(this.$state);
        },
        removeQuickAmountBolivar(value: QuickAmount): void {
            this.quick_amounts_bolivar = this.quick_amounts_bolivar.filter(
                (v) => v !== value
            );
            persistToLocalStorage(this.$state);
        },
        resetQuickAmounts(): void {
            this.quick_amounts_dollar = [...DOLLAR_DEFAULTS];
            this.quick_amounts_bolivar = [...BOLIVAR_DEFAULTS];
            this.product_limit = PRODUCT_LIMIT_DEFAULT;
            persistToLocalStorage(this.$state);
        },
        setProductLimit(value: number): void {
            const v = Math.max(1, Math.min(20, Math.floor(Number(value))));
            this.product_limit = v;
            persistToLocalStorage(this.$state);
        },
    },
});
