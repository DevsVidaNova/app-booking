export interface PaginationResult {
    limit: number;
    offset: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export function getPagination(page: number = 1, pageSize: number = 10, total: number = 0): PaginationResult {
    const limit = Math.max(pageSize, 1);
    const currentPage = Math.max(page, 1);
    const offset = (currentPage - 1) * limit;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const hasNext = currentPage < totalPages;
    const hasPrev = currentPage > 1;

    return {
        limit,
        offset,
        page: currentPage,
        totalPages,
        hasNext,
        hasPrev,
    };
}