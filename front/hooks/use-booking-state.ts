"use client"

import { useState, useCallback } from 'react'
import { ListBooking } from '@/types'

/**
 * Hook customizado para gerenciar o estado dos componentes de booking
 * Centraliza a lógica de modais, seleção e carregamento
 */
export function useBookingState() {
  // Estados dos modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Booking selecionado para edição
  const [selectedBooking, setSelectedBooking] = useState<ListBooking | null>(null)
  
  // Estados de carregamento
  const [isLoading, setIsLoading] = useState(false)
  
  // Data e horário selecionados (para criação rápida)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')

  // Funções para controlar modal de adição
  const openAddModal = useCallback((date?: string, time?: string) => {
    if (date) setSelectedDate(date)
    if (time) setSelectedTime(time)
    setIsAddModalOpen(true)
  }, [])

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false)
    setSelectedDate('')
    setSelectedTime('')
  }, [])

  // Funções para controlar modal de edição
  const openEditModal = useCallback((booking: ListBooking | null) => {
    setSelectedBooking(booking)
    setIsEditModalOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false)
    setSelectedBooking(null)
  }, [])

  // Função para controlar carregamento
  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  // Função para resetar todos os estados
  const resetState = useCallback(() => {
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedBooking(null)
    setIsLoading(false)
    setSelectedDate('')
    setSelectedTime('')
  }, [])

  return {
    // Estados
    isAddModalOpen,
    isEditModalOpen,
    selectedBooking,
    isLoading,
    selectedDate,
    selectedTime,
    
    // Ações
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    setLoadingState,
    resetState,
  }
}

/**
 * Hook para gerenciar filtros de booking
 */
export function useBookingFilters() {
  const [filters, setFilters] = useState({
    search: '',
    roomId: '',
    dateFrom: '',
    dateTo: '',
    status: 'all' as 'all' | 'active' | 'past',
  })

  const updateFilter = useCallback((key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      roomId: '',
      dateFrom: '',
      dateTo: '',
      status: 'all',
    })
  }, [])

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  )

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  }
}