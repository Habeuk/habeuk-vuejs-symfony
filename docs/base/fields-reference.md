# Référence des champs de formulaire

Liste exhaustive des types de champs que le moteur (`src/hbkthemes/Form/Form.vue`) sait rendre.
C'est la **source de vérité** : elle est vérifiée mécaniquement par
`src/tests/hbkthemes/Form/formFieldTypes.spec.ts` (le catalogue de fixtures doit couvrir exactement
les types du template).

## Comment lire cette page

Pour chaque type :

- **Définition** : l'objet `EntityFormFieldInterface` minimal à envoyer depuis le backend
  (ou à mettre dans `customFormData`), avec les propriétés spécifiques au type ;
- **Rendu** : le composant PrimeVue (ou dédié) réellement monté ;
- **Validation** : le schéma zod produit par `ValidationForm` ;
- **Backend** : si le mapper Symfony (`FieldMapperPrimeVue`) produit ce type ;
- **Libellé** : qui affiche `<label>` (`Form.vue` ou le composant du champ).

Tous les champs partagent au minimum `name`, `label`, `type`, `required`, `placeholder`,
`cardinality`. Voir le contrat complet dans [03-form-engine.md](03-form-engine.md#contrat-dun-champ--entityformfieldinterface).

## Synthèse

| Type | Rendu | Validation zod | Produit par le backend | Libellé |
| --- | --- | --- | --- | --- |
| `text` | `InputText` | `z.string()` | ✅ (`TextType`, `UrlType`) | `Form.vue` |
| `email` | `InputText type=email` | `z.email()` | ✅ (`EmailType`) | `Form.vue` |
| `password` | `Password` | `z.string()` | ✅ (`PasswordType`) | `Form.vue` |
| `password_repeated` | 2 × `Password` | ⚠️ aucune | ✅ (`RepeatedType`) | `Form.vue` |
| `textarea` | `Textarea` | `z.string()` | ✅ (`TextareaType`) | `Form.vue` |
| `number` | `InputNumber` | `z.number()` | ✅ (`NumberType`) | `Form.vue` |
| `inputmask` | `InputMask` | ⚠️ aucune | ✅ (`TelType`) | `Form.vue` |
| `select` | `Select` | `z.string()` / `z.number()` | ✅ (`ChoiceType`) | `Form.vue` |
| `checkbox` | `Checkbox` (binaire) | — | ➖ (mappé en `toggle_switch`) | `Form.vue` |
| `toggle_switch` | `ToggleSwitch` | `z.boolean()` | ✅ (`CheckboxType`) | `Form.vue` |
| `checkboxes` | un `Checkbox` par option | `z.array()` | ➖ (via `data-primevui`) | `Form.vue` |
| `multiselect` | `MultiSelect` | `z.array()` | ➖ (via `data-primevui`) | `Form.vue` |
| `tree` | `Tree` | ⚠️ aucune | ✅ (`TreeType`) | `Form.vue` |
| `entity_select` | `EntitySelect` | — | ✅ (`EntitySelectType`) | composant |
| `entities_select` | `EntitiesSelect` | — | ✅ (`EntityCollectionType`) | composant |
| `file_upload` | `FilesUpload` | — | ✅ (`FileType`) | composant |
| `textarea_ckeditor` | `CKEditorTextarea` | `z.string()` | ➖ (via `data-primevui`) | composant |
| `textarea_tinymce` | `TinyMceEditor` | `z.string()` | ➖ (via `data-primevui`) | composant |
| `textarea_primevue` | `Editor` (PrimeVue/Quill) | ⚠️ aucune | ➖ (via `data-primevui`) | `Form.vue` |
| `submit` | `Button` | — | ✅ (`SubmitType`) | libellé du bouton |

⚠️ « aucune » = le type tombe dans le `default` de `ValidationForm` et déclenche
`console.error("le champs <x> n'a pas de validateur")` : le champ n'est **pas** validé côté client.
➖ = non produit par le mapper backend ; utilisable uniquement en forçant `data-primevui` dans la
définition du formulaire.

---

## 1. Texte et saisie simple

### `text`

```json
{
  "name": "title",
  "label": "Titre",
  "type": "text",
  "required": true,
  "placeholder": "Saisir un titre",
  "maxlength": 180,
  "cardinality": 1
}
```

Props utilisées : `placeholder`, `maxlength`. Rendu : `InputText` (type `text`).

### `email`

```json
{ "name": "email", "label": "Adresse e-mail", "type": "email", "required": true, "placeholder": "vous@exemple.fr", "maxlength": 180 }
```

Rendu : `InputText` avec `type="email"`. Validation : `z.email()`.

### `password`

```json
{ "name": "password", "label": "Mot de passe", "type": "password", "required": true, "placeholder": "••••••••" }
```

Rendu : `Password` avec `toggleMask` et `feedback=false` (pas d'indicateur de force).

### `password_repeated`

```json
{
  "name": "password",
  "label": "Mot de passe",
  "type": "password_repeated",
  "required": true,
  "firstLabel": "Mot de passe",
  "secondLabel": "Confirmation du mot de passe"
}
```

Rendu : deux `Password`. **Attention** : les valeurs sont stockées sous les clés
`password_first` et `password_second` (pas `password`).
Validation : ⚠️ aucune (le contrôle d'égalité n'est pas fait côté client).

### `textarea`

```json
{ "name": "comment", "label": "Commentaire", "type": "textarea", "rows": 4, "placeholder": "Votre message" }
```

Rendu : `Textarea` avec `rows` (défaut 3 si absent).

### `number`

```json
{ "name": "quantity", "label": "Quantité", "type": "number", "scale": 2, "required": true }
```

Rendu : `InputNumber` (`minFractionDigits` = `scale`).
Validation : `z.number()` — **aucune coercition** : la chaîne `"12"` est refusée.

### `inputmask`

```json
{ "name": "phone", "label": "Téléphone", "type": "inputmask", "mask": "99 99 99 99 99", "slotChar": "_" }
```

Rendu : `InputMask` (`mask`, `slotChar`, `placeholder`).
Validation : ⚠️ aucune.

---

## 2. Choix

### `select`

```json
{
  "name": "status",
  "label": "Statut",
  "type": "select",
  "required": true,
  "options": [
    { "label": "Actif", "value": "actif" },
    { "label": "Inactif", "value": "inactif" }
  ],
  "filter": true
}
```

Rendu : `Select` (`optionLabel="label"`, `optionValue="value"`, `filter` optionnel).
Validation : `z.string()` par défaut ; bascule en `z.number()` si les règles contiennent
`positive`, `positive_or_zero` ou `range`.

### `checkbox`

```json
{ "name": "accept_terms", "label": "J'accepte les conditions", "type": "checkbox", "required": true }
```

Rendu : `Checkbox` **binaire** (libellé à droite du contrôle). Le backend mappe `CheckboxType`
vers `toggle_switch`, donc ce type s'utilise via `data-primevui`.

### `toggle_switch`

```json
{ "name": "active", "label": "Activer le suivi", "type": "toggle_switch" }
```

Rendu : `ToggleSwitch` (libellé à droite). Validation : `z.boolean()`.

### `checkboxes` (groupe de cases)

```json
{
  "name": "interests",
  "label": "Centres d'intérêt",
  "type": "checkboxes",
  "options": [
    { "label": "Sport", "value": "sport" },
    { "label": "Musique", "value": "musique" }
  ],
  "required": true
}
```

Rendu : un `Checkbox` par option, **modèle = tableau** (`["sport"]`). Chaque option reçoit un
`id` de la forme `{name}-{value}`.
Validation : `z.array()` ; si une règle `required` est présente, tableau vide refusé.

### `multiselect`

```json
{
  "name": "tags",
  "label": "Étiquettes",
  "type": "multiselect",
  "options": [
    { "label": "Urgent", "value": "urgent" },
    { "label": "Archivé", "value": "archive" }
  ],
  "filter": true
}
```

Rendu : `MultiSelect` (`display="chip"`, `filter` optionnel), modèle = tableau.
Validation : `z.array()` (même règle que `checkboxes`).

---

## 3. Relations et fichiers

### `entity_select`

```json
{
  "name": "customer",
  "label": "Client",
  "type": "entity_select",
  "reference": {
    "entity": "Customer",
    "mapped_by": "customer",
    "display_fields": ["name"],
    "search_fields": ["name"],
    "multiple": false
  }
}
```

Rendu : `EntitySelect.vue` (recherche distante via `/api/crud/search/{entity}`).
Le libellé est rendu par le composant. Validation : aucune.

### `entities_select`

```json
{
  "name": "lines",
  "label": "Lignes",
  "type": "entities_select",
  "cardinality": -1,
  "reference": {
    "entity": "QuoteLine",
    "mapped_by": "quote",
    "type_orm": "OneToMany",
    "display_fields": ["label"],
    "search_fields": ["label"]
  }
}
```

Rendu : `EntitiesSelect.vue` (ajout/suppression/réordonnancement, création à la volée).
`type_orm: "ManyToMany"` transmet l'identifiant du parent sous forme de tableau.

### `file_upload`

```json
{
  "name": "documents",
  "label": "Documents",
  "type": "file_upload",
  "placeholder": "Déposez vos images",
  "cardinality": -1
}
```

Rendu : `FilesUpload.vue` (PrimeVue `FileUpload`).
`cardinality` pilote le mode : `1` = fichier unique, `> 1` = limité, `-1` = illimité.
La valeur transmise au formulaire est `{ id: <fid> }`.
⚠️ Écart connu : le mode multi-fichiers lève une `TypeError` (voir [07-known-quirks.md](07-known-quirks.md#4-filesupload--selectedvaluevalueisarray)).

---

## 4. Contenu riche

Les trois types ci-dessous ne sont **pas** produits par le mapper backend : ils s'utilisent via
`data-primevui` (`textarea_ckeditor`, `textarea_tinymce`, `textarea_primevue`).

### `textarea_ckeditor`

```json
{ "name": "content", "label": "Contenu", "type": "textarea_ckeditor", "rows": 5 }
```

Rendu : `CKEditorTextarea.vue` (éditeur CKEditor 5, chargé en asynchrone → chunk lourd).
Validation : `z.string()`. Libellé rendu par le composant.

### `textarea_tinymce`

```json
{ "name": "article", "label": "Article", "type": "textarea_tinymce", "rows": 5 }
```

Rendu : `TinyMceEditor.vue` (TinyMCE, chunk très lourd). Validation : `z.string()`.

### `textarea_primevue`

```json
{ "name": "description", "label": "Description", "type": "textarea_primevue" }
```

Rendu : `Editor` de PrimeVue (Quill), hauteur fixe 320 px. Validation : ⚠️ aucune.
Dépend de la dépendance *peer* `quill` (installée).

---

## 5. Structure et action

### `tree`

```json
{
  "name": "categories",
  "label": "Catégories",
  "type": "tree",
  "tree_data": [
    { "key": "1", "label": "Alimentation", "children": [{ "key": "1-1", "label": "Fruits" }] }
  ]
}
```

Rendu : `Tree` PrimeVue en sélection par cases à cocher (`selectionKeys`).
Validation : ⚠️ aucune.

### `submit`

```json
{ "name": "save", "label": "Enregistrer", "type": "submit" }
```

Rendu : `Button type="submit"` avec `name="submit_action"`.
Le `value` du bouton dépend de `manageCollection` du formulaire :

| `manageCollection` | Boutons | `action` envoyée |
| --- | --- | --- |
| `false` (défaut) | 1 | `nothing` |
| `true` | 2 (`edit`, `collection`) | `edit` / `collection` |

---

## Types non supportés

| Type | Situation |
| --- | --- |
| `form_json` | Produit par le backend (`JsonEditorType`) mais **aucune branche** dans `Form.vue` : champ invisible, non validé (voir [07-known-quirks.md](07-known-quirks.md#2-form_json-sans-rendu)) |
| `boolean` | Géré par `ValidationForm` (donc pas d'erreur) mais absent du template ; le backend mappe `CheckboxType` vers `toggle_switch` |
| tout autre type | Tombe dans le vide : rien n'est rendu et `ValidationForm` logue une erreur |

## Vérifier que cette liste est à jour

```bash
# 1. Les types réellement gérés par le template
grep -oE "field\.type === '[a-z_]+'" src/hbkthemes/Form/Form.vue | sed "s/field.type === //" | sort -u

# 2. Le contrôle automatique (échoue si le catalogue de tests diverge du template)
npm run test:unit -- src/tests/hbkthemes/Form/formFieldTypes.spec.ts
```

Si vous ajoutez un type, suivez la recette de [03-form-engine.md](03-form-engine.md#ajouter-un-type-de-champ)
et mettez cette page à jour dans le même changement.
