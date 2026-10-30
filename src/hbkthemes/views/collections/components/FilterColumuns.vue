<template>
  <div>
    <Button
      label="Filter"
      @click="visible = !visible"
      size="small"
      severity="secondary"
      :disabled="disabled"
      variant="outlined">
      <template #icon><Filter class="w-4 h-4" /></template>
    </Button>
    <Dialog v-model:visible="visible" modal class="modal-dialog" position="center">
      <template #header>
        <h4 class="font-bold">Selectionner les colonnes</h4>
      </template>
      <template #default>
        <Form class="py-5">
          <div v-for="(column, fieldname) in columns" :key="fieldname" class="mb-4 flex gap-4">
            <div class="mb-2">
              <FloatLabel variant="on">
                <label :for="fieldname + '_label'" class="block font-medium mb-1">Nom de la colonne</label>
                <InputText v-model="column.label" :id="fieldname + '_label'" :name="fieldname + '_label'" />
              </FloatLabel>
            </div>
            <div class="flex gap-4 items-center">
              <ToggleSwitch
                :inputId="fieldname + '_display'"
                :name="fieldname + '_display'"
                v-model="column.display"
                size="small"
                severity="contrast" />
              <label :for="fieldname + '_display'" class="block font-medium mb-1 small">Afficher / masquer</label>
            </div>
          </div>
          <Button
            type="submit"
            name="submit_action"
            label="Enregistrer"
            severity="contrast"
            variant="outline"
            rounded
            text
            raised
            value="nothing"
            @click="saveConfig" />
        </Form>
      </template>
    </Dialog>
  </div>
</template>
<script setup lang="ts">
import { Filter } from '@lucide/vue';
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ToggleSwitch from 'primevue/toggleswitch';
import FloatLabel from 'primevue/floatlabel';
import { Form } from '@primevue/forms';
import type { EntityDefinitionInterface } from '@/types';

// Start  ==================== PROPS & EMITS ====================
const props = withDefaults(
  defineProps<{
    entityDefinition: EntityDefinitionInterface;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  (e: 'saveConfig', data: Record<string, any>): void;
}>();
// END ==================== PROPS & EMITS ====================

// Start  ==================== ÉTATS LOCAUX ====================
const visible = ref(false);
// END ==================== ÉTATS LOCAUX ====================

// Start  ==================== COMPUTED ====================
const columns = computed(() => props.entityDefinition.columns);
// END ==================== COMPUTED ====================

// Start  ==================== MÉTHODES ====================
const saveConfig = () => {
  emit('saveConfig', columns.value);
  visible.value = false;
};
// END ==================== MÉTHODES ====================
</script>
