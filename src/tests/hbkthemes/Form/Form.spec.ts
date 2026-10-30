import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Form from '@/hbkthemes/Form/Form.vue';
import { useFormDataStore } from '@/stores/modules/formDataStore';
import { fieldCatalogue, makeField } from '@/tests/fixtures/formFields';
import type { EntityFormFieldInterface, violationFormInterface } from '@/types';

/**
 * Fabrique un composant factice rendu à la place des champs lourds.
 * (defineAsyncComponent charge leur vrai module : on isole le test du moteur.)
 * `__esModule` garantit que Vue déballe bien le `.default` du module simulé.
 */
const { stubField } = vi.hoisted(() => ({
  stubField: (name: string, testId: string) => async () => {
    const { h } = await import('vue');
    return { __esModule: true, default: { name, render: () => h('div', { 'data-test': testId }) } };
  },
}));

vi.mock('@/hbkthemes/views/Entity/fields/EntitySelect.vue', stubField('EntitySelect', 'entity-select'));
vi.mock('@/hbkthemes/views/Entity/fields/EntitiesSelect.vue', stubField('EntitiesSelect', 'entities-select'));
vi.mock('@/hbkthemes/views/Entity/fields/FilesUpload.vue', stubField('FilesUpload', 'files-upload'));
vi.mock('@/hbkthemes/Form/CKEditorTextarea.vue', stubField('CKEditorTextarea', 'ckeditor'));
vi.mock('@/hbkthemes/Form/TinyMceEditor.vue', stubField('TinyMceEditor', 'tinymce'));
vi.mock('primevue/editor', stubField('Editor', 'primevue-editor'));

/** Tout contrôle réellement rendu : champ natif, bouton ou composant PrimeVue. */
const CONTROL_SELECTOR = 'input, textarea, button, .p-select, .p-multiselect, .p-tree, [data-test]';

const FORM_KEY = 'customer-create';

type MountOptions = {
  values?: Record<string, unknown>;
  manageCollection?: boolean;
  fieldsSpacing?: string;
};

const mountForm = (fields: EntityFormFieldInterface[], options: MountOptions = {}) => {
  const store = useFormDataStore();
  // Form.vue lit ses valeurs via formData.getFormData(), qui lève une erreur si la clé
  // n'existe pas : le formulaire doit être pré-enregistré avant le montage.
  store.setFormData(FORM_KEY, { ...(options.values ?? {}) });

  const wrapper = mount(Form, {
    props: {
      formKey: FORM_KEY,
      formFields: fields,
      loading: false,
      ...(options.manageCollection !== undefined ? { manageCollection: options.manageCollection } : {}),
      ...(options.fieldsSpacing !== undefined ? { fieldsSpacing: options.fieldsSpacing } : {}),
    },
  });

  return { wrapper, store };
};

/**
 * Types dont le libellé est rendu par le composant enfant (EntitySelect, EntitiesSelect,
 * FilesUpload, éditeurs) et non par Form.vue : la présence du libellé est vérifiée par les
 * tests dédiés à ces composants, pas par la boucle générique.
 */
const TYPES_LABEL_ENFANT = ['entity_select', 'entities_select', 'file_upload', 'textarea_ckeditor', 'textarea_tinymce'];

describe('Form.vue — rendu par type de champ', () => {
  for (const field of fieldCatalogue) {
    it(`rend le champ de type ${field.type}`, async () => {
      const { wrapper } = mountForm([field], { values: { [field.name]: null } });
      await flushPromises();

      expect(wrapper.find('.field').exists()).toBe(true);

      if (!TYPES_LABEL_ENFANT.includes(field.type)) {
        expect(wrapper.text()).toContain(field.label);
      }

      expect(wrapper.find(CONTROL_SELECTOR).exists()).toBe(true);
    });
  }
});

