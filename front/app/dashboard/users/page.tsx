"use client";
import { useState } from "react";
import { Button, Card, Input, Popover, PopoverContent, PopoverTrigger } from "@/components/ui/index";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ListUser, User } from "@/types";
import { EllipsisVertical, KeyRound, Trash, Eye } from "lucide-react";
import { excludeUserById, listUsers, resetUserPassword } from "@/services/admin.service";
import { UserAddForm } from "@/components/user/user-add";
import { UserEditForm } from "@/components/user/user-edit";
import Pagination from "@/components/pagination";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Users() {
  const [page, setpage] = useState(1);
  const { data, error, isLoading, refetch } = useQuery<ListUser>({
    queryKey: [`list users ${page}`],
    queryFn: async () => {
      return await listUsers(page);
    }
  });

  if (isLoading)
    return (
      <div className="flex flex-col w-full px-4 py-4 container">
        <p>Carregando...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col w-full px-4 py-4 container">
        <p>Erro ao carregar usuários</p>
      </div>
    );

  return <div className="flex flex-col w-full px-3 py-4 container">{data && <ListUsers users={data} refetch={refetch} setpage={setpage} page={page} />}</div>;
}

const ListUsers = ({ users, refetch, setpage, page }: { users: ListUser; refetch: () => void; setpage: (page: number) => void; page: number }) => {
  return (
    <>
      <div className=" flex flex-col  gap-4">
        <div className="flex flex-row justify-between items-center">
          <h2 className="md:text-[28px] text-[22px] font-bold">Usuários cadastrados</h2>
          <div className="md:block hidden">
            <UserAddForm refetch={refetch} />
          </div>
        </div>
        <div>
          <TableUsers users={users?.data || []} refetch={refetch} />
          <Pagination page={page} setpage={setpage} data={users} hideText={false} />
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 50, left: "50%", transform: "translateX(-50%)" }} className="justify-center items-center md:hidden">
        <UserAddForm refetch={refetch} />
      </div>
    </>
  );
};

const TableUsers = ({ users, refetch }: { users: User[]; refetch: () => void }) => {
  const [confirmation, setconfirmation] = useState("");
  const [openExclude, setOpenExclude] = useState(false);
  const router = useRouter();

  const handleExclude = async (id: string, confirmation: string) => {
    if (confirmation !== "sim") {
      return;
    }
    try {
      await excludeUserById(id);
      refetch();
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      await resetUserPassword(id);
      toast.success("Senha resetada com sucesso", {
        description: "A senha do usuário foi resetada com sucesso",
        action: {
          label: "Fechar",
          onClick: () => {}
        }
      });
      refetch();
    } catch (error: any) {
      console.log(error);
    }
  };

  if (!users) return <p>Carregando...</p>;

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="opacity-70">
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead className="text-wrap min-w-[60px] ">Email</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map(user => (
            <TableRow key={user.email} className="cursor-pointer hover:bg-gray-50">
              <TableCell 
                className="text-[12px] md:text-[18px] leading-none font-light text-neutral-600"
                onClick={() => router.push(`/dashboard/users/${user.id}`)}
              >
                {user.name}
              </TableCell>
              <TableCell 
                className="text-[12px] md:text-[18px] leading-none font-light text-neutral-600"
                onClick={() => router.push(`/dashboard/users/${user.id}`)}
              >
                {user.phone}
              </TableCell>
              <TableCell 
                className="text-wrap min-w-[60px] text-[12px] md:text-[18px] leading-none font-light text-neutral-600" 
                style={{ wordBreak: "break-word" }}
                onClick={() => router.push(`/dashboard/users/${user.id}`)}
              >
                {user.email}
              </TableCell>
              <TableCell className="">
                <div className=" md:flex hidden gap-3 flex-row ">
                  <Button 
                    variant="outline" 
                    className="w-[38px] h-[42px] rounded-lg" 
                    onClick={() => router.push(`/dashboard/users/${user.id}`)}
                  >
                    <Eye size={24} />
                  </Button>
                  <Dialog open={openExclude} onOpenChange={setOpenExclude}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-[38px] h-[42px] rounded-lg">
                        <Trash size={24} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[455px]">
                      <DialogHeader>
                        <DialogTitle>Excluir usuário</DialogTitle>
                        <DialogDescription>Tem certeza que quer excluir o usuário? Digite sim para confirmar</DialogDescription>
                        <Input id="confirmation" label="Confirmação" placeholder="Leia a mensagem acima" value={confirmation} onChange={e => setconfirmation(e.target.value)} />
                      </DialogHeader>
                      <DialogFooter className="border-t-2 pt-[16px]">
                        <DialogClose asChild>
                          <Button onClick={() => handleExclude(user.user_id, confirmation)} style={{ flexGrow: 1, padding: "25px 40px", borderRadius: 100 }} className="text-[18px] font-semibold ">
                            Excluir usuário
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <UserEditForm id={user.user_id} refetch={refetch} defaultValue={user} />
                  <Button variant="outline" className="w-[38px] h-[42px] rounded-lg" onClick={() => handleResetPassword(user.user_id)}>
                    <KeyRound size={24} />
                  </Button>
                </div>
                <div className="block md:hidden">
                  <Popover>
                    <PopoverTrigger>
                      <EllipsisVertical size={24} />
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] mr-4">
                      <div className="gap-2 flex flex-row items-center justify-center">
                        <Button 
                          variant="outline" 
                          className="w-[38px] h-[42px] rounded-lg"
                          onClick={() => router.push(`/dashboard/users/${user.id}`)}
                        >
                          <Eye size={24} />
                        </Button>
                        <Dialog open={openExclude} onOpenChange={setOpenExclude}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-[38px] h-[42px] rounded-lg">
                              <Trash size={24} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[455px]">
                            <DialogHeader>
                              <DialogTitle>Excluir usuário</DialogTitle>
                              <DialogDescription>Tem certeza que quer excluir o usuário? Digite sim para confirmar</DialogDescription>
                              <Input id="confirmation" label="Confirmação" placeholder="Leia a mensagem acima" value={confirmation} onChange={e => setconfirmation(e.target.value)} />
                            </DialogHeader>
                            <DialogFooter className="border-t-2 pt-[16px]">
                              <DialogClose asChild>
                                <Button onClick={() => handleExclude(user.user_id, confirmation)} style={{ flexGrow: 1, padding: "25px 40px", borderRadius: 100 }} className="text-[18px] font-semibold ">
                                  Excluir usuário
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <UserEditForm id={user.user_id} refetch={refetch} defaultValue={user} />
                        <Button variant="outline" className="w-[38px] h-[42px] rounded-lg" onClick={() => handleResetPassword(user.user_id)}>
                          <KeyRound size={24} />
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
