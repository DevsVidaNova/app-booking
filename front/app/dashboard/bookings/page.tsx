'use client'
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Phone, Trash, User, EllipsisVertical, BookDashed } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Button,
    Skeleton,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui"
import { useQuery } from '@tanstack/react-query'
import { BookingAdd } from '@/components/booking/booking-add';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { BookingEdit } from "@/components/booking/booking-edit";

import { ListBooking } from "@/types";
import { listBookings, listBookingsWeek, listBookingsMy, listBookingsToday, listBookingsMonth, deleteBooking } from '@/services/booking.service';

export default function BookingsPage() {
    const {
        data: allBookingsData,
        isLoading: isLoadingAll,
        error: errorAll,
        refetch: refetchAll
    } = useQuery({
        queryKey: ['all-bookings'],
        queryFn: async () => {
            try {
                const [all, my, monthly, weekly, today] = await Promise.all([
                    listBookings(),
                    listBookingsMy(),
                    listBookingsMonth(),
                    listBookingsWeek(), 
                    listBookingsToday()
                ]);
                
                return {
                    bookings: all,
                    mybookings: my,
                    month: monthly,
                    weekbookings: weekly,
                    todaybookings: today
                };
            } catch (error) {
                console.error('Error fetching bookings:', error);
                throw error;
            }
        }
    });

    const {
        bookings = [],
        mybookings = [],
        month = [],
        weekbookings = [],
        todaybookings = []
    } = allBookingsData || {};

    const refetch = () => refetchAll();
    const myrefetch = refetch;
    const monthrefetch = refetch;
    const weekrefetch = refetch;
    const todayrefetch = refetch;


    return (
        <div className="z-0 mx-auto py-6 container">
            <Tabs defaultValue="semana" className="w-full px-3">
                <div className='justify-between flex-row flex w-full'>
                    <div className='flex-row flex gap-2 mx-auto md:mx-1'>
                        <TabsList>
                            <TabsTrigger value="semana" >Semana</TabsTrigger>
                            <TabsTrigger value="mes" >Mês</TabsTrigger>
                            <TabsTrigger value="tudo" >Tudo</TabsTrigger>
                            <TabsTrigger value="my" >Minhas reservas</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="md:block hidden">
                        <BookingAdd refetch={refetch} />
                    </div>
                </div>
                <TabsContent value="hoje">
                    <BookingList refetch={todayrefetch} data={todaybookings || []} />
                </TabsContent>
                <TabsContent value="semana">
                    {isLoadingAll ? <SkeletonBookings /> : <BookingList refetch={weekrefetch} data={weekbookings || []} />}
                </TabsContent>
                <TabsContent value="mes">
                    <BookingList refetch={monthrefetch} data={month || []} />
                </TabsContent>
                <TabsContent value="tudo">
                    <BookingList refetch={refetch} data={bookings || []} />
                </TabsContent>
                <TabsContent value="my">
                    <BookingList refetch={myrefetch} data={mybookings || []} />
                </TabsContent>
            </Tabs>
            <div style={{ height: 150, }}></div>
            <div style={{ position: 'fixed', bottom: 50, left: '50%', transform: 'translateX(-50%)' }} className='justify-center items-center md:hidden'>
                <BookingAdd refetch={refetch} />
            </div>
        </div>
    )
}

