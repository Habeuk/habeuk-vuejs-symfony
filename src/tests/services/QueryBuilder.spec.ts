import { describe, expect, it } from 'vitest';
import { QueryBuilder } from '@/services/QueryBuilder';
import type { SortRuleInterface } from '@/types/filters';

/**
 * QueryBuilder construit les paramètres envoyés à l'API pour les listes
 * (tri, filtres, recherche) : une sérialisation fausse = liste vide ou mal filtrée.
 */
describe('QueryBuilder — tris', () => {
  it('ajoute un tri et renvoie l’instance pour le chaînage', () => {
    const builder = new QueryBuilder();

    expect(builder.addSort('name')).toBe(builder);
    expect(builder.build().sorts).toEqual([{ fieldname: 'name', order: 'asc' }]);
  });

  it('met à jour l’ordre au lieu de dupliquer un tri existant', () => {
    const builder = new QueryBuilder().addSort('name', 'asc').addSort('name', 'desc');

    expect(builder.build().sorts).toEqual([{ fieldname: 'name', order: 'desc' }]);
  });

  it('setDefaultSort remplace tous les tris existants', () => {
    const builder = new QueryBuilder().addSort('name').addSort('city');

    builder.setDefaultSort();

    expect(builder.build().sorts).toEqual([{ fieldname: 'id', order: 'desc' }]);
  });

  it('accepte un tri par défaut personnalisé', () => {
    expect(new QueryBuilder().setDefaultSort('createdAt', 'asc').build().sorts).toEqual([{ fieldname: 'createdAt', order: 'asc' }]);
  });
});

describe('QueryBuilder — filtres', () => {
  it('enregistre chaque type de filtre avec son opérateur', () => {
    const builder = new QueryBuilder().addEquals('status', 'actif').addLike('name', 'mar').addIn('id', [1, 2]).addFilter('age', '>', 18);

    expect(builder.build().filters).toEqual([
      { fieldname: 'status', operator: '=', value: 'actif' },
      { fieldname: 'name', operator: 'like', value: 'mar' },
      { fieldname: 'id', operator: 'in', value: [1, 2] },
      { fieldname: 'age', operator: '>', value: 18 },
    ]);
  });

  it('accepte plusieurs filtres sur le même champ', () => {
    const builder = new QueryBuilder().addFilter('amount', '>=', 10).addFilter('amount', '<=', 20);

    expect(builder.build().filters).toHaveLength(2);
  });
});

describe('QueryBuilder — recherche', () => {
  it('enregistre le terme de recherche', () => {
    expect(new QueryBuilder().setSearch('marie').build()).toEqual({ search: 'marie' });
  });
});

describe('QueryBuilder — build()', () => {
  it('retourne un objet vide quand aucun paramètre n’est défini', () => {
    expect(new QueryBuilder().build()).toEqual({});
  });

  it('combine tris, filtres et recherche', () => {
    const params = new QueryBuilder().addSort('name').addEquals('status', 'actif').setSearch('mar').build();

    expect(params).toEqual({
      sorts: [{ fieldname: 'name', order: 'asc' }],
      filters: [{ fieldname: 'status', operator: '=', value: 'actif' }],
      search: 'mar',
    });
  });

  it('accepte des paramètres initiaux', () => {
    const builder = new QueryBuilder({
      sorts: [{ fieldname: 'name', order: 'desc' }],
      filters: [{ fieldname: 'status', operator: '=', value: 'actif' }],
      search: 'mar',
    });

    expect(builder.build()).toEqual({
      sorts: [{ fieldname: 'name', order: 'desc' }],
      filters: [{ fieldname: 'status', operator: '=', value: 'actif' }],
      search: 'mar',
    });
  });

  it('partage la référence des paramètres initiaux (effet de bord connu)', () => {
    const sorts: SortRuleInterface[] = [{ fieldname: 'name', order: 'asc' }];

    new QueryBuilder({ sorts }).addSort('name', 'desc');

    // Le builder ne clone pas : modifier un tri existant modifie le tableau de l'appelant.
    expect(sorts[0]?.order).toBe('desc');
  });
});

describe('QueryBuilder — réinitialisation', () => {
  it('reset() vide tris, filtres et recherche', () => {
    const builder = new QueryBuilder().addSort('name').addEquals('status', 'actif').setSearch('mar');

    expect(builder.reset().build()).toEqual({});
  });

  it('resetSearch(), resetFilters() et resetSorts() sont ciblés', () => {
    const builder = new QueryBuilder().addSort('name').addEquals('status', 'actif').setSearch('mar');

    expect(builder.resetSearch().build()).toEqual({
      sorts: [{ fieldname: 'name', order: 'asc' }],
      filters: [{ fieldname: 'status', operator: '=', value: 'actif' }],
    });

    expect(builder.resetFilters().build()).toEqual({ sorts: [{ fieldname: 'name', order: 'asc' }] });

    expect(builder.resetSorts().build()).toEqual({});
  });
});

describe('QueryBuilder — sérialisation URL', () => {
  it('ajoute un tri par défaut (id desc) quand aucun tri n’est défini', () => {
    const params = new QueryBuilder().toURLSearchParams();

    expect(params.get('sorts')).toBe(JSON.stringify([{ fieldname: 'id', order: 'desc' }]));
    expect(params.get('filters')).toBeNull();
    expect(params.get('search')).toBeNull();
  });

  it('sérialise tris, filtres et recherche en JSON', () => {
    const builder = new QueryBuilder().addSort('name', 'desc').addEquals('status', 'actif').setSearch('marie');
    const params = builder.toURLSearchParams();

    expect(JSON.parse(String(params.get('sorts')))).toEqual([{ fieldname: 'name', order: 'desc' }]);
    expect(JSON.parse(String(params.get('filters')))).toEqual([{ fieldname: 'status', operator: '=', value: 'actif' }]);
    expect(params.get('search')).toBe('marie');
  });

  it('toQueryString() produit une chaîne relisible par URLSearchParams', () => {
    const queryString = new QueryBuilder().setSearch('marie dupont').toQueryString();
    const parsed = new URLSearchParams(queryString);

    expect(parsed.get('sorts')).toBe(JSON.stringify([{ fieldname: 'id', order: 'desc' }]));
    expect(parsed.get('search')).toBe('marie dupont');
  });

  it('QueryBuilder.create() retourne une instance vierge', () => {
    const builder = QueryBuilder.create();

    expect(builder).toBeInstanceOf(QueryBuilder);
    expect(builder.build()).toEqual({});
  });
});
