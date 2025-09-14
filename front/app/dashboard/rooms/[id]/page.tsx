"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, Button, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { 
  ArrowLeft, 
  Users, 
  Info, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Phone,
  Calendar,
  Plus
} from "lucide-react";
import { Room, ListBooking } from "@/types";
import { RoomsService } from "@/services/rooms.service";
import { BookingsService } from "@/services/booking.service";
import { BookingAdd } from "@/components/booking/booking-add";
import { BookingEdit } from "@/components/booking/booking-edit";
import { useBookingState } from "@/hooks/use-booking-state";
import Link from "next/link";
import { toast } from "sonner";

export default function RoomDetailPage() {
  const params = useParams();
  const roomId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [filteredBookings, setFilteredBookings] = useState<ListBooking[]>([]);
  
  const {
    isAddModalOpen,
    isEditModalOpen,
    selectedBooking,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
  } = useBookingState();

  // Buscar dados da sala
  const { data: roomData, isLoading: roomLoading, isError: roomError } = RoomsService.useSingle(roomId);
  const room = roomData?.data?.[0] as Room;

  // Buscar agendamentos
  const { data: allBookings, isLoading: bookingsLoading } = BookingsService.useList();
  const { data: weekBookings } = BookingsService.useListByWeek();
  const { data: monthBookings } = BookingsService.useListByMonth();

  useEffect(() => {
    const getCurrentUser = () => {
      const res = localStorage.getItem('user') || sessionStorage.getItem('user');
      return res ? JSON.parse(res) : null;
    };
    setUser(getCurrentUser());
  }, []);

  // Filtrar agendamentos por sala
  useEffect(() => {
    if (allBookings && room) {
      const bookings = allBookings.filter(booking => booking.room.id === room.id);
      setFilteredBookings(bookings);
    }
  }, [allBookings, room]);

  const handleEdit = (booking: ListBooking) => {
    openEditModal(booking);
  };

  const handleDelete = async (bookingId: number) => {
    try {
      await BookingsService.delete(bookingId.toString());
      toast.success("Agendamento excluído com sucesso!");
      // Atualizar lista local
      setFilteredBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir agendamento");
    }
  };

  if (roomLoading) {
    return <RoomDetailSkeleton />;
  }

  if (roomError || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle size={64} className="text-red-500" />
        <h2 className="text-2xl font-bold text-center">Sala não encontrada</h2>
        <p className="text-gray-600 text-center">A sala que você está procurando não existe ou foi removida.</p>
        <Link href="/dashboard/rooms">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Salas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col container w-full px-3 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/rooms">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{room.name}</h1>
        </div>

        {/* Informações da Sala */}
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2">
              <Info size={20} className="text-neutral-500 mt-0.5 flex-shrink-0" />
              <p className="text-neutral-600 leading-relaxed">
                {room.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-neutral-500" />
                <span className="text-sm text-neutral-600">Ocupação:</span>
                <span className="text-sm font-medium text-neutral-800">{room.size}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {room.exclusive ? <Lock size={16} className="text-neutral-500" /> : <Unlock size={16} className="text-neutral-500" />}
                <span className="text-sm text-neutral-600">Tipo:</span>
                <span className="text-sm font-medium text-neutral-800">
                  {room.exclusive ? "Exclusivo" : "Livre"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {room.status ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )}
                <span className={`text-sm font-medium ${room.status ? 'text-green-600' : 'text-red-600'}`}>
                  {room.status ? "Ativo" : "Desativado"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Agendamentos */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Agendamentos</h2>
          {user && (
            <Button onClick={openAddModal} className="md:block hidden">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          )}
        </div>

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="semana">Esta Semana</TabsTrigger>
            <TabsTrigger value="mes">Este Mês</TabsTrigger>
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
          </TabsList>

          <TabsContent value="todos">
            <BookingList 
              bookings={filteredBookings} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              isLoading={bookingsLoading}
            />
          </TabsContent>

          <TabsContent value="semana">
            <BookingList 
              bookings={weekBookings?.filter(booking => booking.room.id === room.id) || []} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              isLoading={bookingsLoading}
            />
          </TabsContent>

          <TabsContent value="mes">
            <BookingList 
              bookings={monthBookings?.filter(booking => booking.room.id === room.id) || []} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              isLoading={bookingsLoading}
            />
          </TabsContent>

          <TabsContent value="hoje">
            <BookingList 
              bookings={filteredBookings.filter(booking => {
                const today = new Date().toISOString().split('T')[0];
                return booking.date === today;
              })} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              isLoading={bookingsLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Botão mobile */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 md:hidden">
          {user && (
            <Button onClick={openAddModal} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          )}
        </div>
      </div>

      {/* Modais */}
      <BookingAdd />
      {selectedBooking && (
        <BookingEdit
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          booking={selectedBooking}
        />
      )}
    </div>
  );
}

const BookingList = ({ 
  bookings, 
  onEdit, 
  onDelete, 
  isLoading 
}: { 
  bookings: ListBooking[]; 
  onEdit: (booking: ListBooking) => void; 
  onDelete: (id: number) => void;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <BookingListSkeleton />;
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center border p-6 rounded-xl my-6">
        <Calendar size={64} className="text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-center mb-2">Nenhum agendamento encontrado</h3>
        <p className="text-gray-600 text-center">Esta sala não possui agendamentos no período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const { end_time, start_time, user, date, id, description, repeat, day_of_week, month } = booking;
        const repeats = [{ id: 'day', name: 'DIA' }, { id: 'week', name: 'SEM' }, { id: 'month', name: 'MÊS' }];
        const repeatName = repeats.find((r) => r.id === repeat)?.name;

        return (
          <Card key={id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">{start_time} - {end_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="text-sm">{user?.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">{description}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="font-medium uppercase">{day_of_week}</span>
                  <span className="font-bold uppercase">{date ? date.slice(0, 2) : '↻'}</span>
                  <span className="uppercase">{month || repeatName}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(booking)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const RoomDetailSkeleton = () => (
  <div className="flex flex-col container w-full px-3 py-4 gap-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-48" />
    </div>
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-8 w-32" />
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  </div>
);

const BookingListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-20 w-full" />
    ))}
  </div>
);
