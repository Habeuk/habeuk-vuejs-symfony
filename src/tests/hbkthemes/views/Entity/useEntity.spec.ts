import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { useEntity } from '@/hbkthemes/views/Entity/useEntity';
import { useFormDataStore } from '@/stores/modules/formDataStore';
import { makeField } from '@/tests/fixtures/formFields';

/**
 * useEntity est le câblage entre l'API, le store d'entité et le formulaire.
 * Le transport HTTP et les toasts sont simulés ; les stores et le routeur sont réels.
 */
const { rootAxiosMock, toastAdd } = vi.hoisted(() => ({
  rootAxiosMock: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
  toastAdd: vi.fn(),
}));

vi.mock('@/configs/rootAxios', () => ({ default: rootAxiosMock }));
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAdd }) }));

const Empty = defineComponent({ render: () => null });

type SetupOptions = {
  path?: string;
  meta?: Record<string, unknown>;
  entityName?: string | null;
  entityId?: number | null;
};

/**
 * Monte un composant hôte : useEntity utilise useRoute()/useRouter() et doit donc
 * s'exécuter dans un vrai contexte de composant, avec un routeur.
 */
const setupUseEntity = async (options: SetupOptions = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Empty },
      { path: '/entity/:entity_id', name: 'entity', component: Empty, meta: options.meta ?? {} },
    ],
  });
  await router.push(options.path ?? '/');
  await router.isReady();

  let result!: ReturnType<typeof useEntity>;
  mount(
    defineComponent({
      setup() {
        result = useEntity(options.entityName ?? null, options.entityId ?? null);
        return () => null;
      },
    }),
    { global: { plugins: [router] } },
  );

  return { result, router };
};

const entityResponse = (fields: ReturnType<typeof makeField>[], formData: Record<string, unknown> = {}) => ({
  data: { schema: { fields }, formData },
});

beforeEach(() => {
  vi.clearAllMocks();
  toastAdd.mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useEntity — identité de l’entité', () => {
  it('utilise le nom d’entité fourni en priorité', async () => {
    const { result } = await setupUseEntity({ entityName: 'Customer', path: '/entity/42', meta: { entity: 'Invoice' } });

    expect(result.entityName.value).toBe('Customer');
  });

  it('retombe sur l’entité déclarée dans les métadonnées de la route', async () => {
    const { result } = await setupUseEntity({ entityName: null, path: '/entity/42', meta: { entity: 'Invoice' } });

    expect(result.entityName.value).toBe('Invoice');
  });

  it('lit l’identifiant dans les paramètres de route', async () => {
    const { result } = await setupUseEntity({ entityName: 'Customer', path: '/entity/42' });

    expect(result.entityId.value).toBe(42);
    expect(result.isNewEntity.value).toBe(false);
  });

  it('considère l’entité comme nouvelle quand l’identifiant personnalisé vaut 0', async () => {
    const { result } = await setupUseEntity({ entityName: 'Customer', entityId: 0, path: '/entity/42' });

    expect(result.entityId.value).toBeNull();
    expect(result.isNewEntity.value).toBe(true);
  });
});

describe('useEntity — chargement du formulaire', () => {
  it('charge les champs, initialise le formulaire et retourne la clé de création', async () => {
    const fields = [makeField({ name: 'title', type: 'text', label: 'Titre', required: true })];
    rootAxiosMock.get.mockResolvedValue(entityResponse(fields, { title: 'Bonjour' }));
    const { result } = await setupUseEntity({ entityName: 'Customer' });

    const loaded = await result.loadFieldsAndEntity();

    expect(rootAxiosMock.get).toHaveBeenCalledWith('/api/form/fields/Customer/create');
    expect(loaded.formKey).toBe('Customer-create');
    expect(loaded.entityFormFields).toHaveLength(1);
    expect(loaded.formData).toEqual({ title: 'Bonjour' });
    expect(result.entityFormFields.value).toHaveLength(1);
  });

  it('charge l’entité en édition et fusionne ses valeurs dans le formulaire', async () => {
    rootAxiosMock.get
      .mockResolvedValueOnce(entityResponse([makeField({ name: 'title', type: 'text', label: 'Titre' })], { title: '' }))
      .mockResolvedValueOnce({ data: { id: 42, title: 'Facture 42' } });
    const { result } = await setupUseEntity({ entityName: 'Customer', path: '/entity/42' });

    const loaded = await result.loadFieldsAndEntity();

    expect(rootAxiosMock.get).toHaveBeenNthCalledWith(1, '/api/form/fields/Customer/edit');
    expect(rootAxiosMock.get).toHaveBeenNthCalledWith(2, '/api/crud/entity/load-edit/Customer/42');
    expect(loaded.formKey).toBe('Customer-edit-42');
    expect(loaded.formData).toMatchObject({ title: 'Facture 42' });
  });

  it('refuse de charger sans nom d’entité', async () => {
    const { result } = await setupUseEntity({ entityName: null, path: '/' });

    await expect(result.loadFieldsAndEntity()).rejects.toThrow("Nom d'entité manquant");
    expect(rootAxiosMock.get).not.toHaveBeenCalled();
  });

  it('expose request_error et notifie quand le chargement échoue', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const failure = { error: { statusText: 'Erreur serveur', data: { error: 'Boom' } } };
    rootAxiosMock.get.mockRejectedValue(failure);
    const { result } = await setupUseEntity({ entityName: 'Customer' });

    await expect(result.loadFieldsAndEntity()).rejects.toBe(failure);

    // request_error est un ref : la valeur relue est un proxy réactif de l'objet d'erreur.
    expect(result.request_error.value).toEqual(failure);
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Boom' }));
  });
});

