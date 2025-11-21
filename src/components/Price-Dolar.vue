<template>
  <q-dialog v-model="isSettingsOpen" persistent maximized>
    <div class="modal-container">
      <div class="q-pa-md fit bg-dark" style="width: 100%; border-radius: 12px">
        <div class="flex justify-between items-center q-mb-sm">
          <div class="text-h6 text-white">Configuración</div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            @click="closeSettings"
          />
        </div>

        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey-4"
          active-color="white"
          indicator-color="green-5"
        >
          <q-tab name="rates" label="Tasas" no-caps />
          <q-tab name="quick" label="Cifras rápidas" no-caps />
        </q-tabs>
        <q-separator dark inset />

        <q-tab-panels
          v-model="activeTab"
          animated
          transition-prev="fade"
          transition-next="fade"
          class="bg-transparent q-mt-sm"
        >
          <q-tab-panel name="rates" class="q-pa-none">
            <div class="rate-options q-mt-md">
              <template v-if="rateOptions.length">
                <div
                  v-for="option in rateOptions"
                  :key="option.value"
                  class="rate-option compact"
                  @click="updateDefaultRate(option.value)"
                >
                  <div class="rate-option-content">
                    <div class="rate-option-left">
                      <q-radio
                        v-model="selectedRate"
                        :val="option.value"
                        :color="getOptionColor(option.value)"
                        size="md"
                        @click.stop="updateDefaultRate(option.value)"
                      />
                      <div class="rate-option-text">
                        <div class="rate-option-title">{{ option.label }}</div>
                        <div class="rate-option-subtitle">
                          {{ option.subLabel }}
                        </div>
                      </div>
                    </div>
                    <q-btn
                      flat
                      round
                      dense
                      :icon="isFavorite(option.value) ? 'star' : 'star_outline'"
                      :color="
                        isFavorite(option.value)
                          ? getOptionColor(option.value)
                          : 'grey-5'
                      "
                      @click.stop="toggleFavorite(option.value)"
                      aria-label="Marcar como favorito"
                    />
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="text-grey-4 q-mt-sm">
                  No hay tasas disponibles aún.
                </div>
              </template>
            </div>
          </q-tab-panel>

          <q-tab-panel name="quick" class="q-pa-none">
            <div class="q-mt-md">
              <div class="text-white text-bold q-mb-xs">
                Para {{ (defaultRate || 'usd').toUpperCase() }}
              </div>
              <div class="chips-grid">
                <q-chip
                  v-for="n in quickDollar"
                  :key="`d-${n}`"
                  outline
                  color="grey-5"
                  text-color="white"
                  removable
                  @remove="removeQuickDollar(n)"
                >
                  {{ toLabel(n) }}
                </q-chip>
              </div>
              <div class="row q-col-gutter-sm items-center">
                <div class="col-10">
                  <q-input
                    v-model.number="newDollar"
                    type="number"
                    dense
                    dark
                    filled
                    input-class="text-white"
                    label="Agregar monto"
                    @keyup.enter="addQuickDollar"
                    :disable="quickDollar.length >= 6"
                  />
                </div>
                <div class="col-2">
                  <q-btn
                    color="green-5"
                    icon="add"
                    round
                    dense
                    @click="addQuickDollar"
                    :disable="quickDollar.length >= 6"
                  />
                </div>
              </div>
              <div
                class="text-caption text-grey-5 q-mt-sm text-center"
                v-if="quickDollar.length >= 6"
              >
                Máximo 6 cifras rápidas.
              </div>
            </div>

            <q-separator dark class="q-my-md" />

            <div>
              <div class="text-white text-bold q-mb-xs">Para Bolívares</div>
              <div class="chips-grid">
                <q-chip
                  v-for="n in quickBolivar"
                  :key="`b-${n}`"
                  outline
                  color="grey-5"
                  text-color="white"
                  removable
                  @remove="removeQuickBolivar(n)"
                >
                  {{ toLabel(n) }}
                </q-chip>
              </div>
              <div class="q-mt-sm row q-col-gutter-sm items-center">
                <div class="col-10">
                  <q-input
                    v-model.number="newBolivar"
                    type="number"
                    dense
                    dark
                    filled
                    input-class="text-white"
                    label="Agregar monto"
                    @keyup.enter="addQuickBolivar"
                    :disable="quickBolivar.length >= 6"
                  />
                </div>
                <div class="col-2">
                  <q-btn
                    color="green-5"
                    icon="add"
                    round
                    dense
                    @click="addQuickBolivar"
                    :disable="quickBolivar.length >= 6"
                  />
                </div>
              </div>
              <div
                class="text-caption text-grey-5 q-mt-sm text-center"
                v-if="quickBolivar.length >= 6"
              >
                Máximo 6 cifras rápidas.
              </div>
            </div>

            <div class="q-mt-md flex items-center justify-between">
              <q-btn
                outline
                class="full-width"
                color="red-5"
                icon="restart_alt"
                label="Restablecer"
                no-caps
                @click="resetQuick"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <div
      class="text-caption text-grey-5 q-mt-xs"
      v-if="quickBolivar.length >= 6"
    >
      Máximo 6 cifras rápidas.
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted, watch } from 'vue';
import { useDolar } from 'src/stores/dolar';
import { useUi } from 'src/stores/ui';
import { useSettings } from 'src/stores/settings';

