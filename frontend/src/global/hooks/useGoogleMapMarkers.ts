import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppConfig } from '@shared/AppConfig';
import GoogleMapsLoader from 'global/utils/GoogleMapsLoader';
import { PositionUtil } from '@shared/utils/PositionUtil';
import { Position } from '@shared/interfaces/MapsInterfaces';

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';

export interface UseGoogleMapMarkersOptions<T> {
    /** Items to display as markers on the map. */
    items: T[];
    /** Map center (e.g. user's current position or app default). */
    center: Position;
    /** sessionStorage key used to persist the selected index across navigation. */
    sessionKey: string;
    /** Returns the lat/lng for a given item, or null/undefined if unavailable. */
    getPosition: (item: T) => { lat: number; lng: number } | null | undefined;
    /** Returns the marker tooltip title for a given item. */
    getTitle?: (item: T) => string;
}

function sortByDistance<T>(
    items: T[],
    getPosition: (item: T) => { lat: number; lng: number } | null | undefined,
    center: Position,
): T[] {
    const withPos = items.filter(i => {
        const p = getPosition(i);
        return p?.lat != null && p?.lng != null;
    });
    return [...withPos].sort((a, b) =>
        PositionUtil.getDistanceFromToInMeters(center, getPosition(a) as Position) -
        PositionUtil.getDistanceFromToInMeters(center, getPosition(b) as Position),
    );
}

/**
 * Generic hook that initialises a Google Map, places item markers, keeps a
 * selected-index in sync with sessionStorage, and exposes prev/next navigation.
 *
 * Domain-agnostic: works with workers, offers, or any other type that has a
 * geographic position by providing a `getPosition` accessor.
 */
export function useGoogleMapMarkers<T>({
    items,
    center,
    sessionKey,
    getPosition,
    getTitle = () => '',
}: UseGoogleMapMarkersOptions<T>) {
    const { t } = useTranslation();

    const [sortedItems, setSortedItems] = useState<T[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const directionRef = useRef(1);

    const mapRef           = useRef<HTMLDivElement>(null);
    const mapInstanceRef   = useRef<google.maps.Map | null>(null);
    const markersRef       = useRef<google.maps.Marker[]>([]);
    const hasRestoredIndex = useRef(false);

    const saveIndex = (index: number) => sessionStorage.setItem(sessionKey, String(index));

    const restoreIndex = (sorted: T[]): number =>
        Math.min(
            Math.max(parseInt(sessionStorage.getItem(sessionKey) ?? '0', 10), 0),
            Math.max(sorted.length - 1, 0),
        );

    const centerOnItem = (item?: T, resetZoom = false) => {
        const map = mapInstanceRef.current;
        if (!map || !item) return;
        const pos = getPosition(item);
        if (!pos) return;
        map.panTo({ lat: pos.lat, lng: pos.lng });
        if (resetZoom) map.setZoom(12);
    };

    const placeMarkers = (map: google.maps.Map, sorted: T[]) => {
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        sorted.forEach((item, index) => {
            const pos = getPosition(item);
            if (!pos) return;
            const marker = new google.maps.Marker({
                position: { lat: pos.lat, lng: pos.lng },
                map,
                title: getTitle(item),
            });
            marker.addListener('click', () => {
                setSelectedIndex(prev => {
                    directionRef.current = index > prev ? 1 : -1;
                    saveIndex(index);
                    return index;
                });
            });
            markersRef.current.push(marker);
        });
    };

    // Initialise map once on mount
    useEffect(() => {
        let cancelled = false;

        const initMap = async () => {
            if (!mapRef.current || !API_KEY) return;
            await GoogleMapsLoader.load(API_KEY);
            if (cancelled || !mapRef.current) return;

            const map = new google.maps.Map(mapRef.current, {
                center,
                zoom: 10,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });
            mapInstanceRef.current = map;

            new google.maps.Marker({
                position: center,
                map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                },
                title: t('map.yourLocation', { defaultValue: 'Your location' }),
                zIndex: 100,
            });

            const sorted = sortByDistance(items, getPosition, center);
            setSortedItems(sorted);
            placeMarkers(map, sorted);

            if (sorted.length > 0) {
                const idx = restoreIndex(sorted);
                hasRestoredIndex.current = true;
                setSelectedIndex(idx);
                centerOnItem(sorted[idx], true);
            }
        };

        initMap();
        return () => { cancelled = true; };
    }, []); // eslint-disable-line

    // Sync markers whenever items change (new search results)
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const sorted = sortByDistance(items, getPosition, center);
        setSortedItems(sorted);

        const idx = !hasRestoredIndex.current ? restoreIndex(sorted) : 0;
        hasRestoredIndex.current = true;

        setSelectedIndex(idx);
        placeMarkers(map, sorted);
        centerOnItem(sorted[idx], true);
    }, [items]); // eslint-disable-line

    // Pan to selected item when index changes
    useEffect(() => {
        centerOnItem(sortedItems[selectedIndex]);
    }, [selectedIndex]); // eslint-disable-line

    const handlePrev = () => {
        directionRef.current = -1;
        setSelectedIndex(i => { const next = Math.max(0, i - 1); saveIndex(next); return next; });
    };

    const handleNext = () => {
        directionRef.current = 1;
        setSelectedIndex(i => { const next = Math.min(sortedItems.length - 1, i + 1); saveIndex(next); return next; });
    };

    return { mapRef, sortedItems, selectedIndex, directionRef, handlePrev, handleNext };
}
