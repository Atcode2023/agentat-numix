<template>
  <q-layout view="hHh Lpr lFf">
    <q-header class="header-container">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title class="text-center flex justify-center items-start">
          <div class="logo-container">
            <p class="text-h5 text-bold q-mb-none">
              Nu<span class="text-bold text-blue">Mix</span>
            </p>
          </div>
        </q-toolbar-title>

        <!-- <q-btn
          flat
          dense
          round
          icon="notifications"
          @click="notificationsOpen = !notificationsOpen"
        >
          <q-badge color="red" floating>3</q-badge>
        </q-btn> -->
        <q-btn
          flat
          dense
          round
          icon="help_outline"
          @click="startGlobal"
          class="q-mr-sm"
          aria-label="Ayuda"
        />
        <ShareButton />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      :width="300"
      :breakpoint="500"
      overlay
      bordered
      class="bg-dark text-white"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <!-- <q-item-label header class="flex justify-center q-py-xs">
            <q-img
              src="/logo.png"
              :ratio="1 / 1"
              width="170px"
              spinner-color="primary"
              spinner-size="82px"
            />
          </q-item-label> -->
          <q-item-label
            header
            class="text-white text-center text-h5 text-bold q-pt-xs"
          >
            Tu Dolar Bot
          </q-item-label>

          <q-item clickable v-ripple to="/" exact>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Inicio</q-item-section>
          </q-item>

          <!-- <q-item clickable v-ripple to="/records" exact>
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>Historial</q-item-section>
          </q-item> -->

          <q-item clickable v-ripple to="/history-charts" exact>
            <q-item-section avatar>
              <q-icon name="show_chart" />
            </q-item-section>
            <q-item-section>Gráficas</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/profiles" exact>
            <q-item-section avatar>
              <q-icon name="payments" />
            </q-item-section>
            <q-item-section>Datos de Transferencia</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/map" exact>
            <q-item-section avatar>
              <q-icon name="map" />
            </q-item-section>
            <q-item-section>Mapa</q-item-section>
          </q-item>

          <!-- <q-item-label header class="text-grey-4 q-py-md"
            >CONFIGURACIÓN</q-item-label
          >

          <q-item>
            <q-item-section avatar>
              <q-icon name="dark_mode" />
            </q-item-section>
            <q-item-section>Modo Oscuro</q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="isDarkMode"
                @update:model-value="toggleDarkMode"
                color="green"
              />
            </q-item-section>
          </q-item> -->
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <Notifications
      v-model="notificationsOpen"
      :notifications="notifications"
      @update="notificationsOpen = false"
    />

    <q-page-container
      class="layout-container with-footer-padding"
      :class="{ 'bg-custom': isDarkMode, 'bg-dark': !isDarkMode }"
      v-touch-pan.horizontal.mouse="onPan"
      :style="pageTransformStyle"
    >
      <router-view />
    </q-page-container>

    <q-footer class="footer-container" bordered>
      <q-tabs
        v-model="activeTab"
        class="text-white"
        active-color="blue-5"
        indicator-color="blue-5"
        align="justify"
      >
        <q-route-tab name="home" icon="home" to="/" exact />
        <q-route-tab name="sales" icon="storefront" :to="{ name: 'sales' }" />
        <q-route-tab
          name="payments"
          icon="credit_card"
          :to="{ name: 'profiles' }"
        />
        <q-route-tab name="charts" icon="map" to="map" />
      </q-tabs>
    </q-footer>
    <PriceDialog />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDark } from 'src/stores/dark';
import { storeToRefs } from 'pinia';
import Notifications from 'src/components/Notifications.vue';
import ShareButton from 'src/components/ShareButton.vue';
import PriceDialog from 'src/components/Price-Dolar.vue';
import { useShareStore } from 'src/stores/share';
import { useTour } from 'src/composables/useTour';

const { isDarkMode } = storeToRefs(useDark());
// const darkStore = useDark();

const leftDrawerOpen = ref(false);
const notificationsOpen = ref(false);
const activeTab = ref('');
const router = useRouter();
const route = useRoute();

const dragX = ref(0);
const transitionEnabled = ref(true);
const orderedTabs = ['home', 'sales', 'payments'];

const currentTabIndex = computed(() => {
  // Normalizamos la ruta actual a las claves usadas en orderedTabs
  let normalized: string;
  if (route.path === '/') normalized = 'home';
  else if (route.name === 'sales') normalized = 'sales';
  else if (route.name === 'profiles') normalized = 'payments';
  else normalized = 'unknown';
  return orderedTabs.indexOf(normalized);
});

const pageTransformStyle = computed(() => ({
  transform: `translateX(${dragX.value}px)`,
  transition: transitionEnabled.value
    ? 'transform 200ms cubic-bezier(.4,0,.2,1)'
    : 'none',
  // Permit both axes so horizontal pan no se bloquee en móviles
  touchAction: 'pan-x pan-y',
}));

interface PanEvt {
  isFirst: boolean;
  isFinal: boolean;
  offset: { x: number; y: number };
}

