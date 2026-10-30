import { describe, expect, it } from 'vitest';
import { fieldCatalogue } from '@/tests/fixtures/formFields';
import formSource from '@/hbkthemes/Form/Form.vue?raw';

/**
 * Contrat entre le template du moteur et le catalogue de tests.
 *
 * Ajouter (ou renommer) un type de champ dans Form.vue sans mettre à jour
 * src/tests/fixtures/formFields.ts fait échouer ce fichier : c'est volontaire,
 * un type sans fixture est un type sans test.
 *
 * Le template est lu via l'import brut Vite (`?raw`) : `import.meta.url` n'est pas
 * une URL `file:` dans l'environnement jsdom de Vitest.
 */
const templateTypes = [...new Set([...formSource.matchAll(/field\.type === '([a-z_]+)'/g)].map((match) => match[1]))].sort();
const catalogueTypes = [...new Set(fieldCatalogue.map((field) => field.type))].sort();

describe('contrat des types de champs (Form.vue ↔ catalogue de tests)', () => {
  it('le template du moteur gère bien des types de champs', () => {
    expect(templateTypes.length).toBeGreaterThan(0);
  });

  it('le catalogue couvre exactement les types du template (ni manquant, ni orphelin)', () => {
    expect(catalogueTypes).toEqual(templateTypes);
  });

  it('chaque définition du catalogue respecte le contrat minimal', () => {
    for (const field of fieldCatalogue) {
      expect(field.name).not.toBe('');
      expect(field.label).not.toBe('');
      expect(field.type).not.toBe('');
      expect(typeof field.required).toBe('boolean');
      expect(typeof field.cardinality).toBe('number');
    }
  });
});
