"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import {
    Drawer,Message,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    Input,
    
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
    Button
} from "@/components/ui/"

import { addRoom } from "@/services/rooms.service"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "O nome da sala deve ter pelo menos 2 caracteres.",
    }),
    size: z.number().min(1, {
        message: "A sala deve comportar pelo menos 1 pessoa.",
    }),
    description: z.string().min(5, {
        message: "A descrição deve ter pelo menos 5 caracteres.",
    }),
    exclusive: z.boolean(),
    status: z.boolean(),
})

export function RoomAddForm({ refetch }: { refetch: () => void }) {
    const [open, setOpen] = useState(false)
    const [success, setsuccess] = useState('');
    const [error, seterror] = useState('');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            size: 1,
            description: "",
            exclusive: false,
            status: true,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        seterror('')
        setsuccess('')
        try {
            const response = await addRoom(values)
            if (response) {
                setsuccess('Sala criada com sucesso!')
                refetch()
                setTimeout(() => {
                    setOpen(false)
                }, 1500);
            }
        } catch (error: any) {
            seterror(error.message)
        }
    }

    return (
        <div>
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="default" >Criar Sala</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="container mx-auto px-4">
                        <DrawerHeader>
                            <DrawerTitle>Criar Sala</DrawerTitle>
                            <DrawerDescription>Preencha os dados da sala para continuar.</DrawerDescription>
                        </DrawerHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome da Sala</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome da sala" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="size"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Capacidade</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Quantidade de pessoas" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Descrição da sala" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="exclusive" render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel>Exclusiva</FormLabel>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="">Ativa</FormLabel>
                                    </FormItem>
                                )} />
                                <DrawerFooter className="border-t-2 pt-[16px]">
                                    <div className="flex flex-col w-full gap-4">
                                        <Message success={success} error={error} />
                                        <Button>
                                            <button type="submit" className="text-[18px] font-semibold py-6 rounded-full w-full">Criar Sala</button>
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
