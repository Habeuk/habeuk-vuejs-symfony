import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import rootAxios from '@/configs/rootAxiosBody';
import type { EntityConfigAll, EntityFormFieldInterface, BaseEntityView, BaseEntity } from '@/types';
import { useFormDataStore } from '@/stores/modules/formDataStore';

export const useEntityStore = defineStore('entity', () => {
  const { setFormData, createFormKey } = useFormDataStore();
  const baseUrl = `/api/crud`;
  const cacheSchemas = ref<Record<string, EntityConfigAll>>({});
  const entity = ref<BaseEntityView | BaseEntity | null>(null);
  const setEntity = (value: BaseEntity) => {
    entity.value = value;
  };
  const getEntity = (): BaseEntityView | BaseEntity | null => {
    return entity.value;
  };
  const setSchema = (entityName: string, action: string, value: EntityConfigAll) => {
    cacheSchemas.value[entityName + '--' + action] = value;
  };
  const getSchema = (entityName: string, action: string): EntityConfigAll => {
    const key = entityName + '--' + action;
    if (!cacheSchemas.value[key]) {
      throw new Error('Schema not initialized');
    }
    return cacheSchemas.value[key];
  };

  const getEntityFields = (entityName: string, action: string): EntityFormFieldInterface[] => {
    const df = getSchema(entityName, action).schema.fields;
    return df;
  };
  const getEntityDefaultFormData = (entityName: string, action: string): Record<string, any> => {
    const df = getSchema(entityName, action).formData;
    return df;
  };

  const loadEntity = (id: string | number, entityName: string): Promise<BaseEntityView> => {
    return new Promise<BaseEntityView>((resolve, reject) => {
      rootAxios
        .get(baseUrl + `/entity/load-edit/${entityName}/${id}`)
        .then((response) => {
          setEntity(response.data);
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const duplicateEntity = (id: string | number, entityName: string): Promise<BaseEntityView> => {
    return new Promise<BaseEntityView>((resolve, reject) => {
      rootAxios
        .post(baseUrl + `/entity/duplicate/${entityName}/${id}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const save = (entityName: string) => {
    let url = '';
    if (entityName !== 'UserAnonymousUser') {
      url = baseUrl + `/entity/save/${entityName}`;
    } else {
      url = '/api/user/register';
    }
    return rootAxios.post(url, entity.value);
  };

  const deleteEntity = (id: string | number, entityName: string) => {
    return rootAxios.delete(baseUrl + `/entity/delete/${entityName}/${id}`);
  };

  /**
   * Get fields of an entity
   */
  const getConfigEntityFields = (entity: string, action: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const key = entity + '--' + action;
      if (cacheSchemas.value[key]) {
        resolve();
        return;
      }
      let url = '';
      if (entity === 'UserAnonymousUser') {
        url = '/api/form-fields/UserAnonymousUser/create';
      } else {
        url = `/api/form/fields/${entity}/${action}`;
      }
      rootAxios
        .get(url)
        .then((response: any) => {
          // const fields = [];
          // const validEntityVar = entity.charAt(0).toLowerCase() + entity.slice(1);
          // for (const i in response.data.schema.fields) {
          //   const field = {
          //     ...response.data.schema.fields[i],
          //     entity: validEntityVar,
          //   };
          //   fields.push(field);
          // }
          // response.data.schema.fields = fields;
          setSchema(entity, action, response.data);
          resolve();
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  };

  /**
   *
   * @param query
   * @param field
   */
  const prepareSearch = async (query: string | number, field: EntityFormFieldInterface, search_fields: Array<string> = []) => {
    let url = `/api/crud/search/${field.reference?.entity}`;
    if (url && field.reference) {
      field.reference.loading = true;
      url += '?q=' + query;
      const searchFields = search_fields.length ? search_fields : field.reference?.search_fields;
      if (searchFields) {
        url += '&search_fields=' + searchFields.join(',');
      }
      const displayFields = field.reference?.display_fields;
      if (displayFields) {
        url += '&display_fields=' + displayFields.join(',');
      }
      const response = await search(url);
      field.options = buildOptions(response, field);
      field.reference.loading = false;
      return response;
    }
  };

  const search = (url: string): Promise<Array<any>> => {
    return new Promise((resolve, reject) => {
      rootAxios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  const buildOptions = (items: any[], field: EntityFormFieldInterface): any[] => {
    const displayFields = field.reference?.display_fields;
    const separator = field.reference?.separator ?? ' ';
    const options = items.map((item) => {
      let label = '';
      if (displayFields) {
        displayFields.forEach((fieldname, index) => {
          const sepration = index < displayFields.length - 1 ? separator : ' ';
          if (sepration === undefined) {
            throw new Error(`separator is undefined for field ${field.name}`);
          }
          const str = item[fieldname];
          if (str === undefined) {
            throw new Error(`field ${fieldname} is undefined for item ${item.id}`);
          }
          label += str + '' + sepration;
        });
      }
      return {
        label: label,
        value: item.id,
      };
    });
    return options;
  };

  /**
   * Permet d'initialiser le formulaire d'une entité, avec les champs nécessaires et les valeurs.
   *
   * @param entityNameResult - Nom de l'entité
   * @param id - ID de l'entité (null pour création)
   * @returns Promise avec les données du formulaire et les champs
   * @throws Error en cas d'échec
   */
  const initEntityForm = async (
    entityNameResult: string,
    id: number | null,
  ): Promise<{
    // formData: Record<string, any> | BaseEntityView;
    formKey: string;
    entityFormFields: EntityFormFieldInterface[];
  }> => {
    if (!entityNameResult) {
      throw new Error("Le nom de l'entité est requis");
    }

    const formData = reactive<Record<string, any> | BaseEntityView>({});
    const entityFormFields = ref<EntityFormFieldInterface[]>([]);

    // 1.  Charger les configurations de l'entité
    const action = id !== null ? 'edit' : 'create';
    try {
      await getConfigEntityFields(entityNameResult, action);
      entityFormFields.value = getEntityFields(entityNameResult, action) ?? [];
      const sd = getEntityDefaultFormData(entityNameResult, action);
      // on doit ajouter les valeurs par défaut pour entity_select.
      entityFormFields.value.forEach((field) => {
        if (field.type === 'entity_select') {
          if (!sd[field.name] && !formData[field.name]) {
            sd[field.name] = { id: null };
          }
        }
      });
      if (sd) Object.assign(formData, sd);
    } catch (error) {
      console.error(`Erreur lors du chargement des champs pour ${entityNameResult}:`, error);
      throw error;
    }
    // 2. Charger le contenu si l'id est défini (édition)
    if (id) {
      try {
        await loadEntity(id, entityNameResult);
        const values = getEntity();
        if (values) {
          Object.assign(formData, values);
        }
      } catch (error) {
        console.error(`Erreur lors du chargement de l'entité ${entityNameResult} (id: ${id}):`, error);
        throw error;
      }
    }

    // 3. Initialiser les champs spéciaux (mot de passe répété)
    entityFormFields.value.forEach((field) => {
      if (field.type === 'password_repeated') {
        if (!formData[field.name + '_first']) {
          formData[field.name + '_first'] = '';
        }
        if (!formData[field.name + '_second']) {
          formData[field.name + '_second'] = '';
        }
      }
    });
    const formKey = createFormKey(entityNameResult, id);
    setFormData(formKey, formData);
    return {
      // formData: formData,
      formKey: formKey,
      entityFormFields: entityFormFields.value,
    };
  };

  return {
    setEntity,
    loadEntity,
    save,
    getEntity,
    getConfigEntityFields,
    getEntityFields,
    prepareSearch,
    initEntityForm,
    buildOptions,
    deleteEntity,
    duplicateEntity,
  };
});
