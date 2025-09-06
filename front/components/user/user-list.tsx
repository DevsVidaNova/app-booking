"use client";
import { useState } from "react";
import { Button, Card, Input } from "@/components/ui/index";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User } from "@/types";
import { KeyRound, Trash, Eye } from "lucide-react";
import { UserService } from "@/services/user.service";
import { UserAddForm } from "@/components/user/user-add";
import { UserEditForm } from "@/components/user/user-edit";
import Pagination from "@/components/pagination";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import UsersLoading from "./_loading";
import UsersError from "./_error";
import UsersEmpty from "./_empty";

export const UsersList = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: users, isError, isLoading } = UserService.useList(currentPage);

  if (isLoading) return <UsersLoading />;
  if (isError) return <UsersError />;
  if (!users?.data || users.data.length === 0) return <UsersEmpty />;

  return (
    <>
      <div className=" flex flex-col  gap-4">
        <div className="flex flex-row justify-between items-center">
          <h2 className="md:text-[28px] text-[22px] font-bold">Usuários cadastrados</h2>
          <div className="md:block hidden">
            <UserAddForm />
          </div>
        </div>
        <div>
          <GridUsers users={users.data} />
          <Pagination page={currentPage} setpage={setCurrentPage} data={users} hideText={false} />
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 50, left: "50%", transform: "translateX(-50%)" }} className="justify-center items-center md:hidden">
        <UserAddForm />
      </div>
    </>
  );
};

const GridUsers = ({ users }: { users: User[] }) => {
  const [confirmation, setconfirmation] = useState("");
  const [openExclude, setOpenExclude] = useState(false);
  const router = useRouter();
  const deleteUserMutation = UserService.useDelete();
  const resetPasswordMutation = UserService.useResetPassword();

  const handleExclude = async (id: string, confirmation: string) => {
    if (confirmation !== "sim") {
      return;
    }
    try {
      await deleteUserMutation.mutateAsync(id);
      toast.success("Usuário excluído com sucesso!");
      setOpenExclude(false);
      setconfirmation("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      await resetPasswordMutation.mutateAsync(id);
      toast.success("Senha resetada com sucesso", {
        description: "A senha do usuário foi resetada com sucesso",
        action: {
          label: "Fechar",
          onClick: () => {}
        }
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!users) return <p>Carregando...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {users?.map(user => (
        <Card key={user.email} className="p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
          <div className="flex flex-col gap-3">
            {/* Avatar e nome */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate" onClick={() => router.push(`/dashboard/users/${user.id}`)}>
                  {user.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            {/* Informações do usuário */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Telefone:</span>
                <span>{user.phone || "Não informado"}</span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-10 w-10 p-0" onClick={() => router.push(`/dashboard/users/${user.id}`)} title="Visualizar usuário">
                  <Eye size={16} />
                </Button>

                <UserEditForm id={user.id} defaultValue={user} />

                <Button variant="outline" size="sm" className="h-10 w-10 p-0" onClick={() => handleResetPassword(user.id)} title="Resetar senha">
                  <KeyRound size={16} />
                </Button>
              </div>

              <Dialog open={openExclude} onOpenChange={setOpenExclude}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 w-10 p-0 text-destructive hover:text-destructive" title="Excluir usuário">
                    <Trash size={16} />
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
                      <Button onClick={() => handleExclude(user.id, confirmation)} style={{ flexGrow: 1, padding: "25px 40px", borderRadius: 100 }} className="text-[18px] font-semibold">
                        Excluir usuário
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
