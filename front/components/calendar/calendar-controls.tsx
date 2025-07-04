import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Title } from "../ui";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CalendarControls({ calendarRef }: { calendarRef: any }) {
  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();
  const handleChangeView = (view: string) =>
    calendarRef.current?.getApi().changeView(view);
  const handleNewBooking = () => console.log("new booking");

  const currentDate = calendarRef.current?.getApi().getDate();
  const formatDateToLong = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  };
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const formatted = currentDate
    ? capitalize(formatDateToLong(currentDate))
    : "";

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2 items-center">
        <Tabs defaultValue="month">
          <TabsList>
            <TabsTrigger
              value="month"
              onClick={() => handleChangeView("dayGridMonth")}>
              Mês
            </TabsTrigger>
            <TabsTrigger
              value="week"
              onClick={() => handleChangeView("timeGridWeek")}>
              Semana
            </TabsTrigger>
            <TabsTrigger
              value="day"
              onClick={() => handleChangeView("timeGridDay")}>
              Dia
            </TabsTrigger>
            <TabsTrigger value="today" onClick={handleToday}>
              Hoje
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Title className="font-light text-2xl">{formatted}</Title>
      <div className="flex gap-4">
        <div className="flex items-center border-2 rounded-2xl border-gray-200 text-muted-foreground transition-shadow duration-200 hover:shadow-md hover:text-gray-600">
          <button
            onClick={handlePrev}
            className="w-12 h-8 flex items-center justify-center cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <div className="h-full w-0.5 bg-gray-300" />
          <button
            onClick={handleNext}
            className="w-12 h-8 flex items-center justify-center cursor-pointer">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
