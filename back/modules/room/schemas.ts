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