<template>
  <q-btn
    id="btn-share"
    flat
    dense
    round
    icon="share"
    @click="openShareDialog"
  />
  <q-dialog v-model="dialogOpen">
    <q-card
      class="bg-dark text-white q-pa-sm"
      style="width: 96%; max-width: 420px"
    >
      <q-card-section class="text-h6 text-center">Compartir</q-card-section>
      <q-card-section class="q-pt-none">
        <div v-if="!hasMethod" class="text-center q-pa-sm">
          <div class="text-body2 q-mb-md">
            No tienes un método de pago principal.
          </div>
          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Registrar método de pago"
            class="q-mb-md full-width"
            @click="openRegistrationForm"
          />
          <div class="text-caption text-grey-5 q-mt-sm">
            O comparte solo la conversión:
          </div>
        </div>
        <div v-else class="text-caption text-grey-5 q-mb-sm">
          Elige qué deseas compartir
        </div>
        <div class="preview-box q-mt-sm">
          <div class="text-primary text-bold q-mb-xs">Vista previa</div>
          <pre class="preview-text">{{ previewText }}</pre>
        </div>
      </q-card-section>
      <q-card-actions vertical class="q-gutter-y-sm q-pa-sm">
        <q-btn
          v-if="hasMethod"
          color="primary"
          unelevated
          no-caps
          label="Conversión + datos de pago"
          @click="share(true)"
        />
        <q-btn
          color="secondary"
          outline
          no-caps
          label="Solo conversión"
          @click="share(false)"
        />
        <q-btn flat color="grey-5" no-caps label="Cerrar" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="formDialogOpen" persistent>
    <q-card class="bg-dark text-white q-pa-sm">
      <q-card-section class="text-h6 text-center">
        Registrar método
      </q-card-section>
      <payment-method-form
        forceMainOnSave
        @saved="onMethodSaved"
        @close="onFormClose"
      />
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Cerrar"
          color="grey-5"
          @click="onFormClose"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Share } from '@capacitor/share';
import { useShareStore } from 'src/stores/share';
import { Notify } from 'quasar';
import { ref, computed } from 'vue';
import PaymentMethodForm from './PaymentMethodForm.vue';

const { mainPaymentMethod, lastAmount, lastConverted, lastMode } = storeToRefs(
  useShareStore()
);
const dialogOpen = ref(false);
const formDialogOpen = ref(false);
const hasMethod = computed(() => !!mainPaymentMethod.value);

function formatNum(n: number | null | undefined) {
  if (n == null) return '';
  return n.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const buildMessage = (withPayment: boolean) => {
  // Monto (última línea) según modo
  let amountLine = '';
  if (lastAmount.value != null || lastConverted.value != null) {
    if (lastMode.value === 'dollar' && lastConverted.value != null) {
      amountLine = formatNum(lastConverted.value);
    } else if (lastMode.value !== 'dollar' && lastAmount.value != null) {
      amountLine = formatNum(lastAmount.value);
    } else {
      amountLine = formatNum(lastConverted.value || lastAmount.value);
    }
  }

  if (withPayment && mainPaymentMethod.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m: any = mainPaymentMethod.value;
    const bankLabel = m.bank?.label || '';
    const bankCode = (m.bank?.value || bankLabel.split(' ')[0] || '').trim();
    const docRaw = `${m.documentType || ''}${m.document || ''}`.trim();
    const phoneRaw = `${m.phonePrefix || ''}${m.phoneNumber || ''}`;
    // Formato estilo CASHEA:
    // 1) Código banco
    // 2) Documento (tipo + número) – si Mercantil (0105) se mantiene, ellos no lo usan pero no afecta
    // 3) Teléfono (prefijo+numero)
    // 4) Monto
    return [bankCode, docRaw, phoneRaw, amountLine].filter(Boolean).join('\n');
  }
  // Solo conversión
  return amountLine;
};

const previewText = computed(() => buildMessage(hasMethod.value));

const openShareDialog = () => {
  dialogOpen.value = true;
  formDialogOpen.value = false;
};

const onFormClose = () => {
  formDialogOpen.value = false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onMethodSaved = (method: any) => {
  const store = useShareStore();
  store.setMainPaymentMethod(method);
  formDialogOpen.value = false;
};

const openRegistrationForm = () => {
  formDialogOpen.value = true;
};

const share = async (withPayment: boolean) => {
  const text = buildMessage(withPayment && hasMethod.value);
  try {
    await Share.share({
      title: 'Conversión',
      text,
      dialogTitle: 'Compartir con',
    });
    dialogOpen.value = false;
    return;
  } catch (e) {}
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'Conversión', text });
      dialogOpen.value = false;
      return;
    } catch (e) {}
  }
  try {
    await navigator.clipboard.writeText(text);
    Notify.create({
      message: 'Mensaje copiado al portapapeles',
      color: 'positive',
      icon: 'check_circle',
    });
    dialogOpen.value = false;
  } catch (e) {
    Notify.create({
      message: 'No se pudo compartir ni copiar.',
      color: 'negative',
      icon: 'error',
    });
  }
};
</script>

<style scoped>
.preview-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px;
  max-height: 180px;
  overflow: auto;
}
.preview-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 12px;
}
</style>
