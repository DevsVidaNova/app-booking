import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { z } from "zod";
import {
  RoomHandler,
} from "./handler";
import { createRoomSchema, updateRoomSchema, searchRoomSchema } from "./schemas";
dayjs.extend(customParseFormat);

// 📌 1. Criar uma nova sala
export async function createRoom(req: any, res: any) {
  try {
    const validatedData = createRoomSchema.parse(req.body);

    const result = await RoomHandler.create(validatedData);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    return res.status(400).json({ error: "Erro na validação dos dados" });
  }
}

// 📌 2. Listar todas as salas
export async function getRooms(req: any, res: any) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const result = await RoomHandler.list(page, limit);
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  res.json({
    data: result.data,
    offset: result.offset,
    page: result.page,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev
  });
}

// 📌 3. Buscar uma sala por ID
export async function getRoomById(req: any, res: any) {
  const { id } = req.params;
  const result = await RoomHandler.single(id);
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  res.json(result.data);
}

// 📌 4. Atualizar uma sala (somente os campos enviados)
export async function updateRoom(req: any, res: any) {
  const { id } = req.params;

  // Verificar se há dados para atualizar
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Nenhum dado fornecido para atualização.' });
  }

  try {
    const validatedData = updateRoomSchema.parse(req.body);

    const result = await RoomHandler.update({ id, updates: validatedData });
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    return res.status(400).json({ error: "Erro na validação dos dados" });
  }
}

// 📌 5. Deletar uma sala
export async function deleteRoom(req: any, res: any) {
  const { id } = req.params;
  const result = await RoomHandler.delete(id);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ message: "Sala deletada com sucesso." });
}

// 📌 6. Pesquisar sala
export async function searchRoom(req: any, res: any) {
  // 🔧 VALIDAÇÃO ZOD: Validar dados de entrada
  try {
    const validatedData = searchRoomSchema.parse(req.query);

    const result = await RoomHandler.search(validatedData.name);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    return res.status(400).json({ error: "Erro na validação dos dados" });
  }
}
