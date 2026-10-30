// src/stores/types/entities.ts

// ============================================================
// BASE
// ============================================================
export interface BaseEntity {
  id?: number;
  [key: string]: any; // Autre champs dynamiques
}
export interface BaseEntityView {
  id: number;
  title: string; // pour la creation mettre le champs title vide.( generalement pas utiliser )
  [key: string]: any; // Autre champs dynamiques
}

// ============================================================
// MÉDIAS & FICHIERS
// ============================================================
export interface FilesEntity extends BaseEntityView {
  id: number;
  title: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

// ============================================================
// UTILISATEUR & AUTH
// ============================================================
export interface userEntity extends BaseEntityView {
  id: number;
  title: string;
  roles: string[];
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: FilesEntity;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// ENTREPRISE
// ============================================================
export interface companyEntity extends BaseEntityView {
  id: number;
  title: string;
  name: string;
  siret: string;
  logo: FilesEntity;
  paymentMethods: BaseEntity[];
  city: string;
  country: string;
  postalCode: string;
  currency: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  vatNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// COMPANY USER (rattachement utilisateur ↔ entreprise)
// ============================================================
export interface companyUserCreate extends BaseEntity {
  user: userEntity;
  company: companyEntity;
  fullAccess?: boolean;
  joinedAt?: string;
  status: boolean;
  userEmail?: string;
}

export interface companyUser extends companyUserCreate {
  id: number;
  joinedAt: string;
  fullAccess: boolean;
}

// ============================================================
// DOCUMENTS (Devis & Factures)
// ============================================================
export type DocumentStatus = 'draft' | 'sent' | 'accepted' | 'refused' | 'paid' | 'overdue' | 'cancelled';
export type DocumentType = 'quote' | 'invoice';

export interface DocumentEntity extends BaseEntity {
  id: number;
  title: string;
  documentNumber: string;
  type: DocumentType;
  status: DocumentStatus;
  company: companyEntity;
  issueDate: string;
  dueDate?: string;
  executionDate?: string;
  totalHT: number;
  totalTTC: number;
  totalVAT: number;
  currency: string;
  notes?: string;
  generalConditions?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// PAIEMENT
// ============================================================
export type PaymentMethod = 'transfer' | 'card' | 'cash' | 'check' | 'direct_debit' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentEntity extends BaseEntity {
  id: number;
  title: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
  reference?: string;
  notes?: string;
  invoice: DocumentEntity;
  company: companyEntity;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// ACTIVITÉ / JOURNAL
// ============================================================
export interface InvoiceEntity extends BaseEntity {
  id: number;
  title: string;
  entityType: string;
  entityId: number;
  user: userEntity;
  company: companyEntity;
  details?: Record<string, any>;
  currency: string;
  createdAt: string;
}

export interface QuoteEntity extends InvoiceEntity {
  quoteStatus?: string;
}

export interface QuoteLine extends BaseEntity {
  id: number;
  description: string;
  isSection: boolean;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  unitPriceTTC: string;
  sortOrder: number;
  quote: QuoteEntity;
  title: string;
}