const dolarStore = useDolar();
const { setDefaultRate, toggleFavorite } = dolarStore;
const { dolar, favorites } = storeToRefs(dolarStore);

const ui = useUi();
const { isSettingsOpen } = storeToRefs(ui);
const { defaultRate } = storeToRefs(useDolar());
const selectedRate = ref(defaultRate.value || 'usd');
const activeTab = ref<'rates' | 'quick'>('rates');

// Sincronizar selectedRate si defaultRate cambia
watch(defaultRate, (newVal: string) => {
  selectedRate.value = newVal;
});

// Generar las opciones dinámicamente desde el objeto dolar
interface RateOption {
  value: string;
  label: string;
  subLabel: string;
}
const rateOptions = ref<RateOption[]>([]);
const updateRateOptions = () => {
  const options: RateOption[] = [];
  if (dolar.value) {
    Object.entries(dolar.value).forEach(([key, value]) => {
      if (key !== 'date' && key !== 'paralelo') {
        let floatValue =
          typeof value === 'number' ? value : parseFloat(value as string);
        options.push({
          value: key,
          label: key.toUpperCase(),
          subLabel: `${floatValue.toFixed(2)} Bs`,
        });
      }
    });
  }
  rateOptions.value = options;
};

const closeSettings = () => ui.closeSettings();

const updateDefaultRate = (rate: string) => {
  selectedRate.value = rate;
  setDefaultRate(rate);
  ui.closeSettings();
};

const isFavorite = (rate: string) => {
  return (favorites.value || []).includes(rate);
};

const getOptionColor = (value: string) => {
  switch (value) {
    case 'usd':
      return 'blue-5';
    case 'eur':
      return 'green-5';
    case 'cny':
      return 'orange-5';
    case 'try':
      return 'purple-5';
    case 'rub':
      return 'pink-5';
    case 'bcv':
      return 'cyan-5';
    default:
      return 'grey-5';
  }
};

onMounted(() => {
  updateRateOptions();
});

// Mantener opciones sincronizadas cuando llegue/ cambie el objeto en el store
watch(
  dolar,
  () => {
    updateRateOptions();
  },
  { immediate: true }
);

// Quick amounts tab logic
const settings = useSettings();
const { quick_amounts_dollar, quick_amounts_bolivar } = storeToRefs(settings);
const quickDollar = quick_amounts_dollar;
const quickBolivar = quick_amounts_bolivar;
const newDollar = ref<number | null>(null);
const newBolivar = ref<number | null>(null);

function sanitizeValue(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function toLabel(n: number): string {
  if (n >= 1000000 && Number.isInteger(n / 1000000)) return `${n / 1000000}M`;
  if (n >= 1000 && Number.isInteger(n / 1000)) return `${n / 1000}K`;
  return String(Number.isInteger(n) ? n : Math.round(n * 100) / 100);
}

function addQuickDollar(): void {
  const n = sanitizeValue(newDollar.value);
  if (n == null) return;
  settings.addQuickAmountDollar(n);
  newDollar.value = null;
}

function addQuickBolivar(): void {
  const n = sanitizeValue(newBolivar.value);
  if (n == null) return;
  settings.addQuickAmountBolivar(n);
  newBolivar.value = null;
}

function removeQuickDollar(v: number): void {
  settings.removeQuickAmountDollar(v);
}

function removeQuickBolivar(v: number): void {
  settings.removeQuickAmountBolivar(v);
}

function resetQuick(): void {
  settings.resetQuickAmounts();
}
</script>

<style lang="scss" scoped>
.price-container {
  display: flex;
  justify-content: center;
  padding: 16px 12px 0px;
}

.price-card {
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
}

.price-header {
  padding: 8px 16px;
  display: flex;
  gap: 4px;
}

.rate-options {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rate-option {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 60px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.rate-option-content {
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rate-option-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.rate-option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rate-option-title {
  color: white;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.2;
}

.rate-option-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 400;
}

.rate-option-value {
  color: white;
  font-weight: 500;
  font-size: 1rem;
}

:deep(.q-radio__inner) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.q-btn) {
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

:deep(.q-tab) {
  min-height: 44px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

:deep(.q-chip) {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

:deep(.q-input .q-field__control) {
  border-radius: 8px;
}

:deep(.q-separator) {
  opacity: 0.3;
}

.modal-container {
  min-height: 100vh;
  width: 100%;
}

.chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 36px;
  margin-bottom: 8px;
}

// Enhanced modal styling
.q-pa-md.fit.bg-dark {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3),
    0 10px 10px -5px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

// Better spacing and typography
.text-h6 {
  font-weight: 600;
  letter-spacing: -0.025em;
}

.text-subtitle1 {
  font-weight: 500;
}

// Responsive improvements
@media (max-width: 480px) {
  .rate-option-content {
    padding: 14px 16px;
  }

  .chips-grid {
    gap: 6px;
  }
}
</style>
