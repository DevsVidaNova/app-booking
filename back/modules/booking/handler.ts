import dayjs from "dayjs";
import "dayjs/locale/pt.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import supabase from "@/config/supabaseClient";
import { Request, Response } from "express";
import { Booking, CreateBookingInput } from "./types";

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

// Função para validar se um horário é válido
const isValidTime = (time: string | undefined | null): boolean => {
  return normalizeTime(time) !== null;
};

// Função para validar se start_time < end_time
const isValidTimeRange = (
  startTime: string | null,
  endTime: string | null
): boolean => {
  if (!startTime || !endTime) return false;
  return startTime < endTime;
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
): Promise<Booking[]> => {
  const conflictQueries = [];

  // 1. VERIFICAR CONFLITOS COM RESERVAS ESPECÍFICAS
  if (date) {
    // Para reserva específica, verificar conflitos com outras específicas na mesma data
    conflictQueries.push(
      supabase
        .from("bookings")
        .select("*")
        .eq("room", room)
        .eq("date", date)
        .lt("start_time", endTime)
        .gt("end_time", startTime)
        .then(result => ({ ...result, type: 'specific_vs_specific' }))
    );
  }

  // 2. VERIFICAR CONFLITOS COM RESERVAS RECORRENTES
  if (date) {
    const targetDate = dayjs(date);
    const targetDayOfWeek = targetDate.day(); // 0-6 (domingo-sábado)
    const targetDayOfMonth = targetDate.date(); // 1-31

    // Verificar conflitos com reservas que se repetem DIARIAMENTE
    conflictQueries.push(
      supabase
        .from("bookings")
        .select("*")
        .eq("room", room)
        .eq("repeat", "day")
        .lt("start_time", endTime)
        .gt("end_time", startTime)
        .then(result => ({ ...result, type: 'specific_vs_daily' }))
    );

    // Verificar conflitos com reservas que se repetem SEMANALMENTE no mesmo dia da semana
    conflictQueries.push(
      supabase
        .from("bookings")
        .select("*")
        .eq("room", room)
        .eq("repeat", "week")
        .eq("day_repeat", targetDayOfWeek)
        .lt("start_time", endTime)
        .gt("end_time", startTime)
        .then(result => ({ ...result, type: 'specific_vs_weekly' }))
    );

    // Verificar conflitos com reservas que se repetem MENSALMENTE no mesmo dia do mês
    conflictQueries.push(
      supabase
        .from("bookings")
        .select("*")
        .eq("room", room)
        .eq("repeat", "month")
        .eq("day_repeat", targetDayOfMonth)
        .lt("start_time", endTime)
        .gt("end_time", startTime)
        .then(result => ({ ...result, type: 'specific_vs_monthly' }))
    );
  }

  // 3. VERIFICAR CONFLITOS PARA RESERVAS RECORRENTES
  if (repeat && repeat !== "none") {
    if (repeat === "day") {
      // Para recorrência diária, verificar conflitos com outras diárias
      conflictQueries.push(
        supabase
          .from("bookings")
          .select("*")
          .eq("room", room)
          .eq("repeat", "day")
          .lt("start_time", endTime)
          .gt("end_time", startTime)
          .then(result => ({ ...result, type: 'daily_vs_daily' }))
      );

      
      conflictQueries.push(
        supabase
          .from("bookings")
          .select("*")
          .eq("room", room)
          .is("repeat", null)
          .lt("start_time", endTime)
          .gt("end_time", startTime)
          .then(result => ({ ...result, type: 'daily_vs_specific' }))
      );
    }

    if (repeat === "week" && dayRepeat !== null && dayRepeat !== undefined) {
      // Para recorrência semanal, verificar conflitos com outras semanais no mesmo dia
      conflictQueries.push(
        supabase
          .from("bookings")
          .select("*")
          .eq("room", room)
          .eq("repeat", "week")
          .eq("day_repeat", dayRepeat)
          .lt("start_time", endTime)
          .gt("end_time", startTime)
          .then(result => ({ ...result, type: 'weekly_vs_weekly' }))
      );

      // Verificar conflitos com reservas específicas que caem no mesmo dia da semana
      conflictQueries.push(
        supabase
          .from("bookings")
          .select("*")
          .eq("room", room)
          .is("repeat", null)
          .lt("start_time", endTime)
          .gt("end_time", startTime)
          .then(async (result) => {
            if (result.data) {
              // Filtrar apenas reservas específicas que caem no mesmo dia da semana
              const filteredData = result.data.filter((booking: any) => {
                if (booking.date) {
                  const bookingDayOfWeek = dayjs(booking.date).day();
                  return bookingDayOfWeek === dayRepeat;
                }
                return false;
              });
              return { ...result, data: filteredData, type: 'weekly_vs_specific' };
            }
            return { ...result, type: 'weekly_vs_specific' };
          })
      );
    }

    if (repeat === "month" && dayRepeat !== null && dayRepeat !== undefined) {
      // Para recorrência mensal, verificar conflitos com outras mensais no mesmo dia
      conflictQueries.push(
        supabase
          .from("bookings")
          .select("*")
          .eq("room", room)
          .eq("repeat", "month")
          .eq("day_repeat", dayRepeat)
          .lt("start_time", endTime)
          .gt("end_time", startTime)
          .then(result => ({ ...result, type: 'monthly_vs_monthly' }))
      );

      // Verificar conflitos com reservas específicas que caem no mesmo dia do mês
      conflictQueries.push(
        supabase
          .from("bookings")
          .select("*")
          .eq("room", room)
          .is("repeat", null)
          .lt("start_time", endTime)
          .gt("end_time", startTime)
          .then(async (result) => {
            if (result.data) {
              // Filtrar apenas reservas específicas que caem no mesmo dia do mês
              const filteredData = result.data.filter((booking: any) => {
                if (booking.date) {
                  const bookingDayOfMonth = dayjs(booking.date).date();
                  return bookingDayOfMonth === dayRepeat;
                }
                return false;
              });
              return { ...result, data: filteredData, type: 'monthly_vs_specific' };
            }
            return { ...result, type: 'monthly_vs_specific' };
          })
      );
    }
  }

  // Executar todas as consultas
  const results = await Promise.all(conflictQueries);
  const allConflicts: Booking[] = [];

  for (const result of results) {
    if (result.data && Array.isArray(result.data)) {
      console.log('🔍 Dados antes do filtro:', result.data.map(b => ({ id: b.id, description: b.description })));
      console.log('🔍 excludeId:', excludeId, 'tipo:', typeof excludeId);
      
      // Filtrar reserva sendo atualizada (se excludeId fornecido)
      const filteredData = excludeId 
        ? result.data.filter((booking: any) => {
            // Converter ambos para string para garantir comparação correta
            const isExcluded = String(booking.id) !== String(excludeId);
            console.log(`🔍 Booking ID: ${booking.id} (${typeof booking.id}) vs excludeId: ${excludeId} (${typeof excludeId}) - Incluir: ${isExcluded}`);
            return isExcluded;
          })
        : result.data;
      
      console.log('🔍 Dados após filtro:', filteredData.map(b => ({ id: b.id, description: b.description })));
      allConflicts.push(...filteredData);
    }
  }

  return allConflicts;
};


