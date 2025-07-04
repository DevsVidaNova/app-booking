"use client"

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Calendar, Grid, List, RefreshCw } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import {
  BookingFilters,
  BookingCardList,
  BookingAddPopup,
  BookingEditPopup,
  useBookingState,
  useBookingFilters,
} from './index'
import { listBookings } from '@/services/booking.service'
import { ListBooking } from '@/types'

interface BookingDashboardProps {
  className?: string
  title?: string
  showFilters?: boolean
  defaultView?: 'grid' | 'list'
}

export function BookingDashboard({
  className = '',
  title = 'Gerenciar Reservas',
  showFilters = true,
  defaultView = 'grid',
}: BookingDashboardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView)
  const [activeTab, setActiveTab] = useState('all')
  
  // Estados dos modais e seleções
  const {
    isAddModalOpen,
    isEditModalOpen,
    selectedBooking,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
  } = useBookingState()

  // Filtros
  const { filters } = useBookingFilters()

  // Query para buscar reservas
  const {
    data: bookings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bookings', filters, activeTab],
    queryFn: () => listBookings(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  })

  // Filtrar reservas baseado nos filtros ativos
  const filteredBookings = React.useMemo(() => {
    let filtered = bookings

    // Filtro por busca de texto
    if (filters.search) {
      filtered = filtered.filter(booking =>
        booking.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Filtro por sala
    if (filters.roomId) {
      filtered = filtered.filter(booking =>
        booking.room_id?.toString() === filters.roomId
      )
    }

    // Filtro por período
    if (filters.dateFrom) {
      filtered = filtered.filter(booking =>
        booking.date >= filters.dateFrom
      )
    }
    if (filters.dateTo) {
      filtered = filtered.filter(booking =>
        booking.date <= filters.dateTo
      )
    }

    // Filtro por status
    if (filters.status !== 'all') {
      const today = new Date().toISOString().split('T')[0]
      if (filters.status === 'active') {
        filtered = filtered.filter(booking => booking.date >= today)
      } else if (filters.status === 'past') {
        filtered = filtered.filter(booking => booking.date < today)
      }
    }

    return filtered
  }, [bookings, filters])

  // Separar reservas por categoria para as abas
  const categorizedBookings = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    return {
      all: filteredBookings,
      today: filteredBookings.filter(booking => booking.date === today),
      upcoming: filteredBookings.filter(booking => booking.date > today),
      past: filteredBookings.filter(booking => booking.date < today),
    }
  }, [filteredBookings])

  const handleEdit = (booking: ListBooking) => {
    openEditModal(booking)
  }

  const handleDelete = async (booking: ListBooking) => {
    if (confirm('Tem certeza que deseja excluir esta reserva?')) {
      try {
        // Aqui você chamaria a função de delete
        // await deleteBooking(booking.id)
        refetch()
      } catch (error) {
        console.error('Erro ao excluir reserva:', error)
      }
    }
  }

  const getTabCount = (tab: string) => {
    return categorizedBookings[tab as keyof typeof categorizedBookings]?.length || 0
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao carregar reservas</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {title}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Controles de visualização */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              
              <Button onClick={() => openAddModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Reserva
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      {showFilters && (
        <BookingFilters className="" />
      )}

      {/* Conteúdo principal */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="relative">
                Todas
                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {getTabCount('all')}
                </span>
              </TabsTrigger>
              <TabsTrigger value="today" className="relative">
                Hoje
                <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {getTabCount('today')}
                </span>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="relative">
                Próximas
                <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                  {getTabCount('upcoming')}
                </span>
              </TabsTrigger>
              <TabsTrigger value="past" className="relative">
                Passadas
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {getTabCount('past')}
                </span>
              </TabsTrigger>
            </TabsList>

            {Object.entries(categorizedBookings).map(([key, bookingList]) => (
              <TabsContent key={key} value={key} className="mt-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Carregando reservas...</p>
                  </div>
                ) : (
                  <BookingCardList
                    bookings={bookingList}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    compact={viewMode === 'grid'}
                    emptyMessage={`Nenhuma reserva ${key === 'all' ? 'encontrada' : 
                      key === 'today' ? 'para hoje' :
                      key === 'upcoming' ? 'próxima' : 'passada'}`}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Modais */}
      <BookingAddPopup
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        refetch={refetch}
      />

      <BookingEditPopup
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        refetch={refetch}
        booking={selectedBooking}
      />
    </div>
  )
}