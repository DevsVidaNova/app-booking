import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import Link from "next/link";

export default function RoomsEmpty() {
  return (
    <div className="flex flex-col container w-full px-3 py-4">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        {/* Ícone */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-muted">
          <Building2 className="w-12 h-12 text-muted-foreground" />
        </div>

        {/* Texto principal */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-foreground">Nenhuma sala encontrada</h3>
          <p className="text-muted-foreground max-w-md">Você ainda não possui salas cadastradas. Comece criando sua primeira sala para organizar seus espaços.</p>
        </div>

        {/* Card com informações */}
        <Card className="p-6 max-w-md w-full">
          <div className="text-center space-y-4">
            <h4 className="text-lg font-medium">Como começar?</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Clique no botão Adicionar Sala para criar uma nova sala</p>
              <p>• Defina o nome e descrição da sala</p>
              <p>• Configure a capacidade e outras informações</p>
              <p>• Comece a fazer reservas para suas salas</p>
            </div>
          </div>
        </Card>

        {/* Botão de ação */}
        <Button asChild className="gap-2">
          <Link href="/dashboard/rooms">
            <Plus className="w-4 h-4" />
            Adicionar Primeira Sala
          </Link>
        </Button>
      </div>
    </div>
  );
}
