import { Request, Response } from 'express';
import * as userController from '../controller';
import { UserHandler } from '../handler';

// Mock do UserHandler
jest.mock('../handler', () => ({
  UserHandler: {
    single: jest.fn(),
    list: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    resetUserPassword: jest.fn(),
    listUsersScale: jest.fn()
  }
}));

const mockHandler = UserHandler as jest.Mocked<typeof UserHandler>;

// Mock do dayjs
jest.mock('dayjs', () => {
  const mockDayjs = jest.fn(() => ({
    format: jest.fn(() => '2024-01-01'),
    isValid: jest.fn(() => true)
  }));
  Object.assign(mockDayjs, {
    extend: jest.fn()
  });
  return mockDayjs;
});

describe('User Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockReq = {
      params: {},
      query: {},
      body: {}
    };
    
    mockRes = {
      json: mockJson,
      status: mockStatus
    };
    
    jest.clearAllMocks();
  });

  describe('singleUser', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const mockUser = {
        id: '1',
        name: 'João',
        phone: '123456789',
        role: 'USER',
        email: 'user1@test.com',
        total_bookings: 0
      };
      
      mockReq.params = { id: '1' };
      mockHandler.single.mockResolvedValue({ data: mockUser });

      await userController.singleUser(mockReq as Request, mockRes as Response);

      expect(mockHandler.single).toHaveBeenCalledWith('1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });

    it('deve retornar erro 404 quando usuário não encontrado', async () => {
      mockReq.params = { id: '999' };
      mockHandler.single.mockResolvedValue({ error: 'Usuário não encontrado' });

      await userController.singleUser(mockReq as Request, mockRes as Response);

      expect(mockHandler.single).toHaveBeenCalledWith('999');
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
    });
  });

  describe('listUsers', () => {
    it('deve retornar lista de usuários com paginação padrão', async () => {
      const mockUsers = {
        data: [{ id: '1', name: 'João', phone: '123456789', role: 'USER', email: 'user1@test.com' }],
        total: 1,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };
      
      mockHandler.list.mockResolvedValue({ data: mockUsers });

      await userController.listUsers(mockReq as Request, mockRes as Response);

      expect(mockHandler.list).toHaveBeenCalledWith(1, 10);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUsers);
    });

    it('deve retornar lista de usuários com paginação customizada', async () => {
      const mockUsers = {
        data: [{ id: '1', name: 'João', phone: '123456789', role: 'USER', email: 'user1@test.com' }],
        total: 1,
        page: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: true
      };
      
      mockReq.query = { page: '2', limit: '5' };
      mockHandler.list.mockResolvedValue({ data: mockUsers });

      await userController.listUsers(mockReq as Request, mockRes as Response);

      expect(mockHandler.list).toHaveBeenCalledWith(2, 5);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUsers);
    });

    it('deve retornar erro 500 quando handler falha', async () => {
      mockHandler.list.mockResolvedValue({ error: 'Erro ao buscar usuários.' });

      await userController.listUsers(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Erro ao buscar usuários.' });
    });
  });

  describe('deleteUser', () => {
    it('deve deletar usuário com sucesso', async () => {
      mockReq.params = { id: 'user-123' };
      mockHandler.delete.mockResolvedValue({ data: null });

      await userController.deleteUser(mockReq as Request, mockRes as Response);

      expect(mockHandler.delete).toHaveBeenCalledWith('user-123');
      expect(mockJson).toHaveBeenCalledWith({ message: 'Usuário, perfil e reservas excluídos com sucesso.' });
    });

    it('deve retornar erro 400 quando ID não fornecido', async () => {
      mockReq.params = {};

      await userController.deleteUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'ID do usuário não encontrado.' });
      expect(mockHandler.delete).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando handler falha', async () => {
      mockReq.params = { id: 'user-123' };
      mockHandler.delete.mockResolvedValue({ error: 'Erro ao deletar usuário' });

      await userController.deleteUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao deletar usuário' });
    });
  });

  describe('updateUser', () => {
    it('deve atualizar usuário com sucesso', async () => {
      const updatedUser = {
        id: '1',
        name: 'João Silva Atualizado',
        phone: '11888888888',
        role: 'ADMIN',
        email: 'joao.novo@email.com'
      };
      
      mockReq.params = { id: 'user-123' };
      mockReq.body = {
        name: 'João Silva Atualizado',
        phone: '11888888888',
        email: 'joao.novo@email.com',
        role: 'admin'
      };
      
      mockHandler.update.mockResolvedValue({ data: updatedUser });

      await userController.updateUser(mockReq as Request, mockRes as Response);

      expect(mockHandler.update).toHaveBeenCalledWith({
        userId: 'user-123',
        name: 'João Silva Atualizado',
        phone: '11888888888',
        email: 'joao.novo@email.com',
        role: 'admin'
      });
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Perfil atualizado com sucesso',
        profile: updatedUser
      });
    });

    it('deve retornar erro 400 quando ID não fornecido', async () => {
      mockReq.params = {};
      mockReq.body = { name: 'João' };

      await userController.updateUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'ID do usuário não encontrado.' });
      expect(mockHandler.update).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando handler falha', async () => {
      mockReq.params = { id: 'user-123' };
      mockReq.body = { name: 'João' };
      mockHandler.update.mockResolvedValue({ error: 'Usuário não encontrado.' });

      await userController.updateUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Usuário não encontrado.' });
    });
  });

  describe('createUser', () => {
    it('deve criar usuário com sucesso', async () => {
      const newUser = {
        id: '1',
        name: 'João Silva',
        phone: '11999999999',
        role: 'USER',
        email: 'joao@email.com'
      };
      
      mockReq.body = {
        name: 'João Silva',
        phone: '11999999999',
        email: 'joao@email.com',
        password: 'senha123',
        role: 'user'
      };
      
      mockHandler.create.mockResolvedValue({ data: newUser });

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(mockHandler.create).toHaveBeenCalledWith({
        name: 'João Silva',
        phone: '11999999999',
        email: 'joao@email.com',
        password: 'senha123',
        role: 'user'
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Usuário criado com sucesso.',
        user: newUser
      });
    });

    it('deve retornar erro 400 quando dados obrigatórios não fornecidos', async () => {
      mockReq.body = {
        name: 'João Silva'
        // faltando phone, email, password
      };

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Dados inválidos',
        details: [
          { field: 'phone', message: 'Required' },
          { field: 'email', message: 'Required' },
          { field: 'password', message: 'Required' }
        ]
      });
      expect(mockHandler.create).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando handler falha', async () => {
      mockReq.body = {
        name: 'João Silva',
        phone: '11999999999',
        email: 'joao@email.com',
        password: 'senha123'
      };
      
      mockHandler.create.mockResolvedValue({ error: 'Erro ao criar usuário.' });

      await userController.createUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao criar usuário.' });
    });
  });

  describe('listUsersScale', () => {
    it('deve retornar lista de usuários para escala', async () => {
      const mockUsers = [
        { id: '1', name: 'João', phone: '123456789', role: 'USER', email: 'user1@test.com' },
        { id: '2', name: 'Maria', phone: '987654321', role: 'ADMIN', email: 'user2@test.com' }
      ];
      
      mockHandler.listUsersScale.mockResolvedValue({ data: mockUsers });

      await userController.listUsersScale(mockReq as Request, mockRes as Response);

      expect(mockHandler.listUsersScale).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUsers);
    });

    it('deve retornar erro 400 quando handler falha', async () => {
      mockHandler.listUsersScale.mockResolvedValue({ error: 'Erro ao buscar usuários.' });

      await userController.listUsersScale(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Erro ao buscar usuários.' });
    });
  });
});