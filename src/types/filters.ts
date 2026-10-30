export interface SortRuleInterface {
  fieldname: string;
  order: 'asc' | 'desc';
}

export interface FilterRuleInterface {
  fieldname: string;
  operator: '=' | 'like' | '>' | '<' | '>=' | '<=' | 'in';
  value: any;
}

export interface QueryParamsInterface {
  sorts?: SortRuleInterface[];
  filters?: FilterRuleInterface[];
  search?: string;
}

export interface IQueryBuilder {
  /**
   * Ajoute un tri
   */
  addSort(fieldname: string, order?: 'asc' | 'desc'): this;

  /**
   * Ajoute un tri par défaut (remplace les tris existants)
   */
  setDefaultSort(fieldname?: string, order?: 'asc' | 'desc'): this;

  /**
   * Ajoute un filtre
   */
  addFilter(fieldname: string, operator: FilterRuleInterface['operator'], value: any): this;

  /**
   * Ajoute un filtre "égal à"
   */
  addEquals(fieldname: string, value: any): this;

  /**
   * Ajoute un filtre "like"
   */
  addLike(fieldname: string, value: string): this;

  /**
   * Ajoute un filtre "dans" (IN)
   */
  addIn(fieldname: string, values: any[]): this;

  /**
   * Ajoute une recherche textuelle
   */
  setSearch(search: string): this;

  /**
   * Réinitialise tous les paramètres
   */
  reset(): this;

  /**
   * Réinitialise uniquement la recherche textuelle
   */
  resetSearch(): this;

  /**
   * Retourne l'objet QueryParams
   */
  build(): QueryParamsInterface;

  /**
   * Retourne les paramètres URL encodés
   */
  toURLSearchParams(): URLSearchParams;

  /**
   * Retourne la chaîne de requête
   */
  toQueryString(): string;
}
