import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useWorkersSearch } from "./WorkersSearchProvider";
import { useUserContext } from "user/UserProvider";
import { AppConfig } from "@shared/AppConfig";
import { PositionUtil } from "@shared/utils/PositionUtil";
import GoogleMapsLoader from "global/utils/GoogleMapsLoader";
import { WorkerWithMutualFriends } from "@shared/interfaces/WorkerI";
import { Position } from "@shared/interfaces/MapsInterfaces";
import { useGlobalContext } from "global/providers/GlobalProvider";
import WorkerSearchListItem from "employee/components/ListItems/WorkerSearchListItem";
import IconButton from "global/components/controls/IconButon";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';
const MAP_INDEX_KEY = 'workerMapSelectedIndex';

const SLIDE_VARIANTS = {
    enter: (d: number) => ({ x: 48 * d, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: -48 * d, opacity: 0 }),
};

const sortByDistance = (results: WorkerWithMutualFriends[], center: Position): WorkerWithMutualFriends[] => {
    const withPos = results.filter(w => w.geocodedPosition?.lat != null && w.geocodedPosition?.lng != null);
    return [...withPos].sort((a, b) =>
        PositionUtil.getDistanceFromToInMeters(center, { lat: a.geocodedPosition!.lat, lng: a.geocodedPosition!.lng }) -
        PositionUtil.getDistanceFromToInMeters(center, { lat: b.geocodedPosition!.lat, lng: b.geocodedPosition!.lng })
    );
};

// ─── Overlay panel ────────────────────────────────────────────────────────────

interface MapWorkerOverlayProps {
    worker: WorkerWithMutualFriends;
    selectedIndex: number;
    total: number;
    directionRef: React.MutableRefObject<number>;
    onPrev: () => void;
    onNext: () => void;
}

const MapWorkerOverlay: React.FC<MapWorkerOverlayProps> = ({ worker, selectedIndex, total, directionRef, onPrev, onNext }) => (
    <div style={{ overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', flexShrink: 0 }}>
        <AnimatePresence mode="wait" custom={directionRef.current}>
            <motion.div
                key={selectedIndex}
                custom={directionRef.current}
                variants={SLIDE_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
                <WorkerSearchListItem worker={worker} first last className="primary-bg" disableDefaultBorder />
            </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-center gap-6 primary-bg">
            <IconButton icon={<FaChevronLeft />} onClick={onPrev} disabled={selectedIndex === 0} className="px-6"/>
            <span className="s-font secondary-text">{selectedIndex + 1}/{total}</span>
            <IconButton icon={<FaChevronRight />} onClick={onNext} disabled={selectedIndex === total - 1} className="px-6 " />
        </div>
    </div>
);

// ─── Map logic hook ───────────────────────────────────────────────────────────

const useWorkerMap = (results: WorkerWithMutualFriends[], userPosition: Position | undefined) => {
    const { t } = useTranslation();

    const [sortedWorkers, setSortedWorkers] = useState<WorkerWithMutualFriends[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const directionRef = useRef(1);

    const mapRef               = useRef<HTMLDivElement>(null);
    const mapInstanceRef       = useRef<google.maps.Map | null>(null);
    const markersRef           = useRef<google.maps.Marker[]>([]);
    const hasRestoredIndex     = useRef(false);

    const center = userPosition ?? AppConfig.DEFAUT_POSITION;

    const saveIndex = (index: number) => sessionStorage.setItem(MAP_INDEX_KEY, String(index));

    const restoreIndex = (sorted: WorkerWithMutualFriends[]): number =>
        Math.min(Math.max(parseInt(sessionStorage.getItem(MAP_INDEX_KEY) ?? '0', 10), 0), sorted.length - 1);

    const centerOnWorker = (worker?: WorkerWithMutualFriends, resetZoom = false) => {
        const map = mapInstanceRef.current;
        if (!map || !worker?.geocodedPosition) return;
        map.panTo({ lat: worker.geocodedPosition.lat, lng: worker.geocodedPosition.lng });
        if (resetZoom) map.setZoom(12);
    };

    const placeWorkerMarkers = (map: google.maps.Map, sorted: WorkerWithMutualFriends[]) => {
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        sorted.forEach((worker, index) => {
            const marker = new google.maps.Marker({
                position: { lat: worker.geocodedPosition!.lat, lng: worker.geocodedPosition!.lng },
                map,
                title: worker.displayName ?? '',
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
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4285F4', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 },
                title: t('map.yourLocation', { defaultValue: 'Your location' }),
                zIndex: 100,
            });

            const sorted = sortByDistance(results, center);
            setSortedWorkers(sorted);
            placeWorkerMarkers(map, sorted);

            if (sorted.length > 0) {
                // Results already available at mount (back-navigation) — restore index.
                // If results are empty, ctx.results effect will handle it when they arrive.
                const idx = restoreIndex(sorted);
                hasRestoredIndex.current = true;
                setSelectedIndex(idx);
                centerOnWorker(sorted[idx], true);
            }
        };

        initMap();
        return () => { cancelled = true; };
    }, []); // eslint-disable-line

    // Sync markers when search results change
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const sorted = sortByDistance(results, center);
        setSortedWorkers(sorted);

        // initMap already restored the index when results were available at mount.
        // Here we handle: (a) fresh page load where results arrive after map init,
        // (b) new search while map is open → always reset to 0.
        const idx = !hasRestoredIndex.current ? restoreIndex(sorted) : 0;
        hasRestoredIndex.current = true;

        setSelectedIndex(idx);
        placeWorkerMarkers(map, sorted);
        centerOnWorker(sorted[idx], true);
    }, [results]); // eslint-disable-line

    // Pan to selected worker on index change
    useEffect(() => {
        centerOnWorker(sortedWorkers[selectedIndex]);
    }, [selectedIndex]); // eslint-disable-line

    const handlePrev = () => {
        directionRef.current = -1;
        setSelectedIndex(i => { const next = Math.max(0, i - 1); saveIndex(next); return next; });
    };

    const handleNext = () => {
        directionRef.current = 1;
        setSelectedIndex(i => { const next = Math.min(sortedWorkers.length - 1, i + 1); saveIndex(next); return next; });
    };

    return { mapRef, sortedWorkers, selectedIndex, directionRef, handlePrev, handleNext };
};

// ─── Main component ───────────────────────────────────────────────────────────

const WorkersMapSearchResults: React.FC = () => {
    const { t } = useTranslation();
    const ctx = useWorkersSearch();
    const userCtx = useUserContext();
    const globalCtx = useGlobalContext();

    const { mapRef, sortedWorkers, selectedIndex, directionRef, handlePrev, handleNext } =
        useWorkerMap(ctx.results, userCtx.position ?? undefined);

    useEffect(() => {
        globalCtx.hideFooter();
        return () => globalCtx.showFooter();
    }, []); // eslint-disable-line

    if (!API_KEY) {
        return (
            <div className="flex flex-col items-center justify-center mt-20">
                <p className="xl-font secondary-text">{t('map.notAvailable')}</p>
            </div>
        );
    }

    const selectedWorker = sortedWorkers[selectedIndex];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 80px)', width: '100%' }}>
            {selectedWorker && (
                <MapWorkerOverlay
                    worker={selectedWorker}
                    selectedIndex={selectedIndex}
                    total={sortedWorkers.length}
                    directionRef={directionRef}
                    onPrev={handlePrev}
                    onNext={handleNext}
                />
            )}
            <div ref={mapRef} style={{ flex: 1, minHeight: 0 }} />
        </div>
    );
};

export default WorkersMapSearchResults;
