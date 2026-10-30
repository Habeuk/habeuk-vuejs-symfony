// composables/useEntity.ts
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import type { collection } from "@/types";
import { useCollectionsStore } from "@/stores/modules/collectionsStore";
import { useEntityDefinitionStore } from "@/stores/modules/entityDefinitionStore";
import type {
  EntityDefinitionInterface,
  BaseEntityConfigInterface,
} from "@/types";

export const useCollection = (entityName: string) => {
  const collectionsStore = useCollectionsStore();
  const toast = useToast();
  const collection = ref<collection>(collectionsStore.getEmptyCollection());
  const entityDefinitionStore = useEntityDefinitionStore();
  const loading = ref(false);
  const entityDefinition = ref<EntityDefinitionInterface>(
    entityDefinitionStore.getEmptyEntityDefinition(),
  );

  const saveConfig = (
    config: BaseEntityConfigInterface,
  ): Promise<BaseEntityConfigInterface> => {
    return entityDefinitionStore.saveConfig(config);
  };

  const getConfig = (
    configKey: string,
  ): Promise<BaseEntityConfigInterface | null> => {
    return entityDefinitionStore.getConfig(configKey);
  };

  const getEntityDefinition = async (
    CustomEntityName: string | null = null,
  ): Promise<EntityDefinitionInterface> => {
    const finalEntityName = CustomEntityName ?? entityName;
    loading.value = true;
    try {
      const response =
        await entityDefinitionStore.getEntityDefinition(finalEntityName);
      entityDefinition.value = response;
      return response;
    } catch (error) {
      toast.add({
        severity: "error",
        detail: "Impossible de charger la définition de l'entité",
        summary: "Erreur",
        life: 5000,
      });
      entityDefinition.value = entityDefinitionStore.getEmptyEntityDefinition();
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const loadEntities = async (
    overrideEntityName: string | null = null,
    page: number = 1,
    limit: number = 30,
    QueryParams: URLSearchParams | null = null,
  ): Promise<collection> => {
    const finalEntityName = overrideEntityName ?? entityName;
    if (!finalEntityName) {
      throw new Error("Nom d'entité manquant");
    }
    loading.value = true;
    try {
      // on affiche les données en caches, s'il existe. En attendant le chargement des données depuis l'API.
      // collection.value = collectionsStore.getEntities(entityName, page, limit);
      // Cest pas tres utile pour l'instant.
      collection.value = collectionsStore.getEmptyCollection();
      const result = await collectionsStore.loadEntities(
        finalEntityName,
        page,
        limit,
        QueryParams,
      );
      collection.value = result;
      loading.value = false;
      return result;
    } catch (error) {
      loading.value = false;
      toast.add({
        severity: "error",
        summary: "Erreur",
        detail: "Une erreur est survenue lors du chargement des données",
        life: 5000,
      });
      throw error;
    }
  };
  const reset = () => {
    collection.value = collectionsStore.getEmptyCollection();
    entityDefinition.value = entityDefinitionStore.getEmptyEntityDefinition();
  };
  return {
    collection,
    loadEntities,
    loading,
    getEntityDefinition,
    entityDefinition,
    saveConfig,
    getConfig,
    reset,
  };
};
