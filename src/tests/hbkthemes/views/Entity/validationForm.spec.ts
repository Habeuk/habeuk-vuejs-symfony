import { afterEach, describe, expect, it, vi } from 'vitest';
import { ValidationForm } from '@/hbkthemes/views/Entity/validationForm';
import { fieldTypesSansValidateur, makeField } from '@/tests/fixtures/formFields';
import type { EntityFormFieldInterface } from '@/types';

/**
 * Conversion des validations Symfony en schéma zod.
 * C'est le point de passage de tous les formulaires : une règle mal convertie
 * laisse passer des données invalides (ou bloque des données valides) partout.
 */
const buildSchema = (fields: EntityFormFieldInterface[]) => new ValidationForm(fields).convertSymfonyValidationToZod();

/** Raccourci : une règle de validation Symfony. */
const rule = (type: string, message = 'Message de validation') => ({ type, message });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ValidationForm — construction du schéma', () => {
  it('crée une clé de schéma pour chaque type de champ géré', () => {
    const schema = buildSchema([
      makeField({ name: 'title', type: 'text' }),
      makeField({ name: 'quantity', type: 'number' }),
      makeField({ name: 'email', type: 'email' }),
      makeField({ name: 'status', type: 'select', options: [] }),
      makeField({ name: 'active', type: 'toggle_switch' }),
    ]);

    expect(Object.keys(schema.shape).sort()).toEqual(['active', 'email', 'quantity', 'status', 'title']);
  });

  it('ignore les types sans validateur sans signaler d’erreur', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const schema = buildSchema([
      makeField({ name: 'save', type: 'submit' }),
      makeField({ name: 'customer', type: 'entity_select' }),
      makeField({ name: 'lines', type: 'entities_select' }),
      makeField({ name: 'terms', type: 'checkbox' }),
      makeField({ name: 'document', type: 'file_upload' }),
    ]);

    expect(Object.keys(schema.shape)).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('signale un type inconnu et ne le valide pas', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const schema = buildSchema([makeField({ name: 'mystere', type: 'type_inexistant' })]);

    expect(Object.keys(schema.shape)).toEqual([]);
    expect(consoleError).toHaveBeenCalledOnce();
    expect(String(consoleError.mock.calls[0]?.[0])).toContain('type_inexistant');
  });
});

describe('ValidationForm — champ texte', () => {
  it('exige une valeur non vide quand la validation required est présente', () => {
    const schema = buildSchema([
      makeField({ name: 'title', type: 'text', required: false, validations: { required: rule('required', 'Le titre est obligatoire') } }),
    ]);

    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ title: '' }).success).toBe(false);
    expect(schema.safeParse({ title: 'Bonjour' }).success).toBe(true);
  });

  it('accepte undefined, null et une chaîne quand le champ est optionnel', () => {
    const schema = buildSchema([makeField({ name: 'title', type: 'text' })]);

    expect(schema.safeParse({ title: undefined }).success).toBe(true);
    expect(schema.safeParse({ title: null }).success).toBe(true);
    expect(schema.safeParse({ title: 'Bonjour' }).success).toBe(true);
    expect(schema.safeParse({ title: 12 }).success).toBe(false);
  });

  it('applique length.min et length.max avec leurs messages dédiés', () => {
    const schema = buildSchema([
      makeField({
        name: 'code',
        type: 'text',
        validations: {
          length: { type: 'length', message: '', min: 3, max: 5, minMessage: 'Au moins 3 caractères', maxMessage: 'Au plus 5 caractères' },
        },
      }),
    ]);

    const tropCourt = schema.safeParse({ code: 'ab' });
    expect(tropCourt.success).toBe(false);
    expect(tropCourt.error?.issues[0]?.message).toBe('Au moins 3 caractères');

    const tropLong = schema.safeParse({ code: 'abcdef' });
    expect(tropLong.success).toBe(false);
    expect(tropLong.error?.issues[0]?.message).toBe('Au plus 5 caractères');

    expect(schema.safeParse({ code: 'abcd' }).success).toBe(true);
  });

  it('n’ajoute pas de min(1) quand length.min est déjà défini (required + length)', () => {
    const schema = buildSchema([
      makeField({
        name: 'code',
        type: 'text',
        required: false,
        validations: {
          required: rule('required', 'Champ obligatoire'),
          length: { type: 'length', message: '', min: 3, minMessage: 'Au moins 3 caractères' },
        },
      }),
    ]);

    const result = schema.safeParse({ code: 'ab' });
    expect(result.success).toBe(false);
    // Le message de length doit gagner : zod n'accepte pas deux .min() sur le même schéma.
    expect(result.error?.issues[0]?.message).toBe('Au moins 3 caractères');
  });

  it('convertit un pattern Symfony délimité en expression régulière', () => {
    const schema = buildSchema([
      makeField({ name: 'code', type: 'text', validations: { regex: { type: 'regex', message: 'Trois chiffres attendus', pattern: '/^\\d{3}$/' } } }),
    ]);

    expect(schema.safeParse({ code: '123' }).success).toBe(true);

    const invalide = schema.safeParse({ code: 'abc' });
    expect(invalide.success).toBe(false);
    expect(invalide.error?.issues[0]?.message).toBe('Trois chiffres attendus');
  });
});

describe('ValidationForm — champ email', () => {
  it('refuse une adresse invalide et accepte une adresse valide', () => {
    const schema = buildSchema([
      makeField({ name: 'email', type: 'email', required: false, validations: { required: rule('required', 'Adresse obligatoire') } }),
    ]);

    expect(schema.safeParse({ email: 'pas-un-email' }).success).toBe(false);
    expect(schema.safeParse({ email: 'marie@exemple.fr' }).success).toBe(true);
  });

  it('reste optionnel sans validation required', () => {
    const schema = buildSchema([makeField({ name: 'email', type: 'email' })]);

    expect(schema.safeParse({ email: undefined }).success).toBe(true);
    expect(schema.safeParse({ email: null }).success).toBe(true);
  });
});

