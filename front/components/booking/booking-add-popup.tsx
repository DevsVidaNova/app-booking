"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { BookingFormBase, BookingFormData } from './booking-form-base'
import { addBooking } from "@/services/booking.service"

interface BookingAddPopupProps {
    isOpen: boolean
    onClose: () => void
    refetch: () => void
    selectedDate?: string
    selectedTime?: string
}

export function BookingAddPopup({ isOpen, onClose, refetch, selectedDate, selectedTime }: BookingAddPopupProps) {
    const [isLoading, setIsLoading] = useState(false)

    const defaultValues: Partial<BookingFormData> = {
        description: "",
        room_id: "",
        start_time: selectedTime || "",
        end_time: "",
        date: selectedDate || "",
        repeat: "none",
    }

    async function onSubmit(values: BookingFormData) {
        setIsLoading(true)
        try {
            const response = await addBooking(values)
            if (response) {
                onClose()
                refetch()
            }
        } catch (error) {
            console.error("Erro ao criar reserva:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={onClose}
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-lg font-semibold">Nova Reserva</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <BookingFormBase
                                    onSubmit={onSubmit}
                                    defaultValues={defaultValues}
                                    submitLabel="Criar Reserva"
                                    isLoading={isLoading}
                                    className="border-0 shadow-none p-0"
                                />
                                
                                <div className="flex gap-3 pt-4 mt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
