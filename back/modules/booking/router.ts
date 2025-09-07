import { Router } from "express";
import { requireAuth, publicRoute, requireAdmin } from "@/config/middleware";
import {
  createBooking,
  getBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingByFilter,
  getBookingMy,
  getBookingsByToday,
  getBookingsByWeek,
  getBookingsByMonth,
  getBookingsByAll,
  getBookingsOfCalendar,
} from "./controller";

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Gerenciamento de reservas
 */
const BookingRouter = Router();

// 📍 Rotas
/**
 * @swagger
 * /booking:
 *   post:
 *     summary: Cria uma nova reserva
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
BookingRouter.post("/", requireAuth, createBooking);

/**
 * @swagger
 * /booking:
 *   get:
 *     summary: Lista todas as reservas
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 */
BookingRouter.get("/", publicRoute, getBooking);
/**
 * @swagger
 * /booking/my:
 *   get:
 *     summary: Lista reservas do usuário autenticado
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservas do usuário
 */
BookingRouter.get("/my", requireAuth, getBookingMy);

/**
 * @swagger
 * /booking/all:
 *   get:
 *     summary: Lista todas as reservas (admin)
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Lista completa de reservas
 */
BookingRouter.get("/all", publicRoute, getBookingsByAll);
/**
 * @swagger
 * /booking/today:
 *   get:
 *     summary: Lista reservas de hoje
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Reservas de hoje
 */
BookingRouter.get("/today", publicRoute, getBookingsByToday);
/**
 * @swagger
 * /booking/week:
 *   get:
 *     summary: Lista reservas da semana
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Reservas da semana
 */
BookingRouter.get("/week", publicRoute, getBookingsByWeek);
/**
 * @swagger
 * /booking/month:
 *   get:
 *     summary: Lista reservas do mês
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Reservas do mês
 */
BookingRouter.get("/month", publicRoute, getBookingsByMonth);
/**
 * @swagger
 * /booking/calendar:
 *   get:
 *     summary: Lista reservas para o calendário
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Reservas para o calendário
 */
BookingRouter.get("/calendar", publicRoute, getBookingsOfCalendar);

/**
 * @swagger
 * /booking/filter:
 *   post:
 *     summary: Filtra reservas por parâmetros
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Reservas filtradas
 */
BookingRouter.post("/filter", requireAuth, getBookingByFilter);

/**
 * @swagger
 * /booking/{id}:
 *   get:
 *     summary: Busca uma reserva pelo ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Reserva não encontrada
 */
BookingRouter.get("/:id", publicRoute, getBookingById);
/**
 * @swagger
 * /booking/{id}:
 *   put:
 *     summary: Atualiza uma reserva
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: Reserva atualizada
 *       404:
 *         description: Reserva não encontrada
 */
BookingRouter.put("/:id", requireAdmin, updateBooking);
/**
 * @swagger
 * /booking/{id}:
 *   delete:
 *     summary: Remove uma reserva
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Reserva removida
 *       404:
 *         description: Reserva não encontrada
 */
BookingRouter.delete("/:id", requireAuth, requireAdmin, deleteBooking);

export default BookingRouter;
