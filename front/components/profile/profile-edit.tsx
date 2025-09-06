"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Save, X } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Button, Input } from "@/components/ui";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 palavras.",
  }),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, {
    message: "Informe um número de celular válido com DDD e 11 dígitos.",
  }),
});

export function ProfileEdit() {
  const { data: user, isLoading, isError } = AuthService.useProfile();
  const updateMutation = AuthService.useUpdateProfile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("name", user?.name || "");
      form.setValue("phone", user?.phone || "");
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.id) {
      toast.error("ID do usuário não encontrado");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: values,
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto">
        <div className="w-32 h-32 items-center justify-center bg-[#303030] flex flex-col rounded-full mx-auto mb-6">
          <User size={52} color="#fff" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto">
        <div className="w-32 h-32 items-center justify-center bg-red-100 flex flex-col rounded-full mx-auto mb-6">
          <X size={52} color="#ef4444" />
        </div>
        <p className="text-center text-red-500">Erro ao carregar perfil</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <div className="w-32 h-32 items-center justify-center bg-gray-100 flex flex-col rounded-full mx-auto mb-6">
          <User size={52} color="#6b7280" />
        </div>
        <p className="text-center text-gray-500">Nenhum usuário encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="w-32 h-32 items-center justify-center bg-[#303030] flex flex-col rounded-full mx-auto mb-6">
        <User size={52} color="#fff" />
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
                        .slice(0, 15);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
