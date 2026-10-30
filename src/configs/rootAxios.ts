import basicRequestToken, { setAuthToken, installAuthRefresh } from 'basic_axios/src/ts/basic';
// import appConfig from '@/configs/appConfig';

// ============================================================
// 1. Événement "session expirée" (aucune notion de router)
// @todo : on doit bien comprendre le fonctionnement plus tard.
// ============================================================

type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let sessionExpiredNotified = false;

/**
 * Permet à l'application (typiquement `main.ts`) de s'abonner à l'événement
 * « session expirée ». Un seul abonné est supporté à la fois : un nouvel
 * appel remplace le précédent. Retourne une fonction de désabonnement.
 *
 * @param handler - fonction appelée quand un refresh échoue définitivement.
 * @returns fonction à appeler pour annuler cet abonnement.
 */
export const onSessionExpired = (handler: SessionExpiredHandler) => {
  // Mémorise le handler : c'est LUI qui sera appelé plus tard par
  // notifySessionExpired(). Un seul slot : un 2ᵉ appel écrase le 1ᵉʳ.
  sessionExpiredHandler = handler;
  return () => {
    if (sessionExpiredHandler === handler) sessionExpiredHandler = null;
  };
};

/**
 * Notifie l'abonné que la session a expiré (refresh refusé par le serveur).
 * Idempotent : plusieurs appels consécutifs ne déclenchent le handler qu'une
 * seule fois — utile car plusieurs requêtes peuvent échouer en même temps.
 * Le flag `sessionExpiredNotified` est réarmé dans `accessTokenStore.setTokens`
 * dès qu'un nouveau token valide est posé (nouveau login).
 */
const notifySessionExpired = () => {
  if (sessionExpiredNotified) return;
  sessionExpiredNotified = true;
  sessionExpiredHandler?.();
};

let lastRefreshUser: unknown = null;

// ============================================================
// 2. Tokens
// ============================================================

/** Access token : mémoire uniquement. */
let accessToken: string | null = null;

/**
 * Gère l'access token JWT en mémoire uniquement.
 *
 * `setAuthToken()` injecte le token dans l'instance axios
 * (via `basic_axios`) qui ajoutera le header
 * `Authorization: Bearer <token>` aux requêtes suivantes.
 */
export const accessTokenStore = {
  getAccessToken: () => accessToken,

  /**
   * Définit (ou efface si `null`) l'access token courant.
   * Réinitialise le flag « session expirée » dès qu'un token
   * valide est posé, pour permettre une nouvelle notification
   * lors d'une future expiration.
   */
  setTokens(access: string | null) {
    accessToken = access;
    setAuthToken(access);
    if (access) sessionExpiredNotified = false;
  },

  /**
   * Efface l'access token. Ne touche pas au cookie refresh_token :
   * c'est au backend (`POST /api/logout`) de le révoquer et de demander au navigateur de l'effacer.
   * Appelé en cas d'échec définitif de refresh (401/403).
   */
  clear() {
    accessToken = null;
    // @todo Appeler le backend pour invalider le refresh token côté serveur (POST /api/logout)
    setAuthToken(null);
  },
};

// ============================================================
// 3. Instance de requêtes
// ============================================================
// select language.
const languageId = null;

const requestAxios = {
  ...basicRequestToken,
  languageId: languageId,
  debug: import.meta.env.DEV,
  TestDomain: 'http://pay-habeuk.localhost',
  baseUrl: 'https://pay.habeuk.com',
};

// ============================================================
// 4. Refresh
// ============================================================

/** Échec définitif (refresh refusé) ≠ panne réseau / 5xx : dans ce 2ᵉ cas, on garde la session. */
const isDefinitiveFailure = (e: unknown): boolean => {
  const status = (e as { error?: { status?: number } })?.error?.status;
  return status === 400 || status === 401 || status === 403;
};

const doRefresh = async (): Promise<string> => {
  const { data } = await requestAxios.postBare('/api/token/refresh');

  const newAccess: string | undefined = data?.token;
  if (!newAccess) throw new Error('No access token received from refresh');

  accessTokenStore.setTokens(newAccess);
  lastRefreshUser = data?.user ?? null; // ← mémorise
  return newAccess;
};

const refreshAccessToken = async (): Promise<string> => {
  if ('locks' in navigator) {
    return await navigator.locks.request('auth-refresh', () => doRefresh());
  }
  return doRefresh();
};

installAuthRefresh({
  refresh: refreshAccessToken,
  skip: /\/api\/(login_check|token\/refresh)/,
  onAuthFailure: (e) => {
    if (!isDefinitiveFailure(e)) return; // réseau coupé : on ne déconnecte pas
    accessTokenStore.clear();
    notifySessionExpired();
  },
});

/**
 * À appeler au démarrage, avant le premier rendu : évite le 401 initial.
 * Ne notifie pas "session expirée" : l'utilisateur n'a encore rien fait.
 */
export const initSession = async (): Promise<{ ok: boolean; user?: unknown }> => {
  try {
    await refreshAccessToken();
    return { ok: true, user: lastRefreshUser ?? undefined };
  } catch (e) {
    if (isDefinitiveFailure(e)) accessTokenStore.clear();
    return { ok: false };
  }
};

export default requestAxios;
