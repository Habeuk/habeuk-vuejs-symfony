<template>
  <label :for="field.name" class="block font-medium mb-1">
    {{ field.label }}
    <span v-if="field.required" class="text-red-500">*</span>
  </label>
  <Select
    :id="field.name"
    :name="field.name"
    v-model="selectedValue"
    :options="field.options"
    optionLabel="label"
    optionValue="value"
    :placeholder="field.placeholder ? field.placeholder : `Sélectionnez ${field.label.toLowerCase()}`"
    :class="{ 'p-invalid': errors.has(field.name) }"
    :filter="true"
    @filter="(event: any) => selectFilterSearch(event, field)"
    class="w-full" />

  <small v-if="errors.has(field.name)" class="text-red-500 block mt-1">
    {{ errors.get(field.name) }}
  </small>
  <Message v-if="resolv_error[field.name]?.invalid" severity="error" size="small" variant="simple">
    {{ resolv_error[field.name]?.error?.message }}
  </Message>
</template>
<script setup lang="ts">
import type { EntityFormFieldInterface, BaseEntity } from '@/types';
import { ref, onMounted, watch } from 'vue';
import Select from 'primevue/select';
import Message from 'primevue/message';
import { useEntityStore } from '@/stores/modules/entityStore';
const props = defineProps<{
  field: EntityFormFieldInterface;
  modelValue: BaseEntity;
  errors: Map<string, string>;
  resolv_error: any;
  entity?: BaseEntity;
}>();
const entityStore = useEntityStore();
const selectedValue = ref<number | undefined>(props.modelValue.id);
const typingTimer = ref<any>(null);
const emit = defineEmits(['update:modelValue']);
const doneTypingInterval = ref<number>(500);
const selectFilterSearch = (event: any, field: EntityFormFieldInterface) => {
  clearTimeout(typingTimer.value);
  typingTimer.value = setTimeout(async () => {
    const query = event.value;
    if (!query || query.length < (field.minLength || 2)) {
      field.options = [];
      return;
    }
    await entityStore.prepareSearch(query, field);
  }, doneTypingInterval.value);
};

/**
 * Recupere la valeur par defaut pour un champ et propose les options.
 * ( Charge partiellement les données, juste les champs necessaires pour afficher le label )
 */
const loadDefaultDatas = () => {
  const valueId = props.modelValue.id;
  const field = props.field;
  const items = props.entity && props.entity[field.name] ? [props.entity[field.name]] : [];
  if (items.length > 0 && items[0].id) {
    try {
      field.options = entityStore.buildOptions(items, field);
    } catch (error) {
      if (valueId !== undefined && valueId !== null) {
        const search_fields = ['id'];
        entityStore.prepareSearch(valueId, field, search_fields);
      }
    }
  } else if (valueId !== undefined && valueId !== null) {
    const search_fields = ['id'];
    entityStore.prepareSearch(valueId, field, search_fields);
  }
};
onMounted(() => {
  loadDefaultDatas();
});
watch(selectedValue, (newValue) => {
  emit('update:modelValue', { id: newValue });
});
</script>
