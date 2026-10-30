<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent } from 'vue';
import { TriangleAlert } from '@lucide/vue';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import { useEntity } from '@/hbkthemes/views/Entity/useEntity';
import { useRouter } from 'vue-router';
import type { emitEntityToSaveInterface } from '@/types';

// const CustomForm = defineAsyncComponent({
//   loader: () => import('@/hbkthemes/Form/Form.vue'),
// });

const CustomForm = defineAsyncComponent(async () => {
  isCustomFormLoading.value = true;
  try {
    return await import('@/hbkthemes/Form/Form.vue');
  } finally {
    isCustomFormLoading.value = false;
  }
});

const props = withDefaults(
  defineProps<{
    customEntityName?: string;
    customEntityId?: number;
    customFormData?: any;
    manageCollection?: boolean;
    enableRedirect?: boolean;
    /** Classes d'espacement entre les champs, transmises au moteur de formulaire (défaut dans Form.vue : space-y-6). */
    fieldsSpacing?: string;
  }>(),
  {
    manageCollection: true,
    enableRedirect: true,
  },
);
const { entityName, entityFormFields, loading, request_error, loadFieldsAndEntity, entitySubmit, isNewEntity } =
  useEntity(props.customEntityName, props.customEntityId);
const router = useRouter();
const emit = defineEmits<{
  (e: 'emitEntity', data: emitEntityToSaveInterface): void;
}>();
const formKey = ref<string | null>(null);
const initFormulaire = async () => {
  // Charge les champs et l'entité, puis initialise les variables entityFormFields et formData.
  const result = await loadFieldsAndEntity();
  formKey.value = result.formKey;
};

const isCustomFormLoading = ref(true);

onMounted(async () => {
  initFormulaire();
});

/**
 * Validation et soumission du formulaire
 * @param event
 */
const handleSubmit = (value: emitEntityToSaveInterface) => {
  const action = value.action || 'edit';
  entitySubmit(value.formData)
    .then((entity) => {
      emit('emitEntity', { action: action, formData: entity });
      if (props.enableRedirect && action === 'edit') {
        if (isNewEntity.value) {
          const redirectPath = '/entity-collection/' + entityName.value + '/edit/' + entity.id;
          router.replace(redirectPath);
        }
      } else if (props.enableRedirect && action === 'collection') {
        const redirectPath = '/entity-collection/' + entityName.value + '/list';
        router.replace(redirectPath);
      }
    })
    .catch((error) => {
      console.error('handleSubmit error', error);
    });
};
</script>
<template>
  <div class="min-h-80 relative">
    <div
      v-show="(loading || entityFormFields.length === 0 || isCustomFormLoading) && !request_error"
      class="flex left-0 top-0 right-0 bottom-0 mt-3 bg-white/50 items-center justify-center absolute z-10">
      <div class="flex flex-col items-center gap-3">
        <ProgressSpinner style="width: 70px; height: 70px" />
        <span v-if="entityFormFields.length === 0 || isCustomFormLoading" class="text-lg text-surface-500 mt-4">
          Chargement du formulaire...
        </span>
        <span v-else class="text-lg text-surface-500 mt-4">Sauvegarde en cours...</span>
      </div>
    </div>
    <div class="card bg-transparent m-3" v-if="request_error && (!request_error.status || request_error.error)">
      <Message closable severity="error">
        <template #icon><TriangleAlert class="w-4 h-4" /></template>
        <div
          v-if="request_error.error && request_error.error.data && request_error.error.data.detail"
          v-html="request_error.error.data.detail"></div>
        <div v-else>Une erreur est survenue lors du chargement du formulaire.</div>
      </Message>
    </div>
    <Transition name="fade_load_form_entity">
      <div v-if="entityFormFields.length > 0 && formKey" class="dynamic-form">
        <!-- Le formulaire doit etre initialiser apres obtention des données -->
        <CustomForm
          :formFields="entityFormFields"
          :overrideValues="customFormData"
          :formKey="formKey"
          :loading="loading"
          :request_error="request_error"
          :fieldsSpacing="props.fieldsSpacing"
          :manageCollection="props.manageCollection === undefined ? true : props.manageCollection"
          @submit_form="handleSubmit" />
      </div>
    </Transition>
  </div>
</template>
<style lang="scss">
.dynamic-form {
  max-width: 1000px;
  .p-password-input {
    width: 100%;
  }
}
// animation
.fade_load_form_entity-enter-active {
  transition:
    opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.fade_load_form_entity-leave-active {
  transition:
    opacity 0.1s ease-in,
    transform 0.1s ease-in;
}

.fade_load_form_entity-enter-from,
.fade_load_form_entity-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.fade_load_form_entity-enter-to,
.fade_load_form_entity-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
