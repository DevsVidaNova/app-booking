/**
 * @swagger
 * components:
 *   schemas:
 *     Scale:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *           example: "25/12/2024"
 *         name:
 *           type: string
 *           example: "Escala de Natal"
 *         description:
 *           type: string
 *           example: "Escala especial para o Natal"
 *         direction:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             full_name:
 *               type: string
 *         band:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             full_name:
 *               type: string
 *         projection:
 *           type: string
 *           example: "João Silva"
 *         light:
 *           type: string
 *           example: "Maria Santos"
 *         transmission:
 *           type: string
 *           example: "Pedro Costa"
 *         camera:
 *           type: string
 *           example: "Ana Lima"
 *         live:
 *           type: string
 *           example: "Carlos Oliveira"
 *         sound:
 *           type: string
 *           example: "Fernanda Rocha"
 *         training_sound:
 *           type: string
 *           example: "Roberto Alves"
 *         photography:
 *           type: string
 *           example: "Lucia Mendes"
 *         stories:
 *           type: string
 *           example: "Paulo Ferreira"
 *         dynamic:
 *           type: string
 *           example: "Sandra Dias"
 *     CreateScaleInput:
 *       type: object
 *       required:
 *         - date
 *         - name
 *         - direction
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           pattern: "DD/MM/YYYY"
 *           example: "25/12/2024"
 *           description: "Data da escala no formato DD/MM/YYYY"
 *         name:
 *           type: string
 *           minLength: 2
 *           example: "Escala de Natal"
 *           description: "Nome da escala (mínimo 2 caracteres)"
 *         direction:
 *           type: string
 *           minLength: 2
 *           example: "Pastor João"
 *           description: "Nome da direção (mínimo 2 caracteres)"
 *         band:
 *           type: string
 *           example: "Banda Jovem"
 *           description: "Nome da banda (opcional)"
 *         description:
 *           type: string
 *           example: "Escala especial para o Natal"
 *           description: "Descrição da escala (opcional)"
 *         projection:
 *           type: string
 *           example: "João Silva"
 *           description: "Responsável pela projeção (opcional)"
 *         light:
 *           type: string
 *           example: "Maria Santos"
 *           description: "Responsável pela iluminação (opcional)"
 *         transmission:
 *           type: string
 *           example: "Pedro Costa"
 *           description: "Responsável pela transmissão (opcional)"
 *         camera:
 *           type: string
 *           example: "Ana Lima"
 *           description: "Responsável pela câmera (opcional)"
 *         live:
 *           type: string
 *           example: "Carlos Oliveira"
 *           description: "Responsável pelo live (opcional)"
 *         sound:
 *           type: string
 *           example: "Fernanda Rocha"
 *           description: "Responsável pelo som (opcional)"
 *         training_sound:
 *           type: string
 *           example: "Roberto Alves"
 *           description: "Responsável pelo som de treinamento (opcional)"
 *         photography:
 *           type: string
 *           example: "Lucia Mendes"
 *           description: "Responsável pela fotografia (opcional)"
 *         stories:
 *           type: string
 *           example: "Paulo Ferreira"
 *           description: "Responsável pelas histórias (opcional)"
 *         dynamic:
 *           type: string
 *           example: "Sandra Dias"
 *           description: "Responsável pela dinâmica (opcional)"
 *     UpdateScaleInput:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           pattern: "DD/MM/YYYY"
 *           example: "25/12/2024"
 *           description: "Data da escala no formato DD/MM/YYYY"
 *         name:
 *           type: string
 *           minLength: 2
 *           example: "Escala de Natal Atualizada"
 *           description: "Nome da escala (mínimo 2 caracteres)"
 *         direction:
 *           type: string
 *           minLength: 2
 *           example: "Pastor João"
 *           description: "Nome da direção (mínimo 2 caracteres)"
 *         band:
 *           type: string
 *           example: "Banda Jovem"
 *           description: "Nome da banda"
 *         description:
 *           type: string
 *           example: "Escala especial para o Natal"
 *           description: "Descrição da escala"
 *         projection:
 *           type: string
 *           example: "João Silva"
 *           description: "Responsável pela projeção"
 *         light:
 *           type: string
 *           example: "Maria Santos"
 *           description: "Responsável pela iluminação"
 *         transmission:
 *           type: string
 *           example: "Pedro Costa"
 *           description: "Responsável pela transmissão"
 *         camera:
 *           type: string
 *           example: "Ana Lima"
 *           description: "Responsável pela câmera"
 *         live:
 *           type: string
 *           example: "Carlos Oliveira"
 *           description: "Responsável pelo live"
 *         sound:
 *           type: string
 *           example: "Fernanda Rocha"
 *           description: "Responsável pelo som"
 *         training_sound:
 *           type: string
 *           example: "Roberto Alves"
 *           description: "Responsável pelo som de treinamento"
 *         photography:
 *           type: string
 *           example: "Lucia Mendes"
 *           description: "Responsável pela fotografia"
 *         stories:
 *           type: string
 *           example: "Paulo Ferreira"
 *           description: "Responsável pelas histórias"
 *         dynamic:
 *           type: string
 *           example: "Sandra Dias"
 *           description: "Responsável pela dinâmica"
 *     SearchScaleInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           example: "Natal"
 *           description: "Nome para busca (mínimo 2 caracteres)"
 *     ScaleError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Dados inválidos"
 *         details:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Data deve estar no formato DD/MM/YYYY.", "Nome deve ter pelo menos 2 caracteres."]
 *     ScaleSuccess:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Escala criada com sucesso."
 *     PaginationQuery:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *           description: "Número da página (mínimo 1)"
 *         pageSize:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 15
 *           example: 15
 *           description: "Tamanho da página (1-100)"
 *     IdParam:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           example: "scale-123"
 *           description: "ID único da escala"
 */

