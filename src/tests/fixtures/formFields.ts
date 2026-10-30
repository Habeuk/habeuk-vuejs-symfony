import type { EntityFormFieldInterface } from '@/types';

/**
 * Catalogue de référence : un champ par type géré par Form.vue.
 *
 * Il sert de base commune :
 * - Form.spec.ts vérifie que chaque type produit bien son contrôle ;
 * - formFieldTypes.spec.ts vérifie que ce catalogue reste aligné avec le template du moteur
 *   (ajouter un type dans Form.vue sans fixture fait échouer les tests).
 *
 * Les valeurs reprennent la forme réellement envoyée par le backend
 * (voir EntityFormFieldInterface et la route /api/form/fields/{entity}/{action}).
 */
export const makeField = (
  overrides: Partial<EntityFormFieldInterface> & Pick<EntityFormFieldInterface, 'name' | 'type'>,
): EntityFormFieldInterface => ({
  label: `Champ ${overrides.name}`,
  required: false,
  placeholder: null,
  cardinality: 1,
  ...overrides,
});

export const fieldCatalogue: EntityFormFieldInterface[] = [
  makeField({ name: 'text_field', type: 'text', label: 'Texte', placeholder: 'Saisir une valeur' }),
  makeField({ name: 'email_field', type: 'email', label: 'Adresse e-mail', placeholder: 'vous@exemple.fr', maxlength: 180 }),
  makeField({ name: 'password_field', type: 'password', label: 'Mot de passe', placeholder: '••••••••' }),
  makeField({
    name: 'password_repeated_field',
    type: 'password_repeated',
    label: 'Mot de passe',
    firstLabel: 'Mot de passe',
    secondLabel: 'Confirmation du mot de passe',
  }),
  makeField({ name: 'textarea_field', type: 'textarea', label: 'Commentaire', rows: 4 }),
  makeField({ name: 'number_field', type: 'number', label: 'Quantité', scale: 2 }),
  makeField({ name: 'inputmask_field', type: 'inputmask', label: 'Téléphone', mask: '99 99 99 99 99', slotChar: '_' }),
  makeField({ name: 'select_field', type: 'select', label: 'Statut', options: [{ label: 'Actif', value: 'actif' }], filter: true }),
  makeField({ name: 'checkbox_field', type: 'checkbox', label: 'Accepter les conditions' }),
  makeField({ name: 'toggle_switch_field', type: 'toggle_switch', label: 'Activer le suivi' }),
  makeField({ name: 'tree_field', type: 'tree', label: 'Catégories', tree_data: [] }),
  makeField({
    name: 'checkboxes_field',
    type: 'checkboxes',
    label: 'Choix multiples',
    options: [
      { label: 'Sport', value: 'sport' },
      { label: 'Musique', value: 'musique' },
    ],
  }),
  makeField({
    name: 'multiselect_field',
    type: 'multiselect',
    label: 'Sélection multiple',
    options: [
      { label: 'Sport', value: 'sport' },
      { label: 'Musique', value: 'musique' },
    ],
  }),
  makeField({ name: 'entity_select_field', type: 'entity_select', label: 'Client' }),
  makeField({ name: 'entities_select_field', type: 'entities_select', label: 'Lignes associées' }),
  makeField({ name: 'file_upload_field', type: 'file_upload', label: 'Documents', multiple: true }),
  makeField({ name: 'textarea_ckeditor_field', type: 'textarea_ckeditor', label: 'Contenu', rows: 5 }),
  makeField({ name: 'textarea_tinymce_field', type: 'textarea_tinymce', label: 'Article', rows: 5 }),
  makeField({ name: 'textarea_primevue_field', type: 'textarea_primevue', label: 'Description' }),
  makeField({ name: 'submit_field', type: 'submit', label: 'Enregistrer' }),
];

/**
 * Types gérés par Form.vue mais absents de la conversion Symfony → zod
 * (ils tombent dans le `default` de ValidationForm et déclenchent un console.error).
 */
export const fieldTypesSansValidateur: string[] = ['inputmask', 'tree', 'password_repeated', 'textarea_primevue'];
