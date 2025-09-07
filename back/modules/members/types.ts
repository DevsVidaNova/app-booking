export interface MemberData {
  full_name: string;
  birth_date: string;
  gender: string;
  cpf?: string;
  rg?: string;
  phone: string;
  email: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  mother_name?: string;
  father_name?: string;
  marital_status?: string;
  has_children?: boolean;
  children_count?: number;
}

export interface Member {
  id: number;
  full_name: string;
  birth_date: string;
  gender: string;
  cpf?: string;
  rg?: string;
  phone: string;
  email: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  mother_name?: string;
  father_name?: string;
  marital_status?: string;
  has_children?: boolean;
  children_count?: number;
}

export interface HandlerResult<T = any> {
  data?: T;
  error?: string;
}

export interface GetMembersParams {
  page?: number;
  limit?: number;
}

export interface GetMembersResult {
  data: Member[];
  total: number;
  page: number;
  to: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchByFilterParams {
  field: string;
  value: any;
  operator: string;
}

export interface AnalyticsChart {
  label: string;
  value: number;
  percentage: string;
  fill: string;
}

export interface AnalyticsResult {
  marital: AnalyticsChart[];
  gender: AnalyticsChart[];
  children: AnalyticsChart[];
  age: AnalyticsChart[];
  city: AnalyticsChart[];
  state: AnalyticsChart[];
}

export type Gender = "Masculino" | "Feminino" | "Outro";
export type MaritalStatus = "Solteiro" | "Casado" | "Viúvo" | "Divorciado";
export type SearchOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike";

export const ALLOWED_SEARCH_FIELDS = [
  'full_name', 
  'gender', 
  'phone', 
  'email', 
  'city', 
  'state', 
  'marital_status', 
  'has_children'
] as const;

export const VALID_OPERATORS: SearchOperator[] = [
  'eq', 
  'neq', 
  'gt', 
  'gte', 
  'lt', 
  'lte', 
  'like', 
  'ilike'
];

export const CHART_COLORS = [
  "#FF6384", 
  "#36A2EB", 
  "#FFCE56", 
  "#4BC0C0", 
  "#9966FF", 
  "#FF9F40", 
  "#FFB6C1", 
  "#8A2BE2", 
  "#7FFF00", 
  "#FFD700"
];
