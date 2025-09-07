import { RoomHandler } from '../handler';
import { UpdateRoomInput } from '../types';

// Mock do Prisma
jest.mock('@/config/db', () => ({
  db: {
    room: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0)
    },
    booking: {
      findMany: jest.fn().mockResolvedValue([])
    }
  }
}));

// Mock do dayjs
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  const mockDayjs: any = jest.fn().mockImplementation((...args) => {
    if (args.length === 0) {
      return originalDayjs('2024-01-15T10:00:00');
    }
    return originalDayjs(...args);
  });
  mockDayjs.extend = jest.fn();
  return {
    __esModule: true,
    default: mockDayjs
  };
});

// Mock do getPagination
jest.mock('@/utils/pagination', () => ({
  getPagination: jest.fn(() => ({
    limit: 10,
    offset: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  }))
}));

// Importar os mocks para usar nos testes
import { db } from '@/config/db';
import { getPagination } from '@/utils/pagination';

const mockDb = db as jest.Mocked<typeof db>;
const mockGetPagination = getPagination as jest.MockedFunction<typeof getPagination>;

describe('Room Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve criar uma sala com sucesso', async () => {
      const roomData = {
        name: 'Sala de Reunião',
        size: 10,
        description: 'Sala para reuniões',
        exclusive: false,
        status: true
      };

      const mockRoom = { id: '1', ...roomData };
      (mockDb.room.create as any).mockResolvedValue(mockRoom);

      const result = await RoomHandler.create(roomData);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockRoom);
      expect(mockDb.room.create).toHaveBeenCalledWith({ data: roomData });
    });

    it('deve lidar com erro do Prisma', async () => {
      const roomData = {
        name: 'Sala de Reunião',
        size: 10,
        description: 'Sala para reuniões',
        exclusive: false,
        status: true
      };

      (mockDb.room.create as any).mockRejectedValue(new Error('Erro do banco'));

      await expect(RoomHandler.create(roomData)).rejects.toThrow('Erro do banco');
    });
  });

  describe('list', () => {
    it('deve retornar salas com paginação padrão', async () => {
      const mockRooms = [
        { id: '1', name: 'Sala 1', size: 10, description: 'Descrição', exclusive: false, status: true },
        { id: '2', name: 'Sala 2', size: 15, description: 'Descrição 2', exclusive: true, status: true }
      ];
      const mockTotal = 2;

      (mockDb.room.findMany as any).mockResolvedValue(mockRooms as any);
      (mockDb.room.count as any).mockResolvedValue(mockTotal);
      mockGetPagination.mockReturnValue({
        limit: 10,
        offset: 0,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await RoomHandler.list();

      expect(result.data).toEqual(mockRooms);
      expect(result.error).toBeNull();
      expect(mockDb.room.findMany).toHaveBeenCalledWith({ skip: 0, take: 10 });
      expect(mockDb.room.count).toHaveBeenCalled();
      expect(mockGetPagination).toHaveBeenCalledWith(1, 10, mockTotal);
    });

    it('deve retornar salas com paginação customizada', async () => {
      const mockRooms = [{ id: '1', name: 'Sala 1', size: 10, description: 'Descrição', exclusive: false, status: true }];
      const mockTotal = 25;

      (mockDb.room.findMany as any).mockResolvedValue(mockRooms as any);
      (mockDb.room.count as any).mockResolvedValue(mockTotal);
      mockGetPagination.mockReturnValue({
        limit: 5,
        offset: 5,
        page: 2,
        totalPages: 5,
        hasNext: true,
        hasPrev: true
      });

      const result = await RoomHandler.list(2, 5);

      expect(result.data).toEqual(mockRooms);
      expect(result.error).toBeNull();
      expect(mockDb.room.findMany).toHaveBeenCalledWith({ skip: 5, take: 5 });
      expect(mockGetPagination).toHaveBeenCalledWith(2, 5, mockTotal);
    });

    it('deve lidar com erro do Prisma', async () => {
      (mockDb.room.findMany as any).mockRejectedValue(new Error('Erro do banco'));

      await expect(RoomHandler.list()).rejects.toThrow('Erro do banco');
    });
  });

  describe('single', () => {
    it('deve buscar sala por ID com sucesso', async () => {
      const mockRoom = {
        id: '1',
        name: 'Sala 1',
        size: 10,
        description: 'Descrição',
        exclusive: false,
        status: true
      };
      const mockBookings: any[] = [];

      (mockDb.room.findUnique as any).mockResolvedValue(mockRoom as any);
      (mockDb.booking.findMany as any).mockResolvedValue(mockBookings as any);

      const result = await RoomHandler.single('1');

      expect(result.data).toEqual({
        ...mockRoom,
        nextBooking: null,
        totalBookings: 0
      });
      expect(result.error).toBeNull();
      expect(mockDb.room.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockDb.booking.findMany).toHaveBeenCalledWith({
        where: { roomId: '1' },
        orderBy: { date: 'asc' },
        include: { user: true }
      });
    });

    it('deve retornar erro quando sala não encontrada', async () => {
      (mockDb.room.findUnique as any).mockResolvedValue(null);

      const result = await RoomHandler.single('999');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Sala não encontrada.');
    });

    it('deve lidar com erro do Prisma', async () => {
      (mockDb.room.findUnique as any).mockRejectedValue(new Error('Erro do banco'));

      const result = await RoomHandler.single('1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Erro interno do servidor');
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve atualizar sala com sucesso', async () => {
      const updateData: UpdateRoomInput = {
        id: '1',
        updates: {
          name: 'Sala Atualizada',
          size: 25
        }
      };

      const mockUpdatedRoom = {
        id: '1',
        name: 'Sala Atualizada',
        size: 25,
        description: 'Descrição',
        exclusive: false,
        status: true
      };

      (mockDb.room.update as any).mockResolvedValue(mockUpdatedRoom as any);

      const result = await RoomHandler.update(updateData);

      expect(result.data).toEqual(mockUpdatedRoom);
      expect(result.error).toBeNull();
      expect(mockDb.room.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData.updates
      });
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      const updateData: UpdateRoomInput = {
        id: '1',
        updates: {
          size: 30
        }
      };

      const mockUpdatedRoom = {
        id: '1',
        name: 'Sala Original',
        size: 30,
        description: 'Descrição',
        exclusive: false,
        status: true
      };

      (mockDb.room.update as any).mockResolvedValue(mockUpdatedRoom as any);

      const result = await RoomHandler.update(updateData);

      expect(result.data).toEqual(mockUpdatedRoom);
      expect(result.error).toBeNull();
      expect(mockDb.room.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { size: 30 }
      });
    });

    it('deve lidar com erro do Prisma', async () => {
      const updateData: UpdateRoomInput = {
        id: '1',
        updates: { name: 'Sala Atualizada' }
      };

      (mockDb.room.update as any).mockRejectedValue(new Error('Erro do banco'));

      await expect(RoomHandler.update(updateData)).rejects.toThrow('Erro do banco');
    });
  });

  describe('delete', () => {
    it('deve deletar sala com sucesso', async () => {
      const mockDeletedRoom = {
        id: '1',
        name: 'Sala Deletada',
        size: 10,
        description: 'Descrição',
        exclusive: false,
        status: true
      };

      (mockDb.room.delete as any).mockResolvedValue(mockDeletedRoom as any);

      const result = await RoomHandler.delete('1');

      expect(result.data).toEqual(mockDeletedRoom);
      expect(result.error).toBeNull();
      expect(mockDb.room.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('deve lidar com erro do Prisma', async () => {
      (mockDb.room.delete as any).mockRejectedValue(new Error('Erro do banco'));

      await expect(RoomHandler.delete('1')).rejects.toThrow('Erro do banco');
    });
  });

  describe('search', () => {
    it('deve buscar sala por nome com sucesso', async () => {
      const mockRooms = [
        { id: '1', name: 'Sala de Reunião', size: 10, description: 'Descrição', exclusive: false, status: true }
      ];

      (mockDb.room.findMany as any).mockResolvedValue(mockRooms as any);

      const result = await RoomHandler.search('Reunião');

      expect(result.data).toEqual(mockRooms);
      expect(result.error).toBeNull();
      expect(mockDb.room.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'Reunião', mode: 'insensitive' }
        }
      });
    });

    it('deve retornar erro quando nome é vazio', async () => {
      const result = await RoomHandler.search('');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Nome é obrigatório para busca.');
    });

    it('deve retornar erro quando nome é apenas espaços', async () => {
      const result = await RoomHandler.search('   ');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Nome é obrigatório para busca.');
    });

    it('deve retornar erro quando nenhuma sala é encontrada', async () => {
      (mockDb.room.findMany as any).mockResolvedValue([]);

      const result = await RoomHandler.search('Inexistente');

      expect(result.data).toEqual([]);
      expect(result.error).toBe('Sala não encontrada.');
    });

    it('deve lidar com erro do Prisma', async () => {
      (mockDb.room.findMany as any).mockRejectedValue(new Error('Erro do banco'));

      await expect(RoomHandler.search('Reunião')).rejects.toThrow('Erro do banco');
    });
  });
});