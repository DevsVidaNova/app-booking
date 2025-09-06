"use client";

import { User } from "lucide-react";
import { Card, CardContent, CardHeader, Skeleton } from "@/components/ui";

export default function ProfileLoading() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-32 h-32 items-center justify-center bg-gray-200 flex flex-col rounded-full mx-auto animate-pulse">
            <User size={52} color="#9ca3af" />
          </div>
          <Skeleton className="h-6 w-48 mx-auto mt-4" />
          <Skeleton className="h-4 w-32 mx-auto mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
