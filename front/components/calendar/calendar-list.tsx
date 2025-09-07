"use client";
import { useMemo, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import "./style.css";
import { DayCellContentArg, EventContentArg, SlotLabelContentArg, DayHeaderContentArg, DateSelectArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { addDays, addMonths, isBefore } from "date-fns";

import { BookingsService } from "@/services/booking.service";
import { RoomsService } from "@/services/rooms.service";
import { ListBooking } from "@/types";
import { BookingAdd } from "../booking/booking-add";
import { BookingEdit } from "../booking/booking-edit";

import { Loader, Menu } from "lucide-react";

import { Sidebar, SidebarContent, SidebarGroup, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Title, Label, Checkbox } from "../ui";
import { CalendarControls } from "./calendar-controls";
import { useIsMobile } from "@/hooks/use-mobile";
import dayjs from "dayjs";
import Pagination from "../pagination";

function normalizeTime(time: string): string {
  if (!time) return "00:00:00";
  return time.length === 5 ? `${time}:00` : time;
}

function parseDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("-")) return dateStr;
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

function getColorFromRoomName(roomName: string): string {
  const colors = ["#f8717130", "#facc1530", "#4ade8030", "#60a5fa30", "#c084fc30", "#fb923c30", "#a3e63530", "#38bdf830", "#f472b630", "#34d39930", "#fcd34d30", "#818cf830"];
  const hash = roomName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function getDayNumber(dayName?: string): number {
  if (!dayName || typeof dayName !== "string") return -1;
  const map: { [key: string]: number } = {
    domingo: 0,
    segunda: 1,
    terça: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sábado: 6,
    dom: 0,
    seg: 1,
    ter: 2,
    qua: 3,
    qui: 4,
    sex: 5,
    sab: 6,
    sáb: 6,
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6
  };
  const cleaned = dayName.trim().toLowerCase().replace("-feira", "");
  return map[cleaned] ?? -1;
}

const formatDate = (date: string) => dayjs(date).format("DD/MM/YYYY");
const formatTime = (time: string) => dayjs(time).format("HH:mm");

export default function CalendarList() {
  const calendarRef = useRef<any>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectDate, setSelectDate] = useState<DateSelectArg | null>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const {
    data: bookings,
    refetch: refetchRaw,
    isLoading
  } = useQuery<ListBooking[]>({
    queryKey: ["bookings list"],
    queryFn: BookingsService.useList,
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

  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const toggleRoom = (roomId: string) => {
    setSelectedRooms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  const handleResize = (info: any) => {
    const updatedBooking = {
      ...info.event.extendedProps.booking,
      start_time: formatTime(info.event.start),
      end_time: formatTime(info.event.end),
      date: formatDate(info.event.start)
    };
    setSelectedBooking(updatedBooking);
  };

  const handleDrag = (info: any) => {
    const updatedBooking = {
      ...info.event.extendedProps.booking,
      start_time: formatTime(info.event.start),
      end_time: formatTime(info.event.end),
      date: formatDate(info.event.start)
    };
    setSelectedBooking(updatedBooking);
  };

  const events = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    const allEvents: any[] = [];
    const startDate = new Date();
    const endDate = addMonths(startDate, 6);

    bookings.forEach(booking => {
      if (!booking.start_time || !booking.end_time || !booking.room?.id) return;
      if (selectedRooms.size > 0 && !selectedRooms.has(booking.room.id)) return;

      const bgColor = getColorFromRoomName(booking.room.name);

      const baseEvent = {
        title: booking.description ?? "Evento",
        backgroundColor: bgColor,
        borderColor: bgColor,
        textColor: "#000000",
        extendedProps: { booking }
      };

      if (booking.date) {
        const parsedDate = parseDate(booking.date);
        const start = new Date(`${parsedDate}T${normalizeTime(booking.start_time)}`);
        const end = new Date(`${parsedDate}T${normalizeTime(booking.end_time)}`);
        allEvents.push({ ...baseEvent, id: booking.id, start, end });
      }

      if (booking.repeat === "week" && booking.repeat_day) {
        const repeatType = booking.repeat.toLowerCase();
        const repeatDay = getDayNumber(booking?.repeat_day);
        if (repeatDay === -1) return;
        let current = new Date(startDate);

        while (isBefore(current, endDate)) {
          const isMatch = repeatType === "day" || (repeatType === "week" && current.getDay() === repeatDay) || (repeatType === "month" && current.getDate() === repeatDay);

          if (isMatch) {
            const dateStr = current.toISOString().split("T")[0];
            const start = new Date(`${dateStr}T${normalizeTime(booking.start_time)}`);
            const end = new Date(`${dateStr}T${normalizeTime(booking.end_time)}`);
            allEvents.push({
              ...baseEvent,
              id: `${booking.id}-${dateStr}`,
              title: `${baseEvent.title} (repetido)`,
              start,
              end
            });
          }
          current = addDays(current, 1);
        }
      }
    });

    return allEvents;
  }, [bookings, selectedRooms]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
        <Loader size={18} className="animate-spin" /> Atualizando...
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-screen">
        <div className="flex items-center justify-between p-4 border-b">
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Salas</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4">
                <CalendarSidebarContent selectedRooms={selectedRooms} toggleRoom={toggleRoom} />
              </div>
            </DrawerContent>
          </Drawer>
          <CalendarControls calendarRef={calendarRef} />
        </div>
        <div className="p-4">
          <FullCalendar
            key={bookings?.data?.length}
            ref={calendarRef}
            headerToolbar={false}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={ptBrLocale}
            weekends
            selectable
            select={info => {
              setSelectDate(info);
            }}
            height="calc(100vh - 200px)"
            //SLOT
            slotMinTime="08:00:00"
            slotMaxTime="23:59:00"
            slotDuration="01:00:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit"
            }}
            slotLabelContent={arg => <SlotLabel item={arg} />}
            //EVENT

            events={events}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: "short"
            }}
            eventContent={arg => <EventItem item={arg} onSelect={setSelectedBooking} />}
            eventDrop={info => handleDrag(info)}
            eventResize={info => handleResize(info)}
            eventResizableFromStart
            datesSet={arg => {
              setCurrentDate(arg.start);
            }}
            editable
            dayCellContent={arg => <DayItem item={arg} />}
            dayHeaderContent={arg => <CustomDayHeader item={arg} />}
            allDaySlot={false}
          />

          {selectDate && <BookingAddPopup start={selectDate.start} end={selectDate.end} onClose={() => setSelectDate(null)} onSaved={() => refetchBookings()} />}
          {selectedBooking && <BookingEditPopup booking={selectedBooking} onClose={() => setSelectedBooking(null)} onSaved={() => refetchBookings()} />}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <CalendarSidebar selectedRooms={selectedRooms} toggleRoom={toggleRoom} />
      <main className="overflow-y-hidden h-screen">
        <SidebarTrigger />
        <div className="w-screen h-screen p-4">
          <CalendarControls calendarRef={calendarRef} />
          <FullCalendar
            key={bookings?.length}
            ref={calendarRef}
            headerToolbar={false}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={ptBrLocale}
            weekends
            selectable
            select={info => {
              setSelectDate(info);
            }}
            height="800px"
            //SLOT
            slotMinTime="08:00:00"
            slotMaxTime="23:59:00"
            slotDuration="01:00:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit"
            }}
            slotLabelContent={arg => <SlotLabel item={arg} />}
            //EVENT

            events={events}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: "short"
            }}
            eventContent={arg => <EventItem item={arg} onSelect={setSelectedBooking} />}
            eventDrop={info => handleDrag(info)}
            eventResize={info => handleResize(info)}
            eventResizableFromStart
            datesSet={arg => {
              setCurrentDate(arg.start);
            }}
            editable
            dayCellContent={arg => <DayItem item={arg} />}
            dayHeaderContent={arg => <CustomDayHeader item={arg} />}
            allDaySlot={false}
          />

          {selectDate && <BookingAdd start={selectDate.start} end={selectDate.end} onClose={() => setSelectDate(null)} onSaved={() => refetchBookings()} />}
          {selectedBooking && <BookingEdit booking={selectedBooking} onClose={() => setSelectedBooking(null)} onSaved={() => refetchBookings()} />}
        </div>
      </main>
    </SidebarProvider>
  );
}

