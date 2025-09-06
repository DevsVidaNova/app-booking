import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, UserPlus } from "lucide-react";
import Link from "next/link";

export default function UsersEmpty() {
  return (
    <div className="flex flex-col container w-full px-3 py-4">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        {/* Ícone */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-muted">
          <Users className="w-12 h-12 text-muted-foreground" />
        </div>

        {/* Texto principal */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-foreground">Nenhum usuário encontrado</h3>
          <p className="text-muted-foreground max-w-md">Você ainda não possui usuários cadastrados. Comece adicionando o primeiro usuário ao sistema.</p>
        </div>

        {/* Card com informações */}
        <Card className="p-6 max-w-md w-full">
          <div className="text-center space-y-4">
            <h4 className="text-lg font-medium">Como começar?</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Clique no botão Adicionar Usuário para criar um novo usuário</p>
              <p>• Preencha as informações básicas (nome, email, telefone)</p>
              <p>• Defina uma senha temporária para o usuário</p>
              <p>• O usuário poderá alterar a senha no primeiro login</p>
            </div>
          </div>
        </Card>

        {/* Card com funcionalidades */}
        <Card className="p-6 max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <h4 className="text-lg font-medium">Funcionalidades disponíveis</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Cadastro e edição de usuários</p>
              <p>• Reset de senhas</p>
              <p>• Visualização de perfil completo</p>
              <p>• Exclusão de usuários</p>
            </div>
          </div>
        </Card>

        {/* Botão de ação */}
        <Button asChild className="gap-2">
          <Link href="/dashboard/users">
            <Plus className="w-4 h-4" />
            Adicionar Primeiro Usuário
          </Link>
        </Button>
      </div>
    </div>
  );
}
