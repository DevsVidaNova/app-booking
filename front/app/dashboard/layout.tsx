'use client'
import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'
import { getUser } from '@/hooks/user';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { AlignJustify } from "lucide-react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BottomMenu from '@/components/menus/bottom_menu';

export default function DashLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const verify = async () => {
      const res: any = await getUser();
      if (!res) {
        router.replace('/')
      } else {
        return;
      }
    }
    verify();
  }, []);

  return (
    <div className='bg-background w-full flex '>
      <div className='flex flex-row z-20 bg-[#ffffff30] border-b  backdrop-blur-xs fixed left-0 right-0 top-0  px-4 py-2'>
        <div className='container mx-auto'>
          <Drawer>
            <div className='container justify-between items-center flex-row flex'>
              <Link href="/" className='flex flex-col '>
                <img src="/imgs/logo_black.png" className="w-[220px] h-[60px] bg-gray self-center items-center -ml-8 " />
              </Link>
              <DrawerTrigger>
                <div className="w-[48px] h-[48px] border rounded-full flex-col flex items-center justify-center">
                  <AlignJustify size={24} />
                </div>
              </DrawerTrigger>
            </div>
            <DrawerContent >
              <BottomMenu />
              <DrawerFooter className="px-6 border-t pt-4 mt-4">
                <DrawerClose>
                  <Button variant="secondary" className="w-full ">Fechar</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      <div className='container mx-auto flex pt-[90px]'>
        {children}
      </div>
    </div>
  )
}