'use client'
import { useState } from "react";
import { useQuery } from '@tanstack/react-query'
import { ScaleService } from "@/services/scale.service";
import { Pagination, SingleScale } from "@/types";
import { ScaleList } from "@/components/scale/scale-list";

export default function ScalesPage() {

    const [page, setPage] = useState(1);

    const { data, error, isLoading, refetch } = useQuery<{ scales: SingleScale[]; pagination: Pagination }>({
        queryKey: ['scales', page],
        queryFn: () => ScaleService.list(page),
    });

    const handleNext = () => {
        if (data && data.pagination && data.pagination.page < data.pagination.totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (data && data.pagination && data?.pagination.page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    if (isLoading) return <div className="flex flex-col w-full px-4 py-4 container"><p>Carregando...</p></div>
    if (error) return <div className="flex flex-col w-full px-4 py-4 container"><p>Erro ao carregar escalas</p></div>

    return (
        <div className="flex flex-col w-full px-3 py-4 container">
            <ScaleList handlePrevious={handlePrevious} page={page} handleNext={handleNext} data={data?.scales || []} refetch={refetch} />
        </div>
    )
}
