/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateUserInput:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 6
 *           maxLength: 50
 *         role:
 *           type: string
 *           enum: [user, admin]
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *     LoginUserInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 6
 *           maxLength: 50
 *     ResetPasswordInput:
 *       type: object
 *       properties:
 *         defaultPassword:
 *           type: string
 *           minLength: 6
 *           maxLength: 50
 */

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


export const loginUserSchema = z.object({
  email: z.string()
    .min(1, "E-mail é obrigatório")
    .refine(val => emailRegex.test(val), "Formato de e-mail inválido"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha deve ter no máximo 50 caracteres")
});