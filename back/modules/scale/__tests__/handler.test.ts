import { ScaleHandler } from '../handler';
import { ScaleInput } from '../types';

// Mock do dayjs
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  const mockDayjs: any = jest.fn().mockImplementation((...args) => {
    if (args.length === 0) {
      return originalDayjs('2024-01-15T10:00:00');
    }
    const dayjsInstance = originalDayjs(...args);
    dayjsInstance.format = jest.fn().mockReturnValue('2024-01-15');
    dayjsInstance.isValid = jest.fn().mockReturnValue(true);
    return dayjsInstance;
  });
  mockDayjs.extend = jest.fn();
  return {
    __esModule: true,
    default: mockDayjs
  };
});

// Mock dos plugins do dayjs
jest.mock('dayjs/plugin/customParseFormat.js', () => {});

// Mock do Prisma
jest.mock('@/config/db', () => ({
  db: {
    scale: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }
  }
}));

describe('Scale Handler', () => {
  const mockDb = require('@/config/db').db;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks padrão
    mockDb.scale.findMany.mockResolvedValue([]);
    mockDb.scale.count.mockResolvedValue(0);
    mockDb.scale.findUnique.mockResolvedValue(null);
    mockDb.scale.findFirst.mockResolvedValue(null);
    mockDb.scale.create.mockResolvedValue({ id: '1', name: 'Test Scale' });
    mockDb.scale.update.mockResolvedValue({ id: '1', name: 'Updated Scale' });
    mockDb.scale.delete.mockResolvedValue({ id: '1' });
  });
  const validScaleInput: ScaleInput = {
    date: '15/01/2024',
    name: 'Escala Domingo',
    direction: 'João Silva',
    band: 'Banda Principal',
    projection: 'Maria Santos',
    light: 'Pedro Costa',
    transmission: 'Ana Lima',
    camera: 'Carlos Oliveira',
    live: 'Fernanda Rocha',
    sound: 'Roberto Silva',
    training_sound: 'Lucas Pereira',
    photography: 'Juliana Martins',
    stories: 'Rafael Santos',
    dynamic: 'Camila Ferreira'
  };

  describe('ScaleHandler.create', () => {
    it('deve criar uma escala com sucesso', async () => {
      const result = await ScaleHandler.create(validScaleInput);
      expect(result).toEqual({ data: null });
    });
  });

  describe('ScaleHandler.list', () => {
    it('deve retornar escalas com paginação padrão', async () => {
      // Mock específico para este teste
      mockDb.scale.findMany.mockResolvedValue([
        { id: '1', name: 'Escala 1', date: new Date('2024-01-15') }
      ]);
      mockDb.scale.count.mockResolvedValue(1);

      const result = await ScaleHandler.list({});
      expect(result.data).toBeDefined();
      expect(result.data?.pagination).toBeDefined();
    });

    it('deve retornar escalas com paginação customizada', async () => {
      // Mock específico para este teste
      mockDb.scale.findMany.mockResolvedValue([
        { id: '2', name: 'Escala 2', date: new Date('2024-01-15') }
      ]);
      mockDb.scale.count.mockResolvedValue(1);

      const result = await ScaleHandler.list({ page: 2, pageSize: 1 });
      expect(result.data).toBeDefined();
      expect(result.data?.pagination.page).toBe(2);
      expect(result.data?.pagination.pageSize).toBe(1);
    });
  });

  describe('ScaleHandler.single', () => {
    it('deve buscar escala por ID', async () => {
      const result = await ScaleHandler.single('1');
      expect(result).toBeDefined();
    });
  });

  describe('ScaleHandler.update', () => {
    it('deve atualizar escala com sucesso', async () => {
      const updates = { name: 'Escala Atualizada' };
      const result = await ScaleHandler.update('1', updates);
      expect(result).toBeDefined();
    });
  });

  describe('ScaleHandler.delete', () => {
    it('deve deletar escala com sucesso', async () => {
      const result = await ScaleHandler.delete('1');
      expect(result).toBeDefined();
    });
  });

  describe('ScaleHandler.search', () => {
    it('deve buscar escalas por nome', async () => {
      const result = await ScaleHandler.search('Domingo');
      expect(result).toBeDefined();
    });
  });

  describe('ScaleHandler.duplicate', () => {
    it('deve duplicar escala com sucesso', async () => {
      const result = await ScaleHandler.duplicate('1');
      expect(result).toBeDefined();
    });
  });
});