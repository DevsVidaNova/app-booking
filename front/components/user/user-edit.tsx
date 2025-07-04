"use client"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
    Button,
    Input,
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Message,
} from "@/components/ui/"

import { Pencil } from "lucide-react"
import { editUser } from "@/services/admin.service"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "O nome deve ter pelo menos 2 palavras.",
    }),
    phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, {
        message: "Informe um número de celular válido com DDD e 11 dígitos.",
    }),
    email: z.string().email({
        message: "Informe um e-mail válido.",
    }),
    role: z.string().optional(),
})

export function UserEditForm({ id, refetch, defaultValue }: { id: string, refetch: () => void, defaultValue: any }) {
    const [success, setsuccess] = useState('');
    const [error, seterror] = useState('');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
        },
    })
    useEffect(() => {
        if (defaultValue) {
            form.setValue('name', defaultValue.name)
            form.setValue('phone', defaultValue.phone)
            form.setValue('email', defaultValue.email)
            form.setValue('role', defaultValue.role)
        }
    }, [defaultValue])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        seterror('')
        setsuccess('')
        try {
            const response = await editUser(id, values)
            if (response) {
                setsuccess('Usuário editado com sucesso!')
                refetch()
            }
        } catch (error: any) {
            seterror(error.message)
        }
    }

    return (
        <div>
            <Drawer >
                <DrawerTrigger asChild >
                    <Button variant='outline' className='w-[38px] h-[42px] rounded-lg'>
                        <Pencil size={24} />
                    </Button>
                </DrawerTrigger>
                <DrawerContent >
                    <div className="container mx-auto px-4">
                        <DrawerHeader>
                            <DrawerTitle>Editar usuário</DrawerTitle>
                            <DrawerDescription>Preencha os dados do usuário e clique em salvar.</DrawerDescription>
                        </DrawerHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome Completo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nome completo" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Celular (com DDD)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="(47) 99123-4567"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                            .replace(/\D/g, "")
                                                            .replace(/^(\d{2})(\d)/g, "($1) $2")
                                                            .replace(/(\d{5})(\d)/, "$1-$2")
                                                            .slice(0, 15)
                                                        field.onChange(value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail</FormLabel>
                                            <FormControl>
                                                <Input placeholder="E-mail" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cargo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="User ou admin" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DrawerFooter className="border-t-2 pt-[16px] ">
                                    <div className="flex flex-col w-full gap-4">
                                        <Message success={success} error={error} />
                                        <Button>
                                            <button type='submit' className="text-[18px] font-semibold py-6 rounded-full w-full">Salvar usuário</button>
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

