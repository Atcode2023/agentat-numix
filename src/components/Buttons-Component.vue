<template>
  <div class="box-buttons-menu">
    <div class="buttons-menu">
      <q-btn
        v-for="(item, index) in dataLinks"
        :key="index"
        flat
        :class="{ 'active-button': item.link === currentRoute }"
        color="white"
        :icon="item.icon"
        @click="redirecLink(item.link)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const props = defineProps(['dataLinks']);

const currentRoute = ref('');

router.afterEach((to) => {
  currentRoute.value = to.path;
});

const redirecLink = (link: string) => {
  router.push(link);
};

onMounted(() => {
  currentRoute.value = route.path;
});
</script>

<style lang="scss" scoped>
.box-buttons-menu {
  position: fixed;
  width: 100%;
  bottom: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);

  .buttons-menu {
    display: flex;
    justify-content: space-around;
    padding: 5px 0px;
    background-color: #000;
  }
  .active-button {
    // position: absolute;
    transform: scale(1.2) translate(0px, -20px);
    background-color: #000;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    height: 40px;
    width: 40px;
    color: #fff;
    transition: transform 0.2s ease;
  }
}
</style>
