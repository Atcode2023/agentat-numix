<template>
  <q-card
    dark
    flat
    bordered
    class="q-pa-md bg-dark"
    style="width: 100%; max-width: 400px"
  >
    <q-card-section>
      <h6 class="text-h6 q-my-none">Registrar Método de Pago</h6>
    </q-card-section>
    <q-card-section class="q-px-xs">
      <q-form @submit.prevent="submitForm" ref="formRef">
        <div class="flex column q-mb-md">
          <label class="text-grey-5 custom-label">Nombre</label>
          <q-input
            v-model="form.name"
            filled
            dark
            dense
            :rules="[(val) => !!val || 'El nombre es requerido']"
          />
        </div>
        <div class="flex column q-mb-md">
          <label class="text-grey-5 custom-label">Teléfono</label>
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-select
                class="text-caption"
                v-model="form.phonePrefix"
                filled
                dark
                dense
                :options="phonePrefixes"
                :rules="[(val) => !!val || 'El prefijo es requerido']"
                behavior="menu"
              />
            </div>
            <div class="col-8">
              <q-input
                v-model="form.phoneNumber"
                filled
                dark
                dense
                type="number"
                mask="#######"
                :rules="[(val) => !!val || 'El teléfono es requerido']"
              />
            </div>
          </div>
        </div>
        <div class="flex column q-mb-md">
          <label class="text-grey-5 custom-label">Documento de Identidad</label>
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-select
                v-model="form.documentType"
                filled
                dark
                dense
                :options="docTypes"
                :rules="[(val) => !!val || 'Tipo requerido']"
                behavior="menu"
              />
            </div>
            <div class="col-8">
              <q-input
                v-model="form.document"
                filled
                dark
                dense
                type="number"
                :rules="[(val) => !!val || 'El documento es requerido']"
              />
            </div>
          </div>
        </div>
        <div class="flex column q-mb-md">
          <label class="text-grey-5 custom-label">Banco</label>
          <q-select
            v-model="form.bank"
            class="text-caption"
            filled
            dark
            dense
            use-input
            options-dense
            :options="bankOptions"
            option-label="label"
            option-value="value"
            input-debounce="300"
            behavior="menu"
            :rules="[(val) => !!val || 'El banco es requerido']"
          />
        </div>
        <div class="q-mt-md">
          <q-btn
            label="Cancelar"
            flat
            class="full-width q-mb-sm"
            @click="$emit('close')"
          />
          <q-btn
            label="Guardar"
            color="primary"
            class="full-width"
            type="submit"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import bancos from '../mocks/banks';

const emits = defineEmits(['close', 'saved']);

const props = defineProps<{ forceMainOnSave?: boolean }>();

const form = ref({
  name: '',
  phonePrefix: null,
  phoneNumber: '',
  document: '',
  documentType: 'V',
  bank: null,
  main: false,
  accountType: 'Pago Móvil',
});

const phonePrefixes = ['0412', '0414', '0424', '0426', '0416'];
const docTypes = ['V', 'E', 'P', 'J', 'G', 'F'];

const bankOptions = Object.entries(bancos).map(([code, name]) => ({
  label: `${code} - ${name}`,
  value: code,
}));

const formRef = ref();

function submitForm() {
  if (formRef.value?.validate()) {
    const storedMethods = JSON.parse(
      localStorage.getItem('paymentMethods') || '[]'
    );
    if (props.forceMainOnSave) {
      // desmarcar anteriores como principal
      storedMethods.forEach((m: any) => (m.main = false)); // eslint-disable-line @typescript-eslint/no-explicit-any
      form.value.main = true;
    }
    storedMethods.push({ ...form.value });
    localStorage.setItem('paymentMethods', JSON.stringify(storedMethods));
    emits('saved', { ...form.value });
    emits('close');
  }
}
</script>
