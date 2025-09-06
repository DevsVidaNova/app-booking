import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RoomsLoading() {
  return (
    <div className="flex flex-col container w-full px-3 py-4">
      <div className="flex flex-col gap-4">
        {/* Header com botão de adicionar */}
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Barra de pesquisa */}
        <div className="flex flex-row gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Cards das salas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex flex-col gap-3">
                {/* Nome da sala */}
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>

                {/* Descrição */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />

                {/* Informações adicionais */}
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>

                {/* Status */}
                <div className="flex justify-between items-center mt-3">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Paginação */}
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
