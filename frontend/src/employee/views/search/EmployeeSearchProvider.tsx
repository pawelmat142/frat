import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import { EmployeeProfileI, EmployeeProfileSearchFilters, PROFILE_DEFAULT_SORT_OPTION, PROFILES_INITIAL_SEARCH_LIMIT, PROFILES_LOAD_MORE_SEARCH_LIMIT } from "@shared/interfaces/EmployeeProfileI";
import { EPUtil } from "employee/EPUtil";
import { Path } from "../../../path";

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

export const EPDefaultFilters: EmployeeProfileSearchFilters = {
    freeText: '',
    skills: [],
    certificates: [],
    communicationLanguages: [],
    locationCountry: null,
    startDate: null,
    endDate: null,
    sortBy: PROFILE_DEFAULT_SORT_OPTION,
    skip: 0,
    limit: PROFILES_INITIAL_SEARCH_LIMIT,
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

    const [filters, setFiltersState] = useState<EmployeeProfileSearchFilters>(EPUtil.parseFiltersFromSearch(location.search, EPDefaultFilters))

    const [results, setResults] = useState<EmployeeProfileI[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const requestIdRef = useRef(0);

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
        if (!location.pathname.includes(Path.EMPLOYEE_SEARCH)) {
            return
        }
        const newFilters = {
            ...EPUtil.parseFiltersFromSearch(location.search, EPDefaultFilters),
            skip: 0,
            limit: PROFILES_INITIAL_SEARCH_LIMIT,
        };

        setFiltersState(newFilters);
        setResults([]);
        setHasMore(false);

        void executeSearch(newFilters, false);
    }, [location.search]);

    const handleSetFilters = (newFilters: EmployeeProfileSearchFilters) => {
        if (EPUtil.filtersEquals(newFilters, filters)) {
            return;
        }

        setFiltersState(newFilters);
        setResults([]);
        setHasMore(false);

        const searchStr = EPUtil.prepareUrlParams(newFilters, EPDefaultFilters)
        const newUrl = searchStr ? `?${searchStr}` : ''

        if (newUrl !== location.search) {
            navigate({ pathname: location.pathname, search: newUrl }, { replace: true })
        } else {
            executeSearch(newFilters, false);
        }
    }

    const resultsLength = results.length;

    const loadMore = () => {
        if (loading || loadingMore || !hasMore) {
            return;
        }
        const searchFilters = {
            ...filters,
            skip: resultsLength,
            limit: PROFILES_LOAD_MORE_SEARCH_LIMIT,
        }
        executeSearch(searchFilters, true);
    };

    const resetFilters = () => {
        handleSetFilters(EPDefaultFilters);
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
