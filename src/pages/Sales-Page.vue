<template>
  <q-page class="q-pa-md">
    <div class="q-mb-lg">
      <div class="text-h5 text-white q-mb-xs">Mi Tienda</div>
      <div class="text-caption text-grey-1">{{ products.count }} productos</div>

      <div class="q-mt-md flex justify-between full-width">
        <div>
          <q-btn
            dense
            class="q-mr-md"
            icon="add"
            label="Nuevo"
            color="light-blue"
            @click="openAdd"
          />
          <q-tooltip v-if="isAtProductLimit"
            >Límite de productos alcanzado</q-tooltip
          >
          <q-btn
            flat
            dense
            round
            icon="list"
            color="grey-1"
            @click="openList"
          />
        </div>
        <q-btn
          flat
          dense
          round
          icon="shopping_cart"
          color="grey-1"
          @click="cartDialog = true"
        >
          <q-badge v-if="cartCount > 0" color="warning" floating>{{
            cartCount
          }}</q-badge>
        </q-btn>
      </div>
    </div>

    <div v-if="products.count === 0" class="text-center q-pa-xl">
      <q-icon name="storefront" size="48px" color="grey-6" />
      <div class="text-body1 text-white q-mt-md q-mb-sm">Tienda vacía</div>
      <div class="text-caption text-grey-1 q-mb-lg">
        Agrega tu primer producto
      </div>
      <q-btn unelevated color="primary" label="Agregar" @click="openAdd" />
    </div>

    <div v-else class="products-grid">
      <div v-for="p in products.list" :key="p.id" class="product-item">
        <q-card
          flat
          bordered
          class="bg-accent text-white cursor-pointer product-card"
          :class="{ 'border-flash': highlightId === p.id }"
          @click="handleAddToCart(p)"
        >
          <div class="product-img-wrapper">
            <template v-if="images[p.id] === undefined">
              <div class="flex flex-center h-100 text-center">
                <q-spinner color="primary" size="20px" />
              </div>
            </template>
            <template v-else-if="images[p.id] === null">
              <div class="flex flex-center h-100 text-center text-grey-6">
                <q-icon name="image" size="32px" />
              </div>
            </template>
            <q-img
              v-else
              :src="imageSrc(p.id)"
              fit="cover"
              class="rounded-borders"
              style="width: 100%; height: 100%"
              loading="lazy"
            />
          </div>
          <q-card-section class="q-pa-sm">
            <div class="text-body2 ellipsis">{{ p.name }}</div>
            <div class="text-warning text-bold text-subtitle1 text-right">
              ${{ p.price_current.toFixed(2) }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="cartDialog" position="bottom">
      <q-card class="bg-dark text-white full-width">
        <q-card-section class="row items-center">
          <div class="text-subtitle1">Carrito</div>
          <q-space />
          <q-btn
            v-if="cart.length > 0"
            flat
            dense
            color="negative"
            icon="delete_sweep"
            @click="clearCart"
            :disable="cart.length === 0"
            class="q-mr-xs"
          />
          <q-btn flat round dense icon="close" color="grey-1" v-close-popup />
        </q-card-section>

        <q-card-section style="max-height: 50vh; overflow-y: auto">
          <div v-if="cart.length === 0" class="text-center q-pa-lg">
            <q-icon name="shopping_cart" size="32px" color="grey-6" />
            <div class="text-caption text-grey-1 q-mt-sm">Carrito vacío</div>
          </div>

          <div v-else>
            <div
              v-for="item in cart"
              :key="item.id"
              class="row items-center q-py-sm"
            >
              <div class="col">
                <div class="text-body2">{{ item.name }}</div>
                <div class="text-positive text-weight-bold">
                  ${{ (item.price_current * item.quantity).toFixed(2) }}
                </div>
              </div>
              <div class="col-auto row items-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="remove"
                  @click="removeFromCart(item.id)"
                  color="grey-1"
                />
                <span class="text-body2">{{ item.quantity }}</span>
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="add"
                  @click="addToCart(item)"
                  color="primary"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="cart.length > 0">
          <div class="row items-center q-mb-md">
            <span class="text-grey-1">Total</span>
            <q-space />
            <span class="text-warning text-h6"
              >${{ cartTotal.toFixed(2) }}</span
            >
          </div>
          <q-btn
            unelevated
            color="blue"
            label="Procesar"
            @click="processSale"
            class="full-width"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="listDialog">
      <q-card class="bg-dark text-white" style="min-width: 300px">
        <q-card-section class="row items-center">
          <div class="text-subtitle1">Productos</div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-1" v-close-popup />
        </q-card-section>

        <q-card-section style="max-height: 50vh; overflow-y: auto">
          <div
            v-if="products.count === 0"
            class="text-center text-grey-1 q-pa-lg"
          >
            No hay productos
          </div>
          <div v-else>
            <div
              v-for="p in products.list"
              :key="p.id"
              class="row items-center q-py-sm"
            >
              <div class="col">
                <div class="text-body2">{{ p.name }}</div>
                <div class="text-positive">
                  ${{ p.price_current.toFixed(2) }}
                </div>
              </div>
              <div class="col-auto row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  @click="editFromList(p)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="requestDelete(p)"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmDialog">
      <q-card class="bg-dark text-white" style="min-width: 300px">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">Eliminar producto</div>
          <div v-if="productToDelete" class="text-body2 text-grey-4">
            ¿Eliminar "{{ productToDelete.name }}"?
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-1" v-close-popup />
          <q-btn
            unelevated
            label="Eliminar"
            color="negative"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <ProductFormDialog
      v-model="showForm"
      :product="selected"
      @saved="onSaved"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { Notify } from 'quasar';
import { useProductsStore, type Product } from 'src/stores/products';
import ProductFormDialog from 'src/components/ProductFormDialog.vue';
import { getProductImage } from 'src/services/imageStore';
import { saveProductImage } from 'src/services/imageStore';
import { useDolar } from 'src/stores/dolar';
// import { useSettings } from 'src/stores/settings';

const products = useProductsStore();
const dolarStore = useDolar();
// const settingsStore = useSettings();
const showForm = ref(false);
const selected = ref<Product | null>(null);
const images = ref<Record<string, string | null | undefined>>({});
// Track object URLs to revoke them and avoid memory leaks / freezes on mobile
const objectUrls = new Map<string, string>();

const cart = ref<Array<Product & { quantity: number }>>([]);
const cartDialog = ref(false);
const STORAGE_CART = 'products_cart';
const listDialog = ref(false);
const confirmDialog = ref(false);
const productToDelete = ref<Product | null>(null);

const cartTotal = computed(() => {
  return cart.value.reduce(
    (total, item) => total + item.price_current * item.quantity,
    0
  );
});

const cartCount = computed(() =>
  cart.value.reduce((n, i) => n + i.quantity, 0)
);

const isAtProductLimit = computed(() => products.count >= 5);
const effectiveLimit = computed(() => 5);

const highlightId = ref<string | null>(null);

function handleAddToCart(product: Product) {
  addToCart(product);
  // pequeña animación de borde en warning
  highlightId.value = product.id;
  setTimeout(() => {
    if (highlightId.value === product.id) highlightId.value = null;
  }, 900);
}

const addToCart = (product: Product) => {
  const existingItem = cart.value.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
  persistCart();
};

const removeFromCart = (productId: string) => {
  const itemIndex = cart.value.findIndex((item) => item.id === productId);
  if (itemIndex > -1) {
    if (cart.value[itemIndex].quantity > 1) {
      cart.value[itemIndex].quantity--;
    } else {
      cart.value.splice(itemIndex, 1);
    }
  }
  persistCart();
};

const clearCart = () => {
  cart.value = [];
  persistCart();
};

async function buildAndShareInvoice() {
  if (cart.value.length === 0) return;
  // Tasa USD->Bs requerida para mostrar solo Bs
  const rate = Number(dolarStore.dolar?.usd) || 0;
  const date = new Date();
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  if (!rate) {
    // Si no hay tasa, avisar y abortar (evitar mostrar números falsos)
    const fallback =
      'No hay tasa USD->Bs configurada. Actualiza la tasa antes de procesar la venta.';
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(fallback);
    } catch {}
    console.warn('[VENTA] Sin tasa, no se genera factura');
    return;
  }

  // Formateo con separadores de miles
  const nf = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formatBs = (v: number) => nf.format(v);

  interface LineFmt {
    label: string;
    price: string;
  }
  const rawLines: LineFmt[] = cart.value.map((item, idx) => {
    const bs = item.price_current * item.quantity * rate;
    return {
      label: `${idx + 1}. ${item.name} x${item.quantity}`,
      price: `Bs ${formatBs(bs)}`,
    };
  });

  // Calcular padding con puntos
  const targetCols = 34; // ancho deseado antes del precio
  const formatted = rawLines.map((l) => {
    const plainLen = l.label.length;
    const dotsCount = Math.max(2, targetCols - plainLen - l.price.length);
    const dots = '.'.repeat(dotsCount);
    return `${l.label} ${dots}${l.price}`;
  });

  const totalBs = formatBs(cartTotal.value * rate);
  const header = `Venta - ${d}/${m}/${y}`;
  const body = `${header}\n${formatted.join('\n')}\n\nTOTAL: Bs ${totalBs}`;

  try {
    if (navigator.share) {
      await navigator.share({ title: 'Venta', text: body });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(body);
      console.info('Factura copiada al portapapeles');
    } else {
      console.log(body);
    }
  } catch (e) {
    console.warn('No se pudo compartir', e);
  }
}

