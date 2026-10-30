import { describe, expect, it } from 'vitest';
import { useFormDataStore } from '@/stores/modules/formDataStore';

/**
 * État partagé de tous les formulaires : les données sont indexées par clé de formulaire
 * (`customer-create`, `customer-edit-12`). Une fuite entre deux clés casserait
 * silencieusement tous les formulaires de l'application.
 *
 * Le Pinia actif est recréé avant chaque test par vitest.setup.js.
 */
describe('useFormDataStore — clé de formulaire', () => {
  it('construit une clé de création quand l’identifiant est null', () => {
    const store = useFormDataStore();

    expect(store.createFormKey('customer', null)).toBe('customer-create');
  });

  it('construit une clé d’édition quand l’identifiant est un nombre fini', () => {
    const store = useFormDataStore();

    expect(store.createFormKey('customer', 12)).toBe('customer-edit-12');
    expect(store.createFormKey('customer', 0)).toBe('customer-edit-0');
  });

  it('refuse un identifiant absent ou non numérique', () => {
    const store = useFormDataStore();

    expect(() => store.createFormKey('customer', undefined)).toThrow('Invalid id: undefined');
    expect(() => store.createFormKey('customer', Number.NaN)).toThrow('Invalid id: NaN');
  });
});

describe('useFormDataStore — lecture et écriture', () => {
  it('enregistre et relit les données complètes d’un formulaire', () => {
    const store = useFormDataStore();

    store.setFormData('customer-create', { name: 'Marie' });

    expect(store.getFormData('customer-create')).toEqual({ name: 'Marie' });
  });

  it('lève une erreur pour une clé inconnue', () => {
    const store = useFormDataStore();

    expect(() => store.getFormData('customer-create')).toThrow('Form data not found for key: customer-create');
  });

  it('fusionne les nouvelles valeurs sans écraser les autres', () => {
    const store = useFormDataStore();
    store.setFormData('customer-create', { name: 'Marie', city: 'Lyon' });

    store.mergeFormData('customer-create', { city: 'Paris' });

    expect(store.getFormData('customer-create')).toEqual({ name: 'Marie', city: 'Paris' });
  });

  it('refuse de fusionner sur une clé inconnue', () => {
    const store = useFormDataStore();

    expect(() => store.mergeFormData('customer-create', { name: 'Marie' })).toThrow('Form data not found for key: customer-create');
  });

  it('écrit et relit la valeur d’un seul champ', () => {
    const store = useFormDataStore();
    store.setFormData('customer-create', { name: 'Marie' });

    store.setValueInFormData('customer-create', 'name', 'Paul');

    expect(store.getValueInFormData('customer-create', 'name')).toBe('Paul');
    expect(store.getFormData('customer-create')).toEqual({ name: 'Paul' });
  });
});

describe('useFormDataStore — isolation entre formulaires', () => {
  it('ne partage pas la valeur d’un même champ entre deux clés', () => {
    const store = useFormDataStore();
    store.setFormData('customer-create', { name: 'Marie' });
    store.setFormData('customer-edit-12', { name: 'Paul' });

    store.setValueInFormData('customer-create', 'name', 'Sophie');

    expect(store.getValueInFormData('customer-create', 'name')).toBe('Sophie');
    expect(store.getValueInFormData('customer-edit-12', 'name')).toBe('Paul');
  });

  it('ne supprime que le formulaire ciblé', () => {
    const store = useFormDataStore();
    store.setFormData('customer-create', { name: 'Marie' });
    store.setFormData('customer-edit-12', { name: 'Paul' });

    store.removeFormData('customer-create');

    expect(store.formDatas['customer-create']).toBeUndefined();
    expect(store.getFormData('customer-edit-12')).toEqual({ name: 'Paul' });
  });
});

describe('useFormDataStore — handler dédié (form)', () => {
  it('expose les opérations liées à sa propre clé', () => {
    const store = useFormDataStore();
    store.setFormData('customer-create', { name: 'Marie' });
    const handler = store.form('customer-create');

    expect(handler.getValue('name')).toBe('Marie');

    handler.setValue('name', 'Paul');
    expect(handler.getValue('name')).toBe('Paul');
    expect(store.getValueInFormData('customer-create', 'name')).toBe('Paul');

    handler.mergeFormData({ city: 'Lyon' });
    expect(handler.getFormData()).toEqual({ name: 'Paul', city: 'Lyon' });

    handler.setFormData({ name: 'Sophie' });
    expect(store.getFormData('customer-create')).toEqual({ name: 'Sophie' });

    handler.remove();
    expect(store.formDatas['customer-create']).toBeUndefined();
  });

  it('n’écrit pas dans les autres formulaires', () => {
    const store = useFormDataStore();
    store.setFormData('customer-create', { name: 'Marie' });
    store.setFormData('customer-edit-12', { name: 'Paul' });

    store.form('customer-create').setValue('name', 'Sophie');

    expect(store.getValueInFormData('customer-edit-12', 'name')).toBe('Paul');
  });

  it('rend un model compatible v-model, en lecture comme en écriture', () => {
    const store = useFormDataStore();
    store.setFormData('customer-create', { name: 'Marie' });
    const model = store.form('customer-create').model('name');

    expect(model.value).toBe('Marie');

    model.value = 'Paul';

    expect(model.value).toBe('Paul');
    expect(store.formDatas['customer-create']).toEqual({ name: 'Paul' });
  });
});
