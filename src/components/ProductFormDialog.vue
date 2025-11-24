<template>
  <q-dialog v-model="model">
    <q-card
      dark
      flat
      bordered
      class="product-form-card bg-dark"
      style="width: 100%; max-width: 420px"
    >
      <!-- Enhanced header with better spacing and visual hierarchy -->
      <q-card-section class="product-form-header row items-center q-pb-sm">
        <div class="text-h6 text-weight-medium q-my-none">
          {{ isEdit ? 'Editar' : 'Nuevo' }} Producto
        </div>
        <q-space />
        <q-btn icon="close" flat dense class="close-btn" v-close-popup />
      </q-card-section>

      <q-separator dark class="q-mx-md" />

      <!-- Enhanced form section with better spacing -->
      <q-card-section class="product-form-content q-pt-md">
        <q-form @submit.prevent="onSubmit" ref="formRef">
          <!-- Enhanced name input with better styling -->
          <div class="form-field q-mb-lg">
            <label class="field-label text-grey-4 text-weight-medium q-mb-sm">
              Nombre del Producto
            </label>
            <q-input
              v-model.trim="form.name"
              filled
              dark
              dense
              class="enhanced-input"
              :rules="[(val: string) => !!val || 'Requerido']"
              autocapitalize="sentences"
              placeholder="Ingresa el nombre del producto"
            />
          </div>

          <!-- Enhanced image upload section -->
          <!-- <div class="form-field q-mb-lg">
            <label class="field-label text-grey-4 text-weight-medium q-mb-sm">
              Imagen del Producto
            </label>
            <q-file
              v-model="file"
              accept="image/*"
              filled
              dense
              dark
              class="enhanced-input"
              label="Seleccionar imagen"
              @update:model-value="onFile"
              use-chips
            >
              <template v-slot:prepend>
                <q-icon name="image" />
              </template>
            </q-file>

            <div v-if="preview" class="image-preview-container q-mt-md">
              <q-img :src="preview" ratio="1" class="image-preview" />
              <q-btn
                flat
                size="sm"
                color="negative"
                class="remove-image-btn q-mt-sm"
                icon="delete"
                label="Quitar imagen"
                @click="clearImage"
              />
            </div>
          </div> -->

          <!-- Enhanced price input -->
          <div class="form-field q-mb-xl">
            <label class="field-label text-grey-4 text-weight-medium q-mb-sm">
              Precio (USD)
            </label>
            <q-field
              filled
              dark
              dense
              class="enhanced-input"
              :model-value="priceInput"
              :rules="[priceRule]"
              ref="priceFieldRef"
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" />
              </template>
              <template v-slot:control="{ id, modelValue, emitValue }">
                <money
                  :id="id"
                  class="q-field__input input-text-improved"
                  :model-value="modelValue"
                  @update:model-value="(val: unknown) => { emitValue(val); onPriceInput(String(val)); }"
                  @focus="onPriceFocus"
                  @blur="onPriceBlur"
                  v-bind="priceMask"
                  inputmode="decimal"
                  placeholder="0,00"
                />
              </template>
            </q-field>
          </div>

          <!-- Enhanced action buttons with better spacing and styling -->
          <div class="form-actions">
            <q-btn
              label="Cancelar"
              flat
              class="cancel-btn full-width q-mb-sm"
              @click="$emit('update:modelValue', false)"
            />
            <q-btn
              label="Guardar Producto"
              color="primary"
              class="save-btn full-width"
              type="submit"
              :disable="!canSave"
              unelevated
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useProductsStore, type Product } from 'src/stores/products';

interface BaseForm {
  name: string;
  price_current: number | null;
  imageKey?: string; // clave en IndexedDB
}