describe('useEntity — soumission', () => {
  it('sauvegarde l’entité et retourne les données de la réponse', async () => {
    rootAxiosMock.post.mockResolvedValue({ data: { id: 7, title: 'Nouveau' } });
    const { result } = await setupUseEntity({ entityName: 'Customer' });

    const saved = await result.entitySubmit({ title: 'Nouveau' });

    expect(rootAxiosMock.post).toHaveBeenCalledWith('/api/crud/entity/save/Customer', { title: 'Nouveau' });
    expect(saved).toEqual({ id: 7, title: 'Nouveau' });
    expect(result.loading.value).toBe(false);
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('refuse une soumission sans données', async () => {
    const { result } = await setupUseEntity({ entityName: 'Customer' });

    await expect(result.entitySubmit(null)).rejects.toThrow("Données du formulaire ou nom d'entité manquant");
    expect(result.request_error.value).toBeInstanceOf(Error);
    expect(rootAxiosMock.post).not.toHaveBeenCalled();
  });

  it('propage l’erreur de sauvegarde et libère loading', async () => {
    const failure = { error: { statusText: 'Erreur', data: { error: 'Nom déjà utilisé' } } };
    rootAxiosMock.post.mockRejectedValue(failure);
    const { result } = await setupUseEntity({ entityName: 'Customer' });

    await expect(result.entitySubmit({ title: 'x' })).rejects.toBe(failure);

    // request_error est un ref : la valeur relue est un proxy réactif de l'objet d'erreur.
    expect(result.request_error.value).toEqual(failure);
    expect(result.loading.value).toBe(false);
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Nom déjà utilisé' }));
  });
});

describe('useEntity — suppression', () => {
  it('supprime l’entité et notifie le succès', async () => {
    rootAxiosMock.delete.mockResolvedValue({ data: null });
    const { result } = await setupUseEntity({ entityName: 'Customer' });

    await result.deleteEntity('Customer', 12);

    expect(rootAxiosMock.delete).toHaveBeenCalledWith('/api/crud/entity/delete/Customer/12');
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('ne supprime rien sans identifiant', async () => {
    const { result } = await setupUseEntity({ entityName: 'Customer' });

    await result.deleteEntity('Customer');

    expect(rootAxiosMock.delete).not.toHaveBeenCalled();
  });
});

describe('useEntity — chargement et duplication', () => {
  it('refuse de charger une entité sans identifiant', async () => {
    const { result } = await setupUseEntity({ entityName: 'Customer' });

    await expect(result.loadEntity()).rejects.toThrow("L'identifiant de l'entité manquant");
  });

  it('refuse de dupliquer une entité sans identifiant', async () => {
    const { result } = await setupUseEntity({ entityName: 'Customer' });

    await expect(result.duplicateEntity()).rejects.toThrow("L'identifiant de l'entité manquant");
  });
});

describe('useEntity — navigation et raccourcis', () => {
  it('redirige vers la route nommée de l’entité', async () => {
    const { result, router } = await setupUseEntity({ entityName: 'Customer' });
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined);

    result.redirectToEntity(7);

    expect(pushSpy).toHaveBeenCalledWith({ name: 'entity_Customer', params: { entity_id: 7 } });
  });

  it('délègue les raccourcis de données au formDataStore', async () => {
    const store = useFormDataStore();
    store.setFormData('Customer-create', { title: '' });
    const { result } = await setupUseEntity({ entityName: 'Customer' });

    result.setValueInFormData('Customer-create', 'title', 'Bonjour');

    expect(store.getValueInFormData('Customer-create', 'title')).toBe('Bonjour');

    result.mergeFormData('Customer-create', { city: 'Lyon' });

    expect(result.getFormData('Customer-create')).toEqual({ title: 'Bonjour', city: 'Lyon' });
  });
});
