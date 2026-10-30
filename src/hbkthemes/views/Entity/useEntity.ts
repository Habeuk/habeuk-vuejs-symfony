// composables/useEntity.ts
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/stores/modules/appStore';
import { useEntityStore } from '@/stores/modules/entityStore';
import { useToast } from 'primevue/usetoast';
import type { EntityFormFieldInterface, BaseEntity, BaseEntityView } from '@/types';
import { useFormDataStore } from '@/stores/modules/formDataStore';

export const useEntity = (customEntityName: string | null = null, customEntityId: number | null = null) => {
  const appStore = useAppStore();
  const route = useRoute();
  const router = useRouter();
  const entityStore = useEntityStore();
  const toast = useToast();
  const formDataStore = useFormDataStore();
  /**
   * Les données du formulaire.
   */
  // const formData = ref<Record<string, any> | BaseEntity>({});
  const loading = ref(false);
  const request_error = ref<any>(null);
  /**
   * Champs du formulaire.
   */
  const entityFormFields = ref<EntityFormFieldInterface[]>([]);
  const loadingConfig = ref(false);
  const errorConfig = ref<string | null>(null);

  const entityName = computed(() => customEntityName ?? appStore.entityName);
  const entityId = computed((): number | null => {
    if (customEntityId === 0) return null;
    const idFromRoute = route.params.entity_id as string | undefined;
    const id = customEntityId ?? idFromRoute;
    return id ? Number(id) : null;
  });
  const isNewEntity = computed(() => entityId.value === null);

  /**
   * Charge les champs et l'entité en cours.
   * Initialise les variables formData et entityFormFields.
   * @returns
   */
  const loadFieldsAndEntity = async (): Promise<{
    formData: Record<string, any> | BaseEntity;
    entityFormFields: EntityFormFieldInterface[];
    formKey: string;
  }> => {
    const entityNameResult = entityName.value;
    const id = entityId.value;
    if (!entityNameResult) {
      return Promise.reject(new Error("Nom d'entité manquant"));
    }

    try {
      reset();
      const result = await entityStore.initEntityForm(entityNameResult, id);
      const formKey = result.formKey;
      entityFormFields.value = result.entityFormFields;
      return { formData: formDataStore.getFormData(formKey), entityFormFields: entityFormFields.value, formKey };
    } catch (rp: any) {
      const error = rp?.error ?? rp;
      if (error?.data) {
        toast.add({
          severity: 'error',
          summary: error.statusText || 'Une erreur est survenue',
          detail: error.data.error || 'Une erreur est survenue',
          life: 5000,
        });
      }
      request_error.value = rp;
      throw rp;
    }
  };

  const reset = () => {
    loadingConfig.value = false;
    errorConfig.value = null;
  };

  /**
   * Validation et soumission du formulaire
   * @param event
   */
  const entitySubmit = async (value: any): Promise<BaseEntityView> => {
    if (!value || !entityName.value) {
      const error = new Error("Données du formulaire ou nom d'entité manquant");
      request_error.value = error;
      throw error;
    }

    entityStore.setEntity(value as BaseEntity);
    loading.value = true;
    try {
      const response = await entityStore.save(entityName.value);
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Formulaire sauvegardé avec succès',
        life: 3000,
      });
      return response.data;
    } catch (rp: any) {
      request_error.value = rp;
      const error = rp?.error ?? rp;
      if (error?.data) {
        toast.add({
          severity: 'error',
          summary: error.statusText || 'Une erreur est survenue',
          detail: error.data.error || 'Une erreur est survenue',
          life: 5000,
        });
      }
      throw rp;
    } finally {
      loading.value = false;
    }
  };
  const loadEntity = async (customEntityName: string | null = null, customEntityId: number | null = null): Promise<BaseEntity> => {
    const entityNameFinal = customEntityName ?? entityName.value;
    const entityIdFinal = customEntityId ?? entityId.value;
    if (!entityNameFinal) {
      throw new Error("Le type d'entité manquant");
    }
    if (!entityIdFinal) {
      throw new Error("L'identifiant de l'entité manquant");
    }
    try {
      loading.value = true;
      const response = await entityStore.loadEntity(entityIdFinal, entityNameFinal);
      return response;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const duplicateEntity = async (customEntityName: string | null = null, customEntityId: number | string | null = null): Promise<BaseEntity> => {
    const entityNameFinal = customEntityName ?? entityName.value;
    const entityIdFinal = customEntityId ?? entityId.value;
    if (!entityNameFinal) {
      throw new Error("Le type d'entité manquant");
    }
    if (!entityIdFinal) {
      throw new Error("L'identifiant de l'entité manquant");
    }
    try {
      loading.value = true;
      const response = await entityStore.duplicateEntity(entityIdFinal, entityNameFinal);
      return response;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteEntity = async (customEntityName: string | null = null, customEntityId: number | string | null = null): Promise<void> => {
    const entityNameFinal = customEntityName ?? entityName.value;
    const entityIdFinal = customEntityId ?? entityId.value;
    if (!entityNameFinal) {
      return;
    }
    if (!entityIdFinal) {
      return;
    }
    try {
      loading.value = true;
      await entityStore.deleteEntity(entityIdFinal, entityNameFinal);
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Entité supprimée avec succès',
        life: 3000,
      });
      reset();
    } catch (rp: any) {
      request_error.value = rp;
      const error = rp?.error ?? rp;
      if (error?.data) {
        toast.add({
          severity: 'error',
          summary: error.statusText || 'Une erreur est survenue',
          detail: error.data.error || 'Une erreur est survenue',
          life: 5000,
        });
      }
      throw rp;
    } finally {
      loading.value = false;
    }
  };
  const redirectToEntity = (entityId: number | string) => {
    router.push({ name: 'entity_' + entityName.value, params: { entity_id: entityId } });
  };
  /**
   * On cree un raccourci pour setValueInFormData
   */
  const setValueInFormData = (key: string, field: string, value: any) => {
    formDataStore.setValueInFormData(key, field, value);
  };
  /**
   * On cree un raccourci pour getFormData
   */
  const getFormData = (key: string) => {
    return formDataStore.getFormData(key);
  };

  /**
   * On cree un raccourci pour mergeFormData
   */
  const mergeFormData = (key: string, data: Record<string, any>) => {
    formDataStore.mergeFormData(key, data);
  };

  return {
    entityName,
    entityId,
    loadingConfig,
    loading,
    request_error,
    errorConfig,
    loadFieldsAndEntity,
    entitySubmit,
    deleteEntity,
    entityFormFields,
    // on n'expose plus formData car il est possible que la valeur ne soit plus la bonne.
    // formData,
    loadEntity,
    duplicateEntity,
    isNewEntity,
    redirectToEntity,
    setValueInFormData,
    getFormData,
    mergeFormData,
  };
};
