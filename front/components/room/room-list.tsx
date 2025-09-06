"use client";
import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash, Users, Info, Lock, Unlock, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Room } from "@/types";
import { RoomsService } from "@/services/rooms.service";
import { RoomAddForm } from "@/components/room/room-add";
import { RoomEditForm } from "@/components/room/room-edit";
import Pagination from "@/components/pagination";
import { toast } from 'sonner';

import RoomsError from "./_error";
import RoomsEmpty from "./_empty";
import RoomsLoading from "./_loading";

export const RoomsList = () => {
  const [page, setPage] = useState(1);
  const [confirmation, setConfirmation] = useState("");
  const [openExclude, setOpenExclude] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  const { data, isError, isLoading, refetch } = RoomsService.useList(page);
  const deleteMutation = RoomsService.useDelete();

  const handleExclude = async (id: string, confirmation: string) => {
    if (confirmation !== "sim") {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Sala excluída com sucesso!");
      setOpenExclude(false);
      setConfirmation("");
      setRoomToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir sala");
    }
  };

  const openDeleteDialog = (id: string) => {
    setRoomToDelete(id);
    setOpenExclude(true);
  };

  if (isLoading) return <RoomsLoading />;
  if (isError) return <RoomsError />;
  if (data?.data.length === 0) return <RoomsEmpty />;
  return (
    <div className="flex flex-col container w-full px-3 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-[24px] font-bold">Salas cadastradas</h2>
          <div className="md:block hidden">
            <RoomAddForm />
          </div>
        </div>
        <div>
          <RoomsGrid rooms={data?.data || []} onDelete={openDeleteDialog} />
          <Pagination page={page} setpage={setPage} data={data} hideText={false} />
          <div className="h-[120px]"></div>
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 50, left: "50%", transform: "translateX(-50%)" }} className="justify-center items-center md:hidden">
        <RoomAddForm />
      </div>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={openExclude} onOpenChange={setOpenExclude}>
        <DialogContent className="sm:max-w-[455px]">
          <DialogHeader>
            <DialogTitle>Excluir sala</DialogTitle>
            <DialogDescription>Tem certeza que quer excluir a sala? Digite sim para confirmar</DialogDescription>
            <Input 
              id="confirmation" 
              label="Confirmação" 
              placeholder="Leia a mensagem acima" 
              value={confirmation} 
              onChange={e => setConfirmation(e.target.value)} 
            />
          </DialogHeader>
          <DialogFooter className="border-t-2 pt-[16px]">
            <DialogClose asChild>
              <Button 
                onClick={() => roomToDelete && handleExclude(roomToDelete, confirmation)} 
                style={{ flexGrow: 1, padding: "25px 40px", borderRadius: 100 }} 
                className="text-[18px] font-semibold"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Excluindo..." : "Excluir sala"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const RoomsGrid = ({ rooms, onDelete }: { rooms: Room[]; onDelete: (id: string) => void }) => {
  if (!rooms) return <p>Carregando...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms?.map(room => {
        const { id, name, size, description, exclusive, status } = room;
        return (
          <Card key={id} className="p-4">
            <div className="flex flex-col gap-3">
              {/* Nome da sala e ações */}
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-neutral-800">{name}</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 w-10 p-0"
                    onClick={() => onDelete(id)}
                  >
                    <Trash size={16} />
                  </Button>
                  <RoomEditForm id={id} defaultValues={room} />
                </div>
              </div>

              {/* Descrição */}
              <div className="flex items-start gap-2">
                <Info size={16} className="text-neutral-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {description?.length > 100 ? description.slice(0, 100) + "..." : description}
                </p>
              </div>

              {/* Informações adicionais */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-neutral-500" />
                    <span className="text-sm text-neutral-600">Ocupação:</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-800">{size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {exclusive ? <Lock size={16} className="text-neutral-500" /> : <Unlock size={16} className="text-neutral-500" />}
                    <span className="text-sm text-neutral-600">Tipo:</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-800">
                    {exclusive ? "Exclusivo" : "Livre"}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  {status ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${status ? 'text-green-600' : 'text-red-600'}`}>
                    {status ? "Ativo" : "Desativado"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
