<template>
  <div class="container-table">
    <table>
      <thead class="bg-black">
        <th><div class="q-py-sm">$</div></th>
        <th>BCV</th>
        <th>PARALELO</th>
      </thead>
      <tbody>
        <tr class v-for="item in 100" :key="item">
          <td>
            <div class="q-py-xs">{{ item }} $</div>
          </td>
          <td>{{ calcularResultado(item, dolarBCV).toFixed(2) }} Bs</td>
          <td>{{ calcularResultado(item, dolarParalelo).toFixed(2) }} Bs</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDolar } from 'src/stores/dolar';
import { getDolar } from 'src/services/dolar.js';

const store = useDolar();
let dolarBCV = ref(0);
let dolarParalelo = ref(0);

const calcularResultado = (item: number, dolar: any) => {
  return item * parseFloat(dolar);
};

const getData = async () => {
  try {
    const dolarValue = await getDolar();
    store.setDolar(dolarValue.bcv);
    dolarBCV.value = store.$state.dolar ?? 0;
  } catch (error) {
    console.log(error);
  } finally {
  }
};

onMounted(async () => {
  await getData();
});
</script>

<style lang="scss" scoped>
.container-table {
  margin-top: 10px;
  padding: 0 20px;
  max-height: 510px;
  overflow-y: auto;
  position: relative;
  padding-bottom: 100px;

  table {
    width: 100%;
    color: #fff;
    text-align: center;
    border-collapse: collapse;

    td {
      border: 1px solid white;
    }
    th {
      border: 1px solid transparent;
      border-bottom: 1px solid white;
    }

    thead,
    th {
      position: sticky;
      top: -3px;
      z-index: 1;
    }
  }
}
</style>
