import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import { EmployeeProfileI, EmployeeProfileSearchForm } from "@shared/interfaces/EmployeeProfileI";
import { EPUtil } from "employee/EPUtil";

interface Pagination {
    count: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
}
export interface EmployeeSearchContextProps {
    filters: EmployeeProfileSearchForm;
    setFilters: (filters: EmployeeProfileSearchForm) => void;
    resetFilters: () => void;
    results: EmployeeProfileI[];
    pagination: Pagination;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    nextPage: () => void;
    prevPage: () => void;
}

const EmployeeSearchContext = createContext<EmployeeSearchContextProps | undefined>(undefined);

export const useEmployeeSearch = () => {
    const ctx = useContext(EmployeeSearchContext);
    if (!ctx) throw new Error("useEmployeeSearch must be used within EmployeeSearchProvider");
    return ctx;
};

const EmployeeSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const defaultFilters: EmployeeProfileSearchForm = {
        freeText: '',
        skills: [],
        certificates: [],
        communicationLanguages: [],
        locationCountry: null,
        skip: 0,
        limit: 5,
    };

    // Initialize from URL (fallback to defaults)
    const [filters, setFilters] = useState<EmployeeProfileSearchForm>(() => {
        return EPUtil.parseFiltersFromSearch(location.search, defaultFilters);
    });
    const [results, setResults] = useState<EmployeeProfileI[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(count / itemsPerPage);

    // Sync URL when filters change
    useEffect(() => {
        const buildSearch = (f: EmployeeProfileSearchForm) => {
            const searchStr = EPUtil.prepareUrlParams(f, defaultFilters);
            const newUrl = searchStr ? `?${searchStr}` : '';
            if (newUrl !== location.search) {
                navigate({ pathname: location.pathname, search: newUrl }, { replace: true });
            }
        };
        buildSearch(filters);
    }, [filters]);

    // Re-parse filters if user navigates with browser history to a different search
    useEffect(() => {
        const urlFilters = EPUtil.parseFiltersFromSearch(location.search, defaultFilters);
        // only update if meaningfully different (avoid loop)
        const serialize = (f: EmployeeProfileSearchForm) => JSON.stringify(f);
        if (serialize(urlFilters) !== serialize(filters)) {
            setFilters(urlFilters);
        }
    }, [location.search]);

    // Initial search on mount
    useEffect(() => {
        doSearch(filters);
        // Runs only once intentionally; dependency array left empty
    }, []);

    const handleSetFilters = (newFilters: EmployeeProfileSearchForm) => {
        setFilters(newFilters);
        doSearch(newFilters);
    };

    const doSearch = useCallback(async (overrideFilters?: EmployeeProfileSearchForm) => {
        const searchFilters = overrideFilters || filters;
        try {
            setLoading(true);
            const result = await EmployeeProfileService.searchEmployeeProfiles(searchFilters);
            setResults(result.profiles);
            setCount(result.count);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                // Request anulowany
            } else {
                console.error("Error searching employee profiles:", error);
            }
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const nextPage = () => {
        if (filters.skip + itemsPerPage < count) {
            const newSkip = filters.skip + itemsPerPage;   
            const updatedFilters = { ...filters, skip: newSkip };
            handleSetFilters(updatedFilters);
        }
    };

    const prevPage = () => {
        if (filters.skip - itemsPerPage >= 0) {
            const newSkip = filters.skip - itemsPerPage;
            const updatedFilters = { ...filters, skip: newSkip };
            handleSetFilters(updatedFilters);
        }
    };  

    const resetFilters = () => {
        handleSetFilters({ ...defaultFilters, limit: itemsPerPage });
    };

    return (
        <EmployeeSearchContext.Provider value={{
            filters,
            setFilters: handleSetFilters,
            results,
            loading,
            setLoading,
            nextPage,
            prevPage,
            pagination: {
                count,
                totalPages,
                currentPage: Math.floor(filters.skip / itemsPerPage) + 1,
                itemsPerPage
            },
            resetFilters
        }}>
            {children}
        </EmployeeSearchContext.Provider>
    );
};

export default EmployeeSearchProvider;
