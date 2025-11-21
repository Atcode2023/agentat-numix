<template>
  <q-page class="q-pa-md history-charts-page">
    <div class="page-header q-mb-md">
      <div class="row items-center">
        <div class="col-6">
          <q-btn
            v-for="opt in periodOptions"
            :key="opt.value"
            dense
            no-caps
            unelevated
            size="sm"
            :color="period === opt.value ? 'blue' : 'accent'"
            text-color="white"
            :label="opt.label"
            @click="setPeriod(opt.value)"
          />
        </div>
        <div class="col-6">
          <q-select
            dense
            filled
            dark
            v-model="rateKey"
            :options="availableRates"
            emit-value
            map-options
            @update:model-value="handleRateChange"
            :loading="loading"
            popup-content-class="bg-dark"
            class="full-width"
            behavior="menu"
          />
        </div>
      </div>
    </div>

    <!-- Mobile-optimized statistics cards with better visual hierarchy -->
    <div class="stats-section q-mb-lg">
      <div class="row q-col-gutter-sm">
        <div class="col-6 col-sm-3">
          <q-card class="stat-card enhanced-stat-card">
            <q-card-section class="q-pa-md text-center">
              <div class="stat-icon q-mb-xs">
                <q-icon name="analytics" size="20px" class="text-primary" />
              </div>
              <div class="text-caption text-grey-4 q-mb-xs">Promedio</div>
              <div class="text-subtitle1 text-white stat-value">
                {{ avgDisplay }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-sm-3">
          <q-card class="stat-card enhanced-stat-card">
            <q-card-section class="q-pa-md text-center">
              <div class="stat-icon q-mb-xs">
                <q-icon name="trending_up" size="20px" class="text-positive" />
              </div>
              <div class="text-caption text-grey-4 q-mb-xs">Máximo</div>
              <div class="text-subtitle1 text-white stat-value">
                {{ maxDisplay }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-sm-3">
          <q-card class="stat-card enhanced-stat-card">
            <q-card-section class="q-pa-md text-center">
              <div class="stat-icon q-mb-xs">
                <q-icon name="trending_down" size="20px" class="text-info" />
              </div>
              <div class="text-caption text-grey-4 q-mb-xs">Mínimo</div>
              <div class="text-subtitle1 text-white stat-value">
                {{ minDisplay }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-sm-3">
          <q-card class="stat-card enhanced-stat-card">
            <q-card-section class="q-pa-md text-center">
              <div class="stat-icon q-mb-xs">
                <q-icon
                  :name="variation >= 0 ? 'arrow_upward' : 'arrow_downward'"
                  size="20px"
                  :class="variation >= 0 ? 'text-positive' : 'text-negative'"
                />
              </div>
              <div class="text-caption text-grey-4 q-mb-xs">Variación %</div>
              <div
                class="text-subtitle1 stat-value"
                :class="variation >= 0 ? 'text-positive' : 'text-negative'"
              >
                {{ variationDisplay }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Enhanced chart wrapper with better mobile presentation -->
    <div v-if="series.length" class="chart-section">
      <q-card class="chart-wrapper enhanced-chart-wrapper">
        <q-card-section
          class="q-pa-sm q-pb-none flex items-center justify-between chart-toolbar"
        >
          <div class="text-subtitle2 text-white">{{ periodLabel }}</div>
          <div class="flex items-center q-gutter-sm">
            <q-btn
              dense
              round
              flat
              color="white"
              icon="refresh"
              :loading="loading"
              @click="manualRefresh"
              aria-label="Recargar"
            />
            <q-btn
              dense
              no-caps
              unelevated
              padding="6px 14px"
              color="warning"
              icon="download"
              label="Descargar"
              @click="exportCsv"
            />
          </div>
        </q-card-section>
        <q-card-section class="q-pt-sm q-pb-md q-px-xs chart-container">
          <div class="chart-inner">
            <apexchart
              type="line"
              height="360"
              :options="chartOptions"
              :series="series"
            />
            <div v-if="loading" class="chart-loading-overlay flex flex-center">
              <q-spinner color="primary" size="40px" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div v-else class="empty-state">
      <div class="text-center q-py-xl">
        <q-icon
          :name="loading ? 'hourglass_empty' : 'bar_chart'"
          size="48px"
          class="text-grey-6 q-mb-md"
        />
        <div class="text-grey-5 text-body1">
          {{ loading ? 'Cargando datos...' : 'Sin datos disponibles' }}
        </div>
        <div class="text-grey-6 text-caption q-mt-xs" v-if="!loading">
          Selecciona un rango de fechas para ver el historial
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { getHistorial } from 'src/services/dolar.js';
import ApexChart from 'vue3-apexcharts';
// import { format_day_month_year_spanish } from 'src/utils/date_format'; // no usado actualmente

// Util día semana (ASCII sin acentos para Excel)
function weekdayShort(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return '';
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const names = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  return names[day] || '';
}

const loading = ref(false);
const rawData = ref([]); // { date, value }
const rawOriginal = ref([]); // lista original (para detectar tasas)
const rateKey = ref('bcv');
const availableRates = ref([{ label: 'BCV', value: 'bcv' }]);
// Rango de fechas
const today = new Date();
const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
const pad = (n) => String(n).padStart(2, '0');
const startDate = ref(
  `${defaultStart.getFullYear()}-${pad(defaultStart.getMonth() + 1)}-${pad(
    defaultStart.getDate()
  )}`
);
const endDate = ref(
  `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
);

// Periodos predefinidos
const period = ref('week'); // week | month | prev-month
const periodOptions = [
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Mes anterior', value: 'prev-month' },
];

function setPeriod(val) {
  if (period.value !== val) {
    period.value = val;
  }
}

function computePeriod(kind) {
  const now = new Date();
  if (kind === 'week') {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { start, end };
  }
  if (kind === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { start, end };
  }
  // prev-month
  const pm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const py = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const start = new Date(py, pm, 1);
  const end = new Date(py, pm + 1, 0);
  return { start, end };
}

function applyCurrentPeriod() {
  const { start, end } = computePeriod(period.value);
  startDate.value = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
    start.getDate()
  )}`;
  endDate.value = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(
    end.getDate()
  )}`;
}

const periodLabel = computed(() => {
  if (period.value === 'week') return 'Últimos 7 días';
  if (period.value === 'month') return 'Mes actual';
  if (period.value === 'prev-month') return 'Mes anterior';
  return '';
});

function parseRecord(rec) {
  // adapt a varias estructuras posibles
  // buscamos rec.bcv_today[rateKey] o rec[rateKey]
  if (!rec) return null;
  let container = rec.bcv_today || rec;
  if (!container) return null;
  const date = (container.date || rec.date || '').slice(0, 10);
  const valRaw = container[rateKey.value] || container.usd || container.bcv;
  if (!date || valRaw == null) return null;
  const num = parseFloat(String(valRaw).replace(',', '.'));
  if (isNaN(num)) return null;
  return { date, value: num };
}
function detectAvailableRates(list) {
  if (!list.length) return;
  const container = list[0].bcv_today || list[0];
  const keys = Object.keys(container);
  const numericKeys = keys.filter((k) => {
    if (k === 'date') return false;
    const v = container[k];
    if (v == null) return false;
    const n = parseFloat(String(v).replace(',', '.'));
    return !isNaN(n);
  });
  if (!numericKeys.length) return;
  availableRates.value = numericKeys.map((k) => ({
    label: k.toUpperCase(),
    value: k,
  }));
  if (!numericKeys.includes(rateKey.value)) rateKey.value = numericKeys[0];
}

async function fetchData() {
  loading.value = true;
  try {
    const resp = await getHistorial(startDate.value, endDate.value, 400);
    // resp puede ser: { data: { data: [...] } } , { data: [...] } , [...]
    let list = [];
    if (Array.isArray(resp)) list = resp;
    else if (resp?.data?.data) list = resp.data.data;
    else if (resp?.data) list = resp.data;
    rawOriginal.value = list;
    detectAvailableRates(list);
    const mapped = list.map(parseRecord).filter(Boolean);
    // Deduplicar por fecha conservando último
    const map = new Map();
    mapped.forEach((r) => map.set(r.date, r));
    rawData.value = Array.from(map.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    rebuildSeries();
  } catch (e) {
    console.error('Error historial', e);
  } finally {
    loading.value = false;
  }
}
// Construcción series única
const series = ref([]);
function rebuildSeries() {
  if (!rawData.value.length) {
    series.value = [];
    return;
  }
  series.value = [
    {
      name: rateKey.value.toUpperCase(),
      data: rawData.value.map((r) => r.value),
    },
  ];
}

// Re-map rawOriginal list into rawData using current rateKey (for stats & chart)
function remapRawData() {
  if (!rawOriginal.value.length) {
    rawData.value = [];
    return;
  }
  const mapped = rawOriginal.value.map(parseRecord).filter(Boolean);
  const map = new Map();
  mapped.forEach((r) => map.set(r.date, r));
  rawData.value = Array.from(map.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

const categories = computed(() => {
  if (!rawData.value.length) return [];
  const months = new Set(rawData.value.map((r) => r.date.slice(5, 7)));
  // Si cruza meses mostrar MM-DD, si no solo día
  const multi = months.size > 1;
  return rawData.value.map((r) =>
    multi ? r.date.slice(5, 10) : r.date.slice(8, 10)
  );
});

const chartOptions = computed(() => {
  const values = rawData.value.map((r) => r.value);
  const dates = rawData.value.map((r) => r.date);
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const last = values.length ? values[values.length - 1] : 0;
  const minIdx = values.indexOf(minVal);
  const maxIdx = values.indexOf(maxVal);
  const lastIdx = values.length - 1;
  // Reducir labels si hay muchos puntos
  const labelFormatter = (val, index) => {
    const total = dates.length;
    if (total > 20 && index % 2 !== 0) return '';
    return val;
  };
  const annotations = [];
  if (values.length) {
    annotations.push(
      {
        x: categories.value[minIdx],
        y: minVal,
        marker: { size: 3, fillColor: '#29b6f6', strokeColor: '#29b6f6' },
        label: { style: { background: '#29b6f6' } },
      },
      {
        x: categories.value[maxIdx],
        y: maxVal,
        marker: { size: 3, fillColor: '#66bb6a', strokeColor: '#66bb6a' },
        label: { style: { background: '#66bb6a' } },
      },
      {
        x: categories.value[lastIdx],
        y: last,
        marker: { size: 3, fillColor: '#ab47bc', strokeColor: '#ab47bc' },
        label: { style: { background: '#ab47bc' } },
      }
    );
  }
  return {
    chart: {
      foreColor: '#ccc',
      toolbar: { show: false },
      animations: { enabled: true },
      zoom: { enabled: true },
      selection: { enabled: false },
    },
    stroke: { curve: 'smooth', width: 1 },
    dataLabels: { enabled: false },
    grid: { borderColor: 'rgba(255,255,255,0.1)' },
    xaxis: {
      categories: categories.value,
      title: { text: 'Días' },
      labels: { rotate: -40, formatter: labelFormatter },
    },
    yaxis: {
      labels: { formatter: (v) => v.toFixed(2) },
    },
    tooltip: {
      theme: 'dark',
      x: {
        formatter: (_val, opts) => dates[opts.dataPointIndex] || _val,
      },
      y: {
        formatter: (v) =>
          v.toLocaleString('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        opacityFrom: 1,
        opacityTo: 1,
      },
    },
    markers: {
      colors: ['#42a5f5'],
      strokeColors: '#1e88e5',
      size: 0,
      hover: { size: 5 },
    },
    annotations: {
      points: annotations,
    },
    colors: ['#42a5f5'],
  };
});

// Métricas
const avg = computed(() => {
  if (!rawData.value.length) return 0;
  return rawData.value.reduce((s, r) => s + r.value, 0) / rawData.value.length;
});
const max = computed(() =>
  rawData.value.reduce((m, r) => (r.value > m ? r.value : m), 0)
);
const min = computed(() =>
  rawData.value.reduce(
    (m, r) => (r.value < m ? r.value : m),
    rawData.value[0]?.value || 0
  )
);
const variation = computed(() => {
  if (rawData.value.length < 2) return 0;
  const first = rawData.value[0].value;
  const last = rawData.value[rawData.value.length - 1].value;
  if (first === 0) return 0;
  return ((last - first) / first) * 100;
});

function fmt(n) {
  return n.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
const avgDisplay = computed(() => fmt(avg.value));
const maxDisplay = computed(() => fmt(max.value));
const minDisplay = computed(() => fmt(min.value));
const variationDisplay = computed(
  () => `${variation.value >= 0 ? '+' : ''}${variation.value.toFixed(2)}%`
);

function exportCsv() {
  if (!rawData.value.length) return;
  const header = 'dia,fecha,valor';
  const rows = rawData.value
    .map((r) => `${weekdayShort(r.date)},${r.date},${r.value.toFixed(4)}`)
    .join('\n');
  const bom = '\ufeff';
  const blob = new Blob([bom + header + '\n' + rows], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `historial_${startDate.value}_a_${endDate.value}_${rateKey.value}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  fetchData();
});

// When rateKey changes we must rebuild rawData (different field per record) then series
watch(rateKey, () => {
  remapRawData();
  rebuildSeries();
});
watch([startDate, endDate], () => fetchData());
watch(period, () => {
  applyCurrentPeriod();
});

function handleRateChange() {
  // Explicit handler from select
  remapRawData();
  rebuildSeries();
}

function manualRefresh() {
  fetchData();
}

// Inicializar periodo al cargar
applyCurrentPeriod();
</script>

<script>
export default {
  components: { apexchart: ApexChart },
};
</script>

<style scoped lang="scss">
.history-charts-page {
  max-width: 1024px;
  margin: 0 auto;

  @media (max-width: 599px) {
    padding: 12px;
  }
}

.date-range-section {
  .mobile-input {
    .q-field__control {
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    &:hover .q-field__control {
      background: rgba(255, 255, 255, 0.08);
    }
  }
}

.controls-section {
  .mobile-select {
    .q-field__control {
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    &:hover .q-field__control {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .chart-controls {
    .control-label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .chart-type-buttons {
      display: flex;
      gap: 4px;

      .chart-btn {
        flex: 1;
        border-radius: 8px;
        transition: all 0.2s ease;
        min-height: 36px;

        &:hover {
          transform: translateY(-1px);
        }
      }
    }
  }

  .action-buttons {
    .action-btn {
      border-radius: 8px;
      transition: all 0.2s ease;
      min-height: 36px;
      min-width: 36px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
      }
    }

    .ma-select {
      .q-field__control {
        border-radius: 8px;
        min-height: 36px;
      }
    }
  }
}

.stats-section {
  .enhanced-stat-card {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    border-radius: 16px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
    }

    .stat-icon {
      opacity: 0.8;
    }

    .stat-value {
      font-weight: 600;
      font-size: 1.1rem;
      letter-spacing: -0.5px;
    }

    @media (max-width: 599px) {
      .q-card-section {
        padding: 12px 8px;
      }

      .stat-value {
        font-size: 1rem;
      }
    }
  }
}

.chart-section {
  .enhanced-chart-wrapper {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.12);
    }

    @media (max-width: 599px) {
      border-radius: 16px;

      .q-card-section {
        padding: 12px;
      }
    }
  }
}

.empty-state {
  .q-icon {
    opacity: 0.6;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.3;
    }
  }
}

.stat-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.chart-wrapper {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
}

.chart-container {
  position: relative;
  .chart-inner {
    position: relative;
  }
  .chart-loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(2px);
    z-index: 10;
  }
}

@media (max-width: 599px) {
  .q-btn {
    min-height: 44px;
    min-width: 44px;
  }

  .q-field {
    min-height: 44px;
  }
}
</style>
