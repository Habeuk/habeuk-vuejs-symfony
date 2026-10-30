import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCollectionsStore } from '@/stores/modules/collectionsStore';
import appConfig from '@/configs/appConfig';

/**
 * Couche de chargement des listes : construction de l'URL, tri par défaut,
 * cache par page et propagation des erreurs.
 */
const { rootAxiosMock } = vi.hoisted(() => ({
  rootAxiosMock: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock('@/configs/rootAxios', () => ({ default: rootAxiosMock }));

/** Réponse API de référence (page 1, 30 éléments). */
const loadedCollection = {
  items: [],
  total: 2,
  page: 1,
  limit: 30,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  from: 1,
  to: 2,
};

/** Récupère les paramètres de la dernière requête GET. */
const lastRequestParams = () => (rootAxiosMock.get.mock.calls[0]?.[1] as { params: URLSearchParams } | undefined)?.params;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCollectionsStore — collection vide', () => {
  it('retourne la structure attendue par les tableaux', () => {
    const store = useCollectionsStore();

    expect(store.getEmptyCollection()).toEqual({
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
  });
});

describe('useCollectionsStore — chargement', () => {
  it('appelle l’API avec la page et la limite par défaut', async () => {
    rootAxiosMock.get.mockResolvedValue({ data: loadedCollection });
    const store = useCollectionsStore();

    await store.loadEntities('Customer');

    expect(rootAxiosMock.get).toHaveBeenCalledOnce();
    expect(rootAxiosMock.get.mock.calls[0]?.[0]).toBe(
      `/api/entity-collection/Customer/${appConfig.default_page}/${appConfig.load_per_page}`,
    );
  });

  it('ajoute un tri par défaut sur id quand aucun paramètre n’est fourni', async () => {
    rootAxiosMock.get.mockResolvedValue({ data: loadedCollection });
    const store = useCollectionsStore();

    await store.loadEntities('Customer');

    // Écart connu : la clé sérialisée est `operator` ici, alors que QueryBuilder produit `order`.
    expect(JSON.parse(String(lastRequestParams()?.get('sorts')))).toEqual([{ fieldname: 'id', operator: 'desc' }]);
  });

  it('transmet tels quels les paramètres fournis par l’appelant', async () => {
    rootAxiosMock.get.mockResolvedValue({ data: loadedCollection });
    const store = useCollectionsStore();
    const params = new URLSearchParams('search=marie');

    await store.loadEntities('Customer', 2, 15, params);

    expect(rootAxiosMock.get.mock.calls[0]?.[0]).toBe('/api/entity-collection/Customer/2/15');
    expect(lastRequestParams()).toBe(params);
    expect(lastRequestParams()?.get('sorts')).toBeNull();
    expect(lastRequestParams()?.get('search')).toBe('marie');
  });

  it('retourne la collection renvoyée par l’API', async () => {
    rootAxiosMock.get.mockResolvedValue({ data: loadedCollection });
    const store = useCollectionsStore();

    await expect(store.loadEntities('Customer')).resolves.toEqual(loadedCollection);
  });

  it('propage l’erreur de l’API', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const failure = new Error('API indisponible');
    rootAxiosMock.get.mockRejectedValue(failure);
    const store = useCollectionsStore();

    await expect(store.loadEntities('Customer')).rejects.toBe(failure);
  });
});

describe('useCollectionsStore — cache', () => {
  it('met la collection en cache et la relit avec getEntities', async () => {
    rootAxiosMock.get.mockResolvedValue({ data: loadedCollection });
    const store = useCollectionsStore();

    await store.loadEntities('Customer');

    expect(store.getEntities('Customer')).toEqual(loadedCollection);
  });

  it('ne retourne rien pour une page non chargée', async () => {
    rootAxiosMock.get.mockResolvedValue({ data: loadedCollection });
    const store = useCollectionsStore();

    await store.loadEntities('Customer');

    expect(store.getEntities('Customer', 2)).toEqual(store.getEmptyCollection());
  });

  it('clearCache() sans argument vide tout le cache', async () => {
    rootAxiosMock.get.mockResolvedValue({ data: loadedCollection });
    const store = useCollectionsStore();
    await store.loadEntities('Customer');

    store.clearCache();

    expect(store.getEntities('Customer')).toEqual(store.getEmptyCollection());
  });

  it('clearCache(nom) ne vide pas les pages déjà chargées (écart connu)', async () => {
    rootAxiosMock.get.mockResolvedValue({ data: loadedCollection });
    const store = useCollectionsStore();
    await store.loadEntities('Customer');

    store.clearCache('Customer');

    // Écart connu : les entrées sont indexées `entity-page-limit` ; delete('Customer') ne cible rien.
    // Ce test passera à l'échec le jour où clearCache(nom) devient réellement ciblé.
    expect(store.getEntities('Customer')).toEqual(loadedCollection);
  });
});
