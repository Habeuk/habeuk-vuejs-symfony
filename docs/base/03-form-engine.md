# 03 — Moteur de formulaire

Le moteur est le cœur réutilisable de la base. Il transforme une **définition de champs** envoyée par
le backend en formulaire PrimeVue validé par zod, sans connaître le métier.

```text
EntityForm.vue   (couche données : chargement, soumission, redirections)
   └── Form.vue  (moteur : rendu par type, validation, erreurs, soumission)
         ├── ValidationForm.ts   (Symfony → schéma zod)
         ├── formDataStore       (valeurs, indexées par formKey)
         └── champs (PrimeVue ou composants dédiés)
```

| Fichier | Rôle |
| --- | --- |
| `src/hbkthemes/views/Entity/EntityForm.vue` | Charge la définition, appelle l'API de sauvegarde, redirige |
| `src/hbkthemes/Form/Form.vue` | Rend les champs, valide, émet les données |
| `src/hbkthemes/views/Entity/validationForm.ts` | Convertit les validations Symfony en schéma zod |
| `src/hbkthemes/views/Entity/useEntity.ts` | Composable : nom/identifiant d'entité, chargement, submit |
| `src/stores/modules/formDataStore.ts` | Valeurs de tous les formulaires (`formKey`) |
| `src/hbkthemes/views/Entity/fields/*` | Champs riches : `EntitySelect`, `EntitiesSelect`, `FilesUpload` |

## Contrat d'un champ — `EntityFormFieldInterface`

Défini dans `src/types/index.ts`. C'est **le** contrat front/back.

