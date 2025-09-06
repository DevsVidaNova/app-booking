"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"

import {
    Calendar,
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    Input,
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
    Button, Message,
} from "@/components/ui"

import { useQuery } from "@tanstack/react-query"

import { CalendarSearch, CalendarX2, Pencil, } from "lucide-react"


import { ListUser } from "@/types"
import { listUsers } from "@/services/user.service"
import { addScale } from "@/services/scale.service"
import { Combobox } from '@/components/ui/combobox';

const formSchema = z
    .object({
        name: z.string({ required_error: "Por favor, insira um nome para a escala.", }),
        date: z.string({ required_error: "Por favor, insira uma data para a escala.", }),
        direction: z.string({ required_error: "Por favor, insira alguem para dirigir a escala.", }),
        band: z.string().optional(),
        projection: z.string().optional(),
        sound: z.string().optional(),
        light: z.string().optional(),
        transmission: z.string().optional(),
        camera: z.string().optional(),
        live: z.string().optional(),
        training_sound: z.string().optional(),
        photography: z.string().optional(),
        stories: z.string().optional(),
        dynamic: z.string().optional(),
    });


const inputs = [
    {
        name: 'Direção',
        id: 'direction',
    },
    {
        name: 'Banda',
        id: 'band',
    },
    {
        name: 'Projeção',
        id: 'projection',
    },
    {
        name: 'Som',
        id: 'sound',
    },
    {
        name: 'Iluminação',
        id: 'light'
    },
    {
        name: 'Transmissão',
        id: 'transmission',
    },
    {
        name: 'Câmera',
        id: 'camera',
    },
    {
        name: 'Live',
        id: 'live',
    },
    {
        name: 'Treinamento de som',
        id: 'training_sound',
    },
    {
        name: 'Fotografia',
        id: 'photography',
    },
    {
        name: 'Stories',
        id: 'stories',
    },
    {
        name: 'Dinâmica',
        id: 'dynamic',
    },
];

export function ScaleEdit({ id, refetch, defaultValues }: { refetch: () => void, id: string, defaultValues: any }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })
    const [openCalendar, setOpenCalendar] = useState(false);

    const { data: users, error: errorUsers, isLoading, } = useQuery<ListUser[]>({
        queryKey: ['list users'],
        queryFn: listUsers
    });

    const [success, setsuccess] = useState('');
    const [error, seterror] = useState('');



    async function onSubmit(values: z.infer<typeof formSchema>) {
        setsuccess('');
        seterror('');
        try {
            const res = await addScale(values);
            if (res) {
                setsuccess('Reserva feita com sucesso!');
                refetch();
                setTimeout(() => {
                    setsuccess('');
                    seterror('');
                    form.reset();
                }, 2000);
            }
        } catch (error: any) {
            seterror(error.message);
        }
    }

    return (
        <div>
            <Drawer>
                <DrawerTrigger asChild >
                    <Button variant="outline" className="h-12 w-12" >
                        <Pencil className="h-16 w-16" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent >
                    <div className="container mx-auto px-4">
                        <DrawerHeader>
                            <DrawerTitle>Editar escala</DrawerTitle>
                            <DrawerDescription>Preencha os campos abaixo para editar a escala.</DrawerDescription>
                        </DrawerHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Nome da escala *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nome da escala" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 w-full">
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem className="min-w-[170px] max-w-[240px] relative">
                                                    <FormLabel>Data *</FormLabel>
                                                    <div className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <Input
                                                                type="text"
                                                                className="w-full"
                                                                placeholder="dd/mm/yyyy"
                                                                value={field.value || ""}
                                                                onChange={(e) => {
                                                                    let value = e.target.value.replace(/\D/g, "");
                                                                    if (value.length > 8) return;

                                                                    if (value.length > 4) value = value.replace(/^(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
                                                                    else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,2})/, "$1/$2");

                                                                    field.onChange(value);
                                                                }}
                                                                maxLength={10}
                                                            />
                                                        </FormControl>
                                                        <Button type="button" className={`w-[48px] rounded-[6px] h-[48px]`} onClick={() => setOpenCalendar(!openCalendar)}>
                                                            {openCalendar ? <CalendarX2 /> : <CalendarSearch />}
                                                        </Button>
                                                    </div>
                                                    {openCalendar && (
                                                        <div className="absolute z-10 -left-[86px] top-[80px] bg-white shadow-md rounded">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value ? new Date(field.value) : undefined}
                                                                onSelect={(date) => {
                                                                    if (date) {
                                                                        const formattedDate = format(date, "dd/MM/yyyy");
                                                                        field.onChange(formattedDate);
                                                                    }
                                                                    setOpenCalendar(false);
                                                                }}
                                                                initialFocus
                                                            />
                                                        </div>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                    {inputs.map((input: any) => (
                                        <FormField
                                            key={input.id}
                                            control={form.control}
                                            name={input.id}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{input.name}</FormLabel>
                                                    <Combobox
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        placeholder="Selecione uma pessoa"
                                                        options={users || []}
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                                <DrawerFooter>
                                    <div className="flex flex-col w-full gap-4">
                                        <Message success={success} error={error} />
                                        <Button>
                                            <button type="submit" style={{ flexGrow: 1, padding: '25px 40px', borderRadius: 100 }}>Salvar escala</button>
                                        </Button>
                                        <DrawerClose>
                                            <Button variant="secondary" className="w-full">Fechar</Button>
                                        </DrawerClose>
                                    </div>
                                </DrawerFooter>
                            </form>
                        </Form>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

