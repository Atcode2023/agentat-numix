<template>
  <LeafletMap
    :center="[-34.6037, -58.3816]"
    :zoom="12"
    :scaleControl="true"
    :scrollWheelZoom="true"
    :dragging="true"
    :markers="markers"
  />
</template>

<script lang="ts" setup>
import LeafletMap from '../components/LeafletMap.vue';
const FILE_URL = process.env.FILE_URL;

const buildShopPopup = (name: string, image: string) => {
  return `
    <div>
      <h3>${name}</h3>
      <img src="${image}" alt="${name}" style="width: 100px; height: auto;" />
    </div>
  `;
};

interface SimpleMarker {
  id: string;
  lat: number;
  lng: number;
  popup?: string;
}

const markers: SimpleMarker[] = [
  {
    id: 'shop-1',
    lat: -34.6037,
    lng: -58.3816,
    popup: buildShopPopup('Shop 1', `${FILE_URL}/images/shop1.png`),
  },
];
</script>
