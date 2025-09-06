"use client"

import React from 'react'
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

import { BookingFormBase, BookingFormData } from './booking-form-base'
import { BookingsService } from "@/services/booking.service"
import { toast } from 'sonner'

export function BookingAdd() {
    
    const createMutation = BookingsService.useCreate()

    async function onSubmit(values: BookingFormData) {
        
        try {
            const payload = {
                description: values.description,
                room: values.room_id,
                date: values.date ?? undefined,
                start_time: values.start_time,
                end_time: values.end_time,
                repeat: values.repeat === "null" ? null : values.repeat,
                day_repeat: values.repeat === "null" ? null : undefined,
            }
            
            await createMutation.mutateAsync(payload)
            toast.success("✅ Reserva feita com sucesso!")
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button className="bg-amber-500 z-20 hover:bg-amber-100 hover:text-amber-500">
                    Fazer Reserva
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="container mx-auto px-4">
                    <DrawerHeader>
                        <DrawerTitle>Reserva de Sala</DrawerTitle>
                        <DrawerDescription>Preencha os detalhes para fazer sua reserva.</DrawerDescription>
                    </DrawerHeader>
                    <BookingFormBase
                        onSubmit={onSubmit}
                        submitLabel="Concluir reserva"
                        isLoading={createMutation.isPending}
                        className="border-0 shadow-none p-0"
                    />
                    <DrawerFooter>
                        <div className="flex flex-col w-full gap-4">
                            <DrawerClose>
                                <Button variant="secondary" className="w-full">Fechar</Button>
                            </DrawerClose>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
