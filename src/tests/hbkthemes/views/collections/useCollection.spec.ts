import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCollection } from '@/hbkthemes/views/collections/useCollection';
import type { collection } from '@/types';

/**
 * useCollection orchestre le chargement d'une liste : il délègue aux stores
 * (collections + définition d'entité), gère loading, les erreurs et le reset.
 * Les deux stores et les toasts sont simulés.
 */
const { toastAdd, collectionsStoreMock, definitionStoreMock } = vi.hoisted(() => ({
  toastAdd: vi.fn(),
  collectionsStoreMock: { getEmptyCollection: vi.fn(), loadEntities: vi.fn() },
  definitionStoreMock: {
    getEmptyEntityDefinition: vi.fn(),
    getEntityDefinition: vi.fn(),
    saveConfig: vi.fn(),
    getConfig: vi.fn(),
  },
}));

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAdd }) }));
vi.mock('@/stores/modules/collectionsStore', () => ({ useCollectionsStore: () => collectionsStoreMock }));
vi.mock('@/stores/modules/entityDefinitionStore', () => ({ useEntityDefinitionStore: () => definitionStoreMock }));

const emptyCollection = (): collection => ({
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

const loadedCollection = (): collection => ({ ...emptyCollection(), total: 2, page: 1, limit: 30, totalPages: 1, from: 1, to: 2 });

const emptyDefinition = () => ({
  columns: {},
  entity_config: { enabled: false, label: '', entity: '', icon: '', order: 0, actions: [] as string[] },
  enums: {},
});

beforeEach(() => {
  vi.clearAllMocks();
  collectionsStoreMock.getEmptyCollection.mockReturnValue(emptyCollection());
  definitionStoreMock.getEmptyEntityDefinition.mockReturnValue(emptyDefinition());
  toastAdd.mockImplementation(() => {});
});

describe('useCollection — état initial', () => {
  it('expose une collection vide et la définition vide du store', () => {
    const { collection: rows, entityDefinition, loading } = useCollection('Customer');

    expect(rows.value).toEqual(emptyCollection());
    expect(entityDefinition.value).toEqual(emptyDefinition());
    expect(loading.value).toBe(false);
  });
});

describe('useCollection — chargement des entités', () => {
  it('délègue au store avec la page et la limite par défaut', async () => {
    collectionsStoreMock.loadEntities.mockResolvedValue(loadedCollection());
    const { loadEntities, collection: rows, loading } = useCollection('Customer');

    const result = await loadEntities();

    expect(collectionsStoreMock.loadEntities).toHaveBeenCalledWith('Customer', 1, 30, null);
    expect(result).toEqual(loadedCollection());
    expect(rows.value).toEqual(loadedCollection());
    expect(loading.value).toBe(false);
  });

  it('accepte une entité, une page, une limite et des paramètres surchargés', async () => {
    collectionsStoreMock.loadEntities.mockResolvedValue(loadedCollection());
    const { loadEntities } = useCollection('Customer');
    const params = new URLSearchParams('search=marie');

    await loadEntities('Invoice', 3, 10, params);

    expect(collectionsStoreMock.loadEntities).toHaveBeenCalledWith('Invoice', 3, 10, params);
  });

  it('passe loading à true pendant le chargement', async () => {
    let resolveLoad!: (value: collection) => void;
    collectionsStoreMock.loadEntities.mockReturnValue(
      new Promise<collection>((resolve) => {
        resolveLoad = resolve;
      }),
    );
    const { loadEntities, loading } = useCollection('Customer');

    const pending = loadEntities();
    expect(loading.value).toBe(true);

    resolveLoad(loadedCollection());
    await pending;

    expect(loading.value).toBe(false);
  });

  it('refuse de charger sans nom d’entité', async () => {
    const { loadEntities } = useCollection('');

    await expect(loadEntities()).rejects.toThrow("Nom d'entité manquant");
    expect(collectionsStoreMock.loadEntities).not.toHaveBeenCalled();
  });

  it('notifie et propage l’erreur de chargement', async () => {
    const failure = new Error('API indisponible');
    collectionsStoreMock.loadEntities.mockRejectedValue(failure);
    const { loadEntities, loading } = useCollection('Customer');

    await expect(loadEntities()).rejects.toBe(failure);

    expect(loading.value).toBe(false);
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });
});

describe('useCollection — définition de l’entité', () => {
  it('charge et expose la définition de l’entité', async () => {
    const definition = emptyDefinition();
    definition.entity_config.entity = 'Customer';
    definition.entity_config.label = 'Clients';
    definitionStoreMock.getEntityDefinition.mockResolvedValue(definition);
    const { getEntityDefinition, entityDefinition } = useCollection('Customer');

    const result = await getEntityDefinition();

    expect(definitionStoreMock.getEntityDefinition).toHaveBeenCalledWith('Customer');
    expect(result).toEqual(definition);
    expect(entityDefinition.value).toEqual(definition);
  });

  it('accepte une autre entité que celle passée au composable', async () => {
    definitionStoreMock.getEntityDefinition.mockResolvedValue(emptyDefinition());
    const { getEntityDefinition } = useCollection('Customer');

    await getEntityDefinition('Invoice');

    expect(definitionStoreMock.getEntityDefinition).toHaveBeenCalledWith('Invoice');
  });

  it('revient à une définition vide et propage l’erreur', async () => {
    const failure = new Error('Définition introuvable');
    definitionStoreMock.getEntityDefinition.mockRejectedValue(failure);
    const { getEntityDefinition, entityDefinition, loading } = useCollection('Customer');

    await expect(getEntityDefinition()).rejects.toBe(failure);

    expect(entityDefinition.value).toEqual(emptyDefinition());
    expect(loading.value).toBe(false);
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });
});

describe('useCollection — réinitialisation', () => {
  it('reset() remet la collection et la définition à vide', async () => {
    collectionsStoreMock.loadEntities.mockResolvedValue(loadedCollection());
    definitionStoreMock.getEntityDefinition.mockResolvedValue(emptyDefinition());
    const { loadEntities, getEntityDefinition, reset, collection: rows, entityDefinition } = useCollection('Customer');
    await loadEntities();
    await getEntityDefinition();

    reset();

    expect(rows.value).toEqual(emptyCollection());
    expect(entityDefinition.value).toEqual(emptyDefinition());
  });
});

describe('useCollection — configurations', () => {
  it('délègue saveConfig et getConfig au store de définition', async () => {
    const config = { configKey: 'Customer', configValue: '[]', valueType: 'json' as const };
    definitionStoreMock.saveConfig.mockResolvedValue(config);
    definitionStoreMock.getConfig.mockResolvedValue(config);
    const { saveConfig, getConfig } = useCollection('Customer');

    await expect(saveConfig(config)).resolves.toEqual(config);
    await expect(getConfig('Customer')).resolves.toEqual(config);

    expect(definitionStoreMock.saveConfig).toHaveBeenCalledWith(config);
    expect(definitionStoreMock.getConfig).toHaveBeenCalledWith('Customer');
  });
});
