/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia';

export const useDolar = defineStore('dolar', {
  state: () => ({
    dolar: JSON.parse(localStorage.getItem('dolar') || '{}'),
    defaultRate: localStorage.getItem('defaultRate') || 'usd',
    favorites: JSON.parse(localStorage.getItem('favorites') || '["usd","eur"]'),
    _SU: false,
  }),
  actions: {
    setDolar(payload: any) {
      if (typeof payload === 'object') {
        this.dolar = payload;
      } else {
        this.dolar = { usd: parseFloat(payload) };
      }
      localStorage.setItem('dolar', JSON.stringify(this.dolar));
    },
    setDefaultRate(rate: string) {
      this.defaultRate = rate;
      localStorage.setItem('defaultRate', rate);
    },
    setFavorites(favs: string[]) {
      this.favorites = Array.isArray(favs) ? favs : [];
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    },
    toggleFavorite(rate: string) {
      const set = new Set(this.favorites || []);
      if (set.has(rate)) set.delete(rate);
      else set.add(rate);
      this.favorites = Array.from(set);
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    },
    setSU(payload: any) {
      this._SU = payload;
    },
  },
});
