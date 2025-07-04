'use client'
import { useState } from 'react';
import { Card } from "./ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Booking } from "./types";
import { Calendar, Clock, MapPin, Phone, Trash } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useQuery } from '@tanstack/react-query'
import { BookingForm } from './booking-form';
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { deleteBooking, listBookings } from '@/app/__api/booking';

export function UserList({ logged, admin = false }: { logged: boolean, admin: boolean }) {
    const { data: bookings, error, isLoading, refetch } = useQuery({
        queryKey: ['bookings list'],
        queryFn: async () => {
            const res = await listBookings();
            return res;
        },
    });
    const [local, setLocal] = useState(false);
    const [selectLocate, setselectLocate] = useState();

    const todayDate = new Date().toISOString().split('T')[0];
    const todayBookings = bookings?.filter((booking: Booking) => booking.date === todayDate);

    const currentWeekBookings = bookings ? bookings.filter((booking: Booking) => { const now = new Date(); const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); if (!booking.date) return false; const bookingDate = new Date(booking.date); return bookingDate >= startOfWeek && bookingDate <= endOfWeek; }) : [];

    const locateBookings = bookings?.filter((booking: Booking) => booking.room === selectLocate);

    if (!logged) {
        return <div className='flex flex-row items-center gap-6 border-2 p-6 rounded-xl my-6'>
            <div className='hidden md:block'>
                <div className='w-[124px] h-[124px] bg-gray-200 flex-col justify-center items-center rounded-full flex'>
                    <Calendar size={46} />
                </div>
            </div>
            <div className='flex flex-col'>
                <h2 className='text-[24px]  font-bold' style={{ lineHeight: 1, }}>Faça login para reservar</h2>
                <span className='opacity-70 text-[18px]'>Faça login para fazer uma reserva</span>
            </div>
        </div>
    }
    if (isLoading) {
        return <div>Carregando reservas aguarde...</div>
    }
    if (error) {
        return <div>Error: {error.message}</div>
    }
    return (
        <div>
            <Tabs defaultValue="semana" className="w-full">
                <div className='justify-between flex-row flex w-full'>
                    <div className='flex-row flex gap-2'>
                        <TabsList>
                            <TabsTrigger value="hoje" onClick={() => { setLocal(false) }}>Para hoje</TabsTrigger>
                            <TabsTrigger value="semana" onClick={() => { setLocal(false) }}>Esta semana</TabsTrigger>
                            <TabsTrigger value="tudo" onClick={() => { setLocal(false) }}>Tudo</TabsTrigger>
                            <TabsTrigger className='md:block hidden' value="local" onClick={() => { setLocal(true) }}>Por sala</TabsTrigger>
                        </TabsList>
                        {local &&
                            <div>
                                <Select onValueChange={(value: any) => setselectLocate(value)} >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma sala" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Estúdio">Estúdio</SelectItem>
                                        <SelectItem value="Espaço Multiuso">Espaço Multiuso</SelectItem>
                                        <SelectItem value="Sala de aula - 1">Sala de aula - 1</SelectItem>
                                        <SelectItem value="Sala de aula - 2">Sala de aula - 2</SelectItem>
                                        <SelectItem value="Sala de aula - 3">Sala de aula - 3</SelectItem>
                                        <SelectItem value="Cozinha">Cozinha</SelectItem>
                                        <SelectItem value="Templo">Templo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>}
                    </div>
                    <div className='md:block hidden'>
                        {logged ?
                            <BookingForm refetch={refetch} /> :
                            <Link href="/auth/login">
                                <Button variant="default" style={{ flexGrow: 1, padding: '25px 40px', borderRadius: 100 }}>Fazer Reserva</Button>
                            </Link>
                        }
                    </div>
                </div>
                <TabsContent value="hoje">
                    <AvaliableDays data={todayBookings} refetch={refetch} admin={admin} />
                </TabsContent>
                <TabsContent value="semana">
                    <AvaliableDays data={currentWeekBookings} refetch={refetch} admin={admin} />
                </TabsContent>
                <TabsContent value="tudo">
                    <AvaliableDays data={bookings} refetch={refetch} admin />
                </TabsContent>
                <TabsContent value="local">
                    <AvaliableDays data={locateBookings} refetch={refetch} admin={admin} />
                </TabsContent>
            </Tabs>
            <div style={{ height: 150, }}></div>

            <div style={{ position: 'fixed', bottom: 50, left: '50%', transform: 'translateX(-50%)' }} className='justify-center items-center md:hidden'>
                {logged ?
                    <BookingForm refetch={refetch} /> :
                    <Link href="/auth/login">
                        <Button variant="default" style={{ flexGrow: 1, padding: '25px 40px', borderRadius: 100 }}>Fazer Reserva</Button>
                    </Link>
                }
            </div>
        </div>
    )
}

