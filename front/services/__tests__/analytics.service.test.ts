import { AnalyticsService } from '../analytics.service'
import { fetchWithAuth } from '@/hooks/api'

// Mock das dependências
jest.mock('@/hooks/api')

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('analytics', () => {
    it('deve buscar analytics com sucesso', async () => {
      const mockAnalytics = {
        rooms: 5,
        bookings: 25,
        users: 10,
        week: 8,
        members: 15
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockAnalytics)

      const result = await AnalyticsService.analytics()

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/analytics', { method: 'GET' })
      expect(result).toEqual(mockAnalytics)
    })

    it('deve lançar erro quando buscar analytics falhar', async () => {
      const error = new Error('Erro ao buscar analytics')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(AnalyticsService.analytics()).rejects.toThrow('Erro ao buscar analytics')
    })

    it('deve lançar erro com mensagem personalizada quando ocorrer erro', async () => {
      const error = { message: 'Servidor indisponível' }
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(AnalyticsService.analytics()).rejects.toThrow('Servidor indisponível')
    })
  })

  describe('membersAnalytics', () => {
    it('deve buscar analytics de membros com sucesso', async () => {
      const mockMembersAnalytics = {
        total: 15,
        active: 12,
        inactive: 3,
        newThisMonth: 2,
        byGender: {
          Masculino: 8,
          Feminino: 6,
          Outro: 1
        }
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockMembersAnalytics)

      const result = await AnalyticsService.membersAnalytics()

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/analytics/members', { method: 'GET' })
      expect(result).toEqual(mockMembersAnalytics)
    })

    it('deve lançar erro quando buscar analytics de membros falhar', async () => {
      const error = new Error('Erro ao buscar analytics de membros')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(AnalyticsService.membersAnalytics()).rejects.toThrow('Erro ao buscar analytics de membros')
    })

    it('deve lançar erro com mensagem personalizada quando ocorrer erro', async () => {
      const error = { message: 'Dados não disponíveis' }
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(AnalyticsService.membersAnalytics()).rejects.toThrow('Dados não disponíveis')
    })
  })

  describe('QUERY_KEY', () => {
    it('deve ter as chaves de query corretas', () => {
      expect(AnalyticsService.QUERY_KEY.ANALYTICS).toBe('analytics')
      expect(AnalyticsService.QUERY_KEY.MEMBERS_ANALYTICS).toBe('members-analytics')
    })
  })
})
