"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface RoomsErrorProps {
  error?: Error;
  reset?: () => void;
}

export default function RoomsError({ error, reset }: RoomsErrorProps) {
  return (
    <div className="flex flex-col container w-full px-3 py-4">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        {/* Ícone de erro */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>

        {/* Texto principal */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-foreground">Ops! Algo deu errado</h3>
          <p className="text-muted-foreground max-w-md">Não foi possível carregar as salas. Verifique sua conexão e tente novamente.</p>
        </div>

        {/* Card com detalhes do erro */}
        {error && (
          <Card className="p-4 max-w-md w-full">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive">Detalhes do erro:</h4>
              <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">{error.message || "Erro desconhecido"}</p>
            </div>
          </Card>
        )}

        {/* Botões de ação */}
        <div className="flex gap-3">
          {reset && (
            <Button onClick={reset} variant="default" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          )}

          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>

        {/* Informações adicionais */}
        <Card className="p-4 max-w-md w-full">
          <div className="text-center space-y-2">
            <h4 className="text-sm font-medium">Precisa de ajuda?</h4>
            <p className="text-xs text-muted-foreground">Se o problema persistir, entre em contato com o suporte técnico.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
