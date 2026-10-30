# 07 — Écarts connus

Cette page centralise les bugs et les dettes constatés dans la base. Elle est mise à jour en même
temps que le code : un écart corrigé doit en sortir.

Légende : **P1** = à corriger avant de dériver un projet, **P2** = important, **P3** = confort/optimisation.

| # | Sujet | Priorité | Impact |
| --- | --- | --- | --- |
| 1 | Redirection vers `/dashboard` inexistante | **P1** | Après connexion → page 404 |
| 2 | `form_json` sans rendu | **P1** | Champ invisible et non validé |
| 3 | Incohérence `order` / `operator` sur les listes | **P1** | Tri par défaut potentiellement ignoré |
| 4 | `FilesUpload` — `selectedValue.value.isArray()` | **P1** | `TypeError` en mode multi-fichiers |
| 5 | Types sans validation côté client | P2 | Données acceptées sans contrôle |
| 6 | `clearCache(nom)` sans effet | P2 | Cache non invalidé |
| 7 | URL du backend dupliquée | P2 | Incohérence dev/prod |
| 8 | `basic_axios` en dépendance `file:` | P2 | `npm install` après copie |
| 9 | Reliquats du starter Vue | P3 | Code mort |
| 10 | Chunks > 500 kB / import dynamique ineffectif | P3 | Poids, avertissements de build |
| 11 | Types front non émis par le backend | P3 | Confusion sur ce qui est utilisable |
| 12 | Bouton de soumission (styles hérités) | P3 | Incohérence avec le preset |
| 13 | `getLocalStorageKey` non utilisé | P3 | Export mort |

---

## 1. Redirection vers `/dashboard` inexistante

**Symptôme** : après connexion (ou en accédant à `/`), on arrive sur la page 404.

**Cause** : aucune route `/dashboard` n'existe ; la route de tableau de bord est `/app/dashboard`
(`src/configs/routes.ts`). Or plusieurs endroits redirigent en dur vers `/dashboard` :

- `src/router/router.ts` (redirection de `/` et garde après connexion) ;
- `src/hbkthemes/views/LoadingView.vue` ;
- `src/hbkthemes/views/auth/cover/FormLogin.vue` ;
- `src/hbkthemes/views/auth/basic/LoginView.vue`.

**Correctif** : centraliser la destination dans une constante (ex. `appConfig.homePath = '/app/dashboard'`)
et l'utiliser partout. Ajouter un test de garde ou un test E2E « login → dashboard ».

## 2. `form_json` sans rendu

**Symptôme** : une entité utilisant `JsonEditorType` (mappé en `form_json`) affiche un champ
totalement absent.

**Cause** : `Form.vue` est une chaîne `v-if / v-else-if` sans branche `form_json` ni branche par défaut.
Aucun label, aucun contrôle, aucune validation (le type tombe dans le `default` de `ValidationForm`).

**Correctif** : ajouter un bloc (éditeur JSON ou `Textarea` avec validation JSON), la règle zod associée,
la fixture et les tests. À défaut, prévoir un avertissement explicite pour les types inconnus.

## 3. Incohérence `order` / `operator` sur les listes

**Symptôme** : le tri par défaut des listes peut être ignoré par le backend.

**Cause** : deux formats coexistent pour la même donnée.

- `src/services/QueryBuilder.ts` produit `[{ fieldname, order: 'asc' | 'desc' }]` ;
- `src/stores/modules/collectionsStore.ts` envoie, quand aucun paramètre n'est fourni,
  `[{ fieldname: 'id', operator: 'desc' }]`.

**Correctif** : trancher le format attendu par l'API (probablement `order`), aligner `collectionsStore`,
et figer le contrat par un test.

## 4. `FilesUpload` — `selectedValue.value.isArray()`

**Symptôme** : en mode multi-fichiers (cardinalité `> 1` ou `-1`), la sélection d'un fichier lève
`TypeError: selectedValue.value.isArray is not a function`.

**Cause** : `src/hbkthemes/views/Entity/fields/FilesUpload.vue` appelle une méthode inexistante ;
il faut `Array.isArray(selectedValue.value)`.

**Correctif** : corriger la ligne, puis ajouter le test multi-fichiers (la spec actuelle ne couvre que
le mode mono-fichier, volontairement).

## 5. Types sans validation côté client

`ValidationForm` ne produit aucun schéma pour : `inputmask`, `tree`, `password_repeated`,
`textarea_primevue` (et `form_json`). Ils déclenchent `console.error('le champs <x> n'a pas de validateur')`
et ne sont donc **pas** contrôlés avant l'envoi.

