"use client";

import { User, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { AuthService } from "@/services/auth.service";
import ProfileLoading from './_loading';
import ProfileError from './_error';

export function ProfileShow() {
  const { data: user, isLoading, isError } = AuthService.useProfile();

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (isError) {
    return <ProfileError />;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-32 h-32 items-center justify-center bg-[#303030] flex flex-col rounded-full mx-auto">
            <User size={52} color="#fff" />
          </div>
          <CardTitle className="text-xl">{user.name}</CardTitle>
          <p className="text-sm text-gray-500">{user.email}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}