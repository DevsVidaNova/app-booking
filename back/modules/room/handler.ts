import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import supabase from "@/config/supabaseClient";
dayjs.extend(customParseFormat);

import { RoomInput, UpdateRoomInput } from "./types";


export async function createRoomHandler(data: RoomInput) {
  if (!data.name) {
    return { error: "O nome da sala é obrigatório.", data: null };
  }

  const { data: room, error } = await supabase
    .from("rooms")
    .insert([{ ...data }])
    .select()
    .single();
  return { data: room, error: error?.message || null };
}

export async function getRoomsHandler(page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, count, error } = await supabase
    .from("rooms")
    .select("*", { count: "exact" })
    .range(from, to);
  const totalPages = Math.ceil((count || 0) / limit);
  return {
    data,
    total: count,
    page,
    to: data ? data.length : 0,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    error: error?.message || null
  };
}

export async function getRoomByIdHandler(id: string) {
  try {
    // Buscar dados da sala
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (roomError) {
      return {
        data: null,
        error: roomError.message || "Sala não encontrada."
      };
    }

    // Buscar todos os agendamentos da sala
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        description,
        date,
        start_time,
        end_time,
        repeat,
        day_repeat,
        user_profiles(id, name, email)
      `)
      .eq("room", id)
      .order("date", { ascending: true });

    if (bookingsError) {
      console.error("Erro ao buscar agendamentos:", bookingsError);
    }

    // Determinar o próximo agendamento
    const now = dayjs();
    const today = now.format("YYYY-MM-DD");
    const currentTime = now.format("HH:mm:ss");

    let nextBooking = null;

    if (bookingsData && bookingsData.length > 0) {
      // Filtrar agendamentos futuros
      const futureBookings = bookingsData.filter(booking => {
        if (booking.repeat) {
          // Para agendamentos recorrentes, sempre são considerados válidos
          return true;
        } else if (booking.date) {
          // Para agendamentos específicos, verificar se é hoje ou futuro
          if (booking.date > today) {
            return true;
          } else if (booking.date === today && booking.start_time > currentTime) {
            return true;
          }
        }
        return false;
      });

      // Encontrar o próximo agendamento
      if (futureBookings.length > 0) {
        // Ordenar por data e horário
        futureBookings.sort((a, b) => {
          if (a.repeat && !b.repeat) return -1;
          if (!a.repeat && b.repeat) return 1;
          
          if (a.date && b.date) {
            if (a.date !== b.date) {
              return a.date.localeCompare(b.date);
            }
            return a.start_time.localeCompare(b.start_time);
          }
          
          return a.start_time.localeCompare(b.start_time);
        });

        nextBooking = futureBookings[0];
      }
    }

    // Formatear o próximo agendamento
    const formattedNextBooking = nextBooking ? {
      id: nextBooking.id,
      description: nextBooking.description,
      date: nextBooking.date ? dayjs(nextBooking.date).format("DD/MM/YYYY") : null,
      start_time: nextBooking.start_time ? dayjs(nextBooking.start_time, "HH:mm:ss").format("HH:mm") : null,
      end_time: nextBooking.end_time ? dayjs(nextBooking.end_time, "HH:mm:ss").format("HH:mm") : null,
      repeat: nextBooking.repeat,
      day_repeat: nextBooking.day_repeat,
      user: (nextBooking as any).user_profiles && (Array.isArray((nextBooking as any).user_profiles) ? (nextBooking as any).user_profiles[0] : (nextBooking as any).user_profiles) ? {
        id: Array.isArray((nextBooking as any).user_profiles) ? (nextBooking as any).user_profiles[0].id : (nextBooking as any).user_profiles.id,
        name: Array.isArray((nextBooking as any).user_profiles) ? (nextBooking as any).user_profiles[0].name : (nextBooking as any).user_profiles.name,
        email: Array.isArray((nextBooking as any).user_profiles) ? (nextBooking as any).user_profiles[0].email : (nextBooking as any).user_profiles.email
      } : null
    } : null;

    return {
      data: {
        ...roomData,
        nextBooking: formattedNextBooking,
        totalBookings: bookingsData?.length ?? 0
      },
      error: null
    };

  } catch (err) {
    console.error("Erro ao buscar sala com agendamentos:", err);
    return {
      data: null,
      error: "Erro interno do servidor"
    };
  }
}

export async function updateRoomHandler({ id, updates }: UpdateRoomInput) {
  const { data, error } = await supabase
    .from("rooms")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  console.log(data, error);

  if (!data) {
    return { error: "Sala não encontrada.", data: null };
  }

  return {
    data,
    error: error?.message || null
  };
}

export async function deleteRoomHandler(id: string) {
  const { data, error } = await supabase.from("rooms").delete().eq("id", id);
  return {
    data,
    error: error?.message || null
  };
}

export async function searchRoomHandler(name: string) {
  if (!name || name.trim() === '') {
    return { error: "Nome é obrigatório para busca.", data: null };
  }

  const { data, error } = await supabase.from("rooms").select("*").ilike("name", `%${name}%`);
  return {
    data,
    error: error ? (error.message || "Sala não encontrada.") : null
  };
}
