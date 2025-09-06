import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import { BookingsService } from '@/services/booking.service';
import { UserService } from '@/services/user.service';
import { MembersService } from '@/services/members.service';
import { RoomsService } from '@/services/rooms.service';
import { CreateBooking, EditBooking, ListBooking, CreateUser, EditUser, ListUser, CreateMember, ListMember, CreateRoom, ListRoom } from '@/types';

// Hooks para Bookings
export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.lists(),
    queryFn: BookingsService.list,
  });
}

export function useBookingsCalendar() {
  return useQuery({
    queryKey: queryKeys.bookings.calendar(),
    queryFn: BookingsService.listCalendar,
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.my(),
    queryFn: BookingsService.listByMe,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => BookingsService.single(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: BookingsService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditBooking }) => 
      BookingsService.edit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: BookingsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

// Hooks para Users
export function useUsers(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: () => UserService.list(page),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => UserService.single(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: UserService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditUser }) => 
      UserService.edit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: UserService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// Hooks para Members
export function useMembers(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.members.lists(),
    queryFn: () => MembersService.list(page),
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: queryKeys.members.detail(id),
    queryFn: () => MembersService.single(id),
    enabled: !!id,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: MembersService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateMember }) => 
      MembersService.edit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.lists() });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: MembersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });
}

// Hooks para Rooms
export function useRooms(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.rooms.lists(),
    queryFn: () => RoomsService.list(page),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(id),
    queryFn: () => RoomsService.single(id),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: RoomsService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRoom }) => 
      RoomsService.edit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.lists() });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: RoomsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
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