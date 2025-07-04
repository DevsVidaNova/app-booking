'use client';

import { useQuery } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { useMemo, useState, useRef, useEffect } from 'react';
import { addDays, addMonths, isBefore } from 'date-fns';
import { listBookings } from '@/services/booking.service';
import { listRooms } from '@/services/rooms.service';
import { ListBooking } from '@/types';
import { BookingForm } from '../booking/booking-add';
import { Plus, Loader } from 'lucide-react';
import { BookingEditPopup } from '../booking/booking-edit-popup';

function normalizeTime(time: string): string {
  if (!time) return '00:00:00';
  return time.length === 5 ? `${time}:00` : time;
}

function parseDate(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('-')) return dateStr;
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}

function getColorFromRoomName(roomName: string): string {
  const colors = ['#f87171', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#fb923c', '#a3e635', '#38bdf8', '#f472b6', '#34d399', '#fcd34d', '#818cf8'];
  const hash = roomName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function getDayNumber(dayName?: string): number {
  if (!dayName || typeof dayName !== 'string') return -1;
  const map: { [key: string]: number } = {
    'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sábado': 6,
    'dom': 0, 'seg': 1, 'ter': 2, 'qua': 3, 'qui': 4, 'sex': 5, 'sab': 6, 'sáb': 6,
    'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6,
  };
  const cleaned = dayName.trim().toLowerCase().replace('-feira', '');
  return map[cleaned] ?? -1;
}

export default function SandboxList() {
  const calendarRef = useRef<any>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const {
    data: bookings,
    refetch: refetchRaw,
    isFetching: isFetchingBookings
  } = useQuery<ListBooking[]>({
    queryKey: ['bookings list'],
    queryFn: listBookings
  });

  const refetchBookings = async () => {
    const oldDate = currentDate;
    await refetchRaw();
  
    setTimeout(() => {
      if (calendarRef.current && oldDate) {
        calendarRef.current.getApi().gotoDate(oldDate);
      }
    }, 100); // Pequeno delay garante que o FullCalendar já esteja montado
  };
  

  const { data: rooms } = useQuery({ queryKey: ['rooms'], queryFn: listRooms });

  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      calendarRef.current?.getApi().scrollToTime('09:00:00');
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const toggleRoom = (roomId: string) => {
    setSelectedRooms(prev => {
      const newSet = new Set(prev);
      newSet.has(roomId) ? newSet.delete(roomId) : newSet.add(roomId);
      return newSet;
    });
  };

  const events = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    const allEvents = [];
    const startDate = new Date();
    const endDate = addMonths(startDate, 6);

    bookings.forEach((booking) => {
      if (!booking.start_time || !booking.end_time || !booking.room?.id) return;
      if (selectedRooms.size > 0 && !selectedRooms.has(booking.room.id)) return;
      const bgColor = getColorFromRoomName(booking.room.name);

      const baseEvent = {
        title: booking.description ?? 'Evento',
        backgroundColor: bgColor,
        borderColor: bgColor,
        textColor: '#000000',
        extendedProps: { booking },
      };

      if (booking.date) {
        const parsedDate = parseDate(booking.date);
        const start = new Date(`${parsedDate}T${normalizeTime(booking.start_time)}`);
        const end = new Date(`${parsedDate}T${normalizeTime(booking.end_time)}`);
        allEvents.push({ ...baseEvent, id: booking.id, start, end });
      }

      if (typeof booking.repeat === 'string' && typeof booking.repeat_day === 'string') {
        const repeatType = booking.repeat.toLowerCase();
        const repeatDay = getDayNumber(booking.repeat_day);
        if (repeatDay === -1) return;
        let current = new Date(startDate);

        while (isBefore(current, endDate)) {
          const isMatch =
            repeatType === 'day' ||
            (repeatType === 'week' && current.getDay() === repeatDay) ||
            (repeatType === 'month' && current.getDate() === repeatDay);

          if (isMatch) {
            const dateStr = current.toISOString().split('T')[0];
            const start = new Date(`${dateStr}T${normalizeTime(booking.start_time)}`);
            const end = new Date(`${dateStr}T${normalizeTime(booking.end_time)}`);
            allEvents.push({
              ...baseEvent,
              id: `${booking.id}-${dateStr}`,
              title: `${baseEvent.title} (repetido)`,
              start,
              end,
            });
          }
          current = addDays(current, 1);
        }
      }
    });

    return allEvents;
  }, [bookings, selectedRooms]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="md:w-72 bg-gray-100 border-r px-4 py-6 hidden md:block">
        <h2 className="text-lg font-bold mb-4">Salas</h2>
        {rooms?.map((room) => {
          const color = getColorFromRoomName(room.name);
          return (
            <label key={room.id} className="flex items-center space-x-2 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRooms.size === 0 || selectedRooms.has(room.id)}
                onChange={() => toggleRoom(room.id)}
              />
              <span className="flex items-center space-x-1">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                <span className="text-sm">{room.name}</span>
              </span>
            </label>
          );
        })}
        <button className="mt-4 text-blue-600 underline text-sm" onClick={() => setSelectedRooms(new Set())}>
          Limpar Filtros
        </button>
      </aside>

      <main className="flex-grow w-full p-6 min-w-0 relative">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Agenda de Reservas</h1>
          {isFetchingBookings && (
            <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
              <Loader size={18} className="animate-spin" /> Atualizando...
            </div>
          )}
        </div>

        {isFetchingBookings && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <Loader size={32} className="animate-spin text-gray-600" />
          </div>
        )}

        <div className="overflow-x-hidden">
          <FullCalendar
            key={bookings?.length}
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale={ptBrLocale}
            weekends={true}
            height="auto"
            slotMinTime="09:00:00"
            slotMaxTime="23:59:00"
            headerToolbar={{
              start: 'prev,next today',
              center: 'title',
              end: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            eventClick={(info) => {
              const { booking } = info.event.extendedProps;
              if (booking?.id) setSelectedBooking(booking);
            }}
            eventDidMount={(info) => {
              info.el.classList.add('transition-transform', 'hover:scale-[1.02]', 'hover:shadow-md', 'rounded-md');
            }}
            datesSet={(arg) => {
              setCurrentDate(arg.start); // Salva a posição atual do calendário
            }}
          />
        </div>

        {selectedBooking && (
          <BookingEditPopup
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onSaved={() => refetchBookings()}
          />
        )}

        <div className="absolute top-6 right-6 z-10">
          <BookingForm refetch={refetchBookings} />
        </div>
      </main>
    </div>
  );
}
