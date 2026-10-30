import { defineStore } from 'pinia';
import { computed, ref, type WritableComputedRef } from 'vue';
import type { FormHandler, FormDatasInterface, FormData } from '@/types/formDataInterface';

type FormValue = unknown;
type FormDataRecord = Record<string, FormValue>;

export const useFormDataStore = defineStore('formData', () => {
  /**
   * Contient les données de tous les formulaires.
   *
   * La clé doit identifier un formulaire unique :
   * - customer-create
   * - customer-edit-12
   */
  const formDatas = ref<FormDatasInterface>({});

  /**
   * Crée une clé unique pour identifier un formulaire.
   */
  const createFormKey = (entityName: string, id?: number | null): string => {
    if (id === null) {
      return `${entityName}-create`;
    }
    if (Number.isFinite(id)) return `${entityName}-edit-${id}`;
    throw new Error(`Invalid id: ${id}`);
  };

  /**
   * Définit les données complètes d'un formulaire.
   */
  const setFormData = (key: string, value: FormData): void => {
    formDatas.value[key] = value;
  };

  /**
   * Récupère les données d'un formulaire.
   *
   * @throws Error si la clé n'existe pas.
   */
  const getFormData = (key: string): FormData => {
    const formData = formDatas.value[key];

    if (formData === undefined) {
      throw new Error(`Form data not found for key: ${key}`);
    }

    return formData;
  };

  /**
   * Fusionne les données existantes avec de nouvelles valeurs.
   */
  const mergeFormData = (key: string, value: Partial<FormDataRecord>): void => {
    const current = getFormData(key);

    formDatas.value[key] = {
      ...current,
      ...value,
    };
  };

  /**
   * Récupère la valeur d'un champ.
   */
  const getValueInFormData = (key: string, field: string): FormValue => {
    return getFormData(key)[field];
  };

  /**
   * Définit la valeur d'un champ.
   */
  const setValueInFormData = (key: string, field: string, value: FormValue): void => {
    const current = getFormData(key);
    if (current[field] === value) {
      return;
    }
    current[field] = value;
  };
  /**
   * Retourne un computed compatible v-model.
   */
  const vModel = (key: string, field: string): WritableComputedRef<FormValue> => {
    return computed<FormValue>({
      get: () => getValueInFormData(key, field),
      set: (value: FormValue) => {
        setValueInFormData(key, field, value);
      },
    });
  };

  /**
   * Supprime les données d'un formulaire.
   */
  const removeFormData = (key: string): void => {
    delete formDatas.value[key];
  };

  /**
   * Retourne un gestionnaire dédié à un formulaire.
   *
   * Permet d'éviter de répéter la clé partout dans les composants.
   */
  const form = (key: string): FormHandler => {
    return {
      getFormData: () => getFormData(key),
      setFormData: (value: FormData): void => {
        setFormData(key, value);
      },
      mergeFormData: (value: Partial<FormDataRecord>): void => {
        mergeFormData(key, value);
      },
      getValue: (field: string): FormValue => {
        return getValueInFormData(key, field);
      },
      setValue: (field: string, value: FormValue): void => {
        setValueInFormData(key, field, value);
      },
      model: (field: string): WritableComputedRef<FormValue> => {
        return vModel(key, field);
      },
      remove: (): void => {
        removeFormData(key);
      },
    };
  };

  return {
    formDatas,
    createFormKey,
    setFormData,
    getFormData,
    mergeFormData,
    getValueInFormData,
    setValueInFormData,
    vModel,
    removeFormData,
    form,
  };
});
