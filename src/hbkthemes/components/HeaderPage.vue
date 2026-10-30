<template>
  <div class="header-page">
    <h2 class="mb-2 text-2xl font-bold">
      {{ perfomTtitle }}
      <span v-if="badge" class="ml-2 text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
        {{ badge }}
      </span>
    </h2>
    <div class="flex justify-between items-start">
      <div v-if="perfomDescription || subtitle">
        <div class="text-gray-500">{{ perfomDescription }}</div>
        <p class="text-sm text-gray-500 mt-2">{{ subtitle }}</p>
      </div>
      <div><slot name="actions" /></div>
    </div>
  </div>
  <CustomBreadCrumb :home="home" :model="items" />
</template>

<script setup lang="ts">
import CustomBreadCrumb from '@/hbkthemes/components/CustomBreadCrumb.vue';
import { useAppStore } from '@/stores/modules/appStore';
import { Home } from '@lucide/vue';

import { ref, computed } from 'vue';
import type { Component } from 'vue';
interface Props {
  title?: string;
  description?: string;
  subtitle?: string;
  badge?: string;
}
const props = defineProps<Props>();
const appStore = useAppStore();
interface ItemInterface {
  label?: string;
  route?: string;
  /** Icône lucide affichée à gauche du libellé. */
  icon?: Component;
}
const perfomTtitle = computed(() => {
  if (props.title) return props.title;
  return appStore.title;
});
const perfomDescription = computed(() => {
  if (props.description) return props.description;
  return appStore.description;
});

const home = ref<ItemInterface>({
  icon: Home,
  route: '/', // ou url: '/'
});

const items = ref<ItemInterface[]>([
  { label: 'Administration', route: '/admin' },
  { label: 'Utilisateurs', route: '/admin/users' },
  { label: 'Modifier' },
]);
</script>
