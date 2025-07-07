import { z } from "zod";

// Regex para validação de telefone brasileiro
const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;

// Regex para validação de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createUserSchema = z.object({
  name: z.string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .refine(val => val.trim().length > 0, "Nome não pode ser apenas espaços"),
  phone: z.string()
    .min(1, "Telefone é obrigatório")
    .refine(val => phoneRegex.test(val), "Formato de telefone inválido"),
  email: z.string()
    .min(1, "E-mail é obrigatório")
    .refine(val => emailRegex.test(val), "Formato de e-mail inválido"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha deve ter no máximo 50 caracteres"),
  role: z.enum(["user", "admin"], {
    errorMap: () => ({ message: "Role deve ser: user ou admin" })
  }).optional()
});

export const updateUserSchema = z.object({
  name: z.string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .refine(val => val.trim().length > 0, "Nome não pode ser apenas espaços")
    .optional(),
  phone: z.string()
    .refine(val => !val || phoneRegex.test(val), "Formato de telefone inválido")
    .optional(),
  email: z.string()
    .refine(val => !val || emailRegex.test(val), "Formato de e-mail inválido")
    .optional(),
  role: z.enum(["user", "admin"], {
    errorMap: () => ({ message: "Role deve ser: user ou admin" })
  }).optional()
});

export const resetPasswordSchema = z.object({
  defaultPassword: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha deve ter no máximo 50 caracteres")
    .optional()
});
