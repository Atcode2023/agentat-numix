import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { useSettings } from './settings';

export interface Product {
  id: string; // uuid local
  name: string;
  price_current: number; // precio en USD
  // imageKey?: string; // clave en IndexedDB
  created_at: string;
}

const STORAGE_KEY = 'products';
// Backward-compat: default limit
const DEFAULT_LIMIT = 5;

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr
        .filter((p) => p && p.id && p.name)
        .map(
          (p) =>
            ({
              id: p.id,
              name: p.name,
              price_current: p.price_current,
              // imageKey: p.imageKey,
              created_at: p.created_at || new Date().toISOString(),
            } as Product)
        );
    }
    return [];
  } catch (e) {
    console.warn('No se pudo cargar products', e);
    return [];
  }
}

function persist(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('No se pudo guardar products', e);
  }
}

export const useProductsStore = defineStore('products', {
  state: () => ({
    list: loadProducts() as Product[],
  }),
  getters: {
    count: (state) => state.list.length,
  },
  actions: {
    add(product: Omit<Product, 'id' | 'created_at'>) {
      const settings = useSettings();
      const BASE = Math.floor(settings.product_limit || DEFAULT_LIMIT);
      const LIMIT = Math.max(1, Math.min(5, BASE));
      if (this.list.length >= LIMIT) {
        Notify.create({
          type: 'negative',
          message: `Solo puedes registrar hasta ${LIMIT} productos`,
          icon: 'warning',
        });
        return false;
      }
      const item: Product = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
        created_at: new Date().toISOString(),
        ...product,
      };
      this.list.unshift(item);
      persist(this.list);
      Notify.create({
        type: 'positive',
        message: 'Producto agregado',
        icon: 'check',
      });
      return true;
    },
    update(id: string, patch: Partial<Omit<Product, 'id' | 'created_at'>>) {
      const idx = this.list.findIndex((p) => p.id === id);
      if (idx === -1) return false;
      this.list[idx] = { ...this.list[idx], ...patch };
      persist(this.list);
      Notify.create({
        type: 'positive',
        message: 'Producto actualizado',
        icon: 'check',
      });
      return true;
    },
    remove(id: string) {
      const before = this.list.length;
      this.list = this.list.filter((p) => p.id !== id);
      if (this.list.length !== before) {
        persist(this.list);
        Notify.create({
          type: 'info',
          message: 'Producto eliminado',
          icon: 'delete',
        });
        return true;
      }
      return false;
    },
    clearAll() {
      this.list = [];
      persist(this.list);
      Notify.create({
        type: 'info',
        message: 'Lista de productos vacía',
        icon: 'delete',
      });
    },
    importList(products: Product[]) {
      const settings = useSettings();
      const BASE = Math.floor(settings.product_limit || DEFAULT_LIMIT);
      const LIMIT = Math.max(1, Math.min(5, BASE));
      this.list = products.slice(0, LIMIT);
      persist(this.list);
    },
  },
});
