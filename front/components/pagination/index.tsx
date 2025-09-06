import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ data, setpage, page, hideText = false }: { readonly data: any; readonly setpage: (page: number) => void; readonly page: number; readonly hideText: boolean }) {
  const { hasNext, hasPrev, total, totalPages,} = data;

  const handleNext = () => {
    if (hasNext) {
      setpage(page + 1);
    }
  };
  const handlePrev = () => {
    if (hasPrev) {
      setpage(page - 1);
    }
  };

  const getPageNumbers = () => {
    const totalPages = data?.totalPages ?? 1;
    const currentPage = page;
    const pages = [];

    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex justify-between items-center mt-4">
      {!hideText && (
        <span className="text-xl">
          Pãgina {page} de {totalPages}
        </span>
      )}

      <div className="flex gap-3">
        <button onClick={handlePrev} disabled={!hasPrev} className={`cursor-pointer w-10 h-10 rounded-md justify-center flex items-center hover:bg-neutral-100 transition-all hover:border-neutral-100 ${!hasPrev ? "border-none" : "border-1 border-neutral-200"}`}>
          <span className="font-medium text-lg">
            <ChevronLeft />
          </span>
        </button>

        {getPageNumbers().map(pageNumber => (
          <button key={pageNumber} onClick={() => setpage(pageNumber)} className={`cursor-pointer w-10 h-10 border-1 border-neutral-200 rounded-md justify-center flex items-center hover:bg-neutral-100 transition-all hover:border-neutral-100 ${pageNumber === page ? "bg-neutral-100" : ""}`}>
            <span className="font-medium text-lg">{pageNumber}</span>
          </button>
        ))}

        <button onClick={handleNext} disabled={!hasNext} className={`cursor-pointer w-10 h-10 rounded-md justify-center flex items-center hover:bg-neutral-100 transition-all hover:border-neutral-100 ${!hasNext ? "border-none" : "border-1 border-neutral-200"}`}>
          <span className="font-medium text-lg">
            <ChevronRight />
          </span>
        </button>
      </div>
    </div>
  );
}
