import { UserService } from '../user.service'
import { fetchWithAuth } from '@/hooks/api'

// Mock das dependências
jest.mock('@/hooks/api')

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('deve listar usuários com sucesso', async () => {
      const page = 1
      const mockUsers = {
        total: 10,
        page: 1,
        to: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        data: [
          {
            id: '1',
            name: 'João Silva',
            role: 'user',
            user_id: '1',
            phone: '11999999999',
            email: 'joao@test.com',
            total_bookings: 5
          },
          {
            id: '2',
            name: 'Maria Santos',
            role: 'admin',
            user_id: '2',
            phone: '11888888888',
            email: 'maria@test.com',
            total_bookings: 10
          }
        ]
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockUsers)

      const result = await UserService.list(page)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/user?page=${page}`, { method: 'GET' })
      expect(result).toEqual(mockUsers)
    })

    it('deve lançar erro quando listar usuários falhar', async () => {
      const page = 1
      const error = { error: 'Erro ao listar usuários' }
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(UserService.list(page)).rejects.toThrow('Erro ao listar usuários')
    })
  })

  describe('single', () => {
    it('deve buscar usuário específico com sucesso', async () => {
      const userId = '1'
      const mockUser = {
        id: '1',
        name: 'João Silva',
        role: 'user',
        user_id: '1',
        phone: '11999999999',
        email: 'joao@test.com',
        total_bookings: 5
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockUser)

      const result = await UserService.single(userId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/user/${userId}`, { method: 'GET' })
      expect(result).toEqual(mockUser)
    })

    it('deve lançar erro quando buscar usuário específico falhar', async () => {
      const userId = '1'
      const error = { error: 'Usuário não encontrado' }
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(UserService.single(userId)).rejects.toThrow('Usuário não encontrado')
    })
  })

  describe('edit', () => {
    it('deve editar usuário com sucesso', async () => {
      const userId = '1'
      const editData = {
        name: 'João Silva Santos',
        phone: '11888888888'
      }

      mockFetchWithAuth.mockResolvedValueOnce(editData)

      const result = await UserService.edit(userId, editData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/user/${userId}`, {
        method: 'PUT',
        data: editData
      })
      expect(result).toEqual(editData)
    })

    it('deve lançar erro quando editar usuário falhar', async () => {
      const userId = '1'
      const editData = {
        name: 'João Silva Santos',
        phone: '11888888888'
      }

      const error = { error: 'Usuário não encontrado' }
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(UserService.edit(userId, editData)).rejects.toThrow('Usuário não encontrado')
    })
  })

  describe('delete', () => {
    it('deve deletar usuário com sucesso', async () => {
      const userId = '1'
      const mockResponse = { message: 'Usuário deletado com sucesso' }

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await UserService.delete(userId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/user/${userId}`, { method: 'DELETE' })
      expect(result).toEqual(mockResponse)
    })

    it('deve lançar erro quando deletar usuário falhar', async () => {
      const userId = '1'
      const error = { error: 'Usuário não encontrado' }
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(UserService.delete(userId)).rejects.toThrow('Usuário não encontrado')
    })
  })

  describe('resetPassword', () => {
    it('deve resetar senha do usuário com sucesso', async () => {
      const userId = '1'
      const mockResponse = { message: 'Senha resetada com sucesso' }

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await UserService.resetPassword(userId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/user/${userId}/reset-password`, { method: 'PATCH' })
      expect(result).toEqual(mockResponse)
    })

    it('deve lançar erro quando resetar senha falhar', async () => {
      const userId = '1'
      const error = { error: 'Usuário não encontrado' }
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(UserService.resetPassword(userId)).rejects.toThrow('Usuário não encontrado')
    })
  })

  describe('create', () => {
    it('deve criar usuário com sucesso', async () => {
      const userData = {
        name: 'Novo Usuário',
        phone: '11777777777',
        email: 'novo@test.com',
        password: '123456',
        role: 'user'
      }

      mockFetchWithAuth.mockResolvedValueOnce(userData)

      const result = await UserService.create(userData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/user', {
        method: 'POST',
        data: userData
      })
      expect(result).toEqual(userData)
    })

    it('deve lançar erro quando criar usuário falhar', async () => {
      const userData = {
        name: 'Novo Usuário',
        phone: '11777777777',
        email: 'novo@test.com',
        password: '123456',
        role: 'user'
      }

      const error = { error: 'Email já cadastrado' }
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(UserService.create(userData)).rejects.toThrow('Email já cadastrado')
    })
  })

  describe('QUERY_KEY', () => {
    it('deve ter as chaves de query corretas', () => {
      expect(UserService.QUERY_KEY.LIST).toBe('list-users')
      expect(UserService.QUERY_KEY.SINGLE).toBe('single-user')
      expect(UserService.QUERY_KEY.EDIT).toBe('edit-user')
      expect(UserService.QUERY_KEY.DELETE).toBe('delete-user')
      expect(UserService.QUERY_KEY.RESET_PASSWORD).toBe('reset-password-user')
    })
  })
})
