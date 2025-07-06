'use client'
import { ArrowLeft, ArrowRight, EllipsisVertical, Trash } from 'lucide-react';

import {
  Button,
  PopoverContent,
  PopoverTrigger,
  Popover,
  Card,
  Table,
  TableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/";

import { SingleScale } from '@/types';
import { ScaleAdd } from './scale-add';
import { ScaleEdit } from './scale-edit';
import { deleteScale } from '@/services/scale.service';

export function ScaleList({ data, refetch, handleNext, handlePrevious, page }: { data: SingleScale[], refetch: () => void, handleNext: () => void, handlePrevious: () => void, page: number }) {
  return (
    <>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-row justify-between items-center'>
          <h2 className='md:text-[28px] text-[22px] font-bold'>Escalas cadastrados</h2>
          <div className='md:block hidden'>
            <ScaleAdd refetch={refetch} />
          </div>
        </div>
        <div>
          <TableList handleNext={handleNext} handlePrevious={handlePrevious} page={page} data={data || []} refetch={refetch} />
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: 50, left: '50%', transform: 'translateX(-50%)' }} className='justify-center items-center md:hidden'>
        <ScaleAdd refetch={refetch} />
      </div>
    </>
  )
}

const TableList = ({ data, refetch, handleNext, handlePrevious, page }: { data: SingleScale[], refetch: () => void, handleNext: () => void, handlePrevious: () => void, page: number }) => {
  if (!data) return <p>Carregando...</p>

  const handleExclude = async (id: string) => {
    try {
      await deleteScale(id)
      refetch()
    } catch (error: any) {
      console.log(error)
    }
  }

  const CardCell = ({ item }: { item: SingleScale, }) => {
    const { name, description, direction, band, date, id, } = item;
    return (
      <TableRow>
        <TableCell className='text-[12px] md:text-[16px] leading-none font-light opacity-80'>{name}</TableCell>
        <TableCell className='text-[12px] md:text-[16px] leading-none font-light opacity-80'>{description}</TableCell>
        <TableCell className='text-wrap min-w-[60px] text-[12px] md:text-[16px] leading-none opacity-80 font-light' style={{ wordBreak: 'break-word' }}>{direction?.full_name}</TableCell>
        <TableCell className='text-wrap min-w-[60px] text-[12px] md:text-[16px] leading-none opacity-80 font-light' style={{ wordBreak: 'break-word' }}>{band?.full_name}</TableCell>
        <TableCell className=''>
          <div className=' md:flex hidden gap-3 flex-row '>
            <Button onClick={() => handleExclude(id)} variant='outline' className='w-[38px] h-[42px] rounded-lg'>
              <Trash size={24} />
            </Button>
            <ScaleEdit id={id} refetch={refetch} defaultValues={item} />
          </div>
          <div className='block md:hidden'>
            <Popover>
              <PopoverTrigger>
                <EllipsisVertical size={24} />
              </PopoverTrigger>
              <PopoverContent className='w-[144px] mr-4'>
                <div className='gap-2 flex flex-row items-center justify-center'>
                  <Button onClick={() => handleExclude(id)} variant='outline' className='w-[38px] h-[42px] rounded-lg'>
                    <Trash size={24} />
                  </Button>
                  <ScaleEdit id={id} refetch={refetch} defaultValues={item} />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <Card className='overflow-hidden mb-30'>
      <Table className='border-b'>
        <TableHeader>
          <TableRow className='opacity-70'>
            <TableHead >Nome</TableHead>
            <TableHead >Descrição</TableHead>
            <TableHead className='text-wrap min-w-[60px]'>Direção</TableHead>
            <TableHead className='text-wrap min-w-[60px]'>Banda</TableHead>
            <TableHead >Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((data: SingleScale, index) => (
            <CardCell item={data} key={index} />
          ))}
        </TableBody>
      </Table>
      <Pagination className='py-2'>
        <PaginationContent className='gap-2'>
          <PaginationItem onClick={handlePrevious} className='h-10 w-10 justify-center items-center border rounded-md flex bg-accent cursor-pointer'>
            <ArrowLeft size={18} />
          </PaginationItem>
          <PaginationItem className='bg-black text-white rounded-md'>
            <PaginationLink >{page}</PaginationLink>
          </PaginationItem>
          <PaginationItem onClick={handleNext} className='h-10 w-10 justify-center items-center border rounded-md flex bg-accent cursor-pointer'>
            <ArrowRight size={18} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Card>
  )
}