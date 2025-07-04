'use client'
import { useState } from "react";
import { useQuery } from '@tanstack/react-query'
import { listScales } from "@/services/scale.service";
import { Pagination, SingleScale } from "@/types";
import { ScaleList } from "@/components/scale/scale-list";

export default function ScalesPage() {

    const [page, setPage] = useState(1);

    const { data, error, isLoading, refetch } = useQuery<{ scales: SingleScale[]; pagination: Pagination }>({
        queryKey: ['scales', page],
        queryFn: () => listScales(page),
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

/*

const ScaleItem = ({ data, refetch, }: { data: ListScale[], refetch: () => void, }) => {
    if (data?.length === 0) return <div className='flex flex-row items-center gap-6 border p-6 justify-center rounded-xl my-6'>
        <div className='flex flex-col justify-center items-center gap-2'>
            <Captions size={64} />
            <h2 className='text-[24px] font-bold text-center' style={{ lineHeight: 1, }}>Não encontramos nenhuma escala</h2>
            <span className='opacity-70 text-[18px] text-center'>Sem escalas criadas por enquanto...</span>
        </div>
    </div>
    const handleExclude = async (id: string) => {
        try {
            await deleteScale(id);
            refetch()
        } catch (error) {
            console.log(error)
        }
    }
    const handleDuplicate = async (id: string) => {
        try {
            await duplicateScale(id);
            refetch()
        } catch (error) {
            console.log(error)
        }
    }

    const Actions = ({ id, scale }: { id: string, scale: any }) => {
        return (
            <div className='gap-2 flex flex-row items-center justify-center'>
                <Button variant="outline" className="h-12 w-12" onClick={() => handleExclude(id)}>
                    <Trash className="h-16 w-16" />
                </Button>
                <Button variant="outline" className="h-12 w-12" onClick={() => handleDuplicate(id)}>
                    <Copy className="h-16 w-16" />
                </Button>
                <ScaleEdit id={id} refetch={refetch} defaultValues={scale} />
            </div>
        )
    }

    if (!data) return <div>Carregando...</div>
    return (
        <div className='gap-8'>
            {data?.map((scale: ListScale) => {
                const { id, name, direction, date, confirmations } = scale
                return (
                    <Card key={id} className="md:p-4 p-2   my-4">
                        <div className='flex flex-row items-center gap-2 justify-between mb-4'>
                            <div className='flex-col flex px-2 py-4 gap-2 sm:px-0 sm:py-0'>
                                <span className='text-[18px] md:text-[24px] md:leading-[24px] leading-[12px] font-bold mb-2'>{name}</span>
                                <div className='flex-row flex gap-2'>
                                    <span className="px-4 py-2 text-[12px] md:text-[16px] border-amber-500 text-amber-500 border-2 font-semibold rounded-full">{date.slice(0, 5)}</span>
                                    <span className="px-4 pb-2 pt-[9px] text-[12px] md:text-[16px]  bg-amber-500 text-white font-semibold rounded-full">{direction.name.length > 16 ? direction.name.slice(0, 16) + '...' : direction.name}</span>
                                </div>
                            </div>
                            <div className="hidden md:flex">
                                <Actions id={id} scale={scale} />
                            </div>
                            <div className='md:hidden border w-[46px] mr-2 h-[46px] rounded-lg items-center justify-center flex'>
                                <Popover>
                                    <PopoverTrigger>
                                        <EllipsisVertical size={24} />
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[204px] mr-4'>
                                        <Actions id={id} scale={scale} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <ScaleShow id={id} />
                    </Card >
                )
            }
            )}
        </div>

    )
}
    
*/