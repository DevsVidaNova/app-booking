import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { z } from "zod";
import {
  UserHandler,
} from "./handler";
import { createUserSchema, updateUserSchema } from "./schemas";

dayjs.extend(customParseFormat);

export async function singleUser(req: any, res: any) {
  const { id } = req.params;
  const result = await UserHandler.single(id);
  if (result.error) {
    return res.status(404).json({ message: result.error });
  }
  return res.status(200).json(result.data);
}

export async function listUsers(req: any, res: any) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await UserHandler.list(page, limit);
  if (result.error) {
    return res.status(500).json({ message: result.error });
  }
  return res.status(200).json(result.data);
}

export async function deleteUser(req: any, res: any) {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ error: "ID do usuário não encontrado." });
  }
  const result = await UserHandler.delete(userId);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ message: "Usuário, perfil e reservas excluídos com sucesso." });
}

export async function updateUser(req: any, res: any) {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "ID do usuário não encontrado." });
  }

  // Verificar se há dados para atualizar
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Nenhum dado fornecido para atualização.' });
  }

  // Validação Zod
  try {
    const validatedData = updateUserSchema.parse(req.body);

    const result = await UserHandler.update({
      userId,
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email,
      role: validatedData.role
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ message: "Perfil atualizado com sucesso", profile: result.data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function createUser(req: any, res: any) {
  // Validação Zod
  try {
    const validatedData = createUserSchema.parse(req.body);

    const result = await UserHandler.create({
      name: validatedData.name,
      phone: validatedData.phone,
      role: validatedData.role,
      password: validatedData.password,
      email: validatedData.email
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(201).json({ message: "Usuário criado com sucesso.", user: result.data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function resetUserPassword(req: any, res: any) {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "ID do usuário não encontrado." });
  }

  // Validação Zod
  try {
    // const validatedData = resetPasswordSchema.parse(req.body);

    const result = await UserHandler.resetUserPassword({
      userId,
      defaultPassword: "VidaNova2025" //validatedData.defaultPassword 
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function listUsersScale(req: any, res: any) {
  const result = await UserHandler.listUsersScale();
  if (result.error) {
    return res.status(400).json({ message: result.error });
  }
  return res.status(200).json(result.data);
}