const BookingList = ({ data, refetch, }: { data: ListBooking[], refetch: () => void, }) => {
    if (data?.length === 0) return <div className='flex flex-row items-center gap-6 border p-6 justify-center rounded-xl my-6'>
        <div className='flex flex-col justify-center items-center gap-2'>
            <BookDashed size={64} />
            <h2 className='text-[24px] font-bold text-center' style={{ lineHeight: 1, }}>Não encontramos nenhuma reserva</h2>
            <span className='opacity-70 text-[18px] text-center'>Sem reservas criadas por enquanto...</span>
        </div>
    </div>
    const handleExclude = async (id: any) => {
        try {
            await deleteBooking(id);
            refetch()
        } catch (error) {
            console.log(error)
        }
    }
    if (!data) return <div>Carregando...</div>
    return (
        <div className='gap-8'>
            {data?.map((booking: ListBooking) => {
                const { end_time, start_time, room, user, date, id, description, repeat,  day_of_week, month } = booking;
                const repeats = [{ id: 'day', name: 'DIA' }, { id: 'week', name: 'SEM' }, { id: 'month', name: 'MÊS' }];
                const repeatName = repeats.find((r) => r.id === repeat)?.name;

                return (
                    <Card key={id} className="md:p-2 p-0 flex-row flex align-center justify-between items-center w-full my-4">
                        <div className='flex flex-row items-center gap-2'>
                            <div className='flex-col w-[80px] h-full py-3 flex md:px-6 md:py-2 justify-center items-center border-r'>
                                <span className='md:text-[20px] md:leading-[24px] text-[16px] leading-[16px] font-medium uppercase'>{day_of_week}</span>
                                <span className='md:text-[36px] md:leading-[32px] text-[24px] leading-[26px] font-bold uppercase'>{date ? date?.slice(0, 2) : '↻'}</span>
                                <span className='md:text-[16px] md:leading-[24px] text-[14px] leading-[14px] uppercase'>{month ? month : repeatName}</span>
                            </div>
                            <div className='flex-col h-[100%] flex px-4 py-4 gap-2 justify-center w-[80%]'>
                                <div className='flex-row flex gap-2'>
                                    <div className='flex-row flex gap-2 items-center opacity-70'>
                                        <Clock size={12} />
                                        <span className='text-[12px] md:text-[18px] md:leading-[24px] leading-[12px]'>{start_time} - {end_time}</span>
                                    </div>
                                    <div className='flex-row flex gap-2 items-center opacity-70'>
                                        <User size={12} />
                                        <span className='text-[12px] md:text-[18px] md:leading-[24px] leading-[12px]'>{user?.name?.length > 16 ? user?.name.slice(0, 16) + '...' : user?.name}</span>
                                    </div>
                                </div>
                                <div className='flex-row flex gap-2 items-center opacity-70'>
                                    <MapPin size={12} />
                                    <span className='text-[12px] md:text-[18px] md:leading-[24px] leading-[12px]'>{room?.name} - {description?.length > 24 ? description?.slice(0, 21) + '...' : description}</span>
                                </div>
                            </div>
                        </div>

                        <div className='flex-row  px-4 py-4 ml-2 align-center items-center border-l-2  md:flex hidden'>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-12 w-12">
                                        <Phone className="h-16 w-16" />
                                        <span className="sr-only">Abrir menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Contato</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <a
                                            href={`https://wa.me/55${user?.phone?.replace(/[()\s-]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center"
                                        >
                                            WhatsApp
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <a href={`tel:+55${user?.phone}`} className="flex items-center">
                                            Ligar
                                        </a>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" className="h-12 w-12 mx-2" onClick={() => handleExclude(id)}>
                                <Trash className="h-16 w-16" />
                            </Button>
                            <BookingEdit refetch={refetch} booking={booking} />
                        </div>

                        <div className='md:hidden border w-[46px] mr-2 h-[46px] rounded-lg items-center justify-center flex'>
                            <Popover>
                                <PopoverTrigger>
                                    <EllipsisVertical size={24} />
                                </PopoverTrigger>
                                <PopoverContent className='w-[204px] mr-4'>
                                    <div className='gap-2 flex flex-row items-center justify-center'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="h-12 w-12">
                                                    <Phone className="h-16 w-16" />
                                                    <span className="sr-only">Abrir menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Contato</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <a
                                                        href={`https://wa.me/55${user?.phone?.replace(/[()\s-]/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center"
                                                    >
                                                        WhatsApp
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <a href={`tel:+55${user?.phone}`} className="flex items-center">
                                                        Ligar
                                                    </a>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="outline" className="h-12 w-12" onClick={() => handleExclude(id)}>
                                            <Trash className="h-16 w-16" />
                                        </Button>
                                        <BookingEdit refetch={refetch} booking={booking} />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </Card >
                )
            }
            )}
        </div>

    )
}

const SkeletonBookings = () => {
    return (
        <div className='gap-8 z-0'>
            {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="border rounded-lg flex-row flex justify-between w-full my-4">
                    <div className='flex flex-row w-[100%]'>
                        <div className='flex-col gap-2 w-[80px] h-full py-3 px-3 flex md:px-3 md:py-2  justify-center items-center border-r'>
                            <Skeleton className='h-20 w-full' />
                        </div>
                        <div className='flex-col h-[100%] flex px-4 py-4 gap-2 justify-center w-[80%]'>
                            <div className='flex-col flex gap-4 justify-center'>
                                <div className='flex-row flex gap-4 '>
                                    <Skeleton className='h-8 w-[40%]' />
                                    <Skeleton className='h-8 w-[60%]' />
                                </div>
                                <div className='flex-row flex'>
                                    <Skeleton className='h-6 w-full' />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col border-l'>
                        <div className='flex-row flex px-4 h-full items-center'>
                            <Skeleton className='h-12 w-12 rounded-full' />
                        </div>
                    </div>
                </div>))}
        </div>
    )

}