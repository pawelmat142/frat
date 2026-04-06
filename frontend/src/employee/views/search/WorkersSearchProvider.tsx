import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WorkerService } from "employee/services/WorkerService";
import { WorkerI, WorkerSearchFilters, PROFILES_INITIAL_SEARCH_LIMIT, PROFILES_LOAD_MORE_SEARCH_LIMIT, WorkerSearchRequest, WorkerSearchResponse, WorkerWithMutualFriends } from "@shared/interfaces/WorkerI";
import { WorkerUtil } from "@shared/utils/WorkerUtil";
import { Path } from "../../../path";
import { useUserContext } from "user/UserProvider";
import { GoogleMapService } from "global/services/GoogleMapService";
import { AppConfig } from "@shared/AppConfig";
import PseudoView from "global/components/PseudoView";
import WorkersSearchFiltersView from "./WorkersSearchFiltersView";
import { wait } from "global/utils/utils";
import { NavBus } from "global/utils/PseudoViewBus";

export interface WorkersSearchContextProps {
    filters: WorkerSearchFilters;
    defaultFilters: WorkerSearchFilters;
    setFiltersWithSearchAndNavigate: (filters: WorkerSearchFilters) => void;
    resetFilters: () => void;
    results: WorkerWithMutualFriends[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loadMore: () => void;
    setLoading: (loading: boolean) => void;
    updateOneProfileInResults: (updatedProfile: WorkerI) => void;
    filtersValid: boolean;
    setOpenPseudoView: (open: boolean) => void;
    openPseudoView: boolean;
    navToSearch: () => void;
}

export const WorkerDefaultFilters: WorkerSearchFilters = {
    startDate: null,
    endDate: null,

    locationCountry: null,
    positionRadiusKm: AppConfig.RADIUS_STEPS_KM[4],

    communicationLanguages: [],
    categories: [],
    certificates: [],

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

    const [results, setResults] = useState<WorkerWithMutualFriends[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [openPseudoView, setOpenPseudoView] = useState(false);

    React.useEffect(() => {
        return NavBus.subscribe(() => setOpenPseudoView(false));
    }, []);

    const openWorkersPseudoView = (open: boolean) => {
        setOpenPseudoView(open);
    };

    const requestIdRef = useRef(0);
    const resultsLengthRef = useRef(0);
    const hasMoreRef = useRef(false);

    const filtersValid = !!filters.startDate && !!filters.locationCountry


    const navToSearch = () => {
        if (filtersValid) {
            setFiltersWithSearchAndNavigate(filters)
        } else {
            openWorkersPseudoView(true)
        }
    }

    const executeSearch = useCallback(async (searchFilters: WorkerSearchFilters, loadMore: boolean) => {
        const requestId = ++requestIdRef.current;
        if (loadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            if (requestId !== requestIdRef.current) {
                return;
            }
            let request: WorkerSearchRequest = WorkerUtil.filtersToRequest(searchFilters);
            const result = await WorkerService.searchWorkers(request, !userCtx.me);

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

        onFiltersChange(location.search);
    }, [location.search]);

    const onFiltersChange = async (search: string) => {
        const newFilters = {
            ...WorkerUtil.parseFiltersFromSearch(search, WorkerDefaultFilters),
            skip: 0, // Always start from beginning for new search
            limit: PROFILES_INITIAL_SEARCH_LIMIT,
        };

        if (newFilters.geocodedPosition?.lat && newFilters.geocodedPosition?.lng && !newFilters.geocodedPosition.country) {
            const geocodedPosition = await GoogleMapService.getGeoPosition(newFilters.geocodedPosition);
            if (geocodedPosition) {
                newFilters.geocodedPosition = geocodedPosition;
            }
        }

        setFiltersState(newFilters);
        setResults([]);
        resultsLengthRef.current = 0;
        hasMoreRef.current = false;

        executeSearch(newFilters, false);
    }

    const setFiltersWithSearchAndNavigate = async (newFilters: WorkerSearchFilters) => {
        setFiltersState(newFilters);
        resultsLengthRef.current = 0;
        hasMoreRef.current = false;

        const searchStr = WorkerUtil.prepareUrlParams(newFilters, WorkerDefaultFilters)
        const newUrl = searchStr ? `?${searchStr}` : ''

        const isOnSearchPage = newUrl === location.search

        openWorkersPseudoView(false)
        await wait(AppConfig.ROUTER_ANIMATION_DURATION)
        if (!isOnSearchPage) {
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
                return profiles.map(profile => profile.uid === updatedProfile.uid
                    ? {
                        ...updatedProfile,
                        mutualFriendsUids: profile.mutualFriendsUids
                    }
                    : profile);
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
            updateOneProfileInResults,
            filtersValid,
            setOpenPseudoView: openWorkersPseudoView,
            navToSearch,
            openPseudoView
        }}><>
                {children}
                <PseudoView show={openPseudoView}>
                    <WorkersSearchFiltersView onClose={() => {
                        openWorkersPseudoView(false)
                    }}></WorkersSearchFiltersView>
                </PseudoView>
            </>
        </WorkersSearchContext.Provider>
    );
};

export default WorkersSearchProvider;
