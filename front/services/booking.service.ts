import { fetchApi, fetchWithAuth } from "@/hooks/api";
import { ListBooking, CreateBooking, EditBooking } from "@/types";

export const listBookings = async (): Promise<ListBooking[]> => {
  try {
    return await fetchApi<ListBooking[]>("/booking", { method: "GET" });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};
export const listBookingsMonth = async (): Promise<ListBooking[]> => {
  try {
    return await fetchApi<ListBooking[]>("/booking/month", { method: "GET" });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};
export const listBookingsWeek = async (): Promise<ListBooking[]> => {
  try {
    return await fetchApi<ListBooking[]>("/booking/week", { method: "GET" });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};
export const listBookingsToday = async (): Promise<ListBooking[]> => {
  try {
    return await fetchApi<ListBooking[]>("/booking/today", { method: "GET" });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};
export const singleBooking = async (id: string): Promise<ListBooking> => {
  try {
    return await fetchWithAuth<ListBooking>(`/booking/${id}`, { method: "GET" });
  } catch (error) {
    console.error("Erro ao editar reserva:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao editar reserva");
    }
  }
};
export async function addBooking(data: CreateBooking) {
  try {
    return await fetchWithAuth<CreateBooking>(`/booking`, {
      method: "POST",
      data: data
    });
  } catch (err) {
    console.error("Erro na API addBooking:", err);
    return { error: "Erro de conexão com o servidor." };
  }
}

export const editBooking = async (id: string, data: EditBooking): Promise<ListBooking> => {
  try {
    return await fetchWithAuth<ListBooking>(`/booking/${id}`, {
      method: "PUT",
      data: data
    });
  } catch (error) {
    console.error("Erro ao editar reserva:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao editar reserva");
    }
  }
};
export const listBookingsMy = async (): Promise<ListBooking[]> => {
  try {
    return await fetchWithAuth<ListBooking[]>("/booking/my", { method: "GET" });
  } catch (error) {
    console.error("Erro ao editar reserva:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao editar reserva");
    }
  }
};
export const deleteBooking = async (id: string) => {
  try {
    return await fetchWithAuth(`/booking/${id}`, { method: "DELETE" });
  } catch (error) {
    console.error("Erro ao editar reserva:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao editar reserva");
    }
  }
};
export const searchBooking = async (userId?: string, date?: string, room?: string, repeat?: string, dayRepeat?: string): Promise<ListBooking[]> => {
  try {
    return await fetchWithAuth<ListBooking[]>(`/booking/filter`, {
      method: "POST",
      data: {
        userId,
        date,
        room,
        repeat,
        dayRepeat
      }
    });
  } catch (error) {
    console.error("Erro ao editar reserva:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao editar reserva");
    }
  }
};
export const listBookingsCalendar = async (): Promise<ListBooking[]> => {
  try {
    return await fetchApi<ListBooking[]>("/booking/calendar", { method: "GET" });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};