Les `stderr` visibles pendant les tests de `Form.vue` sont ce message : ils sont volontairement laissés
visibles. Le `it.todo` de `validationForm.spec.ts` marque le travail restant.

## 6. `clearCache(nom)` sans effet

`collectionsStore.clearCache(entityName)` fait `delete collections.value[entityName]`, alors que les
entrées sont indexées `"{entity}-{page}-{limit}"`. Passer un nom ne vide donc rien (seul l'appel sans
argument fonctionne). Un test de caractérisation fige ce comportement : il échouera quand la correction
sera faite, ce qui est attendu.

## 7. URL du backend dupliquée

Le backend est référencé à deux endroits qu'il faut garder synchronisés :

- `vite.config.js` → `server.proxy['/api'].target` (dev) ;
- `src/configs/rootAxios.ts` → `baseUrl` et `TestDomain` (utilisés par `basic_axios`).

Idéalement, une seule source (variable d'environnement Vite) alimenterait les deux.

## 8. `basic_axios` en dépendance `file:`

`package.json` déclare `"basic_axios": "file:../../AppVuejs/basic_axios"` : chemin **relatif hors du
paquet**. Après copie dans `base-frontend-symfony/`, ce chemin ne résout plus et `npm install` échoue.

**Correctif** : publier `basic_axios` (registry privé) ou l'inclure dans le dépôt avec un chemin stable.

## 9. Reliquats du starter Vue

`src/components/*` (HelloWorld, TheWelcome, WelcomeItem, icons) et `src/views/*` (AboutView, HomeView)
ne sont référencés par aucune route. À supprimer lors de la création d'un projet dérivé.

## 10. Chunks > 500 kB / import dynamique ineffectif

- `TinyMceEditor` ≈ 2,1 Mo et `CKEditorTextarea` ≈ 1 Mo : chunks **paresseux**, chargés uniquement si
  le champ correspondant s'affiche. Ces types n'étant pas émis par le mapper backend, les dépendances
  `tinymce` / `ckeditor5` ne servent aujourd'hui à rien : les retirer allégerait la base.
- `[INEFFECTIVE_DYNAMIC_IMPORT]` : `src/router/router.ts` est importé dynamiquement par
  `src/configs/routes.ts` **et** statiquement par `LoadingView.vue`/`main.js` → le découpage ne sert à rien.

## 11. Types front non émis par le backend

`textarea_ckeditor`, `textarea_tinymce`, `textarea_primevue`, `checkbox`, `checkboxes`, `multiselect`,
`tree`, `inputmask` ne sont pas produits par `FieldMapperPrimeVue`. Ils restent utilisables via
l'attribut `data-primevui` d'une définition de formulaire, mais un développeur peut croire qu'ils
sortent du backend. À documenter côté backend ou à retirer du socle si inutiles.

## 12. Bouton de soumission (styles hérités)

`Form.vue` applique au bouton un dégradé `from-primary-500 via-primary-600 to-primary-700` **et** les
props `severity="primary" variant="outline" rounded text raised`, ainsi que `rounded-xl` : ces
définitions se contredisent et écrasent le rayon du preset (`--hbk-button-radius`). Le padding, lui,
vient bien de `primevue.css`.

**Correctif** : choisir une seule voie (variante PrimeVue **ou** classes utilitaires) et supprimer
`rounded-xl`.

## 13. `getLocalStorageKey` non utilisé

`src/configs/appConfig.ts` exporte `getLocalStorageKey()` (préfixe des clés `localStorage`) mais aucun
code ne l'appelle : les clés sont utilisées brutes (`auth_token`, `refresh_token`). Soit l'adopter
partout, soit le supprimer.

---

## Contrats verrouillés par les tests (à ne pas casser)

Ces comportements sont volontairement figés ; les modifier demande de mettre à jour les tests **et**
la documentation :

- `createFormKey(entity, null)` → `"{entity}-create"` ; `(entity, 12)` → `"{entity}-edit-12"` ;
  un identifiant `undefined`/`NaN` lève.
- Un formulaire doit être enregistré dans `formDataStore` **avant** son montage.
- `ValidationForm` mute `field.required` (utilisé par l'état du bouton de soumission).
- `Form.vue` lève en développement si on lui passe une prop non déclarée.
- Le catalogue `src/tests/fixtures/formFields.ts` doit couvrir **exactement** les types du template.
- `resolveMenuIcon` : composant lucide renvoyé tel quel, valeur serveur traduite, inconnue → `Folder`.
