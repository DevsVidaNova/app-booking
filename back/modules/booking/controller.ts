import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as handler from './handler';
import { createBookingSchema, updateBookingSchema } from './schema';

// 📌 1. Criar uma nova reserva
export const createBooking = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  // 🔧 VALIDAÇÃO ZOD: Validar dados de entrada
  try {
    const validatedData = createBookingSchema.parse(req.body);
    
    const user = (req as any).profile || { id: (req as any).user?.id };
    await handler.create(user, validatedData, res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Dados inválidos",
        details: error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }
    
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao criar reserva.' });
  }
};

// 📌 2. Listar todas reservas
export async function getBooking(req: Request, res: Response): Promise<void> {
  return handler.getBooking(req, res);
}

// 📌 3. Pegar reserva por ID
export async function getBookingById(req: Request, res: Response): Promise<void> {
  return handler.getBookingById(req, res);
}

// 📌 4. Atualizar reserva
export async function updateBooking(req: Request, res: Response): Promise<void> {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "Nenhum campo válido enviado para atualização" });
    return;
  }
  
  // 🔧 VALIDAÇÃO ZOD: Validar dados de entrada
  try {
    const validatedData = updateBookingSchema.parse(req.body);
    
    // Adicionar dados validados de volta ao req.body para manter compatibilidade
    req.body = validatedData;
    
    return handler.updateBooking(req, res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Dados inválidos",
        details: error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }
    
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

// 📌 5. Deletar reserva
export async function deleteBooking(req: Request, res: Response): Promise<void> {
  return handler.deleteBooking(req, res);
}

// 📌 6. Buscar com filtro
export const getBookingByFilter = async (req: Request, res: Response): Promise<void> => {
  return handler.getBookingByFilter(req, res);
};

// 📌 7. Listar minhas reservas
export async function getBookingMy(req: Request, res: Response): Promise<void> {
  return handler.getBookingMy(req, res);
}

// 📌 8. Listar reservas para hoje
export async function getBookingsByToday(req: Request, res: Response): Promise<void> {
  return handler.getBookingsByToday(req, res);
}

// 📌 9. Listar reservas para semana
export async function getBookingsByWeek(req: Request, res: Response): Promise<void> {
  return handler.getBookingsByWeek(req, res);
}

// 📌 10. Listar reservas para mês
export async function getBookingsByMonth(req: Request, res: Response): Promise<void> {
  await handler.getBookingsByMonth(req, res);
}

// 📌 11. Listar reservas para calendário
export async function getBookingsOfCalendar(req: Request, res: Response): Promise<void> {
  await handler.getBookingsOfCalendar(req, res);
}

export async function getBookingsByAll(req: Request, res: Response): Promise<void> {
  await handler.getBookingsByAll(req, res);
}

// 📌 12. Buscar reservas por descrição
export async function searchBookingsByDescription(req: Request, res: Response): Promise<void> {
  await handler.searchBookingsByDescription(req, res);
}
