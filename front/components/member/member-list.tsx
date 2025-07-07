'use client'
import { EllipsisVertical, Trash } from 'lucide-react';
import { ListMember, SingleMember } from '@/types';
import { MemberAddForm } from './member-add';
import { deleteMember } from '@/services/members.service';
import  Pagination from '@/components/pagination/';

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
} from "@/components/ui/"
import { MemberEditForm } from './member-edit';
import { toast } from 'sonner';


export function MemberList({ users, refetch, setpage, page }: { readonly users: ListMember, readonly refetch: () => void, readonly page: number, readonly setpage: (page: number) => void; }) {
  return (
    <>
      <div className=' flex flex-col  gap-4'>
        <div className='flex flex-row justify-between items-center'>
          <h2 className='md:text-[28px] text-[22px] font-bold'>Membros cadastrados</h2>
          <div className='md:block hidden'>
            <MemberAddForm refetch={refetch} />
          </div>
        </div>
        <div className='mb-10'>
          {users && <TableMembers users={users} refetch={refetch} />}
          <Pagination page={page} setpage={setpage} data={users.data} hideText={false} />
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: 50, left: '50%', transform: 'translateX(-50%)' }} className='justify-center items-center md:hidden'>
        <MemberAddForm refetch={refetch} />
      </div>
    </>
  )
}

const CardMember = ({ user, refetch }: { readonly user: SingleMember, readonly refetch: () => void }) => {
  const handleExclude = async (id: string) => {
    try {
      await deleteMember(id)
      toast.success('Membro excluído com sucesso')
      refetch()
    } catch (error: any) {
      console.log(error)
    }
  }

  return (
    <TableRow key={user.email}>
      <TableCell className='text-[12px] md:text-[18px] leading-none text-neutral-600 font-light'>{user.full_name}</TableCell>
      <TableCell className='text-[12px] md:text-[18px] leading-none text-neutral-600 font-light'>{user.phone}</TableCell>
      <TableCell className='text-wrap min-w-[60px] text-[12px] md:text-[18px] leading-none text-neutral-600 font-light' style={{ wordBreak: 'break-word' }}>{user.email}</TableCell>
      <TableCell className=''>
        <div className=' md:flex hidden gap-3 flex-row '>
          <Button onClick={() => handleExclude(user.id)} variant='outline' className='w-[38px] h-[42px] rounded-lg'>
            <Trash size={24} />
          </Button>
          <MemberEditForm id={user.id} refetch={refetch} defaultValues={user} />
        </div>
        <div className='block md:hidden'>
          <Popover>
            <PopoverTrigger>
              <EllipsisVertical size={24} />
            </PopoverTrigger>
            <PopoverContent className='w-[144px] mr-4'>
              <div className='gap-2 flex flex-row items-center justify-center'>
                <Button onClick={() => handleExclude(user.id)} variant='outline' className='w-[38px] h-[42px] rounded-lg'>
                  <Trash size={24} />
                </Button>
                <MemberEditForm id={user.id} refetch={refetch} defaultValues={user} />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </TableCell>
    </TableRow>
  )
}

const TableMembers = ({ users, refetch, }: { readonly users: ListMember, readonly refetch: () => void }) => {
  if (!users) return <p>Carregando...</p>
  return (
    <Card>
      <Table >
        <TableHeader >
          <TableRow className='opacity-70'>
            <TableHead >Nome</TableHead>
            <TableHead >Telefone</TableHead>
            <TableHead className='text-wrap min-w-[60px] '>Email</TableHead>
            <TableHead >Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.data?.map((user: any) => (
            <CardMember user={user} refetch={refetch} key={user?.id} />
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}