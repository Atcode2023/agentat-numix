<template>
  <div class="converter-wrapper" id="conv-wrapper">
    <!-- Header mejorado con mejor jerarquía visual -->
    <div class="converter-header">
      <div class="rate-selector-container">
        <div>
          <q-btn
            id="btn-cycle-rate"
            :label="buttonLabel"
            :style="{
              background: `linear-gradient(135deg, ${buttonColor}, ${buttonColor}dd)`,
              color: 'white',
              boxShadow: `0 4px 12px ${buttonColor}40`,
            }"
            class="rate-selector-btn"
            no-caps
            @click="toggleButton"
          >
            <q-icon name="swap_horiz" size="18px" class="q-ml-xs" />
          </q-btn>
        </div>
        <div class="">
          <q-btn
            outline
            round
            padding="8px"
            dense
            color="grey-1"
            class="q-mx-sm"
            id="btn-settings"
            @click="openSettings"
          >
            <q-icon size="16px" name="settings" />
          </q-btn>
          <q-btn
            round
            padding="8px"
            dense
            color="grey-3"
            outline
            :loading="isRefreshing"
            :disable="isRefreshing"
            @click="refreshRate"
            aria-label="Actualizar tasa"
          >
            <q-icon size="16px" name="refresh" />
            <q-tooltip>Actualizar tasa</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <div class="quick-amounts-section">
      <div class="quick-amounts-grid-improved">
        <q-btn
          v-for="amount in currentQuickAmounts"
          :key="amount.value"
          :label="amount.label"
          :class="[
            'quick-amount-btn-improved',
            selectedQuickAmount === amount.value
              ? 'quick-amount-selected bg-warning text-dark'
              : 'text-white',
          ]"
          :outline="selectedQuickAmount !== amount.value"
          :unelevated="selectedQuickAmount === amount.value"
          :style="
            selectedQuickAmount === amount.value
              ? {
                  borderColor: 'var(--q-warning)',
                  color: '#1d1d1d',
                  fontWeight: '600',
                }
              : { borderColor: 'rgba(255,255,255,0.25)' }
          "
          no-caps
          @click="setQuickAmount(amount.value)"
        />
      </div>
    </div>

    <div class="converter-main">
      <div class="converter-card-improved">
        <div class="controls-row">
          <div class="row items-center q-gutter-sm no-wrap">
            <q-btn
              icon="restart_alt"
              label="Limpiar"
              color="grey-1"
              text-color="white"
              @click="resetInput"
              dense
              flat
              no-caps
              class="reset-btn"
              v-show="!isAtDefault"
            >
              <q-tooltip>Limpiar</q-tooltip>
            </q-btn>
          </div>
          <q-btn-toggle
            id="toggle-mode"
            v-model="inputMode"
            :toggle-color="buttonToggleColor"
            :options="[
              { label: 'Bs', value: 'bolivar' },
              { label: defaultRate.toUpperCase(), value: 'dollar' },
            ]"
            class="mode-toggle-improved"
            dense
            rounded
            no-caps
          />
        </div>
        <!-- Input mejorado con mejor feedback visual -->
        <div class="input-section">
          <div class="input-label">
            {{
              inputMode === 'dollar'
                ? `Monto en ${defaultRate.toUpperCase()}`
                : 'Monto en Bolívares'
            }}
          </div>
          <q-field
            id="field-amount"
            filled
            dark
            :model-value="inputValue"
            @update:model-value="handleInput"
            class="input-field-improved"
            :color="buttonToggleColor"
          >
            <template
              v-slot:control="{ id, floatingLabel, modelValue, emitValue }"
            >
              <money
                :id="id"
                class="q-field__input input-text-improved"
                :model-value="modelValue"
                @update:model-value="emitValue"
                v-bind="inputMode === 'dollar' ? dollarMask : bolivarMask"
                @focus="handleMoneyFocus"
                v-show="floatingLabel"
              />
            </template>
          </q-field>
        </div>

        <div
          class="result-container-improved"
          :style="{
            borderColor: buttonColor,
            background: `linear-gradient(135deg, ${buttonColor}10, ${buttonColor}05)`,
          }"
        >
          <div class="result-currency-badge">
            <q-avatar
              :style="{
                background: `linear-gradient(135deg, ${buttonColor}, ${buttonColor}dd)`,
                color: 'white',
              }"
              size="40px"
              font-size="14px"
            >
              {{ inputMode === 'dollar' ? 'Bs' : defaultRate.toUpperCase() }}
            </q-avatar>
          </div>
          <div class="result-value-improved" id="result-value">
            {{ resultValue }}
            <div
              v-if="historicalInfo && !historicalInfo.isToday"
              class="text-caption text-amber-5 q-mt-xs"
            ></div>
          </div>
          <q-btn
            id="btn-copy-result"
            icon="content_copy"
            flat
            round
            size="md"
            color="grey-3"
            @click="copy(resultValue)"
            class="result-copy-btn"
          >
            <q-tooltip>Copiar resultado</q-tooltip>
          </q-btn>
        </div>
        <MonthHistoryPicker
          id="picker-history"
          @update:history="onMonthHistory"
        />
        <div class="q-mt-sm">
          <p class="update-bcv-text text-center full-width q-mb-none">
            Última actualización
            <span class="text-orange-6 text-bold text-subtitle2">BCV</span>:
            {{ lastUpdateText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { Notify, copyToClipboard } from 'quasar';
import { storeToRefs } from 'pinia';
import { useDolar } from 'src/stores/dolar';
import { getDolar } from 'src/services/dolar.js';
import { useUi } from 'src/stores/ui';
import { useSettings } from 'src/stores/settings';
import { format_day_month_year_spanish } from 'src/utils/date_format';
import { useShareStore } from 'src/stores/share';
import MonthHistoryPicker from './MonthHistoryPicker.vue';

const inputValue = ref('');
const resultValue = ref('0,00');
const inputMode = ref('dollar');
const selectedQuickAmount = ref(null);
const isSettingQuickAmount = ref(false);
// Información de historial seleccionado
const historicalInfo = ref(null); // { date, historial, isToday }
const historicalRate = ref(null); // número de la tasa histórica activa
const historicalRates = ref(null); // objeto completo (bcv_today)
const { defaultRate, dolar, favorites } = storeToRefs(useDolar());
const isRefreshing = ref(false);
const ui = useUi();
const openSettings = () => ui.openSettings();
const shareStore = useShareStore();

// Quick amounts from settings store
const settings = useSettings();
const settingsRefs = storeToRefs(settings);

function toLabel(n) {
  if (n >= 1000000 && Number.isInteger(n / 1000000)) return `${n / 1000000}M`;
  if (n >= 1000 && Number.isInteger(n / 1000)) return `${n / 1000}K`;
  return String(Number.isInteger(n) ? n : Math.round(n * 100) / 100);
}

const dollarQuickAmounts = computed(() =>
  (settingsRefs.quick_amounts_dollar.value || []).map((v) => ({
    label: toLabel(v),
    value: v,
  }))
);

const bolivarQuickAmounts = computed(() =>
  (settingsRefs.quick_amounts_bolivar.value || []).map((v) => ({
    label: toLabel(v),
    value: v,
  }))
);

const currentQuickAmounts = computed(() =>
  inputMode.value === 'dollar'
    ? dollarQuickAmounts.value
    : bolivarQuickAmounts.value
);

const dollarMask = ref({
  decimal: ',',
  thousands: '.',
  prefix: '',
  suffix: '',
  precision: 2,
  focusOnRight: true,
  allowNegative: false,
});

const bolivarMask = ref({
  decimal: ',',
  thousands: '.',
  prefix: '',
  suffix: '',
  precision: 2,
  focusOnRight: true,
  allowNegative: false,
});

const getCurrentRate = () => {
  if (historicalRate.value != null) return historicalRate.value;
  if (dolar.value && defaultRate.value && dolar.value[defaultRate.value]) {
    return parseFloat(dolar.value[defaultRate.value]);
  }
  return dolar.value && dolar.value.usd ? parseFloat(dolar.value.usd) : 1;
};

const formatNumber = (num) => {
  return num.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
// Restaurado: parseFormattedNumber
const parseFormattedNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (!value || value.trim() === '') return 0;
    let cleanValue = value.trim();
    if (cleanValue.includes('.') && cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else if (cleanValue.includes(',') && !cleanValue.includes('.')) {
      cleanValue = cleanValue.replace(',', '.');
    }
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const calculateResult = (value) => {
  const rate = getCurrentRate();
  if (value === '' || value === null || value === undefined) {
    resultValue.value = '0,00';
    shareStore.setConversion(
      0,
      0,
      defaultRate.value || 'usd',
      rate || 0,
      inputMode.value
    );
    return;
  }
  const numValue = parseFormattedNumber(value);
  if (numValue === 0) {
    resultValue.value = '0,00';
    shareStore.setConversion(
      0,
      0,
      defaultRate.value || 'usd',
      rate || 0,
      inputMode.value
    );
    return;
  }
  let result = inputMode.value === 'dollar' ? numValue * rate : numValue / rate;
  result = Math.round(result * 100) / 100;
  resultValue.value = formatNumber(result);
  shareStore.setConversion(
    numValue,
    result,
    defaultRate.value || 'usd',
    rate,
    inputMode.value
  );
};

const handleInput = (value) => {
  inputValue.value = value;
  calculateResult(value);
  if (!isSettingQuickAmount.value) {
    selectedQuickAmount.value = null;
  }
};

const setQuickAmount = (amount) => {
  isSettingQuickAmount.value = true;
  const formattedValue = amount.toFixed(2).replace('.', ',');
  inputValue.value = formattedValue;
  calculateResult(amount);
  selectedQuickAmount.value = amount;
  nextTick(() => {
    isSettingQuickAmount.value = false;
  });
};

const resetInput = () => {
  const defaultValue = inputMode.value === 'dollar' ? 1 : getCurrentRate();
  const formattedValue = defaultValue.toFixed(2).replace('.', ',');
  inputValue.value = formattedValue;
  calculateResult(defaultValue);
  selectedQuickAmount.value = null;
};

const isAtDefault = computed(() => {
  const current = parseFormattedNumber(inputValue.value);
  const def = inputMode.value === 'dollar' ? 1 : getCurrentRate();
  return Math.abs(current - def) < 0.005; // tolerancia 2 decimales
});

const handleMoneyFocus = () => {
  if (isAtDefault.value) {
    const zero = '0,00';
    inputValue.value = zero;
    selectedQuickAmount.value = null;
    calculateResult(zero);
  }
};
// Fecha última actualización (BCV)
const lastUpdateText = computed(() => {
  if (!dolar.value) return '';
  const raw = dolar.value.date || dolar.value?.bcv_today?.date || '';
  if (!raw) return '';
  return format_day_month_year_spanish(raw) || raw;
});
const copy = (value) => {
  copyToClipboard(String(value))
    .then(() => {
      Notify.create({
        message: '¡Copiado al portapapeles!',
        icon: 'check_circle',
        color: 'positive',
        position: 'top',
        timeout: 2000,
      });
    })
    .catch(() => {
      Notify.create({
        message: 'Error al copiar',
        icon: 'error',
        color: 'negative',
        position: 'top',
      });
    });
};

const buttonLabel = computed(() => {
  return defaultRate.value ? defaultRate.value.toUpperCase() : 'USD';
});

const buttonColor = computed(() => {
  const colors = {
    usd: '#2196f3',
    eur: '#4caf50',
    cny: '#ff9800',
    try: '#9c27b0',
    rub: '#e91e63',
    bcv: '#00bcd4',
  };
  return colors[defaultRate.value] || '#9e9e9e';
});

const buttonToggleColor = computed(() => {
  const colors = {
    usd: 'blue-5',
    eur: 'green-5',
    cny: 'orange-5',
    try: 'purple-5',
    rub: 'pink-5',
    bcv: 'cyan-5',
  };
  return colors[defaultRate.value] || 'grey-5';
});

const toggleButton = () => {
  const allRates = Object.keys(dolar.value).filter(
    (key) => key !== 'date' && key !== 'paralelo'
  );
  const favs = (favorites?.value || []).filter((r) => allRates.includes(r));
  const availableRates = favs.length ? favs : allRates;
  if (!availableRates.length) return;
  const currentIdx = availableRates.indexOf(defaultRate.value);
  const nextIdx = (currentIdx + 1) % availableRates.length;
  useDolar().setDefaultRate(availableRates[nextIdx]);
  calculateResult(inputValue.value);
};

const refreshRate = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    const store = useDolar();
    const res = await getDolar();
    if (res && res.dolar) {
      store.setDolar(res.dolar);
      calculateResult(inputValue.value);
      Notify.create({
        message: 'Tasa actualizada',
        icon: 'check_circle',
        color: 'positive',
        position: 'top',
        timeout: 1500,
      });
    }
  } catch (e) {
    Notify.create({
      message: 'No se pudo actualizar la tasa',
      icon: 'error',
      color: 'negative',
      position: 'top',
    });
  } finally {
    isRefreshing.value = false;
  }
};

// Historial recibido: payload { date, historial, isToday } | null
const onMonthHistory = (payload) => {
  if (!payload) {
    historicalInfo.value = null;
    historicalRate.value = null;
    historicalRates.value = null;
    calculateResult(inputValue.value);
    return;
  }
  historicalInfo.value = payload;
  historicalRate.value = null;
  historicalRates.value = null;
  const raw = payload.historial;
  let record = null;
  if (raw) {
    if (Array.isArray(raw) && raw.length) {
      record = raw[0];
    } else if (typeof raw === 'object') {
      // Formatos posibles:
      // A: { current_page, data: [ { bcv, bcv_today } ] }
      // B: { success, data: { current_page, data: [ ... ] } }
      if (Array.isArray(raw.data)) {
        record = raw.data[0];
      } else if (raw.data && Array.isArray(raw.data.data)) {
        record = raw.data.data[0];
      } else if (
        raw.data &&
        raw.data.data &&
        typeof raw.data.data === 'object'
      ) {
        // en caso extremo data.data no sea array
        record = raw.data.data;
      }
    }
  }

  if (!record) {
    console.warn('[Historial] No se encontró registro en estructura:', raw);
  } else {
    if (record.bcv_today && typeof record.bcv_today === 'object') {
      historicalRates.value = { ...record.bcv_today };
      if (record.bcv != null && historicalRates.value.bcv == null) {
        historicalRates.value.bcv = record.bcv;
      }
    } else {
      const tmp = {};
      for (const k of Object.keys(record)) {
        const v = record[k];
        if (typeof v === 'number') tmp[k] = v;
        else if (typeof v === 'string') {
          const n = parseFloat(v.replace(',', '.'));
          if (!isNaN(n)) tmp[k] = n;
        }
      }
      if (Object.keys(tmp).length) historicalRates.value = tmp;
    }
  }

  if (historicalRates.value) {
    const keyRaw = (defaultRate.value || '').toString().toLowerCase();
    const mappedKey = keyRaw === 'tasa bcv' ? 'bcv' : keyRaw;
    const sel =
      historicalRates.value[mappedKey] ??
      historicalRates.value.usd ??
      historicalRates.value.bcv;
    if (sel != null) {
      const num = parseFloat(String(sel));
      if (!isNaN(num) && num > 0) {
        historicalRate.value = num;
        console.log(
          '[Historial] Asignada historicalRate',
          num,
          'para',
          mappedKey
        );
      } else {
        console.warn('[Historial] Valor no numérico para', mappedKey, sel);
      }
    }
  }

  calculateResult(inputValue.value);
};

// Watchers
watch(inputMode, (val, oldVal) => {
  let currentValue = inputValue.value;
  let rate = getCurrentRate();
  let parsed = parseFormattedNumber(currentValue);
  if (val === 'bolivar' && oldVal === 'dollar') {
    inputValue.value = formatNumber(parsed * rate);
    calculateResult(inputValue.value);
  } else if (val === 'dollar' && oldVal === 'bolivar') {
    inputValue.value = formatNumber(parsed / rate);
    calculateResult(inputValue.value);
  }
  selectedQuickAmount.value = null;
});

watch(defaultRate, () => {
  if (historicalRates.value) {
    const sel =
      historicalRates.value[defaultRate.value] ??
      historicalRates.value.usd ??
      historicalRates.value.bcv;
    const num = parseFloat(String(sel));
    if (!isNaN(num) && num > 0) {
      historicalRate.value = num;
      console.log(
        '[Historial] Re-asignada historicalRate tras cambio defaultRate',
        num
      );
    }
  }
  calculateResult(inputValue.value);
});

// Recalcular automáticamente cuando cambia la tasa histórica calculada
watch(historicalRate, (val, oldVal) => {
  if (val !== oldVal) {
    console.log('[Historial] Watch historicalRate cambio', oldVal, '->', val);
    calculateResult(inputValue.value);
  }
});

// Por si en el futuro cambiamos el contenido del objeto sin cambiar historicalRate directo
watch(historicalRates, () => {
  if (historicalRates.value && historicalRate.value != null) {
    console.log(
      '[Historial] Watch historicalRates recalculando con historicalRate',
      historicalRate.value
    );
    calculateResult(inputValue.value);
  }
});

onMounted(() => {
  resetInput();
});
</script>

<style lang="scss" scoped>
.converter-wrapper {
  padding: 16px;
  padding-top: 0px;
  max-width: 420px;
  margin: 0 auto;
}

.converter-header {
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 8px;
}

.update-bcv-text {
  font-size: 12px;
  color: #ffffff;
  opacity: 0.9;
  font-weight: 500;
}

.rate-selector-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.rate-selector-btn {
  min-width: 80px;
  height: 40px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.quick-amounts-section {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
  padding-left: 4px;
}

.quick-amounts-grid-improved {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  gap: 12px;
  grid-auto-flow: row dense;
  width: 100%;
  max-width: 320px;
}

.quick-amount-btn-improved {
  height: 35px;
  font-weight: 500;
  transition: all 0.2s ease;
  border-width: 1.5px;

  &:hover {
    transform: translateY(-1px);
  }
}

.quick-amount-selected {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(255, 193, 7, 0.35);
  border-width: 2px !important;
}

.converter-main {
  margin-top: 0px;
}

.converter-card-improved {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.mode-toggle-improved {
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;

  :deep(.q-btn) {
    padding: 4px;
    width: 45px;
    font-weight: 500;
  }
}

.input-section {
  margin-bottom: 12px;
}

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  padding-left: 4px;
}

.input-field-improved {
  :deep(.q-field__control) {
    min-height: 56px;
  }

  :deep(.q-field__native) {
    padding: 0 16px;
  }
}

.input-text-improved {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.copy-btn-improved {
  opacity: 0.6;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}

.result-container-improved {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0.7rem;
  border-radius: 16px;
  border: 2px solid;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
}

.result-currency-badge {
  flex-shrink: 0;
}

.result-value-improved {
  flex: 1;
  font-size: 28px;
  font-weight: 800;
  color: white;
  text-align: center;
  letter-spacing: -0.5px;
}

.result-copy-btn {
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}

.historical-badge {
  cursor: pointer;
}

@media (max-width: 480px) {
  .converter-wrapper {
    padding: 12px;
  }

  .quick-amounts-grid-improved {
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 12px;
  }

  .quick-amount-btn-improved {
    height: 35px;
    font-size: 14px;
  }

  .result-value-improved {
    font-size: 24px;
  }
}
</style>
