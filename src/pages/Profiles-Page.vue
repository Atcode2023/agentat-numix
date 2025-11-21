<template>
  <section class="container-x">
    <div class="text-grey-1">
      <h1 class="text-h5 q-mb-none text-left">Perfiles de pago</h1>
      <p class="text-caption q-mb-xs">Gestiona tus cuentas bancarias</p>
    </div>
    <div class="flex justify-center">
      <!-- Enhanced create button with better mobile touch target -->
      <q-btn
        id="btn-create-payment"
        class="br-10 q-my-md full-width create-btn-enhanced"
        no-caps
        color="blue"
        icon="add"
        label="Crear nuevo método de pago"
        @click="showModal = true"
      />
      <q-dialog v-model="showModal">
        <payment-method-form @close="handleClose" />
      </q-dialog>
      <div class="profiles-grid">
        <div
          v-if="paymentMethods.length === 0"
          class="card-grid-item"
          id="card-first-payment"
        >
          <!-- Enhanced empty state card with better visual hierarchy -->
          <q-card
            dark
            bordered
            flat
            class="card-profiles empty-state-card"
            style="opacity: 0.55"
          >
            <q-card-section class="card-section-enhanced">
              <div class="flex full-width items-center">
                <q-avatar
                  size="3rem"
                  font-size="1.2rem"
                  text-color="white"
                  class="bg-blue avatar-enhanced"
                >
                  <span class="text-bold q-mt-xs">PM</span>
                </q-avatar>
                <div class="flex column q-pl-sm">
                  <div class="flex items-center">
                    <h6 class="text-subtitle1 text-bold q-my-none">
                      Método Ejemplo
                    </h6>
                  </div>
                  <p class="text-caption text-grey-5 q-mb-none">
                    0000 - BANCO DEMO
                  </p>
                </div>
              </div>
            </q-card-section>
            <q-card-section class="bg-accent card-actions-section">
              <div class="flex q-gutter-x-sm q-mb-sm">
                <label class="text-grey-5">Cédula:</label>
                <p class="q-mb-xs">V-00000000</p>
              </div>
              <div class="flex q-gutter-x-sm q-mb-md">
                <label class="text-grey-5">Télefono:</label>
                <p class="q-mb-xs">0412-0000000</p>
              </div>
              <!-- Enhanced button layout for better mobile interaction -->
              <div class="row q-col-gutter-sm">
                <div class="col-3">
                  <q-btn
                    unelevated
                    class="delete-btn-enhanced"
                    no-caps
                    icon="delete"
                    disable
                    round
                    size="md"
                  />
                </div>
                <div class="col-9">
                  <q-btn
                    id="btn-set-main"
                    disable
                    unelevated
                    no-caps
                    class="btn-primary-custom action-btn-enhanced"
                    label="Establecer como principal"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div
          v-for="(method, index) in paymentMethods"
          :key="index"
          class="card-grid-item"
          :id="index === 0 ? 'card-first-payment' : undefined"
        >
          <!-- Enhanced payment method cards with better mobile UX -->
          <q-card
            dark
            bordered
            flat
            class="card-profiles payment-card-enhanced"
          >
            <q-card-section class="card-section-enhanced">
              <div class="flex full-width items-center">
                <q-avatar
                  size="3rem"
                  font-size="1.5rem"
                  text-color="white"
                  class="gradient-green avatar-enhanced"
                >
                  <span class="text-bold q-mt-xs">{{
                    method.name.slice(0, 2).toUpperCase()
                  }}</span>
                </q-avatar>
                <div class="flex column q-pl-sm flex-grow">
                  <div class="flex items-center">
                    <h6 class="text-subtitle1 text-bold q-my-none">
                      {{ method.name }}
                    </h6>
                    <q-badge
                      v-if="method.main"
                      class="q-ml-sm q-px-sm bg-purple-custom text-caption badge-enhanced"
                      rounded
                      label="Principal"
                    />
                  </div>
                  <p class="text-caption text-grey-5 q-mb-none">
                    {{ method.bank?.label || 'Banco no especificado' }}
                  </p>
                </div>
                <!-- Enhanced copy button with better touch target -->
                <div class="q-ml-auto">
                  <q-btn
                    dense
                    flat
                    round
                    size="md"
                    icon="content_copy"
                    class="copy-btn-enhanced"
                    @click="copyMethod(method)"
                    :aria-label="'Copiar método ' + method.name"
                  />
                </div>
              </div>
            </q-card-section>
            <q-card-section class="bg-accent card-actions-section">
              <div class="flex q-gutter-x-sm q-mb-sm">
                <label class="text-grey-5">Cédula:</label>
                <p class="q-mb-xs">{{ method.document }}</p>
              </div>
              <div class="flex q-gutter-x-sm q-mb-md">
                <label class="text-grey-5">Télefono:</label>
                <p class="q-mb-xs">
                  {{ method.phonePrefix }}-{{ method.phoneNumber }}
                </p>
              </div>
              <!-- Enhanced action buttons with better mobile layout -->
              <div class="action-buttons-container">
                <div class="row q-col-gutter-sm">
                  <div class="col-3">
                    <q-btn
                      unelevated
                      class="delete-btn-enhanced"
                      no-caps
                      icon="delete"
                      @click="requestDelete(index)"
                      round
                      size="md"
                    />
                  </div>
                  <div class="col-9">
                    <q-btn
                      v-show="!method.main"
                      unelevated
                      no-caps
                      class="btn-primary-custom action-btn-enhanced"
                      label="Establecer como principal"
                      @click="setAsMain(index)"
                      :id="index === 0 ? 'btn-set-main' : undefined"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <!-- Enhanced confirmation dialog with better mobile UX -->
      <q-dialog v-model="confirmDialog">
        <q-card
          class="bg-dark text-white dialog-enhanced"
          style="min-width: 340px"
        >
          <q-card-section class="text-h6 q-pb-sm dialog-header">
            Eliminar método
          </q-card-section>
          <q-separator dark inset />
          <q-card-section class="q-pt-sm dialog-content">
            <div class="text-body2 text-grey-4 q-mb-sm">
              Estás a punto de eliminar este método. Revisa los datos:
            </div>
            <div v-if="selectedMethod" class="preview-box q-pa-sm q-mb-sm">
              <div class="text-subtitle2 text-bold">
                {{ selectedMethod.name }}
              </div>
              <div class="text-caption">
                Banco: {{ selectedMethod.bank?.label || 'N/A' }}
              </div>
              <div class="text-caption">
                Cédula: {{ selectedMethod.document }}
              </div>
              <div class="text-caption">
                Teléfono: {{ selectedMethod.phonePrefix || '' }}-{{
                  selectedMethod.phoneNumber
                }}
              </div>
              <div class="text-caption" v-if="selectedMethod.main">
                (Actualmente principal)
              </div>
            </div>
            <div class="text-red-5 text-subtitle2">
              Esta acción no se puede deshacer.
            </div>
          </q-card-section>
          <!-- Enhanced dialog actions with better mobile buttons -->
          <q-card-actions
            align="right"
            class="q-gutter-sm q-pt-none dialog-actions"
          >
            <q-btn
              flat
              label="Cancelar"
              color="grey-5"
              class="dialog-btn-cancel"
              v-close-popup
            />
            <q-btn
              unelevated
              label="Eliminar"
              color="red-5"
              class="dialog-btn-delete"
              :aria-label="'Eliminar método ' + selectedMethodName"
              @click="confirmDelete"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { copyToClipboard, Notify } from 'quasar';
