<script setup lang="ts">
import { ref, computed, onMounted, watch, useAttrs, defineAsyncComponent } from 'vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Message from 'primevue/message';
// import EntitySelect from '@/hbkthemes/views/Entity/fields/EntitySelect.vue';
// import EntitiesSelect from '@/hbkthemes/views/Entity/fields/EntitiesSelect.vue';
import Tree from 'primevue/tree';
import InputNumber from 'primevue/inputnumber';
import InputMask from 'primevue/inputmask';
import ToggleSwitch from 'primevue/toggleswitch';
import { Save } from '@lucide/vue';
// import FilesUpload from '@/hbkthemes/views/Entity/fields/FilesUpload.vue';
// import CKEditorTextarea from '@/hbkthemes/Form/CKEditorTextarea.vue';
// import Editor from 'primevue/editor';
// import TinyMceEditor from '@/hbkthemes/Form/TinyMceEditor.vue';
import { useFormDataStore } from '@/stores/modules/formDataStore';
import { Form } from '@primevue/forms';
import { ValidationForm } from '@/hbkthemes/views/Entity/validationForm';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from 'primevue/usetoast';
import type { FormHandler } from '@/types/formDataInterface';
import type { EntityFormFieldInterface, violationsFormInterface, violationFormInterface, emitEntityToSaveInterface } from '@/types';

const EntitySelect = defineAsyncComponent({
  loader: () => import('@/hbkthemes/views/Entity/fields/EntitySelect.vue'),
  delay: 0,
});
const EntitiesSelect = defineAsyncComponent({
  loader: () => import('@/hbkthemes/views/Entity/fields/EntitiesSelect.vue'),
  delay: 0,
});
const FilesUpload = defineAsyncComponent({
  loader: () => import('@/hbkthemes/views/Entity/fields/FilesUpload.vue'),
  delay: 0,
});
const CKEditorTextarea = defineAsyncComponent({
  loader: () => import('@/hbkthemes/Form/CKEditorTextarea.vue'),
  delay: 0,
});
const Editor = defineAsyncComponent({
  loader: () => import('primevue/editor'),
  delay: 0,
});
const TinyMceEditor = defineAsyncComponent({
  loader: () => import('@/hbkthemes/Form/TinyMceEditor.vue'),
  delay: 0,
});

const props = withDefaults(
  defineProps<{
    // la clée est tres importante pour identifier le formulaire. syntaxe : entityName-create|entityName-edit-{id}
    formKey: string;
    formFields: EntityFormFieldInterface[];
    overrideValues?: Record<string, any>;
    loading: boolean;
    request_error?: Record<string, any> | null;
    emitDelay?: number;
    autoEmit?: boolean;
    manageCollection?: boolean;
    debug?: boolean;
    propertyKey?: string;
    /** Classes d'espacement appliquées entre les champs (défaut : space-y-6). */
    fieldsSpacing?: string;
  }>(),
  {
    request_error: null,
    emitDelay: 500,
    autoEmit: false,
    manageCollection: false,
    debug: false,
    fieldsSpacing: 'space-y-6',
  },
);
//On securise les attributes pour eviter les erreurs.
//
const attrs = useAttrs();

const forbiddenAttrs = Object.keys(attrs).filter((key) => {
  return !key.startsWith('on');
});

if (import.meta.env.DEV && forbiddenAttrs.length > 0) {
  throw new Error(`Props inconnues reçues par le composant : ${forbiddenAttrs.join(', ')}`);
}
//
const formDataStore = useFormDataStore();
if (props.overrideValues) {
  formDataStore.mergeFormData(props.formKey, props.overrideValues);
}
defineExpose({
  /**
   * @deprecated Utilisez setValueInFormData à la place.
   * @param key
   * @param value
   */
  setFieldValue: (key: string, value: any) => {
    formData.value.setValue(key, value);
  },
  getFieldValue: (key: string) => {
    return formData.value.getValue(key);
  },
  setValues: (values: Record<string, any>) => {
    Object.assign(formData, values);
  },
});

