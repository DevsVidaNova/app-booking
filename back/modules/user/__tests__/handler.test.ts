import { UserHandler } from '../handler';

// Mock do Prisma
jest.mock('@/config/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    booking: {
      count: jest.fn(),
      deleteMany: jest.fn()
    }
  }
}));

// Mock do bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123')
}));

import { db } from '@/config/db';
import bcrypt from 'bcryptjs';

const mockDb = db as any;
const mockBcrypt = bcrypt as any;





describe('User Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('single', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const mockUser = {
        id: '1',
        name: 'João Silva',
        phone: '11999999999',
        role: 'USER',
        email: 'joao@example.com'
      };

      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.booking.count.mockResolvedValue(5);

      const result = await UserHandler.single('1');

      expect(result.data).toEqual({
        ...mockUser,
        total_bookings: 5
      });
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          email: true
        }
      });
    });

    it('deve retornar erro quando usuário não encontrado', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await UserHandler.single('999');

      expect(result.error).toBe('Usuário não encontrado');
    });

    it('deve retornar erro em caso de falha na consulta', async () => {
      mockDb.user.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await UserHandler.single('1');

      expect(result.error).toBe('Erro ao buscar usuário.');
    });
  });

  describe('list', () => {
    it('deve retornar lista de usuários com paginação padrão', async () => {
      const mockUsers = [
        { id: '1', name: 'João', phone: '11999999999', role: 'USER', email: 'joao@example.com' },
        { id: '2', name: 'Maria', phone: '11888888888', role: 'ADMIN', email: 'maria@example.com' }
      ];

      mockDb.user.findMany.mockResolvedValue(mockUsers);
      mockDb.user.count.mockResolvedValue(2);

      const result = await UserHandler.list();

      expect(result.data).toEqual({
        data: mockUsers,
        total: 2,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });

    it('deve retornar lista com paginação customizada', async () => {
      const mockUsers = [{ id: '1', name: 'João', phone: '11999999999', role: 'USER', email: 'joao@example.com' }];

      mockDb.user.findMany.mockResolvedValue(mockUsers);
      mockDb.user.count.mockResolvedValue(1);

      const result = await UserHandler.list(2, 5);

      expect(result.data).toEqual({
        data: mockUsers,
        total: 1,
        page: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: true
      });
      expect(mockDb.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          email: true
        },
        skip: 5,
        take: 5
      });
    });
  });

  describe('delete', () => {
    it('deve deletar usuário com sucesso', async () => {
      mockDb.user.findUnique.mockResolvedValue({ id: 'user-123' });
      mockDb.booking.deleteMany.mockResolvedValue({ count: 0 });
      mockDb.user.delete.mockResolvedValue({} as any);

      const result = await UserHandler.delete('user-123');

      expect(result.data).toBeNull();
      expect(mockDb.booking.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' }
      });
      expect(mockDb.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' }
      });
    });

    it('deve retornar erro quando usuário não encontrado', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await UserHandler.delete('user-999');

      expect(result.error).toBe('Usuário não encontrado.');
    });
  });

  describe('update', () => {
    it('deve atualizar usuário com sucesso', async () => {
      const existingUser = {
        id: 'user-123',
        name: 'João',
        phone: '11999999999',
        email: 'joao@example.com',
        role: 'USER'
      };

      const updatedUser = {
        id: 'user-123',
        name: 'João Santos',
        phone: '11888888888',
        email: 'joao.santos@example.com',
        role: 'ADMIN'
      };

      mockDb.user.findUnique.mockResolvedValue(existingUser);
      mockDb.user.findFirst.mockResolvedValue(null);
      mockDb.user.update.mockResolvedValue(updatedUser);

      const result = await UserHandler.update({
        userId: 'user-123',
        name: 'João Santos',
        phone: '11888888888',
        email: 'joao.santos@example.com',
        role: 'admin'
      });

      expect(result.data).toEqual(updatedUser);
    });

    it('deve retornar erro quando usuário não encontrado', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await UserHandler.update({
        userId: 'user-999',
        name: 'João'
      });

      expect(result.error).toBe('Usuário não encontrado.');
    });

    it('deve retornar erro quando email já existe', async () => {
      const existingUser = {
        id: 'user-123',
        name: 'João',
        phone: '11999999999',
        email: 'joao@example.com',
        role: 'USER'
      };

      mockDb.user.findUnique.mockResolvedValue(existingUser);
      mockDb.user.findFirst.mockResolvedValue({ id: 'user-456' });

      const result = await UserHandler.update({
        userId: 'user-123',
        email: 'existing@example.com'
      });

      expect(result.error).toBe('Já existe um usuário com este e-mail.');
    });
  });

  describe('create', () => {
    it('deve criar usuário com sucesso', async () => {
      const newUser = {
        id: 'user-123',
        name: 'João Silva',
        phone: '11999999999',
        role: 'USER',
        email: 'joao@example.com'
      };

      mockDb.user.findFirst.mockResolvedValue(null);
      mockDb.user.create.mockResolvedValue(newUser);

      const result = await UserHandler.create({
        name: 'João Silva',
        phone: '11999999999',
        password: 'password123',
        email: 'joao@example.com',
        role: 'user'
      });

      expect(result.data).toEqual(newUser);
    });

    it('deve retornar erro quando email já existe', async () => {
      mockDb.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      const result = await UserHandler.create({
        name: 'João Silva',
        phone: '11999999999',
        password: 'password123',
        email: 'existing@example.com',
        role: 'user'
      });

      expect(result.error).toBe('Já existe um usuário com este e-mail.');
    });
  });

  describe('resetUserPassword', () => {
    it('deve resetar senha com sucesso', async () => {
      const existingUser = {
        id: 'user-123',
        name: 'João Silva',
        email: 'joao@example.com'
      };

      mockDb.user.findUnique.mockResolvedValue(existingUser);
      mockDb.user.update.mockResolvedValue({} as any);

      const result = await UserHandler.resetUserPassword({
        userId: 'user-123',
        defaultPassword: 'newPassword123'
      });

      expect(result.data?.message).toContain('Senha resetada com sucesso');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });

    it('deve retornar erro quando usuário não encontrado', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await UserHandler.resetUserPassword({
        userId: 'user-999'
      });

      expect(result.error).toBe('Usuário não encontrado.');
    });
  });

  describe('listUsersScale', () => {
    it('deve retornar lista de usuários para escala', async () => {
      const mockUsers = [
        { id: '1', name: 'João', phone: '11999999999', role: 'USER', email: 'joao@example.com' },
        { id: '2', name: 'Maria', phone: '11888888888', role: 'ADMIN', email: 'maria@example.com' }
      ];

      mockDb.user.findMany.mockResolvedValue(mockUsers);

      const result = await UserHandler.listUsersScale();

      expect(result.data).toEqual(mockUsers);
    });

    it('deve retornar erro em caso de falha', async () => {
      mockDb.user.findMany.mockRejectedValue(new Error('Database error'));

      const result = await UserHandler.listUsersScale();

      expect(result.error).toBe('Erro ao buscar usuários.');
    });
  });
});