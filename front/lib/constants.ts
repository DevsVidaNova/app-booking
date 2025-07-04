// Constantes da aplicação
export const APP_CONFIG = {
  NAME: 'CBVN - Comunidade Batista Vida Nova',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de gestão do Comunidade Batista Vida Nova',
} as const;

// Rotas da aplicação
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
  BOOKINGS: '/dashboard/bookings',
  MEMBERS: '/dashboard/members',
  ROOMS: '/dashboard/rooms',
  SCALES: '/dashboard/scales',
  PROFILE: '/dashboard/profile',
  USERS: '/dashboard/users',
  TIMELINES: '/dashboard/timelines',
  CALENDAR: '/calendar',
  GALLERY: '/gallery',
} as const;

// Status de reservas
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const;

// Tipos de repetição
export const REPEAT_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

// Gêneros
export const GENDER_OPTIONS = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
  OTHER: 'Outro',
} as const;

// Estados civis
export const MARITAL_STATUS_OPTIONS = {
  MARRIED: 'Casado',
  SINGLE: 'Solteiro',
  DIVORCED: 'Divorciado',
  WIDOWED: 'Viúvo',
} as const;

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;