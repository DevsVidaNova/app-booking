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
  searchBookingsByDescription,
} from "./controller";

const BookingRouter = Router();

// 📍 Rotas
BookingRouter.post("/", requireAuth, createBooking);

BookingRouter.get("/", publicRoute, getBooking);
BookingRouter.get("/my", requireAuth, getBookingMy);

BookingRouter.get("/all", publicRoute, getBookingsByAll);
BookingRouter.get("/today", publicRoute, getBookingsByToday);
BookingRouter.get("/week", publicRoute, getBookingsByWeek);
BookingRouter.get("/month", publicRoute, getBookingsByMonth);
BookingRouter.get("/calendar", publicRoute, getBookingsOfCalendar);

BookingRouter.get("/search", requireAuth, searchBookingsByDescription);
BookingRouter.post("/filter", requireAuth, getBookingByFilter);

BookingRouter.get("/:id", publicRoute, getBookingById);
BookingRouter.put("/:id", requireAdmin, updateBooking);
BookingRouter.delete("/:id", requireAuth, requireAdmin, deleteBooking);

export default BookingRouter;
