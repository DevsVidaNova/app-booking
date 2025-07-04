"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { BookingFormBase, BookingFormData } from './booking-form-base';
import { editBooking, deleteBooking } from "@/services/booking.service";
import { ListBooking } from "@/types";

interface BookingEditPopupProps {
    isOpen: boolean;
    onClose: () => void;
    refetch: () => void;
    booking: ListBooking | null;
}

export function BookingEditPopup({ isOpen, onClose, refetch, booking }: BookingEditPopupProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const defaultValues: Partial<BookingFormData> = {
        description: booking?.description || "",
        room_id: booking?.room?.id?.toString() || "",
        start_time: booking?.start_time || "",
        end_time: booking?.end_time || "",
        date: booking?.date || "",
        repeat: booking?.repeat || "none",
    };

    async function onSubmit(values: BookingFormData) {
        if (!booking) return;
        
        setIsLoading(true);
        try {
            // Transformar os dados para o formato esperado pela API
            const bookingData = {
                description: values.description,
                room_id: parseInt(values.room_id),
                date: values.date,
                start_time: values.start_time,
                end_time: values.end_time,
                repeat: values.repeat === 'none' ? null : values.repeat,
                day_repeat: values.day_repeat || null,
            };
            
            const response = await editBooking(booking.id.toString(), bookingData);
            if (response) {
                onClose();
                refetch();
            }
        } catch (error) {
            console.error("Erro ao editar reserva:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete() {
        if (!booking) return;
        
        if (!confirm("Tem certeza que deseja excluir esta reserva?")) return;
        
        setIsDeleting(true);
        try {
            await deleteBooking(booking.id);
            onClose();
            refetch();
        } catch (error) {
            console.error("Erro ao excluir reserva:", error);
        } finally {
            setIsDeleting(false);
        }
    }

    if (!booking) return null;

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
                                <h2 className="text-lg font-semibold">Editar Reserva</h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Excluir reserva"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <BookingFormBase
                                    onSubmit={onSubmit}
                                    defaultValues={defaultValues}
                                    submitLabel="Salvar Alterações"
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
    );
}
