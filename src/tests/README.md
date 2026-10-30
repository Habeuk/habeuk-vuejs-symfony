# Tests

## Règle d'arborescence

Tous les tests unitaires vivent dans `src/tests/` et **reproduisent l'arborescence de `src/`**.
Le nom du fichier est celui du fichier testé, suffixé par `.spec.ts`.

| Fichier source | Fichier de test |
| --- | --- |
| `src/hbkthemes/Form/Form.vue` | `src/tests/hbkthemes/Form/Form.spec.ts` |
| `src/hbkthemes/views/Entity/validationForm.ts` | `src/tests/hbkthemes/views/Entity/validationForm.spec.ts` |
| `src/stores/modules/formDataStore.ts` | `src/tests/stores/modules/formDataStore.spec.ts` |

Il n'y a donc **pas** de dossier `__tests__` à côté des sources, et aucun fichier de test ne doit être créé ailleurs.

## Dossiers de support

- `src/tests/fixtures/` : données de référence partagées par plusieurs tests (catalogue de champs de formulaire, payloads d'API…).
- Le setup global (`vitest.setup.js`) est à la racine : il installe les plugins équivalents à `main.js` et recrée un Pinia neuf avant chaque test.

## Commandes

```bash
npm run test:unit        # une passe (CI)
npm run test:unit:watch  # mode watch
npm run test:e2e         # Playwright (dossier e2e/)
```
