import dayjs from "dayjs";
import "dayjs/locale/pt.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { db } from "@/config/db";
import { Request, Response } from "express";
import { CreateBookingInput } from "./types";

dayjs.extend(customParseFormat);
dayjs.locale("pt");

type ProfileRequest = Request & { profile?: { id: string } };

const normalizeTime = (time: string | undefined | null): string | null => {
  if (!time) return null;

  // Remover espaços em branco
  const cleanTime = time.trim();

  // Verificar se o formato básico está correto (H:M, HH:MM ou HH:MM:SS)
  const timeRegex =
    /^([0-9]|[0-1][0-9]|2[0-3]):([0-9]|[0-5][0-9])(:([0-5][0-9]))?$/;
  if (!timeRegex.test(cleanTime)) {
    return null; // Horário inválido
  }

  const parts = cleanTime.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

  // Validar ranges
  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null; // Horário inválido
  }

  // Formatar com zero à esquerda e adicionar segundos se necessário
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

// Função auxiliar para formatar dados de reserva
const formatBookingData = (booking: any) => {
  const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dayweek = booking.date
    ? parseInt(dayjs(booking.date).locale("pt").format("d"))
    : null;
  const repeatDay = booking.dayRepeat
    ? weekDaysAbbr[booking.dayRepeat]
    : null;
  const dayOfWeek = dayweek !== null ? weekDaysAbbr[dayweek] : null;
  const monthName = booking.date
    ? dayjs(booking.date).locale("pt").format("MMM")
    : null;

  const displayDayOfWeek = booking.repeat === "day" ? repeatDay : (dayOfWeek || repeatDay);
  
  return {
    id: booking.id,
    description: booking.description,
    room: booking.room
      ? {
        id: booking.room.id,
        name: booking.room.name,
        size: booking.room.size,
      }
      : null,
    ...(booking.date && { date: dayjs(booking.date).format("DD/MM/YYYY") }),
    ...(displayDayOfWeek && { dayOfWeek: displayDayOfWeek }),
    ...(monthName && { month: monthName }),
    startTime: booking.startTime
      ? dayjs(booking.startTime, "HH:mm:ss").format("HH:mm")
      : null,
    endTime: booking.endTime
      ? dayjs(booking.endTime, "HH:mm:ss").format("HH:mm")
      : null,
    repeat: booking.repeat,
    user: booking.user
      ? {
        id: booking.user.id,
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone,
      }
      : null,
  };
};

