# 02 — Architecture

## Arborescence

```text
src/
├── main.js                     # bootstrap : Pinia, router, PrimeVue (thème), Toast/Confirmation
├── App.vue                     # racine (layout applicatif)
├── assets/
│   ├── main.css                # point d'entrée CSS : Tailwind, @source, imports des styles
│   ├── styles/
│   │   ├── theme.css           # @theme Tailwind : tokens (couleurs, rayons, ombres, polices)
│   │   ├── base.css            # styles de base (body, titres, liens, focus, scrollbars)
│   │   ├── components.css      # classes maison (.card-base)
│   │   └── primevue.css        # pont entre les tokens et PrimeVue (padding/radius des champs)
│   └── logo.svg
├── configs/
│   ├── appConfig.ts            # configuration du projet (nom, tokens, pagination)
│   ├── rootAxios.ts            # client HTTP, tokens, refresh, session expirée
│   ├── routes.ts               # routes de la sidebar + mapping template → composant
│   └── icons.ts                # résolution des icônes (lucide + repli des valeurs serveur)
├── fonts/                      # Manrope (fichiers + @font-face)
├── hbkthemes/                  # ← le socle réutilisable
│   ├── Form/                   # moteur de formulaire générique (voir 03-form-engine.md)
│   ├── components/             # AppHeader, SiderBar, MenusItems, CustomBreadCrumb, HeaderPage
│   ├── layout/AppLayout.vue    # shell : sidebar + header + contenu + footer + dialogs globaux
│   └── views/                  # écrans : auth/, Entity/, collections/, dashboard/, NotFound/, LoadingView, VerificationView
├── router/router.ts            # table de routes + garde d'authentification
├── services/
│   ├── QueryBuilder.ts         # construction des tris/filtres/recherche pour les listes
│   ├── format.ts               # formatage (dates, etc.)
│   └── useBootstrap.ts         # contexte applicatif (utilisateur courant, état d'auth)
├── stores/modules/             # Pinia (stores en « setup »)
├── tests/                      # miroir de src/ (voir 06-testing.md)
├── theme/preset.js             # preset PrimeVue (palette + composants)
├── types/                      # types partagés + contrat des champs de formulaire
└── views/, components/         # ⚠️ reliquats du starter Vue, non utilisés (à supprimer)
```

## Responsabilités

| Couche | Rôle | Règle |
| --- | --- | --- |
| `views/` (`hbkthemes/views`) | Écrans et composition | Aucun appel HTTP direct : passer par les stores/composables |
| `hbkthemes/Form/` | Rendu et validation des formulaires | Ne connaît **pas** le métier ; ne doit pas importer de vue métier |
| `stores/modules/` | État + accès API | Un store par domaine ; logique métier dans les actions |
| `services/` | Utilitaires purs | Testables sans DOM |
| `configs/` | Réglages du projet | Seul endroit à modifier lors d'une copie de la base |
| `types/` | Contrats | Source de vérité des échanges front/back |

## Flux de données

### 1. Démarrage et authentification

```text
main.js → router.beforeEach
  ├─ authStore.checkUserIsAuthenticated()  (GET /api/user/me si un token existe)
  ├─ non authentifié + route protégée → /login?redirect=<chemin>
  ├─ authentifié mais menus non chargés → /loading-app
  │     └─ entityDefinitionStore.getMenus() → GET /api/form/available
  │        → Sidebar.dynamicRoutes → addDynamicRoutes(router) → retour à la route demandée
  └─ /login ou /register alors qu'on est déjà authentifié → redirection
```

- Les **routes** de la sidebar viennent de `configs/routes.ts` (`getRoutes`) ; les entités sont
  ajoutées dynamiquement à partir de la réponse `/api/form/available`.
- Le menu latéral (`MenusItems.vue`) rend `item.icon` via `resolveMenuIcon()` : composant lucide
  pour les modèles locaux, correspondance de repli pour les noms envoyés par le backend.

### 2. Formulaire d'entité (création / édition)