function CustomDayHeader({ item }: { item: DayHeaderContentArg }) {
  const [dayLabel, datePart] = item.text.split(" "); // ['dom.', '04/05']
  const day = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1); // Dom.
  const dayNumber = datePart?.split("/")[0]; // 04

  const cellDate = item.date;
  const today = new Date();
  const isToday = cellDate.getDate() === today.getDate() && cellDate.getMonth() === today.getMonth() && cellDate.getFullYear() === today.getFullYear();

  const numberClass = clsx("text-2xl", {
    "text-amber-500": isToday
  });

  const labelClass = clsx("text-neutral-500", {
    "text-amber-500": isToday,
    "text-xl text-neutral-800": !dayNumber
  });
  const bgClass = clsx("flex flex-col items-center justify-center h-18 w-40 -mb-1", {
    "border-amber-500 border-b-4 flex flex-col items-center justify-center h-18 w-40 -mb-1": isToday
  });

  return (
    <div className={bgClass}>
      <Title className={numberClass}>{dayNumber}</Title>
      <Label className={labelClass}>{day}</Label>
    </div>
  );
}

function SlotLabel({ item }: { item: SlotLabelContentArg }) {
  return (
    <div className="h-20 items-center justify-center  w-20 flex ">
      <span className="text-md text-neutral-400">{item.text}</span>
    </div>
  );
}

