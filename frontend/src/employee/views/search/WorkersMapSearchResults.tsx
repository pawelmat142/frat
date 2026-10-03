import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWorkersSearch } from "./WorkersSearchProvider";
import { useUserContext } from "user/UserProvider";
import { AppConfig } from "@shared/AppConfig";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useGoogleMapMarkers } from "global/hooks/useGoogleMapMarkers";
import MapNavigation, { MapNavigationProps } from "global/components/map/MapNavigation";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';
const MAP_SESSION_KEY = 'workerMapSelectedIndex';

// TODO opcje z mapa dostosowac na desktop

interface Props {
    onNavigationChange?: (navigation: MapNavigationProps | null) => void;
}

const WorkersMapSearchResults: React.FC<Props> = ({ onNavigationChange }) => {
    const { t } = useTranslation();
    const ctx = useWorkersSearch();
    const userCtx = useUserContext();
    const globalCtx = useGlobalContext();

    const center = userCtx.position ?? AppConfig.MAP.DEFAUT_POSITION;

    const { mapRef, sortedItems, selectedIndex, directionRef, handlePrev, handleNext } =
        useGoogleMapMarkers({
            items: ctx.results,
            center,
            sessionKey: MAP_SESSION_KEY,
            getPosition: w => w.geocodedPosition,
            getTitle: w => w.displayName ?? '',
            selectedItem: ctx.selectedWorker,
            isSelectedItem: (worker, selectedWorker) => worker.workerId === selectedWorker.workerId,
        });

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

    const selectedWorker = sortedItems[selectedIndex];

    useEffect(() => {
        if (selectedWorker) {
            ctx.setSelectedWorker(selectedWorker);
        }
    }, [selectedWorker]);

    useEffect(() => {
        if (!globalCtx.isDesktop || !selectedWorker) {
            onNavigationChange?.(null);
            return;
        }

        onNavigationChange?.({
            selectedIndex,
            total: sortedItems.length,
            onPrev: handlePrev,
            onNext: handleNext,
        });
    }, [globalCtx.isDesktop, handleNext, handlePrev, onNavigationChange, selectedIndex, selectedWorker, sortedItems.length]);

    useEffect(() => () => onNavigationChange?.(null), [onNavigationChange]);

    return (
        <div className="map-search-container">
            {!globalCtx.isDesktop && selectedWorker && (
                <MapNavigation
                    selectedIndex={selectedIndex}
                    total={sortedItems.length}
                    onPrev={handlePrev}
                    onNext={handleNext}
                />
            )}
            <div ref={mapRef} className="map-canvas" />
        </div>
    );
};

export default WorkersMapSearchResults;
