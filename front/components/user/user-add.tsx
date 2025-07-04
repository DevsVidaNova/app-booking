"use client"
import { useState } from "react"
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
    Message,
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/"
import { addUser } from "@/services/user.service"

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
    password: z.string().min(6, {
        message: "A senha deve ter pelo menos 6 caracteres.",
    }),
    role: z.string().optional(),
})

export function UserAddForm({ refetch }: { refetch: () => void }) {
    const [error, seterror] = useState('');
    const [success, setsuccess] = useState('');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        seterror('')
        setsuccess('')
        console.log(values)
        try {
            const response = await addUser(values)
            if (response) {
                setsuccess('Usuário criado com sucesso!')
                form.reset()
                refetch()
            }
        } catch (error: any) {
            seterror(error.message)
        }
    }

    return (
        <div>
            <Drawer>
                <DrawerTrigger asChild >
                    <Button variant="default">Criar usuário</Button>
                </DrawerTrigger>
                <DrawerContent >
                    <div className="container mx-auto px-4">
                        <DrawerHeader>
                            <DrawerTitle>Criar usuário</DrawerTitle>
                            <DrawerDescription>Preencha os dados do usuário para continuar.</DrawerDescription>
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
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Senha" {...field} />
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
                                            <button type='submit' className="text-[18px] font-semibold py-6 rounded-full w-full cursor-pointer">Criar usuário</button>
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

