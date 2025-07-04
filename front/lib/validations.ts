import { z } from 'zod';
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, REPEAT_TYPES } from './constants';

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema para criação de reserva
export const createBookingSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  room: z.string().min(1, 'Sala é obrigatória'),
  date: z.string().optional().nullable(),
  start_time: z.string().min(1, 'Horário de início é obrigatório'),
  end_time: z.string().min(1, 'Horário de fim é obrigatório'),
  repeat: z.string().optional().nullable(),
  day_repeat: z.union([z.number(), z.string()]).optional().nullable(),
});

// Schema para criação de sala
export const createRoomSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  size: z.number().min(1, 'Capacidade deve ser maior que 0'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  exclusive: z.boolean(),
  status: z.boolean(),
});

// Schema para criação de membro
export const createMemberSchema = z.object({
  full_name: z.string().min(1, 'Nome completo é obrigatório'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum([GENDER_OPTIONS.MALE, GENDER_OPTIONS.FEMALE, GENDER_OPTIONS.OTHER]),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  rg: z.string().min(1, 'RG é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  cep: z.string().min(8, 'CEP deve ter 8 dígitos'),
  mother_name: z.string().min(1, 'Nome da mãe é obrigatório'),
  father_name: z.string().min(1, 'Nome do pai é obrigatório'),
  marital_status: z.enum([
    MARITAL_STATUS_OPTIONS.MARRIED,
    MARITAL_STATUS_OPTIONS.SINGLE,
    MARITAL_STATUS_OPTIONS.DIVORCED,
    MARITAL_STATUS_OPTIONS.WIDOWED,
  ]),
  has_children: z.boolean(),
  children_count: z.number().min(0),
});

// Schema para criação de escala
export const createScaleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  direction: z.string().optional().nullable(),
  band: z.string().optional().nullable(),
  projection: z.string().optional().nullable(),
  sound: z.string().optional().nullable(),
  light: z.string().optional().nullable(),
  transmission: z.string().optional().nullable(),
  camera: z.string().optional().nullable(),
  live: z.string().optional().nullable(),
  training_sound: z.string().optional().nullable(),
  photography: z.string().optional().nullable(),
  stories: z.string().optional().nullable(),
  dynamic: z.string().optional().nullable(),
});

// Tipos inferidos dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateBookingFormData = z.infer<typeof createBookingSchema>;
export type CreateRoomFormData = z.infer<typeof createRoomSchema>;
export type CreateMemberFormData = z.infer<typeof createMemberSchema>;
export type CreateScaleFormData = z.infer<typeof createScaleSchema>;