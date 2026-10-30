<template>
  <!-- Type: boolean -->
  <CircleCheck v-if="col.type === 'boolean' && data[fieldName]" class="w-4 h-4 text-green-500" />
  <CircleX v-else-if="col.type === 'boolean'" class="w-4 h-4 text-red-500" />
  <!-- Type: datetime -->
  <span v-else-if="col.type === 'date'">
    {{ formatDateOnly(data[fieldName]) }}
  </span>
  <span v-else-if="col.type === 'datetime'">
    {{ formatDateTime(data[fieldName]) }}
  </span>
  <!-- Type: array -->
  <div v-else-if="col.type === 'array'">
    <span>{{ data[fieldName].join(', ') }}</span>
  </div>
  <!-- Type: array_badge -->
  <div v-else-if="col.type === 'array_badge'">
    <Tag v-for="item in data[fieldName]" :key="item" :value="item" severity="info" class="mr-1" />
  </div>
  <!-- Type: richtext -->
  <div v-else-if="col.type === 'richtext'">
    <div v-html="data[fieldName]" />
  </div>
  <!-- Type: enum -->
  <div v-else-if="col.type === 'enum'">
    <Tag :value="displayEnumValue.label" :severity="displayEnumValue.color" class="text-xs" />
  </div>
  <!-- Type: entity_name -->
  <div v-else-if="col.type === 'entity_name'">
    {{ data[fieldName]?.name ?? '-' }}
  </div>
  <!-- Type: entity_fullname -->
  <div v-else-if="col.type === 'entity_fullname'">
    {{ data[fieldName]?.fullName ?? '-' }}
  </div>
  <!-- Type: permissions -->
  <div v-else-if="col.type === 'permissions'">
    {{ formatPermissions }}
  </div>
  <!-- Valeur par défaut -->
  <div v-else>{{ data[fieldName] || '-' }}</div>
</template>

<script setup lang="ts">
import { CircleCheck, CircleX } from '@lucide/vue';
import Tag from 'primevue/tag';
import { computed } from 'vue';

import type { columnInterface, BaseEntity, enumsInterface } from '@/types';
import { formatDateTime, formatDateOnly } from '@/services/format';
type PermissionState = {
  checked?: boolean;
  partialChecked?: boolean;
};
type PermissionsValue = Record<string, PermissionState>;
// Props
const props = withDefaults(
  defineProps<{
    col: columnInterface;
    data: BaseEntity;
    fieldName: string;
    enums: enumsInterface;
  }>(),
  {},
);
// Retourne la valeur formatée de la colonne en fonction de son type 'enum'
const displayEnumValue = computed(() => {
  const data = {
    label: '-',
    color: '',
  };
  const value = props.data[props.fieldName];
  if (value == null || value === '') return data;
  const enumCases = props.enums?.[props.fieldName];
  if (!enumCases) {
    return Object.assign(data, { label: String(value) });
  }
  return Object.assign(data, enumCases[value]);
});
const formatPermissions = computed<string>(() => {
  const value = props.data[props.fieldName] as PermissionsValue | null | undefined;
  if (!value || typeof value !== 'object') {
    return 'Aucune permission';
  }
  const activeMainPermissions = Object.entries(value)
    .filter(([key, permission]) => {
      return !key.includes('__') && permission.checked === true;
    })
    .map(([key]) => key.replace(/^manage_/, ''));
  if (activeMainPermissions.length === 0) {
    return 'Aucune permission';
  }
  const limit = 5;
  const visiblePermissions = activeMainPermissions.slice(0, limit);
  const remainingCount = activeMainPermissions.length - visiblePermissions.length;
  return remainingCount > 0 ? `${visiblePermissions.join(', ')}, ...` : visiblePermissions.join(', ');
});
</script>
