"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Message,
  Button,
  Input,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/";
import { User, AlignJustify, Bell, Captions } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/hooks/user";

import { listMyScales, listScales } from "@/app/__api/scale";
import { ListScale } from "@/app/__api/types";
import { ScaleShow } from "@/components/scale/scale-show";

export default function Home() {
  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <Profile />
          <div className="gap-3 flex flex-row">
            <Notify />
            <Menu />
          </div>
        </div>

        <div className="flex flex-col my-2">
          <span className="text-xl">Boa tarde,</span>
          <span className="text-2xl font-bold -mt-2">João Sousa</span>
        </div>

        <div className="flex flex-row gap-4  justify-baseline">
          <div className="flex-col flex border rounded-2xl p-4 w-full">
            <span className="text-[18px] font-light leading-4">
              Esse mês você <br />
              está em
            </span>
            <span className="text-4xl font-bold mt-6">2</span>
            <span className="text-[18px] font-light leading-4">escalas</span>
          </div>
          <div className="flex-col flex border rounded-2xl p-4 w-full">
            <span className="text-[18px] font-light leading-4">
              Escalas que
              <br />
              confirmei
            </span>
            <span className="text-4xl font-bold mt-6">1/2</span>
            <span className="text-[18px] font-light leading-4">
              confirmadas
            </span>
          </div>
        </div>

        <Scales />
      </div>
    </div>
  );
}

const Scales = () => {
  const {
    data: myscales,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my scales list"],
    queryFn: listMyScales,
  });

  const ScaleList = ({
    data,
    refetch,
  }: {
    data: ListScale[];
    refetch: () => void;
  }) => {
    if (data?.length === 0)
      return (
        <div className="flex flex-row items-center gap-6 border p-6 justify-center rounded-xl my-6">
          <div className="flex flex-col justify-center items-center gap-2">
            <Captions size={64} />
            <h2
              className="text-[24px] font-bold text-center"
              style={{ lineHeight: 1 }}>
              Não encontramos nenhuma escala
            </h2>
            <span className="opacity-70 text-[18px] text-center">
              Sem escalas atribuidas a você por enquanto...
            </span>
          </div>
        </div>
      );

    if (!data) return <div>Carregando...</div>;
    return (
      <div>
        {data?.map((scale: ListScale) => {
          const { id, name, direction, date, confirmations } = scale;
          return (
            <div key={id} className="border rounded-[12px] p-4 mt-4">
              <div className="flex flex-row items-center gap-2 justify-between mb-4">
                <div className="flex-col flex gap-2 sm:px-0 sm:py-0">
                  <span className="text-[24px] md:text-[24px] md:leading-[24px] leading-[12px] font-bold mb-2">
                    {name}
                  </span>
                  <span className="text-[14px] md:text-[16px] text-gray-500 -mt-2">
                    {confirmations} confirmações
                  </span>
                  <div className="flex-row flex gap-2">
                    <span className="px-4 py-2 text-[12px] md:text-[16px] border-amber-500 text-amber-500 border-2 font-semibold rounded-full">
                      {date.slice(0, 5)}
                    </span>
                    <span className="px-4 pb-2 pt-[9px] text-[12px] md:text-[16px]  bg-amber-500 text-white font-semibold rounded-full">
                      {direction.name.length > 16
                        ? direction.name.slice(0, 16) + "..."
                        : direction.name}
                    </span>
                  </div>
                </div>
              </div>
              <ScaleShow id={id} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold mt-4">Minhas escalas</h3>
      <ScaleList data={myscales || []} refetch={refetch} />
    </div>
  );
};

const Notify = () => {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["user profile"],
    queryFn: getUser,
  });

  return (
    <div>
      <Drawer>
        <DrawerTrigger>
          <div className="w-[48px] h-[48px] border rounded-full flex-col flex items-center justify-center cursor-pointer">
            <Bell size={18} />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <div className="container mx-auto">
            <DrawerHeader>
              <DrawerTitle>O que deseja fazer?</DrawerTitle>
              <DrawerDescription>
                Clique em um dos botões abaixo ou arraste esse componente para
                baixo.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="border-t pt-4 mt-4">
              <DrawerClose>
                <Button variant="secondary" className="w-full">
                  Fechar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const Menu = () => {
  return (
    <div>
      <Drawer>
        <DrawerTrigger>
          <div className="w-[48px] h-[48px] border rounded-full flex-col flex items-center justify-center cursor-pointer">
            <AlignJustify size={24} />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <div className="container mx-auto">
            <DrawerHeader>
              <DrawerTitle>O que deseja fazer?</DrawerTitle>
              <DrawerDescription>
                Clique em um dos botões abaixo ou arraste esse componente para
                baixo.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="border-t pt-4 mt-4">
              <DrawerClose>
                <Button variant="secondary" className="w-full">
                  Fechar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const Profile = () => {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["user profile"],
    queryFn: getUser,
  });

  return (
    <div>
      <Drawer>
        <DrawerTrigger>
          <div className="w-[48px] h-[48px] bg-purple-600 rounded-full flex items-center justify-center cursor-pointer">
            <User size={18} color="#fff" />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <div className="container mx-auto">
            <DrawerHeader>
              <DrawerTitle>O que deseja fazer?</DrawerTitle>
              <DrawerDescription>
                Clique em um dos botões abaixo ou arraste esse componente para
                baixo.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="border-t pt-4 mt-4">
              <DrawerClose>
                <Button variant="secondary" className="w-full">
                  Fechar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
