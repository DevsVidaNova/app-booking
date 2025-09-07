/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         size:
 *           type: integer
 *         description:
 *           type: string
 *         exclusive:
 *           type: boolean
 *         status:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateRoomInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         size:
 *           type: integer
 *         description:
 *           type: string
 *           maxLength: 500
 *         exclusive:
 *           type: boolean
 *         status:
 *           type: boolean
 *     UpdateRoomInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         size:
 *           type: integer
 *         description:
 *           type: string
 *           maxLength: 500
 *         exclusive:
 *           type: boolean
 *         status:
 *           type: boolean
 *     SearchRoomInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 */

import { z } from "zod";

export const createRoomSchema = z.object({
    name: z.string()
        .min(1, "Nome da sala é obrigatório")
        .max(100, "Nome deve ter no máximo 100 caracteres")
        .refine(val => val.trim().length > 0, "Nome não pode ser apenas espaços"),
    size: z.number()
        .positive("Tamanho deve ser um número positivo")
        .optional(),
    description: z.string()
        .max(500, "Descrição deve ter no máximo 500 caracteres")
        .refine(val => !val || val.trim().length > 0, "Descrição não pode ser apenas espaços")
        .optional(),
    exclusive: z.boolean().optional(),
    status: z.boolean().optional(),
});

export const updateRoomSchema = z.object({
    name: z.string()
        .min(1, "Nome da sala deve ser uma string não vazia")
        .max(100, "Nome deve ter no máximo 100 caracteres")
        .refine(val => val.trim().length > 0, "Nome não pode ser apenas espaços")
        .optional(),
    size: z.number()
        .positive("Tamanho deve ser um número positivo")
        .optional(),
    description: z.string()
        .max(500, "Descrição deve ter no máximo 500 caracteres")
        .refine(val => !val || val.trim().length > 0, "Descrição não pode ser apenas espaços")
        .optional(),
    exclusive: z.boolean().optional(),
    status: z.boolean().optional(),
});

export const searchRoomSchema = z.object({
    name: z.string()
        .min(1, "Nome é obrigatório para busca")
        .refine(val => val.trim().length > 0, "Nome não pode ser apenas espaços")
});