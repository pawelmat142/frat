import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseFilteredPaginationResult<T> {
    searchText: string;
    setSearchText: (text: string) => void;
    currentPage: number;
    totalPages: number;
    filteredCount: number;
    totalItems: number;
    paginatedItems: T[];
    handlePageChange: (page: number) => void;
}

// filterFn should be stable (useCallback) to avoid redundant re-filtering
export const useFilteredPagination = <T,>(
    items: T[],
    itemsPerPage: number,
    filterFn: (item: T, search: string) => boolean,
): UseFilteredPaginationResult<T> => {
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    // Reset page when the source list changes size (e.g., switching dictionary/language)
    useEffect(() => {
        setCurrentPage(1);
    }, [items.length]);

    const filteredItems = useMemo(() => {
        if (!searchText.trim()) return items;
        return items.filter(item => filterFn(item, searchText));
    }, [items, searchText, filterFn]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, filteredItems, itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    return {
        searchText,
        setSearchText,
        currentPage,
        totalPages,
        filteredCount: filteredItems.length,
        totalItems: items.length,
        paginatedItems,
        handlePageChange,
    };
};
