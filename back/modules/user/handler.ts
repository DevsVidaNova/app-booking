import { UserProfile, CreateUserInput, UpdateUserInput, ResetPasswordInput } from "./types";
import { db } from "@/config/db";
import { getPagination } from "@/utils/pagination";
import bcrypt from "bcryptjs";

type HandlerResult<T> = { data?: T; error?: string };

export const UserHandler = {
  async single(id: string): Promise<HandlerResult<UserProfile & { total_bookings: number }>> {
    try {
      const user = await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          email: true
        }
      });

      if (!user) {
        return { error: "Usuário não encontrado" };
      }

      const totalBookings = await db.booking.count({
        where: { userId: user.id }
      });

      return { data: { ...user, total_bookings: totalBookings } };
    } catch {
      return { error: "Erro ao buscar usuário." };
    }
  },

  async list(page = 1, limit = 10): Promise<HandlerResult<{ data: UserProfile[]; total: number; page: number; totalPages: number; hasNext: boolean; hasPrev: boolean }>> {
    const from = (page - 1) * limit;
    const [data, total] = await Promise.all([
      db.user.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          email: true
        },
        skip: from,
        take: limit
      }),
      db.user.count()
    ]);

    const pagination = getPagination(page, limit, total);

    return {
      data: {
        data: data || [],
        total: total || 0,
        page: pagination.page,
        totalPages: pagination.totalPages,
        hasNext: pagination.hasNext,
        hasPrev: pagination.hasPrev
      }
    };
  },

  async delete(userId: string): Promise<HandlerResult<null>> {
    try {
      const existingUser = await db.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!existingUser) {
        return { error: 'Usuário não encontrado.' };
      }

      await db.booking.deleteMany({
        where: { userId: userId }
      });

      await db.user.delete({
        where: { id: userId }
      });


      return { data: null };
    } catch (error: any) {
      return { error: error.message || 'Erro ao excluir usuário.' };
    }
  },

  async update(input: UpdateUserInput): Promise<HandlerResult<UserProfile>> {
    const { userId, name, phone, email, role } = input;

    // Verificar se o usuário existe
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true, email: true, role: true }
    });
    if (!user) {
      return { error: "Usuário não encontrado." };
    }

    // Se está atualizando o e-mail, verificar se não existe outro usuário com o mesmo e-mail
    if (email && email !== user.email) {
      const userWithSameEmail = await db.user.findFirst({
        where: {
          email,
          id: { not: userId }
        },
        select: { id: true }
      });
      if (userWithSameEmail) {
        return { error: "Já existe um usuário com este e-mail." };
      }
    }

    const updates = {
      name: name ?? user.name,
      phone: phone ?? user.phone,
      email: email ?? user.email,
      role: role === "user" ? "USER" : role === "admin" ? "ADMIN" : user.role,
      updatedAt: new Date(),
    };

    const updated = await db.user.update({
      where: { id: userId },
      data: updates,
      select: { id: true, name: true, phone: true, email: true, role: true }
    });

    return { data: updated };
  },

  async create(input: CreateUserInput): Promise<HandlerResult<UserProfile>> {
    const { name, phone, role, password, email } = input;

    // Verificar se já existe um usuário com o mesmo e-mail
    const existingUser = await db.user.findFirst({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      return { error: "Já existe um usuário com este e-mail." };
    }

    // Criar usuário no banco de dados
    try {
      const newUser = await db.user.create({
        data: {
          name,
          phone,
          role: (role === "user" ? "USER" : role === "admin" ? "ADMIN" : "USER") as any,
          email,
          password, // Certifique-se de hashear a senha antes de salvar em produção!
          createdAt: new Date(),
          updatedAt: new Date()
        },
        select: { id: true, name: true, phone: true, role: true, email: true }
      });

      return { data: newUser };
    } catch (error: any) {
      return { error: error.message || "Erro ao criar usuário." };
    }
  },

  async resetUserPassword(input: ResetPasswordInput): Promise<HandlerResult<{ message: string }>> {
    const { userId, defaultPassword = "123456" } = input;

    // Verificar se o usuário existe
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });

    if (!existingUser) {
      return { error: 'Usuário não encontrado.' };
    }

    // Hashear a senha antes de salvar
    try {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await db.user.update({
        where: { id: userId },
        data: { password: hashedPassword, updatedAt: new Date() }
      });

      return {
        data: {
          message: `Senha resetada com sucesso para o usuário ${existingUser.name}. Nova senha: ${defaultPassword}`
        }
      };
    } catch (error: any) {
      return { error: `Erro ao resetar senha: ${error.message}` };
    }
  },

  async listUsersScale(): Promise<HandlerResult<UserProfile[]>> {
    try {
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          email: true
        }
      });
      return { data: users || [] };
    } catch {
      return { error: "Erro ao buscar usuários." };
    }
  },
}
