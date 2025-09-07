"use client"

import React from 'react'
import { Search, Filter, X, Calendar, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
} from '@/components/ui'
import { listRooms } from '@/services/rooms.service'
import { useBookingFilters } from '@/hooks/use-booking-state'

interface BookingFiltersProps {
  onFiltersChange?: (filters: any) => void
  className?: string
}

export function BookingFilters({ onFiltersChange, className = '' }: BookingFiltersProps) {
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useBookingFilters()
  
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: listRooms,
  })

  // Notifica mudanças nos filtros
  React.useEffect(() => {
    onFiltersChange?.(filters)
  }, [filters, onFiltersChange])

  const statusOptions = [
    { value: 'all', label: 'Todas as reservas' },
    { value: 'active', label: 'Reservas ativas' },
    { value: 'past', label: 'Reservas passadas' },
  ]

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca por texto */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por descrição..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por sala */}
          <Select
            value={filters.roomId}
            onValueChange={(value) => updateFilter('roomId', value)}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Todas as salas" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as salas</SelectItem>
              {roomsLoading ? (
                <SelectItem value="loading" disabled>
                  Carregando...
                </SelectItem>
              ) : (
                rooms?.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Filtro por status */}
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por período */}
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="Data inicial"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              placeholder="Data final"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Busca: {filters.search}
                  <button
                    onClick={() => updateFilter('search', '')}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.roomId && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Sala: {rooms?.find(r => r.id.toString() === filters.roomId)?.name}
                  <button
                    onClick={() => updateFilter('roomId', '')}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Status: {statusOptions.find(s => s.value === filters.status)?.label}
                  <button
                    onClick={() => updateFilter('status', 'all')}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  Período: {filters.dateFrom || '...'} até {filters.dateTo || '...'}
                  <button
                    onClick={() => {
                      updateFilter('dateFrom', '')
                      updateFilter('dateTo', '')
                    }}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}