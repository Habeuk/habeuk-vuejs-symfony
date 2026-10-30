# 06 — Tests

## Outillage

| Outil | Version | Usage |
| --- | --- | --- |
| Vitest | ^4.1 | Tests unitaires et de composants |
| `@vue/test-utils` | ^2.5 | Montage des composants |
| jsdom | ^30 | DOM simulé |
| Playwright | ^1.63 | E2E (`e2e/`) |

```bash
npm run test:unit        # une passe (CI)
npm run test:unit:watch  # développement
npm run test:e2e         # Playwright (nécessite le dev server et un backend)
```

## Configuration

`vitest.config.js` hérite de `vite.config.js` (donc l'alias `@` fonctionne) et ajoute :

- `environment: 'jsdom'`
- `include: ['src/tests/**/*.spec.{js,ts}']`
- `setupFiles: ['./vitest.setup.js']`
- `exclude: […, 'e2e/**']`

`vitest.setup.js` (racine du paquet) :

1. installe les plugins équivalents à `main.js` : `PrimeVue`, `ToastService`, `ConfirmationService`
   (`useToast()` et `useConfirm()` en dépendent) ;
2. recrée un **Pinia neuf avant chaque test** (`setActivePinia(createPinia())`) : les stores de
   formulaire sont indexés par clé, une fuite rendrait les tests dépendants de leur ordre ;
3. fournit un **polyfill `matchMedia`** (jsdom ne l'implémente pas ; PrimeVue Select l'appelle au
   montage).

## Règle d'arborescence

Les tests vivent dans `src/tests/` et **reproduisent l'arborescence de `src/`**, avec le nom du fichier
testé suffixé par `.spec.ts` :

| Source | Test |
| --- | --- |
| `src/hbkthemes/Form/Form.vue` | `src/tests/hbkthemes/Form/Form.spec.ts` |
| `src/hbkthemes/views/Entity/validationForm.ts` | `src/tests/hbkthemes/views/Entity/validationForm.spec.ts` |
| `src/stores/modules/formDataStore.ts` | `src/tests/stores/modules/formDataStore.spec.ts` |

Pas de dossier `__tests__` à côté des sources. Les données partagées vont dans
`src/tests/fixtures/` (ex. `formFields.ts` : catalogue d'un champ par type).

## Couverture actuelle

| Spec | Tests | Sujet |
| --- | --- | --- |
| `hbkthemes/Form/Form.spec.ts` | 38 | Rendu par type de champ, props, erreurs serveur, soumission, espacement |
| `hbkthemes/Form/formFieldTypes.spec.ts` | 3 | Contrat : le catalogue de fixtures couvre exactement les types du template |
| `hbkthemes/views/Entity/validationForm.spec.ts` | 27 (+1 todo) | Conversion Symfony → zod |
| `hbkthemes/views/Entity/useEntity.spec.ts` | 17 | Chargement, création/édition, submit, suppression, navigation |
| `hbkthemes/views/Entity/fields/FilesUpload.spec.ts` | 5 | États d'un fichier (attente, uploadé, erreur) |
| `hbkthemes/views/collections/useCollection.spec.ts` | 11 | Orchestration des listes |
| `stores/modules/formDataStore.spec.ts` | 13 | État des formulaires, isolation par clé, `model()` |
| `stores/modules/collectionsStore.spec.ts` | 10 | URL, tri par défaut, cache |
| `stores/modules/authStore.spec.ts` | 10 | Validation, login, session, logout |
| `services/QueryBuilder.spec.ts` | 17 | Tris, filtres, recherche, sérialisation URL |
| `configs/icons.spec.ts` | 7 | Résolution des icônes (lucide + repli serveur) |

Total de référence : **158 tests + 1 todo**, 11 fichiers, ~5 s.

### Non couvert à ce jour

- `EntitiesSelect` (montage lourd : routeur + `EntityForm` + chargement par identifiant).
- Garde de route (`router.beforeEach`) — à couvrir en E2E.
- Vues et layout (auth, header/sidebar/menus, 404) et design system.
- E2E : le dossier `e2e/` est vide (`npm run test:e2e` ne trouvera aucun test).

## Patterns à réutiliser

### Simuler une dépendance et capturer des appels

```ts
const { rootAxiosMock } = vi.hoisted(() => ({ rootAxiosMock: { get: vi.fn(), post: vi.fn() } }));
vi.mock('@/configs/rootAxios', () => ({ default: rootAxiosMock }));
```

`vi.hoisted` est nécessaire car `vi.mock` est remonté au-dessus des imports.

### Simuler un composant chargé en asynchrone (`defineAsyncComponent`)

`vi.mock` sur le chemin du `.vue`, avec `__esModule: true` et une **fonction de rendu**
(pas de `template` : le build runtime-only de Vue ne compile pas les chaînes) :

```ts
vi.mock('@/hbkthemes/Form/TinyMceEditor.vue', async () => {
  const { h } = await import('vue');
  return { __esModule: true, default: { name: 'TinyMceEditor', render: () => h('div', { 'data-test': 'tinymce' }) } };
});
```

### Lire la source d'un fichier dans un test

`import.meta.url` n'est pas une URL `file:` sous Vitest/jsdom : utiliser l'import brut Vite.

```ts
import source from '@/configs/icons.ts?raw';        // ou './Form.vue?raw'
```

### Comparer une valeur portée par un `ref`

Un `ref` transforme les objets en **proxy réactif** : `toBe` (identité) échoue, utiliser `toEqual`.

### Assertions de composants PrimeVue

S'appuyer sur les classes stables (`'.p-select'`, `'.p-multiselect'`, `'.p-checkbox'`,
`'.p-toggleswitch'`, `'.p-tree'`, `'.p-inputnumber'`, `'.p-password'`), sur les inputs natifs
(`input[type=…]`, `textarea`, `button`) et sur les icônes lucide (`.lucide-check`, `.lucide-x`…).

### Attendre la validation / un composant asynchrone

```ts
await flushPromises();   // parfois deux fois pour @primevue/forms
```

### Tester un composable qui utilise le routeur

Monter un composant hôte avec un routeur mémoire, et récupérer le retour du composable :

```ts
const router = createRouter({ history: createMemoryHistory(), routes: [...] });
let result!: ReturnType<typeof useEntity>;
mount(defineComponent({ setup() { result = useEntity('Customer'); return () => null; } }), { global: { plugins: [router] } });
```

## Règles

1. **Aucun écrasement silencieux** : quand un test doit figer un comportement anormal, le commenter
   explicitement (« écart connu ») et le lister dans [07-known-quirks.md](07-known-quirks.md).
2. **Pas de contournement durable** : si le composant est corrigé, retirer l'adaptation faite côté test.
3. Ne pas masquer les `console.error` attendus : ils signalent une dette réelle
   (`le champs <x> n'a pas de validateur`).
4. Un nouveau type de champ **doit** ajouter sa fixture, sinon `formFieldTypes.spec.ts` échoue.
5. Un correctif de test qui accompagne un bug corrigé doit être livré dans le même commit que le
   correctif applicatif, et reporté dans le modèle de base.

## Ajouter un test (recette)

1. Créer le fichier en miroir (`src/tests/<même chemin>.spec.ts`).
2. Si l'unité dépend d'un module externe (HTTP, toast, routeur), le simuler avec `vi.hoisted` + `vi.mock`.
3. Réutiliser les fixtures existantes (`src/tests/fixtures/`).
4. Pour un composant : `mount(…, { props })`, pré-remplir les stores nécessaires **avant** le montage.
5. Lancer `npm run test:unit:watch` en développement, `npm run test:unit` avant de livrer.
