import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import { EmployeeProfileI, EmployeeProfileSearchFilters } from "@shared/interfaces/EmployeeProfileI";
import { EPUtil } from "employee/EPUtil";
import { ObjUtil } from "@shared/utils/ObjUtil";

interface Pagination {
    count: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
}
export interface EmployeeSearchContextProps {
    filters: EmployeeProfileSearchFilters;
    defaultFilters: EmployeeProfileSearchFilters;
    setFilters: (filters: EmployeeProfileSearchFilters) => void;
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

    const defaultFilters: EmployeeProfileSearchFilters = {
        freeText: '',
        skills: [],
        certificates: [],
        communicationLanguages: [],
        locationCountry: null,
        startDate: null,
        endDate: null,
        skip: 0,
        limit: 5,
    };

    // Initialize from URL (fallback to defaults)
    const [filters, setFilters] = useState<EmployeeProfileSearchFilters>(() => {
        return EPUtil.parseFiltersFromSearch(location.search, defaultFilters)
    });
    const [results, setResults] = useState<EmployeeProfileI[]>([])
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchUrl, setSearchUrl] = useState(location.search)

    const itemsPerPage = 5
    const totalPages = Math.ceil(count / itemsPerPage)

    useEffect(() => {
        const urlFilters = EPUtil.parseFiltersFromSearch(location.search, defaultFilters)
        if (!filtersEquals(urlFilters, filters)) {
            setFilters(urlFilters)
            doSearch(urlFilters)
        }
    }, [searchUrl]);

    useEffect(() => {
        doSearch();
    }, [])

    const handleSetFilters = (newFilters: EmployeeProfileSearchFilters) => {
        const searchStr = EPUtil.prepareUrlParams(newFilters, defaultFilters);
        const newUrl = searchStr ? `?${searchStr}` : '';
        if (newUrl !== location.search) {
            navigate({ pathname: location.pathname, search: newUrl }, { replace: true });
            setSearchUrl(newUrl);
        }
    }

    const filtersEquals = (f1: EmployeeProfileSearchFilters, f2: EmployeeProfileSearchFilters): boolean => {
        if (f1.freeText !== f2.freeText) return false;
        if (f1.locationCountry !== f2.locationCountry) return false;
        if (f1.startDate?.toISOString() !== f2.startDate?.toISOString()) return false;
        if (f1.endDate?.toISOString() !== f2.endDate?.toISOString()) return false;
        if (ObjUtil.arrayChanged(f1.skills || [], f2.skills || [])) return false;
        if (ObjUtil.arrayChanged(f1.certificates || [], f2.certificates || [])) return false;
        if (ObjUtil.arrayChanged(f1.communicationLanguages || [], f2.communicationLanguages || [])) return false;
        if (f1.skip !== f2.skip) return false;
        if (f1.limit !== f2.limit) return false;
        return true;
    }

    // Initial search on mount
    // useEffect(() => {
    //     doSearch(filters);
    //     // Runs only once intentionally; dependency array left empty
    // }, []);

    const doSearch = async (overrideFilters?: EmployeeProfileSearchFilters) => {
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
    };

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
            resetFilters,
            defaultFilters
        }}>
            {children}
        </EmployeeSearchContext.Provider>
    );
};

export default EmployeeSearchProvider;
