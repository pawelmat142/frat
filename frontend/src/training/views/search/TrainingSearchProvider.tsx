import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TrainingSearchFilters, TrainingWithNextSession } from "@shared/interfaces/TrainingI";
import { TrainingService } from "training/services/TrainingService";
import { Path } from "../../../path";
import { NavBus } from "global/utils/PseudoViewBus";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { MenuItemIdentifiers } from "global/interface/controls.interface";

const INITIAL_LIMIT = 8;
const LOAD_MORE_LIMIT = 4;

export const defaultTrainingFilters: TrainingSearchFilters = {
    skip: 0,
    limit: INITIAL_LIMIT,
};

export interface TrainingSearchContextProps {
    filters: TrainingSearchFilters;
    setFilters: (filters: TrainingSearchFilters) => void;
    resetFilters: () => void;
    results: TrainingWithNextSession[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loadMore: () => void;
    setFiltersWithSearchAndNavigate: (filters: TrainingSearchFilters) => void;
    openPseudoView: boolean;
    setOpenPseudoView: (open: boolean) => void;
    navToSearch: () => void;
    filtersApplied: boolean;
}

const TrainingSearchContext = createContext<TrainingSearchContextProps | undefined>(undefined);

export const useTrainingSearch = () => {
    const ctx = useContext(TrainingSearchContext);
    if (!ctx) throw new Error("useTrainingSearch must be used within TrainingSearchProvider");
    return ctx;
};

const TrainingSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const globalCtx = useGlobalContext();

    const [filters, setFiltersState] = useState<TrainingSearchFilters>(defaultTrainingFilters);
    const [results, setResults] = useState<TrainingWithNextSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [openPseudoView, setOpenPseudoViewState] = useState(false);

    const requestIdRef = useRef(0);
    const totalCountRef = useRef(0);

    React.useEffect(() => {
        return NavBus.subscribe(() => setOpenPseudoViewState(false));
    }, []);

    const setOpenPseudoView = (open: boolean) => {
        globalCtx.setHideFloatingButton(open);
        setOpenPseudoViewState(open);
    };

    const filtersApplied = !!(
        filters.certificateCode ||
        filters.locationCountry ||
        filters.lat != null
    );

    const runSearch = useCallback(async (searchFilters: TrainingSearchFilters, append = false) => {
        const id = ++requestIdRef.current;

        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setResults([]);
        }

        try {
            const response = await TrainingService.searchTrainings(searchFilters);
            if (id !== requestIdRef.current) return;

            totalCountRef.current = response.count;
            setResults(prev => append ? [...prev, ...response.trainings] : response.trainings);
            setHasMore(searchFilters.skip + response.trainings.length < response.count);
        } finally {
            if (id === requestIdRef.current) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    }, []);

    const setFiltersWithSearchAndNavigate = (newFilters: TrainingSearchFilters) => {
        const fresh = { ...newFilters, skip: 0, limit: INITIAL_LIMIT };
        setFiltersState(fresh);
        setOpenPseudoView(false);
        if (location.pathname !== Path.TRAININGS_SEARCH) {
            navigate(Path.TRAININGS_SEARCH);
        }
        runSearch(fresh);
    };

    const loadMore = () => {
        if (loadingMore || !hasMore) return;
        const next = { ...filters, skip: results.length, limit: LOAD_MORE_LIMIT };
        setFiltersState(next);
        runSearch(next, true);
    };

    const resetFilters = () => {
        setFiltersWithSearchAndNavigate(defaultTrainingFilters);
    };

    const navToSearch = () => {
        NavBus.emit(MenuItemIdentifiers.OFFERS);
        if (filtersApplied) {
            setFiltersWithSearchAndNavigate(filters);
        } else {
            if (location.pathname !== Path.TRAININGS_SEARCH) {
                navigate(Path.TRAININGS_SEARCH);
            }
            runSearch({ ...defaultTrainingFilters });
        }
    };

    // Run initial search on mount
    React.useEffect(() => {
        runSearch({ ...defaultTrainingFilters });
    }, []);

    return (
        <TrainingSearchContext.Provider value={{
            filters,
            setFilters: setFiltersState,
            resetFilters,
            results,
            loading,
            loadingMore,
            hasMore,
            loadMore,
            setFiltersWithSearchAndNavigate,
            openPseudoView,
            setOpenPseudoView,
            navToSearch,
            filtersApplied,
        }}>
            {children}
        </TrainingSearchContext.Provider>
    );
};

export default TrainingSearchProvider;
