"use client"

import React, { useState } from 'react'
import {
    Button,
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    Message
} from "@/components/ui"

import { Pencil } from "lucide-react"
import { BookingFormBase, BookingFormData } from './booking-form-base'
import { editBooking } from "@/services/booking.service"
import { ListBooking } from "@/types"

interface BookingEditFormProps {
    booking: ListBooking
    refetch: () => void
    isOpen?: boolean
    onClose?: () => void
}

export function BookingEdit({ booking, refetch, isOpen = false, onClose }: BookingEditFormProps) {
    const [open, setOpen] = useState(isOpen)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    React.useEffect(() => {
        setOpen(isOpen)
    }, [isOpen])

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen && onClose) {
            onClose()
        }
    }

    const formDefaultValues: Partial<BookingFormData> = {
        description: booking.description,
        room_id: booking.room?.id?.toString() || '',
        date: booking.date || '',
        start_time: booking.start_time,
        end_time: booking.end_time,
        repeat: booking.repeat || 'none',
    }

    async function onSubmit(values: BookingFormData) {
        setSuccess('')
        setError('')
        setIsLoading(true)
        try {
            // Transformar os dados para o formato esperado pela API
            const bookingData = {
                description: values.description,
                room_id: parseInt(values.room_id),
                date: values.date,
                start_time: values.start_time,
                end_time: values.end_time,
                repeat: values.repeat === 'none' ? null : values.repeat,
            }
            
            const response = await editBooking(booking.id.toString(), bookingData)
            if (response) {
                setSuccess('Reserva editada com sucesso!')
                refetch()
                // Fechar modal após sucesso
                setTimeout(() => {
                    handleOpenChange(false)
                    setSuccess('')
                }, 1500)
            }
        } catch (error: any) {
            setError(error.message || 'Erro ao editar reserva')
        } finally {
            setIsLoading(false)
        }
    }

    // Se não há booking, não renderizar nada
    if (!booking) {
        return null
    }

    return (
        <div>
            <Drawer open={open} onOpenChange={handleOpenChange}>
                {/* Só renderizar trigger se não for controlado externamente */}
                {!onClose && (
                    <DrawerTrigger asChild>
                        <Button variant='outline' className='w-[46px] h-[46px] rounded-full'>
                            <Pencil size={24} />
                        </Button>
                    </DrawerTrigger>
                )}
                <DrawerContent>
                    <div className="container mx-auto px-4 max-w-2xl">
                        <DrawerHeader>
                            <DrawerTitle>Editar Reserva de Sala</DrawerTitle>
                            <DrawerDescription>
                                Modifique os detalhes da reserva para {booking.room?.name || 'sala selecionada'}.
                            </DrawerDescription>
                        </DrawerHeader>
                        
                        <div className="py-4">
                            <BookingFormBase
                                onSubmit={onSubmit}
                                defaultValues={formDefaultValues}
                                submitLabel="Salvar alterações"
                                isLoading={isLoading}
                                className="border-0 shadow-none p-0"
                            />
                        </div>
                        
                        <DrawerFooter>
                            <div className="flex flex-col w-full gap-4">
                                {(success || error) && (
                                    <Message success={success} error={error} />
                                )}
                                <DrawerClose asChild>
                                    <Button 
                                        variant="secondary" 
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        Fechar
                                    </Button>
                                </DrawerClose>
                            </div>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