const props = defineProps<{ modelValue: boolean; product: Product | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const model = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const store = useProductsStore();

const empty: BaseForm = {
  name: '',
  price_current: null,
  imageKey: undefined,
};
const form = ref<BaseForm>({ ...empty });
// Campo de texto formateado para el precio (con máscara estilo InputConver)
const priceInput = ref('');
const priceTouched = ref(false);
const priceFieldRef = ref<{
  validate?: () => void;
  resetValidation?: () => void;
} | null>(null);
// Estados de imagen declarados aquí para que estén disponibles en watchers
const originalImageKey = ref<string | undefined>(undefined);
const pendingImageData = ref<string | null>(null); // base64 temporal
const imageChanged = ref(false);
const imageRemoved = ref(false);
// Refs de archivo/preview antes del watcher (para immediate)
const file = ref<File | null>(null);
const preview = ref<string | null>(null);

const isEdit = computed(() => !!props.product);

watch(
  () => props.product,
  (p) => {
    if (p) {
      form.value = {
        name: p.name,
        price_current: p.price_current,
        imageKey: p.imageKey,
      };
      // Reset y precarga de imagen existente
      originalImageKey.value = p.imageKey;
      pendingImageData.value = null;
      imageChanged.value = false;
      imageRemoved.value = false;
      preview.value = null;
      if (p.imageKey) {
        loadExistingImage(p.imageKey);
      }
      priceInput.value =
        p.price_current != null ? formatNumber(p.price_current) : '';
      priceTouched.value = false;
      // limpiar validación al cargar
      setTimeout(() => priceFieldRef.value?.resetValidation?.(), 0);
    } else {
      form.value = { ...empty };
      priceInput.value = '';
      priceTouched.value = false;
      setTimeout(() => priceFieldRef.value?.resetValidation?.(), 0);
      originalImageKey.value = undefined;
      pendingImageData.value = null;
      imageChanged.value = false;
      imageRemoved.value = false;
      preview.value = null;
    }
  },
  { immediate: true }
);

const canSave = computed(
  () =>
    !!form.value.name &&
    !!form.value.price_current &&
    form.value.price_current > 0
);

// Máscara usada por el componente money (mismo estilo que InputConver.vue)
const priceMask = {
  decimal: ',',
  thousands: '.',
  prefix: '',
  suffix: '',
  precision: 2,
  focusOnRight: true,
  allowNegative: false,
};

function formatNumber(num: number) {
  if (isNaN(num)) return '0,00';
  return num.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseFormattedNumber(value: string | number | null): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  let clean = value.trim();
  if (!clean) return 0;
  // Si tiene miles y decimales estilo es-VE
  if (clean.includes('.') && clean.includes(',')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',') && !clean.includes('.')) {
    clean = clean.replace(',', '.');
  }
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

function onPriceInput(val: string) {
  priceInput.value = val;
  const parsed = parseFormattedNumber(val);
  form.value.price_current = parsed > 0 ? parsed : null;
}

function onPriceFocus() {
  // no validar aún
}

function onPriceBlur() {
  priceTouched.value = true;
  // Disparar validación ahora que se perdió el foco
  priceFieldRef.value?.validate?.();
}

const priceRule = (v: string) => {
  // No mostrar error hasta que el usuario haya interactuado (blur)
  if (!priceTouched.value) return true;
  const n = parseFormattedNumber(v);
  return (n && n > 0) || 'Debe ser mayor a 0';
};

const formRef = ref();

const onSubmit = async () => {
  if (!canSave.value) return;
  let finalImageKey: string | undefined = originalImageKey.value;
  try {
    if (imageRemoved.value) {
      if (originalImageKey.value) {
        await removeProductImage(originalImageKey.value);
      }
      finalImageKey = undefined;
    } else if (imageChanged.value && pendingImageData.value) {
      if (originalImageKey.value) {
        await saveProductImage(originalImageKey.value, pendingImageData.value);
        finalImageKey = originalImageKey.value;
      } else {
        const newKey = `img_${
          crypto.randomUUID?.() || Math.random().toString(36).slice(2)
        }`;
        await saveProductImage(newKey, pendingImageData.value);
        finalImageKey = newKey;
      }
    }
  } catch (e) {
    console.warn('[ProductForm] Error guardando imagen', e);
  }
  const payload = {
    name: form.value.name.trim(),
    price_current: Number(parseFloat(String(form.value.price_current))) || 0,
    imageKey: finalImageKey,
  };
  let ok = false;
  if (isEdit.value && props.product) {
    ok = store.update(props.product.id, payload);
  } else {
    ok = store.add(payload) as boolean;
  }
  if (ok) emit('saved');
};

// Imagen
import {
  saveProductImage,
  getProductImage,
  removeProductImage,
} from 'src/services/imageStore';

function clearImage() {
  file.value = null;
  preview.value = null;
  pendingImageData.value = null;
  imageRemoved.value = true;
  imageChanged.value = false;
}

async function onFile(f: File | File[] | null) {
  const picked = Array.isArray(f) ? f[0] : f;
  if (!picked) {
    clearImage();
    return;
  }
  // Convertir a base64 limitado (podría optimizarse con canvas)
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result as string;
    pendingImageData.value = base64;
    preview.value = base64;
    imageChanged.value = true;
    imageRemoved.value = false;
  };
  reader.readAsDataURL(picked);
}

async function loadExistingImage(key: string) {
  try {
    const data = await getProductImage(key);
    if (!data) return;
    if (typeof data === 'string') {
      preview.value = data;
    } else if (data instanceof Blob) {
      preview.value = URL.createObjectURL(data);
    }
  } catch (e) {
    console.warn('[ProductForm] No se pudo cargar la imagen existente', e);
  }
}
</script>

<style scoped>
.product-form-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.product-form-header {
  padding: 20px 24px 12px;
}

.close-btn {
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.product-form-content {
  padding: 16px 24px 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 14px;
  margin-bottom: 8px;
}

.enhanced-input {
  transition: all 0.2s ease;
}

.enhanced-input:hover {
  transform: translateY(-1px);
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-preview {
  max-height: 180px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.image-preview:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
}

.remove-image-btn {
  transition: all 0.2s ease;
}

.remove-image-btn:hover {
  transform: translateY(-1px);
}

.form-actions {
  margin-top: 8px;
}

.cancel-btn {
  height: 44px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  transform: translateY(-1px);
}

.save-btn {
  height: 48px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

.save-btn:disabled {
  opacity: 0.5;
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .product-form-header {
    padding: 16px 20px 8px;
  }

  .product-form-content {
    padding: 12px 20px 20px;
  }

  .form-field {
    margin-bottom: 20px;
  }

  .image-preview {
    max-height: 160px;
  }
}
</style>
