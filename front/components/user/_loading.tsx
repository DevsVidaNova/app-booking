import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function UsersLoading() {
  return (
    <div className="flex flex-col container w-full px-3 py-4">
      <div className="flex flex-col gap-4">
        {/* Header com botão de adicionar */}
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Grid de usuários */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex flex-col gap-3">
                {/* Avatar e nome */}
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>

                {/* Informações do usuário */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
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

