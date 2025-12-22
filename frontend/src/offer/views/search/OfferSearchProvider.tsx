import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { OfferI, OfferSearchFilters } from "@shared/interfaces/OfferI";
import { OfferUtil } from "offer/OfferUtil";
import { OffersService } from "offer/services/OffersService";
import { Path } from "../../../path";

export interface OfferSearchContextProps {
    filters: OfferSearchFilters;
    defaultFilters: OfferSearchFilters;
    setFilters: (filters: OfferSearchFilters) => void;
    resetFilters: () => void;
    results: OfferI[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loadMore: () => void;
}
const INITIAL_LIMIT = 8;
const LOAD_MORE_LIMIT = 4;
export const defaultOfferFilters: OfferSearchFilters = {
    freeText: '',
    categories: [],
    communicationLanguages: [],
    locationCountries: [],
    skills: [],
    certificates: [],
    skip: 0,
    limit: INITIAL_LIMIT,
};

const toStateFilters = (filters: OfferSearchFilters): OfferSearchFilters => ({
    ...defaultOfferFilters,
    ...filters,
    skip: 0,
    limit: INITIAL_LIMIT,
});

const toSearchFilters = (filters: OfferSearchFilters, skip: number, limit: number): OfferSearchFilters => ({
    ...filters,
    skip,
    limit,
});

const OfferSearchContext = createContext<OfferSearchContextProps | undefined>(undefined);

export const useOfferSearch = () => {
    const ctx = useContext(OfferSearchContext);
    if (!ctx) throw new Error("useOfferSearch must be used within OfferSearchProvider");
    return ctx;
};

const OfferSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [filters, setFiltersState] = useState<OfferSearchFilters>(() => {
        const parsed = OfferUtil.parseFiltersFromSearch(location.search, defaultOfferFilters);
        return toStateFilters(parsed);
    });
    const [results, setResults] = useState<OfferI[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const requestIdRef = useRef(0);

    const filtersEquals = (f1: OfferSearchFilters, f2: OfferSearchFilters): boolean => {
        if (f1.freeText !== f2.freeText) return false;
        if (ObjUtil.arrayChanged(f1.categories, f2.categories)) return false;

        if (ObjUtil.arrayChanged(f1.communicationLanguages, f2.communicationLanguages)) return false;
        if (ObjUtil.arrayChanged(f1.locationCountries, f2.locationCountries)) return false;

        if (ObjUtil.arrayChanged(f1.skills, f2.skills)) return false;
        if (ObjUtil.arrayChanged(f1.certificates, f2.certificates)) return false;

        if (f1.currency !== f2.currency) return false;
        if (f1.monthlySalaryStart !== f2.monthlySalaryStart) return false;
        if (f1.hourlySalaryStart !== f2.hourlySalaryStart) return false;

        if (f1.skip !== f2.skip) return false;
        if (f1.limit !== f2.limit) return false;
        return true;
    };

    const executeSearch = useCallback(async (searchFilters: OfferSearchFilters, append: boolean) => {
        const requestId = ++requestIdRef.current;
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const result = await OffersService.searchOffers(searchFilters);
            if (requestId !== requestIdRef.current) {
                return;
            }

            if (append) {
                setResults(prev => [...prev, ...result.offers]);
            } else {
                setResults(result.offers);
            }

            const loaded = searchFilters.skip + result.offers.length;
            setHasMore(loaded < result.count);
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                console.error("Error searching offers:", error);
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
        if (!location.pathname.includes(Path.OFFERS_SEARCH)) {
            return
        }
        const parsed = OfferUtil.parseFiltersFromSearch(location.search, defaultOfferFilters);
        const normalized = toStateFilters(parsed);

        setFiltersState(normalized);
        setResults([]);
        setHasMore(false);

        const searchFilters = toSearchFilters(normalized, 0, INITIAL_LIMIT);
        void executeSearch(searchFilters, false);
    }, [location.search, executeSearch]);

    const handleSetFilters = useCallback((newFilters: OfferSearchFilters) => {
        const normalized = toStateFilters(newFilters);
        if (filtersEquals(normalized, filters)) {
            return;
        }

        setFiltersState(normalized);
        setResults([]);
        setHasMore(false);

        const searchStr = OfferUtil.prepareUrlParams(normalized, defaultOfferFilters);
        const newUrl = searchStr ? `?${searchStr}` : '';

        if (newUrl !== location.search) {
            navigate({ pathname: location.pathname, search: newUrl }, { replace: true });
        } else {
            const searchFilters = toSearchFilters(normalized, 0, INITIAL_LIMIT);
            void executeSearch(searchFilters, false);
        }
    }, [filters, navigate, location.pathname, location.search, executeSearch]);

    const resultsLength = results.length;

    const loadMore = useCallback(() => {
        if (loading || loadingMore || !hasMore) {
            return;
        }

        const searchFilters = toSearchFilters(filters, resultsLength, LOAD_MORE_LIMIT);
        void executeSearch(searchFilters, true);
    }, [loading, loadingMore, hasMore, filters, resultsLength, executeSearch]);

    const resetFilters = useCallback(() => {
        handleSetFilters(defaultOfferFilters);
    }, [handleSetFilters]);

    return (
        <OfferSearchContext.Provider value={{
            filters,
            setFilters: handleSetFilters,
            results,
            loading,
            loadingMore,
            hasMore,
            loadMore,
            resetFilters,
            defaultFilters: defaultOfferFilters
        }}>
            {children}
        </OfferSearchContext.Provider>
    );
};

export default OfferSearchProvider;