// Navegación de tabs (home -> sales -> payments)
const goToTab = (tab: string) => {
  if (tab === 'home') router.push('/');
  else if (tab === 'sales') router.push({ name: 'sales' });
  else if (tab === 'payments') router.push({ name: 'profiles' });
};
// Control de paneo manual solamente (sin onSwipe) para evitar salto doble
const navigating = ref(false);
const TRIGGER_RATIO = 0.28; // 28% del ancho para cambiar (menos sensible)

const onPan = (e: PanEvt) => {
  if (currentTabIndex.value === -1) return;
  if (e.isFirst) {
    transitionEnabled.value = false;
  }

  if (!e.isFinal) {
    const atFirst = currentTabIndex.value === 0;
    const atLast = currentTabIndex.value === orderedTabs.length - 1;
    let nextX = e.offset.x;
    if ((atFirst && nextX > 0) || (atLast && nextX < 0)) {
      nextX *= 0.35; // resistance at edges
    }
    dragX.value = nextX;
  } else {
    const traveled = dragX.value;
    const width = window.innerWidth;
    const trigger = width * TRIGGER_RATIO;
    transitionEnabled.value = true;
    if (!navigating.value && Math.abs(traveled) > trigger) {
      if (traveled < 0 && currentTabIndex.value < orderedTabs.length - 1) {
        navigating.value = true;
        const next = orderedTabs[currentTabIndex.value + 1];
        goToTab(next);
      } else if (traveled > 0 && currentTabIndex.value > 0) {
        navigating.value = true;
        const prev = orderedTabs[currentTabIndex.value - 1];
        goToTab(prev);
      }
      setTimeout(() => (navigating.value = false), 350); // cooldown para evitar doble salto
    }
    dragX.value = 0;
  }
};

// Resolver del tab activo (solo home / payments)
const resolveActiveTab = () => {
  if (route.path === '/' || route.name === 'home') return 'home';
  if (route.name === 'sales') return 'sales';
  if (route.name === 'profiles') return 'payments';
  return '';
};

// Mantener footer tab sincronizado con la ruta (inmediato e in-route changes)
watch(
  () => route.fullPath,
  () => {
    activeTab.value = resolveActiveTab();
    dragX.value = 0;
  },
  { immediate: true }
);

// Datos de ejemplo para notificaciones
const notifications = ref([
  {
    title: '¡Torneo de Counter-Strike!',
    message: 'Aprovecha esta promoción especial',
    date: '5/4/2025, 0:43:39',
    icon: 'sports',
    hasReward: true,
    hasPoints: true,
    image:
      'https://img.freepik.com/free-psd/game-night-template-design_23-2151054289.jpg?t=st=1744212437~exp=1744216037~hmac=58358efe0d7d3936b8cc87e429dfb32549f2e5901045bffe94859f6d691d43e4&w=1380',
  },
  {
    title: '¡Nada como la comida Méxicana!',
    message: 'Aprovecha esta promoción especial',
    date: '29/3/2025, 0:43:20',
    icon: 'sports',
    hasReward: true,
    hasPoints: true,
    image:
      'https://img.freepik.com/free-vector/flat-mexican-food-restaurant-vertical-poster-template_23-2149658924.jpg?t=st=1744212428~exp=1744216028~hmac=613eaae9036e33a78873269da0fd0e4da9ab89e58f89fea989fd65543c817340&w=1380',
  },
  {
    title: 'Tenemos el 25% de descuento',
    message: 'Se ha actualizado la plataforma',
    date: '22/3/2025, 0:27:34',
    icon: 'system_update',
    hasReward: false,
    hasPoints: false,
    image: null,
  },
  {
    title: '¡Es hora del Bono Deportivo Semanal!',
    message: 'Aprovecha esta promoción especial',
    date: '22/3/2025, 0:27:34',
    icon: 'sports',
    hasReward: true,
    hasPoints: true,
    image:
      'https://img.freepik.com/free-vector/gradient-vertical-poster-template-buen-fin-sales_23-2150899170.jpg',
  },
]);

// const toggleDarkMode = () => {
//   darkStore.setDark();
// };

onMounted(() => {
  // Cualquier inicialización necesaria
  // Pre-cargar store de compartir desde localStorage para habilitar botón si ya hay principal
  try {
    const shareStore = useShareStore();
    const raw = localStorage.getItem('paymentMethods');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const main = list.find((m: any) => m && m.main);
        if (main) {
          const msg = `Método de Pago Principal:\nNombre: ${
            main.name
          }\nBanco: ${main.bank?.label || 'N/A'}\nTeléfono: ${
            main.phonePrefix || ''
          }-${main.phoneNumber}\nCédula: ${main.document}`;
          shareStore.setMainPaymentMethod(main);
          shareStore.setShareMessage(msg);
        }
      }
    }
  } catch (e) {
    console.warn('No se pudo inicializar share store', e);
  }
});

const { startGlobalTour } = useTour();
const startGlobal = () => {
  startGlobalTour(async () => {
    await router.push({ name: 'profiles' });
    await nextTick();
  });
};
</script>

<style lang="scss" scoped>
.header-container {
  background-color: $dark;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-container {
  background-color: $accent;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.with-footer-padding {
  padding-bottom: 68px; // height of footer tabs area to prevent overlap
}

.notification-item {
  border-left: 3px solid #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 4px;
}

.bg-green-gradient {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  min-height: 100vh;
}

:deep(.q-drawer) {
  background-color: #1e1e1e !important;
}
</style>
