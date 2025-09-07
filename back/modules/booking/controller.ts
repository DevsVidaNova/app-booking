import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { BookingHandler } from './handler';
import { createBookingSchema, updateBookingSchema } from './schema';

// 📌 1. Criar uma nova reserva
export const createBooking = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const validatedData = createBookingSchema.parse(req.body);

    const user = (req as any).profile || { id: (req as any).user?.id };
    await BookingHandler.create(user, validatedData, res);
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
  return BookingHandler.list(req, res);
}

// 📌 3. Pegar reserva por ID
export async function getBookingById(req: Request, res: Response): Promise<void> {
  return BookingHandler.single(req, res);
}

// 📌 4. Atualizar reserva
export async function updateBooking(req: Request, res: Response): Promise<void> {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "Nenhum campo válido enviado para atualização" });
    return;
  }

  try {
    const validatedData = updateBookingSchema.parse(req.body);

    req.body = validatedData;

    return BookingHandler.update(req, res);
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
  return BookingHandler.delete(req, res);
}

// 📌 6. Buscar com filtro
export const getBookingByFilter = async (req: Request, res: Response): Promise<void> => {
  return BookingHandler.filter(req, res);
};

// 📌 7. Listar minhas reservas
export async function getBookingMy(req: Request, res: Response): Promise<void> {
  return BookingHandler.listByMe(req, res);
}

// 📌 8. Listar reservas para hoje
export async function getBookingsByToday(req: Request, res: Response): Promise<void> {
  return BookingHandler.listByToday(req, res);
}

// 📌 9. Listar reservas para semana
export async function getBookingsByWeek(req: Request, res: Response): Promise<void> {
  return BookingHandler.listByWeek(req, res);
}

// 📌 10. Listar reservas para mês
export async function getBookingsByMonth(req: Request, res: Response): Promise<void> {
  await BookingHandler.listByMonth(req, res);
}

// 📌 11. Listar reservas para calendário
export async function getBookingsOfCalendar(req: Request, res: Response): Promise<void> {
  await BookingHandler.listByCalendar(req, res);
}

// 📌 12. Listar todas reservas (admin)
export async function getBookingsByAll(req: Request, res: Response): Promise<void> {
  await BookingHandler.listByAll(req, res);
}

