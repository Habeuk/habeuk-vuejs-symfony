import type { BaseEntity } from '@/types';
import { type WritableComputedRef } from 'vue';
type FormValue = any;
type FormDataRecord = Record<string, FormValue>;
export type FormData = FormDataRecord | BaseEntity;
export type FormDatasInterface = Record<string, FormData>;

export type FormHandler = {
  getFormData: () => FormData;
  setFormData: (value: FormData) => void;
  mergeFormData: (value: Partial<FormDataRecord>) => void;
  getValue: (field: string) => FormValue;
  setValue: (field: string, value: FormValue) => void;
  model: (field: string) => WritableComputedRef<FormValue>;
  remove: () => void;
};
