import dayjs from "dayjs";
import { db } from "@/config/db";

export interface AnalyticsCounts {
  rooms: number;
  bookings: number;
  users: number;
  week: number;
  members: number;
}

export interface HandlerResult<T> {
  data?: T;
  error?: string;
}

export const AnalyticsHandler = {
  async getCountHandler(tableName: string): Promise<HandlerResult<number>> {
    try {
      if (!tableName || typeof tableName !== 'string' || tableName.trim() === '') {
        return { error: 'Nome da tabela é obrigatório e deve ser uma string válida.' };
      }

      const allowedTables = ['rooms', 'bookings', 'user_profiles', 'members'];
      if (!allowedTables.includes(tableName)) {
        return { error: `Tabela '${tableName}' não é permitida para consulta.` };
      }

      let count: number;
      switch (tableName) {
        case 'rooms':
          count = await db.room.count();
          break;
        case 'bookings':
          count = await db.booking.count();
          break;
        case 'user_profiles':
          count = await db.user.count();
          break;
        case 'members':
          count = await db.member.count();
          break;
        default:
          return { error: `Tabela '${tableName}' não suportada.` };
      }
      return { data: count || 0 };
    } catch (err: any) {
      return { error: err.message };
    }
  },
  async getStatsHandler(): Promise<HandlerResult<AnalyticsCounts>> {
    try {
      const [rooms, bookings, users, members] = await Promise.all([
        this.getCountHandler("rooms"),
        this.getCountHandler("bookings"),
        this.getCountHandler("user_profiles"),
        this.getCountHandler("members")
      ]);

      if (rooms.error || bookings.error || users.error || members.error) {
        return {
          error: JSON.stringify({
            roomsError: rooms.error,
            bookingsError: bookings.error,
            usersError: users.error,
            membersError: members.error
          })
        };
      }

      const lastWeekISO = dayjs().subtract(7, "days").format("YYYY-MM-DD");
      const week = await db.booking.count({
        where: {
          date: {
            gte: lastWeekISO
          }
        }
      });
      if (week) {
        return { error: week.toString() };
      }

      return {
        data: {
          rooms: rooms.data || 0,
          bookings: bookings.data || 0,
          users: users.data || 0,
          week: week || 0,
          members: members.data || 0
        }
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}