describe('Form.vue — transmission des props du champ', () => {
  it('transmet type, placeholder et maxlength, et affiche l’astérisque des champs requis', async () => {
    const field = makeField({
      name: 'email_field',
      type: 'email',
      label: 'Adresse e-mail',
      placeholder: 'vous@exemple.fr',
      maxlength: 180,
      required: true,
    });
    const { wrapper } = mountForm([field], { values: { email_field: '' } });
    await flushPromises();

    const input = wrapper.find('input');
    expect(input.attributes('type')).toBe('email');
    expect(input.attributes('placeholder')).toBe('vous@exemple.fr');
    expect(input.attributes('maxlength')).toBe('180');
    expect(wrapper.find('.text-danger-500').text()).toBe('*');
  });

  it('applique rows au textarea', async () => {
    const field = makeField({ name: 'textarea_field', type: 'textarea', label: 'Commentaire', rows: 7 });
    const { wrapper } = mountForm([field], { values: { textarea_field: '' } });
    await flushPromises();

    expect(wrapper.find('textarea').attributes('rows')).toBe('7');
  });

  it('rend un InputNumber pour le type number', async () => {
    const field = makeField({ name: 'number_field', type: 'number', label: 'Quantité', scale: 2 });
    const { wrapper } = mountForm([field], { values: { number_field: 2 } });
    await flushPromises();

    expect(wrapper.find('.p-inputnumber').exists()).toBe(true);
  });

  it('rend un champ masqué pour le type password', async () => {
    const field = makeField({ name: 'password_field', type: 'password', label: 'Mot de passe' });
    const { wrapper } = mountForm([field], { values: { password_field: '' } });
    await flushPromises();

    expect(wrapper.find('.p-password').exists()).toBe(true);
    expect(wrapper.find('input').attributes('type')).toBe('password');
  });

  it('rend les deux champs du type password_repeated', async () => {
    const field = makeField({
      name: 'password_repeated_field',
      type: 'password_repeated',
      label: 'Mot de passe',
      firstLabel: 'Mot de passe',
      secondLabel: 'Confirmation du mot de passe',
    });
    const { wrapper } = mountForm([field], { values: { password_repeated_field_first: '', password_repeated_field_second: '' } });
    await flushPromises();

    expect(wrapper.findAll('input[type="password"]')).toHaveLength(2);
    expect(wrapper.text()).toContain('Confirmation du mot de passe');
  });

  it('rend un Select pour le type select', async () => {
    const field = makeField({ name: 'select_field', type: 'select', label: 'Statut', options: [{ label: 'Actif', value: 'actif' }] });
    const { wrapper } = mountForm([field], { values: { select_field: null } });
    await flushPromises();

    expect(wrapper.find('.p-select').exists()).toBe(true);
  });

  it('rend une case à cocher par option pour le type checkboxes et alimente le formulaire', async () => {
    const field = makeField({
      name: 'checkboxes_field',
      type: 'checkboxes',
      label: 'Choix multiples',
      options: [
        { label: 'Sport', value: 'sport' },
        { label: 'Musique', value: 'musique' },
      ],
    });
    const { wrapper, store } = mountForm([field], { values: { checkboxes_field: [] } });
    await flushPromises();

    expect(wrapper.findAll('.p-checkbox')).toHaveLength(2);
    expect(wrapper.text()).toContain('Sport');
    expect(wrapper.text()).toContain('Musique');

    await wrapper.findAll('input[type="checkbox"]')[0].setValue(true);

    expect(store.getValueInFormData(FORM_KEY, 'checkboxes_field')).toEqual(['sport']);
  });

  it('rend un MultiSelect pour le type multiselect', async () => {
    const field = makeField({
      name: 'multiselect_field',
      type: 'multiselect',
      label: 'Sélection multiple',
      options: [
        { label: 'Sport', value: 'sport' },
        { label: 'Musique', value: 'musique' },
      ],
    });
    const { wrapper } = mountForm([field], { values: { multiselect_field: [] } });
    await flushPromises();

    expect(wrapper.find('.p-multiselect').exists()).toBe(true);
    expect(wrapper.text()).toContain('Sélection multiple');
  });

  it('rend une case à cocher pour le type checkbox', async () => {
    const field = makeField({ name: 'checkbox_field', type: 'checkbox', label: 'Accepter les conditions', required: true });
    const { wrapper } = mountForm([field], { values: { checkbox_field: false } });
    await flushPromises();

    expect(wrapper.find('.p-checkbox').exists()).toBe(true);
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Accepter les conditions');
  });

  it('rend un interrupteur pour le type toggle_switch', async () => {
    const field = makeField({ name: 'toggle_switch_field', type: 'toggle_switch', label: 'Activer le suivi' });
    const { wrapper } = mountForm([field], { values: { toggle_switch_field: false } });
    await flushPromises();

    expect(wrapper.find('.p-toggleswitch').exists()).toBe(true);
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  it('rend un arbre pour le type tree', async () => {
    const field = makeField({ name: 'tree_field', type: 'tree', label: 'Catégories', tree_data: [] });
    const { wrapper } = mountForm([field], { values: { tree_field: null } });
    await flushPromises();

    expect(wrapper.find('.p-tree').exists()).toBe(true);
  });

  it('rend le composant dédié pour les champs d’entités et les éditeurs', async () => {
    const cases: Array<[EntityFormFieldInterface, string]> = [
      [makeField({ name: 'entity_select_field', type: 'entity_select', label: 'Client' }), 'entity-select'],
      [makeField({ name: 'entities_select_field', type: 'entities_select', label: 'Lignes' }), 'entities-select'],
      [makeField({ name: 'file_upload_field', type: 'file_upload', label: 'Documents' }), 'files-upload'],
      [makeField({ name: 'ckeditor_field', type: 'textarea_ckeditor', label: 'Contenu' }), 'ckeditor'],
      [makeField({ name: 'tinymce_field', type: 'textarea_tinymce', label: 'Article' }), 'tinymce'],
      [makeField({ name: 'editor_field', type: 'textarea_primevue', label: 'Description' }), 'primevue-editor'],
    ];

    for (const [field, testId] of cases) {
      const { wrapper } = mountForm([field], { values: { [field.name]: null } });
      await flushPromises();

      expect(wrapper.find(`[data-test="${testId}"]`).exists()).toBe(true);
    }
  });
});

describe('Form.vue — espacement des champs', () => {
  const fields = [makeField({ name: 'lastname', type: 'text', label: 'Nom' })];

  it('applique space-y-6 par défaut sur le conteneur des champs', async () => {
    const { wrapper } = mountForm(fields, { values: { lastname: '' } });
    await flushPromises();

    expect(wrapper.find('form').classes()).toContain('p-fluid');
    expect(wrapper.find('form').classes()).toContain('space-y-6');
  });

  it('permet de surcharger l’espacement via fieldsSpacing', async () => {
    const { wrapper } = mountForm(fields, { values: { lastname: '' }, fieldsSpacing: 'space-y-2' });
    await flushPromises();

    expect(wrapper.find('form').classes()).toContain('space-y-2');
    expect(wrapper.find('form').classes()).not.toContain('space-y-6');
  });
});

describe('Form.vue — erreurs renvoyées par le serveur', () => {
  it('affiche les violations de l’API sous le champ concerné', async () => {
    const field = makeField({ name: 'email_field', type: 'email', label: 'Adresse e-mail' });
    const { wrapper } = mountForm([field], { values: { email_field: 'invalide' } });
    await flushPromises();

    expect(wrapper.find('small').exists()).toBe(false);

    const violation: violationFormInterface = {
      parameters: {},
      propertyPath: 'email_field',
      title: 'Adresse e-mail invalide',
      template: '{{ value }}',
    };
    await wrapper.setProps({ request_error: { data: { form_errors: { violations: [violation] } } } });
    await flushPromises();

    expect(wrapper.find('small').text()).toBe('Adresse e-mail invalide');
  });
});

describe('Form.vue — contrat du bouton de soumission', () => {
  const fields: EntityFormFieldInterface[] = [
    makeField({ name: 'lastname', type: 'text', label: 'Nom', required: true }),
    makeField({ name: 'save', type: 'submit', label: 'Enregistrer' }),
  ];

  it('expose name="submit_action" et value="nothing" quand manageCollection est inactif', async () => {
    const { wrapper } = mountForm(fields, { values: { lastname: 'Dupont' } });
    await flushPromises();

    const button = wrapper.find('button[type="submit"]');
    expect(button.exists()).toBe(true);
    expect(button.attributes('name')).toBe('submit_action');
    expect(button.attributes('value')).toBe('nothing');
    expect(button.text()).toContain('Enregistrer');
  });

  it('propose les actions edit et collection quand manageCollection est actif', async () => {
    const { wrapper } = mountForm(fields, { values: { lastname: 'Dupont' }, manageCollection: true });
    await flushPromises();

    const values = wrapper.findAll('button[type="submit"]').map((button) => button.attributes('value'));
    expect(values).toEqual(['edit', 'collection']);
    expect(wrapper.text()).toContain('Retourner à la liste');
  });
});

describe('Form.vue — soumission', () => {
  it('émet submit_form avec les données du formulaire', async () => {
    const fields = [makeField({ name: 'lastname', type: 'text', label: 'Nom', required: true })];
    const { wrapper } = mountForm(fields, { values: { lastname: 'Dupont' } });
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    // @primevue/forms valide de façon asynchrone avant d'émettre.
    await flushPromises();

    const emitted = wrapper.emitted('submit_form');
    expect(emitted).toHaveLength(1);
    expect(emitted?.[0]?.[0]).toMatchObject({ formData: { lastname: 'Dupont' } });
  });
});
