export interface ActionResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ModalBasicProps {
  show: boolean;
  onHide: () => void;
  action?: () => void;
  string?: string;
  title?: string;
}

// types/table.ts
export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "relation";

export interface ColumnConfig {
  field: string; // "price" | "category.name"
  label: string;
  type?: FieldType; // default: 'string'
  sortable?: boolean; // default: true
  filterable?: boolean; // default: true
  format?: string; // "currency" | "dd/MM/yyyy"
  include?: Record<string, any>; // Prisma include
  render?: (value: any, row: any, index?: number) => React.ReactNode;
}

export interface FilterValue {
  field: string;
  operator: string;
  value: any; // YA NO ES STRING - tipado según el tipo de campo
}

export interface TableData {
  rows: any[];
  total: number;
  page: number;
  pageSize: number;
}