const AvaliableDays = ({ data, refetch, admin }: { data: any, refetch: () => void, admin: boolean }) => {

    if (data?.length === 0) return <div className='flex flex-row items-center gap-6 border-2 p-6 rounded-xl my-6'>
        <div className='hidden md:block'>
            <div className='w-[124px] h-[124px] bg-gray-200 flex-col justify-center items-center rounded-full flex'>
                <Calendar size={46} />
            </div>
        </div>
        <div className='flex flex-col'>
            <h2 className='text-[24px]  font-bold' style={{ lineHeight: 1, }}>Não encontramos nenhuma reserva</h2>
            <span className='opacity-70 text-[18px]'>Sem reservas por enquanto...</span>
        </div>
    </div>

    const handleExcludeBooking = async (id: string) => {
        console.log(id)
        try {
            const res = await deleteBooking(id);
            refetch()
        } catch (error) {
            console.log(error)
        }
    }

    if (!data) return <div>Carregando...</div>
    return (
        <div className='gap-8'>
            {data?.map((booking: Booking) => { 
                const { endTime, startTime, room, user, date, _id, description } = booking
                const colorsAvatar = [
                    { text: '#fff', bg: '#AF34BF' },
                    { text: '#fff', bg: '#DA541E' },
                    { text: '#000', bg: '#F2BE22' },
                    { text: '#fff', bg: '#1B21A6' },
                    { text: '#fff', bg: '#FF5733' },
                    { text: '#FFF', bg: '#32a881' },
                    { text: '#fff', bg: '#900C3F' },
                    { text: '#fff', bg: '#6fd1b1' },
                    { text: '#000', bg: '#dd88e3' },
                    { text: '#000', bg: '#d8e388' },
                    { text: '#fff', bg: '#9da1ed' },
                    { text: '#fff', bg: '#ed9db0' },
                ]
                const randomColor = colorsAvatar[Math.floor(Math.random() * colorsAvatar.length)];
                const [year, month, day] = (date?.split('-') || ['0000', '00', '00']);
                const formattedDate = `${year}-${month}-${day}`;

                const timeStart = new Date(startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const timeEnd = new Date(endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const dayOfWeek = new Date(formattedDate).toLocaleDateString('pt-BR', { weekday: 'long' });

                return (
                    <Card key={_id} className="md:p-2 p-0 flex-row flex align-center justify-between items-center w-full my-4">
                        <div className='flex-col w-[80px] flex md:px-6 md:py-2 px-4 py-2 justify-center items-center border-r-2'>
                            <span className='md:text-[18px]  md:leading-[24px] text-[16px]  leading-[16px] uppercase sm:text-[12px]'>{dayOfWeek.slice(0, 3)}</span>
                            <span className='md:text-[36px] font-bold md:leading-[36px] text-[24px] leading-[24px] font-medium '>{day}</span>
                        </div>
                        <div className='flex-col flex px-2 py-4 gap-2 sm:px-0 sm:py-0'>
                            <div className='flex-row flex gap-2 items-center'>
                                <Clock size={18} />
                                <span className='text-[12px] md:text-[18px] md:leading-[24px] leading-[12px]'>{timeStart} - {timeEnd}</span>
                            </div>
                            <div className='flex-row flex gap-2 items-center'>
                                <MapPin size={18} />
                                <span className='text-[12px] md:text-[18px] md:leading-[24px] leading-[12px]'>{room} - {description?.length > 24 ? description?.slice(0, 21) + '...' : description}</span>
                            </div>
                        </div>


                        <div className='flex-row flex px-4 py-4 gap-4 align-center items-center border-l-2'>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div style={{ backgroundColor: randomColor?.bg, width: 46, height: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 100, flexDirection: 'column', display: 'flex' }}>
                                        <span style={{ color: randomColor?.text, }} className='font-bold uppercase'>{user?.name?.slice(0, 2)}</span>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <span>{user?.name}</span>
                                </DropdownMenuContent>
                            </DropdownMenu>

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
                            {admin &&
                                <Button variant="outline" className="h-12 w-12" onClick={() => handleExcludeBooking(_id)}>
                                    <Trash className="h-16 w-16" />
                                </Button>}
                        </div>
                    </Card >
                )
            }
            )}
        </div>

    )
}
/*
<div className='p-2 items-center'>
<span className='text-[18px] font-semibold'>Sobre</span>
<p className='text-[14px] opacity-70'>Descrição</p>
</div>
*/