
import { db } from "@/config/db";
import bcrypt from "bcryptjs";
import { JWTUtils } from "@/utils/jwt";

type SignUpUserInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
};
type LoginUserInput = { email: string; password: string };
type UpdateUserProfileInput = { name: string; phone: string };

interface HandlerResult<_T = any> {
  error?: any;
  [key: string]: any;
}

interface AuthResult {
  user: any;
  token: string;
}

export const AuthHandler = {
  async signUp({ email, password, name, phone }: SignUpUserInput): Promise<HandlerResult<AuthResult>> {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return { error: { message: "Já existe um usuário com este email." } };

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: "USER"
      }
    });

    const token = JWTUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },

  async login({ email, password }: LoginUserInput): Promise<HandlerResult<AuthResult>> {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { error: { message: "Usuário não encontrado." } };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { error: { message: "Senha inválida." } };

    const token = JWTUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },

  async getProfile(userId: string): Promise<HandlerResult<{ user: any }>> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: { message: "Usuário não encontrado." } };

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  },

  async updateProfile(userId: string, { name, phone }: UpdateUserProfileInput): Promise<HandlerResult<{ user: any }>> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: { message: "Usuário não encontrado." } };
    const updated = await db.user.update({
      where: { id: userId },
      data: { name, phone, updatedAt: new Date() }
    });

    const { password: _, ...userWithoutPassword } = updated;

    return { user: userWithoutPassword };
  },

  async delete(userId: string): Promise<HandlerResult<{ success: boolean }>> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: { message: "Usuário não encontrado." } };
    await db.user.delete({ where: { id: userId } });
    return { success: true };
  },

  async logout(): Promise<HandlerResult<{ success: boolean }>> {
    return { success: true };
  },

  async verifyToken(token: string): Promise<HandlerResult<{ user: any }>> {
    const payload = JWTUtils.verifyToken(token);
    if (!payload) {
      return { error: { message: "Token inválido ou expirado." } };
    }

    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return { error: { message: "Usuário não encontrado." } };
    }

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  }
};
