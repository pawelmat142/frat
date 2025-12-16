import { RefCallback, useCallback, useEffect, useRef } from "react";

export interface InfiniteScrollOptions {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void | Promise<void>;
    enabled?: boolean;
    root?: Element | Document | null;
    rootMargin?: string;
    threshold?: number;
}

export const useInfiniteScroll = <T extends Element = HTMLDivElement>({
    hasMore,
    isLoading,
    onLoadMore,
    enabled = true,
    root = null,
    rootMargin = "200px 0px",
    threshold = 0,
}: InfiniteScrollOptions): RefCallback<T> => {
    const sentinelRef = useRef<T | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const hasMoreRef = useRef(hasMore);
    const loadingRef = useRef(isLoading);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    useEffect(() => {
        loadingRef.current = isLoading;
    }, [isLoading]);

    const disconnectObserver = useCallback(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
    }, []);

    const refCallback: RefCallback<T> = useCallback((node: T | null) => {
        disconnectObserver();
        sentinelRef.current = node;

        if (!node || !enabled) {
            return;
        }

        observerRef.current = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry?.isIntersecting) {
                return;
            }
            if (!hasMoreRef.current || loadingRef.current) {
                return;
            }

            loadingRef.current = true;
            onLoadMore();
        }, {
            root,
            rootMargin,
            threshold,
        });

        observerRef.current.observe(node);
    }, [disconnectObserver, enabled, onLoadMore, root, rootMargin, threshold]);

    useEffect(() => {
        return () => {
            disconnectObserver();
            sentinelRef.current = null;
        };
    }, [disconnectObserver]);

    return refCallback;
};
