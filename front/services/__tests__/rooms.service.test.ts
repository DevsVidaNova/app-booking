import { RoomsService } from '../rooms.service'
import { fetchApi, fetchWithAuth } from '@/hooks/api'

// Mock das dependências
jest.mock('@/hooks/api')

const mockFetchApi = fetchApi as jest.MockedFunction<typeof fetchApi>
const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

describe('RoomsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('deve listar salas com sucesso', async () => {
      const page = 1
      const mockRooms = {
        data: [
          {
            id: '1',
            name: 'Sala 1',
            size: '10',
            description: 'Sala de reunião pequena',
            exclusive: false,
            status: true,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'Sala 2',
            size: '20',
            description: 'Sala de reunião grande',
            exclusive: true,
            status: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        total: 2,
        page: 1,
        to: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }

      mockFetchApi.mockResolvedValueOnce(mockRooms)

      const result = await RoomsService.list(page)

      expect(mockFetchApi).toHaveBeenCalledWith(`/room?page=${page}`, { method: 'GET' })
      expect(result).toEqual(mockRooms)
    })

    it('deve lançar erro quando listar salas falhar', async () => {
      const page = 1
      const error = new Error('Erro ao listar salas')
      mockFetchApi.mockRejectedValueOnce(error)

      await expect(RoomsService.list(page)).rejects.toThrow('Erro ao listar salas')
    })

    it('deve lançar erro genérico quando ocorrer erro desconhecido', async () => {
      const page = 1
      mockFetchApi.mockRejectedValueOnce('Erro não identificado')

      await expect(RoomsService.list(page)).rejects.toThrow('Erro desconhecido ao listar salas')
    })
  })

  describe('single', () => {
    it('deve buscar sala específica com sucesso', async () => {
      const roomId = '1'
      const mockRoom = {
        data: [
          {
            id: '1',
            name: 'Sala 1',
            size: '10',
            description: 'Sala de reunião pequena',
            exclusive: false,
            status: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        to: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }

      mockFetchApi.mockResolvedValueOnce(mockRoom)

      const result = await RoomsService.single(roomId)

      expect(mockFetchApi).toHaveBeenCalledWith(`/room/${roomId}`, { method: 'GET' })
      expect(result).toEqual(mockRoom)
    })

    it('deve lançar erro quando buscar sala específica falhar', async () => {
      const roomId = '1'
      const error = new Error('Sala não encontrada')
      mockFetchApi.mockRejectedValueOnce(error)

      await expect(RoomsService.single(roomId)).rejects.toThrow('Sala não encontrada')
    })
  })

  describe('add', () => {
    it('deve criar sala com sucesso', async () => {
      const roomData = {
        name: 'Nova Sala',
        size: 15,
        description: 'Sala de reunião média',
        exclusive: false,
        status: true
      }

      mockFetchWithAuth.mockResolvedValueOnce(roomData)

      const result = await RoomsService.add(roomData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/room', {
        method: 'POST',
        data: roomData
      })
      expect(result).toEqual(roomData)
    })

    it('deve lançar erro quando criar sala falhar', async () => {
      const roomData = {
        name: 'Nova Sala',
        size: 15,
        description: 'Sala de reunião média',
        exclusive: false,
        status: true
      }

      const error = new Error('Nome da sala já existe')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(RoomsService.add(roomData)).rejects.toThrow('Nome da sala já existe')
    })
  })

  describe('edit', () => {
    it('deve editar sala com sucesso', async () => {
      const roomId = '1'
      const editData = {
        name: 'Sala Editada',
        size: 20,
        description: 'Sala de reunião grande editada',
        exclusive: true,
        status: true
      }

      mockFetchWithAuth.mockResolvedValueOnce(editData)

      const result = await RoomsService.edit(roomId, editData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/room/${roomId}`, {
        method: 'PUT',
        data: editData
      })
      expect(result).toEqual(editData)
    })

    it('deve lançar erro quando editar sala falhar', async () => {
      const roomId = '1'
      const editData = {
        name: 'Sala Editada',
        size: 20,
        description: 'Sala de reunião grande editada',
        exclusive: true,
        status: true
      }

      const error = new Error('Sala não encontrada')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(RoomsService.edit(roomId, editData)).rejects.toThrow('Sala não encontrada')
    })
  })

  describe('delete', () => {
    it('deve deletar sala com sucesso', async () => {
      const roomId = '1'
      const mockResponse = { message: 'Sala deletada com sucesso' }

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await RoomsService.delete(roomId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/room/${roomId}`, { method: 'DELETE' })
      expect(result).toEqual(mockResponse)
    })

    it('deve lançar erro quando deletar sala falhar', async () => {
      const roomId = '1'
      const error = new Error('Sala não encontrada')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(RoomsService.delete(roomId)).rejects.toThrow('Sala não encontrada')
    })
  })

  describe('search', () => {
    it('deve buscar salas por nome com sucesso', async () => {
      const name = 'Sala'
      const mockRooms = {
        data: [
          {
            id: '1',
            name: 'Sala 1',
            size: '10',
            description: 'Sala de reunião pequena',
            exclusive: false,
            status: true,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'Sala 2',
            size: '20',
            description: 'Sala de reunião grande',
            exclusive: true,
            status: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        total: 2,
        page: 1,
        to: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }

      mockFetchApi.mockResolvedValueOnce(mockRooms)

      const result = await RoomsService.search(name)

      expect(mockFetchApi).toHaveBeenCalledWith(`/room/search?name=${name}`, {
        method: 'GET'
      })
      expect(result).toEqual(mockRooms)
    })

    it('deve lançar erro quando buscar salas falhar', async () => {
      const name = 'Sala'
      const error = new Error('Erro ao buscar salas')
      mockFetchApi.mockRejectedValueOnce(error)

      await expect(RoomsService.search(name)).rejects.toThrow('Erro ao buscar salas')
    })
  })

  describe('QUERY_KEY', () => {
    it('deve ter as chaves de query corretas', () => {
      expect(RoomsService.QUERY_KEY.LIST).toBe('/room')
      expect(RoomsService.QUERY_KEY.GET('1')).toEqual(['/room', 'get', '1'])
      expect(RoomsService.QUERY_KEY.DELETE('1')).toEqual(['/room', 'delete', '1'])
      expect(RoomsService.QUERY_KEY.SEARCH('Sala')).toEqual(['/room', 'search', 'Sala'])
    })
  })
})
