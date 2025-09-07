import { BookingsService } from '../booking.service'
import { fetchApi, fetchWithAuth } from '@/hooks/api'

// Mock das dependências
jest.mock('@/hooks/api')

const mockFetchApi = fetchApi as jest.MockedFunction<typeof fetchApi>
const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>

describe('BookingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('deve listar reservas com sucesso', async () => {
      const mockBookings = [
        {
          id: 1,
          description: 'Reunião de equipe',
          room: {
            id: '1',
            name: 'Sala 1',
            size: '10'
          },
          date: '2024-01-15',
          day_of_week: 'Segunda',
          month: 'Janeiro',
          start_time: '09:00',
          end_time: '10:00',
          user: {
            id: '1',
            name: 'João Silva',
            email: 'joao@test.com',
            phone: '11999999999'
          },
          repeat: null,
          repeat_day: null
        }
      ]

      mockFetchApi.mockResolvedValueOnce(mockBookings)

      const result = await BookingsService.list()

      expect(mockFetchApi).toHaveBeenCalledWith('/booking', { method: 'GET' })
      expect(result).toEqual(mockBookings)
    })

    it('deve lançar erro quando listar reservas falhar', async () => {
      const error = new Error('Erro ao listar reservas')
      mockFetchApi.mockRejectedValueOnce(error)

      await expect(BookingsService.list()).rejects.toThrow('Erro ao listar reservas')
    })

    it('deve lançar erro genérico quando ocorrer erro desconhecido', async () => {
      mockFetchApi.mockRejectedValueOnce('Erro não identificado')

      await expect(BookingsService.list()).rejects.toThrow('Erro desconhecido ao listar reservas')
    })
  })

  describe('listByMonth', () => {
    it('deve listar reservas do mês com sucesso', async () => {
      const mockBookings = [
        {
          id: 1,
          description: 'Reunião mensal',
          room: {
            id: '1',
            name: 'Sala 1',
            size: '10'
          },
          date: '2024-01-15',
          day_of_week: 'Segunda',
          month: 'Janeiro',
          start_time: '09:00',
          end_time: '10:00',
          user: {
            id: '1',
            name: 'João Silva',
            email: 'joao@test.com',
            phone: '11999999999'
          },
          repeat: null,
          repeat_day: null
        }
      ]

      mockFetchApi.mockResolvedValueOnce(mockBookings)

      const result = await BookingsService.listByMonth()

      expect(mockFetchApi).toHaveBeenCalledWith('/booking/month', { method: 'GET' })
      expect(result).toEqual(mockBookings)
    })

    it('deve lançar erro quando listar reservas do mês falhar', async () => {
      const error = new Error('Erro ao listar reservas do mês')
      mockFetchApi.mockRejectedValueOnce(error)

      await expect(BookingsService.listByMonth()).rejects.toThrow('Erro ao listar reservas do mês')
    })
  })

  describe('listByWeek', () => {
    it('deve listar reservas da semana com sucesso', async () => {
      const mockBookings = [
        {
          id: 1,
          description: 'Reunião semanal',
          room: {
            id: '1',
            name: 'Sala 1',
            size: '10'
          },
          date: '2024-01-15',
          day_of_week: 'Segunda',
          month: 'Janeiro',
          start_time: '09:00',
          end_time: '10:00',
          user: {
            id: '1',
            name: 'João Silva',
            email: 'joao@test.com',
            phone: '11999999999'
          },
          repeat: null,
          repeat_day: null
        }
      ]

      mockFetchApi.mockResolvedValueOnce(mockBookings)

      const result = await BookingsService.listByWeek()

      expect(mockFetchApi).toHaveBeenCalledWith('/booking/week', { method: 'GET' })
      expect(result).toEqual(mockBookings)
    })

    it('deve lançar erro quando listar reservas da semana falhar', async () => {
      const error = new Error('Erro ao listar reservas da semana')
      mockFetchApi.mockRejectedValueOnce(error)

      await expect(BookingsService.listByWeek()).rejects.toThrow('Erro ao listar reservas da semana')
    })
  })

  describe('listByToday', () => {
    it('deve listar reservas de hoje com sucesso', async () => {
      const mockBookings = [
        {
          id: 1,
          description: 'Reunião de hoje',
          room: {
            id: '1',
            name: 'Sala 1',
            size: '10'
          },
          date: '2024-01-15',
          day_of_week: 'Segunda',
          month: 'Janeiro',
          start_time: '09:00',
          end_time: '10:00',
          user: {
            id: '1',
            name: 'João Silva',
            email: 'joao@test.com',
            phone: '11999999999'
          },
          repeat: null,
          repeat_day: null
        }
      ]

      mockFetchApi.mockResolvedValueOnce(mockBookings)

      const result = await BookingsService.listByToday()

      expect(mockFetchApi).toHaveBeenCalledWith('/booking/today', { method: 'GET' })
      expect(result).toEqual(mockBookings)
    })

    it('deve lançar erro quando listar reservas de hoje falhar', async () => {
      const error = new Error('Erro ao listar reservas de hoje')
      mockFetchApi.mockRejectedValueOnce(error)

      await expect(BookingsService.listByToday()).rejects.toThrow('Erro ao listar reservas de hoje')
    })
  })

  describe('single', () => {
    it('deve buscar reserva específica com sucesso', async () => {
      const bookingId = '1'
      const mockBooking = {
        id: 1,
        description: 'Reunião específica',
        room: {
          id: '1',
          name: 'Sala 1',
          size: '10'
        },
        date: '2024-01-15',
        day_of_week: 'Segunda',
        month: 'Janeiro',
        start_time: '09:00',
        end_time: '10:00',
        user: {
          id: '1',
          name: 'João Silva',
          email: 'joao@test.com',
          phone: '11999999999'
        },
        repeat: null,
        repeat_day: null
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockBooking)

      const result = await BookingsService.single(bookingId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/booking/${bookingId}`, { method: 'GET' })
      expect(result).toEqual(mockBooking)
    })

    it('deve lançar erro quando buscar reserva específica falhar', async () => {
      const bookingId = '1'
      const error = new Error('Reserva não encontrada')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(BookingsService.single(bookingId)).rejects.toThrow('Reserva não encontrada')
    })
  })

  describe('listByMe', () => {
    it('deve listar minhas reservas com sucesso', async () => {
      const mockBookings = [
        {
          id: 1,
          description: 'Minha reunião',
          room: {
            id: '1',
            name: 'Sala 1',
            size: '10'
          },
          date: '2024-01-15',
          day_of_week: 'Segunda',
          month: 'Janeiro',
          start_time: '09:00',
          end_time: '10:00',
          user: {
            id: '1',
            name: 'João Silva',
            email: 'joao@test.com',
            phone: '11999999999'
          },
          repeat: null,
          repeat_day: null
        }
      ]

      mockFetchWithAuth.mockResolvedValueOnce(mockBookings)

      const result = await BookingsService.listByMe()

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/booking/my', { method: 'GET' })
      expect(result).toEqual(mockBookings)
    })

    it('deve lançar erro quando listar minhas reservas falhar', async () => {
      const error = new Error('Erro ao listar minhas reservas')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(BookingsService.listByMe()).rejects.toThrow('Erro ao listar minhas reservas')
    })
  })

  describe('add', () => {
    it('deve criar reserva com sucesso', async () => {
      const bookingData = {
        description: 'Nova reunião',
        room: '1',
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '10:00',
        repeat: null,
        day_repeat: null
      }

      mockFetchWithAuth.mockResolvedValueOnce(bookingData)

      const result = await BookingsService.add(bookingData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/booking', {
        method: 'POST',
        data: bookingData
      })
      expect(result).toEqual(bookingData)
    })

    it('deve lançar erro quando criar reserva falhar', async () => {
      const bookingData = {
        description: 'Nova reunião',
        room: '1',
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '10:00'
      }

      mockFetchWithAuth.mockRejectedValueOnce('Erro de conexão')

      await expect(BookingsService.add(bookingData)).rejects.toThrow('Erro de conexão com o servidor.')
    })
  })

  describe('edit', () => {
    it('deve editar reserva com sucesso', async () => {
      const bookingId = '1'
      const editData = {
        description: 'Reunião editada',
        room_id: 1,
        date: '2024-01-15',
        start_time: '10:00',
        end_time: '11:00',
        repeat: null,
        day_repeat: null
      }

      const mockBooking = {
        id: 1,
        description: 'Reunião editada',
        room: {
          id: '1',
          name: 'Sala 1',
          size: '10'
        },
        date: '2024-01-15',
        day_of_week: 'Segunda',
        month: 'Janeiro',
        start_time: '10:00',
        end_time: '11:00',
        user: {
          id: '1',
          name: 'João Silva',
          email: 'joao@test.com',
          phone: '11999999999'
        },
        repeat: null,
        repeat_day: null
      }

      mockFetchWithAuth.mockResolvedValueOnce(mockBooking)

      const result = await BookingsService.edit(bookingId, editData)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/booking/${bookingId}`, {
        method: 'PUT',
        data: editData
      })
      expect(result).toEqual(mockBooking)
    })

    it('deve lançar erro quando editar reserva falhar', async () => {
      const bookingId = '1'
      const editData = {
        description: 'Reunião editada',
        room_id: 1,
        date: '2024-01-15',
        start_time: '10:00',
        end_time: '11:00'
      }

      const error = new Error('Reserva não encontrada')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(BookingsService.edit(bookingId, editData)).rejects.toThrow('Reserva não encontrada')
    })
  })

  describe('delete', () => {
    it('deve deletar reserva com sucesso', async () => {
      const bookingId = '1'
      const mockResponse = { message: 'Reserva deletada com sucesso' }

      mockFetchWithAuth.mockResolvedValueOnce(mockResponse)

      const result = await BookingsService.delete(bookingId)

      expect(mockFetchWithAuth).toHaveBeenCalledWith(`/booking/${bookingId}`, { method: 'DELETE' })
      expect(result).toEqual(mockResponse)
    })

    it('deve lançar erro quando deletar reserva falhar', async () => {
      const bookingId = '1'
      const error = new Error('Reserva não encontrada')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(BookingsService.delete(bookingId)).rejects.toThrow('Reserva não encontrada')
    })
  })

  describe('search', () => {
    it('deve buscar reservas com filtros com sucesso', async () => {
      const searchParams = {
        userId: '1',
        date: '2024-01-15',
        room: '1',
        repeat: 'weekly',
        dayRepeat: '1'
      }

      const mockBookings = [
        {
          id: 1,
          description: 'Reunião encontrada',
          room: {
            id: '1',
            name: 'Sala 1',
            size: '10'
          },
          date: '2024-01-15',
          day_of_week: 'Segunda',
          month: 'Janeiro',
          start_time: '09:00',
          end_time: '10:00',
          user: {
            id: '1',
            name: 'João Silva',
            email: 'joao@test.com',
            phone: '11999999999'
          },
          repeat: 'weekly',
          repeat_day: '1'
        }
      ]

      mockFetchWithAuth.mockResolvedValueOnce(mockBookings)

      const result = await BookingsService.search(
        searchParams.userId,
        searchParams.date,
        searchParams.room,
        searchParams.repeat,
        searchParams.dayRepeat
      )

      expect(mockFetchWithAuth).toHaveBeenCalledWith('/booking/filter', {
        method: 'POST',
        data: searchParams
      })
      expect(result).toEqual(mockBookings)
    })

    it('deve lançar erro quando buscar reservas falhar', async () => {
      const error = new Error('Erro ao buscar reservas')
      mockFetchWithAuth.mockRejectedValueOnce(error)

      await expect(BookingsService.search()).rejects.toThrow('Erro ao buscar reservas')
    })
  })

  describe('listCalendar', () => {
    it('deve listar reservas do calendário com sucesso', async () => {
      const mockBookings = [
        {
          id: 1,
          description: 'Reunião do calendário',
          room: {
            id: '1',
            name: 'Sala 1',
            size: '10'
          },
          date: '2024-01-15',
          day_of_week: 'Segunda',
          month: 'Janeiro',
          start_time: '09:00',
          end_time: '10:00',
          user: {
            id: '1',
            name: 'João Silva',
            email: 'joao@test.com',
            phone: '11999999999'
          },
          repeat: null,
          repeat_day: null
        }
      ]

      mockFetchApi.mockResolvedValueOnce(mockBookings)

      const result = await BookingsService.listCalendar()

      expect(mockFetchApi).toHaveBeenCalledWith('/booking/calendar', { method: 'GET' })
      expect(result).toEqual(mockBookings)
    })

    it('deve lançar erro quando listar reservas do calendário falhar', async () => {
      const error = new Error('Erro ao listar reservas do calendário')
      mockFetchApi.mockRejectedValueOnce(error)

      await expect(BookingsService.listCalendar()).rejects.toThrow('Erro ao listar reservas do calendário')
    })
  })
})
