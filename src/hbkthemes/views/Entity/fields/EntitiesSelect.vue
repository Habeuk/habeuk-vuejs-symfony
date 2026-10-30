<template>
  <label :for="field.name" class="block font-medium mb-1">
    {{ field.label }}
    <span v-if="field.required" class="text-red-500">*</span>
  </label>
  <div class="border-1 p-5 border-gray-200">
    <div>
      <div v-if="loading" class="mb-2">Chargement...</div>
      <div v-for="(value, index) in selectedValues" :key="index" class="border-b-1 border-gray-200 my-5 pb-1">
        <div class="flex justify-between items-center">
          <div class="mb-2">{{ value.label }}</div>
          <div class="flex gap-4">
            <!-- Boutons de déplacement -->
            <Button
              severity="secondary"
              size="small"
              variant="text"
              @click="moveItem(index, -1)"
              :disabled="index === 0"
              title="Monter"
              class="border-0">
              <template #icon><ArrowUp class="w-4 h-4" /></template>
            </Button>
            <Button
              size="small"
              severity="secondary"
              variant="text"
              @click="moveItem(index, 1)"
              :disabled="index === selectedValues.length - 1"
              title="Descendre"
              class="border-0">
              <template #icon><ArrowDown class="w-4 h-4" /></template>
            </Button>
            <!-- Boutons de déplacement -->
            <Button
              severity="success"
              variant="outlined"
              @click="editValue(value.value)"
              title="Modifier"
              class="border-0">
              <template #icon><Pencil class="w-4 h-4" /></template>
            </Button>
            <Button
              severity="warn"
              variant="outlined"
              @click="removeValueFromArray(value.value)"
              title="Retirer"
              class="border-0">
              <template #icon><CircleX class="w-4 h-4" /></template>
            </Button>
            <Button
              severity="danger"
              variant="outlined"
              @click="confirmDelete(value.value)"
              title="Supprimer definitivement"
              class="border-0">
              <template #icon><Trash2 class="w-4 h-4" /></template>
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-5 items-end buttons flex-wrap">
      <div>
        <label class="block mb-1 text-md">Selectionner une valeur existante</label>
        <Select
          :id="field.name"
          :name="field.name"
          :options="field.options"
          optionLabel="label"
          optionValue="value"
          :placeholder="`Sélectionnez ${field.label.toLowerCase()}`"
          :class="{ 'p-invalid': errors.has(field.name) }"
          :filter="true"
          @filter="(event: any) => selectFilterSearch(event, field)"
          @change="selectionNewValue"
          :loading="loadingSelect"
          :disabled="disabled"
          class="w-full" />
      </div>
      <div>
        <Button
          severity="contrast"
          variant="outlined"
          @click="addNewValue"
          :disabled="disabled"
          :label="'Ajouter une nouvelle valeur'">
          <template #icon><Plus class="w-4 h-4" /></template>
        </Button>
      </div>
    </div>
  </div>

  <small v-if="errors.has(field.name)" class="text-red-500 block mt-1">
    {{ errors.get(field.name) }}
  </small>
  <Message v-if="resolv_error[field.name]?.invalid" severity="error" size="small" variant="simple">
    {{ resolv_error[field.name]?.error?.message }}
  </Message>
  <Dialog v-if="subEntity" v-model:visible="visible" modal header="Edit Profile" class="modal-dialog" position="top">
    <div>
      <EntityForm
        :customEntityName="subEntity"
        :customEntityId="customEntityId"
        :customFormData="subFormData"
        :manageCollection="false"
        @emitEntity="handleSubEntityEmit" />
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import type { EntityFormFieldInterface, BaseEntity } from '@/types';
import { ref, onMounted, computed, watch } from 'vue';
import Message from 'primevue/message';
import EntityForm from '@/hbkthemes/views/Entity/EntityForm.vue';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useEntityStore } from '@/stores/modules/entityStore';
import { useConfirm } from 'primevue/useconfirm';
import { useEntity } from '@/hbkthemes/views/Entity/useEntity';
import { useToast } from 'primevue/usetoast';
import { ArrowDown, ArrowUp, CircleX, Pencil, Plus, Trash2 } from '@lucide/vue';

const confirm = useConfirm();
interface SelectedItem {
  id: number | string;
}
const props = withDefaults(
  defineProps<{
    field: EntityFormFieldInterface;
    modelValue: Array<SelectedItem> | undefined;
    errors: Map<string, string>;
    resolv_error: any;
    disabled?: boolean;
    parent_id?: number | string;
  }>(),
  { disabled: false },
);
const entityStore = useEntityStore();
const selectedValueId = ref<SelectedItem[]>(props.modelValue !== undefined ? props.modelValue : []);
const { deleteEntity, loading } = useEntity();
/**
 * Contient les valeurs qui seront affiche dans le rendu.
 */
