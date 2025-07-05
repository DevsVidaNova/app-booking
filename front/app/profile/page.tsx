"use client"
import { useEffect, useState } from 'react' 
import { useQuery } from '@tanstack/react-query'
import { ListUser } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Message, Button, Input, } from "@/components/ui/"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { User } from 'lucide-react';

import { editUser, profileUser, } from '@/services/user.service';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 palavras.",
  }),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, {
    message: "Informe um número de celular válido com DDD e 11 dígitos.",
  }),
})

export default function Profile() {

  const [success, setsuccess] = useState('');
  const [error, seterror] = useState('');
  const { data: user, error: isError, isLoading, } = useQuery<any>({
    queryKey: ['user profile'],
    queryFn: profileUser
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    seterror('')
    setsuccess('')
    try {
      const response: any = await editUser(values)
      console.log(response)
      setsuccess(response?.message)
    } catch (error: any) {
      console.log(error)
      seterror(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      form.setValue('name', user?.name || '')
      form.setValue('phone', user?.phone || '')
    }
  }, [user, form])

  if (isLoading) return <p>Carregando...</p>
  if (isError) return <p>Erro ao carregar usuários</p>

  return (
    <div className=''>
      <div className="flex flex-col py-4">
        <div className='w-[124px] h-[124px] items-center justify-center bg-[#303030] flex flex-col rounded-full self-center'>
          <User size={52} color='#fff' />
        </div>
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
            <div className="flex flex-col w-full gap-4">
              <Message  success={success} error={error} />
              <Button>
                <button type="submit" >Salvar alterações</button>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>

  )
}