import { z } from "zod";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

// Schema para validação de data no formato DD/MM/YYYY
const dateSchema = z.string()
    .refine((date) => dayjs(date, 'DD/MM/YYYY', true).isValid(), {
        message: "Data deve estar no formato DD/MM/YYYY."
    })
    .refine((date) => {
        const inputDate = dayjs(date, 'DD/MM/YYYY');
        return !inputDate.isBefore(dayjs(), 'day');
    }, {
        message: "Data não pode ser no passado."
    });

// Schema para validação de strings com mínimo de 2 caracteres
const minLengthString = (fieldName: string) => z.string()
    .min(2, { message: `${fieldName} deve ter pelo menos 2 caracteres.` })
    .trim();

// Schema para criação de escala
export const createScaleSchema = z.object({
    date: dateSchema,
    name: minLengthString("Nome"),
    direction: minLengthString("Direção"),
    band: z.string().optional(),
    description: z.string().optional(),
    projection: z.string().optional(),
    light: z.string().optional(),
    transmission: z.string().optional(),
    camera: z.string().optional(),
    live: z.string().optional(),
    sound: z.string().optional(),
    training_sound: z.string().optional(),
    photography: z.string().optional(),
    stories: z.string().optional(),
    dynamic: z.string().optional(),
});

// Schema para atualização de escala
export const updateScaleSchema = z.object({
    date: dateSchema.optional(),
    name: minLengthString("Nome").optional(),
    direction: minLengthString("Direção").optional(),
    band: z.string().optional(),
    description: z.string().optional(),
    projection: z.string().optional(),
    light: z.string().optional(),
    transmission: z.string().optional(),
    camera: z.string().optional(),
    live: z.string().optional(),
    sound: z.string().optional(),
    training_sound: z.string().optional(),
    photography: z.string().optional(),
    stories: z.string().optional(),
    dynamic: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum dado fornecido para atualização."
});

// Schema para busca de escala
export const searchScaleSchema = z.object({
    name: z.string()
        .min(1, { message: "Nome é obrigatório para busca." })
        .min(2, { message: "Nome deve ter pelo menos 2 caracteres para busca." })
        .trim()
});

// Schema para parâmetros de ID
export const idParamSchema = z.object({
    id: z.string()
        .min(1, { message: "ID é obrigatório." })
        .trim()
});

// Schema para query parameters de paginação
export const paginationQuerySchema = z.object({
    page: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 1)
        .refine((val) => val > 0, { message: "Página deve ser maior que 0." }),
    pageSize: z.string()
        .optional()
        .transform((val) => val ? parseInt(val) : 15)
        .refine((val) => val > 0 && val <= 100, { message: "Tamanho da página deve estar entre 1 e 100." })
});

// Tipos inferidos dos schemas
export type CreateScaleInput = z.infer<typeof createScaleSchema>;
export type UpdateScaleInput = z.infer<typeof updateScaleSchema>;
export type SearchScaleInput = z.infer<typeof searchScaleSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