export async function create(
  user: { id: string },
  data: CreateBookingInput,
  res: Response
): Promise<void> {
  const userId = user.id;
  
  // Se room_id foi fornecido, buscar as informações da sala
  let finalRoom = data.room;
  if (data.room_id && !data.room) {
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", data.room_id)
      .single();
    
    if (roomError || !roomData) {
      res.status(400).json({ error: "Sala não encontrada." });
      return;
    }
    
    finalRoom = roomData.id;
  }
  
  if (!finalRoom) {
    res.status(400).json({ error: "ID da sala é obrigatório." });
    return;
  }
  
  const sanitizedRepeat: string | null = data.repeat === null || data.repeat === "none" ? null : data.repeat || null;

  // 🔧 VALIDAÇÃO ROBUSTA: Verificar se os horários são válidos
  if (!isValidTime(data.start_time)) {
    res
      .status(400)
      .json({
        error:
          "Horário de início inválido. Use o formato HH:MM (ex: 09:30, 14:00).",
      });
    return;
  }

  if (!isValidTime(data.end_time)) {
    res
      .status(400)
      .json({
        error:
          "Horário de fim inválido. Use o formato HH:MM (ex: 10:30, 15:00).",
      });
    return;
  }

  const formattedStartTime: string | null = normalizeTime(data.start_time);
  const formattedEndTime: string | null = normalizeTime(data.end_time);

  // 🔧 VALIDAÇÃO ROBUSTA: Verificar se start_time < end_time
  if (!isValidTimeRange(formattedStartTime, formattedEndTime)) {
    res
      .status(400)
      .json({
        error: "Horário de início deve ser anterior ao horário de fim.",
      });
    return;
  }

  const formattedDate: string | null = (data.date && data.date !== null)
    ? dayjs(data.date, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
    : null;

  try {
    // 🔧 CORREÇÃO COMPLETA: Verificar TODOS os tipos de conflito
    const conflictResults = await checkBookingConflicts(
      finalRoom,
      formattedDate,
      sanitizedRepeat,
      data.day_repeat,
      formattedStartTime,
      formattedEndTime
    );

    if (conflictResults.length > 0) {
      res
        .status(400)
        .json({
          error: "Conflito de horário: já existe uma reserva nesse intervalo.",
        });
      return;
    }
    // 🔧 CORREÇÃO: Definir day_repeat baseado no tipo de recorrência
    let finalDayRepeat = data.day_repeat;
    
    // Para reservas recorrentes, se day_repeat não foi fornecido, calcular baseado na data
    if (sanitizedRepeat && formattedDate) {
      if (sanitizedRepeat === "week" && (finalDayRepeat === null || finalDayRepeat === undefined)) {
        finalDayRepeat = dayjs(formattedDate).day(); // 0-6 (domingo-sábado)
      } else if (sanitizedRepeat === "month" && (finalDayRepeat === null || finalDayRepeat === undefined)) {
        finalDayRepeat = dayjs(formattedDate).date(); // 1-31 (dia do mês)
      }
    }

    const { data: bookingData, error } = await supabase
      .from("bookings")
      .insert([
        {
          description: data.description,
          room: finalRoom,
          date: sanitizedRepeat ? null : formattedDate,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          repeat: sanitizedRepeat,
          day_repeat: finalDayRepeat,
          user_id: userId,
        },
      ])
      .select()
      .single();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(201).json(bookingData);
  } catch (err) {
    console.error("Erro ao criar reserva:", err);
    res.status(500).json({ error: "Erro ao criar reserva" });
  }
}

export async function updateBooking(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;
  
  const updateFields: Record<string, any> = {};

  // 🔧 VALIDAÇÃO ROBUSTA: Verificar horários antes de normalizar
  if (req.body.start_time !== undefined) {
    if (!isValidTime(req.body.start_time)) {
      res
        .status(400)
        .json({
          error:
            "Horário de início inválido. Use o formato HH:MM (ex: 09:30, 14:00).",
        });
      return;
    }
    updateFields.start_time = normalizeTime(req.body.start_time);
  }

  if (req.body.end_time !== undefined) {
    if (!isValidTime(req.body.end_time)) {
      res
        .status(400)
        .json({
          error:
            "Horário de fim inválido. Use o formato HH:MM (ex: 10:30, 15:00).",
        });
      return;
    }
    updateFields.end_time = normalizeTime(req.body.end_time);
  }

  if (req.body.description !== undefined)
    updateFields.description = req.body.description;
  if (req.body.room !== undefined) updateFields.room = req.body.room;
  if (req.body.room_id !== undefined) updateFields.room = req.body.room_id;
  if (req.body.date !== undefined)
    updateFields.date = req.body.date
      ? dayjs(req.body.date, "DD/MM/YYYY").format("YYYY-MM-DD")
      : null;
  if (req.body.repeat !== undefined)
    updateFields.repeat = req.body.repeat === "null" ? null : req.body.repeat;
  if (req.body.day_repeat !== undefined)
    updateFields.day_repeat = req.body.day_repeat;
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError || !existingData) {
      res.status(404).json({ error: "Reserva não encontrada" });
      return;
    }

    // 🔧 CORREÇÃO: Validar campos obrigatórios se estiverem sendo atualizados
    const requiredFields = ["room", "description"];
    for (const field of requiredFields) {
      const value =
        updateFields[field] !== undefined
          ? updateFields[field]
          : existingData[field];
      if (!value || value.toString().trim() === "") {
        res.status(400).json({ error: `Campo obrigatório: ${field}` });
        return;
      }
    }

    // 🔧 VALIDAÇÃO ROBUSTA: Verificar se a combinação de horários é válida
    const finalStartTime =
      updateFields.start_time !== undefined
        ? updateFields.start_time
        : existingData.start_time;
    const finalEndTime =
      updateFields.end_time !== undefined
        ? updateFields.end_time
        : existingData.end_time;

    if (!isValidTimeRange(finalStartTime, finalEndTime)) {
      res
        .status(400)
        .json({
          error: "Horário de início deve ser anterior ao horário de fim.",
        });
      return;
    }

    // 🔧 CORREÇÃO COMPLETA: Verificar conflitos usando função centralizada
    console.log('🔍 updateFields:', updateFields);
    console.log('🔍 Campos que disparam verificação:', {
      room: updateFields.room,
      date: updateFields.date,
      start_time: updateFields.start_time,
      end_time: updateFields.end_time,
      repeat: updateFields.repeat,
      day_repeat: updateFields.day_repeat
    });
    
    if (
      updateFields.room ||
      updateFields.date ||
      updateFields.start_time ||
      updateFields.end_time ||
      updateFields.repeat ||
      updateFields.day_repeat
    ) {
      const finalRoom =
        updateFields.room !== undefined ? updateFields.room : existingData.room;
      const finalDate =
        updateFields.date !== undefined ? updateFields.date : existingData.date;
      const finalRepeat =
        updateFields.repeat !== undefined
          ? updateFields.repeat
          : existingData.repeat;
      const finalDayRepeat =
        updateFields.day_repeat !== undefined
          ? updateFields.day_repeat
          : existingData.day_repeat;

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
            error:
              "Conflito de horário: já existe uma reserva nesse intervalo.",
          });
        return;
      }
    }

    const { data, error } = await supabase
      .from("bookings")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json(data);
  } catch (err) {
    console.error("Erro ao atualizar reserva:", err);
    res.status(500).json({ error: "Erro ao atualizar reserva" });
  }
}

