"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

interface ProfileErrorProps {
  onRetry?: () => void;
}

export default function ProfileError({ onRetry }: ProfileErrorProps) {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="text-center py-8">
          <div className="w-20 h-20 items-center justify-center bg-red-100 flex flex-col rounded-full mx-auto mb-4">
            <AlertCircle size={40} color="#ef4444" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao carregar perfil
          </h3>
          <p className="text-gray-500 mb-4">
            Não foi possível carregar as informações do seu perfil. Tente novamente.
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
