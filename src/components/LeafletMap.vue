<template>
  <div class="leaflet-map-wrapper" :style="wrapperStyle">
    <div ref="mapEl" class="leaflet-map"></div>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  computed,
  defineEmits,
  defineProps,
  nextTick,
  defineExpose,
} from 'vue';

// NOTE: User will install deps. This import expects `leaflet` installed.
// CSS import keeps the component self-contained if CDN is not used.
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type * as LeafletNS from 'leaflet';

type MarkerInput = {
  id?: string | number;
  lat: number;
  lng: number;
  popup?: string;
  iconUrl?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
  draggable?: boolean;
};

const props = defineProps({
  // Map view
  center: {
    type: Array as unknown as () => [number, number],
    default: () => [9.0377377, -69.736974],
  },
  zoom: { type: Number, default: 13 },
  minZoom: { type: Number, default: 1 },
  maxZoom: { type: Number, default: 19 },

  // Tiles
  tileUrl: {
    type: String,
    default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
  tileAttribution: {
    type: String,
    default:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  // Controls / interactions
  zoomControl: { type: Boolean, default: true },
  scaleControl: { type: Boolean, default: false },
  attributionControl: { type: Boolean, default: false },
  scrollWheelZoom: { type: Boolean, default: true },
  dragging: { type: Boolean, default: true },

  // Markers
  markers: {
    type: Array as unknown as () => MarkerInput[],
    default: () => [],
  },
  fitToMarkers: { type: Boolean, default: false },
  fitPadding: { type: Number, default: 20 },

  // Sizing
  height: { type: String, default: '400px' },
  width: { type: String, default: '100%' },
  borderRadius: { type: String, default: '8px' },
});

const emit = defineEmits<{
  (e: 'ready', payload: { map: LeafletNS.Map }): void;
  (e: 'update:center', payload: [number, number]): void;
  (e: 'update:zoom', payload: number): void;
  (e: 'map-click', payload: { lat: number; lng: number }): void;
  (e: 'marker-click', payload: MarkerInput & { id: string | number }): void;
}>();

const mapEl = ref<HTMLDivElement | null>(null);
let map: LeafletNS.Map | null = null;
let markersLayer: LeafletNS.LayerGroup | null = null;
const markerRefs = new Map<string | number, LeafletNS.Marker>();

const wrapperStyle = computed(() => ({
  width: props.width,
  height: props.height,
  overflow: 'hidden',
  borderRadius: props.borderRadius,
}));

let resizeObserver: ResizeObserver | null = null;
let syncingView = false;

// Default marker icon using the custom asset provided by the user
const customMarkerUrl = '/icons/marcador-de-posicion.png';
const defaultMarkerIcon = L.icon({
  iconUrl: customMarkerUrl,
  iconRetinaUrl: customMarkerUrl,
  iconSize: [56, 56],
  iconAnchor: [28, 56],
  popupAnchor: [0, -48],
});

function createMap() {
  if (!mapEl.value) return;

  map = L.map(mapEl.value, {
    zoomControl: props.zoomControl,
    attributionControl: props.attributionControl,
    scrollWheelZoom: props.scrollWheelZoom,
    dragging: props.dragging,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
  });

  L.tileLayer(props.tileUrl, {
    attribution: props.tileAttribution,
    maxZoom: props.maxZoom,
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  map.setView(props.center as LeafletNS.LatLngExpression, props.zoom);

  if (props.scaleControl) {
    L.control.scale().addTo(map);
  }

  attachMapEvents();
  syncMarkers();

  if (props.fitToMarkers && props.markers.length > 0) {
    fitToAllMarkers();
  }

  emit('ready', { map });

  // Invalidate on next tick to ensure proper sizing in modals/tabs
  void nextTick(() => map && map.invalidateSize());
}

function attachMapEvents() {
  if (!map) return;

  map.on('click', (e: LeafletNS.LeafletMouseEvent) => {
    emit('map-click', { lat: e.latlng.lat, lng: e.latlng.lng });
  });

  map.on('moveend', () => {
    if (!map) return;
    syncingView = true;
    const c = map.getCenter();
    emit('update:center', [c.lat, c.lng]);
    syncingView = false;
  });

  map.on('zoomend', () => {
    if (!map) return;
    syncingView = true;
    emit('update:zoom', map.getZoom());
    syncingView = false;
  });
}

function clearMarkers() {
  if (!markersLayer) return;
  markersLayer.clearLayers();
  markerRefs.clear();
}

function syncMarkers() {
  if (!markersLayer) return;
  clearMarkers();

  for (const m of props.markers) {
    const id =
      m.id ?? `${m.lat},${m.lng},${Math.random().toString(36).slice(2, 8)}`;
    const icon = m.iconUrl
      ? L.icon({
          iconUrl: m.iconUrl,
          iconSize: m.iconSize,
          iconAnchor: m.iconAnchor,
        })
      : defaultMarkerIcon;

    const markerOptions: LeafletNS.MarkerOptions = {
      draggable: !!m.draggable,
      icon,
    };
    const marker = L.marker([m.lat, m.lng], markerOptions);

    if (m.popup) marker.bindPopup(m.popup);

    marker.on('click', () => {
      emit('marker-click', { ...m, id });
    });

    marker.addTo(markersLayer);
    markerRefs.set(id, marker);
  }
}

function fitToAllMarkers() {
  if (!map || !markersLayer) return;
  const bounds = L.latLngBounds([]);
  markerRefs.forEach((marker) => bounds.extend(marker.getLatLng()));
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [props.fitPadding, props.fitPadding] });
  }
}

// Exposed public API for parent components
defineExpose({
  setView: (center: [number, number], zoom?: number) => {
    if (!map) return;
    map.setView(center as LeafletNS.LatLngExpression, zoom ?? map.getZoom());
  },
  flyTo: (center: [number, number], zoom?: number) => {
    if (!map) return;
    map.flyTo(center as LeafletNS.LatLngExpression, zoom ?? map.getZoom());
  },
  fitToMarkers: fitToAllMarkers,
  addMarker: (marker: MarkerInput) => {
    if (!markersLayer || !L) return;
    const id =
      marker.id ??
      `${marker.lat},${marker.lng},${Math.random().toString(36).slice(2, 8)}`;
    const icon = marker.iconUrl
      ? L.icon({
          iconUrl: marker.iconUrl,
          iconSize: marker.iconSize,
          iconAnchor: marker.iconAnchor,
        })
      : defaultMarkerIcon;
    const opts: LeafletNS.MarkerOptions = {
      draggable: !!marker.draggable,
      icon,
    };
    const m = L.marker([marker.lat, marker.lng], opts);
    if (marker.popup) m.bindPopup(marker.popup);
    m.addTo(markersLayer);
    markerRefs.set(id, m);
  },
  clearMarkers,
});

// Reactivity: center/zoom from parent
watch(
  () => [props.center[0], props.center[1], props.zoom] as const,
  ([lat, lng, zoom]) => {
    if (!map || syncingView) return;
    map.setView([lat, lng] as LeafletNS.LatLngExpression, zoom);
  }
);

// Reactivity: markers array
watch(
  () => props.markers,
  () => {
    syncMarkers();
    if (props.fitToMarkers && props.markers.length > 0) {
      fitToAllMarkers();
    }
  },
  { deep: true }
);

onMounted(() => {
  createMap();

  // Invalidate size when container resizes (modals, drawers, chat panes)
  if (mapEl.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => {
      if (map) map.invalidateSize();
    });
    resizeObserver.observe(mapEl.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver && mapEl.value) resizeObserver.unobserve(mapEl.value);
  resizeObserver = null;
  if (map) {
    map.remove();
    map = null;
  }
  markerRefs.clear();
  markersLayer = null;
});
</script>

<style scoped>
.leaflet-map-wrapper {
  position: relative;
}
.leaflet-map {
  width: 100%;
  height: 100%;
}
</style>
