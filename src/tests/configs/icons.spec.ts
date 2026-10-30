import { describe, expect, it } from 'vitest';
import { Bot, Folder, Home } from '@lucide/vue';
import { defaultMenuIcon, resolveMenuIcon } from '@/configs/icons';
import source from '@/configs/icons.ts?raw';

/**
 * Le backend envoie encore des noms d'icônes PrimeVue : resolveMenuIcon les traduit
 * en composants lucide. Une clé cassée ou un repli manquant = icône absente dans le menu.
 *
 * La table est lue depuis la source du fichier (`?raw`, import brut Vite) : ce test
 * échoue si une clé est ajoutée sans être résolvable.
 */
const legacyKeys = [...new Set([...source.matchAll(/'pi pi-[a-z-]+'/g)].map((match) => match[0].replaceAll("'", '')))];

describe('resolveMenuIcon — composants lucide', () => {
  it('retourne le composant tel quel quand un modèle local en fournit un', () => {
    expect(resolveMenuIcon(Home)).toBe(Home);
  });

  it('retourne le composant même s’il correspond à l’icône de repli', () => {
    expect(resolveMenuIcon(Folder)).toBe(Folder);
  });
});

describe('resolveMenuIcon — valeurs envoyées par le backend', () => {
  it('traduit une clé PrimeVue connue', () => {
    expect(resolveMenuIcon('pi pi-home')).toBe(Home);
    expect(resolveMenuIcon('pi pi-android')).toBe(Bot);
    expect(resolveMenuIcon('pi pi-folder')).toBe(Folder);
  });

  it('retombe sur l’icône par défaut pour une clé inconnue', () => {
    expect(resolveMenuIcon('pi pi-inexistant')).toBe(defaultMenuIcon);
  });

  it('retombe sur l’icône par défaut quand aucune icône n’est fournie', () => {
    expect(resolveMenuIcon()).toBe(defaultMenuIcon);
    expect(resolveMenuIcon(undefined)).toBe(defaultMenuIcon);
    expect(resolveMenuIcon('')).toBe(defaultMenuIcon);
  });

  it('résout toutes les clés déclarées dans la table de repli', () => {
    expect(legacyKeys.length).toBeGreaterThan(0);

    for (const key of legacyKeys) {
      expect(resolveMenuIcon(key), `clé non résolue : ${key}`).toBeTruthy();
    }
  });
});

describe('defaultMenuIcon', () => {
  it('est un composant lucide (dossier)', () => {
    expect(defaultMenuIcon).toBe(Folder);
  });
});