```text
route /entity-collection/{entity}/create|edit/{id}
  └─ EntityCreate/EntityEdit.vue
      └─ EntityForm.vue                 (props : customEntityName, customEntityId…)
          └─ useEntity()                (charge les champs, gère loading/erreurs)
              └─ entityStore.initEntityForm(entity, id) : GET /api/form/fields/{entity}/{action}
                  ├─ formDataStore.setFormData(formKey, valeurs)   formKey = "{entity}-create" | "{entity}-edit-{id}"
                  └─ Form.vue           (props : formKey, formFields…)
                      ├─ ValidationForm → schéma zod → resolver @primevue/forms
                      ├─ rendu par type de champ
                      └─ submit → emit('submit_form', { formData, action })
                          └─ EntityForm → entitySubmit → POST /api/crud/entity/save/{entity}
                              └─ emit('emitEntity') + redirection éventuelle
```

### 3. Liste / collection

```text
EntityCollectionList.vue
  └─ TableauCollectionList.vue
      └─ useCollection(entityName) → collectionsStore.loadEntities(entity, page, limit, params)
          └─ GET /api/entity-collection/{entity}/{page}/{limit}?sorts=…&filters=…&search=…
              (params construits par services/QueryBuilder.ts)
```

## Stores Pinia

| Store | Responsabilité |
| --- | --- |
| `appStore` | Sidebar (état replié, mobile), thème, titre/description lus dans `route.meta` |
| `authStore` | Formulaire de connexion, validation, token, utilisateur courant, logout |
| `entityStore` | Schémas/​définitions d'entités, chargement, duplication, sauvegarde, suppression, `initEntityForm` |
| `entityDefinitionStore` | Définition des colonnes/énumérations, menus dynamiques (`/api/form/available`), configurations |
| `formDataStore` | Données de **tous** les formulaires, indexées par `formKey` (`getValue`/`setValue`/`model`) |
| `collectionsStore` | Chargement et cache des listes paginées |
| `settingsStore` | Configurations société (lecture/écriture, cache session) |

Tous les stores sont écrits en **setup** (`defineStore('x', () => { … })`), ce qui permet de les
tester seuls avec `setActivePinia(createPinia())` (voir [06-testing.md](06-testing.md)).

## Routing

| Route | Accès | Composant |
| --- | --- | --- |
| `/` | — | Redirection (voir écarts connus) |
| `/login` | public | `auth/cover/LoginView.vue` |
| `/register` | public | `auth/cover/RegisterView.vue` |
| `/verification` | public | `VerificationView.vue` |
| `/loading-app` | authentifié | `LoadingView.vue` (initialisation des menus) |
| `/` (`app-layout`) + enfants | authentifié | `AppLayout.vue` + routes construites depuis `Sidebar.getRoutes()` |
| `/:pathMatch(.*)*` | authentifié | `NotFound/NotFoundViewAnimate.vue` |

Le titre du document est mis à jour depuis `route.meta.title` + `appConfig.name`.

## Conventions de code

- `<script setup lang="ts">` partout ; pas d'Options API.
- Alias `@/` pour tout import interne (jamais de `../../..`).
- `import type` explicite (`verbatimModuleSyntax`).
- Textes d'interface en **français** (les commentaires aussi).
- Pas de couleur en dur : utiliser les tokens (`text-surface-600`, `bg-primary-500`…).
- Pas d'icône PrimeVue (`pi pi-*`) : `@lucide/vue` avec une taille explicite (`w-4 h-4`).
- Les tests vivent dans `src/tests/` en miroir de `src/` (jamais de dossier `__tests__`).
- Un correctif fait dans `hbkthemes/Form/` doit être reporté dans le modèle de base.

## Dette visible dans l'arborescence

`src/components/*` (HelloWorld, TheWelcome, WelcomeItem, icons) et `src/views/*` (AboutView,
HomeView) sont des **reliquats du starter Vue** : ils ne sont référencés par aucune route.
Ils doivent être supprimés lors de la création d'un projet à partir de la base.
