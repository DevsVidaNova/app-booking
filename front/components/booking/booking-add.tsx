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

import { BookingFormBase, BookingFormData } from './booking-form-base'
import { addBooking } from "@/services/booking.service"

interface BookingFormProps {
    refetch: () => void;
}

export function BookingAdd({ refetch }: BookingFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")

    async function onSubmit(values: BookingFormData) {
        setSuccess("")
        setError("")
        setIsLoading(true)
        
        try {
            const payload = {
                ...values,
                date: values.date ?? undefined,
                repeat: values.repeat === "null" ? null : values.repeat,
                day_repeat: values.repeat === "null" ? null : values.day_repeat,
            }
            
            const res = await addBooking(payload)
            
            if (res?.error) {
                if (/reserva nesse horário/i.test(res.error)) {
                    setError("⚠️ Já existe uma reserva nesse horário para essa sala.")
                } else {
                    setError(`❌ Erro ao salvar: ${res.error}`)
                }
                return
            }
            
            setSuccess("✅ Reserva feita com sucesso!")
            await refetch()
        } catch (err: any) {
            console.error("❌ Erro inesperado:", err)
            setError("Erro inesperado ao salvar a reserva.")
        } finally {
            setIsLoading(false)
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
                        isLoading={isLoading}
                        className="border-0 shadow-none p-0"
                    />
                    <DrawerFooter>
                        <div className="flex flex-col w-full gap-4">
                            <Message success={success} error={error} />
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
