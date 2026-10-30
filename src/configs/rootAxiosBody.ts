// src/configs/rootAxiosBody.ts
import basicRequestToken, { setAuthToken, installAuthRefresh } from 'basic_axios/src/ts/basic';

// ============================================================
// 1. Événement "session expirée"
// ============================================================

type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let sessionExpiredNotified = false;

export const onSessionExpired = (handler: SessionExpiredHandler) => {
  sessionExpiredHandler = handler;
  return () => {
    if (sessionExpiredHandler === handler) sessionExpiredHandler = null;
  };
};

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
 * Refresh token : persisté dans localStorage (choix temporaire, moins sûr
 * qu'un cookie HttpOnly — à revoir en production).
 */
const REFRESH_TOKEN_KEY = 'refresh_token';

const refreshTokenStore = {
  get: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string | null) => {
    try {
      if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
      else localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      /* localStorage indisponible (mode privé strict, etc.) : on ignore */
    }
  },
  clear: () => refreshTokenStore.set(null),
};

export const accessTokenStore = {
  getAccessToken: () => accessToken,

  /**
   * Définit (ou efface si `null`) l'access token courant.
   * Si un `refreshToken` est fourni, il est persisté ; sinon on garde
   * celui déjà présent (cas d'un simple refresh).
   */
  setTokens(access: string | null) {
    accessToken = access;
    setAuthToken(access);
    if (access) sessionExpiredNotified = false;
  },

  setRefreshTokens(refreshToken: string | null) {
    if (refreshToken !== undefined) refreshTokenStore.set(refreshToken);
    refreshTokenStore.set(refreshToken);
  },

  /**
   * Efface tout : access en mémoire + refresh en localStorage.
   * Appelé en cas d'échec définitif de refresh (400/401/403).
   */
  clear() {
    accessToken = null;
    setAuthToken(null);
    refreshTokenStore.clear();
    // @todo Appeler POST /api/logout pour révoquer côté serveur si besoin
  },
};

// ============================================================
// 3. Instance de requêtes
// ============================================================

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

const isDefinitiveFailure = (e: unknown): boolean => {
  const status = (e as { error?: { status?: number } })?.error?.status;
  return status === 400 || status === 401 || status === 403;
};

const doRefresh = async (): Promise<string> => {
  const refresh_token = refreshTokenStore.get();
  if (!refresh_token) {
    // Pas de refresh_token : échec définitif sans appel réseau.
    throw { error: { status: 401 } };
  }

  const { data } = await requestAxios.postBare('/api/token/refresh', { refresh_token });

  const newAccess: string | undefined = data?.token;
  if (!newAccess) throw new Error('No access token received from refresh');

  // Rotation éventuelle du refresh_token côté serveur.
  const newRefresh: string | undefined = data?.refresh_token;
  accessTokenStore.setTokens(newAccess);
  accessTokenStore.setRefreshTokens(newRefresh ?? null);

  lastRefreshUser = data?.user ?? null;
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
    if (!isDefinitiveFailure(e)) return; // panne réseau : on ne déconnecte pas
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
