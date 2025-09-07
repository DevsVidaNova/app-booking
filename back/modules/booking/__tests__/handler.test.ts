import 'dayjs/locale/pt.js';
import { BookingHandler } from '../handler';
import { Request, Response } from 'express';
import { db } from '@/config/db';

// Mock do banco de dados
jest.mock('@/config/db', () => ({
  db: {
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    room: {
      findUnique: jest.fn(),
    },
  },
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
  mockDayjs.locale = jest.fn();
  return {
    __esModule: true,
    default: mockDayjs
  };
});

// Mock dos plugins do dayjs
jest.mock('dayjs/locale/pt.js', () => {});
jest.mock('dayjs/plugin/customParseFormat.js', () => {});

describe('Booking Handler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };

    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
  });

  describe('create', () => {
    const mockUser = { id: 'user-123' };
    const validBookingData = {
      description: 'Reunião de equipe',
      roomId: 'room-1',
      date: '15/01/2024',
      startTime: '09:00:00',
      endTime: '10:00:00',
      repeat: null,
      dayRepeat: null
    };

    it('deve criar uma reserva com sucesso', async () => {
      // Mock para buscar a sala
      (db.room.findUnique as jest.Mock).mockResolvedValue({ id: 'room-1', name: 'Sala A' });
      
      // Mock para verificar conflitos (retorna array vazio = sem conflitos)
      (db.booking.findMany as jest.Mock).mockResolvedValue([]);
      
      // Mock para criação da reserva
      const mockBookingResult = {
        id: 1,
        ...validBookingData,
        userId: mockUser.id,
        date: '2024-01-15',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (db.booking.create as jest.Mock).mockResolvedValue(mockBookingResult);

      await BookingHandler.create(mockUser, validBookingData, mockResponse as Response);

      expect(mockJson).toHaveBeenCalled();
      expect(db.room.findUnique).toHaveBeenCalled();
      expect(db.booking.findMany).toHaveBeenCalled();
      expect(db.booking.create).toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando há conflito de horário', async () => {
      // Mock para buscar a sala
      (db.room.findUnique as jest.Mock).mockResolvedValue({ id: 'room-1', name: 'Sala A' });
      
      const conflictingBooking = {
        id: 2,
        roomId: 'room-1',
        date: '2024-01-15',
        startTime: '08:30:00',
        endTime: '09:30:00'
      };

      // Mock para a consulta de conflitos retornar dados conflitantes
      (db.booking.findMany as jest.Mock).mockResolvedValue([conflictingBooking]);

      await BookingHandler.create(mockUser, validBookingData, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Conflito de horário: já existe uma reserva nesse intervalo.' });
    });

    it('deve retornar erro 400 quando há erro na inserção', async () => {
      // Mock para buscar a sala
      (db.room.findUnique as jest.Mock).mockResolvedValue({ id: 'room-1', name: 'Sala A' });
      
      // Mock para não ter conflitos
      (db.booking.findMany as jest.Mock).mockResolvedValue([]);
      
      // Mock para erro na inserção
      (db.booking.create as jest.Mock).mockRejectedValue(new Error('Erro na inserção'));

      await BookingHandler.create(mockUser, validBookingData, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Erro ao criar reserva' });
    });

    it('deve retornar erro 500 quando há exceção', async () => {
      // Mock para buscar a sala
      (db.room.findUnique as jest.Mock).mockResolvedValue({ id: 'room-1', name: 'Sala A' });
      
      // Mock para lançar exceção na primeira consulta
      (db.booking.findMany as jest.Mock).mockRejectedValue(new Error('Erro inesperado'));

      await BookingHandler.create(mockUser, validBookingData, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Erro ao criar reserva' });
    });
  });

  describe('list', () => {
    it('deve retornar todas as reservas formatadas', async () => {
      const mockBookings = [
        {
          id: 1,
          description: 'Reunião',
          date: '2024-01-15',
          startTime: '09:00:00',
          endTime: '10:00:00',
          repeat: null,
          dayRepeat: null,
          user: {
            id: 1,
            name: 'João Silva',
            email: 'joao@teste.com',
            phone: '11999999999'
          },
          room: {
            id: 1,
            name: 'Sala A',
            size: 10
          }
        }
      ];

      (db.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      await BookingHandler.list(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando há falha na consulta', async () => {
      (db.booking.findMany as jest.Mock).mockRejectedValue(new Error('Erro na consulta'));

      await BookingHandler.list(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao buscar reservas' });
    });

    it('deve retornar erro 500 quando há exceção', async () => {
      (db.booking.findMany as jest.Mock).mockRejectedValue(new Error('Erro inesperado'));

      await BookingHandler.list(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao buscar reservas' });
    });
  });

  describe('single', () => {
    beforeEach(() => {
      mockRequest.params = { id: '1' };
    });

    it('deve retornar uma reserva específica', async () => {
      const mockBooking = {
        id: 1,
        description: 'Reunião',
        date: '2024-01-15',
        startTime: '09:00:00',
        endTime: '10:00:00',
        repeat: null,
        dayRepeat: null,
        user: {
          id: 1,
          name: 'João Silva',
          email: 'joao@teste.com',
          phone: '11999999999'
        },
        room: {
          id: 1,
          name: 'Sala A',
          size: 10
        }
      };

      (db.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      await BookingHandler.single(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalled();
    });

    it('deve retornar erro 404 quando reserva não é encontrada', async () => {
      (db.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await BookingHandler.single(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Reserva não encontrada' });
    });

    it('deve retornar erro 500 quando há exceção', async () => {
      (db.booking.findUnique as jest.Mock).mockRejectedValue(new Error('Erro inesperado'));

      await BookingHandler.single(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao buscar reserva por ID' });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        description: 'Reunião atualizada',
        startTime: '10:00:00',
        endTime: '11:00:00'
      };
    });

    it('deve atualizar uma reserva com sucesso', async () => {
      const existingBooking = {
        id: 1,
        description: 'Reunião antiga',
        roomId: 'room-1',
        date: '2024-01-15',
        startTime: '09:00:00',
        endTime: '10:00:00'
      };

      const updatedBooking = {
        ...existingBooking,
        description: 'Reunião atualizada',
        startTime: '10:00:00',
        endTime: '11:00:00'
      };

      // Mock para buscar reserva existente
      (db.booking.findUnique as jest.Mock).mockResolvedValue(existingBooking);
      
      // Mock para verificar conflitos (retorna array vazio = sem conflitos)
      (db.booking.findMany as jest.Mock).mockResolvedValue([]);
      
      // Mock para atualização da reserva
      (db.booking.update as jest.Mock).mockResolvedValue(updatedBooking);

      await BookingHandler.update(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalled();
    });

    it('deve retornar erro 404 quando reserva não existe', async () => {
      (db.booking.findUnique as jest.Mock).mockResolvedValue(null);

      await BookingHandler.update(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Reserva não encontrada' });
    });

    it('deve retornar erro 500 quando há exceção', async () => {
      (db.booking.findUnique as jest.Mock).mockRejectedValue(new Error('Erro inesperado'));

      await BookingHandler.update(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao atualizar reserva' });
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockRequest.params = { id: '1' };
    });

    it('deve deletar uma reserva com sucesso', async () => {
      (db.booking.delete as jest.Mock).mockResolvedValue({ id: 1 });

      await BookingHandler.delete(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalled();
    });

    it('deve retornar erro 400 quando há erro na deleção', async () => {
      (db.booking.delete as jest.Mock).mockRejectedValue(new Error('Erro na deleção'));

      await BookingHandler.delete(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao deletar reserva' });
    });

    it('deve retornar erro 500 quando há exceção', async () => {
      (db.booking.delete as jest.Mock).mockRejectedValue(new Error('Erro inesperado'));

      await BookingHandler.delete(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro ao deletar reserva' });
    });
  });
});