function DayItem({ item }: { item: DayCellContentArg }) {
  if (item?.dayNumberText) {
    return (
      <div className="text-2xl text-neutral-600 h-8 w-8 flex justify-center rounded-md items-center bg-blue-50">
        <Title>{item?.dayNumberText}</Title>
      </div>
    );
  }
}

function EventItem({ item, onSelect }: { readonly item: EventContentArg; readonly onSelect: (booking: any) => void }) {
  const booking = item.event.extendedProps.booking;
  return (
    <button onClick={() => onSelect(booking)} style={{ backgroundColor: item?.backgroundColor }} className="rounded-md h-full w-full flex flex-col break-words p-2 cursor-pointer">
      <Title className="break-words truncate whitespace-nowrap text-neutral-900 text-xl ">{booking?.description.length > 20 ? booking?.description.slice(0, 16) + "..." : booking?.description}</Title>
      <Label className="break-words truncate whitespace-nowrap text-neutral-500 text-md">{booking?.room?.name}</Label>
    </button>
  );
}

function CalendarSidebarContent({ selectedRooms, toggleRoom }: { readonly selectedRooms: Set<string>; readonly toggleRoom: (roomId: string) => void }) {
  const [page, setpage] = useState(1);
  const { data: rooms, isLoading } = useQuery({
    queryKey: [`list rooms ${page}`],
    queryFn: async () => {
      return await RoomsService.useList(page);
    },
    placeholderData: previousData => previousData
  });

  if (isLoading) return <span>Carregando...</span>;

  return (
    <div>
      <div className="flex flex-col gap-2 mt-4">
        {rooms?.data?.map(room => {
          const color = getColorFromRoomName(room.name);
          const isChecked = selectedRooms?.size === 0 || selectedRooms.has(room.id);
          return (
            <button key={room.id} className="border-1 rounded-md p-2 transition-all" style={{ borderColor: isChecked ? "#d7d7d7" : "#fff", backgroundColor: isChecked ? "#fff" : "#FFF" }} onClick={() => toggleRoom(room.id)}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox style={{ backgroundColor: color, border: "none", color: "#000" }} checked={isChecked} onCheckedChange={() => toggleRoom(room.id)} />
                <span className="flex items-center gap-2">
                  <span className="text-sm">{room.name}</span>
                </span>
              </label>
            </button>
          );
        })}
      </div>
      <Pagination page={page} setpage={setpage} data={rooms} hideText={true}/>
    </div>
  );
}

export function CalendarSidebar({ selectedRooms, toggleRoom }: { readonly selectedRooms: Set<string>; readonly toggleRoom: (roomId: string) => void }) {
  return (
    <Sidebar>
      <SidebarContent className="bg-background ">
        <SidebarGroup>
          <div className="px-2 py-10">
            <Title className="text-2xl">Salas</Title>
            <CalendarSidebarContent selectedRooms={selectedRooms} toggleRoom={toggleRoom} />
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