export async function deleteBooking(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id)
      .single();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json({ message: "Reserva deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar reserva:", err);
    res.status(500).json({ error: "Erro ao deletar reserva" });
  }
}


export async function getBooking(req: Request, res: Response): Promise<void> {
  try {
    // 🔧 CORREÇÃO: Usar JOIN otimizado para evitar N+1 queries
    const { data, error } = await supabase.from("bookings").select(`
        id,
        description,
        date,
        start_time,
        end_time,
        repeat,
        day_repeat,
        user_profiles(id, name, email, phone),
        rooms(id, name, size)
      `);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Se não há dados, retorna array vazio
    if (!data || data.length === 0) {
      res.json([]);
      return;
    }

    const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const formattedData = data.map((booking: any) => {
      const dayweek = booking.date
        ? parseInt(dayjs(booking.date).locale("pt").format("d"))
        : null;
      const repeatDay = booking.day_repeat
        ? weekDaysAbbr[booking.day_repeat]
        : null;
      const dayOfWeek = dayweek !== null ? weekDaysAbbr[dayweek] : null;
      const monthName = booking.date
        ? dayjs(booking.date).locale("pt").format("MMM")
        : null;
        
      // 🔧 CORREÇÃO: Tratamento consistente para rooms e user_profiles
      const roomData = Array.isArray(booking.rooms) 
        ? booking.rooms[0] 
        : booking.rooms;
      const userProfileData = Array.isArray(booking.user_profiles) 
        ? booking.user_profiles[0] 
        : booking.user_profiles;
        
      return {
        id: booking.id,
        description: booking.description,
        room: roomData
          ? {
            id: roomData.id,
            name: roomData.name,
            size: roomData.size,
          }
          : null,
        date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
        day_of_week: dayOfWeek == null ? repeatDay : dayOfWeek,
        month: monthName,
        start_time: booking.start_time
          ? dayjs(booking.start_time, "HH:mm:ss").format("HH:mm")
          : null,
        end_time: booking.end_time
          ? dayjs(booking.end_time, "HH:mm:ss").format("HH:mm")
          : null,
        repeat: booking.repeat,
        repeat_day: repeatDay,
        user: userProfileData
          ? {
            id: userProfileData.id,
            name: userProfileData.name,
            email: userProfileData.email,
            phone: userProfileData.phone,
          }
          : null,
      };
    });
    res.json(formattedData);
  } catch (err) {
    console.error("Erro ao buscar reservas:", err);
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
}

export async function getBookingById(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        description,
        date,
        start_time,
        end_time,
        repeat,
        day_repeat,
        user_profiles(id, name, email, phone),
        rooms(id, name, size)
      `
      )
      .eq("id", id)
      .single();
    if (error || !data) {
      res.status(404).json({ error: "Reserva não encontrada" });
      return;
    }
    // Formatação dos dados pode ser implementada aqui se necessário
    res.json(data);
  } catch (err) {
    console.error("Erro ao buscar reserva por ID:", err);
    res.status(500).json({ error: "Erro ao buscar reserva por ID" });
  }
}

export async function getBookingByFilter(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { userId, date, room, repeat, dayRepeat } = req.body;
    let query = supabase.from("bookings").select("*");
    if (userId) query = query.eq("user_id", userId);
    if (date) query = query.eq("date", date);
    if (room) query = query.eq("room", room);
    if (repeat) query = query.eq("repeat", repeat);
    if (dayRepeat) query = query.eq("day_repeat", dayRepeat);
    const { data, error } = await query;
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    const formattedData = (data || []).map((booking: any) => ({
      id: booking.id,
      description: booking.description,
      room: booking.room,
      date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
      start_time: dayjs(booking.start_time, "HH:mm:ss").format("HH:mm"),
      end_time: dayjs(booking.end_time, "HH:mm:ss").format("HH:mm"),
      repeat: booking.repeat,
      day_repeat: booking.day_repeat,
      user_id: booking.user_id,
    }));
    res.json(formattedData);
  } catch (err) {
    console.error("Erro ao buscar reservas:", err);
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
}

export async function getBookingMy(
  req: ProfileRequest,
  res: Response
): Promise<void> {
  const userId = req.profile?.id;
  if (!userId) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }
  try {
    // 🔧 CORREÇÃO: Usar JOIN otimizado para evitar N+1 queries
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `id,
        description,
        date,
        start_time,
        end_time,
        repeat,
        day_repeat,
        user_profiles!inner(id, name, email, phone),  
        rooms!inner(id, name, size) `
      )
      .eq("user_id", userId);
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const formattedData = (data || []).map((booking: any) => {
      const dayweek = booking.date
        ? parseInt(dayjs(booking.date).locale("pt").format("d"))
        : null;
      const repeatDay = booking.day_repeat
        ? weekDaysAbbr[booking.day_repeat]
        : null;
      const dayOfWeek = dayweek !== null ? weekDaysAbbr[dayweek] : null;
      const monthName = booking.date
        ? dayjs(booking.date).locale("pt").format("MMM")
        : null;
        
      // 🔧 CORREÇÃO: Tratamento consistente para rooms e user_profiles
      const roomData = Array.isArray(booking.rooms) 
        ? booking.rooms[0] 
        : booking.rooms;
      const userProfileData = Array.isArray(booking.user_profiles) 
        ? booking.user_profiles[0] 
        : booking.user_profiles;
        
      return {
        id: booking.id,
        description: booking.description,
        room: roomData
          ? {
            id: roomData.id,
            name: roomData.name,
            size: roomData.size,
          }
          : null,
        date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
        day_of_week: dayOfWeek == null ? repeatDay : dayOfWeek,
        month: monthName,
        start_time: booking.start_time
          ? dayjs(booking.start_time, "HH:mm:ss").format("HH:mm")
          : null,
        end_time: booking.end_time
          ? dayjs(booking.end_time, "HH:mm:ss").format("HH:mm")
          : null,
        repeat: booking.repeat,
        repeat_day: repeatDay,
        user: userProfileData
          ? {
            id: userProfileData.id,
            name: userProfileData.name,
            email: userProfileData.email,
            phone: userProfileData.phone,
          }
          : null,
      };
    });
    res.json(formattedData);
  } catch (err) {
    console.error("Erro ao buscar reservas:", err);
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
}

export async function getBookingsByToday(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const today = dayjs().startOf("day");
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        description,
        date,
        start_time,
        end_time,
        repeat,
        day_repeat,
        user_profiles(id, name, email, phone),
        rooms(id, name, size)
      `)
      .or(`repeat.eq.day,date.eq.${today.format("YYYY-MM-DD")}`);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Formatação dos dados
    const formattedData = (data || []).map((booking) => {
      // 🔧 CORREÇÃO: Tratamento consistente para rooms e user_profiles
      const roomData = Array.isArray(booking.rooms) 
        ? booking.rooms[0] 
        : booking.rooms;
      const userProfileData = Array.isArray(booking.user_profiles) 
        ? booking.user_profiles[0] 
        : booking.user_profiles;
      
      return {
        id: booking.id,
        description: booking.description,
        room: roomData
          ? {
            id: roomData.id,
            name: roomData.name,
            size: roomData.size,
          }
          : null,
        date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
        start_time: dayjs(booking.start_time, "HH:mm:ss").format("HH:mm"),
        end_time: dayjs(booking.end_time, "HH:mm:ss").format("HH:mm"),
        repeat: booking.repeat,
        day_repeat: booking.day_repeat,
        user: userProfileData
          ? {
            id: userProfileData.id,
            name: userProfileData.name,
            email: userProfileData.email,
            phone: userProfileData.phone,
          }
          : null,
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error("Erro ao buscar reservas:", err);
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
}

export async function getBookingsByWeek(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const startOfWeek = dayjs().startOf("week"); // Início da semana atual
    const endOfWeek = dayjs().endOf("week"); // Fim da semana atual

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        description,
        date,
        start_time,
        end_time,
        repeat,
        day_repeat,
        user_profiles(id, name, email, phone),
        rooms(id, name, size)
      `)
      .or(
        `repeat.eq.week,date.gte.${startOfWeek.format(
          "YYYY-MM-DD"
        )},date.lte.${endOfWeek.format("YYYY-MM-DD")}`
      ); // Filtra tanto as repetições semanais quanto as datas dentro da semana atual

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Mapeamento dos dias da semana abreviados
    const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Formatação dos dados
    const formattedData = (data || []).map((booking) => {
      const dayweek = booking.date
        ? parseInt(dayjs(booking.date).locale("pt").format("d"))
        : null; // Obter o número do dia da semana (0-6) e garantir que seja um inteiro
      const repeatDay = booking.day_repeat
        ? weekDaysAbbr[booking.day_repeat]
        : null; // Dia da semana para repeat abreviado
      const dayOfWeek = dayweek !== null ? weekDaysAbbr[dayweek] : null; // Dia da semana abreviado
      const monthName = booking.date
        ? dayjs(booking.date).locale("pt").format("MMM")
        : null; // Nome do mês abreviado (Jan, Fev, Mar, etc.)

      // 🔧 CORREÇÃO: Tratamento consistente para rooms e user_profiles
      const roomData = Array.isArray(booking.rooms) 
        ? booking.rooms[0] 
        : booking.rooms;
      const userProfileData = Array.isArray(booking.user_profiles) 
        ? booking.user_profiles[0] 
        : booking.user_profiles;

      return {
        id: booking.id,
        description: booking.description,
        room: roomData
          ? {
            id: roomData.id,
            name: roomData.name,
            size: roomData.size,
          }
          : null,
        date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
        day_of_week: dayOfWeek == null ? repeatDay : dayOfWeek, // Garantir que day_of_week seja retornado corretamente
        month: monthName, // Nome do mês abreviado
        start_time: dayjs(booking.start_time, "HH:mm:ss").format("HH:mm"),
        end_time: dayjs(booking.end_time, "HH:mm:ss").format("HH:mm"),
        repeat: booking.repeat,
        repeat_day: repeatDay,
        user: userProfileData
          ? {
            id: userProfileData.id,
            name: userProfileData.name,
            email: userProfileData.email,
            phone: userProfileData.phone,
          }
          : null,
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error("Erro ao buscar reservas:", err);
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
}

export async function getBookingsByMonth(req: Request, res: Response) {
  try {
    const startOfMonth = dayjs().startOf("month"); // Início do mês atual
    const endOfMonth = dayjs().endOf("month"); // Fim do mês atual

    const [monthlyResult, specificResult] = await Promise.all([
      // Buscar reservas com repetição mensal
      supabase
        .from("bookings")
        .select(`
          id,
          description,
          date,
          start_time,
          end_time,
          repeat,
          day_repeat,
          user_profiles(id, name, email, phone),
          rooms(id, name, size)
        `)
        .eq("repeat", "month")
        .gte("day_repeat", 1)
        .lte("day_repeat", endOfMonth.date()),
      // Buscar reservas específicas do mês
      supabase
        .from("bookings")
        .select(`
          id,
          description,
          date,
          start_time,
          end_time,
          repeat,
          day_repeat,
          user_profiles(id, name, email, phone),
          rooms(id, name, size)
        `)
        .gte("date", startOfMonth.format("YYYY-MM-DD"))
        .lte("date", endOfMonth.format("YYYY-MM-DD"))
        .is("repeat", null),
    ]);

    if (monthlyResult.error || specificResult.error) {
      const error = monthlyResult.error || specificResult.error;
      console.log(error);
      return res
        .status(400)
        .json({ error: error?.message || "Unknown error occurred" });
    }

    const data = [
      ...(monthlyResult.data || []),
      ...(specificResult.data || []),
    ];

    // Mapeamento dos dias da semana abreviados
    const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Formatação dos dados
    const formattedData = (data || []).map((booking) => {
      const dayweek = booking.date
        ? dayjs(booking.date).locale("pt").format("d")
        : null; // Obter o número do dia da semana (0-6)
      const repeatDay = booking.day_repeat
        ? weekDaysAbbr[booking.day_repeat]
        : null; // Dia da semana para repeat abreviado
      const dayOfWeek =
        dayweek !== null ? weekDaysAbbr[parseInt(dayweek, 10)] : null; // Dia da semana abreviado
      const monthName = booking.date
        ? dayjs(booking.date).locale("pt").format("MMM")
        : null; // Nome do mês abreviado (Jan, Fev, Mar, etc.)

      // 🔧 CORREÇÃO: Tratamento consistente para rooms e user_profiles
      const roomData = Array.isArray(booking.rooms) 
        ? booking.rooms[0] 
        : booking.rooms;
      const userProfileData = Array.isArray(booking.user_profiles) 
        ? booking.user_profiles[0] 
        : booking.user_profiles;

      return {
        id: booking.id,
        description: booking.description,
        room: roomData
          ? {
            id: roomData.id,
            name: roomData.name,
            size: roomData.size,
          }
          : null,
        date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
        day_of_week: dayOfWeek, // Dia da semana abreviado em pt-BR
        month: monthName, // Nome do mês abreviado
        start_time: dayjs(booking.start_time, "HH:mm:ss").format("HH:mm"),
        end_time: dayjs(booking.end_time, "HH:mm:ss").format("HH:mm"),
        repeat: booking.repeat,
        repeat_day: repeatDay, // Dia da repetição abreviado
        user: userProfileData
          ? {
            id: userProfileData.id,
            name: userProfileData.name,
            email: userProfileData.email,
            phone: userProfileData.phone,
          }
          : null,
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error("Erro ao buscar reservas:", err);
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
}

export async function getBookingsByAll(req: Request, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        description,
        date,
        start_time,
        end_time,
        repeat,
        day_repeat,
        user_profiles(id, name, email, phone),
        rooms(id, name, size)
      `);

    if (error) {
      console.error("❌ Erro na consulta:", error);
      res.status(400).json({ error: error.message });
      return;
    }
    // Se não há dados, retorna array vazio
    if (!data || data.length === 0) {
      console.log("📝 Nenhuma reserva encontrada, retornando array vazio");
      res.json([]);
      return;
    }

    const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Formatação dos dados
    const formattedData = data.map((booking) => {
      const dayweek = booking.date
        ? dayjs(booking.date).locale("pt").format("d")
        : null;
      const repeatDay = booking.day_repeat
        ? weekDaysAbbr[booking.day_repeat]
        : null;
      const dayOfWeek =
        dayweek !== null ? weekDaysAbbr[parseInt(dayweek, 10)] : null;
      const monthName = booking.date
        ? dayjs(booking.date).locale("pt").format("MMM")
        : null;

      // 🔧 CORREÇÃO: Tratamento consistente para rooms e user_profiles
      const roomData = Array.isArray(booking.rooms) 
        ? booking.rooms[0] 
        : booking.rooms;
      const userProfileData = Array.isArray(booking.user_profiles) 
        ? booking.user_profiles[0] 
        : booking.user_profiles;

      return {
        id: booking.id,
        description: booking.description,
        room: roomData
          ? {
            id: roomData.id,
            name: roomData.name,
            size: roomData.size,
          }
          : null,
        date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
        day_of_week: dayOfWeek,
        month: monthName,
        start_time: booking.start_time
          ? dayjs(booking.start_time, "HH:mm:ss").format("HH:mm")
          : null,
        end_time: booking.end_time
          ? dayjs(booking.end_time, "HH:mm:ss").format("HH:mm")
          : null,
        repeat: booking.repeat,
        repeat_day: repeatDay,
        user: userProfileData
          ? {
            id: userProfileData.id,
            name: userProfileData.name,
            email: userProfileData.email,
            phone: userProfileData.phone,
          }
          : null,
      };
    });

    console.log("✅ Dados formatados com sucesso:", formattedData.length, "reservas");
    res.json(formattedData);
  } catch (err) {
    console.error("❌ Erro ao buscar reservas:", err);
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
}

export async function getBookingsOfCalendar(req: Request, res: Response) {
  try {
    // Lê os parâmetros de mês e ano da query string
    const { month, year } = req.query;

    // Caso o mês ou o ano não sejam enviados, usamos o mês e ano atuais
    const currentMonth = month
      ? parseInt(month.toString(), 10)
      : dayjs().month() + 1;
    const currentYear = year ? parseInt(year.toString(), 10) : dayjs().year();

    // Determina o intervalo do mês (início e fim do mês)
    const startOfMonth = dayjs()
      .year(currentYear)
      .month(currentMonth - 1)
      .startOf("month");
    const endOfMonth = dayjs()
      .year(currentYear)
      .month(currentMonth - 1)
      .endOf("month");

    // 🔧 CORREÇÃO: Buscar reservas mensais e específicas separadamente
    const [monthlyResult, weeklyResult, specificResult] = await Promise.all([
      // Buscar reservas com repetição mensal
      supabase
        .from("bookings")
        .select(`
          id,
          description,
          date,
          start_time,
          end_time,
          repeat,
          day_repeat,
          user_profiles(id, name, email, phone),
          rooms(id, name, size)
        `)
        .eq("repeat", "month")
        .gte("day_repeat", 1)
        .lte("day_repeat", endOfMonth.date()),
      // Buscar reservas com repetição semanal
      supabase
        .from("bookings")
        .select(`
          id,
          description,
          date,
          start_time,
          end_time,
          repeat,
          day_repeat,
          user_profiles(id, name, email, phone),
          rooms(id, name, size)
        `)
        .eq("repeat", "week"),
      // Buscar reservas específicas do mês
      supabase
        .from("bookings")
        .select(`
          id,
          description,
          date,
          start_time,
          end_time,
          repeat,
          day_repeat,
          user_profiles(id, name, email, phone),
          rooms(id, name, size)
        `)
        .gte("date", startOfMonth.format("YYYY-MM-DD"))
        .lte("date", endOfMonth.format("YYYY-MM-DD"))
        .is("repeat", null),
    ]);

    if (monthlyResult.error || weeklyResult.error || specificResult.error) {
      const error =
        monthlyResult.error || weeklyResult.error || specificResult.error;
      return res
        .status(400)
        .json({ error: error?.message || "Unknown error occurred" });
    }

    const data = [
      ...(monthlyResult.data || []),
      ...(weeklyResult.data || []),
      ...(specificResult.data || []),
    ];

    // Mapeamento dos dias da semana abreviados
    const weekDaysAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Formatação dos dados de eventos
    const formattedData: any[] = [];

    data.forEach((booking) => {
      // Certificando-se de que a data está no formato correto
      const formattedDate = dayjs(booking.date); // O dayjs já pode processar datas no formato "YYYY-MM-DD"

      // Verifica se a data é válida
      if (!formattedDate.isValid() && booking.repeat !== "week") {
        console.error("Data inválida:", booking.date);
        return; // Pula o evento se a data for inválida e não for repetido semanalmente
      }

      const dayweek = formattedDate.isValid()
        ? formattedDate.locale("pt").format("d")
        : null; // Obter o número do dia da semana (0-6) se a data for válida
      const repeatDay = booking.day_repeat
        ? weekDaysAbbr.indexOf(booking.day_repeat)
        : null; // Converte o nome do dia (ex: 'Seg') em um índice (0-6)
      const dayOfWeek = dayweek !== null ? weekDaysAbbr[Number(dayweek)] : null; // Dia da semana abreviado
      const monthName = formattedDate.isValid()
        ? formattedDate.locale("pt").format("MMM")
        : null; // Nome do mês abreviado (Jan, Fev, Mar, etc.)

      // 🔧 CORREÇÃO: Tratamento consistente para rooms e user_profiles
      const roomData = Array.isArray(booking.rooms) 
        ? booking.rooms[0] 
        : booking.rooms;
      const userProfileData = Array.isArray(booking.user_profiles) 
        ? booking.user_profiles[0] 
        : booking.user_profiles;

      // Adicionando o evento principal
      formattedData.push({
        id: booking.id,
        description: booking.description,
        room: roomData
          ? {
            id: roomData.id,
            name: roomData.name,
            size: roomData.size,
          }
          : null,
        date: formattedDate.isValid()
          ? formattedDate.format("YYYY-MM-DD")
          : null,
        day_of_week: dayOfWeek, // Dia da semana abreviado em pt-BR
        month: monthName, // Nome do mês abreviado
        start_time: dayjs(booking.start_time, "HH:mm:ss").format("HH:mm"),
        end_time: dayjs(booking.end_time, "HH:mm:ss").format("HH:mm"),
        repeat: booking.repeat,
        repeat_day: booking.day_repeat, // Dia da repetição abreviado
        user: userProfileData
          ? {
            id: userProfileData.id,
            name: userProfileData.name,
            email: userProfileData.email,
            phone: userProfileData.phone,
          }
          : null,
      });

      // Lógica para eventos repetidos semanalmente
      if (booking.repeat === "week" && repeatDay !== null) {
        let currentDay = startOfMonth;

        // Encontrar o primeiro dia correspondente à repetição no mês
        while (currentDay.day() !== repeatDay) {
          currentDay = currentDay.add(1, "day"); // Avança até o próximo dia que coincide com repeat_day
        }

        // Agora, atualiza a data com todas as ocorrências daquela semana para o mês atual
        while (currentDay.isBefore(endOfMonth, "day")) {
          formattedData.push({
            id: booking.id,
            description: booking.description,
            room: roomData
              ? {
                id: roomData.id,
                name: roomData.name,
                size: roomData.size,
              }
              : null,
            date: currentDay.format("DD/MM/YYYY"),
            day_of_week: weekDaysAbbr[currentDay.day()], // Dia da semana abreviado
            month: currentDay.format("MMM"), // Nome do mês abreviado
            start_time: dayjs(booking.start_time, "HH:mm:ss").format("HH:mm"),
            end_time: dayjs(booking.end_time, "HH:mm:ss").format("HH:mm"),
            repeat: booking.repeat,
            repeat_day: booking.day_repeat, // Dia da repetição abreviado
            user: userProfileData
              ? {
                id: userProfileData.id,
                name: userProfileData.name,
                email: userProfileData.email,
                phone: userProfileData.phone,
              }
              : null,
          });

          // Avança para a próxima semana
          currentDay = currentDay.add(1, "week");
        }
      }
    });

    res.json(formattedData);
  } catch (err) {
    console.error("Erro ao buscar reservas:", err);
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
}

export async function searchBookingsByDescription(req: Request, res: Response) {
  const { description } = req.query;

  if (!description) {
    return res
      .status(400)
      .json({ error: "Parâmetro de busca 'description' é obrigatório." });
  }

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        description,
        date,
        start_time,
        end_time,
        repeat,
        day_repeat,
        user_profiles(id, name, email, phone),
        rooms(id, name, size)
      `)
      .ilike("description", `%${description}%`);

    if (error) throw error;

    const formatted = (data || []).map((booking) => {
      // 🔧 CORREÇÃO: Tratamento consistente para rooms e user_profiles
      const roomData = Array.isArray(booking.rooms) 
        ? booking.rooms[0] 
        : booking.rooms;
      const userProfileData = Array.isArray(booking.user_profiles) 
        ? booking.user_profiles[0] 
        : booking.user_profiles;

      return {
        id: booking.id,
        description: booking.description,
        room: roomData
          ? {
            id: roomData.id,
            name: roomData.name,
            size: roomData.size,
          }
          : null,
        date: booking.date ? dayjs(booking.date).format("DD/MM/YYYY") : null,
        start_time: booking.start_time
          ? dayjs(booking.start_time, "HH:mm:ss").format("HH:mm")
          : null,
        end_time: booking.end_time
          ? dayjs(booking.end_time, "HH:mm:ss").format("HH:mm")
          : null,
        repeat: booking.repeat,
        day_repeat: booking.day_repeat,
        user: userProfileData
          ? {
            id: userProfileData.id,
            name: userProfileData.name,
            email: userProfileData.email,
            phone: userProfileData.phone,
          }
          : null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Erro ao buscar reservas:", err);
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
}
