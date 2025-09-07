import { Request, Response } from 'express';
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  searchRoom
} from '../controller';
import { RoomHandler } from '../handler';

// Mock do Prisma
jest.mock('@/config/db', () => ({
  db: {
    room: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    booking: {
      findMany: jest.fn()
    }
  }
}));

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

// Mock do handler
jest.mock('../handler');
const mockRoomHandler = RoomHandler as jest.Mocked<typeof RoomHandler>;

describe('Room Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };

    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    it('deve criar uma sala com sucesso', async () => {
      const roomData = {
        name: 'Sala de Reunião',
        size: 10,
        description: 'Sala para reuniões',
        exclusive: false,
        status: true
      };

      const mockResult = {
        data: { id: '1', ...roomData },
        error: null
      };

      mockRequest.body = roomData;
      mockRoomHandler.create.mockResolvedValue(mockResult as any);

      await createRoom(mockRequest as Request, mockResponse as Response);

      expect(mockRoomHandler.create).toHaveBeenCalledWith(roomData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockResult.data);
    });

    it('deve retornar erro 400 quando há erro na criação', async () => {
      const roomData = { name: '' };
      const expectedError = {
        error: 'Dados inválidos',
        details: [
          {
            field: 'name',
            message: 'Nome da sala é obrigatório'
          },
          {
            field: 'name',
            message: 'Nome não pode ser apenas espaços'
          }
        ]
      };

      mockRequest.body = roomData;
      // Não precisamos mockar o handler pois o erro vem da validação Zod

      await createRoom(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('getRooms', () => {
    it('deve listar salas com paginação padrão', async () => {
      const mockResult = {
        data: [{ 
          id: '1', 
          name: 'Sala 1',
          size: 10,
          description: 'Descrição da sala',
          exclusive: false,
          status: true
        }],
        limit: 10,
        offset: 0,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        error: null
      };

      mockRequest.query = {};
      mockRoomHandler.list.mockResolvedValue(mockResult as any);

      await getRooms(mockRequest as Request, mockResponse as Response);

      expect(mockRoomHandler.list).toHaveBeenCalledWith(1, 10);
      expect(mockJson).toHaveBeenCalledWith({
        data: mockResult.data,
        offset: mockResult.offset,
        page: mockResult.page,
        totalPages: mockResult.totalPages,
        hasNext: mockResult.hasNext,
        hasPrev: mockResult.hasPrev
      });
    });

    it('deve listar salas com paginação customizada', async () => {
      const mockResult = {
        data: [{ 
          id: '1', 
          name: 'Sala 1',
          size: 10,
          description: 'Descrição da sala',
          exclusive: false,
          status: true
        }],
        limit: 5,
        offset: 5,
        page: 2,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
        error: null
      };

      mockRequest.query = { page: '2', limit: '5' };
      mockRoomHandler.list.mockResolvedValue(mockResult as any);

      await getRooms(mockRequest as Request, mockResponse as Response);

      expect(mockRoomHandler.list).toHaveBeenCalledWith(2, 5);
      expect(mockJson).toHaveBeenCalledWith({
        data: mockResult.data,
        offset: mockResult.offset,
        page: mockResult.page,
        totalPages: mockResult.totalPages,
        hasNext: mockResult.hasNext,
        hasPrev: mockResult.hasPrev
      });
    });

    it('deve retornar erro 500 quando há erro no handler', async () => {
      const mockResult = {
        data: null,
        limit: 10,
        offset: 0,
        page: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
        error: 'Erro interno do servidor'
      };

      mockRequest.query = {};
      mockRoomHandler.list.mockResolvedValue(mockResult as any);

      await getRooms(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: mockResult.error });
    });
  });

  describe('getRoomById', () => {
    it('deve retornar uma sala por ID', async () => {
      const mockRoom = { 
        id: '1', 
        name: 'Sala 1',
        size: 10,
        description: 'Descrição da sala',
        exclusive: false,
        status: true,
        nextBooking: null,
        totalBookings: 0
      };
      const mockResult = {
        data: mockRoom,
        error: null
      };

      mockRequest.params = { id: '1' };
      mockRoomHandler.single.mockResolvedValue(mockResult as any);

      await getRoomById(mockRequest as Request, mockResponse as Response);

      expect(mockRoomHandler.single).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(mockRoom);
    });

    it('deve retornar erro 404 quando sala não encontrada', async () => {
      const mockResult = {
        data: null,
        error: 'Sala não encontrada.'
      };

      mockRequest.params = { id: '999' };
      mockRoomHandler.single.mockResolvedValue(mockResult as any);

      await getRoomById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: mockResult.error });
    });
  });

  describe('updateRoom', () => {
    it('deve atualizar uma sala com sucesso', async () => {
      const updates = { name: 'Sala Atualizada' };
      const mockResult = {
        data: { 
          id: '1', 
          name: 'Sala Atualizada',
          size: 10,
          description: 'Descrição da sala',
          exclusive: false,
          status: true
        },
        error: null
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updates;
      mockRoomHandler.update.mockResolvedValue(mockResult as any);

      await updateRoom(mockRequest as Request, mockResponse as Response);

      expect(mockRoomHandler.update).toHaveBeenCalledWith({ id: '1', updates });
      expect(mockJson).toHaveBeenCalledWith(mockResult.data);
    });

    it('deve retornar erro 400 quando há erro na atualização', async () => {
      const updates = { name: '' };
      const expectedError = {
        error: 'Dados inválidos',
        details: [
          {
            field: 'name',
            message: 'Nome da sala deve ser uma string não vazia'
          },
          {
            field: 'name',
            message: 'Nome não pode ser apenas espaços'
          }
        ]
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updates;
      // Não precisamos mockar o handler pois o erro vem da validação Zod

      await updateRoom(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('deleteRoom', () => {
    it('deve deletar uma sala com sucesso', async () => {
      const mockResult = {
        data: { 
          id: '1', 
          name: 'Sala Deletada',
          size: 10,
          description: 'Descrição da sala',
          exclusive: false,
          status: true
        },
        error: null
      };

      mockRequest.params = { id: '1' };
      mockRoomHandler.delete.mockResolvedValue(mockResult as any);

      await deleteRoom(mockRequest as Request, mockResponse as Response);

      expect(mockRoomHandler.delete).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith({ message: 'Sala deletada com sucesso.' });
    });

    it('deve retornar erro 400 quando há erro na deleção', async () => {
      const mockResult = {
        data: null,
        error: 'Erro ao deletar sala'
      };

      mockRequest.params = { id: '1' };
      mockRoomHandler.delete.mockResolvedValue(mockResult as any);

      await deleteRoom(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: mockResult.error });
    });
  });

  describe('searchRoom', () => {
    it('deve buscar salas por nome', async () => {
      const mockRooms = [{ 
        id: '1', 
        name: 'Sala de Reunião',
        size: 10,
        description: 'Descrição da sala',
        exclusive: false,
        status: true
      }];
      const mockResult = {
        data: mockRooms,
        error: null
      };

      mockRequest.query = { name: 'Reunião' };
      mockRoomHandler.search.mockResolvedValue(mockResult as any);

      await searchRoom(mockRequest as Request, mockResponse as Response);

      expect(mockRoomHandler.search).toHaveBeenCalledWith('Reunião');
      expect(mockJson).toHaveBeenCalledWith(mockRooms);
    });

    it('deve retornar erro 404 quando nenhuma sala é encontrada', async () => {
      const mockResult = {
        data: null,
        error: 'Sala não encontrada.'
      };

      mockRequest.query = { name: 'Inexistente' };
      mockRoomHandler.search.mockResolvedValue(mockResult as any);

      await searchRoom(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: mockResult.error });
    });
  });
});