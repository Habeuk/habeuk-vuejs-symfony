import { beforeEach, describe, expect, it, vi } from 'vitest';
const user = {
  id: 1,
  email: 'marie@exemple.fr',
  title: 'Mme',
  firstName: 'Marie',
  lastName: 'Dupont',
  roles: ['ROLE_USER'],
};
/**
 * Le transport HTTP et l'accessTokenStore sont simulés.
 * Le store est testé sur ses règles :
 * - validation du formulaire
 * - connexion (pose du token + hydratation de currentUser)
 * - déconnexion (appel /api/logout + nettoyage de l'état)
 * - reset (utilisé par onSessionExpired)
 *
 * NOTE : la restauration de session (au démarrage) n'est PLUS testée ici,
 * car elle est assurée par `initSession()` dans rootAxios.ts et par le
 * `beforeEach` du router. Ces deux modules ont leurs propres tests.
 */
const { rootAxiosMock, accessTokenStoreMock, basicMock } = vi.hoisted(() => {
  let token: string | null = null;
  return {
    rootAxiosMock: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      axiosInstance: { interceptors: { response: { use: vi.fn() } } },
    },
    accessTokenStoreMock: {
      getAccessToken: vi.fn(() => token),
      setTokens: vi.fn((t: string | null) => {
        token = t;
      }),
      clear: vi.fn(() => {
        token = null;
      }),
    },
    basicMock: { setAuthToken: vi.fn() },
  };
});

vi.mock('@/configs/rootAxios', () => ({
  __esModule: true,
  default: rootAxiosMock,
  accessTokenStore: accessTokenStoreMock,
}));

vi.mock('basic_axios/src/ts/basic', () => ({
  __esModule: true,
  default: vi.fn(),
  setAuthToken: basicMock.setAuthToken,
  installAuthRefresh: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ────────────────────────────────────────────────────────────
// Validation du formulaire
// ────────────────────────────────────────────────────────────
describe('useAuthStore — validation du formulaire', () => {
  it('signale les deux champs manquants', async () => {
    const { useAuthStore } = await import('@/stores/modules/authStore');
    const store = useAuthStore();

    expect(store.validateForm()).toBe(false);
    expect(store.errors.email).toBe("L'adresse email est requise");
    expect(store.errors.password).toBe('Le mot de passe est requis');
  });

  it('signale une adresse e-mail invalide', async () => {
    const { useAuthStore } = await import('@/stores/modules/authStore');
    const store = useAuthStore();
    store.formData.email = 'pas-un-email';
    store.formData.password = 'secret';

    expect(store.validateForm()).toBe(false);
    expect(store.errors.email).toBe('Adresse email invalide');
    expect(store.errors.password).toBe('');
  });

  it('accepte un formulaire valide et remet les erreurs à zéro', async () => {
    const { useAuthStore } = await import('@/stores/modules/authStore');
    const store = useAuthStore();
    store.formData.email = 'marie@exemple.fr';
    store.formData.password = 'secret';

    expect(store.validateForm()).toBe(true);
    expect(store.errors).toEqual({ email: '', password: '' });
  });

  it('clearForm vide les identifiants et les erreurs', async () => {
    const { useAuthStore } = await import('@/stores/modules/authStore');
    const store = useAuthStore();
    store.formData.email = 'marie@exemple.fr';
    store.formData.password = 'secret';
    store.validateForm();

    store.clearForm();

    expect(store.formData.email).toBe('');
    expect(store.formData.password).toBe('');
    expect(store.errors).toEqual({ email: '', password: '' });
  });
});

// ────────────────────────────────────────────────────────────
// Connexion
// ────────────────────────────────────────────────────────────
describe('useAuthStore — connexion', () => {
  it('pose le token dans accessTokenStore et hydrate currentUser en cas de succès', async () => {
    const { useAuthStore } = await import('@/stores/modules/authStore');
    const store = useAuthStore();
    store.formData.email = 'marie@exemple.fr';
    store.formData.password = 'secret';
    const user = { id: 1, email: 'marie@exemple.fr', nom: null, prenom: null, roles: ['ROLE_USER'] };
    rootAxiosMock.post.mockResolvedValue({ data: { token: 'jwt-123', user } });

    await store.handleLogin();

    expect(rootAxiosMock.post).toHaveBeenCalledWith('/api/login_check', store.formData);
    expect(accessTokenStoreMock.setTokens).toHaveBeenCalledWith('jwt-123');
    expect(store.isAuthenticated).toBe(true);
    expect(store.currentUser).toEqual(user);
  });

  it('appelle reset() et propage l’erreur en cas d’échec', async () => {
    const { useAuthStore } = await import('@/stores/modules/authStore');
    const store = useAuthStore();
    store.formData.email = 'marie@exemple.fr';
    store.formData.password = 'secret';
    const failure = { error: { status: 401 } };
    rootAxiosMock.post.mockRejectedValue(failure);

    await expect(store.handleLogin()).rejects.toBe(failure);

    expect(accessTokenStoreMock.clear).toHaveBeenCalled();
    expect(store.isAuthenticated).toBe(false);
    expect(store.currentUser).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────
// Déconnexion
// ────────────────────────────────────────────────────────────
describe('useAuthStore — déconnexion', () => {
  it('appelle POST /api/logout, puis vide l’état local', async () => {
    const { useAuthStore } = await import('@/stores/modules/authStore');
    const store = useAuthStore();
    accessTokenStoreMock.setTokens('jwt-123');
    rootAxiosMock.post.mockResolvedValue({});

    await store.logout();

    expect(rootAxiosMock.post).toHaveBeenCalledWith('/api/logout');
    expect(accessTokenStoreMock.clear).toHaveBeenCalled();
    expect(store.isAuthenticated).toBe(false);
    expect(store.currentUser).toBeNull();
  });

  it('vide quand même l’état local si /api/logout échoue', async () => {
    const { useAuthStore } = await import('@/stores/modules/authStore');
    const store = useAuthStore();
    accessTokenStoreMock.setTokens('jwt-123');
    rootAxiosMock.post.mockRejectedValue({ error: { status: 500 } });

    await store.logout();

    // Le backend a échoué, mais l'utilisateur ne doit PAS rester connecté côté client.
    expect(accessTokenStoreMock.clear).toHaveBeenCalled();
    expect(store.isAuthenticated).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// Reset (utilisé par onSessionExpired dans main.ts)
// ────────────────────────────────────────────────────────────
describe('useAuthStore — reset', () => {
  it('vide accessTokenStore et currentUser', async () => {
    const { useAuthStore } = await import('@/stores/modules/authStore');
    const store = useAuthStore();
    accessTokenStoreMock.setTokens('jwt-123');
    store.setUser(user);

    store.reset();

    expect(accessTokenStoreMock.clear).toHaveBeenCalled();
    expect(store.currentUser).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });
});
