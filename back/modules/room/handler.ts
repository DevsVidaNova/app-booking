
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { db } from "@/config/db";
dayjs.extend(customParseFormat);

import { getPagination } from "@/utils/pagination";
import { RoomInput, UpdateRoomInput } from "./types";


export const RoomHandler = {

  async create(data: RoomInput) {
    const room = await db.room.create({ data });
    return { data: room, error: null };
  },

  async list(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [rooms, total] = await Promise.all([
      db.room.findMany({ skip, take: limit }),
      db.room.count()
    ]);
    const pagination = getPagination(page, limit, total);
    return {
      data: rooms,
      ...pagination,
      error: null
    };
  },

  async single(id: string) {
    try {
      const roomData = await db.room.findUnique({ where: { id } });
      if (!roomData) {
        return { data: null, error: "Sala não encontrada." };
      }
      const bookingsData = await db.booking.findMany({
        where: { roomId: id },
        orderBy: { date: "asc" },
        include: { user: true }
      });
      // Determinar o próximo agendamento
      const now = dayjs();
      const today = now.format("YYYY-MM-DD");
      const currentTime = now.format("HH:mm:ss");
      let nextBooking = null;
      if (bookingsData && bookingsData.length > 0) {

        interface BookingUser {
          id: string;
          name: string;
          email: string;
        }

        interface BookingData {
          id: string;
          description: string;
          date: Date | string | null;
          startTime: string;
          endTime: string;
          repeat: any;
          dayRepeat: any;
          user?: BookingUser | null;
        }

        const futureBookings: any[] = bookingsData.filter((booking: any) => {
          if (booking.repeat) return true;
          if (booking.date) {
            const bookingDate = booking.date instanceof Date ? booking.date.toISOString().split('T')[0] : booking.date;
            if (bookingDate > today) return true;
            if (bookingDate === today && booking.startTime > currentTime) return true;
          }
          return false;
        });
        if (futureBookings.length > 0) {
          futureBookings.sort((a, b) => {
            if (a.repeat && !b.repeat) return -1;
            if (!a.repeat && b.repeat) return 1;
            if (a.date && b.date) {
              const dateA = a.date instanceof Date ? a.date.toISOString().split('T')[0] : a.date as string;
              const dateB = b.date instanceof Date ? b.date.toISOString().split('T')[0] : b.date as string;
              if (dateA !== dateB) return dateA.localeCompare(dateB);
              return a.startTime.localeCompare(b.startTime);
            }
            return a.startTime.localeCompare(b.startTime);
          });
          nextBooking = futureBookings[0];
        }
      }
      const formattedNextBooking = nextBooking ? {
        id: nextBooking.id,
        description: nextBooking.description,
        date: nextBooking.date ? dayjs(nextBooking.date).format("DD/MM/YYYY") : null,
        start_time: nextBooking.startTime ? dayjs(nextBooking.startTime, "HH:mm:ss").format("HH:mm") : null,
        end_time: nextBooking.endTime ? dayjs(nextBooking.endTime, "HH:mm:ss").format("HH:mm") : null,
        repeat: nextBooking.repeat,
        day_repeat: nextBooking.dayRepeat,
        user: nextBooking.user ? {
          id: nextBooking.user.id,
          name: nextBooking.user.name,
          email: nextBooking.user.email
        } : null
      } : null;
      return {
        data: {
          ...roomData,
          nextBooking: formattedNextBooking,
          totalBookings: bookingsData.length
        },
        error: null
      };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  },

  async update({ id, updates }: UpdateRoomInput) {
    const room = await db.room.update({ where: { id }, data: updates });
    if (!room) {
      return { error: "Sala não encontrada.", data: null };
    }
    return { data: room, error: null };
  },

  async delete(id: string) {
    const room = await db.room.delete({ where: { id } });
    return { data: room, error: null };
  },

  async search(name: string) {
    if (!name || name.trim() === '') {
      return { error: "Nome é obrigatório para busca.", data: null };
    }
    const rooms = await db.room.findMany({
      where: {
        name: { contains: name, mode: "insensitive" }
      }
    });
    return { data: rooms, error: rooms.length === 0 ? "Sala não encontrada." : null };
  }
};
