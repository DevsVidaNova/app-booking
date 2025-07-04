"use client";
import { useState } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Button,
  Message,
} from "@/components/ui";

import { useQuery } from "@tanstack/react-query";

import { CalendarSearch, CalendarX2, Check } from "lucide-react";

import { SingleScale } from "@/app/__api/types";
import { confirmScale, singleScale } from "@/app/__api/scale";

export function ScaleShow({ id }: { id: string }) {
  const {
    data: scale,
    error: errorScale,
    isLoading,
  } = useQuery<SingleScale>({
    queryKey: ["single scale", id],
    queryFn: () => singleScale(id),
  });

  const [success, setsuccess] = useState("");
  const [error, seterror] = useState("");

  const {
    date,
    band,
    projection,
    light,
    transmission,
    camera,
    live,
    sound,
    training_sound,
    photography,
    stories,
    dynamic,
    direction,
    name,
    scale_confirmations,
    percentage_confirmed,
  } = scale || {};

  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            className="bg-amber-500/20 z-20|  w-full text-amber-500 hover:bg-amber-100 hover:text-amber-500 rounded-full">
            Ver mais
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="container mx-auto px-4">
            <DrawerHeader>
              <DrawerTitle>Detalhes da escala</DrawerTitle>
              <DrawerDescription>
                Tudo o que você precisa saber dessa escala
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">{name}</h2>
              <span>Direção: {direction?.name}</span>
            </div>
            <div className="flex flex-row justify-between gap-4 my-4">
              <div className="border p-3 rounded-xl flex flex-col w-full">
                <span>Data</span>
                <h2 className="text-xl font-bold -mt-1">{date}</h2>
              </div>
              <div className="border p-3 rounded-xl flex flex-col w-full">
                <span>Confirmaram</span>
                <h2 className="text-xl font-bold -mt-1">
                  {percentage_confirmed?.slice(3)}%
                </h2>
              </div>
            </div>

            <h2 className="text-2xl font-semibold">Sua escala</h2>
            <div className="border p-3 rounded-xl flex flex-row  w-full mt-2 justify-between">
              <div className="flex flex-col">
                <span>Banda</span>
                <h2 className="text-xl font-bold -mt-1">João Sousa</h2>
              </div>
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center bg-green-600 text-white">
                <Check size={24} />
              </div>
            </div>
            <DrawerFooter>
              <div className="flex flex-col w-full gap-4">
                <Message success={success} error={error} />
                <Button className="bg-green-600">
                  <button type="submit">Confirmar presença</button>
                </Button>
                <DrawerClose>
                  <Button variant="secondary" className="w-full">
                    Lembrar mais tarde
                  </Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
