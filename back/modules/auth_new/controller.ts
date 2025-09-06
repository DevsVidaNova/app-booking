import {
  AuthHandler,
} from "./handler";
import { createUserSchema, loginUserSchema, updateUserSchema } from "../user_new/schemas";

export async function signUpUser(req: any, res: any) {
  try {
    const parsed = createUserSchema.parse(req.body);
    const result = await AuthHandler.signUp(parsed);
    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }
    return res.status(201).json({ message: "Usuário registrado com sucesso", user: result.user, token: result.token });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors ? err.errors : err.message });
  }
}

export async function loginUser(req: any, res: any) {
  try {
    const parsed = loginUserSchema.parse(req.body);
    const result = await AuthHandler.login(parsed);
    if (result.error) {
      return res.status(401).json({ error: result.error.message });
    }
    return res.json({ user: result.user, token: result.token });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors ? err.errors : err.message });
  }
}

export async function getUserProfile(req: any, res: any) {
  const userId = req.query.id || req.user?.id;
  if (!userId) {
    return res.status(400).json({ error: "ID do usuário não encontrado." });
  }
  if (req.role !== "admin" && req.user?.id !== userId) {
    return res.status(403).json({ error: "Acesso restrito. Somente administradores podem acessar perfis de outros usuários." });
  }
  const result = await AuthHandler.getProfile(userId);
  if (result.error) {
    return res.status(400).json({ error: result.error.message });
  }
  return res.json({ user: result.user });
}

export async function updateUserProfile(req: any, res: any) {
  const userId = req.query.id || req.user?.id;
  if (!userId) {
    return res.status(400).json({ error: "ID do usuário não encontrado." });
  }
  if (req.role !== "admin" && req.user?.id !== userId) {
    return res.status(403).json({ error: "Acesso restrito. Somente administradores podem acessar perfis de outros usuários." });
  }
  try {
    const parsed = updateUserSchema.parse(req.body);
    const updateInput = {
      name: typeof parsed.name === "string" ? parsed.name : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : ""
    };
    const result = await AuthHandler.updateProfile(userId, updateInput);
    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }
    return res.json({ message: "Perfil atualizado com sucesso", user: result.user });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors ? err.errors : err.message });
  }
}

export async function deleteUser(req: any, res: any) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ error: "ID do usuário não encontrado." });
  }
  const result = await AuthHandler.delete(userId);
  if (result.error) {
    return res.status(400).json({ error: result.error.message });
  }
  return res.json({ message: "Usuário e perfil excluídos com sucesso." });
}

export async function logout(_req: any, res: any) {
  const result = await AuthHandler.logout();
  if (result.error) {
    return res.status(400).json({ error: result.error.message });
  }
  return res.json({ message: "Logout realizado com sucesso." });
}

export async function verifyToken(req: any, res: any) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido." });
    }

    const result = await AuthHandler.verifyToken(token);
    if (result.error) {
      return res.status(401).json({ error: result.error.message });
    }

    return res.json({ user: result.user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
