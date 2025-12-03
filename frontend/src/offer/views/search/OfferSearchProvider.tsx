import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmployeeProfileSearchFilters } from "@shared/interfaces/EmployeeProfileI";
import { EPUtil } from "employee/EPUtil";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { Pagination } from "@shared/interfaces/interfaces";
import { OfferI, OfferSearchFilters } from "@shared/interfaces/OfferI";
import { OfferUtil } from "offer/OfferUtil";
import { OffersService } from "offer/services/OffersService";

export interface OfferSearchContextProps {
    filters: OfferSearchFilters;
    defaultFilters: OfferSearchFilters;
    setFilters: (filters: OfferSearchFilters) => void;
    resetFilters: () => void;
    results: OfferI[];
    pagination: Pagination;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    nextPage: () => void;
    prevPage: () => void;
}

const OfferSearchContext = createContext<OfferSearchContextProps | undefined>(undefined);

export const useOfferSearch = () => {
    const ctx = useContext(OfferSearchContext);
    if (!ctx) throw new Error("useOfferSearch must be used within OfferSearchProvider");
    return ctx;
};

const OfferSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const defaultFilters: OfferSearchFilters = {
        freeText: '',
        categories: [],
        communicationLanguages: [],
        locationCountries: [],
        skills: [],
        certificates: [],
        skip: 0,
        limit: 5,
    };

    // Initialize from URL (fallback to defaults)
    const [filters, setFilters] = useState<OfferSearchFilters>(() => {
        return OfferUtil.parseFiltersFromSearch(location.search, defaultFilters)
    });
    const [results, setResults] = useState<OfferI[]>([])
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchUrl, setSearchUrl] = useState(location.search)

    const itemsPerPage = 5
    const totalPages = Math.ceil(count / itemsPerPage)

    useEffect(() => {
        const urlFilters = OfferUtil.parseFiltersFromSearch(location.search, defaultFilters)
        if (!filtersEquals(urlFilters, filters)) {
            setFilters(urlFilters)
            doSearch(urlFilters)
        }
    }, [searchUrl]);

    useEffect(() => {
        doSearch();
    }, [])

    const handleSetFilters = (newFilters: OfferSearchFilters) => {
        const searchStr = OfferUtil.prepareUrlParams(newFilters, defaultFilters);
        const newUrl = searchStr ? `?${searchStr}` : '';
        if (newUrl !== location.search) {
            navigate({ pathname: location.pathname, search: newUrl }, { replace: true });
            setSearchUrl(newUrl);
        }
    }

    const filtersEquals = (f1: OfferSearchFilters, f2: OfferSearchFilters): boolean => {
        if (f1.freeText !== f2.freeText) return false;
        if (ObjUtil.arrayChanged(f1.categories, f2.categories)) return false;

        if (ObjUtil.arrayChanged(f1.communicationLanguages, f2.communicationLanguages)) return false;
        if (ObjUtil.arrayChanged(f1.locationCountries, f2.locationCountries)) return false;

        if (ObjUtil.arrayChanged(f1.skills, f2.skills)) return false;
        if (ObjUtil.arrayChanged(f1.certificates, f2.certificates)) return false;   
        
        if (f1.monthlySalaryStart !== f2.monthlySalaryStart) return false;
        if (f1.hourlySalaryStart !== f2.hourlySalaryStart) return false;

        if (f1.skip !== f2.skip) return false;
        if (f1.limit !== f2.limit) return false;
        return true;
    }

    const doSearch = async (overrideFilters?: EmployeeProfileSearchFilters) => {
        const searchFilters = overrideFilters || filters;
        try {
            setLoading(true);
            const result = await OffersService.searchOffers(searchFilters);
            setResults(result.profiles);
            setCount(result.count);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                // Request anulowany
            } else {
                console.error("Error searching offers:", error);
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
        <OfferSearchContext.Provider value={{
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
        </OfferSearchContext.Provider>
    );
};

export default OfferSearchProvider;