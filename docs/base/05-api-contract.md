# 05 — Contrat d'API

Le frontend consomme une API JSON fournie par un backend Symfony. Toutes les URL ci-dessous sont
relatives à la racine de l'API (`/api/...`), servie par le même domaine en production et par le proxy
Vite en développement.

## Authentification

| Méthode | URL | Corps | Réponse |
| --- | --- | --- | --- |
| `POST` | `/api/login_check` | `{ email, password, rememberMe }` | `{ token, user }` |
| `GET` | `/api/user/me` | — | `{ user }` |
| `POST` | `/api/user/register` | données de l'entité `UserAnonymousUser` | entité créée |
| `POST` | `/auth/refresh` | `{ refresh_token }` | `{ access_token \| token, refresh_token? }` |

- Le **token d'accès** est gardé en mémoire (`tokenService`, `rootAxios`) et injecté dans les requêtes
  par `basic_axios` ; le **refresh token** est stocké en `localStorage`.
- Deux mécanismes coexistent pour les 401 :
  - `rootAxios` (module) : `installAuthRefresh` rafraîchit le token et notifie « session expirée » ;
  - `authStore` (module) : un intercepteur redirige vers `/login?redirect=…` si le backend répond
    `code: 401` avec `JWT Token not found` / `Expired JWT Token`.
  Toute évolution de l'authentification doit traiter les deux.

## Formulaires et définitions

| Méthode | URL | Réponse |
| --- | --- | --- |
| `GET` | `/api/form/available` | liste des entités du menu : `[{ entity, label, icon, badge?, display, actions }]` |
| `GET` | `/api/form/fields/{entity}/{action}` | `{ schema: { fields: EntityFormFieldInterface[] }, formData: { … } }` |
| `GET` | `/api/form-fields/UserAnonymousUser/create` | même forme (cas particulier de l'inscription) |
| `GET` | `/api/form/definition/{entity}` | `{ columns, entity_config, enums }` |

- `{action}` vaut `create` ou `edit`.
- `icon` dans `/api/form/available` est une **classe PrimeVue héritée** (`"pi pi-folder"`) : elle est
  traduite côté front par `resolveMenuIcon()` (voir [04-design-system.md](04-design-system.md)).
- `formData` fournit les valeurs par défaut du formulaire ; `entity_select` reçoit en plus `{ id: null }`.

## CRUD d'entité

| Méthode | URL | Corps | Réponse |
| --- | --- | --- | --- |
| `POST` | `/api/crud/entity/save/{entity}` | données du formulaire | entité sauvegardée (dans `response.data`) |
| `GET` | `/api/crud/entity/load-edit/{entity}/{id}` | — | entité complète |
| `DELETE` | `/api/crud/entity/delete/{entity}/{id}` | — | — |
| `POST` | `/api/crud/entity/duplicate/{entity}/{id}` | — | entité dupliquée |
| `GET` | `/api/crud/search/{entity}` | query `q`, `search_fields`, `display_fields` | `Array<{ id, … }>` |

`/{entity}` est le nom technique de l'entité (ex. `Customer`, `Invoice`) ; `UserAnonymousUser` est un
cas spécial (publication via `/api/user/register`).

## Listes paginées

| Méthode | URL | Query |
| --- | --- | --- |
| `GET` | `/api/entity-collection/{entity}/{page}/{limit}` | `sorts`, `filters`, `search` (JSON, voir ci-dessous) |

Réponse attendue (`src/types/index.ts` → `collection`) :

```ts
{
  items: BaseEntityView[],
  total: number,
  page: number,
  limit: number,
  totalPages: number,
  hasNextPage: boolean,
  hasPreviousPage: boolean,
  from: number,
  to: number
}
```

Formats de query, produits par `services/QueryBuilder.ts` :

```jsonc
// sorts
[{ "fieldname": "name", "order": "asc" }]
// filters
[{ "fieldname": "status", "operator": "=", "value": "actif" }]
// operators : "=", "like", ">", "<", ">=", "<=", "in"
// search
"marie"
```

Points d'attention :

- Si aucun tri n'est fourni, un tri par défaut `id desc` est ajouté. `collectionsStore` l'envoie
  actuellement sous la forme `{ fieldname: "id", operator: "desc" }` alors que `QueryBuilder` utilise
  `order` — incohérence documentée dans [07-known-quirks.md](07-known-quirks.md#3-incohérence-order--operator-sur-les-listes).
- La pagination par défaut vient de `appConfig` (`default_page: 1`, `load_per_page: 30`).

## Configurations et fichiers

| Méthode | URL | Rôle |
| --- | --- | --- |
| `GET` | `/api/settings/crud/load-company-config/{configKey}` | configuration d'affichage d'une entité |
| `POST` | `/api/settings/crud/save-company-config/` | enregistrement de cette configuration |
| `POST` | `/api/file/upload` | envoi d'un fichier (multipart, progression disponible) |
| `DELETE` | `/api/file/delete/{fid}` | suppression d'un fichier |
| `GET` | `/api/file/load/{id}` | `{ name, size, url_default, fid }` d'un fichier existant |
| `POST` | `/api/image/upload` | envoi d'image (éditeurs de contenu) |

## Format des erreurs

Le transport rejette avec une enveloppe de la forme :

```ts
{ error: { status: number, statusText: string, data: { error?: string, form_errors?: … } } }
```

Côté formulaire, les violations de validation sont attendues dans :

```jsonc
{
  "error": {
    "data": {
      "form_errors": {
        "violations": [
          {
            "propertyPath": "email",          // = field.name
            "title": "Adresse e-mail invalide",
            "parameters": {},
            "template": "{{ value }}"
          }
        ]
      }
    }
  }
}
```

`Form.vue` mappe `propertyPath → errors[field]` et affiche `title` sous le champ concerné.

## Types de champs émis par le backend

Source : `FieldMapperPrimeVue::mapFormTypeToPrimeVue()` (backend Symfony).

| Type Symfony | Type front |
| --- | --- |
| `TextType`, `UrlType` | `text` |
| `EmailType` | `email` |
| `PasswordType` | `password` |
| `RepeatedType` | `password_repeated` |
| `TextareaType` | `textarea` |
| `ChoiceType` | `select` |
| `NumberType` | `number` |
| `CheckboxType` | `toggle_switch` |
| `SubmitType` | `submit` |
| `EntitySelectType` | `entity_select` |
| `TreeType` | `tree` |
| `TelType` | `inputmask` |
| `FileType` | `file_upload` |
| `EntityCollectionType` | `entities_select` |
| `JsonEditorType` | `form_json` |
| *autre* | la valeur Symfony telle quelle (`default`) |

Deux conséquences pour le socle :

- Un type non listé côté front (ex. `form_json`) **ne s'affiche pas** ; un type Symfony non mappé non
  plus.
- Un type peut être forcé depuis la définition du formulaire via l'attribut `data-primevui`
  (ex. `data-primevui="multiselect"`), ce qui permet d'utiliser les types front non émis par le mapper
  (`multiselect`, `checkboxes`, `textarea_*`).

## Règles de contrat

1. **Ne jamais renommer un champ existant** sans coordination backend : `name` est la clé des données.
2. Toute évolution du format des champs doit être répercutée dans `EntityFormFieldInterface`
   (`src/types/index.ts`) **et** dans les fixtures de tests.
3. Les listes et les formulaires partagent la même notion d'entité : `entityName` = nom technique.
