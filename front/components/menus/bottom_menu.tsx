import { m } from "framer-motion";
import { BookCheck, Calendar, ChevronRight, UserPlus, Users, Home, CalendarRange, UserPen, ChartNoAxesGantt } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BottomMenu() {
  const router = useRouter();

  const items = [
    {
      id: 1,
      name: "Reservas",
      icon: <BookCheck size={20} />,
      path: "/dashboard/bookings"
    },
    {
      id: 2,
      name: "Calendário",
      icon: <Calendar size={20} />,
      path: "/calendar"
    },
    {
      id: 3,
      name: "Membros",
      icon: <Users size={20} />,
      path: "/dashboard/members"
    },
    {
      id: 4,
      name: "Usuários",
      icon: <UserPlus size={20} />,
      path: "/dashboard/users"
    },
    {
      id: 5,
      name: "Salas",
      icon: <Home size={20} />,
      path: "/dashboard/rooms"
    },
    {
      id: 6,
      name: "Escalas",
      icon: <CalendarRange size={20} />,
      path: "/dashboard/scales"
    },
    {
      id: 7,
      name: "Perfil",
      icon: <UserPen size={20} />,
      path: "/dashboard/profile"
    },
    {
      id: 8,
      name: "Timelines",
      icon: <ChartNoAxesGantt size={20} />,
      path: "/dashboard/timelines"
    },
    {
      id: 9,
      name: "Início",
      icon: <Home size={20} />,
      path: "/dashboard"
    },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };
  return (
    <div className="py-2 space-y-2">
      {items.map(item => (
        <div className="cursor-pointer border-neutral-200 border-1 flex flex-row px-4 py-3 mx-6 rounded-lg gap-2 justify-between" onClick={() => handleNavigate(item?.path)}>
          <div className="flex flex-row gap-2">
            {item?.icon}
            <span>{item.name}</span>
          </div>
          <ChevronRight />
        </div>
      ))}
    </div>
  );
}
