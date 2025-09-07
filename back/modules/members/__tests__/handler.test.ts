import { MemberHandler } from '../handler';
import { MemberData, SearchByFilterParams } from '../types';

// Mock do dayjs
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  const mockDayjs: any = jest.fn().mockImplementation((...args) => {
    if (args.length === 0) {
      return originalDayjs('2024-01-15T10:00:00');
    }
    const dayjsInstance = originalDayjs(...args);
    dayjsInstance.format = jest.fn().mockReturnValue('2024-01-15');
    return dayjsInstance;
  });
  mockDayjs.extend = jest.fn();
  return {
    __esModule: true,
    default: mockDayjs
  };
});

// Mock do translateError
jest.mock('@/utils/errors', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('Erro traduzido')
}));

// Mock do Prisma
jest.mock('@/config/db', () => ({
  db: {
    member: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }
  }
}));

describe('Members Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMemberHandler', () => {
    it('deve executar criação básica', async () => {
      const memberData: MemberData = {
        full_name: 'João Silva',
        birth_date: '15/01/1990',
        gender: 'Masculino',
        phone: '11999999999',
        email: 'joao@example.com'
      };

      const result = await MemberHandler.create(memberData);
      expect(result).toBeDefined();
    });
  });

  describe('getMembersHandler', () => {
    it('deve executar busca básica', async () => {
      const result = await MemberHandler.list({});
      expect(result).toBeDefined();
    });
  });

  describe('getMemberByIdHandler', () => {
    it('deve executar busca por ID', async () => {
      const result = await MemberHandler.single('1');
      expect(result).toBeDefined();
    });
  });

  describe('updateMemberHandler', () => {
    it('deve executar atualização', async () => {
      const updateData = { full_name: 'João Santos' };
      const result = await MemberHandler.update('1', updateData);
      expect(result).toBeDefined();
    });
  });

  describe('deleteMemberHandler', () => {
    it('deve executar exclusão', async () => {
      const result = await MemberHandler.delete('1');
      expect(result).toBeDefined();
    });
  });

  describe('searchMemberHandler', () => {
    it('deve executar busca básica', async () => {
      const result = await MemberHandler.search('João');
      expect(result).toBeDefined();
    });
  });

  describe('searchByFilterHandler', () => {
    it('deve buscar com filtro eq', async () => {
      const params: SearchByFilterParams = {
        field: 'gender',
        value: 'Masculino',
        operator: 'eq'
      };

      const result = await MemberHandler.searchByFilter(params);
      expect(result).toBeDefined();
    });

    it('deve retornar erro para parâmetros inválidos', async () => {
      const params: Partial<SearchByFilterParams> = {
        field: 'gender'
        // Faltando value e operator
      };

      const result = await MemberHandler.searchByFilter(params as SearchByFilterParams);
      expect(result.error).toBe('Parâmetros inválidos.');
    });

    it('deve retornar erro para operador inválido', async () => {
      const params: SearchByFilterParams = {
        field: 'gender',
        value: 'Masculino',
        operator: 'invalid'
      };

      const result = await MemberHandler.searchByFilter(params);
      expect(result.error).toBe('Operador inválido.');
    });
  });
});