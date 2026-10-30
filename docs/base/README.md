# Documentation de base — `habeuk-vuejs-symfony`

Cette documentation décrit le socle, indépendamment du projet qui l'utilise.
Elle est destinée à être copiée telle quelle dans chaque nouveau projet dérivé
(destination prévue : `base-frontend-symfony/`, puis renommée selon le projet).

## Sommaire

| Document | Contenu |
| --- | --- |
| [Prise en main](01-getting-started.md) | Prérequis, scripts, configuration par projet. |
| [Architecture](02-architecture.md) | Arborescence, responsabilités, flux de données, routing. |
| [Moteur de formulaire](03-form-engine.md) | `EntityForm`/`Form`, contrat des champs, extension. |
| [**Référence des champs**](fields-reference.md) | Les 20 types supportés : définition JSON, rendu, validation, disponibilité backend. |
| [Design system](04-design-system.md) | Tokens, thème PrimeVue, Tailwind, icônes. |
| [Contrat d'API](05-api-contract.md) | Endpoints Symfony, formats, violations. |
| [Tests](06-testing.md) | Structure, patterns, couverture, recettes. |
| [Écarts connus](07-known-quirks.md) | Bugs et dettes, avec priorité. |

## Règles de lecture

- **Le socle est `src/hbkthemes/Form/`** (moteur de formulaire) et `src/hbkthemes/layout/`.
  Toute correction qui y est faite doit être reportée dans le modèle de base, sinon les projets
  dérivés divergent en silence.
- Ce qui est **spécifique au projet** doit rester hors du socle :
  `src/configs/appConfig.ts`, `src/configs/rootAxios.ts`, `src/theme/preset.js`,
  `src/assets/styles/theme.css`, `vite.config.js` (proxy), `index.html`.
- Les documents décrivent l'état **constaté** du code. Les écarts sont centralisés dans
  [07-known-quirks.md](07-known-quirks.md) plutôt que dispersés.

## Démarrer un nouveau projet à partir de cette base

1. **Copier** le dossier (sans les artefacts) :

   ```bash
   rsync -a --exclude node_modules --exclude dist --exclude .git \
     ./frontend/ ../base-frontend-symfony/
   ```

2. **Renommer le paquet** dans `package.json` (`name`) — par convention `habeuk-vuejs-symfony`
   pour la base, puis le nom du projet.

3. **Configurer l'identité de l'application** dans `src/configs/appConfig.ts` :
   `name` (affiché dans le header et les titres de page), `token_name`, `refresh_token_name`,
   `load_per_page`, `default_page`.

4. **Pointer vers le backend** — deux endroits à garder cohérents :
   - `vite.config.js` → `server.proxy['/api'].target` (dev) ;
   - `src/configs/rootAxios.ts` → `baseUrl` et `TestDomain`.

5. **Adapter la marque** : `src/theme/preset.js` (palette `primary`) et
   `src/assets/styles/theme.css` (tokens `--color-*`, rayons, ombres). Les deux doivent rester
   alignés — voir [04-design-system.md](04-design-system.md).

6. **Titre du document** : `index.html` (`<title>`).

7. **Vérifier la route d'accueil** : après connexion, l'application redirige vers `/dashboard`,
   qui n'existe pas dans le routeur (la liste dynamique déclare `/app/dashboard`).
   Voir [07-known-quirks.md](07-known-quirks.md#1-redirection-vers-dashboard-inexistante).

8. **Nettoyer les reliquats du starter Vue** (`src/components/*`, `src/views/*`) avant la première
   livraison — ils ne sont référencés par aucune route.

9. **Contrôler la chaîne** :

   ```bash
   npm install
   npm run test:unit     # doit être vert sans backend
   npm run build         # typage + bundle
   npm run dev           # avec le backend Symfony démarré
   ```

10. **Adapter les fixtures de tests** (`src/tests/fixtures/formFields.ts`) au domaine du projet,
    et garder la règle de miroir décrite dans [06-testing.md](06-testing.md).

## Conventions de cette documentation

- Langue : français, comme les commentaires du code.
- Les chemins cités sont relatifs à la racine du paquet.
- Les extraits de code sont indicatifs : la source reste la référence.