import { useShareStore } from 'src/stores/share';
import PaymentMethodForm from '../components/PaymentMethodForm.vue';

// Define the type for a payment method
interface PaymentMethod {
  name: string;
  phonePrefix: string | null;
  phoneNumber: string;
  document: string;
  documentType?: string;
  bank: { label: string; value: string } | null;
  main: boolean;
}

const showModal = ref(false);
const paymentMethods = ref<PaymentMethod[]>([]);
const shareStore = useShareStore();
const confirmDialog = ref(false);
const deleteIndex = ref<number | null>(null);

const selectedMethodName = computed(() => {
  if (deleteIndex.value == null) return '';
  const method = paymentMethods.value[deleteIndex.value];
  return method ? method.name : '';
});

const selectedMethod = computed(() => {
  if (deleteIndex.value == null) return null;
  return paymentMethods.value[deleteIndex.value] || null;
});

function buildShareMessage(method: PaymentMethod) {
  if (!method) return '';
  const docLine = method.documentType
    ? `${method.documentType}${method.document}`
    : method.document;
  return `Método de Pago Principal:\nNombre: ${method.name}\nBanco: ${
    method.bank?.label || 'N/A'
  }\nTeléfono: ${method.phonePrefix || ''}-${
    method.phoneNumber
  }\nCédula: ${docLine}`;
}