describe('ValidationForm — champ number', () => {
  it('accepte un nombre et refuse une chaîne (aucune coercition)', () => {
    const schema = buildSchema([
      makeField({ name: 'quantity', type: 'number', required: false, validations: { required: rule('required', 'Quantité obligatoire') } }),
    ]);

    expect(schema.safeParse({ quantity: 12 }).success).toBe(true);
    expect(schema.safeParse({ quantity: '12' }).success).toBe(false);
  });

  it('reste optionnel sans validation required', () => {
    const schema = buildSchema([makeField({ name: 'quantity', type: 'number' })]);

    expect(schema.safeParse({ quantity: undefined }).success).toBe(true);
    expect(schema.safeParse({ quantity: null }).success).toBe(true);
  });
});

describe('ValidationForm — champs booléens', () => {
  it('accepte un booléen et refuse une chaîne', () => {
    const schema = buildSchema([
      makeField({ name: 'active', type: 'toggle_switch', required: false, validations: { required: rule('required', 'Champ obligatoire') } }),
    ]);

    expect(schema.safeParse({ active: true }).success).toBe(true);
    expect(schema.safeParse({ active: false }).success).toBe(true);
    expect(schema.safeParse({ active: 'oui' }).success).toBe(false);
  });

  it('reste optionnel sans validation required (type boolean)', () => {
    const schema = buildSchema([makeField({ name: 'active', type: 'boolean' })]);

    expect(schema.safeParse({ active: undefined }).success).toBe(true);
    expect(schema.safeParse({ active: null }).success).toBe(true);
  });
});

describe('ValidationForm — champ select', () => {
  it('valide une chaîne quand aucune contrainte numérique n’est déclarée', () => {
    const schema = buildSchema([
      makeField({ name: 'status', type: 'select', options: [], required: false, validations: { required: rule('required', 'Statut obligatoire') } }),
    ]);

    expect(schema.safeParse({ status: 'actif' }).success).toBe(true);
    expect(schema.safeParse({ status: 12 }).success).toBe(false);
  });

  it('bascule sur un nombre avec la validation positive', () => {
    const schema = buildSchema([
      makeField({ name: 'amount', type: 'select', options: [], validations: { positive: rule('positive', 'Montant positif attendu') } }),
    ]);

    expect(schema.safeParse({ amount: 10 }).success).toBe(true);
    expect(schema.safeParse({ amount: -1 }).success).toBe(false);
    expect(schema.safeParse({ amount: undefined }).success).toBe(true);
  });

  it('bascule sur un nombre positif ou nul avec la validation positive_or_zero', () => {
    const schema = buildSchema([
      makeField({ name: 'amount', type: 'select', options: [], validations: { positive_or_zero: rule('positive_or_zero') } }),
    ]);

    expect(schema.safeParse({ amount: 0 }).success).toBe(true);
    expect(schema.safeParse({ amount: 12 }).success).toBe(true);
    expect(schema.safeParse({ amount: -1 }).success).toBe(false);
  });
});

describe('ValidationForm — champs à choix multiples (checkboxes / multiselect)', () => {
  for (const type of ['checkboxes', 'multiselect']) {
    it(`exige au moins une valeur quand le champ ${type} est requis`, () => {
      const schema = buildSchema([
        makeField({
          name: 'choices',
          type,
          options: [{ label: 'Sport', value: 'sport' }],
          required: false,
          validations: { required: rule('required', 'Choisissez au moins une valeur') },
        }),
      ]);

      const vide = schema.safeParse({ choices: [] });
      expect(vide.success).toBe(false);
      expect(vide.error?.issues[0]?.message).toBe('Choisissez au moins une valeur');

      expect(schema.safeParse({ choices: ['sport'] }).success).toBe(true);
      expect(schema.safeParse({ choices: undefined }).success).toBe(false);
    });

    it(`reste optionnel sans validation required (${type})`, () => {
      const schema = buildSchema([makeField({ name: 'choices', type, options: [] })]);

      expect(schema.safeParse({ choices: undefined }).success).toBe(true);
      expect(schema.safeParse({ choices: null }).success).toBe(true);
      expect(schema.safeParse({ choices: [] }).success).toBe(true);
      expect(schema.safeParse({ choices: 'sport' }).success).toBe(false);
    });
  }
});

describe('ValidationForm — effet de bord assumé sur field.required', () => {
  it('passe required à true sur le champ d’origine quand une validation required existe', () => {
    const field = makeField({ name: 'title', type: 'text', required: false, validations: { required: rule('required') } });

    buildSchema([field]);

    // Form.vue s'appuie sur ce champ pour activer/désactiver le bouton de soumission.
    expect(field.required).toBe(true);
  });

  it('laisse required à false sans validation required', () => {
    const field = makeField({ name: 'title', type: 'text', required: false, validations: { length: { type: 'length', message: '', min: 2 } } });

    buildSchema([field]);

    expect(field.required).toBe(false);
  });
});

describe('ValidationForm — types sans validateur dédié (écart connu)', () => {
  for (const type of fieldTypesSansValidateur) {
    it(`signale le type ${type} via console.error et ne le valide pas`, () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const schema = buildSchema([makeField({ name: 'champ', type })]);

      expect(Object.keys(schema.shape)).toEqual([]);
      expect(consoleError).toHaveBeenCalledOnce();
    });
  }

  it.todo('couvrir ces types par une conversion dédiée (aujourd’hui ils ne sont pas validés côté client)');
});