| Propriété | Type | Rôle |
| --- | --- | --- |
| `name` | `string` | Nom du champ = clé dans les données du formulaire |
| `label` | `string` | Libellé affiché |
| `type` | `string` | Type de rendu (voir tableau ci-dessous) |
| `required` | `boolean` | Champ obligatoire (aussi déduit des validations) |
| `placeholder` | `string \| null` | Placeholder (certains types l'ignorent) |
| `cardinality` | `number` | `1` = simple, `> 1`/`-1` = multiple (fichiers, collections) |
| `maxlength`, `rows`, `scale`, `mask`, `slotChar` | optionnels | Props spécifiques aux types |
| `options` | `Array<{ label, value }>` | Pour `select`, `checkboxes`, `multiselect` |
| `validations` | `{ [clé]: ValidationRuleInterface }` | Règles Symfony (`required`, `length`, `regex`, `positive`, `positive_or_zero`, `email`…) |
| `reference` | `FieldReferenceInterface` | Pour `entity_select` : entité cible, champs affichés/recherchés |
| `tree_data` | `TreeNode[]` | Pour `tree` |

`ValidationRuleInterface` : `{ type, message, min?, max?, minMessage?, maxMessage?, pattern? }`
(le `pattern` arrive **délimité**, ex. `/^\d{3}$/`).

## Types de champs supportés

La liste exhaustive — configuration attendue, rendu, validation, disponibilité côté backend et
exemple de définition pour chaque type — est maintenue dans
**[la référence des champs](fields-reference.md)**. C'est la source de vérité, contrôlée par
`src/tests/hbkthemes/Form/formFieldTypes.spec.ts`.

En résumé (20 types) : `text`, `email`, `password`, `password_repeated`, `textarea`, `number`,
`inputmask`, `select`, `checkbox`, `toggle_switch`, `checkboxes`, `multiselect`, `tree`,
`entity_select`, `entities_select`, `file_upload`, `textarea_ckeditor`, `textarea_tinymce`,
`textarea_primevue`, `submit`.

Notes :

- `boolean` est géré par la validation mais **pas** par le template : le backend mappe
  `CheckboxType` vers `toggle_switch`.
- Plusieurs types ne sont **pas** produits par le mapper backend actuel (`textarea_ckeditor`,
  `textarea_tinymce`, `textarea_primevue`, `checkbox`, `checkboxes`, `multiselect`) : ils existent
  pour un usage explicite via `data-primevui` ou une évolution du mapper.
- `form_json` est produit par le backend mais **non implémenté** dans `Form.vue` (champ invisible).
- « composant enfant » = le libellé n'est pas rendu par `Form.vue` mais par le composant du champ.

## API — `Form.vue`

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `formKey` | `string` | requis | Clé du formulaire dans `formDataStore` |
| `formFields` | `EntityFormFieldInterface[]` | requis | Définition des champs |
| `loading` | `boolean` | requis | Désactive le bouton pendant la sauvegarde |
| `overrideValues` | `Record<string, any>` | — | Valeurs fusionnées dans le store au montage |
| `request_error` | `any \| null` | `null` | Erreur API → violations affichées sous les champs |
| `manageCollection` | `boolean` | `false` | Deux boutons de soumission (`edit` + `collection`) |
| `fieldsSpacing` | `string` | `'space-y-6'` | Classes d'espacement entre champs |
| `emitDelay` / `autoEmit` / `propertyKey` | — | — | Émission débouncée de `form_change` (formulaires « live ») |
| `debug` | `boolean` | `false` | Affiche les données courantes |

| Émission | Charge utile |
| --- | --- |
| `submit_form` | `{ formData, action }` — `action` = valeur du bouton (`nothing`, `edit`, `collection`) |
| `form_change` | `{ [propertyKey]: value }` (si `autoEmit`) |

Slot : `fields` (`{ fields, formData, errors, $form, isFormValid }`) pour remplacer le rendu par défaut.

### Comportements à connaître

- **Garde-fou DEV** : en développement, le composant **lève une erreur** si on lui passe une prop non
  déclarée (`forbiddenAttrs`). Ajouter une prop au composant est donc un changement d'API explicite.
- Les valeurs viennent de `formDataStore` via `formData.getValue/setValue` ; le formulaire **doit**
  avoir été pré-enregistré (`setFormData`) avant le montage, sinon `getFormData()` lève.
- Les champs stylent leurs contrôles via `src/assets/styles/primevue.css` (padding/rayon). Ne pas
  remettre de `px-*`/`py-*`/`rounded-*` sur les champs.
- L'espacement interne d'un champ est `space-y-2` ; l'espacement entre champs vient de `fieldsSpacing`.

## API — `EntityForm.vue`

| Prop | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `customEntityName` | `string` | — | Entité visée (sinon `route.meta.entity`) |
| `customEntityId` | `number` | — | Identifiant (sinon `route.params.entity_id`) ; `0` force la création |
| `customFormData` | `any` | — | Valeurs initiales |
| `manageCollection` | `boolean` | `true` | Affiche les deux boutons |
| `enableRedirect` | `boolean` | `true` | Redirige après sauvegarde |
| `fieldsSpacing` | `string` | — | Relayé à `Form.vue` |

Émission : `emitEntity` (`{ action, formData }`).

Redirections intégrées : après `edit` sur une **nouvelle** entité → `/entity-collection/{entity}/edit/{id}` ;
après `collection` → `/entity-collection/{entity}/list`. (Ce sont des chemins applicatifs : à adapter
si votre projet utilise une autre convention.)

## Validation

`ValidationForm.convertSymfonyValidationToZod()` construit un `z.object` :

| Règle Symfony | Effet |
| --- | --- |
| `required` | Passe `field.required` à `true` ; `.min(1)` pour les chaînes (sauf si `length.min` existe) ; `.min(1)` pour les tableaux |
| `length` | `.min(min, { message: minMessage })` / `.max(max, { message: maxMessage })` |
| `regex` | `.regex(new RegExp(pattern sans délimiteurs), { message })` |
| `positive` / `positive_or_zero` (sur un `select`) | Bascule le type en nombre (`.positive()` / `.min(0)`) |
| `email` (type de champ) | `z.email()` |

Si aucun `required` n'est présent, le champ devient `z.union([schéma.optional(), z.null()])` :
`undefined` et `null` passent.

**Effet de bord assumé** : la conversion **mute** `field.required`. `Form.vue` s'appuie sur ce champ
pour activer/désactiver le bouton de soumission.

## Ajouter un type de champ

1. **Backend** : mapper le type Symfony vers un nom PrimeVue dans `FieldMapperPrimeVue`
   (backend), ou forcer le type via l'attribut de formulaire `data-primevui`.
2. **`Form.vue`** : ajouter un bloc `v-else-if="field.type === '…'"` (label + contrôle + `small` +
   `Message`), en suivant un bloc existant du même genre.
3. **`validationForm.ts`** : ajouter le `case` dans `convertSymfonyValidationToZod` et, si nécessaire,
   une méthode privée (`getZodString`, `getZodArray`…). Sans cela, le type tombe dans le `default`
   et logue `le champs <x> n'a pas de validateur`.
4. **Fixture + tests** :
   - ajouter le champ dans `src/tests/fixtures/formFields.ts` (sinon `formFieldTypes.spec.ts` échoue :
     le catalogue doit couvrir exactement les types du template) ;
   - si le libellé est rendu par un composant enfant, l'ajouter à `TYPES_LABEL_ENFANT` dans
     `src/tests/hbkthemes/Form/Form.spec.ts` ;
   - ajouter la règle de validation dans `validationForm.spec.ts`.
5. **Si le type a un composant dédié** : le créer sous `views/Entity/fields/`, l'importer via
   `defineAsyncComponent` dans `Form.vue`, et le simuler dans les tests (`vi.mock`).

## Limites connues

- `form_json` (produit par le backend) n'a **aucun rendu**.
- `inputmask`, `tree`, `password_repeated`, `textarea_primevue` ne sont pas validés côté client.
- Le bouton de soumission porte un dégradé et des props de variante héritées ; voir
  [07-known-quirks.md](07-known-quirks.md).
