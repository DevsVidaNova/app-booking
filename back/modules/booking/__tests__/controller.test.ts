import { Request, Response, NextFunction } from 'express';
import * as controller from '../controller';
import { BookingHandler } from '../handler';

// Mock do handler
jest.mock('../handler');
const mockHandler = BookingHandler as jest.Mocked<typeof BookingHandler>;

describe('Booking Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockNext = jest.fn();

    mockResponse = {
      json: mockJson,
      status: mockStatus
    };

    mockRequest = {
      body: {},
      params: {},
      query: {},
      profile: { id: 'user-123' },
      user: { id: 'user-123' }
    } as any;

    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('deve criar uma reserva com dados válidos', async () => {
      mockRequest.body = {
        description: 'Reunião de equipe',
        roomId: 'room-1',
        date: '2024-01-15', // formato ISO
        startTime: '09:00:00',
        endTime: '10:00:00',
        repeat: 'none',
        dayRepeat: null
      };

      (mockHandler.create as jest.Mock).mockResolvedValue(undefined);

      await controller.createBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHandler.create).toHaveBeenCalledWith(
        { id: 'user-123' },
        mockRequest.body,
        mockResponse
      );
    });

    it('deve retornar erro 400 quando campos obrigatórios não fornecidos', async () => {
      mockRequest.body = { description: 'Reunião' };

      await controller.createBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Dados inválidos",
        details: expect.arrayContaining([
          expect.objectContaining({ field: "roomId", message: "Required" }),
          expect.objectContaining({ field: "startTime", message: "Required" }),
          expect.objectContaining({ field: "endTime", message: "Required" })
        ])
      });
      expect(mockHandler.create).not.toHaveBeenCalled();
    });

    it('deve aceitar reserva sem data quando repeat é válido', async () => {
      mockRequest.body = {
        description: 'Reunião',
        roomId: 'room-1',
        startTime: '09:00:00',
        endTime: '10:00:00',
        repeat: 'day',
        dayRepeat: 1
      };

      (mockHandler.create as jest.Mock).mockResolvedValue(undefined);

      await controller.createBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHandler.create).toHaveBeenCalledWith(
        { id: 'user-123' },
        mockRequest.body,
        mockResponse
      );
    });

    it('deve aceitar horários válidos', async () => {
      mockRequest.body = {
        description: 'Reunião',
        roomId: 'room-1',
        date: '2024-01-15',
        startTime: '09:00:00',
        endTime: '10:00:00',
        repeat: 'none'
      };

      (mockHandler.create as jest.Mock).mockResolvedValue(undefined);

      await controller.createBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHandler.create).toHaveBeenCalled();
    });

    it('deve aceitar horários em diferentes formatos HH:MM', async () => {
      mockRequest.body = {
        description: 'Reunião',
        roomId: 'room-1',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '10:30',
        repeat: 'none'
      };

      (mockHandler.create as jest.Mock).mockResolvedValue(undefined);

      await controller.createBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHandler.create).toHaveBeenCalled();
    });

    it('deve usar profile.id quando disponível', async () => {
      mockRequest.body = {
        description: 'Reunião',
        roomId: 'room-1',
        date: '2024-01-15',
        startTime: '09:00:00',
        endTime: '10:00:00',
        repeat: 'none'
      };

      (mockRequest as any).profile = { id: 'profile-123' };
      (mockRequest as any).user = { id: 'user-456' };

      (mockHandler.create as jest.Mock).mockResolvedValue(undefined);

      await controller.createBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHandler.create).toHaveBeenCalledWith(
        { id: 'profile-123' },
        mockRequest.body,
        mockResponse
      );
    });

    it('deve usar user.id quando profile não disponível', async () => {
      mockRequest.body = {
        description: 'Reunião',
        roomId: 'room-1',
        date: '2024-01-15',
        startTime: '09:00:00',
        endTime: '10:00:00',
        repeat: 'none'
      };

      (mockRequest as any).profile = undefined;
      (mockRequest as any).user = { id: 'user-456' };

      (mockHandler.create as jest.Mock).mockResolvedValue(undefined);

      await controller.createBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHandler.create).toHaveBeenCalledWith(
        { id: 'user-456' },
        mockRequest.body,
        mockResponse
      );
    });

    it('deve tratar exceções e retornar erro 500', async () => {
      mockRequest.body = {
        description: 'Reunião',
        roomId: 'room-1',
        date: '2024-01-15',
        startTime: '09:00:00',
        endTime: '10:00:00',
        repeat: 'none'
      };

      (mockHandler.create as jest.Mock).mockRejectedValue(new Error('Erro interno'));

      await controller.createBooking(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Erro interno do servidor ao criar reserva.' });
    });
  });

  // Outras rotas podem ser copiadas diretamente, pois o problema era apenas createBooking
  describe('getBooking', () => {
    it('deve chamar mockHandler.getBooking', async () => {
      await controller.getBooking(mockRequest as Request, mockResponse as Response);
      expect(mockHandler.list).toHaveBeenCalledWith(mockRequest, mockResponse);
    });
  });

  describe('getBookingById', () => {
    it('deve chamar mockHandler.getBookingById', async () => {
      await controller.getBookingById(mockRequest as Request, mockResponse as Response);
      expect(mockHandler.single).toHaveBeenCalledWith(mockRequest, mockResponse);
    });
  });

  describe('updateBooking', () => {
    it('deve atualizar reserva com dados válidos', async () => {
      mockRequest.body = { description: 'Atualizado', startTime: '10:00:00' };
      await controller.updateBooking(mockRequest as Request, mockResponse as Response);
      expect(mockHandler.update).toHaveBeenCalledWith(mockRequest, mockResponse);
    });

    it('deve retornar erro 400 quando body está vazio', async () => {
      mockRequest.body = {};
      await controller.updateBooking(mockRequest as Request, mockResponse as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Nenhum campo válido enviado para atualização' });
      expect(mockHandler.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteBooking', () => {
    it('deve chamar mockHandler.deleteBooking', async () => {
      await controller.deleteBooking(mockRequest as Request, mockResponse as Response);
      expect(mockHandler.delete).toHaveBeenCalledWith(mockRequest, mockResponse);
    });
  });

  describe('getBookingByFilter', () => {
    it('deve chamar mockHandler.getBookingByFilter', async () => {
      await controller.getBookingByFilter(mockRequest as Request, mockResponse as Response);
      expect(mockHandler.filter).toHaveBeenCalledWith(mockRequest, mockResponse);
    });
  });

  describe('getBookingMy', () => {
    it('deve chamar mockHandler.getBookingMy', async () => {
      await controller.getBookingMy(mockRequest as Request, mockResponse as Response);
      expect(mockHandler.listByMe).toHaveBeenCalledWith(mockRequest, mockResponse);
    });
  });

  describe('getBookingsByToday', () => {
    it('deve chamar mockHandler.getBookingsByToday', async () => {
      await controller.getBookingsByToday(mockRequest as Request, mockResponse as Response);
      expect(mockHandler.listByToday).toHaveBeenCalledWith(mockRequest, mockResponse);
    });
  });

  describe('getBookingsByWeek', () => {
    it('deve chamar mockHandler.getBookingsByWeek', async () => {
      await controller.getBookingsByWeek(mockRequest as Request, mockResponse as Response);
      expect(mockHandler.listByWeek).toHaveBeenCalledWith(mockRequest, mockResponse);
    });
  });
});
