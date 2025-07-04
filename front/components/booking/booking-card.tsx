"use client"

import React from 'react'
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Edit3,
  Trash2,
  MoreVertical,
  Repeat,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui'
import { ListBooking } from '@/types'

interface BookingCardProps {
  booking: ListBooking
  onEdit?: (booking: ListBooking) => void
  onDelete?: (booking: ListBooking) => void
  onView?: (booking: ListBooking) => void
  showActions?: boolean
  compact?: boolean
  className?: string
}

export function BookingCard({
  booking,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  compact = false,
  className = '',
}: BookingCardProps) {
  // Formatação de data e status
  const bookingDate = parseISO(booking.date)
  const isPastBooking = isPast(bookingDate)
  const isTodayBooking = isToday(bookingDate)
  const isTomorrowBooking = isTomorrow(bookingDate)

  const getDateLabel = () => {
    if (isTodayBooking) return 'Hoje'
    if (isTomorrowBooking) return 'Amanhã'
    return format(bookingDate, 'dd/MM/yyyy', { locale: ptBR })
  }

  const getStatusBadge = () => {
    if (isPastBooking) {
      return <Badge variant="secondary">Finalizada</Badge>
    }
    if (isTodayBooking) {
      return <Badge variant="default">Hoje</Badge>
    }
    return <Badge variant="outline">Agendada</Badge>
  }

  const getRepeatLabel = () => {
    if (!booking.repeat || booking.repeat === 'none') return null
    
    const labels = {
      day: 'Diário',
      week: 'Semanal',
      month: 'Mensal',
    }
    
    return labels[booking.repeat as keyof typeof labels] || booking.repeat
  }

  return (
    <Card className={`transition-all hover:shadow-md ${className} ${
      isPastBooking ? 'opacity-75' : ''
    }`}>
      <CardHeader className={`pb-3 ${compact ? 'p-4' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge()}
              {getRepeatLabel() && (
                <Badge variant="outline" className="text-xs">
                  <Repeat className="h-3 w-3 mr-1" />
                  {getRepeatLabel()}
                </Badge>
              )}
            </div>
            
            <h3 className={`font-semibold text-gray-900 line-clamp-2 ${
              compact ? 'text-sm' : 'text-base'
            }`}>
              {booking.description}
            </h3>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(booking)}>
                    <User className="h-4 w-4 mr-2" />
                    Ver detalhes
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(booking)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(booking)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className={`pt-0 ${compact ? 'p-4 pt-0' : ''}`}>
        <div className="space-y-3">
          {/* Informações da sala */}
          {booking.room && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className={compact ? 'text-sm' : 'text-base'}>
                {booking.room.name}
                {booking.room.capacity && (
                  <span className="text-gray-400 ml-1">
                    (Cap. {booking.room.capacity})
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Data e horário */}
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className={compact ? 'text-sm' : 'text-base'}>
                {getDateLabel()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className={compact ? 'text-sm' : 'text-base'}>
                {booking.start_time} - {booking.end_time}
              </span>
            </div>
          </div>

          {/* Usuário responsável */}
          {booking.user && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className={compact ? 'text-sm' : 'text-base'}>
                {booking.user.name || booking.user.email}
              </span>
            </div>
          )}
        </div>

        {/* Ações rápidas (apenas em modo não compacto) */}
        {!compact && showActions && (onEdit || onDelete) && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(booking)}
                className="flex-1"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(booking)}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Excluir
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Componente para exibir uma lista de cards de booking
 */
interface BookingCardListProps {
  bookings: ListBooking[]
  onEdit?: (booking: ListBooking) => void
  onDelete?: (booking: ListBooking) => void
  onView?: (booking: ListBooking) => void
  showActions?: boolean
  compact?: boolean
  emptyMessage?: string
  className?: string
}

export function BookingCardList({
  bookings,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  compact = false,
  emptyMessage = 'Nenhuma reserva encontrada',
  className = '',
}: BookingCardListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} ${className}`}>
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          showActions={showActions}
          compact={compact}
        />
      ))}
    </div>
  )
}