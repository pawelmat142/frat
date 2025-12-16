import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import { EmployeeProfileI, EmployeeProfileSearchFilters } from "@shared/interfaces/EmployeeProfileI";
import { EPUtil } from "employee/EPUtil";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { PaginationI } from "@shared/interfaces/Others";


export interface EmployeeSearchContextProps {
    filters: EmployeeProfileSearchFilters;
    defaultFilters: EmployeeProfileSearchFilters;
    setFilters: (filters: EmployeeProfileSearchFilters) => void;
    resetFilters: () => void;
    results: EmployeeProfileI[];
    pagination: PaginationI;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    nextPage: () => void;
    prevPage: () => void;
    updateOneProfileInResults: (updatedProfile: EmployeeProfileI) => void;
}

export const EPDefaultFilters: EmployeeProfileSearchFilters = {
        freeText: '',
        skills: [],
        certificates: [],
        communicationLanguages: [],
        locationCountry: null,
        startDate: null,
        endDate: null,
        skip: 0,
        limit: 5,
        lat: null,
        lng: null,
    };

const EmployeeSearchContext = createContext<EmployeeSearchContextProps | undefined>(undefined);

export const useEmployeeSearch = () => {
    const ctx = useContext(EmployeeSearchContext);
    if (!ctx) throw new Error("useEmployeeSearch must be used within EmployeeSearchProvider");
    return ctx;
};

const EmployeeSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [filters, setFilters] = useState<EmployeeProfileSearchFilters>(() => {
        return EPUtil.parseFiltersFromSearch(location.search, EPDefaultFilters)
    });
    const [results, setResults] = useState<EmployeeProfileI[]>([])
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchUrl, setSearchUrl] = useState(location.search)

    const itemsPerPage = 5
    const totalPages = Math.ceil(count / itemsPerPage)

    useEffect(() => {
        const urlFilters = EPUtil.parseFiltersFromSearch(location.search, EPDefaultFilters)
        if (!filtersEquals(urlFilters, filters)) {
            setFilters(urlFilters)
            doSearch(urlFilters)
        }
    }, [searchUrl]);

    useEffect(() => {
        doSearch();
    }, [])

    const handleSetFilters = (newFilters: EmployeeProfileSearchFilters) => {
        const searchStr = EPUtil.prepareUrlParams(newFilters, EPDefaultFilters);
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
        if (ObjUtil.arrayChanged(f1.skills, f2.skills)) return false;
        if (ObjUtil.arrayChanged(f1.certificates, f2.certificates)) return false;
        if (ObjUtil.arrayChanged(f1.communicationLanguages, f2.communicationLanguages)) return false;
        if (f1.lat !== f2.lat) return false;
        if (f1.lng !== f2.lng) return false;
        if (f1.skip !== f2.skip) return false;
        if (f1.limit !== f2.limit) return false;
        return true;
    }

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
        handleSetFilters({ ...EPDefaultFilters, limit: itemsPerPage });
    };

    const updateOneProfileInResults = (updatedProfile: EmployeeProfileI) => {
        if (results.map(profile => profile.uid).includes(updatedProfile.uid)) {
            setResults(profiles => {
                return profiles.map(profile => profile.uid === updatedProfile.uid ? updatedProfile : profile);
            });
        }
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
            resetFilters,
            defaultFilters: EPDefaultFilters,
            updateOneProfileInResults
        }}>
            {children}
        </EmployeeSearchContext.Provider>
    );
};

export default EmployeeSearchProvider;
