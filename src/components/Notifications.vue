<template>
  <q-drawer
    :model-value="modelValue"
    side="right"
    :width="300"
    :breakpoint="500"
    overlay
    bordered
    class="bg-dark text-white"
    @update:model-value="updateOpen"
  >
    <div
      class="notification-header q-px-md q-py-sm flex justify-between items-center"
    >
      <div class="text-h6">Notificación</div>
      <q-btn flat round dense icon="close" @click="updateOpen(false)" />
    </div>

    <q-scroll-area class="full-height flex justify-end q-px-xs q-px-md">
      <q-card
        v-for="(notification, index) in notifications"
        :key="index"
        bordered
        dark
        flat
        class="bg-dark q-my-md"
        style="width: 100%; height: auto"
      >
        <q-card-section class="flex justify-between bg-accent q-py-sm">
          <q-avatar
            size="24px"
            color="orange-8"
            text-color="white"
            class="q-mr-sm"
          >
            <q-icon :name="notification.icon || 'sports'" size="16px" />
          </q-avatar>
          <p class="q-mb-none text-right">{{ notification.date }}</p>
        </q-card-section>
        <q-card-section>
          <div class="text-weight-medium text-subtitle1">
            {{ notification.title }}
          </div>
          <q-img
            class="q-my-md"
            v-if="notification.image"
            :src="notification.image"
            :ratio="1 / 1"
            spinner-color="primary"
            spinner-size="82px"
          />
        </q-card-section>
      </q-card>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Notification {
  title: string;
  message: string;
  date: string;
  icon?: string;
  hasReward: boolean;
  hasPoints: boolean;
  image?: string | null;
}

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  notifications: {
    type: Array as () => Notification[],
    default: () => [],
  },
});

const emit = defineEmits(['update']);

const updateOpen = (value: boolean) => {
  emit('update', value);
};
</script>

<style lang="scss" scoped>
.notification-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-item {
  background-color: $accent;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid $grey-7;
}

.notification-content {
  background-color: $dark;
}

.notification-image {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.image-overlay {
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
}

.image-tag {
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 2px 6px;
  font-size: 0.7rem;
}

.image-title {
  position: absolute;
  bottom: 8px;
  left: 0;
  line-height: 1;
}

.image-title .text-h6 {
  line-height: 1;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.bg-dark-page {
  background-color: #1e1e1e;
}
</style>
