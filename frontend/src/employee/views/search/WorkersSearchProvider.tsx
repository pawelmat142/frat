import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WorkerService } from "employee/services/WorkerService";
import { WorkerI, WorkerSearchFilters, PROFILES_INITIAL_SEARCH_LIMIT, PROFILES_LOAD_MORE_SEARCH_LIMIT } from "@shared/interfaces/WorkerProfileI";
import { WorkerUtil } from "@shared/utils/WorkerUtil";
import { Path } from "../../../path";
import { useUserContext } from "user/UserProvider";

export interface WorkersSearchContextProps {
    filters: WorkerSearchFilters;
    defaultFilters: WorkerSearchFilters;
    setFiltersWithSearchAndNavigate: (filters: WorkerSearchFilters) => void;
    resetFilters: () => void;
    results: WorkerI[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loadMore: () => void;
    setLoading: (loading: boolean) => void;
    updateOneProfileInResults: (updatedProfile: WorkerI) => void;
}

export const WorkerDefaultFilters: WorkerSearchFilters = {
    startDate: null,
    endDate: null,

    locationCountry: null,
    freeText: '',

    communicationLanguages: [],
    certificates: [],
    experience: [],

    skip: 0,
    limit: PROFILES_INITIAL_SEARCH_LIMIT,
};

const WorkersSearchContext = createContext<WorkersSearchContextProps | undefined>(undefined)


export const useWorkersSearch = () => {
    const ctx = useContext(WorkersSearchContext);
    if (!ctx) throw new Error("useEmployeeSearch must be used within EmployeeSearchProvider");
    return ctx;
};

const WorkersSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const userCtx = useUserContext();

    const [filters, setFiltersState] = useState<WorkerSearchFilters>(WorkerUtil.parseFiltersFromSearch(location.search, WorkerDefaultFilters))

    const [results, setResults] = useState<WorkerI[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const requestIdRef = useRef(0);
    const resultsLengthRef = useRef(0);
    const hasMoreRef = useRef(false);

    const executeSearch = useCallback(async (searchFilters: WorkerSearchFilters, loadMore: boolean) => {
        const requestId = ++requestIdRef.current;
        if (loadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const result = await WorkerService.searchWorkers(searchFilters);
            if (requestId !== requestIdRef.current) {
                return;
            }

            if (loadMore) {
                setResults(prev => {
                    const newResults = [...prev, ...result.profiles];
                    resultsLengthRef.current = newResults.length;
                    return newResults;
                });
            } else {
                setResults(result.profiles);
                resultsLengthRef.current = result.profiles.length;
            }

            const loaded = searchFilters.skip + result.profiles.length;
            const hasMoreValue = loaded < result.count;
            hasMoreRef.current = hasMoreValue;
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                console.error("Error searching employee profiles:", error);
            }
        } finally {
            if (requestId === requestIdRef.current) {
                if (loadMore) {
                    setLoadingMore(false);
                } else {
                    setLoading(false);
                }
            }
        }
    }, [userCtx.position]);

    useEffect(() => {
        if (!location.pathname.includes(Path.WORKERS_SEARCH)) {
            return
        }
        const newFilters = {
            ...WorkerUtil.parseFiltersFromSearch(location.search, WorkerDefaultFilters),
            skip: 0, // Always start from beginning for new search
            limit: PROFILES_INITIAL_SEARCH_LIMIT,
        };

        setFiltersState(newFilters);
        setResults([]);
        resultsLengthRef.current = 0;
        hasMoreRef.current = false;

        executeSearch(newFilters, false);
    }, [location.search]);


    const setFiltersWithSearchAndNavigate = (newFilters: WorkerSearchFilters) => {
        setFiltersState(newFilters);
        resultsLengthRef.current = 0;
        hasMoreRef.current = false;

        const searchStr = WorkerUtil.prepareUrlParams(newFilters, WorkerDefaultFilters)
        const newUrl = searchStr ? `?${searchStr}` : ''

        if (newUrl !== location.search) {
            navigate({ pathname: Path.WORKERS_SEARCH, search: newUrl })
        }
    }

    const loadMore = () => {
        if (loading || loadingMore || !hasMoreRef.current) {
            return;
        }

        const searchFilters = {
            ...filters,
            skip: resultsLengthRef.current,
            limit: PROFILES_LOAD_MORE_SEARCH_LIMIT,
        }

        executeSearch(searchFilters, true);
    }

    const resetFilters = () => {
        setFiltersState(WorkerDefaultFilters);
    };

    const updateOneProfileInResults = (updatedProfile: WorkerI) => {
        if (results.map(profile => profile.uid).includes(updatedProfile.uid)) {
            setResults(profiles => {
                return profiles.map(profile => profile.uid === updatedProfile.uid ? updatedProfile : profile);
            });
        }
    }

    return (
        <WorkersSearchContext.Provider value={{
            filters,
            setFiltersWithSearchAndNavigate,
            hasMore: hasMoreRef.current,
            results,
            loading,
            loadingMore,
            loadMore,
            setLoading,
            resetFilters,
            defaultFilters: WorkerDefaultFilters,
            updateOneProfileInResults
        }}>
            {children}
        </WorkersSearchContext.Provider>
    );
};

export default WorkersSearchProvider;
