"use client";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Drawer, Message, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, Input, Checkbox, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Button } from "@/components/ui/";

import { RoomsService } from "@/services/rooms.service";
import { Pencil } from "lucide-react";
import { toast } from 'sonner';

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "O nome da sala deve ter pelo menos 2 caracteres." }),
  size: z.number().min(1, { message: "A sala deve comportar pelo menos 1 pessoa." }),
  description: z.string().min(3, { message: "A descrição deve ter pelo menos 3 caracteres." }),
  exclusive: z.boolean(),
  status: z.boolean()
});

export function RoomEditForm({ id, defaultValues }: { id: string; defaultValues: any }) {
  const [open, setOpen] = useState(false);
  const updateMutation = RoomsService.useUpdate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: id,
      name: "",
      size: 1,
      description: "",
      exclusive: false,
      status: false
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.setValue("name", defaultValues.name);
      form.setValue("size", parseInt(defaultValues.size));
      form.setValue("description", defaultValues.description);
      form.setValue("exclusive", defaultValues.exclusive);
      form.setValue("status", defaultValues.status);
    }
  }, [defaultValues, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateMutation.mutateAsync({ id, data: values });
      toast.success("Sala editada com sucesso!");
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 w-10 p-0">
            <Pencil size={16} />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="container mx-auto px-4">
            <DrawerHeader>
              <DrawerTitle>Editar Sala</DrawerTitle>
              <DrawerDescription>Preencha os dados da sala e clique em salvar.</DrawerDescription>
            </DrawerHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
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
                        <Input type="number" placeholder="Quantidade de pessoas" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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

                <FormField
                  control={form.control}
                  name="exclusive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Exclusiva</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Ativa</FormLabel>
                    </FormItem>
                  )}
                />

                <DrawerFooter className="border-t-2 pt-[16px]">
                  <div className="flex flex-col w-full gap-4">
                    <Button type="submit" disabled={updateMutation.isPending} className="text-[18px] font-semibold py-6 rounded-full w-full">
                      {updateMutation.isPending ? "Salvando..." : "Salvar sala"}
                    </Button>
                    <DrawerClose>
                      <Button variant="secondary" className="w-full">
                        Fechar
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
