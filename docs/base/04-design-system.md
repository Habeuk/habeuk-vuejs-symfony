# 04 — Design system

## Typographie

- Police unique : **Manrope** (auto-hébergée, `src/fonts/manrope.css`).
- `--font-sans` et `--font-display` pointent toutes deux vers Manrope : les titres et le texte
  partagent la même famille, seuls les poids/tailles changent.
- Le `body` est en `text-sm` ; les titres de page utilisent `text-2xl sm:text-3xl font-extrabold`.

## Tokens (Tailwind v4)

Déclarés dans `src/assets/styles/theme.css` via `@theme`, donc utilisables comme classes
(`bg-primary-500`, `text-surface-600`, `rounded-card`, `shadow-card`…).

### Surfaces (fonds et texte neutre)

| Token | Valeur | Usage |
| --- | --- | --- |
| `surface-0` | `#ffffff` | Cartes, panneaux |
| `surface-50` | `#f6f7f2` | **Fond principal** de l'application |
| `surface-100` / `200` / `300` | `#eef0e8` / `#e2e5da` / `#c9cdbf` | Fonds secondaires, bordures |
| `surface-400` / `500` | `#9aa093` / `#6b7266` | Texte désactivé / secondaire |
| `surface-600` / `700` | `#4a4f46` / `#33372f` | Texte courant / titres |
| `surface-800` / `900` / `950` | `#1f231c` / `#12140f` / `#0a0b08` | Titres forts, texte, dark mode |

### Couleur de marque

| Token | Valeur |
| --- | --- |
| `primary-50` → `primary-950` | `#f0f9f1` … `#0f2a19` |
| `primary-500` | `#4caf6a` (**couleur de marque**) |

La même palette est répétée dans `src/theme/preset.js` (côté PrimeVue) : **les deux doivent rester
alignés**, sinon les composants PrimeVue et les classes Tailwind divergent.

### États et accents

- `accent-*` (pêche/abricot), `success-*`, `warning-*`, `info-*`, `danger-*` — toujours des nuances
  douces, jamais saturées.
- `macro-protein`, `macro-carbs`, `macro-fat`, `macro-fiber` : couleurs métier (graphiques).

### Rayons, ombres, transitions

| Token | Valeur |
| --- | --- |
| `rounded-sm` / `md` / `lg` / `xl` | `0.375rem` / `0.5rem` / `0.75rem` / `1rem` |
| `rounded-card` | `1rem` |
| `rounded-pill` | `999px` |
| `shadow-card` / `shadow-elevated` | ombres douces à deux niveaux |
| `--transition-fast` / `--transition-base` | `150ms` / `250ms` |

## Preset PrimeVue (`src/theme/preset.js`)

- Basé sur **Aura** (`@primeuix/themes`), surchargé avec la palette `primary` du projet.
- `colorScheme.light` / `dark` : couleur de marque, `contrastColor`, hover/active, `highlight`.
- Surcharges du composant `button` : variantes `primary` / `secondary` / `danger` et leurs déclinaisons
  `outlined` (le `secondary` reprend exactement `surface.0` / `surface.100` / `surface.200` / `surface.800`).

## Pont tokens ↔ PrimeVue (`src/assets/styles/primevue.css`)

Ce fichier évite de styler chaque champ individuellement :

| Règle | Effet |
| --- | --- |
| `.p-button { @apply text-base }` | Taille de police des boutons |
| `--hbk-field-padding-y/x: 0.75rem` | Padding des champs |
| `--hbk-field-radius: 10px` | Rayon des champs |
| `--hbk-button-radius: 10px` | Rayon des boutons |
| `.p-inputtext`, `.p-password input`, `.p-select`, `.p-textarea`, `.p-inputnumber input` | Appliquent padding/rayon/taille via les variables ci-dessus |

**Conséquence** : dans les templates, ne pas ajouter `px-3 py-1.5 rounded-md border border-gray-200`
sur un champ — c'est déjà piloté par ce fichier, et une classe en dur écrase le thème.

## Base et composants

- `src/assets/styles/base.css` : `body` (`bg-surface-50`, `text-sm`, `antialiased`), titres en
  `font-display`, liens en `primary-600`, `:focus-visible` en `outline-primary-500`, scrollbars
  discrètes, `::selection` en `primary-200`.
- `src/assets/styles/components.css` : `.card-base` (`rounded-card`, bordure `surface-200`, `shadow-sm`).

## Tailwind v4 — le piège du `@source`

`src/assets/main.css` :

```css
@import 'tailwindcss' source(none);
@source '../hbkthemes/';
@source '../views/';
@import 'tailwindcss-primeui';
@import '../fonts/manrope.css';
@import './styles/theme.css';
@import './styles/base.css';
@import './styles/components.css';
@import './styles/primevue.css';
```

Tailwind ne génère **que** les classes des dossiers déclarés. Toute nouvelle racine de code
(ou tout package externe contenant des templates) doit être ajoutée en `@source`, sinon les classes
disparaissent en production sans erreur.

## Icônes — lucide uniquement

`primeicons` **n'est pas installé** : les classes `pi pi-*` ne produisent rien. Utiliser
`@lucide/vue` :

```vue
import { Eye, Trash2 } from '@lucide/vue';
<Eye class="w-4 h-4" />
```

Tailles à utiliser (un SVG lucide fait 24 px par défaut, la taille doit être explicite) :

| Contexte | Classe |
| --- | --- |
| Icône de bouton / dans un champ / texte | `w-4 h-4` |
| Icône de barre d'outils | `w-5 h-5` |
| Icône de carte | `w-6 h-6` |
| Icône de mise en avant | `w-8 h-8` à `w-12 h-12` |
| État vide / illustration | `w-12 h-12` et plus |

Intégration dans PrimeVue :

- `Button` : slot `#icon` (`<template #icon><Plus class="w-4 h-4" /></template>`), pas de prop `icon`.
- `Message` : slot `#icon`.
- `Chip` : slot `#icon` (`<component :is="…" />` si l'icône vient d'un modèle).
- Le `gap` du preset Aura espace automatiquement l'icône et le libellé.

Les **valeurs venues du backend** (ex. `"pi pi-folder"`) sont traduites par
`src/configs/icons.ts` (`resolveMenuIcon`), avec repli sur `Folder`.

## Dark mode

Activé par la classe `.app-dark` (voir `darkModeSelector` dans `main.js`). Utiliser les variantes
`dark:` des tokens (`dark:bg-surface-900`, `dark:text-surface-0`), jamais des couleurs fixes.

## Règles de style (à respecter dans toute la base)

1. **Jamais de couleur hexadécimale en dur** dans un template : utiliser les tokens.
2. **Jamais de `pi pi-*`** : lucide + taille explicite.
3. **Pas de padding/rayon en dur sur un champ de formulaire** : `primevue.css` s'en charge.
4. Espacement par `space-y-*` (et surcharge via la prop `fieldsSpacing`), pas de marges isolées.
5. Les textes d'interface sont en français et sans jargon technique.

## Classes PrimeVue utiles (et stables) pour les tests

`.p-button`, `.p-inputtext`, `.p-select`, `.p-multiselect`, `.p-checkbox`, `.p-toggleswitch`,
`.p-password`, `.p-inputnumber`, `.p-textarea`, `.p-tree`, `.p-message`, `.p-fileupload`,
`.p-datatable`. Les tests s'appuient dessus (voir [06-testing.md](06-testing.md)).
