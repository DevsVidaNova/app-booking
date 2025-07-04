"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Button,
    Input,
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
    Message,
    Form,
    FormControl,
    FormField,
    FormItem,
    Checkbox,
    FormMessage,
    FormLabel,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/";
import { editMember } from "@/services/members.service";
import { Check, Pencil } from "lucide-react";

const formSchema = z.object({
    full_name: z.string().min(2, "O nome completo deve ter pelo menos 2 caracteres."),
    birth_date: z.string().nonempty("A data de nascimento é obrigatória."),
    gender: z.enum(["Masculino", "Feminino", "Outro"]),
    cpf: z.string().nonempty("O CPF é obrigatório."),
    rg: z.string().nonempty("O RG é obrigatório."),
    phone: z.string().nonempty("O número de telefone é obrigatório."),
    email: z.string().email("Insira um e-mail válido."),
    street: z.string().nonempty("O nome da rua é obrigatório."),
    number: z.string().nonempty("O número da residência é obrigatório."),
    neighborhood: z.string().nonempty("O bairro é obrigatório."),
    city: z.string().nonempty("A cidade é obrigatória."),
    state: z.string().nonempty("O estado é obrigatório."),
    cep: z.string().nonempty("O CEP é obrigatório."),
    mother_name: z.string().nonempty("O nome da mãe é obrigatório."),
    father_name: z.string().nonempty("O nome do pai é obrigatório."),
    marital_status: z.enum(["Solteiro", "Casado", "Viúvo", "Divorciado"]),
    has_children: z.boolean(),
    children_count: z.number().min(0, "A quantidade de filhos não pode ser negativa."),
});

