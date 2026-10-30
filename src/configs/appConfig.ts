/**
 * Configuration globale de l'application.
 *
 * Ce fichier centralise les paramètres réutilisables dans tous les projets
 * dérivés de ce starter. Les valeurs spécifiques à un projet métier
 * (facturation, e-commerce, etc.) ne doivent PAS être ajoutées ici :
 * crée un fichier dédié dans `src/configs/` à la place.
 */
interface AppConfigInterface {
  /** Nom de l'application, affiché dans l'UI (header, titres, etc.). */
  name: string;

  /** Clé utilisée pour stocker le token d'authentification côté client. */
  token_name: string;

  /** Nombre d'éléments chargés par page par défaut (pagination). */
  load_per_page: number;

  /** Numéro de page par défaut au démarrage d'une liste paginée. */
  default_page: number;
}

/**
 * Configuration par défaut de l'application.
 * Modifie ces valeurs pour chaque nouveau projet dérivé du starter.
 */
const appConfig: AppConfigInterface = {
  name: 'App HABEUK 2026',
  token_name: 'token',
  load_per_page: 30,
  default_page: 1,
};

/**
 * Préfixe une clé avant stockage dans le localStorage.
 *
 * Utilisé pour éviter les collisions entre plusieurs applications
 * servies sur le même domaine (ex: admin.example.com et app.example.com).
 *
 * @param key - La clé brute à préfixer.
 * @returns La clé préfixée, prête à être utilisée avec localStorage.
 */
export const getLocalStorageKey = (key: string): string => {
  return `hbk_2026_${key}`;
};

export default appConfig;