const resolver = ref();
const toast = useToast();
const emit = defineEmits<{
  (e: 'submit_form', data: emitEntityToSaveInterface): void;
  (e: 'form_change', data: Record<string, any>): void;
}>();
/**
 * Les données du formulaire.
 */
const formData = computed((): FormHandler => {
  return formDataStore.form(props.formKey);
});
const violations = ref<violationsFormInterface | null>(null);
const errors = ref<Map<string, string>>(new Map());
/**
 * Les champs du formulaire.
 */
const entityFormFields = computed(() => props.formFields);

const handleSubmit = (event: any) => {
  if (!event.valid) {
    toast.add({
      severity: 'error',
      summary: 'Erreur de validation',
      detail: 'Veuillez corriger les erreurs dans le formulaire',
      life: 5000,
    });
    return;
  }
  const values = formData.value.getFormData();
  const submitAction = event.originalEvent?.submitter?.value;
  const emitEntityToSave = {
    formData: values,
    action: submitAction,
  };
  emit('submit_form', emitEntityToSave);
};
/**
 * Active ou désactive le bouton de soumission du formulaire si les champs requis sont vide.
 * ( Permet de faire une verification minimale du formulaire ).
 * ( pas tres tres utile. Zod fait une verification plus complete à la soumission)
 * @todo à supprimer des que possible.
 */
const isFormValid = computed(() => {
  for (const field of entityFormFields.value) {
    if (field.type === 'submit') continue;
    if (field.required) {
      if (field.type === 'password_repeated') {
        const password = formData.value.getValue(field.name + '_first');
        const confirm = formData.value.getValue(field.name + '_second');
        if (!password || !confirm || password !== confirm) {
          return false;
        }
      } else if (formData.value.getValue(field.name) === null || formData.value.getValue(field.name) === undefined) {
        return false;
      }
    }
  }
  return true;
});

const initFormulaire = () => {
  const validationForm = new ValidationForm(entityFormFields.value);
  const zodSchema = validationForm.convertSymfonyValidationToZod();
  resolver.value = zodResolver(zodSchema);
};
onMounted(() => {
  initFormulaire();
});

/**
 * Affiche les erreurs provenant du serveur.
 */
const applyErrorsFromServer = () => {
  if (violations.value) {
    violations.value.violations.forEach((violation: violationFormInterface) => {
      if (errors.value) errors.value.set(violation.propertyPath, violation.title);
    });
  }
};
// Timer pour le debounce de l'autoEmit
let emitTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Émet la nouvelle valeur du formulaire.
 */
const emitFormChange = (newValue: any) => {
  if (!props.autoEmit) return;
  if (emitTimer) {
    clearTimeout(emitTimer);
  }
  emitTimer = setTimeout(() => {
    emit('form_change', {
      [props.propertyKey!]: newValue,
    });
  }, props.emitDelay);
};
/**
 * --
 */
watch(
  () => props.request_error,
  (error) => {
    if (error) {
      // Get errors validations
      if (error.data?.form_errors?.violations) {
        violations.value = error.data.form_errors;
        applyErrorsFromServer();
      }
    }
  },
  { deep: true },
);
/**
 * Watcher pour autoEmit sur toutes les propriétés de formData
 */
