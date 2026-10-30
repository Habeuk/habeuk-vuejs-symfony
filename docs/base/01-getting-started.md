# 01 — Prise en main

## Prérequis

| Élément | Version / remarque |
| --- | --- |
| Node.js | `^22.18.0` ou `>=24.12.0` (champ `engines` de `package.json`) |
| npm | fourni avec Node |
| Backend | API Symfony de l'écosystème Habeuk, accessible en HTTP (dev : `http://<projet>.localhost`) |
| Navigateurs Playwright | `npx playwright install` (uniquement pour l'E2E) |

Le frontend ne fonctionne pas seul : il consomme des endpoints `/api/*` (voir
[05-api-contract.md](05-api-contract.md)). Sans backend, l'application démarre mais les formulaires
et les listes restent vides ou en erreur.

## Installation

```bash
npm install
npx playwright install   # optionnel, pour test:e2e
```

## Scripts

| Script | Effet |
| --- | --- |
| `npm run dev` | `run-p dev:vite dev:types` : serveur Vite **et** `vue-tsc --noEmit --watch` |
| `npm run dev:vite` | Vite seul (rapide, sans vérification de types) |
| `npm run dev:types` | Vérification TypeScript seule, en watch |
| `npm run build` | `vue-tsc --noEmit && vite build` — **le build échoue si le typage échoue** |
| `npm run preview` | Sert le contenu de `dist/` (utile pour l'E2E en CI) |
| `npm run test:unit` | Vitest en une passe (`--run`), donc utilisable en CI |
| `npm run test:unit:watch` | Vitest en watch, pour le développement |
| `npm run test:e2e` | Playwright sur `e2e/` (lance le dev server via `webServer`) |
| `npm run lint` | `oxlint . --fix` puis `eslint . --fix --cache` |
| `npm run format` | `prettier --write src/` |

## Bootstrap de l'application

`index.html` charge `src/main.js`, qui assemble l'application :

```js
app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: CustomPreset,                 // src/theme/preset.js
    options: {
      darkModeSelector: '.app-dark',      // le thème sombre s'active via cette classe
      cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
    },
  },
});
app.use(ToastService);
app.use(ConfirmationService);
```

Points à retenir :

- **`ToastService` et `ConfirmationService` sont obligatoires** : `useToast()` (formulaires, entités)
  et `useConfirm()` (suppressions, champs de collection) en dépendent.
- L'ordre des couches CSS (`theme, base, primevue`) permet à Tailwind (`theme`, `base`) de passer
  avant les styles PrimeVue (`primevue`). Les surcharges maison vivent dans
  `src/assets/styles/primevue.css`.
- Le thème sombre s'active en ajoutant la classe `app-dark` sur un ancêtre (pas de media query auto).

## Configuration (fichiers à adapter par projet)

| Fichier | Ce qu'on y règle |
| --- | --- |
| `src/configs/appConfig.ts` | Nom affiché, clés de stockage des tokens, pagination par défaut |
| `src/configs/rootAxios.ts` | `baseUrl` / `TestDomain` du backend, gestion des tokens, refresh, session expirée |
| `vite.config.js` | Alias `@`, proxy `/api` vers le backend |
| `index.html` | `<title>` du document |
| `src/theme/preset.js` | Palette `primary`, variantes de boutons |
| `src/assets/styles/theme.css` | Tokens Tailwind (`--color-*`, rayons, ombres, polices) |
| `src/configs/routes.ts` | Routes statiques de la sidebar (`getRoutes`) et mapping template → composant |

### Réseau

- **Dev** : le proxy Vite redirige `/api` vers le backend (`changeOrigin`, `secure: false`).
- **Prod** : le front et l'API doivent être servis sur la même origine (ou un reverse proxy équivalent).
- `rootAxios` porte aussi une `baseUrl` absolue, utilisée par `basic_axios` : les deux réglages
  (proxy Vite et `baseUrl`) doivent pointer vers le même backend, sinon les appels partent ailleurs
  en développement.

Il n'y a **pas de fichier `.env`** : l'URL du backend est en dur dans ces deux fichiers.

## TypeScript

`tsconfig.app.json` est strict :

- `strict: true`
- `noUnusedLocals` / `noUnusedParameters` : une variable ou un import inutilisé **casse le build**
- `verbatimModuleSyntax` : les imports de types doivent utiliser `import type`
- alias `@/*` → `src/*` (déclaré dans `paths` et dans `vite.config.js`)

Conséquence pratique : avant de livrer, `npm run build` est le juge de paix (typage + bundle).

## Démarrer un nouveau projet à partir de cette base

1. Copier le dossier sans `node_modules`, `dist` ni `.git`.
2. `package.json` → `name`.
3. `src/configs/appConfig.ts` → identité et clés de stockage.
4. `vite.config.js` (`proxy`) **et** `src/configs/rootAxios.ts` (`baseUrl`, `TestDomain`) → backend.
5. `src/theme/preset.js` **et** `src/assets/styles/theme.css` → couleurs de marque (les garder alignés).
6. `index.html` → titre.
7. Vérifier la cible de redirection après connexion (voir
   [07-known-quirks.md](07-known-quirks.md#1-redirection-vers-dashboard-inexistante)).
8. Supprimer les reliquats du starter Vue (`src/components/*`, `src/views/*`).
9. `npm install && npm run test:unit && npm run build`.

## Dépannage rapide

| Symptôme | Cause probable |
| --- | --- |
| `npm run dev` signale des erreurs TS en boucle | `vue-tsc --watch` est lancé en parallèle : corriger le type, le serveur Vite continue de fonctionner |
| `npm run build` échoue sur une dépendance introuvable | dépendance *peer* d'un composant PrimeVue non installée (ex. `quill` pour `primevue/editor`) |
| `/api/*` renvoie 404 ou une page HTML | proxy Vite mal ciblé, ou backend arrêté |
| Les icônes ne s'affichent pas | usage de classes `pi pi-*` : **primeicons n'est pas installé**, utiliser `@lucide/vue` |
| Les styles Tailwind du package n'apparaissent pas | dossier non déclaré dans `@source` de `src/assets/main.css` |
