// classes/QueryBuilder.ts

import type { SortRuleInterface, FilterRuleInterface, QueryParamsInterface, IQueryBuilder } from '@/types/filters';

export class QueryBuilder implements IQueryBuilder {
  private sorts: SortRuleInterface[] = [];
  private filters: FilterRuleInterface[] = [];
  private searchTerm?: string;

  constructor(initialParams?: Partial<QueryParamsInterface>) {
    if (initialParams?.sorts) this.sorts = initialParams.sorts;
    if (initialParams?.filters) this.filters = initialParams.filters;
    if (initialParams?.search) this.searchTerm = initialParams.search;
  }

  /**
   * Ajoute un tri
   */
  addSort(fieldname: string, order: 'asc' | 'desc' = 'asc'): this {
    // on doit vérifier que le tri n'existe pas déjà pour éviter les doublons
    const existingSort = this.sorts.find((sort) => sort.fieldname === fieldname);
    if (existingSort) {
      existingSort.order = order;
      return this;
    }
    this.sorts.push({ fieldname, order });
    return this;
  }

  /**
   * Ajoute un tri par défaut (remplace les tris existants)
   */
  setDefaultSort(fieldname: string = 'id', order: 'asc' | 'desc' = 'desc'): this {
    this.sorts = [{ fieldname, order }];
    return this;
  }

  /**
   * Ajoute un filtre
   */
  addFilter(fieldname: string, operator: FilterRuleInterface['operator'], value: any): this {
    this.filters.push({ fieldname, operator, value });
    return this;
  }

  /**
   * Ajoute un filtre "égal à"
   */
  addEquals(fieldname: string, value: any): this {
    return this.addFilter(fieldname, '=', value);
  }

  /**
   * Ajoute un filtre "like"
   */
  addLike(fieldname: string, value: string): this {
    return this.addFilter(fieldname, 'like', value);
  }

  /**
   * Ajoute un filtre "dans" (IN)
   */
  addIn(fieldname: string, values: any[]): this {
    return this.addFilter(fieldname, 'in', values);
  }

  /**
   * Ajoute une recherche textuelle
   */
  setSearch(search: string): this {
    this.searchTerm = search;
    return this;
  }

  /**
   * Réinitialise tous les paramètres
   */
  reset(): this {
    this.sorts = [];
    this.filters = [];
    this.searchTerm = undefined;
    return this;
  }

  resetSearch(): this {
    this.searchTerm = undefined;
    return this;
  }

  resetFilters(): this {
    this.filters = [];
    return this;
  }

  resetSorts(): this {
    this.sorts = [];
    return this;
  }

  /**
   * Retourne l'objet QueryParams
   */
  build(): QueryParamsInterface {
    const params: QueryParamsInterface = {};

    if (this.sorts.length > 0) {
      params.sorts = this.sorts;
    }
    if (this.filters.length > 0) {
      params.filters = this.filters;
    }
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    return params;
  }

  /**
   * Retourne les paramètres URL encodés
   */
  toURLSearchParams(): URLSearchParams {
    const urlParams = new URLSearchParams();
    // Sorts
    if (this.sorts.length > 0) {
      urlParams.append('sorts', JSON.stringify(this.sorts));
    } else {
      // Si aucun tri n'est défini, on ajoute un tri par défaut sur l'id en ordre décroissant
      urlParams.append('sorts', JSON.stringify([{ fieldname: 'id', order: 'desc' }]));
    }
    // Filters
    if (this.filters.length > 0) {
      urlParams.append('filters', JSON.stringify(this.filters));
    }
    // Search
    if (this.searchTerm) {
      urlParams.append('search', this.searchTerm);
    }
    return urlParams;
  }

  /**
   * Retourne la chaîne de requête
   */
  toQueryString(): string {
    return this.toURLSearchParams().toString();
  }

  /**
   * Chaînage possible
   */
  static create(): QueryBuilder {
    return new QueryBuilder();
  }
}
