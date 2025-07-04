import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import {
  listBookings,
  listBookingsCalendar,
  listBookingsMy,
  addBooking,
  editBooking,
  deleteBooking,
  singleBooking,
} from '@/services/booking.service';
import { CreateBooking, EditBooking, ListBooking } from '@/types';

// Hooks para Bookings
export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.lists(),
    queryFn: listBookings,
  });
}

export function useBookingsCalendar() {
  return useQuery({
    queryKey: queryKeys.bookings.calendar(),
    queryFn: listBookingsCalendar,
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.my(),
    queryFn: listBookingsMy,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => singleBooking(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addBooking,
    onSuccess: () => {
      // Invalida todas as queries de bookings para refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditBooking }) => 
      editBooking(id, data),
    onSuccess: (_, { id }) => {
      // Invalida a query específica e a lista
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      // Invalida todas as queries de bookings
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

// Hook genérico para invalidar cache
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateBookings: () => 
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
    invalidateRooms: () => 
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all }),
    invalidateMembers: () => 
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all }),
    invalidateScales: () => 
      queryClient.invalidateQueries({ queryKey: queryKeys.scales.all }),
    invalidateUsers: () => 
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}

// Hook para loading states globais
export function useGlobalLoading() {
  const queryClient = useQueryClient();
  const queries = queryClient.getQueryCache().getAll();
  
  const isLoading = queries.some(query => query.state.status === 'pending');
  const hasError = queries.some(query => query.state.status === 'error');
  
  return { isLoading, hasError };
}