export function MemberEditForm({ id, refetch, defaultValues }: { id: string, refetch: () => void, defaultValues: any }) {
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    });

    const handleCEP = () => {
        const cep = form.getValues("cep");
        if (cep?.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then((response) => response.json())
                .then((data) => {
                    form.setValue("street", data.logradouro);
                    form.setValue("neighborhood", data.bairro);
                    form.setValue("city", data.localidade);
                    form.setValue("state", data.uf);
                }).catch((error) => {
                    console.error(error);
                });
        }
    }

    useEffect(() => {
        handleCEP();
    }, [form.getValues("cep")]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('abriu')
        setError("");
        setSuccess("");
        console.log(values);
        try {
            const response = await editMember(id, values);
            if (response) {
                setSuccess("Membro editado com sucesso!");
                form.reset();
                refetch();
            }
        } catch (error: any) {
            console.log(error)
            setError(error.message);
        }
    }


    const hasChildren = form.watch("has_children");

    const handlePrevious = () => {
        if (step === 1) return
        setStep(step - 1);
    }
    const handleNext = () => {
        if (step === 3) {
            form.handleSubmit(onSubmit)();
            return
        } else if (step < 3) {
            setStep(step + 1);
        }
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant='outline' className='w-[38px] h-[42px] rounded-lg'>
                    <Pencil size={24} />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="container mx-auto px-4">
                    <DrawerHeader>
                        <DrawerTitle>Editar membro</DrawerTitle>
                        <DrawerDescription>Preencha os dados do membro para continuar.</DrawerDescription>
                    </DrawerHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <Steps step={step} setstep={setStep} />

                            {step === 1 && (
                                <>
                                    <div className="flex-row flex gap-8">
                                        <FormField
                                            control={form.control} name="full_name" render={({ field }) => (
                                                <FormItem className="w-1/2">
                                                    <FormControl>
                                                        <Input label="Nome Completo" placeholder="Nome completo" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem className="w-1/2">
                                                    <div>
                                                        <FormLabel className="mb-4">Gênero</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Select {...field} value={field.value} onValueChange={field.onChange} >
                                                            <SelectTrigger className="w-1/2">
                                                                <SelectValue placeholder="Selecione o Gênero" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Masculino">Masculino</SelectItem>
                                                                <SelectItem value="Feminino">Feminino</SelectItem>
                                                                <SelectItem value="Outro">Outro</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="flex-row flex gap-8">
                                        <FormField
                                            control={form.control}
                                            name="birth_date"
                                            render={({ field }) => (
                                                <FormItem className="w-1/2">
                                                    <FormControl>
                                                        <Input
                                                            label="Data de nascimento"
                                                            placeholder="DD/MM/AAAA"
                                                            maxLength={10}
                                                            {...field}
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                    .replace(/\D/g, "")
                                                                    .replace(/(\d{2})(\d)/, "$1/$2")
                                                                    .replace(/(\d{2})(\d)/, "$1/$2")
                                                                    .slice(0, 10);
                                                                field.onChange(value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem className="w-1/2">
                                                    <FormControl>
                                                        <Input
                                                            label="Telefone"
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
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        label="E-mail"
                                                        placeholder="E-mail" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex-row flex gap-8">
                                        <FormField
                                            control={form.control}
                                            name="rg"
                                            render={({ field }) => (
                                                <FormItem className="w-1/2" >
                                                    <FormControl>
                                                        <Input
                                                            placeholder="12.345.678-9"
                                                            {...field}
                                                            label="RG"
                                                            maxLength={12}
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                    .replace(/\D/g, "")
                                                                    .replace(/(\d{2})(\d)/, "$1.$2")
                                                                    .replace(/(\d{3})(\d)/, "$1.$2")
                                                                    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                                                                field.onChange(value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="cpf"
                                            render={({ field }) => (
                                                <FormItem className="w-1/2">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="123.456.789-01"
                                                            {...field}
                                                            maxLength={14}
                                                            label='CPF'
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                    .replace(/\D/g, "")
                                                                    .replace(/(\d{3})(\d)/, "$1.$2")
                                                                    .replace(/(\d{3})(\d)/, "$1.$2")
                                                                    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                                                                field.onChange(value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>)}
                                        />
                                    </div>
                                </>
                            )}
                            {step === 2 && (
                                <>
                                    <div className="flex-row flex gap-8">
                                        <FormField control={form.control} name="cep" render={({ field }) => (
                                            <FormItem className="w-1/2">
                                                <FormControl>
                                                    <Input
                                                        label="CEP"
                                                        placeholder="XXXXXXXX"
                                                        maxLength={8}
                                                        {...field}
                                                    />

                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />


                                        <FormField
                                            control={form.control} name="state" render={({ field }) => (
                                                <FormItem className="w-1/2">
                                                    <FormControl>
                                                        <Input label="Estado" placeholder="Estado" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                    </div>
                                    <FormField
                                        control={form.control} name="city" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input label="Cidade" placeholder="Cidade" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control} name="neighborhood" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input label="Bairro" placeholder="Bairro" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex-row flex gap-8">

                                        <FormField
                                            control={form.control} name="street" render={({ field }) => (
                                                <FormItem className="w-1/2">
                                                    <FormControl>
                                                        <Input label="Endereço" placeholder="Rua" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control} name="number" render={({ field }) => (
                                                <FormItem className="w-1/2">
                                                    <FormControl>
                                                        <Input label="Número" placeholder="Número" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <FormField control={form.control} name="mother_name" render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    label="Nome da Mãe"
                                                    placeholder="Nome da Mãe"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="father_name" render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    label="Nome do Pai"
                                                    placeholder="Nome do Pai"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />


                                    <div className="flex flex-row gap-6">
                                        <FormField control={form.control} name="marital_status" render={({ field }) => (
                                            <FormItem className="w-1/2">
                                                <div>
                                                    <FormLabel className="mb-4">Estado Cívil</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Select {...field} value={field.value} onValueChange={field.onChange} >
                                                        <SelectTrigger className="w-1/2">
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Solteiro">Solteiro</SelectItem>
                                                            <SelectItem value="Casado">Casado</SelectItem>
                                                            <SelectItem value="Viúvo">Viúvo</SelectItem>
                                                            <SelectItem value="Divorciado">Divorciado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                        />

                                        <FormField control={form.control} name="has_children" render={({ field }) => (

                                            <FormItem className="w-1/2">
                                                <div>
                                                    <FormLabel className="mb-4">Tem filhos</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>

                                        )} />
                                    </div>

                                    {hasChildren && (
                                        <FormField control={form.control} name="children_count" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        label="Quantidade de filhos"
                                                        placeholder="2"
                                                        {...field}
                                                        maxLength={2}
                                                        type="number"
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value, 10)
                                                            field.onChange(value);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    )}


                                </>
                            )}

                            <Message success={success} error={error} />
                            <div className="flex gap-2 pt-6 mt-6 border-t">
                                <Button onClick={handlePrevious} className="w-full bg-black">Voltar</Button>
                                <Button onClick={handleNext} className="w-full">Próximo</Button>
                            </div>
                        </form>
                    </Form>
                    <DrawerClose className="w-full my-4">
                        <Button variant="secondary" className="w-full">Fechar</Button>
                    </DrawerClose>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

const Steps = ({ step, setstep }: { step: number, setstep: any }) => {
    return (
        <div className="flex flex-row gap-4 w-full items-center justify-between border-b pb-4">
            <div onClick={() => setstep(1)} className="text-center cursor-pointer items-center flex justify-center flex-col w-30  rounded-2xl p-6">
                <div className={`w-12 h-12 rounded-full text-center justify-center items-center flex text-xl ${step == 1 ? 'bg-blue-200 text-blue-600' : step > 1 ? 'bg-green-500' : 'bg-gray-200'}`}>{step > 1 ? <Check className="text-white" size={28} /> : '1'}</div>
            </div>
            <div className="w-full h-[1px] bg-border  -mx-4" />
            <div onClick={() => setstep(2)} className="text-center cursor-pointer items-center flex justify-center flex-col w-30  rounded-2xl p-6">
                <div className={`w-12 h-12 rounded-full text-center justify-center items-center flex text-xl ${step == 2 ? 'bg-blue-200 text-blue-600' : step > 2 ? 'bg-green-500' : 'bg-gray-200'}`}>{step > 2 ? <Check className="text-white" size={28} /> : '2'}</div>
            </div>
            <div className="w-full h-[1px] bg-border -mx-4" />
            <div onClick={() => setstep(3)} className="text-center cursor-pointer items-center flex justify-center flex-col w-30  rounded-2xl p-6">
                <div className={`w-12 h-12 rounded-full text-center justify-center items-center flex text-xl ${step == 3 ? 'bg-blue-200 text-blue-600' : step > 3 ? 'bg-green-500' : 'bg-gray-200'}`}>{step > 3 ? <Check className="text-white" size={28} /> : '3'}</div>
            </div>
        </div>
    )
};