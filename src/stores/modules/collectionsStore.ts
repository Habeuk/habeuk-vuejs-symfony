import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CollectionsState, collection } from '@/types';
import rootAxios from '@/configs/rootAxiosBody';
import appConfig from '@/configs/appConfig';
export const useCollectionsStore = defineStore('collections', () => {
  const collections = ref<CollectionsState>({});
  /**
   * Récupère les entités avec gestion de cache
   */
  const getEntities = (entityName: string, page = appConfig.default_page, number = appConfig.load_per_page): collection => {
    // Vérifier le cache
    const key = getKey(entityName, page, number);
    const cached = collections.value[key];
    if (cached && cached.page === page) {
      return cached;
    }
    return getEmptyCollection();
  };

  /**
   * Charge les entités depuis l'API
   */
  const loadEntities = async (
    entityName: string,
    page = appConfig.default_page,
    number = appConfig.load_per_page,
    queryParams: URLSearchParams | null = null,
  ): Promise<collection> => {
    try {
      const key = getKey(entityName, page, number);
      let params = new URLSearchParams();
      if (queryParams) {
        params = queryParams;
      } else {
        // Ajoute le tri par ordre decroissant par défaut.
        params.append('sorts', JSON.stringify([{ fieldname: 'id', operator: 'desc' }]));
      }

      const response = await rootAxios.get(`/api/entity-collection/${entityName}/${page}/${number}`, {
        params,
      });
      const result: collection = response.data;
      collections.value[key] = result;
      return result;
    } catch (error) {
      console.error(`Erreur API pour ${entityName}:`, error);
      throw error;
    }
  };

  const getKey = (entityName: string, page: number, number: number) => `${entityName}-${page}-${number}`;

  /**
   * Vide le cache pour une entité
   */
  const clearCache = (entityName?: string) => {
    if (entityName) {
      delete collections.value[entityName];
    } else {
      collections.value = {};
    }
  };

  /**
   * Retourne une collection vide
   */
  const getEmptyCollection = (): collection => ({
    items: [],
    total: 0,
    page: 0,
    limit: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    from: 0,
    to: 0,
  });

  return {
    getEntities,
    loadEntities,
    clearCache,
    getEmptyCollection,
  };
});
