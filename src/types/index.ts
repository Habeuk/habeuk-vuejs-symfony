import type { Component } from 'vue';
import type { TreeNode } from 'primevue/treenode';
import type { MenuItem } from 'primevue/menuitem';
import type * as entities from './entities';
export interface AppState {
  sidebarCollapsed: boolean;
  sidebarCollapsedMobile: boolean;
  theme: 'light' | 'dark' | 'system';
}

export type BaseEntity = entities.BaseEntity;
export type BaseEntityView = entities.BaseEntityView;
export type userEntity = entities.userEntity;
export type companyEntity = entities.companyEntity;
export type companyUser = entities.companyUser;
export type DocumentEntity = entities.DocumentEntity;
export type PaymentEntity = entities.PaymentEntity;
export type InvoiceEntity = entities.InvoiceEntity;
export type QuoteEntity = entities.QuoteEntity;
export type companyUserCreate = entities.companyUserCreate;
export type QuoteLine = entities.QuoteLine;

/**
 * interface
 */
export type HbkMenuItem = Omit<MenuItem, 'icon' | 'items'> & {
  key: string; // La clée unique du menu.
  template_key: string | null;
  route: string;
  label: string;
  /** Composant lucide (modèle local) ou chaîne héritée envoyée par le backend (voir resolveMenuIcon). */
  icon?: string | Component;
  display: boolean;
  badge?: string | number;
  entity?: string; // La clée unique de l'entité.
  items?: HbkMenuItem[];
  requiresAuth?: boolean;
};

export interface BaseEntityConfigInterface {
  configKey: string;
  configValue: any;
  valueType: 'string' | 'number' | 'boolean' | 'json';
  isEncrypted?: boolean;
  groupName?: string;
  company?: BaseEntityView;
  description?: string;
  [key: string]: any;
}

export interface Error {
  error: string;
  details?: object;
  class?: string;
  message?: string;
}

export interface ErrorAjaxResponse {
  error: {
    data: Error | Blob;
  };
}

export interface emitEntityToSaveInterface {
  formData: BaseEntity;
  action: 'edit' | 'collection' | 'nothing';
}

export interface CollectionsState {
  [entityName: string]: collection;
}

export interface EntitiesDefinitionInterface {
  [field: string]: EntityDefinitionInterface;
}
export interface EntityDefinitionInterface {
  columns: columnsInterface;
  entity_config: EntityConfigInterface;
  enums: enumsInterface;
}

export interface enumsInterface {
  [field: string]: enumCollectionInterface;
}
export interface enumCollectionInterface {
  [value: string]: enumItemInterface;
}
export interface enumItemInterface {
  label: string;
  value: string | number;
  color?: string;
}

export interface columnsInterface {
  [field: string]: columnInterface;
}
export interface columnInterface {
  label: string;
  default_label?: string;
  description: string;
  type: string;
  sortable: boolean;
  order: number;
  display: boolean;
}
export interface EntityConfigInterface {
  enabled: boolean;
  label: string;
  entity: string;
  icon: string;
  order: number;
  actions: string[];
}
export interface collection {
  items: BaseEntityView[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  from: number;
  to: number;
}

export interface columnsOptionsInterface {
  field: string;
  label: string;
}

export interface EntityConfigAll {
  schema: EntityFormSchema;
  formData: Record<string, any>;
}

export interface EntityFormSchema {
  fields: EntityFormFieldInterface[];
}

export interface EntityFormFieldInterface {
  name: string;
  label: string;
  description?: string;
  type: string;
  required: boolean;
  placeholder: string | null;
  cardinality: number;
  maxlength?: number | null;
  rows?: number | null;
  mask?: string | null;
  options?: Array<{ label: string; value: any }>;
  validations?: { [key: string]: ValidationRuleInterface };
  tree_data?: TreeNode[];
  reference?: FieldReferenceInterface;
  slotChar?: string | null;
  scale?: number | null;
  [fieldname: string]: string | number | boolean | null | object | undefined | Array<any>;
}

export interface FieldReferenceInterface {
  entity: string;
  loading: boolean;
  mapped_by?: string;
  type_orm?: string;
  min_length?: number | null;
  display_fields?: string[];
  search_fields?: string[];
  multiple?: boolean;
  separator?: string;
  emptySelectionMessage?: string | null;
  emptyFilterMessage?: string | null;
  emptyMessage?: string | null;
}

export interface violationsFormInterface {
  violations: violationFormInterface[];
}

export interface violationFormInterface {
  parameters: any;
  propertyPath: string;
  title: string;
  template: string;
}

export interface ValidationRuleInterface {
  type: string;
  message: string;
  min?: number;
  max?: number;
  minMessage?: string;
  maxMessage?: string;
  pattern?: string;
}
/**
 * interface pour les etapes Invoice et quote.
 */
export type StatusColor = 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'primary';
export type InvoiceStatusValue = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'refunded' | 'partially_refunded' | 'overdue' | 'cancelled';
export type QuoteStatusValue = 'draft' | 'sent' | 'accepted' | 'converted' | 'refused' | 'expired' | 'cancelled';
export interface StatusStep<T> {
  value: T;
  label: string;
  color: StatusColor;
  order: number;
  icon: string;
}
export type InvoiceStatusStepInterface = StatusStep<InvoiceStatusValue>;
export type QuoteStatusStepInterface = StatusStep<QuoteStatusValue>;
/**
 * interface pour les etapes Invoice et Quote.
 */
