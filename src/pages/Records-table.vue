<template>
  <div class="container-table"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { getHistorial } from 'src/services/dolar.js';

// const calcularResultado = (item: number, dolar: any) => {
//   return item * parseFloat(dolar);
// };

onMounted(async () => {
  const x = await getHistorial();
  console.log('x: ', x);
});
</script>

<style lang="scss" scoped>
.container-table {
  margin-top: 30px;
  padding: 0 20px;
  max-height: 500px;
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