const processSale = async () => {
  await buildAndShareInvoice();
  clearCart();
  cartDialog.value = false;
};

const openAdd = () => {
  if (isAtProductLimit.value) {
    Notify.create({
      type: 'negative',
      message: `Solo puedes registrar hasta ${effectiveLimit.value} productos`,
      icon: 'warning',
      position: 'top',
    });
    return;
  }
  selected.value = null;
  showForm.value = true;
};

const edit = (p: Product) => {
  selected.value = p;
  showForm.value = true;
};

const openList = () => {
  listDialog.value = true;
};

const editFromList = (p: Product) => {
  listDialog.value = false;
  edit(p);
};

const requestDelete = (p: Product) => {
  productToDelete.value = p;
  confirmDialog.value = true;
};

const confirmDelete = () => {
  if (productToDelete.value) {
    products.remove(productToDelete.value.id);
    pruneCart();
  }
  productToDelete.value = null;
  confirmDialog.value = false;
};

const onSaved = () => {
  showForm.value = false;
};

async function loadImage(p: Product) {
  if (!p.imageKey) {
    // Cleanup previous object URL if any
    const prev = objectUrls.get(p.id);
    if (prev) {
      URL.revokeObjectURL(prev);
      objectUrls.delete(p.id);
    }
    images.value[p.id] = null;
    return;
  }
  images.value[p.id] = undefined;
  try {
    const data = await getProductImage(p.imageKey);
    if (typeof data === 'string') {
      images.value[p.id] = data;
    } else if (data instanceof Blob) {
      // Revoke previous if exists
      const prev = objectUrls.get(p.id);
      if (prev) {
        URL.revokeObjectURL(prev);
        objectUrls.delete(p.id);
      }
      const url = URL.createObjectURL(data);
      objectUrls.set(p.id, url);
      images.value[p.id] = url;
    } else {
      console.warn('[IMG] No data for key', p.imageKey, 'product', p.id);
      images.value[p.id] = null;
    }
  } catch (e) {
    console.error('[IMG] Error loading image', p.imageKey, e);
    images.value[p.id] = null;
  }
}

