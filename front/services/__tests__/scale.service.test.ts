import { ScaleService } from '../scale.service'
import { fetchWithAuth } from '@/hooks/api'

// Mock das dependências
jest.mock('@/hooks/api')

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

describe('ScaleService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('deve listar escalas com sucesso', async () => {
      const page = 1
      const mockScales = {
        scales: [
          {
            id: '1',
            name: 'Escala Domingo',
            date: '2024-01-15',
            direction: {
              name: 'Pastor João'
            },
            confirmations: 5
          },
          {
            id: '2',
            name: 'Escala Quarta',
            date: '2024-01-17',
            direction: {
              name: 'Pastor Maria'
            },
            confirmations: 3
          }
        ],
        pagination: {
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockScales)

      const result = await ScaleService.list(page)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/scale?page=${page}`, { method: 'GET' })
      expect(result).toEqual(mockScales)
    })

    it('deve lançar erro quando listar escalas falhar', async () => {
      const page = 1
      const error = new Error('Erro ao listar escalas')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(ScaleService.list(page)).rejects.toThrow('Erro ao listar escalas')
    })

    it('deve lançar erro genérico quando ocorrer erro desconhecido', async () => {
      const page = 1
      mockFetchWithAuth.mockRejectedValueOnce('Erro não identificado')

      await expect(ScaleService.list(page)).rejects.toThrow('Erro desconhecido ao listar escalas')
    })
  })

  describe('single', () => {
    it('deve buscar escala específica com sucesso', async () => {
      const scaleId = '1'
      const mockScale = {
        id: '1',
        name: 'Escala Domingo',
        date: '2024-01-15',
        description: 'Escala do culto de domingo',
        band: {
          id: '1',
          full_name: 'João Silva',
          phone: '11999999999',
          email: 'joao@test.com'
        },
        projection: {
          id: '2',
          full_name: 'Maria Santos',
          phone: '11888888888',
          email: 'maria@test.com'
        },
        light: {
          id: '3',
          full_name: 'Pedro Costa',
          phone: '11777777777',
          email: 'pedro@test.com'
        },
        transmission: {
          id: '4',
          full_name: 'Ana Lima',
          phone: '11666666666',
          email: 'ana@test.com'
        },
        camera: {
          id: '5',
          full_name: 'Carlos Oliveira',
          phone: '11555555555',
          email: 'carlos@test.com'
        },
        live: {
          id: '6',
          full_name: 'Sofia Ferreira',
          phone: '11444444444',
          email: 'sofia@test.com'
        },
        sound: {
          id: '7',
          full_name: 'Lucas Martins',
          phone: '11333333333',
          email: 'lucas@test.com'
        },
        training_sound: {
          id: '8',
          full_name: 'Isabella Rocha',
          phone: '11222222222',
          email: 'isabella@test.com'
        },
        photography: {
          id: '9',
          full_name: 'Gabriel Alves',
          phone: '11111111111',
          email: 'gabriel@test.com'
        },
        stories: {
          id: '10',
          full_name: 'Larissa Pereira',
          phone: '11000000000',
          email: 'larissa@test.com'
        },
        dynamic: {
          id: '11',
          full_name: 'Rafael Souza',
          phone: '11999999999',
          email: 'rafael@test.com'
        },
        direction: {
          id: '12',
          full_name: 'Pastor João',
          phone: '11888888888',
          email: 'pastor@test.com'
        },
        scale_confirmations: [
          {
            user_id: '1',
            confirmed: true
          },
          {
            user_id: '2',
            confirmed: false
          }
        ],
        percentage_confirmed: '50%'
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockScale)

      const result = await ScaleService.single(scaleId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/scale/${scaleId}`, { method: 'GET' })
      expect(result).toEqual(mockScale)
    })

    it('deve lançar erro quando buscar escala específica falhar', async () => {
      const scaleId = '1'
      const error = new Error('Escala não encontrada')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(ScaleService.single(scaleId)).rejects.toThrow('Escala não encontrada')
    })
  })

  describe('duplicate', () => {
    it('deve duplicar escala com sucesso', async () => {
      const scaleId = '1'
      const mockDuplicatedScale = {
        id: '2',
        name: 'Escala Domingo (Cópia)',
        date: '2024-01-22',
        description: 'Escala do culto de domingo',
        band: null,
        projection: null,
        light: null,
        transmission: null,
        camera: null,
        live: null,
        sound: null,
        training_sound: null,
        photography: null,
        stories: null,
        dynamic: null,
        direction: null,
        scale_confirmations: [],
        percentage_confirmed: '0%'
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockDuplicatedScale)

      const result = await ScaleService.duplicate(scaleId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/scale/duplicate/${scaleId}`, { method: 'POST' })
      expect(result).toEqual(mockDuplicatedScale)
    })

    it('deve lançar erro quando duplicar escala falhar', async () => {
      const scaleId = '1'
      const error = new Error('Erro ao duplicar escala')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(ScaleService.duplicate(scaleId)).rejects.toThrow('Erro ao duplicar escala')
    })
  })

  describe('add', () => {
    it('deve criar escala com sucesso', async () => {
      const scaleData = {
        name: 'Nova Escala',
        date: '2024-01-20',
        direction: '1',
        band: '2',
        projection: '3',
        sound: '4',
        light: '5',
        transmission: '6',
        camera: '7',
        live: '8',
        training_sound: '9',
        photography: '10',
        stories: '11',
        dynamic: '12'
      }

      mockFetchWithAuth.mockResolvedValueOnce(scaleData)

      const result = await ScaleService.add(scaleData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/scale', {
        method: 'POST',
        data: scaleData
      })
      expect(result).toEqual(scaleData)
    })

    it('deve lançar erro quando criar escala falhar', async () => {
      const scaleData = {
        name: 'Nova Escala',
        date: '2024-01-20',
        direction: '1'
      }

      const error = new Error('Data inválida')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(ScaleService.add(scaleData)).rejects.toThrow('Data inválida')
    })
  })

  describe('edit', () => {
    it('deve editar escala com sucesso', async () => {
      const scaleId = '1'
      const editData = {
        name: 'Escala Editada',
        date: '2024-01-25',
        direction: '2',
        band: '3',
        projection: '4',
        sound: '5',
        light: '6',
        transmission: '7',
        camera: '8',
        live: '9',
        training_sound: '10',
        photography: '11',
        stories: '12',
        dynamic: '13'
      }

      mockFetchWithAuth.mockResolvedValueOnce(editData)

      const result = await ScaleService.edit(scaleId, editData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/scale/${scaleId}`, {
        method: 'PUT',
        data: editData
      })
      expect(result).toEqual(editData)
    })

    it('deve lançar erro quando editar escala falhar', async () => {
      const scaleId = '1'
      const editData = {
        name: 'Escala Editada',
        date: '2024-01-25',
        direction: '2'
      }

      const error = new Error('Escala não encontrada')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(ScaleService.edit(scaleId, editData)).rejects.toThrow('Escala não encontrada')
    })
  })

  describe('delete', () => {
    it('deve deletar escala com sucesso', async () => {
      const scaleId = '1'
      const mockResponse = { message: 'Escala deletada com sucesso' }

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await ScaleService.delete(scaleId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/scale/${scaleId}`, { method: 'DELETE' })
      expect(result).toEqual(mockResponse)
    })

    it('deve lançar erro quando deletar escala falhar', async () => {
      const scaleId = '1'
      const error = new Error('Escala não encontrada')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(ScaleService.delete(scaleId)).rejects.toThrow('Escala não encontrada')
    })
  })

  describe('confirm', () => {
    it('deve confirmar escala com sucesso', async () => {
      const scaleId = '1'
      const confirmed = true
      const mockResponse = { message: 'Escala confirmada com sucesso' }

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await ScaleService.confirm(scaleId, confirmed)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/scale/confirm', {
        method: 'POST',
        data: {
          scaleId,
          confirmed
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('deve desconfirmar escala com sucesso', async () => {
      const scaleId = '1'
      const confirmed = false
      const mockResponse = { message: 'Confirmação removida com sucesso' }

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await ScaleService.confirm(scaleId, confirmed)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/scale/confirm', {
        method: 'POST',
        data: {
          scaleId,
          confirmed
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('deve lançar erro quando confirmar escala falhar', async () => {
      const scaleId = '1'
      const confirmed = true
      const error = new Error('Escala não encontrada')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(ScaleService.confirm(scaleId, confirmed)).rejects.toThrow('Escala não encontrada')
    })
  })

  describe('search', () => {
    it('deve buscar escalas por nome com sucesso', async () => {
      const name = 'Domingo'
      const mockScales = [
        {
          id: '1',
          name: 'Escala Domingo',
          date: '2024-01-15',
          direction: {
            name: 'Pastor João'
          },
          confirmations: 5
        },
        {
          id: '2',
          name: 'Escala Domingo Especial',
          date: '2024-01-22',
          direction: {
            name: 'Pastor Maria'
          },
          confirmations: 3
        }
      ]

      mockFetchWithAuth.mockResolvedValueOnce(mockScales)

      const result = await ScaleService.search(name)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/scale/search', {
        method: 'POST',
        data: {
          name
        }
      })
      expect(result).toEqual(mockScales)
    })

    it('deve lançar erro quando buscar escalas falhar', async () => {
      const name = 'Domingo'
      const error = new Error('Erro ao buscar escalas')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(ScaleService.search(name)).rejects.toThrow('Erro ao buscar escalas')
    })
  })
})
