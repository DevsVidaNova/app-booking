"use client";
import { useState } from "react";
import { MembersService } from "@/services/members.service";
import { MemberList } from "@/components/member/member-list";

export default function Members() {
  const [page, setPage] = useState(1);

  const { data, error, isLoading, refetch } = MembersService.useList(page);

  if (isLoading)
    return (
      <div className="flex flex-col w-full px-4 py-4 container">
        <p>Carregando...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col w-full px-4 py-4 container">
        <p>Erro ao carregar membros</p>
      </div>
    );

  return <div className="flex flex-col w-full px-3 py-4 container">{data && <MemberList setpage={setPage} page={page} users={data} refetch={refetch} />}</div>;
}