function ensureImages() {
  products.list.forEach((p) => {
    if (images.value[p.id] === undefined) {
      loadImage(p);
    }
  });
}

// Migra productos antiguos que aún tengan image_url y no imageKey
async function migrateLegacyImages() {
  let changed = false;
  interface LegacyProduct {
    image_url?: unknown;
  }
  const hasLegacy = (obj: unknown): obj is LegacyProduct =>
    typeof obj === 'object' && obj !== null && 'image_url' in obj;

  for (const p of products.list) {
    if (!p.imageKey && hasLegacy(p)) {
      const legacyVal = p.image_url;
      if (typeof legacyVal === 'string' && legacyVal.startsWith('data:image')) {
        try {
          const key = `img_${p.id}`;
          await saveProductImage(key, legacyVal);
          products.update(p.id, { imageKey: key });
          changed = true;
        } catch (e) {
          console.warn('Fallo migrando imagen legacy', e);
        }
      }
    }
  }
  if (changed) {
    // Forzar recarga de imágenes
    products.list.forEach((p) => {
      images.value[p.id] = undefined;
    });
    ensureImages();
  }
}

onMounted(() => {
  ensureImages();
  migrateLegacyImages();
  try {
    const raw = localStorage.getItem(STORAGE_CART);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        cart.value = arr
          .filter((x) => x && x.id && x.quantity > 0)
          .map((x) => ({
            id: x.id,
            name: x.name,
            price_current: x.price_current,
            imageKey: x.imageKey,
            created_at: x.created_at,
            quantity: x.quantity,
          }));
      }
    }
  } catch {}
});

onUnmounted(() => {
  // Cleanup all object URLs on component destroy
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  objectUrls.clear();
});

watch(
  () => products.list.map((p) => p.id + (p.imageKey || '')),
  () => {
    ensureImages();
  }
);

watch(cart, () => pruneCart(), { deep: true });

function pruneCart() {
  cart.value = cart.value.filter((ci) =>
    products.list.some((p) => p.id === ci.id)
  );
  persistCart();
}

function persistCart() {
  try {
    localStorage.setItem(STORAGE_CART, JSON.stringify(cart.value));
  } catch {}
}

// Provide src for QImg with correct typing (string | undefined)
function imageSrc(id: string): string | undefined {
  const v = images.value[id];
  return typeof v === 'string' ? v : undefined;
}
</script>

<style scoped>
.product-card {
  position: relative;
  overflow: hidden;
}
.product-card.border-flash {
  border-color: var(--q-warning) !important;
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.25) inset,
    0 0 10px rgba(255, 193, 7, 0.2);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Grid responsivo controlado */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* En pantallas medianas (tablets) usar 3 columnas */
@media (min-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

/* En desktop amplio usar 4 columnas */
@media (min-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }
}

.product-item {
  display: block;
}

/* Alturas controladas: imagen fija en md+ para coherencia visual */
.product-img-wrapper {
  width: 100%;
  height: 180px; /* mobile */
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
}

@media (min-width: 768px) {
  .product-img-wrapper {
    height: 220px; /* tablet */
  }
}

@media (min-width: 1200px) {
  .product-img-wrapper {
    height: 240px; /* desktop */
  }
}

/* Que la card se adapte al alto fijo de la imagen y mantenga consistencia */
.product-card {
  display: flex;
  flex-direction: column;
}

.product-card .q-card__section {
  padding: 8px 10px;
}
</style>