// 🔧 FUNÇÃO CENTRALIZADA: Verificar conflitos de reserva
const checkBookingConflicts = async (
  room: string | number,
  date: string | null,
  repeat: string | null,
  dayRepeat: number | null | undefined,
  startTime: string | null,
  endTime: string | null,
  excludeId?: string | number
): Promise<any[]> => {
  const conflictQueries: Promise<any[]>[] = [];

  // 1. VERIFICAR CONFLITOS COM RESERVAS ESPECÍFICAS
  if (date && startTime && endTime) {
    conflictQueries.push(
      db.booking.findMany({
        where: {
          roomId: typeof room === 'string' ? room : String(room),
          date: new Date(date),
          startTime: { lt: endTime },
          endTime: { gt: startTime },
          ...(excludeId ? { NOT: { id: String(excludeId) } } : {}),
        },
      })
    );
  }

  // 2. VERIFICAR CONFLITOS COM RESERVAS RECORRENTES
  if (date && startTime && endTime) {
    const targetDate = dayjs(date);
    const targetDayOfWeek = targetDate.day(); // 0-6 (domingo-sábado)
    const targetDayOfMonth = targetDate.date(); // 1-31

    // Diárias
    conflictQueries.push(
      db.booking.findMany({
        where: {
          roomId: typeof room === 'string' ? room : String(room),
          repeat: 'day',
          startTime: { lt: endTime },
          endTime: { gt: startTime },
          ...(excludeId ? { NOT: { id: String(excludeId) } } : {}),
        },
      })
    );

    // Semanais
    conflictQueries.push(
      db.booking.findMany({
        where: {
          roomId: typeof room === 'string' ? room : String(room),
          repeat: 'week',
          dayRepeat: targetDayOfWeek,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
          ...(excludeId ? { NOT: { id: String(excludeId) } } : {}),
        },
      })
    );

    // Mensais
    conflictQueries.push(
      db.booking.findMany({
        where: {
          roomId: typeof room === 'string' ? room : String(room),
          repeat: 'month',
          dayRepeat: targetDayOfMonth,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
          ...(excludeId ? { NOT: { id: String(excludeId) } } : {}),
        },
      })
    );
  }

  // 3. VERIFICAR CONFLITOS PARA RESERVAS RECORRENTES
  if (repeat && repeat !== "none" && startTime && endTime) {
    if (repeat === "day") {
      // Diárias
      conflictQueries.push(
        db.booking.findMany({
          where: {
            roomId: typeof room === 'string' ? room : String(room),
            repeat: 'day',
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            ...(excludeId ? { NOT: { id: String(excludeId) } } : {}),
          },
        })
      );
      // Específicas
      conflictQueries.push(
        db.booking.findMany({
          where: {
            roomId: typeof room === 'string' ? room : String(room),
            repeat: null,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            ...(excludeId ? { NOT: { id: String(excludeId) } } : {}),
          },
        })
      );
    }

    if (repeat === "week" && dayRepeat !== null && dayRepeat !== undefined) {
      // Semanais
      conflictQueries.push(
        db.booking.findMany({
          where: {
            roomId: typeof room === 'string' ? room : String(room),
            repeat: 'week',
            dayRepeat: dayRepeat,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            ...(excludeId ? { NOT: { id: String(excludeId) } } : {}),
          },
        })
      );
      // Específicas no mesmo dia da semana
      conflictQueries.push(
        db.booking.findMany({
          where: {
            roomId: typeof room === 'string' ? room : String(room),
            repeat: null,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            ...(excludeId ? { NOT: { id: String(excludeId) } } : {}),
          },
        }).then((result: any[]) =>
          result.filter((booking: any) => {
            if (booking.date) {
              const bookingDayOfWeek: number = dayjs(booking.date).day();
              return bookingDayOfWeek === dayRepeat;
            }
            return false;
          })
        )
      );
    }

    if (repeat === "month" && dayRepeat !== null && dayRepeat !== undefined) {
      // Mensais
      conflictQueries.push(
        db.booking.findMany({
          where: {
            roomId: typeof room === 'string' ? room : String(room),
            repeat: 'month',
            dayRepeat: dayRepeat,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            ...(excludeId ? { NOT: { id: String(excludeId) } } : {}),
          },
        })
      );
      // Específicas no mesmo dia do mês
      conflictQueries.push(
        db.booking.findMany({
          where: {
            roomId: typeof room === 'string' ? room : String(room),
            repeat: null,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            ...(excludeId ? { NOT: { id: String(excludeId) } } : {}),
          },
        }).then((result: any[]) =>
          result.filter((booking: any) => {
            if (booking.date) {
              const bookingDayOfMonth: number = dayjs(booking.date).date();
              return bookingDayOfMonth === dayRepeat;
            }
            return false;
          })
        )
      );
    }
  }

  // Executar todas as consultas
  const results = await Promise.all(conflictQueries);
  const allConflicts: any[] = [];

  for (const result of results) {
    if (Array.isArray(result)) {
      allConflicts.push(...result);
    }
  }

  return allConflicts;
};

