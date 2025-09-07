import {
  createScale,
  getScales,
  getScaleById,
  updateScale,
  deleteScale,
  searchScale,
  duplicateScale
} from '../controller';
import { ScaleHandler } from '../handler';

// Mock do handler
jest.mock('../handler');
const mockHandler = ScaleHandler as jest.Mocked<typeof ScaleHandler>;

describe('Scale Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('createScale', () => {
    it('should create scale successfully', async () => {
      // Given
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 dias no futuro
      const formattedDate = futureDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      req.body = {
        date: formattedDate,
        name: 'Escala Teste',
        direction: 'Direção Teste',
        band: '1'
      };
      mockHandler.create.mockResolvedValue({ data: null });

      // When
      await createScale(req, res);

      // Then
      expect(mockHandler.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Escala criada com sucesso.' });
    });

    it('should return error for missing required fields', async () => {
      // Given
      req.body = { name: 'Escala Teste' }; // Missing date and direction

      // When
      await createScale(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Dados inválidos",
        details: ["Required", "Required"]
      });
    });

    it('should handle handler error', async () => {
      // Given
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 dias no futuro
      const formattedDate = futureDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      req.body = {
        date: formattedDate,
        name: 'Escala Teste',
        direction: 'Direção Teste'
      };
      mockHandler.create.mockResolvedValue({ error: 'Erro do handler.' });

      // When
      await createScale(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro do handler.' });
    });

    it('should return error for past date', async () => {
      // Given
      req.body = {
        date: '01/01/2024',
        name: 'Escala Teste',
        direction: 'Direção Teste'
      };

      // When
      await createScale(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: "Dados inválidos",
        details: ["Data não pode ser no passado."]
      });
    });
  });

  describe('getScales', () => {
    it('should get scales with default pagination', async () => {
      // Given
      const mockScalesResult = {
        scales: [
          {
            id: '1',
            date: '2024-01-01',
            name: 'Escala Teste',
            description: 'Descrição teste',
            direction: { id: '1', full_name: 'João Silva' },
            band: { id: '1', full_name: 'Banda Teste' }
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          pageSize: 15,
          totalPages: 1
        }
      };
      mockHandler.list.mockResolvedValue({ data: mockScalesResult });

      // When
      await getScales(req, res);

      // Then
      expect(mockHandler.list).toHaveBeenCalledWith({ page: 1, pageSize: 15 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockScalesResult);
    });

    it('should get scales with custom pagination', async () => {
      // Given
      req.query = { page: '2', pageSize: '10' };
      const mockScalesResult = {
        scales: [],
        pagination: {
          total: 0,
          page: 2,
          pageSize: 10,
          totalPages: 0
        }
      };
      mockHandler.list.mockResolvedValue({ data: mockScalesResult });

      // When
      await getScales(req, res);

      // Then
      expect(mockHandler.list).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockScalesResult);
    });

    it('should handle handler error', async () => {
      // Given
      mockHandler.list.mockResolvedValue({ error: 'Erro ao listar escalas.' });

      // When
      await getScales(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar escalas.' });
    });
  });

  describe('getScaleById', () => {
    it('should get scale by id successfully', async () => {
      // Given
      req.params.id = '1';
      const mockScale = {
        id: '1',
        date: '2024-01-01',
        name: 'Escala Teste',
        description: 'Descrição teste'
      };
      mockHandler.single.mockResolvedValue({ data: mockScale });

      // When
      await getScaleById(req, res);

      // Then
      expect(mockHandler.single).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockScale);
    });

    it('should handle scale not found', async () => {
      // Given
      req.params.id = '999';
      mockHandler.single.mockResolvedValue({ error: 'Escala não encontrada.' });

      // When
      await getScaleById(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Escala não encontrada.' });
    });
  });

  describe('updateScale', () => {
    it('should update scale successfully', async () => {
      // Given
      req.params.id = '1';
      req.body = { name: 'Escala Atualizada' };
      mockHandler.update.mockResolvedValue({ data: null });

      // When
      await updateScale(req, res);

      // Then
      expect(mockHandler.update).toHaveBeenCalledWith('1', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Escala atualizada com sucesso.' });
    });

    it('should handle update error', async () => {
      // Given
      req.params.id = '1';
      req.body = { name: 'Escala Atualizada' };
      mockHandler.update.mockResolvedValue({ error: 'Erro ao atualizar escala.' });

      // When
      await updateScale(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao atualizar escala.' });
    });
  });

  describe('deleteScale', () => {
    it('should delete scale successfully', async () => {
      // Given
      req.params.id = '1';
      mockHandler.delete.mockResolvedValue({ data: null });

      // When
      await deleteScale(req, res);

      // Then
      expect(mockHandler.delete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Escala excluída com sucesso.' });
    });

    it('should handle delete error', async () => {
      // Given
      req.params.id = '999';
      mockHandler.delete.mockResolvedValue({ error: 'Escala não encontrada.' });

      // When
      await deleteScale(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Escala não encontrada.' });
    });
  });

  describe('searchScale', () => {
    it('should search scales successfully', async () => {
      // Given
      req.body = { name: 'Teste' };
      const mockScales = [
        {
          id: '1',
          date: '2024-01-01',
          name: 'Escala Teste',
          description: 'Descrição teste'
        }
      ];
      mockHandler.search.mockResolvedValue({ data: mockScales });

      // When
      await searchScale(req, res);

      // Then
      expect(mockHandler.search).toHaveBeenCalledWith('Teste');
      expect(res.json).toHaveBeenCalledWith(mockScales);
    });

    it('should handle search error', async () => {
      // Given
      req.body = { name: 'Inexistente' };
      mockHandler.search.mockResolvedValue({ error: 'Escala não encontrada.' });

      // When
      await searchScale(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Escala não encontrada.' });
    });
  });

  describe('duplicateScale', () => {
    it('should duplicate scale successfully', async () => {
      // Given
      req.params.id = '1';
      const mockDuplicatedScale = {
        id: '2',
        date: '2024-01-01',
        name: 'Escala Teste (duplicado)',
        description: 'Descrição teste'
      };
      mockHandler.duplicate.mockResolvedValue({ data: mockDuplicatedScale });

      // When
      await duplicateScale(req, res);

      // Then
      expect(mockHandler.duplicate).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockDuplicatedScale);
    });

    it('should handle duplicate error', async () => {
      // Given
      req.params.id = '999';
      mockHandler.duplicate.mockResolvedValue({ error: 'Escala não encontrada.' });

      // When
      await duplicateScale(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Escala não encontrada.' });
    });
  });
});