// const selectedValues = computed(() => {
//   const items = Array.from(selectedMap.value.values());
//   return entityStore.buildOptions(items, props.field);
// });
const selectedValues = computed(() => {
  const items = selectedValueId.value
    .map((item) => selectedMap.value.get(item.id)) // récupère l'entité depuis la Map
    .filter((entity): entity is BaseEntity | Record<string, any> => entity !== undefined);
  return entityStore.buildOptions(items, props.field);
});
/**
 * Permet de verifier qu'une valeur n'est pas deja ajouté.
 */
const selectedMap = ref<Map<number | string, BaseEntity | Record<string, any>>>(new Map());
const subEntity = ref<string | undefined>(props.field.reference?.entity);
const customEntityId = ref<number>(0);
const referenceField = props.field.reference?.mapped_by ?? '';
if (referenceField === '') {
  const toast = useToast();
  toast.add({
    severity: 'error',
    summary: 'Erreur de configuration',
    detail: 'Reference field is not defined for field ' + props.field.name,
    life: 5000,
  });
  console.error('Reference field is not defined ', props.field.name);
}
const getParentValue = () => {
  let value;
  if (props.field.reference?.type_orm) {
    if (props.field.reference?.type_orm === 'ManyToMany') {
      value = [{ id: props.parent_id }];
    } else {
      value = { id: props.parent_id };
    }
  }
  return value;
};
const subFormData = ref<any>({ [referenceField]: getParentValue() });
const visible = ref(false);
const loadingSelect = ref(false);
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
    loadingSelect.value = true;
    await entityStore.prepareSearch(query, field);
    loadingSelect.value = false;
  }, doneTypingInterval.value);
};

const handleSubEntityEmit = (data: any) => {
  visible.value = false;
  addSelectedValue(data.formData.id);
  addValue(data.formData);
};
const addSelectedValue = (value: number | string) => {
  const exists = selectedValueId.value.some((item) => item.id === value);
  if (!exists) {
    selectedValueId.value.push({ id: value });
  }
};
const addValue = (value: BaseEntity | Record<string, any>) => {
  if (!selectedMap.value.has(value.id)) {
    selectedMap.value.set(value.id, value);
  } else {
    // mise à jour de la valeur existante
    selectedMap.value.set(value.id, value);
  }
};

const moveItem = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= selectedValueId.value.length) return;
  const item = selectedValueId.value.splice(index, 1)[0];
  // Vérifier que l'élément existe
  if (!item) return;
  selectedValueId.value.splice(newIndex, 0, item);
};

/**
 * Recupere la valeur par defaut pour un champ et propose les options.
 */
const loadDefaultDatas = () => {
  const values = props.modelValue;
  const field = props.field;
  if (values !== undefined) {
    const entityNameReference = field.reference?.entity;
    values.forEach((value) => {
      if (value.id && entityNameReference) {
        entityStore.loadEntity(value.id, entityNameReference).then((response) => {
          addValue(response);
        });
      }
    });
  }
};
onMounted(() => {
  loadDefaultDatas();
});
const selectionNewValue = (item: any) => {
  const entityNameReference = props.field.reference?.entity;
  const id = item.value;
  const options = props.field.options;
  if (options) {
    options.forEach((option) => {
      if (option.value === id) {
        if (entityNameReference) {
          loadingSelect.value = true;
          entityStore
            .loadEntity(id, entityNameReference)
            .then((response) => {
              addValue(response);
              addSelectedValue(id);
              loadingSelect.value = false;
            })
            .catch(() => {
              loadingSelect.value = false;
            });
        }
      }
    });
  }
  // addSelectedValue(data.formData.id);
  // addValue(data.formData);
};
const addNewValue = () => {
  customEntityId.value = 0;
  visible.value = true;
};
const confirmDelete = (entityId: number) => {
  if (!selectedMap.value.has(entityId)) {
    return;
  }
  const selectedValue = selectedMap.value.get(entityId);
  const title = selectedValue?.title ?? selectedValue?.id;
  confirm.require({
    message: `Êtes-vous sûr de vouloir supprimer le contenu <span class='text-red-700 font-bold'>"${title}"</span> ? <br> Cette action est irréversible et supprimera définitivement toutes les données associées.`,
    header: 'Confirmation de suppression',
    rejectLabel: 'Cancel',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
    },
    accept: () => {
      deleteEntityReference(entityId);
    },
    reject: () => {},
  });
};
const deleteEntityReference = (entityId: number) => {
  deleteEntity(subEntity.value, entityId).then(() => {
    // selectedMap.value.delete(entityId);
    // selectedValueId.value.forEach((item, index) => {
    //   if (item.id === entityId) {
    //     selectedValueId.value.splice(index, 1);
    //   }
    // });
    removeValueFromArray(entityId);
  });
};
const removeValueFromArray = (entityId: number) => {
  selectedMap.value.delete(entityId);
  selectedValueId.value.forEach((item, index) => {
    if (item.id === entityId) {
      selectedValueId.value.splice(index, 1);
    }
  });
};
const editValue = (entityId: number) => {
  customEntityId.value = entityId;
  visible.value = true;
};
watch(
  selectedValueId,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true },
);
</script>