export const BookingHandler = {
  async create(
    user: { id: string },
    data: CreateBookingInput,
    res: Response
  ): Promise<void> {
    const userId = user.id;

    const roomData = await db.room.findUnique({
      where: { id: data.roomId }
    });

    if (!roomData) {
      res.status(400).json({ message: "Sala não encontrada." });
      return;
    }

    const sanitizedRepeat: string | null = data.repeat === null || data.repeat === "none" ? null : data.repeat || null;


    const formattedStartTime: string | null = normalizeTime(data.startTime);
    const formattedEndTime: string | null = normalizeTime(data.endTime);


    const formattedDate: string | null = (data.date && data.date !== null)
      ? dayjs(data.date, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
      : null;

    try {
      // 🔧 CORREÇÃO COMPLETA: Verificar TODOS os tipos de conflito
      const conflictResults = await checkBookingConflicts(
        data.roomId,
        formattedDate,
        sanitizedRepeat,
        data.dayRepeat,
        formattedStartTime,
        formattedEndTime
      );

      if (conflictResults.length > 0) {
        res
          .status(400)
          .json({
            message: "Conflito de horário: já existe uma reserva nesse intervalo.",
          });
        return;
      }
      // 🔧 CORREÇÃO: Definir dayRepeat baseado no tipo de recorrência
      let finalDayRepeat = data.dayRepeat;

      // Para reservas recorrentes, se dayRepeat não foi fornecido, calcular baseado na data
      if (sanitizedRepeat && formattedDate) {
        if (sanitizedRepeat === "week" && (finalDayRepeat === null || finalDayRepeat === undefined)) {
          finalDayRepeat = dayjs(formattedDate).day(); // 0-6 (domingo-sábado)
        } else if (sanitizedRepeat === "month" && (finalDayRepeat === null || finalDayRepeat === undefined)) {
          finalDayRepeat = dayjs(formattedDate).date(); // 1-31 (dia do mês)
        }
      }

      const bookingData = await db.booking.create({
        data: {
          description: data.description,
          roomId: data.roomId,
          date: sanitizedRepeat ? null : (formattedDate ? new Date(formattedDate) : null),
          startTime: formattedStartTime!,
          endTime: formattedEndTime!,
          repeat: sanitizedRepeat as any,
          dayRepeat: finalDayRepeat,
          userId: userId,
        },
      });
      res.status(201).json(bookingData);
    } catch (err) {
      res.status(500).json({ message: "Erro ao criar reserva" });
    }
  },

  async update(
    req: Request,
    res: Response
  ): Promise<void> {
    const { id } = req.params;

    const updateFields: Record<string, any> = {};

    // Validações de horário já feitas pelo Zod no controller
    if (req.body.startTime !== undefined) {
      updateFields.startTime = normalizeTime(req.body.startTime);
    }

    if (req.body.endTime !== undefined) {
      updateFields.endTime = normalizeTime(req.body.endTime);
    }

    if (req.body.description !== undefined)
      updateFields.description = req.body.description;
    if (req.body.roomId !== undefined) updateFields.roomId = req.body.roomId;
    if (req.body.date !== undefined)
      updateFields.date = req.body.date
        ? new Date(dayjs(req.body.date, "DD/MM/YYYY").format("YYYY-MM-DD"))
        : null;
    if (req.body.repeat !== undefined)
      updateFields.repeat = req.body.repeat === "null" ? null : req.body.repeat;
    if (req.body.dayRepeat !== undefined)
      updateFields.dayRepeat = req.body.dayRepeat;
    try {
      const existingData = await db.booking.findUnique({ where: { id: id } });
      if (!existingData) {
        res.status(404).json({ message: "Reserva não encontrada" });
        return;
      }

      // 🔧 CORREÇÃO: Validar campos obrigatórios se estiverem sendo atualizados
      const requiredFields = ["roomId", "description"];
      for (const field of requiredFields) {
        const value =
          updateFields[field] !== undefined
            ? updateFields[field]
            : (existingData as any)[field];
        if (!value || value.toString().trim() === "") {
          res.status(400).json({ message: `Campo obrigatório: ${field}` });
          return;
        }
      }

      // 🔧 VALIDAÇÃO ROBUSTA: Verificar se a combinação de horários é válida
      const finalStartTime =
        updateFields.startTime !== undefined
          ? updateFields.startTime
          : existingData.startTime;
      const finalEndTime =
        updateFields.endTime !== undefined
          ? updateFields.endTime
          : existingData.endTime;


      if (
        updateFields.roomId ||
        updateFields.date ||
        updateFields.startTime ||
        updateFields.endTime ||
        updateFields.repeat ||
        updateFields.dayRepeat
      ) {
        const finalRoom =
          updateFields.roomId !== undefined ? updateFields.roomId : existingData.roomId;
        const finalDate =
          updateFields.date !== undefined ? updateFields.date : existingData.date;
        const finalRepeat =
          updateFields.repeat !== undefined
            ? updateFields.repeat
            : existingData.repeat;
        const finalDayRepeat =
          updateFields.dayRepeat !== undefined
            ? updateFields.dayRepeat
            : existingData.dayRepeat;

        // Usar função centralizada de verificação de conflitos (excluindo esta reserva)
        const conflictResults = await checkBookingConflicts(
          finalRoom,
          finalDate,
          finalRepeat,
          finalDayRepeat,
          finalStartTime,
          finalEndTime,
          id // Excluir a própria reserva da verificação
        );

        if (conflictResults.length > 0) {
          res
            .status(400)
            .json({
              message:
                "Conflito de horário: já existe uma reserva nesse intervalo.",
            });
          return;
        }
      }

      const updated = await db.booking.update({
        where: { id: id },
        data: updateFields,
      });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Erro ao atualizar reserva" });
    }
  },

  async list(_req: Request, res: Response): Promise<void> {
    try {
      const data = await db.booking.findMany({ include: { user: true, room: true } });
      if (!data || data.length === 0) {
        res.json([]);
        return;
      }

      const formattedData = data.map((booking: any) => formatBookingData(booking));
      res.json(formattedData);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar reservas" });
    }
  },

  async delete(
    req: Request,
    res: Response
  ): Promise<void> {
    const { id } = req.params;
    try {
      await db.booking.delete({ where: { id: id } });
      res.json({ message: "Reserva deletada com sucesso" });
    } catch (_err) {
      res.status(500).json({ error: "Erro ao deletar reserva" });
    }
  },

  async single(
    req: Request,
    res: Response
  ): Promise<void> {
    const { id } = req.params;
    try {
      const data = await db.booking.findUnique({
        where: { id: id },
        include: { user: true, room: true },
      });
      if (!data) {
        res.status(404).json({ error: "Reserva não encontrada" });
        return;
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar reserva por ID" });
    }
  },

  async filter(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { userId, date, room, repeat, dayRepeat } = req.body;
      const where: Record<string, any> = {};
      if (userId) where.userId = userId;
      if (date) where.date = date;
      if (room) where.room = room;
      if (repeat) where.repeat = repeat;
      if (dayRepeat) where.dayRepeat = dayRepeat;

      const data = await db.booking.findMany({ 
        where,
        include: { user: true, room: true }
      });

      const formattedData = (data || []).map((booking: any) => formatBookingData(booking));
      res.json(formattedData);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar reservas" });
    }
  },

  async listByWeek(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const startOfWeek = dayjs().startOf("week").format("YYYY-MM-DD");
      const endOfWeek = dayjs().endOf("week").format("YYYY-MM-DD");

      // Busca reservas semanais e específicas da semana atual
      const [weeklyBookings, specificBookings] = await Promise.all([
        db.booking.findMany({
          where: { repeat: "week" },
          include: { user: true, room: true }
        }),
        db.booking.findMany({
          where: {
            date: { gte: new Date(startOfWeek), lte: new Date(endOfWeek) },
            repeat: null
          },
          include: { user: true, room: true }
        })
      ]);

      const data = [...weeklyBookings, ...specificBookings];

      const formattedData = (data || []).map((booking: any) => formatBookingData(booking));

      res.json(formattedData);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar reservas" });
    }
  },

  async listByMonth(_req: Request, res: Response) {
    try {
      const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
      const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");
      const endDay = dayjs().endOf("month").date();

      // Buscar reservas com repetição mensal e específicas do mês
      const [monthlyBookings, specificBookings] = await Promise.all([
        db.booking.findMany({
          where: {
            repeat: "month",
            dayRepeat: { gte: 1, lte: endDay }
          },
          include: { user: true, room: true }
        }),
        db.booking.findMany({
          where: {
            date: { gte: new Date(startOfMonth), lte: new Date(endOfMonth) },
            repeat: null
          },
          include: { user: true, room: true }
        })
      ]);

      const data = [...monthlyBookings, ...specificBookings];

      const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const formattedData = (data || []).map((booking: any) => {
        const dayweek = booking.date
          ? dayjs(booking.date).locale("pt").format("d")
          : null;
        const repeatDay = booking.dayRepeat !== undefined && booking.dayRepeat !== null
          ? weekDaysAbbr[booking.dayRepeat]
          : null;
        const dayOfWeek =
          dayweek !== null ? weekDaysAbbr[parseInt(dayweek, 10)] : null;
        const monthName = booking.date
          ? dayjs(booking.date).locale("pt").format("MMM")
          : null;

        return {
          id: booking.id,
          description: booking.description,
          room: booking.room
            ? {
              id: booking.room.id,
              name: booking.room.name,
              size: booking.room.size,
            }
            : null,
          date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
          dayOfWeek: dayOfWeek,
          month: monthName,
          startTime: dayjs(booking.startTime, "HH:mm:ss").format("HH:mm"),
          endTime: dayjs(booking.endTime, "HH:mm:ss").format("HH:mm"),
          repeat: booking.repeat,
          repeat_day: repeatDay,
          user: booking.user
            ? {
              id: booking.user.id,
              name: booking.user.name,
              email: booking.user.email,
              phone: booking.user.phone,
            }
            : null,
        };
      });

      res.json(formattedData);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar reservas" });
    }
  },

  async listByAll(_req: Request, res: Response): Promise<void> {
    try {
      const data = await db.booking.findMany({
        include: { user: true, room: true }
      });

      if (!data || data.length === 0) {
        res.json([]);
        return;
      }

      const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const formattedData = data.map((booking: any) => {
        const dayweek = booking.date
          ? dayjs(booking.date).locale("pt").format("d")
          : null;
        const repeatDay = booking.dayRepeat !== undefined && booking.dayRepeat !== null
          ? weekDaysAbbr[booking.dayRepeat]
          : null;
        const dayOfWeek =
          dayweek !== null ? weekDaysAbbr[parseInt(dayweek, 10)] : null;
        const monthName = booking.date
          ? dayjs(booking.date).locale("pt").format("MMM")
          : null;

        return {
          id: booking.id,
          description: booking.description,
          room: booking.room
            ? {
              id: booking.room.id,
              name: booking.room.name,
              size: booking.room.size,
            }
            : null,
          date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
          dayOfWeek: dayOfWeek,
          month: monthName,
          startTime: booking.startTime
            ? dayjs(booking.startTime, "HH:mm:ss").format("HH:mm")
            : null,
          endTime: booking.endTime
            ? dayjs(booking.endTime, "HH:mm:ss").format("HH:mm")
            : null,
          repeat: booking.repeat,
          repeatDay: repeatDay,
          user: booking.user
            ? {
              id: booking.user.id,
              name: booking.user.name,
              email: booking.user.email,
              phone: booking.user.phone,
            }
            : null,
        };
      });

      res.json(formattedData);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar reservas" });
    }
  },

  async listByCalendar(req: Request, res: Response) {
    try {
      const { month, year } = req.query;
      const currentMonth = month
        ? parseInt(month.toString(), 10)
        : dayjs().month() + 1;
      const currentYear = year ? parseInt(year.toString(), 10) : dayjs().year();

      const startOfMonth = dayjs()
        .year(currentYear)
        .month(currentMonth - 1)
        .startOf("month");
      const endOfMonth = dayjs()
        .year(currentYear)
        .month(currentMonth - 1)
        .endOf("month");
      const endDay = endOfMonth.date();

      // Buscar reservas mensais, semanais e específicas do mês
      const [monthlyBookings, weeklyBookings, specificBookings] = await Promise.all([
        db.booking.findMany({
          where: {
            repeat: "month",
            dayRepeat: { gte: 1, lte: endDay }
          },
          include: { user: true, room: true }
        }),
        db.booking.findMany({
          where: { repeat: "week" },
          include: { user: true, room: true }
        }),
        db.booking.findMany({
          where: {
            date: { gte: startOfMonth.toDate(), lte: endOfMonth.toDate() },
            repeat: null
          },
          include: { user: true, room: true }
        })
      ]);

      const data = [
        ...(monthlyBookings || []),
        ...(weeklyBookings || []),
        ...(specificBookings || []),
      ];

      const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const formattedData: any[] = [];

      data.forEach((booking: any) => {
        const formattedDate = dayjs(booking.date);

        if (!formattedDate.isValid() && booking.repeat !== "week") {
          return;
        }

        const dayweek = formattedDate.isValid()
          ? formattedDate.locale("pt").format("d")
          : null;
        const repeatDay = booking.dayRepeat !== undefined && booking.dayRepeat !== null
          ? booking.day_repeat
          : null;
        const dayOfWeek = dayweek !== null ? weekDaysAbbr[Number(dayweek)] : null;
        const monthName = formattedDate.isValid()
          ? formattedDate.locale("pt").format("MMM")
          : null;

        formattedData.push({
          id: booking.id,
          description: booking.description,
          room: booking.room
            ? {
              id: booking.room.id,
              name: booking.room.name,
              size: booking.room.size,
            }
            : null,
          date: formattedDate.isValid()
            ? formattedDate.format("YYYY-MM-DD")
            : null,
          dayOfWeek: dayOfWeek,
          month: monthName,
          startTime: dayjs(booking.startTime, "HH:mm:ss").format("HH:mm"),
          endTime: dayjs(booking.endTime, "HH:mm:ss").format("HH:mm"),
          repeat: booking.repeat,
          repeatDay: booking.dayRepeat,
          user: booking.user
            ? {
              id: booking.user.id,
              name: booking.user.name,
              email: booking.user.email,
              phone: booking.user.phone,
            }
            : null,
        });

        // Eventos semanais: gera todas as ocorrências no mês
        if (booking.repeat === "week" && repeatDay !== null) {
          let currentDay = startOfMonth.clone();
          while (currentDay.day() !== repeatDay) {
            currentDay = currentDay.add(1, "day");
          }
          while (currentDay.isBefore(endOfMonth, "day")) {
            formattedData.push({
              id: booking.id,
              description: booking.description,
              room: booking.room
                ? {
                  id: booking.room.id,
                  name: booking.room.name,
                  size: booking.room.size,
                }
                : null,
              date: currentDay.format("DD/MM/YYYY"),
              dayOfWeek: weekDaysAbbr[currentDay.day()],
              month: currentDay.format("MMM"),
              startTime: dayjs(booking.startTime, "HH:mm:ss").format("HH:mm"),
              endTime: dayjs(booking.endTime, "HH:mm:ss").format("HH:mm"),
              repeat: booking.repeat,
              repeatDay: booking.dayRepeat,
              user: booking.user
                ? {
                  id: booking.user.id,
                  name: booking.user.name,
                  email: booking.user.email,
                  phone: booking.user.phone,
                }
                : null,
            });
            currentDay = currentDay.add(1, "week");
          }
        }
      });

      res.json(formattedData);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar reservas" });
    }
  },

  async listByMe(
    req: ProfileRequest,
    res: Response
  ): Promise<void> {
    const userId = req.profile?.id;
    if (!userId) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }
    try {
      // Usar Prisma (db) para buscar reservas do usuário com JOIN otimizado
      const data = await db.booking.findMany({
        where: { userId: userId },
        include: { user: true, room: true }
      });

      const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const formattedData = (data || []).map((booking: any) => {
        const dayweek = booking.date
          ? parseInt(dayjs(booking.date).locale("pt").format("d"))
          : null;
        const repeatDay = booking.dayRepeat !== undefined && booking.dayRepeat !== null
          ? weekDaysAbbr[booking.dayRepeat]
          : null;
        const dayOfWeek = dayweek !== null ? weekDaysAbbr[dayweek] : null;
        const monthName = booking.date
          ? dayjs(booking.date).locale("pt").format("MMM")
          : null;

        return {
          id: booking.id,
          description: booking.description,
          room: booking.room
            ? {
              id: booking.room.id,
              name: booking.room.name,
              size: booking.room.size,
            }
            : null,
          date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
          day_of_week: dayOfWeek == null ? repeatDay : dayOfWeek,
          month: monthName,
          startTime: booking.startTime
            ? dayjs(booking.startTime, "HH:mm:ss").format("HH:mm")
            : null,
          endTime: booking.endTime
            ? dayjs(booking.endTime, "HH:mm:ss").format("HH:mm")
            : null,
          repeat: booking.repeat,
          repeat_day: repeatDay,
          user: booking.user
            ? {
              id: booking.user.id,
              name: booking.user.name,
              email: booking.user.email,
              phone: booking.user.phone,
            }
            : null,
        };
      });
      res.json(formattedData);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar reservas" });
    }
  },

  async listByToday(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const today = dayjs().startOf("day").format("YYYY-MM-DD");
      // Busca reservas diárias (repeat = 'day') e específicas para hoje
      const [dailyBookings, specificBookings] = await Promise.all([
        db.booking.findMany({
          where: { repeat: "day" },
          include: { user: true, room: true }
        }),
        db.booking.findMany({
          where: { date: new Date(today), repeat: null },
          include: { user: true, room: true }
        })
      ]);

      const data = [...dailyBookings, ...specificBookings];

      const formattedData = (data || []).map((booking: any) => {
        return {
          id: booking.id,
          description: booking.description,
          room: booking.room
            ? {
              id: booking.room.id,
              name: booking.room.name,
              size: booking.room.size,
            }
            : null,
          date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
          startTime: dayjs(booking.startTime, "HH:mm:ss").format("HH:mm"),
          endTime: dayjs(booking.endTime, "HH:mm:ss").format("HH:mm"),
          repeat: booking.repeat,
          dayRepeat: booking.dayRepeat,
          user: booking.user
            ? {
              id: booking.user.id,
              name: booking.user.name,
              email: booking.user.email,
              phone: booking.user.phone,
            }
            : null,
        };
      });

      res.json(formattedData);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar reservas" });
    }
  }
}
