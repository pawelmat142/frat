import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import { EmployeeProfileI, EmployeeProfileSearchForm } from "@shared/interfaces/EmployeeProfileI";

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
    const [filters, setFilters] = useState<EmployeeProfileSearchForm>({
        freeText: '',
        skills: [],
        certificates: [],
        communicationLanguages: [],
        locationCountry: null,
        skip: 0,
        limit: 5,
    });
    const [results, setResults] = useState<EmployeeProfileI[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(count / itemsPerPage);

    useEffect(() => {
        doSearch();
    }, [])

    const handleSetFilters = (newFilters: EmployeeProfileSearchForm) => {
        setFilters(newFilters);
        doSearch(newFilters);
    }

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

        console.log("Search executed with filters:", searchFilters);
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
        const defaultFilters: EmployeeProfileSearchForm = {
            freeText: '',
            skills: [],
            certificates: [],
            communicationLanguages: [],
            locationCountry: null,
            skip: 0,
            limit: itemsPerPage,
        };
        handleSetFilters(defaultFilters);
    }

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
