<!-- components/CKEditorTextarea.vue -->
<template>
  <label :for="field.name" class="block font-medium mb-1">
    {{ field.label }}
    <span v-if="field.required" class="text-red-500">*</span>
  </label>
  <div class="ckeditor-wrapper">
    <textarea
      :id="field.name"
      :name="field.name"
      ref="textareaRef"
      :rows="rows"
      class="w-full"
      :disabled="disabled"></textarea>
  </div>
  <small v-if="errors.has(field.name)" class="text-red-500 block mt-1">
    {{ errors.get(field.name) }}
  </small>
  <Message v-if="resolv_error[field.name]?.invalid" severity="error" size="small" variant="simple">
    {{ resolv_error[field.name]?.error?.message }}
  </Message>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Message from 'primevue/message';
import ckeditorBuilder from '@/hbkthemes/Form/ckeditor';
import type { EntityFormFieldInterface } from '@/types';

// Props
const props = withDefaults(
  defineProps<{
    field: EntityFormFieldInterface;
    modelValue?: string;
    errors: Map<string, string>;
    resolv_error: any;
    rows?: number;
    disabled?: boolean;
  }>(),
  {
    rows: 5,
    disabled: false,
  },
);

// Emits
const emit = defineEmits(['update:modelValue']);

// Refs
const textareaRef = ref<HTMLTextAreaElement | null>(null);
let editorInstance: any = null;

// Initialisation de CKEditor
onMounted(async () => {
  if (textareaRef.value) {
    try {
      const builder = new ckeditorBuilder(textareaRef.value);
      editorInstance = await builder.init();
      if (props.disabled) {
        editorInstance.enableReadOnlyMode(props.field.name);
      } else {
        // Initialiser avec la valeur du modèle
        if (props.modelValue) {
          editorInstance.setData(props.modelValue);
        }
        // Écouter les changements
        editorInstance.model.document.on('change:data', () => {
          const data = editorInstance.getData();
          emit('update:modelValue', data);
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation de CKEditor:", error);
    }
  }
});

// Mettre à jour l'éditeur si la valeur change de l'extérieur
watch(
  () => props.modelValue,
  (newValue) => {
    if (editorInstance && editorInstance.getData() !== newValue) {
      editorInstance.setData(newValue || '');
    }
  },
);

// Nettoyage
onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.destroy().catch(console.error);
    editorInstance = null;
  }
});
</script>

<style scoped>
.ckeditor-wrapper :deep(.ck-editor__editable) {
  min-height: 200px;
  max-height: 500px;
}

.ckeditor-wrapper :deep(.ck-editor__editable_inline) {
  border-color: #d1d5db;
}

.ckeditor-wrapper :deep(.ck.ck-editor__main > .ck-editor__editable:not(.ck-focused)) {
  border-color: #d1d5db;
}

.ckeditor-wrapper :deep(.ck.ck-editor__main > .ck-editor__editable.ck-focused) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
</style>
