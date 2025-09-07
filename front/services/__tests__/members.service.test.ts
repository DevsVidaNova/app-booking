import { MembersService } from '../members.service'
import { fetchWithAuth } from '@/hooks/api'

// Mock das dependências
jest.mock('@/hooks/api')

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

describe('MembersService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('deve listar membros com sucesso', async () => {
      const page = 1
      const mockMembers = {
        total: 10,
        page: 1,
        to: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        data: [
          {
            id: '1',
            full_name: 'João Silva',
            birth_date: '1990-01-01',
            gender: 'Masculino' as const,
            cpf: '12345678901',
            rg: '123456789',
            phone: '11999999999',
            email: 'joao@test.com',
            street: 'Rua A',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            cep: '01234567',
            mother_name: 'Maria Silva',
            father_name: 'José Silva',
            marital_status: 'Solteiro' as const,
            has_children: false,
            children_count: 0
          }
        ]
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockMembers)

      const result = await MembersService.list(page)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/members?page=${page}`, { method: 'GET' })
      expect(result).toEqual(mockMembers)
    })

    it('deve lançar erro quando listar membros falhar', async () => {
      const page = 1
      const error = new Error('Erro ao listar membros')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(MembersService.list(page)).rejects.toThrow('Erro ao listar membros')
    })
  })

  describe('single', () => {
    it('deve buscar membro específico com sucesso', async () => {
      const memberId = '1'
      const mockMember = {
        total: 1,
        page: 1,
        to: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        data: [
          {
            id: '1',
            full_name: 'João Silva',
            birth_date: '1990-01-01',
            gender: 'Masculino' as const,
            cpf: '12345678901',
            rg: '123456789',
            phone: '11999999999',
            email: 'joao@test.com',
            street: 'Rua A',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            cep: '01234567',
            mother_name: 'Maria Silva',
            father_name: 'José Silva',
            marital_status: 'Solteiro' as const,
            has_children: false,
            children_count: 0
          }
        ]
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockMember)

      const result = await MembersService.single(memberId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/members/${memberId}`, { method: 'GET' })
      expect(result).toEqual(mockMember)
    })

    it('deve lançar erro quando buscar membro específico falhar', async () => {
      const memberId = '1'
      const error = new Error('Membro não encontrado')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(MembersService.single(memberId)).rejects.toThrow('Membro não encontrado')
    })
  })

  describe('add', () => {
    it('deve criar membro com sucesso', async () => {
      const memberData = {
        full_name: 'João Silva',
        birth_date: '1990-01-01',
        gender: 'Masculino' as const,
        cpf: '12345678901',
        rg: '123456789',
        phone: '11999999999',
        email: 'joao@test.com',
        street: 'Rua A',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        cep: '01234567',
        mother_name: 'Maria Silva',
        father_name: 'José Silva',
        marital_status: 'Solteiro' as const,
        has_children: false,
        children_count: 0
      }

      mockFetchWithAuth.mockResolvedValueOnce(memberData)

      const result = await MembersService.add(memberData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/members', {
        method: 'POST',
        data: memberData
      })
      expect(result).toEqual(memberData)
    })

    it('deve lançar erro quando criar membro falhar', async () => {
      const memberData = {
        full_name: 'João Silva',
        birth_date: '1990-01-01',
        gender: 'Masculino' as const,
        cpf: '12345678901',
        rg: '123456789',
        phone: '11999999999',
        email: 'joao@test.com',
        street: 'Rua A',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        cep: '01234567',
        mother_name: 'Maria Silva',
        father_name: 'José Silva',
        marital_status: 'Solteiro' as const,
        has_children: false,
        children_count: 0
      }

      const error = new Error('CPF já cadastrado')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(MembersService.add(memberData)).rejects.toThrow('CPF já cadastrado')
    })
  })

  describe('edit', () => {
    it('deve editar membro com sucesso', async () => {
      const memberId = '1'
      const editData = {
        full_name: 'João Silva Santos',
        birth_date: '1990-01-01',
        gender: 'Masculino' as const,
        cpf: '12345678901',
        rg: '123456789',
        phone: '11888888888',
        email: 'joao.santos@test.com',
        street: 'Rua B',
        number: '456',
        neighborhood: 'Vila Nova',
        city: 'São Paulo',
        state: 'SP',
        cep: '01234567',
        mother_name: 'Maria Silva',
        father_name: 'José Silva',
        marital_status: 'Casado' as const,
        has_children: true,
        children_count: 2
      }

      mockFetchWithAuth.mockResolvedValueOnce(editData)

      const result = await MembersService.edit(memberId, editData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/members/${memberId}`, {
        method: 'PUT',
        data: editData
      })
      expect(result).toEqual(editData)
    })

    it('deve lançar erro quando editar membro falhar', async () => {
      const memberId = '1'
      const editData = {
        full_name: 'João Silva Santos',
        birth_date: '1990-01-01',
        gender: 'Masculino' as const,
        cpf: '12345678901',
        rg: '123456789',
        phone: '11888888888',
        email: 'joao.santos@test.com',
        street: 'Rua B',
        number: '456',
        neighborhood: 'Vila Nova',
        city: 'São Paulo',
        state: 'SP',
        cep: '01234567',
        mother_name: 'Maria Silva',
        father_name: 'José Silva',
        marital_status: 'Casado' as const,
        has_children: true,
        children_count: 2
      }

      const error = new Error('Membro não encontrado')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(MembersService.edit(memberId, editData)).rejects.toThrow('Membro não encontrado')
    })
  })

  describe('delete', () => {
    it('deve deletar membro com sucesso', async () => {
      const memberId = '1'
      const mockResponse = { message: 'Membro deletado com sucesso' }

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await MembersService.delete(memberId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/members/${memberId}`, { method: 'DELETE' })
      expect(result).toEqual(mockResponse)
    })

    it('deve lançar erro quando deletar membro falhar', async () => {
      const memberId = '1'
      const error = new Error('Membro não encontrado')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(MembersService.delete(memberId)).rejects.toThrow('Membro não encontrado')
    })
  })

  describe('search', () => {
    it('deve buscar membros por nome com sucesso', async () => {
      const name = 'João'
      const mockMembers = {
        total: 1,
        page: 1,
        to: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        data: [
          {
            id: '1',
            full_name: 'João Silva',
            birth_date: '1990-01-01',
            gender: 'Masculino' as const,
            cpf: '12345678901',
            rg: '123456789',
            phone: '11999999999',
            email: 'joao@test.com',
            street: 'Rua A',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            cep: '01234567',
            mother_name: 'Maria Silva',
            father_name: 'José Silva',
            marital_status: 'Solteiro' as const,
            has_children: false,
            children_count: 0
          }
        ]
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockMembers)

      const result = await MembersService.search(name)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/members/search', {
        method: 'POST',
        data: { name }
      })
      expect(result).toEqual(mockMembers)
    })

    it('deve lançar erro quando buscar membros falhar', async () => {
      const name = 'João'
      const error = new Error('Erro ao buscar membros')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(MembersService.search(name)).rejects.toThrow('Erro ao buscar membros')
    })
  })

  describe('filter', () => {
    it('deve filtrar membros por nome com sucesso', async () => {
      const name = 'Silva'
      const mockMembers = {
        total: 2,
        page: 1,
        to: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        data: [
          {
            id: '1',
            full_name: 'João Silva',
            birth_date: '1990-01-01',
            gender: 'Masculino' as const,
            cpf: '12345678901',
            rg: '123456789',
            phone: '11999999999',
            email: 'joao@test.com',
            street: 'Rua A',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            cep: '01234567',
            mother_name: 'Maria Silva',
            father_name: 'José Silva',
            marital_status: 'Solteiro' as const,
            has_children: false,
            children_count: 0
          },
          {
            id: '2',
            full_name: 'Maria Silva',
            birth_date: '1985-05-15',
            gender: 'Feminino' as const,
            cpf: '98765432100',
            rg: '987654321',
            phone: '11888888888',
            email: 'maria@test.com',
            street: 'Rua B',
            number: '456',
            neighborhood: 'Vila Nova',
            city: 'São Paulo',
            state: 'SP',
            cep: '01234567',
            mother_name: 'Ana Silva',
            father_name: 'Carlos Silva',
            marital_status: 'Casado' as const,
            has_children: true,
            children_count: 1
          }
        ]
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockMembers)

      const result = await MembersService.filter(name)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/members/filter', {
        method: 'POST',
        data: { name }
      })
      expect(result).toEqual(mockMembers)
    })

    it('deve lançar erro quando filtrar membros falhar', async () => {
      const name = 'Silva'
      const error = new Error('Erro ao filtrar membros')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(MembersService.filter(name)).rejects.toThrow('Erro ao filtrar membros')
    })
  })
})
