/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         description:
 *           type: string
 *         roomId:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         startTime:
 *           type: string
 *         endTime:
 *           type: string
 *         repeat:
 *           type: string
 *           enum: [day, week, month, none]
 *         dayRepeat:
 *           type: integer
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateBookingInput:
 *       type: object
 *       required:
 *         - description
 *         - startTime
 *         - endTime
 *         - roomId
 *       properties:
 *         description:
 *           type: string
 *           maxLength: 255
 *         roomId:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         startTime:
 *           type: string
 *         endTime:
 *           type: string
 *         repeat:
 *           type: string
 *           enum: [day, week, month, none]
 *         dayRepeat:
 *           type: integer
 *     UpdateBookingInput:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *           maxLength: 255
 *         roomId:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         startTime:
 *           type: string
 *         endTime:
 *           type: string
 *         repeat:
 *           type: string
 *           enum: [day, week, month, none]
 *         dayRepeat:
 *           type: integer
 */

import { z } from "zod";
import dayjs from "dayjs";

// Schemas de validação Zod
export const createBookingSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória").max(255, "Descrição deve ter no máximo 255 caracteres"),
    roomId: z.string().min(1, "ID da sala é obrigatório"),
    date: z.union([z.string(), z.null()]).refine((val) => {
        if (val === null) return true;
        if (typeof val === 'string' && val.trim() === '') return true; // Permitir string vazia
        return dayjs(val, "DD/MM/YYYY", true).isValid() || dayjs(val, "YYYY-MM-DD", true).isValid();
    }, "Data deve estar no formato DD/MM/YYYY ou YYYY-MM-DD").optional(),
    startTime: z.string().min(1, "Horário de início é obrigatório"),
    endTime: z.string().min(1, "Horário de fim é obrigatório"),
    repeat: z.union([z.enum(["day", "week", "month", "none"]), z.null(), z.literal("null")]).optional(),
    dayRepeat: z.union([z.number(), z.null()]).optional()
})

export const updateBookingSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória").max(255, "Descrição deve ter no máximo 255 caracteres").optional(),
    roomId: z.string().min(1, "ID da sala é obrigatório").optional(),
    date: z.union([z.string(), z.null()]).refine((val) => {
        if (val === null) return true;
        if (typeof val === 'string' && val.trim() === '') return true; // Permitir string vazia
        return dayjs(val, "DD/MM/YYYY", true).isValid() || dayjs(val, "YYYY-MM-DD", true).isValid();
    }, "Data deve estar no formato DD/MM/YYYY ou YYYY-MM-DD").optional(),
    startTime: z.string().min(1, "Horário de início é obrigatório").optional(),
    endTime: z.string().min(1, "Horário de fim é obrigatório").optional(),
    repeat: z.union([z.enum(["day", "week", "month"]), z.null(), z.literal("null")]).optional(),
    dayRepeat: z.union([z.number(), z.null()]).optional()
});
