<template>
  <q-page class="flex column no-wrap">
    <div class="q-pa-md">
      <q-select
        v-model="selectedCategoryId"
        :options="categoryOptions"
        emit-value
        map-options
        label="Seleccione una categoría"
        input-class="text-white"
        label-color="white"
      />
    </div>

    <div class="col full-width q-pa-none relative-position" id="map-section">
      <LeafletMap
        class="absolute-full"
        :center="[9.0377377, -69.736974]"
        :zoom="12"
        :scaleControl="true"
        :scrollWheelZoom="true"
        :dragging="true"
        :markers="markers"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { Category } from 'src/types/category';
import LeafletMap from '../components/LeafletMap.vue';
import { getShops } from 'src/services/shops';
import { getCategories } from 'src/services/categories';
import { onMounted, ref, computed, watch } from 'vue';
import { Shop } from 'src/types/shop';
import { buildShopPopup } from 'src/templates/popup';

const FILE_URL = import.meta.env.VITE_FILE_URL;
const categories = ref<Category[]>([]);
const shops = ref<Shop[]>([]);
const selectedCategoryId = ref<number | null>(null);

interface SimpleMarker {
  id: number;
  lat: number;
  lng: number;
  popup?: string;
}

interface CategoryOption {
  label: string;
  value: number | null;
}

const categoryOptions = computed<CategoryOption[]>(() => [
  { label: 'Todos', value: null },
  ...categories.value.map((category) => ({
    label: category.name,
    value: category.id,
  })),
]);

const markers = ref<SimpleMarker[]>([]);

const hydrateMarkers = () => {
  markers.value = shops.value
    .map((shop) => {
      const lat = parseFloat(shop.lat);
      const lng = parseFloat(shop.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
      return {
        id: shop.id,
        lat,
        lng,
        popup: buildShopPopup(
          shop.name,
          `${FILE_URL}/${shop.image}`,
          shop.phone
        ),
      } as SimpleMarker;
    })
    .filter((m): m is SimpleMarker => m !== null);
};

onMounted(async () => {
  categories.value = await getCategories();
  shops.value = await getShops(selectedCategoryId.value);
  hydrateMarkers();
});

watch(selectedCategoryId, async (newVal) => {
  shops.value = await getShops(newVal);
  hydrateMarkers();
});
</script>
