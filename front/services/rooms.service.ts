import { fetchApi, fetchWithAuth } from "@/hooks/api";
import { ListRoom, CreateRoom } from "@/types";

export const listRooms = async (page: number): Promise<ListRoom> => {
  try {
    return await fetchApi<ListRoom>(`/room?page=${page}`, { method: "GET" });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};

export const singleRoom = async (id: string): Promise<ListRoom> => {
  try {
    return await fetchApi<ListRoom>("/room/" + id, { method: "GET" });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};

export const addRoom = async (data: CreateRoom): Promise<CreateRoom> => {
  try {
    return await fetchWithAuth<CreateRoom>("/room", { method: "POST", data: data });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};

export const editRoom = async (id: string, data: CreateRoom): Promise<CreateRoom> => {
  try {
    return await fetchWithAuth(`/room/${id}`, { method: "PUT", data: data });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};

export const deleteRoom = async (id: string) => {
  try {
    return await fetchWithAuth(`/room/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};

export const searchRoom = async (name: string): Promise<ListRoom> => {
  try {
    return await fetchApi<ListRoom>(`/room/search?name=${name}`, {
      method: "GET"
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Erro desconhecido ao listar reservas");
    }
  }
};