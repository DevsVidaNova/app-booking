import { z } from 'zod';

// Schema para validar CPF
const cpfSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 11, { message: 'CPF deve ter 11 dígitos.' })
  .optional();

// Schema para validar telefone
const phoneSchema = z.string()
  .regex(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/, { message: 'Formato de telefone inválido.' })
  .transform(val => val.replace(/\s/g, ''));

// Schema para validar email
const emailSchema = z.string()
  .email({ message: 'Formato de email inválido.' })
  .min(1, { message: 'Email é obrigatório.' });

// Schema para validar data de nascimento
const birthDateSchema = z.string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'Data de nascimento deve estar no formato DD/MM/YYYY.' })
  .refine(val => {
    const dayjs = require('dayjs');
    const customParseFormat = require('dayjs/plugin/customParseFormat');
    dayjs.extend(customParseFormat);
    
    const parsedDate = dayjs(val, 'DD/MM/YYYY', true);
    return parsedDate.isValid();
  }, { message: 'Data de nascimento inválida.' })
  .refine(val => {
    const dayjs = require('dayjs');
    const customParseFormat = require('dayjs/plugin/customParseFormat');
    dayjs.extend(customParseFormat);
    
    const parsedDate = dayjs(val, 'DD/MM/YYYY', true);
    return !parsedDate.isAfter(dayjs());
  }, { message: 'Data de nascimento não pode ser no futuro.' });

// Schema para validar gênero
const genderSchema = z.enum(['Masculino', 'Feminino', 'Outro'], {
  errorMap: () => ({ message: 'Gênero deve ser: Masculino, Feminino ou Outro.' })
});

// Schema para validar estado civil
const maritalStatusSchema = z.enum(['Solteiro', 'Casado', 'Viúvo', 'Divorciado'], {
  errorMap: () => ({ message: 'Estado civil deve ser: Solteiro, Casado, Viúvo ou Divorciado.' })
});

// Schema para criar um novo membro
export const createMemberSchema = z.object({
  full_name: z.string()
    .min(2, { message: 'Nome completo deve ter pelo menos 2 caracteres.' })
    .max(100, { message: 'Nome completo deve ter no máximo 100 caracteres.' }),
  birth_date: birthDateSchema,
  gender: genderSchema,
  cpf: cpfSchema,
  rg: z.string()
    .min(1, { message: 'RG é obrigatório.' })
    .optional(),
  phone: phoneSchema,
  email: emailSchema,
  street: z.string()
    .max(150, { message: 'Endereço deve ter no máximo 150 caracteres.' })
    .optional(),
  number: z.string()
    .max(20, { message: 'Número deve ter no máximo 20 caracteres.' })
    .optional(),
  neighborhood: z.string()
    .max(100, { message: 'Bairro deve ter no máximo 100 caracteres.' })
    .optional(),
  city: z.string()
    .max(100, { message: 'Cidade deve ter no máximo 100 caracteres.' })
    .optional(),
  state: z.string()
    .max(50, { message: 'Estado deve ter no máximo 50 caracteres.' })
    .optional(),
  cep: z.string()
    .regex(/^\d{8}$/, { message: 'CEP deve ter 8 dígitos.' })
    .optional(),
  mother_name: z.string()
    .max(100, { message: 'Nome da mãe deve ter no máximo 100 caracteres.' })
    .optional(),
  father_name: z.string()
    .max(100, { message: 'Nome do pai deve ter no máximo 100 caracteres.' })
    .optional(),
  marital_status: maritalStatusSchema.optional(),
  has_children: z.boolean().default(false),
  children_count: z.number()
    .min(0, { message: 'Quantidade de filhos não pode ser negativa.' })
    .max(20, { message: 'Quantidade de filhos deve ser no máximo 20.' })
    .default(0)
});

// Schema para atualizar um membro (todos os campos opcionais)
export const updateMemberSchema = z.object({
  full_name: z.string()
    .min(2, { message: 'Nome completo deve ter pelo menos 2 caracteres.' })
    .max(100, { message: 'Nome completo deve ter no máximo 100 caracteres.' })
    .optional(),
  birth_date: birthDateSchema.optional(),
  gender: genderSchema.optional(),
  cpf: cpfSchema,
  rg: z.string()
    .min(1, { message: 'RG deve ser uma string não vazia.' })
    .optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  street: z.string()
    .max(150, { message: 'Endereço deve ter no máximo 150 caracteres.' })
    .optional(),
  number: z.string()
    .max(20, { message: 'Número deve ter no máximo 20 caracteres.' })
    .optional(),
  neighborhood: z.string()
    .max(100, { message: 'Bairro deve ter no máximo 100 caracteres.' })
    .optional(),
  city: z.string()
    .max(100, { message: 'Cidade deve ter no máximo 100 caracteres.' })
    .optional(),
  state: z.string()
    .max(50, { message: 'Estado deve ter no máximo 50 caracteres.' })
    .optional(),
  cep: z.string()
    .regex(/^\d{8}$/, { message: 'CEP deve ter 8 dígitos.' })
    .optional(),
  mother_name: z.string()
    .max(100, { message: 'Nome da mãe deve ter no máximo 100 caracteres.' })
    .optional(),
  father_name: z.string()
    .max(100, { message: 'Nome do pai deve ter no máximo 100 caracteres.' })
    .optional(),
  marital_status: maritalStatusSchema.optional(),
  has_children: z.boolean().optional(),
  children_count: z.number()
    .min(0, { message: 'Quantidade de filhos não pode ser negativa.' })
    .max(20, { message: 'Quantidade de filhos deve ser no máximo 20.' })
    .optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização.'
});

// Schema para buscar membros
export const getMembersSchema = z.object({
  page: z.number().min(1, { message: 'Página deve ser maior que 0.' }).default(1),
  limit: z.number().min(1).max(100, { message: 'Limite deve ser entre 1 e 100.' }).default(10)
});

// Schema para buscar membro por nome
export const searchMemberSchema = z.object({
  full_name: z.string()
    .min(1, { message: 'Nome é obrigatório para busca.' })
    .max(100, { message: 'Nome deve ter no máximo 100 caracteres.' })
});

// Schema para buscar com filtros
export const searchByFilterSchema = z.object({
  field: z.string()
    .min(1, { message: 'Campo é obrigatório.' }),
  value: z.union([z.string(), z.number(), z.boolean()]),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike'], {
    errorMap: () => ({ message: 'Operador inválido. Use: eq, neq, gt, gte, lt, lte, like, ilike.' })
  })
});

// Schema para validar ID
export const idSchema = z.union([
  z.string().regex(/^\d+$/, { message: 'ID deve ser um número.' }),
  z.number().positive({ message: 'ID deve ser um número positivo.' })
]);

// Tipos inferidos dos schemas
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type GetMembersInput = z.infer<typeof getMembersSchema>;
export type SearchMemberInput = z.infer<typeof searchMemberSchema>;
export type SearchByFilterInput = z.infer<typeof searchByFilterSchema>;
export type IdInput = z.infer<typeof idSchema>;
