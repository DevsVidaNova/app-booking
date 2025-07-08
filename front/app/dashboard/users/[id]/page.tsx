"use client";
import { useState } from "react";
import { Button, Card, Input, Badge } from "@/components/ui/index";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User } from "@/types";
import { KeyRound, Trash, ArrowLeft, User as UserIcon, Mail, Phone, Shield } from "lucide-react";
import { excludeUserById, showUserById, resetUserPassword } from "@/services/admin.service";
import { UserEditForm } from "@/components/user/user-edit";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

export default function UserDetails() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const { data: user, error, isLoading, refetch } = useQuery<User>({
    queryKey: [`user-${userId}`],
    queryFn: async () => {
      return await showUserById(userId);
    },
    enabled: !!userId
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
        <p>Erro ao carregar usuário</p>
      </div>
    );

  if (!user || !user.id)
    return (
      <div className="flex flex-col w-full px-4 py-4 container">
        <p>Usuário não encontrado</p>
      </div>
    );

  return (
    <div className="flex flex-col w-full px-3 py-4 container">
      <UserDetailsContent user={user} refetch={refetch} onBack={() => router.push('/dashboard/users')} />
    </div>
  );
}

const UserDetailsContent = ({ user, refetch, onBack }: { user: User; refetch: () => void; onBack: () => void }) => {
  const [confirmation, setconfirmation] = useState("");
  const [openExclude, setOpenExclude] = useState(false);
  const router = useRouter();

  const handleExclude = async (id: string, confirmation: string) => {
    if (confirmation !== "sim") {
      return;
    }
    try {
      await excludeUserById(id);
      toast.success("Usuário excluído com sucesso");
      router.push('/dashboard/users');
    } catch (error: any) {
      toast.error("Erro ao excluir usuário");
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
      toast.error("Erro ao resetar senha");
      console.log(error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'destructive' : 'secondary';
  };

  const getRoleText = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Usuário';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes do Usuário</h1>
      </div>

      {/* User Info Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar e info principal */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon size={40} className="text-gray-500" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <Badge variant={getRoleBadgeColor(user.role)} className="mt-2">
                <Shield size={12} className="mr-1" />
                {getRoleText(user.role)}
              </Badge>
            </div>
          </div>

          {/* Informações de contato */}
          <div className="flex-1 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium break-all">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            </div>
            
            {user.total_bookings !== undefined && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">{user.total_bookings}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total de Reservas</p>
                  <p className="font-medium">Reservas realizadas pelo usuário</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ações</h3>
        <div className="flex gap-3 flex-wrap">
          <UserEditForm id={user.user_id} refetch={refetch} defaultValue={user} />
          
          <Button 
            variant="outline" 
            onClick={() => handleResetPassword(user.user_id)}
            className="flex items-center gap-2"
          >
            <KeyRound size={16} />
            Resetar Senha
          </Button>

          <Dialog open={openExclude} onOpenChange={setOpenExclude}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash size={16} />
                Excluir Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[455px]">
              <DialogHeader>
                <DialogTitle>Excluir usuário</DialogTitle>
                <DialogDescription>
                  Tem certeza que quer excluir o usuário <strong>{user.name}</strong>? 
                  Esta ação não pode ser desfeita. Digite sim para confirmar.
                </DialogDescription>
                <Input 
                  id="confirmation" 
                  label="Confirmação" 
                  placeholder="Digite sim para confirmar" 
                  value={confirmation} 
                  onChange={e => setconfirmation(e.target.value)} 
                />
              </DialogHeader>
              <DialogFooter className="border-t-2 pt-[16px]">
                <DialogClose asChild>
                  <Button 
                    variant="outline"
                    style={{ marginRight: 8 }}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button 
                    variant="destructive"
                    onClick={() => handleExclude(user.user_id, confirmation)}
                    disabled={confirmation !== "sim"}
                  >
                    Excluir usuário
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
};
