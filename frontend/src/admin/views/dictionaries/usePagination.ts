import { useEffect, useMemo, useState } from 'react';

interface UsePaginationResult<T> {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    paginatedItems: T[];
    handlePageChange: (page: number) => void;
}

export const usePagination = <T,>(items: T[], itemsPerPage: number): UsePaginationResult<T> => {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [items.length]);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [currentPage, items, itemsPerPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return {
        currentPage,
        totalPages,
        totalItems: items.length,
        paginatedItems,
        handlePageChange,
    };
};
