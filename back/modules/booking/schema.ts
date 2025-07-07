import { z } from "zod";
import dayjs from "dayjs";

// Schemas de validação Zod
export const createBookingSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória").max(255, "Descrição deve ter no máximo 255 caracteres"),
    room: z.union([z.string(), z.number()]).refine((val) => {
        if (typeof val === 'string') return val.trim().length > 0;
        return val !== null && val !== undefined;
    }, "Sala é obrigatória").optional(),
    room_id: z.union([z.string(), z.number()]).refine((val) => {
        if (typeof val === 'string') return val.trim().length > 0;
        return val !== null && val !== undefined;
    }, "Sala é obrigatória").optional(),
    date: z.union([z.string(), z.null()]).refine((val) => {
        if (val === null) return true;
    if (typeof val === 'string' && val.trim() === '') return true; // Permitir string vazia
        return dayjs(val, "DD/MM/YYYY", true).isValid() || dayjs(val, "YYYY-MM-DD", true).isValid();
    }, "Data deve estar no formato DD/MM/YYYY ou YYYY-MM-DD").optional(),
    start_time: z.string().min(1, "Horário de início é obrigatório"),
    end_time: z.string().min(1, "Horário de fim é obrigatório"),
    repeat: z.union([z.enum(["day", "week", "month", "none"]), z.null(), z.literal("null")]).optional(),
    day_repeat: z.union([z.number(), z.null()]).optional()
}).refine((data) => {
    return data.room || data.room_id;
}, {
    message: "Sala é obrigatória (room ou room_id)",
    path: ["room"]
});

export const updateBookingSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória").max(255, "Descrição deve ter no máximo 255 caracteres").optional(),
    room: z.union([z.string(), z.number()]).refine((val) => {
        if (typeof val === 'string') return val.trim().length > 0;
        return val !== null && val !== undefined;
    }, "Sala é obrigatória").optional(),
    date: z.union([z.string(), z.null()]).refine((val) => {
        if (val === null) return true;
    if (typeof val === 'string' && val.trim() === '') return true; // Permitir string vazia
        return dayjs(val, "DD/MM/YYYY", true).isValid() || dayjs(val, "YYYY-MM-DD", true).isValid();
    }, "Data deve estar no formato DD/MM/YYYY ou YYYY-MM-DD").optional(),
    start_time: z.string().min(1, "Horário de início é obrigatório").optional(),
    end_time: z.string().min(1, "Horário de fim é obrigatório").optional(),
    repeat: z.union([z.enum(["day", "week", "month"]), z.null(), z.literal("null")]).optional(),
    day_repeat: z.union([z.number(), z.null()]).optional()
});
