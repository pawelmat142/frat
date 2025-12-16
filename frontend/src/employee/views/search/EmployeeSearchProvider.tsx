import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import { EmployeeProfileI, EmployeeProfileSearchFilters } from "@shared/interfaces/EmployeeProfileI";
import { EPUtil } from "employee/EPUtil";
import { ObjUtil } from "@shared/utils/ObjUtil";


export interface EmployeeSearchContextProps {
    filters: EmployeeProfileSearchFilters;
    defaultFilters: EmployeeProfileSearchFilters;
    setFilters: (filters: EmployeeProfileSearchFilters) => void;
    resetFilters: () => void;
    results: EmployeeProfileI[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loadMore: () => void;
    setLoading: (loading: boolean) => void;
    updateOneProfileInResults: (updatedProfile: EmployeeProfileI) => void;
}

const INITIAL_LIMIT = 8;
const LOAD_MORE_LIMIT = 4;

export const EPDefaultFilters: EmployeeProfileSearchFilters = {
        freeText: '',
        skills: [],
        certificates: [],
        communicationLanguages: [],
        locationCountry: null,
        startDate: null,
        endDate: null,
        skip: 0,
        limit: INITIAL_LIMIT,
        lat: null,
        lng: null,
    };

const toStateFilters = (filters: EmployeeProfileSearchFilters): EmployeeProfileSearchFilters => ({
    ...EPDefaultFilters,
    ...filters,
    skip: 0,
    limit: INITIAL_LIMIT,
});

const toSearchFilters = (filters: EmployeeProfileSearchFilters, skip: number, limit: number): EmployeeProfileSearchFilters => ({
    ...filters,
    skip,
    limit,
});

const EmployeeSearchContext = createContext<EmployeeSearchContextProps | undefined>(undefined);

export const useEmployeeSearch = () => {
    const ctx = useContext(EmployeeSearchContext);
    if (!ctx) throw new Error("useEmployeeSearch must be used within EmployeeSearchProvider");
    return ctx;
};

const EmployeeSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [filters, setFiltersState] = useState<EmployeeProfileSearchFilters>(() => {
        const parsed = EPUtil.parseFiltersFromSearch(location.search, EPDefaultFilters);
        return toStateFilters(parsed);
    });
    const [results, setResults] = useState<EmployeeProfileI[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const requestIdRef = useRef(0);

    const filtersEquals = useCallback((f1: EmployeeProfileSearchFilters, f2: EmployeeProfileSearchFilters): boolean => {
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
    }, []);

    const executeSearch = useCallback(async (searchFilters: EmployeeProfileSearchFilters, append: boolean) => {
        const requestId = ++requestIdRef.current;
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const result = await EmployeeProfileService.searchEmployeeProfiles(searchFilters);
            if (requestId !== requestIdRef.current) {
                return;
            }

            if (append) {
                setResults(prev => [...prev, ...result.profiles]);
            } else {
                setResults(result.profiles);
            }

            const loaded = searchFilters.skip + result.profiles.length;
            setHasMore(loaded < result.count);
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                console.error("Error searching employee profiles:", error);
            }
        } finally {
            if (requestId === requestIdRef.current) {
                if (append) {
                    setLoadingMore(false);
                } else {
                    setLoading(false);
                }
            }
        }
    }, []);

    useEffect(() => {
        const parsed = EPUtil.parseFiltersFromSearch(location.search, EPDefaultFilters);
        const normalized = toStateFilters(parsed);

        setFiltersState(normalized);
        setResults([]);
        setHasMore(false);

        const searchFilters = toSearchFilters(normalized, 0, INITIAL_LIMIT);
        void executeSearch(searchFilters, false);
    }, [location.search, executeSearch]);

    const handleSetFilters = useCallback((newFilters: EmployeeProfileSearchFilters) => {
        const normalized = toStateFilters(newFilters);
        if (filtersEquals(normalized, filters)) {
            return;
        }

        setFiltersState(normalized);
        setResults([]);
        setHasMore(false);

        const searchStr = EPUtil.prepareUrlParams(normalized, EPDefaultFilters);
        const newUrl = searchStr ? `?${searchStr}` : '';

        if (newUrl !== location.search) {
            navigate({ pathname: location.pathname, search: newUrl }, { replace: true });
        } else {
            const searchFilters = toSearchFilters(normalized, 0, INITIAL_LIMIT);
            void executeSearch(searchFilters, false);
        }
    }, [filters, filtersEquals, navigate, location.pathname, location.search, executeSearch]);

    const resultsLength = results.length;

    const loadMore = useCallback(() => {
        if (loading || loadingMore || !hasMore) {
            return;
        }

        const searchFilters = toSearchFilters(filters, resultsLength, LOAD_MORE_LIMIT);
        void executeSearch(searchFilters, true);
    }, [loading, loadingMore, hasMore, filters, resultsLength, executeSearch]);

    const resetFilters = useCallback(() => {
        handleSetFilters(EPDefaultFilters);
    }, [handleSetFilters]);

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
            loadingMore,
            hasMore,
            loadMore,
            setLoading,
            resetFilters,
            defaultFilters: EPDefaultFilters,
            updateOneProfileInResults
        }}>
            {children}
        </EmployeeSearchContext.Provider>
    );
};

export default EmployeeSearchProvider;
