"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EllipsisVertical, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ListRoom, Room } from "@/types";
import { deleteRoom, listRooms } from "@/services/rooms.service";
import { RoomAddForm } from "@/components/room/room-add";
import { RoomEditForm } from "@/components/room/room-edit";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Pagination from "@/components/pagination";

export default function Rooms() {
  const [page, setpage] = useState(1);
  const { data, error, isLoading, refetch } = useQuery<ListRoom>({
    queryKey: [`list rooms ${page}`],
    queryFn: async () => {
      return await listRooms(page);
    },
    placeholderData: previousData => previousData
  });

  if (isLoading) return <div className="flex flex-col container w-full px-6 py-4"><p>Carregando...</p></div>;
  if (error) return<div className="flex flex-col container w-full px-6 py-4"><p>Erro ao carregar salas</p></div>;

  return (
    <div className="flex flex-col container w-full px-3 py-4">
      {data && <ListRooms rooms={data} refetch={refetch} setpage={setpage} page={page} />}
    </div>
  )
}

const ListRooms = ({ rooms, refetch, setpage, page }: { rooms: ListRoom; refetch: () => void; setpage: (page: number) => void; page: number }) => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-[24px] font-bold">Salas cadastradas</h2>
          <div className="md:block hidden">
            <RoomAddForm refetch={refetch} />
          </div>
        </div>
        <div>
          <TableRooms rooms={rooms?.data || []} refetch={refetch} />
          <Pagination page={page} setpage={setpage} data={rooms} />
          <div className="h-[120px]"></div>
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 50, left: "50%", transform: "translateX(-50%)" }} className="justify-center items-center md:hidden">
        <RoomAddForm refetch={refetch} />
      </div>
    </>
  );
};

const TableRooms = ({ rooms, refetch }: { rooms: Room[]; refetch: () => void }) => {
  const [confirmation, setconfirmation] = useState("");
  const [openExclude, setOpenExclude] = useState(false);

  const handleExclude = async (id: string, confirmation: string) => {
    if (confirmation !== "sim") {
      return;
    }
    try {
      await deleteRoom(id);
      refetch();
    } catch (error: any) {
      console.log(error);
    }
  };

  if (!rooms) return <p>Carregando...</p>;

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="opacity-70">
            <TableHead>Nome</TableHead>
            <TableHead>Ocupação</TableHead>
            <TableHead className="text-wrap min-w-[60px] ">Descrição</TableHead>
            <div className="md:flex hidden flex-row">
              <TableHead className="text-wrap min-w-[60px] pt-[14px]">Exclusivo</TableHead>
              <TableHead className="text-wrap min-w-[60px] pt-[14px]">Status</TableHead>
            </div>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms?.map(room => {
            const { id, name, size, description, exclusive, status } = room;
            return (
              <TableRow key={id}>
                <TableCell className="text-[12px] md:text-[18px] leading-none text-neutral-600 font-light">{name}</TableCell>
                <TableCell className="text-[12px] md:text-[18px] leading-none text-neutral-600 font-light">{size}</TableCell>
                <TableCell className="text-wrap min-w-[60px] text-[12px] md:text-[18px] leading-none text-neutral-600 font-light" style={{ wordBreak: "break-word" }}>
                  {description?.length > 70 ? description.slice(0, 50) + "..." : description}
                </TableCell>
                <div className="md:flex hidden flex-row text-center items-center justify-center text-neutral-600 font-light">
                  <TableCell className="text-[12px] md:text-[18px] leading-none md:flex hidden text-neutral-600 font-light justify-center items-center">
                    <span>{exclusive ? "Exclusivo" : "Livre"}</span>
                  </TableCell>
                  <TableCell className="text-[12px] md:text-[18px] leading-none md:flex hidden text-neutral-600 font-light">{status ? "Ativo" : "Desativado"}</TableCell>
                </div>
                <TableCell>
                  <div className="md:block hidden">
                    <div className="flex flex-row gap-2">
                      <Dialog open={openExclude} onOpenChange={setOpenExclude}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-[38px] h-[42px] rounded-lg">
                            <Trash size={24} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[455px]">
                          <DialogHeader>
                            <DialogTitle>Excluir sala</DialogTitle>
                            <DialogDescription>Tem certeza que quer excluir a sala? Digite sim para confirmar</DialogDescription>
                            <Input id="confirmation" label="Confirmação" placeholder="Leia a mensagem acima" value={confirmation} onChange={e => setconfirmation(e.target.value)} />
                          </DialogHeader>
                          <DialogFooter className="border-t-2 pt-[16px]">
                            <DialogClose asChild>
                              <Button onClick={() => handleExclude(id, confirmation)} style={{ flexGrow: 1, padding: "25px 40px", borderRadius: 100 }} className="text-[18px] font-semibold ">
                                Excluir sala
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <RoomEditForm id={id} refetch={refetch} defaultValues={room} />
                    </div>
                  </div>

                  <div className="block md:hidden">
                    <Popover>
                      <PopoverTrigger>
                        <EllipsisVertical size={24} />
                      </PopoverTrigger>
                      <PopoverContent className="w-[144px] mr-4">
                        <div className="gap-2 flex flex-row items-center justify-center">
                          <Dialog open={openExclude} onOpenChange={setOpenExclude}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-[38px] h-[42px] rounded-lg">
                                <Trash size={24} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[455px]">
                              <DialogHeader>
                                <DialogTitle>Excluir sala</DialogTitle>
                                <DialogDescription>Tem certeza que quer excluir a sala? Digite sim para confirmar</DialogDescription>
                                <Input id="confirmation" label="Confirmação" placeholder="Leia a mensagem acima" value={confirmation} onChange={e => setconfirmation(e.target.value)} />
                              </DialogHeader>
                              <DialogFooter className="border-t-2 pt-[16px]">
                                <DialogClose asChild>
                                  <Button onClick={() => handleExclude(id, confirmation)} style={{ flexGrow: 1, padding: "25px 40px", borderRadius: 100 }} className="text-[18px] font-semibold ">
                                    Excluir sala
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <RoomEditForm id={id} refetch={refetch} defaultValues={room} />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};