function loadPaymentMethods() {
  const storedMethods = localStorage.getItem('paymentMethods');
  paymentMethods.value = storedMethods ? JSON.parse(storedMethods) : [];
  const main = paymentMethods.value.find((m) => m.main) || null;
  if (main) {
    shareStore.setMainPaymentMethod(main);
    shareStore.setShareMessage(buildShareMessage(main));
  } else {
    shareStore.clearShare();
  }
}

function setAsMain(index: number) {
  paymentMethods.value.forEach((method, i) => {
    method.main = i === index;
  });
  localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods.value));
  const main = paymentMethods.value[index];
  shareStore.setMainPaymentMethod(main);
  shareStore.setShareMessage(buildShareMessage(main));
}

function deletePaymentMethod(index: number) {
  paymentMethods.value.splice(index, 1);
  localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods.value));
}

function requestDelete(index: number) {
  deleteIndex.value = index;
  confirmDialog.value = true;
}

function confirmDelete() {
  if (deleteIndex.value != null) {
    deletePaymentMethod(deleteIndex.value);
    deleteIndex.value = null;
    confirmDialog.value = false;
  }
}

function copyMethod(method: PaymentMethod) {
  let msg = buildShareMessage(method);
  // Generar variante corta estilo CASHEA para fácil pegado si se desea
  if (method.bank) {
    const bankCode = method.bank.value;
    const doc = (method.documentType || '') + method.document;
    const phone = `${method.phonePrefix || ''}${method.phoneNumber}`;
    // Mantener versión extendida si usuario desea, pero copiamos la corta si existe todo
    if (bankCode && doc && phone) {
      msg = `${bankCode}\n${doc}\n${phone}`;
    }
  }
  copyToClipboard(msg)
    .then(() =>
      Notify.create({
        message: 'Método copiado',
        color: 'positive',
        icon: 'check_circle',
      })
    )
    .catch(() =>
      Notify.create({
        message: 'No se pudo copiar',
        color: 'negative',
        icon: 'error',
      })
    );
}

function handleClose() {
  loadPaymentMethods();
  showModal.value = false;
}

onMounted(() => {
  loadPaymentMethods();
});
</script>

<style lang="scss" scoped>
.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
  justify-content: center;
  align-items: stretch;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.card-grid-item {
  display: flex;
  justify-content: center;
}

.card-profiles {
  border-radius: 1rem;
  background-color: $dark;
  color: #fff;
  width: 100%;
  max-width: 450px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
}

.bg-purple-custom {
  background-color: #591c878b !important;
}

.create-btn-enhanced {
  min-height: 48px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(147, 53, 229, 0.3);
  }
}

.card-section-enhanced {
  padding: 1.25rem;

  @media (max-width: 600px) {
    padding: 1rem;
  }
}

.card-actions-section {
  padding: 1.25rem;

  @media (max-width: 600px) {
    padding: 1rem;
  }
}

.avatar-enhanced {
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.badge-enhanced {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
}

.copy-btn-enhanced {
  min-width: 44px;
  min-height: 44px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }
}

.action-btn-enhanced {
  flex: 1;
  min-height: 44px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    width: 100%;
  }
}

.delete-btn-enhanced {
  min-width: 44px;
  min-height: 44px;
  background-color: rgba(233, 25, 22, 0.2);
  color: #e91916;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(233, 25, 22, 0.3);
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    width: 100%;
    border-radius: 0.5rem;
  }
}

.payment-card-enhanced {
  &:hover .copy-btn-enhanced {
    opacity: 1;
  }
}

.empty-state-card {
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.dialog-enhanced {
  border-radius: 1rem;
  max-width: 90vw;

  @media (max-width: 600px) {
    margin: 1rem;
  }
}

.dialog-header {
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-content {
  line-height: 1.5;
}

.preview-box {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  border-left: 3px solid $primary;
}

.dialog-actions {
  padding: 1rem 1.5rem;

  .dialog-btn-cancel,
  .dialog-btn-delete {
    min-height: 44px;
    min-width: 80px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;

    .dialog-btn-cancel,
    .dialog-btn-delete {
      width: 100%;
    }
  }
}
</style>
