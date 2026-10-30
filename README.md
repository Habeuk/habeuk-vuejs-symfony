# habeuk-vuejs-symfony

Base de développement pour les applications **Vue 3 + TypeScript** adossées à un backend **Symfony**
(API JSON + formulaires pilotés par la définition des entités).

Ce dépôt n'est pas une application métier : c'est le socle que l'on copie pour démarrer un nouveau
projet. Tout ce qui est spécifique à un domaine (facturation, nutrition, RH…) doit être ajouté dans
`src/configs/`, `src/theme/` ou dans les vues, **jamais** dans le socle (`src/hbkthemes/Form/`).

## Sommaire de la documentation

Toute la documentation de base est dans [`docs/base/`](docs/base/).

| Document | Contenu |
| --- | --- |
| [Prise en main](docs/base/01-getting-started.md) | Prérequis, installation, scripts, configuration d'un nouveau projet |
| [Architecture](docs/base/02-architecture.md) | Arborescence, responsabilités, flux de données, routing |
| [Moteur de formulaire](docs/base/03-form-engine.md) | `EntityForm` / `Form`, contrat des champs, ajout d'un type de champ |
| [Référence des champs](docs/base/fields-reference.md) | **Les 20 types supportés** : définition JSON, rendu, validation, disponibilité backend |
| [Design system](docs/base/04-design-system.md) | Tokens, thème PrimeVue, Tailwind, icônes lucide, règles de style |
| [Contrat d'API](docs/base/05-api-contract.md) | Endpoints Symfony consommés, formats d'échange, violations |
| [Tests](docs/base/06-testing.md) | Vitest + Testing Library, structure, patterns, couverture |
| [Écarts connus](docs/base/07-known-quirks.md) | Bugs et dettes identifiés, avec leur statut |

## Stack

| Domaine | Choix | Version |
| --- | --- | --- |
| Framework | Vue 3 (`<script setup lang="ts">`) | ^3.5 |
| Build | Vite (+ `@vitejs/plugin-vue`) | ^8.2 |
| TypeScript | `vue-tsc` en vérification stricte | ^3.3 / TS ^6.0 |
| UI | PrimeVue + `@primeuix/themes` (preset maison) | ^4.5 / ^3.0 |
| CSS | Tailwind CSS v4 + `tailwindcss-primeui` | ^4.3 |
| État | Pinia (stores en *setup*) | ^4.0 |
| Routing | vue-router (history web) | ^5.3 |
| Formulaires | `@primevue/forms` + `zod` | ^5.0 / ^4.6 |
| Icônes | `@lucide/vue` (**pas** de primeicons) | ^1.57 |
| Éditeurs riches | Quill (via PrimeVue Editor), TinyMCE, CKEditor 5, CodeMirror | — |
| Tests | Vitest + `@vue/test-utils` + jsdom, Playwright | ^4.1 / ^2.5 / ^30 / ^1.63 |
| Qualité | ESLint + oxlint + Prettier | — |

## Démarrage rapide

```bash
npm install
npm run dev          # vite + vue-tsc en watch
```

Un backend Symfony doit être accessible (voir le proxy de `vite.config.js`), sinon les appels
`/api/*` échouent.

## Scripts

| Script | Rôle |
| --- | --- |
| `npm run dev` | Vite + vérification TypeScript en continu (`run-p`) |
| `npm run dev:vite` / `npm run dev:types` | Les deux moitiés séparément |
| `npm run build` | `vue-tsc --noEmit` **puis** `vite build` (échoue si le typage casse) |
| `npm run preview` | Sert le build local |
| `npm run test:unit` | Vitest en une passe (CI) |
| `npm run test:unit:watch` | Vitest en watch |
| `npm run test:e2e` | Playwright (`e2e/`, nécessite le dev server et un backend) |
| `npm run lint` | oxlint puis ESLint (avec `--fix`) |
| `npm run format` | Prettier sur `src/` |

## Structure en un coup d'œil

```text
src/
  main.js                # createApp + Pinia + router + PrimeVue (theme) + Toast/Confirmation
  assets/                # CSS global (theme, base, components, primevue) + fonts Manrope
  configs/               # appConfig, rootAxios (HTTP), routes (sidebar), icons (lucide/mapping)
  hbkthemes/
    Form/                # moteur de formulaire générique (+ éditeurs)
    components/          # header, sidebar, menus, breadcrumb
    layout/              # AppLayout (shell de l'application)
    views/               # Entity, collections, auth, dashboard, 404, loading
  router/                # routes + garde d'authentification
  services/              # QueryBuilder, format, useBootstrap
  stores/modules/        # Pinia : app, auth, entity, entityDefinition, formData, collections, settings
  tests/                 # miroir de src/ (voir 06-testing.md)
  theme/preset.js        # preset PrimeVue
  types/                 # types partagés (entités, filtres, form data)
```

## Statut de la base

- Socle fonctionnel et **testé** : 11 fichiers de specs, 158 tests (+ 1 todo) au moment de la rédaction.
- Le build (`npm run build`) est vert.
- Des écarts connus subsistent, documentés et priorisés dans [07-known-quirks.md](docs/base/07-known-quirks.md)
  (notamment les redirections `/dashboard`, `form_json`, l'incohérence `order`/`operator` des listes).

## Pour démarrer un nouveau projet

Voir la checklist de [`docs/base/README.md`](docs/base/README.md) et
[Prise en main](docs/base/01-getting-started.md#démarrer-un-nouveau-projet-à-partir-de-cette-base).
