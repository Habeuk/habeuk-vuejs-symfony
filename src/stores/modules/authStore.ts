import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// import rootAxios, { accessTokenStore } from '@/configs/rootAxios';
import rootAxios, { accessTokenStore } from '@/configs/rootAxiosBody';
import type { userEntity } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  // ─── État ────────────────────────────────────────────────
  const formData = ref({
    email: '',
    password: '',
    rememberMe: false,
  });
  const errors = ref<{ email: string; password: string }>({
    email: '',
    password: '',
  });
  const currentUser = ref<userEntity | null>(null);

  // ─── État dérivé : connecté si un access token est en mémoire ───
  const isAuthenticated = computed(() => accessTokenStore.getAccessToken() !== null);

  // ─── Formulaire ──────────────────────────────────────────
  const clearForm = () => {
    formData.value.email = '';
    formData.value.password = '';
    errors.value.email = '';
    errors.value.password = '';
  };

  /**
   * L'identifiant peut être un email (comptes classiques) ou un numéro de
   * téléphone à 9 chiffres (comptes clients créés à l'achat).
   */
  const normalizeIdentifier = (value: string): string => {
    const trimmed = value.trim();
    if (trimmed.includes('@')) return trimmed;
    const digits = trimmed.replace(/\D/g, '');
    return digits.length === 9 ? digits : trimmed;
  };

  const validateForm = (): boolean => {
    let isValid = true;
    errors.value.email = '';
    errors.value.password = '';
    const identifier = formData.value.email.trim();
    if (!identifier) {
      errors.value.email = "L'email ou le téléphone est requis";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) && !/^6\d{8}$/.test(identifier.replace(/\D/g, ''))) {
      errors.value.email = 'Email ou numéro de téléphone invalide';
      isValid = false;
    }
    if (!formData.value.password) {
      errors.value.password = 'Le mot de passe est requis';
      isValid = false;
    }
    return isValid;
  };

  // ─── Login ───────────────────────────────────────────────
  const handleLogin = (): Promise<userEntity> => {
    return new Promise((resolve, reject) => {
      rootAxios
        .post('/api/login_check', { ...formData.value, email: normalizeIdentifier(formData.value.email) })
        .then((response) => {
          // Le backend pose le cookie refresh_token ET renvoie { token, user }
          accessTokenStore.setTokens(response.data.token);
          if (response.data.refresh_token) {
            accessTokenStore.setRefreshTokens(response.data.refresh_token);
          }
          currentUser.value = response.data.user as userEntity;
          resolve(currentUser.value);
        })
        .catch((error) => {
          reset();
          reject(error);
        });
    });
  };

  // ─── Logout ──────────────────────────────────────────────
  /**
   * Ferme la session côté serveur (refresh tokens + session RADIUS/MikroTik)
   * puis efface l'access token en mémoire et l'utilisateur courant.
   * Si le backend échoue (réseau, JWT expiré), on vide quand même
   * l'état local pour que l'utilisateur ne reste pas bloqué connecté.
   */
  const logout = async () => {
    try {
      await rootAxios.post('/api/me/logout');
    } catch {
      // ignore : l'important est de nettoyer côté client
    } finally {
      reset();
      clearForm();
    }
  };

  // ─── Reset (appelé par onSessionExpired et handleLogin en cas d'échec) ───
  const reset = () => {
    accessTokenStore.clear();
    currentUser.value = null;
  };

  // ─── Hydratation au démarrage (initSession) ──────────────
  const setUser = (user: userEntity) => {
    currentUser.value = user;
  };

  return {
    formData,
    errors,
    currentUser,
    isAuthenticated,
    clearForm,
    validateForm,
    handleLogin,
    logout,
    reset,
    setUser,
  };
});
