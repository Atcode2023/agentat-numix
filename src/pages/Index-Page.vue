<template>
  <q-page class="index-page">
    <inputCover />
  </q-page>
</template>

<script setup lang="ts">
import inputCover from 'components/InputConver.vue';
import { ref, onMounted } from 'vue';
import { useDolar } from 'src/stores/dolar';
import { getDolar } from 'src/services/dolar.js';
// import { useDark } from 'src/stores/dark';
// import { storeToRefs } from 'pinia';

// const { isDarkMode } = storeToRefs(useDark());
// console.log('isDarkMode: ', isDarkMode);
const store = useDolar();
let dolarBCV = ref(0);

const getData = async () => {
  try {
    const dolarValue = await getDolar();
    // Solo actualizar el store con el objeto completo recibido
    store.setDolar(dolarValue.dolar);
    dolarBCV.value = dolarValue.dolar.bcv ?? 0;
    // Si no existe defaultRate en localStorage, setearlo a 'usd'
    if (!localStorage.getItem('defaultRate')) {
      store.setDefaultRate('usd');
    }
  } catch (error) {
    console.log(error);
  }
};

onMounted(async () => {
  await getData();
});
</script>

<style lang="scss" scoped>
.index-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  text-align: center;
}

.app-title {
  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }

  p {
    margin: 4px 0 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
  }
}

.app-info {
  margin-top: auto;
  padding: 16px;
  display: flex;
  justify-content: center;
}

.info-card {
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  color: white;
  font-size: 0.9rem;
  max-width: 400px;
  width: 90%;
}
</style>
