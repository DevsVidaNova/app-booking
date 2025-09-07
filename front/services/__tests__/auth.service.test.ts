import { AuthService } from '../auth.service'
import { fetchApi, fetchWithAuth } from '@/hooks/api'
import { createToken } from '@/hooks/token'
import { createUser } from '@/hooks/user'

// Mock das dependências
jest.mock('@/hooks/api')
jest.mock('@/hooks/token')
jest.mock('@/hooks/user')

const mockFetchApi = fetchApi as jest.MockedFunction<typeof fetchApi>
const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>
const mockCreateToken = createToken as jest.MockedFunction<typeof createToken>
const mockCreateUser = createUser as jest.MockedFunction<typeof createUser>

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('deve registrar um usuário com sucesso', async () => {
      const userData = {
        name: 'João Silva',
        phone: '11999999999',
        email: 'joao@test.com',
        password: '123456',
        role: 'user'
      }

      const expectedResponse = { ...userData }

      mockFetchWithAuth.mockResolvedValueOnce(expectedResponse)

      const result = await AuthService.register(userData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/user', {
        method: 'POST',
        data: userData
      })
      expect(result).toEqual(expectedResponse)
    })

    it('deve lançar erro quando o registro falhar', async () => {
      const userData = {
        name: 'João Silva',
        phone: '11999999999',
        email: 'joao@test.com',
        password: '123456'
      }

      const error = new Error('Email já existe')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(AuthService.register(userData)).rejects.toThrow('Email já existe')
    })
  })

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const email = 'joao@test.com'
      const password = '123456'
      const session = true

      const mockResponse = {
        token: 'mock-token',
        user: {
          id: '1',
          name: 'João Silva',
          email: 'joao@test.com'
        }
      }

      mockFetchApi.mockResolvedValueOnce(mockResponse)
      mockCreateToken.mockResolvedValueOnce(undefined)
      mockCreateUser.mockResolvedValueOnce(undefined)

      const result = await AuthService.login(email, password, session)

      expect(mockFetchApi).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        data: { email, password }
      })
      expect(mockCreateToken).toHaveBeenCalledWith('mock-token', session)
      expect(mockCreateUser).toHaveBeenCalledWith(mockResponse.user, session)
      expect(result).toEqual(mockResponse)
    })

    it('deve lançar erro quando o login falhar', async () => {
      const email = 'joao@test.com'
      const password = '123456'
      const session = true

      const error = new Error('Credenciais inválidas')
      mockFetchApi.mockRejectedValueOnce(error)

      await expect(AuthService.login(email, password, session)).rejects.toThrow('Credenciais inválidas')
    })

    it('deve lançar erro genérico quando ocorrer erro desconhecido', async () => {
      const email = 'joao@test.com'
      const password = '123456'
      const session = true

      mockFetchApi.mockRejectedValueOnce('Erro não identificado')

      await expect(AuthService.login(email, password, session)).rejects.toThrow('An unknown error occurred')
    })
  })

  describe('profile', () => {
    it('deve buscar perfil do usuário com sucesso', async () => {
      const mockUser = {
        id: '1',
        name: 'João Silva',
        role: 'user',
        user_id: '1',
        phone: '11999999999',
        email: 'joao@test.com'
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockUser)

      const result = await AuthService.profile()

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/auth/profile', { method: 'GET' })
      expect(result).toEqual(mockUser)
    })

    it('deve lançar erro quando buscar perfil falhar', async () => {
      const error = new Error('Token inválido')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(AuthService.profile()).rejects.toThrow('Token inválido')
    })
  })

  describe('sigle', () => {
    it('deve buscar usuário específico com sucesso', async () => {
      const userId = '1'
      const mockUser = {
        total: 1,
        page: 1,
        to: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        data: [{
          id: '1',
          name: 'João Silva',
          role: 'user',
          user_id: '1',
          phone: '11999999999',
          email: 'joao@test.com'
        }]
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockUser)

      const result = await AuthService.sigle(userId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/users/${userId}`, { method: 'GET' })
      expect(result).toEqual(mockUser)
    })

    it('deve lançar erro quando buscar usuário falhar', async () => {
      const userId = '1'
      const error = new Error('Usuário não encontrado')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(AuthService.sigle(userId)).rejects.toThrow('Usuário não encontrado')
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

      const result = await AuthService.edit(userId, editData)

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

      const error = new Error('Usuário não encontrado')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(AuthService.edit(userId, editData)).rejects.toThrow('Usuário não encontrado')
    })
  })

  describe('exclude', () => {
    it('deve excluir usuário com sucesso', async () => {
      const mockResponse = { message: 'Usuário excluído com sucesso' }
      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await AuthService.exclude()

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/user', { method: 'DELETE' })
      expect(result).toEqual(mockResponse)
    })

    it('deve lançar erro quando excluir usuário falhar', async () => {
      const error = new Error('Erro ao excluir usuário')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(AuthService.exclude()).rejects.toThrow('Erro ao excluir usuário')
    })
  })
})