if (props.autoEmit) {
  if (props.propertyKey !== undefined) {
    watch(
      // on watch directement les données du formulaire dans le store.
      () => formDataStore.formDatas[props.formKey]?.[props.propertyKey as string],
      (newValue) => {
        emitFormChange(newValue);
      },
      { deep: true },
    );
  } else {
    console.error('Vous avez definit autoEmit, mais vous avez oublié de définir propertyKey', props.propertyKey, '; formKey', props.formKey);
  }
}
</script>
<template>
  <!-- Le formulaire doit être initialisé après obtention des données -->
  <Form @submit="handleSubmit" :class="['p-fluid', fieldsSpacing]" :resolver="resolver" v-slot="$form" :initialValues="formData.getFormData()">
    <slot name="fields" :fields="entityFormFields" :formData="formData" :errors="errors" :$form="$form" :isFormValid="isFormValid">
      <div v-for="field in entityFormFields" :key="field.name" class="field">
        <!-- Champs de type email / text -->
        <div v-if="field.type === 'email' || field.type === 'text'" class="space-y-2">
          <label :for="field.name" class="block font-medium">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <InputText
            :id="field.name"
            :name="field.name"
            v-model="formData.model(field.name).value"
            :type="field.type"
            :placeholder="field.placeholder || undefined"
            :maxlength="field.maxlength === null ? undefined : field.maxlength"
            :class="['w-full', { 'p-invalid': errors.has(field.name) }]" />
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- InputMask -->
        <div v-if="field.type === 'inputmask'" class="space-y-2">
          <label :for="field.name" class="block font-medium">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <InputMask
            :id="field.name"
            :name="field.name"
            :model-value="formData.getValue(field.name)"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :mask="field.mask ? field.mask : undefined"
            :slotChar="field.slotChar ? field.slotChar : undefined"
            :placeholder="field.placeholder || undefined"
            :class="['w-full', { 'p-invalid': errors.has(field.name) }]"
            :unmask="true"
            :autoClear="false" />
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- Number -->
        <div v-if="field.type === 'number'" class="space-y-2">
          <label :for="field.name" class="block font-medium">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <InputNumber
            :id="field.name"
            :name="field.name"
            :model-value="formData.getValue(field.name)"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :placeholder="field.placeholder || undefined"
            :minFractionDigits="field.scale ?? 0"
            :class="['w-full', { 'p-invalid': errors.has(field.name) }]" />
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- Mot de passe simple -->
        <div v-else-if="field.type === 'password'" class="space-y-2">
          <label :for="field.name" class="block font-medium">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <Password
            :id="field.name"
            :name="field.name"
            :model-value="formData.getValue(field.name)"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :placeholder="field.placeholder || undefined"
            :toggleMask="true"
            :feedback="false"
            :class="['w-full', { 'p-invalid': errors.has(field.name) }]"
            inputClass="w-full" />
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- Mot de passe répété (RepeatedType) -->
        <div v-else-if="field.type === 'password_repeated'" class="space-y-2">
          <label class="block font-medium">
            {{ field.firstLabel }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <Password
            :id="field.name + '_first'"
            :name="field.name + '_first'"
            :model-value="formData.getValue(field.name + '_first')"
            @update:model-value="(value) => formData.setValue(field.name + '_first', value)"
            :placeholder="field.placeholder || undefined"
            :toggleMask="true"
            :feedback="false"
            :class="['w-full mb-1', { 'p-invalid': errors.has(field.name + '_first') }]"
            inputClass="w-full"
            showClear />
          <label class="block font-medium">
            {{ field.secondLabel }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <Password
            :id="field.name + '_second'"
            :name="field.name + '_second'"
            :model-value="formData.getValue(field.name + '_second')"
            @update:model-value="(value) => formData.setValue(field.name + '_second', value)"
            :placeholder="field.placeholder || undefined"
            :toggleMask="true"
            :feedback="false"
            :class="['w-full', { 'p-invalid': errors.has(field.name + '_second') }]"
            inputClass="w-full" />
          <small v-if="errors.has(field.name + '_second')" class="text-danger-500 block text-sm">
            {{ errors.get(field.name + '_second') }}
          </small>
        </div>

        <!-- Textarea -->
        <div v-else-if="field.type === 'textarea'" class="space-y-2">
          <label :for="field.name" class="block font-medium">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <Textarea
            :id="field.name"
            :name="field.name"
            :model-value="formData.getValue(field.name)"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :placeholder="field.placeholder || undefined"
            :rows="field.rows || 3"
            :class="['w-full', { 'p-invalid': errors.has(field.name) }]" />
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- Select / Dropdown -->
        <div v-else-if="field.type === 'select'" class="space-y-2">
          <label :for="field.name" class="block font-medium">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <Select
            :id="field.name"
            :name="field.name"
            :model-value="formData.getValue(field.name)"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :options="field.options"
            optionLabel="label"
            optionValue="value"
            :placeholder="`Sélectionnez ${field.label.toLowerCase()}`"
            :class="['w-full', { 'p-invalid': errors.has(field.name) }]"
            :filter="field.filter === true ? true : false"
            inputClass="w-full" />
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- Checkbox -->
        <div v-else-if="field.type === 'checkbox'" class="space-y-2">
          <div class="flex items-center gap-2">
            <Checkbox
              :inputId="field.name"
              :name="field.name"
              :model-value="formData.getValue(field.name)"
              @update:model-value="(value) => formData.setValue(field.name, value)"
              :binary="true"
              :class="{ 'p-invalid': errors.has(field.name) }" />
            <label :for="field.name">
              {{ field.label }}
              <span v-if="field.required" class="text-danger-500">*</span>
            </label>
          </div>
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- ToggleSwitch -->
        <div v-else-if="field.type === 'toggle_switch'" class="space-y-2">
          <div class="flex items-center gap-2">
            <ToggleSwitch :inputId="field.name" :name="field.name" v-model="formData.model(field.name).value" />
            <label :for="field.name">
              {{ field.label }}
              <span v-if="field.required" class="text-danger-500">*</span>
            </label>
          </div>
        </div>

        <!-- EntitySelect -->
        <div v-else-if="field.type === 'entity_select'">
          <EntitySelect
            :field="field"
            :model-value="formData.getValue(field.name)"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :errors="errors"
            :resolv_error="$form"
            :entity="formData.getFormData()" />
        </div>

        <!-- EntitiesSelect -->
        <div v-else-if="field.type === 'entities_select'">
          <EntitiesSelect
            :field="field"
            :model-value="formData.getValue(field.name)"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :errors="errors"
            :resolv_error="$form"
            :parent_id="formData.getValue('id')" />
        </div>

        <!-- CKEditor -->
        <div v-else-if="field.type === 'textarea_ckeditor'">
          <CKEditorTextarea
            :field="field"
            :model-value="formData.getValue(field.name)"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :errors="errors"
            :resolv_error="$form"
            :rows="field.rows ?? 5" />
        </div>

        <!-- TinyMCE -->
        <div v-else-if="field.type === 'textarea_tinymce'">
          <TinyMceEditor
            :field="field"
            :model-value="formData.getValue(field.name)"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :errors="errors"
            :resolv_error="$form"
            :rows="field.rows ?? 5" />
        </div>

        <!-- Editor PrimeVue -->
        <div v-else-if="field.type === 'textarea_primevue'" class="space-y-2">
          <pre> cas : {{ field.type }} </pre>
          <label :for="field.name" class="block font-medium">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <Editor
            :id="field.name"
            :name="field.name"
            :model-value="formData.getValue(field.name)"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :placeholder="field.placeholder || undefined"
            :class="['w-full', { 'p-invalid': errors.has(field.name) }]"
            editorStyle="height: 320px" />
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- Checkboxes (groupe de cases à cocher) -->
        <div v-else-if="field.type === 'checkboxes'" class="space-y-2">
          <label :for="field.name" class="block font-medium">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <div class="flex flex-col gap-2">
            <div v-for="option in field.options" :key="String(option.value)" class="flex items-center gap-2">
              <Checkbox
                :inputId="field.name + '-' + option.value"
                :name="field.name"
                :value="option.value"
                :model-value="formData.getValue(field.name) ?? []"
                @update:model-value="(value) => formData.setValue(field.name, value)"
                :class="{ 'p-invalid': errors.has(field.name) }" />
              <label :for="field.name + '-' + option.value">{{ option.label }}</label>
            </div>
          </div>
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- MultiSelect -->
        <div v-else-if="field.type === 'multiselect'" class="space-y-2">
          <label :for="field.name" class="block font-medium">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <MultiSelect
            :id="field.name"
            :name="field.name"
            :model-value="formData.getValue(field.name) ?? []"
            @update:model-value="(value) => formData.setValue(field.name, value)"
            :options="field.options"
            optionLabel="label"
            optionValue="value"
            :placeholder="`Sélectionnez ${field.label.toLowerCase()}`"
            :class="['w-full', { 'p-invalid': errors.has(field.name) }]"
            :filter="field.filter === true ? true : false"
            display="chip" />
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- Tree -->
        <div v-else-if="field.type === 'tree'" class="space-y-2">
          <label :for="field.name" class="block font-medium">
            {{ field.label }}
            <span v-if="field.required" class="text-danger-500">*</span>
          </label>
          <Tree
            :id="field.name"
            :name="field.name"
            v-model:selectionKeys="formData.model(field.name).value"
            :value="field.tree_data"
            selectionMode="checkbox"
            :metaKeySelection="true"
            :droppableNodes="true"
            class="w-full md:w-[30rem]" />
          <small v-if="errors.has(field.name)" class="text-danger-500 block text-sm">
            {{ errors.get(field.name) }}
          </small>
          <Message v-if="$form[field.name]?.invalid" severity="error" size="small" variant="simple">
            {{ $form[field.name]?.error?.message }}
          </Message>
        </div>

        <!-- FileUpload -->
        <FilesUpload
          v-else-if="field.type === 'file_upload'"
          :field="field"
          :model-value="formData.getValue(field.name)"
          @update:model-value="(value) => formData.setValue(field.name, value)"
          :errors="errors"
          :resolv_error="$form" />

        <!-- Bouton submit -->
        <div v-else-if="field.type === 'submit'" class="space-y-2">
          <div v-if="props.manageCollection" class="flex gap-3 flex-wrap justify-between items-center">
            <Button
              type="submit"
              name="submit_action"
              :label="field.label"
              :loading="loading"
              :disabled="!isFormValid || loading"
              severity="primary"
              variant="outline"
              rounded
              text
              raised
              :class="[
                'w-full bg-linear-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 max-w-[300px]',
                loading || !isFormValid
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]',
              ]"
              value="edit">
              <template #icon>
                <Save class="w-4 h-4" />
              </template>
            </Button>
            <Button
              type="submit"
              name="submit_action"
              :label="field.label + ' & Retourner à la liste'"
              :loading="loading"
              :disabled="!isFormValid || loading"
              severity="primary"
              variant="outline"
              rounded
              outlined
              :class="[
                'w-full bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg transition-all max-w-[300px]',
                loading || !isFormValid ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
              ]"
              value="collection">
              <template #icon>
                <Save class="w-4 h-4" />
              </template>
            </Button>
          </div>
          <div v-else>
            <Button
              type="submit"
              name="submit_action"
              :label="field.label"
              :loading="loading"
              :disabled="!isFormValid || loading"
              severity="primary"
              variant="outline"
              rounded
              text
              raised
              :class="[
                'w-full bg-linear-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 max-w-[300px]',
                loading || !isFormValid
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]',
              ]"
              value="nothing">
              <template #icon>
                <Save class="w-4 h-4" />
              </template>
            </Button>
          </div>
        </div>
      </div>
    </slot>
    <div v-if="props.debug" class="bg-surface-100 border border-surface-200 !text-sm p-3 rounded-md">
      <pre> formData : {{ formData.getFormData() }} </pre>
    </div>
  </Form>
</template>
