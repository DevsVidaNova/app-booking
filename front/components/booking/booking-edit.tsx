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
} from "@/components/ui"

import { Pencil } from "lucide-react"
import { BookingFormBase, BookingFormData } from './booking-form-base'
import { BookingsService } from "@/services/booking.service"
import { ListBooking } from "@/types"
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { toast } from 'sonner'

dayjs.extend(customParseFormat)

interface BookingEditFormProps {
    booking: ListBooking | null
    isOpen?: boolean
    onClose?: () => void
}

export function BookingEdit({ booking, isOpen = false, onClose }: BookingEditFormProps) {
    const [open, setOpen] = useState(isOpen)
    
    const updateMutation = BookingsService.useUpdate()

    React.useEffect(() => {
        setOpen(isOpen)
    }, [isOpen])

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen && onClose) {
            onClose()
        }
    }

    // Converter data de DD/MM/YYYY para YYYY-MM-DD para o input date HTML
    const formatDateForInput = (dateStr: string | null): string => {
        if (!dateStr || dateStr === 'null') return '';
        
        // Tentar parsear nos formatos possíveis e converter para YYYY-MM-DD
        const date = dayjs(dateStr, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
        
        if (date.isValid()) {
            return date.format('YYYY-MM-DD');
        }
        
        return '';
    };

    const formDefaultValues: Partial<BookingFormData> = {
        description: booking?.description || '',
        room_id: booking?.room?.id?.toString() || '',
        date: formatDateForInput(booking?.date || null),
        start_time: booking?.start_time || '',
        end_time: booking?.end_time || '',
        repeat: booking?.repeat || 'none',
    }

    async function onSubmit(values: BookingFormData) {
        
        try {
            // Transformar os dados para o formato esperado pela API
            // Converter data para DD/MM/YYYY (formato esperado pelo backend)
            let formattedDate = null;
            if (values.date && values.date.trim() !== '') {
                const date = dayjs(values.date, ['YYYY-MM-DD', 'DD/MM/YYYY'], true);
                
                if (date.isValid()) {
                    formattedDate = date.format('DD/MM/YYYY');
                }
            }

            const bookingData = {
                description: values.description,
                room_id: parseInt(values.room_id),
                date: formattedDate,
                start_time: values.start_time,
                end_time: values.end_time,
                repeat: values.repeat === 'none' ? null : values.repeat,
            }
            
            await updateMutation.mutateAsync({
                id: booking?.id?.toString() || '',
                data: bookingData
            })
            
            toast.success('Reserva editada com sucesso!')
            // Fechar modal após sucesso
            setTimeout(() => {
                handleOpenChange(false)
            }, 1500)
        } catch (error: any) {
            toast.error(error.message || 'Erro ao editar reserva')
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
                                Modifique os detalhes da reserva para {booking?.room?.name || 'a sala selecionada'}.
                            </DrawerDescription>
                        </DrawerHeader>
                        
                        <div className="py-4">
                            <BookingFormBase
                                onSubmit={onSubmit}
                                defaultValues={formDefaultValues}
                                submitLabel="Salvar alterações"
                                isLoading={updateMutation.isPending}
                                className="border-0 shadow-none p-0"
                            />
                        </div>
                        
                        <DrawerFooter>
                            <div className="flex flex-col w-full gap-4">
                                <DrawerClose asChild>
                                    <Button 
                                        variant="secondary" 
                                        className="w-full"
                                        disabled={updateMutation.isPending}
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

