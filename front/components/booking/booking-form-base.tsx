"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { CalendarSearch, HelpCircle, Users } from 'lucide-react'

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'

import { listRooms } from '@/services/rooms.service'

// Schema de validação
const bookingSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  room_id: z.string().min(1, 'Sala é obrigatória'),
  start_time: z.string().min(1, 'Horário de início é obrigatório'),
  end_time: z.string().min(1, 'Horário de fim é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  repeat: z.string().optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>

interface BookingFormBaseProps {
  onSubmit: (data: BookingFormData) => Promise<void>
  defaultValues?: Partial<BookingFormData>
  submitLabel?: string
  title?: string
  isLoading?: boolean
  showRepeatOptions?: boolean
  className?: string
}

export function BookingFormBase({
  onSubmit,
  defaultValues = {},
  submitLabel = 'Salvar Reserva',
  title,
  isLoading = false,
  showRepeatOptions = true,
  className = '',
}: BookingFormBaseProps) {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      description: '',
      room_id: '',
      start_time: '',
      end_time: '',
      date: '',
      repeat: 'none',
      ...defaultValues,
    },
  })

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => listRooms(1),
  })

  const handleSubmit = async (data: BookingFormData) => {
    try {
      await onSubmit(data)
      if (!defaultValues.description) {
        form.reset()
      }
    } catch (error) {
      console.error('Erro ao salvar reserva:', error)
    }
  }

  const repeatOptions = [
    { value: 'none', label: 'Não repetir' },
    { value: 'day', label: 'Diariamente' },
    { value: 'week', label: 'Semanalmente' },
    { value: 'month', label: 'Mensalmente' },
  ]

  const timeOptions = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00'
  ]

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarSearch className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição da Reserva</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o motivo da reserva..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sala */}
            <FormField
              control={form.control}
              name="room_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Sala
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma sala" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roomsLoading ? (
                        <SelectItem value="loading" disabled>
                          Carregando salas...
                        </SelectItem>
                      ) : (
                        rooms?.data?.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room?.name} - Capacidade: {room?.size}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Início</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Início" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Fim</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Fim" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Opções de Repetição */}
            {showRepeatOptions && (
              <FormField
                control={form.control}
                name="repeat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Repetir Reserva
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {repeatOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Salvando...' : submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export { bookingSchema }