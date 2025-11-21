<template>
  <div class="full-width q-mt-md">
    <div class="row flex-center q-gutter-xs">
      <q-btn
        outline
        class="btn-label btn-date-picker"
        :class="{ 'historical-date-active': isHistoricalDate }"
        :color="isHistoricalDate ? 'warning' : 'grey-3'"
        icon="event"
        no-caps
        :label="selected_date_label"
        @click="show_month_picker = true"
      />
      <q-btn
        v-if="isHistoricalDate"
        unelevated
        class="btn-today"
        color="blue-6"
        text-color="white"
        dense
        no-caps
        label="Hoy"
        @click="goToday"
      >
        <q-tooltip>Volver a hoy</q-tooltip>
      </q-btn>
    </div>
    <q-dialog v-model="show_month_picker">
      <q-card
        flat
        bordered
        class="bg-dark text-white q-pa-sm"
        style="width: 96%; max-width: 400px"
      >
        <q-card-section class="text-h6 text-center">
          Selecciona una fecha
        </q-card-section>
        <q-date
          style="width: 96%; max-width: 400px"
          v-model="date_model"
          minimal
          color="blue-5"
          dark
          :navigation-min-year="current_year"
          :navigation-max-year="current_year"
          :events="calendar_events"
          :event-color="calendar_event_color"
          :options="is_selectable_date"
          @update:model-value="apply_date"
        />
        <q-card-actions align="right">
          <q-btn class="full-width" flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { getHistorial } from 'src/services/dolar.js';
import { format_day_month_year_spanish } from 'src/utils/date_format';

// Emits the fetched history so parent can consume if needed
interface HistorialPayload {
  date: string;
  historial: unknown; // ajustar si se conoce estructura
  isToday: boolean;
}
const emit = defineEmits<{
  (e: 'update:history', value: HistorialPayload | null): void;
}>();

// estado base
const show_month_picker = ref(false);
const date_model = ref<string | null>(null);
const loading_historial = ref(false);
const is_today_active = ref(true);
const isHistoricalDate = computed(() => !is_today_active.value);

// fecha "hoy" y año límite navegación
const today_date = new Date();
const current_year = today_date.getFullYear();

// inicializar fecha modelo (hoy)
date_model.value = `${current_year}/${String(
  today_date.getMonth() + 1
).padStart(2, '0')}/${String(today_date.getDate()).padStart(2, '0')}`;

// etiqueta para botón (día mes, año)
const selected_date_label = computed(() =>
  date_model.value ? format_day_month_year_spanish(date_model.value) : 'Fecha'
);

// string de hoy en formato del componente
const today_str = `${current_year}/${String(today_date.getMonth() + 1).padStart(
  2,
  '0'
)}/${String(today_date.getDate()).padStart(2, '0')}`;

// eventos para marcar hoy y (opcional) también la fecha seleccionada
const calendar_events = computed(() => {
  const set = new Set<string>();
  set.add(today_str);
  if (date_model.value) set.add(date_model.value);
  return Array.from(set);
});

const calendar_event_color = (date_str: string) => {
  const is_selected = date_str === date_model.value;
  const is_today = date_str === today_str;
  if (is_selected && is_today) return 'amber';
  if (is_selected) return 'amber';
  if (is_today) return 'grey-5'; // hoy tono sutil
  return 'primary';
};

// validar si una fecha es seleccionable (no mayor a hoy)
// Antes se usaba 23:59:59 y eso hacía que el día actual apareciera deshabilitado (porque aún no ha llegado el final del día).
// Ahora normalizamos ambas fechas al inicio del día para permitir seleccionar hoy.
const today_floor = new Date(
  today_date.getFullYear(),
  today_date.getMonth(),
  today_date.getDate()
);
const is_selectable_date = (date_str: string) => {
  const [y, m, d] = date_str.split('/').map(Number);
  const candidate = new Date(y, m - 1, d); // 00:00:00 local
  return candidate.getTime() <= today_floor.getTime();
};

function format_date_for_api(model: string | null): string | null {
  if (!model) return null;
  const [y, m, d] = model.split('/');
  return `${y}-${m}-${d}`;
}

function is_same_day_string(iso_day: string, reference_date: Date) {
  const [y, m, d] = iso_day.split('-').map(Number);
  return (
    y === reference_date.getFullYear() &&
    m === reference_date.getMonth() + 1 &&
    d === reference_date.getDate()
  );
}

const fetch_historial = async () => {
  const day = format_date_for_api(date_model.value);
  if (!day) return;
  loading_historial.value = true;
  try {
    const res = await getHistorial(day, day, 5);
    is_today_active.value = is_same_day_string(day, today_date);
    emit('update:history', {
      date: day,
      historial: res,
      isToday: is_today_active.value,
    });
  } catch (e) {
    console.error('Error historial día', e);
  } finally {
    loading_historial.value = false;
  }
};

const apply_date = () => {
  show_month_picker.value = false;
};

onMounted(fetch_historial);

watch(
  () => date_model.value,
  (val, old_val) => {
    if (val && val !== old_val) fetch_historial();
  }
);

// Volver rápidamente al día actual
function goToday() {
  if (!isHistoricalDate.value) return; // ya estamos en hoy
  date_model.value = `${current_year}/${String(
    today_date.getMonth() + 1
  ).padStart(2, '0')}/${String(today_date.getDate()).padStart(2, '0')}`;
  // fetch_historial será llamado por el watcher
}
</script>

<style lang="scss" scoped>
.btn-label.btn-date-picker {
  width: 100%;
  max-width: 200px;
  font-size: 14px;
}

.btn-today {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 0 12px;
  height: 35px; // igual altura perceptual al date button
  display: flex;
  align-items: center;
}

.historical-date-active {
  --tw-ring-color: transparent; // evita halos raros
  border-width: 2px;
  font-weight: 600;
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.25);
}
</style>
