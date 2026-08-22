import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWorkersSearch } from "./WorkersSearchProvider";
import { useUserContext } from "user/UserProvider";
import { AppConfig } from "@shared/AppConfig";
import { useGlobalContext } from "global/providers/GlobalProvider";
import WorkerSearchListItem from "employee/components/ListItems/WorkerSearchListItem";
import { useGoogleMapMarkers } from "global/hooks/useGoogleMapMarkers";
import MapOverlayCarousel from "global/components/map/MapOverlayCarousel";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';
const MAP_SESSION_KEY = 'workerMapSelectedIndex';

const WorkersMapSearchResults: React.FC = () => {
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

    return (
        <div className="map-search-container">
            {selectedWorker && (
                <MapOverlayCarousel
                    selectedIndex={selectedIndex}
                    total={sortedItems.length}
                    directionRef={directionRef}
                    onPrev={handlePrev}
                    onNext={handleNext}
                >
                    <WorkerSearchListItem worker={selectedWorker} first last className="primary-bg" disableDefaultBorder />
                </MapOverlayCarousel>
            )}
            <div ref={mapRef} className="map-canvas" />
        </div>
    );
};

export default WorkersMapSearchResults;
