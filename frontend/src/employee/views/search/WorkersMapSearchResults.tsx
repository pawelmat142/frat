import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useWorkersSearch } from "./WorkersSearchProvider";
import { useUserContext } from "user/UserProvider";
import { AppConfig } from "@shared/AppConfig";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { Path } from "../../../path";
import GoogleMapsLoader from "global/utils/GoogleMapsLoader";
import { WorkerWithMutualFriends } from "@shared/interfaces/WorkerI";
import { Position } from "@shared/interfaces/MapsInterfaces";
import { useGlobalContext } from "global/providers/GlobalProvider";
import WorkerSearchListItem from "employee/components/ListItems/WorkerSearchListItem";
import IconButton from "global/components/controls/IconButon";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';

const sortByDistance = (results: WorkerWithMutualFriends[], center: Position): WorkerWithMutualFriends[] => {
    const withPos = results.filter(w => w.geocodedPosition?.lat != null && w.geocodedPosition?.lng != null);
    return [...withPos].sort((a, b) =>
        PositionUtil.getDistanceFromToInMeters(center, { lat: a.geocodedPosition!.lat, lng: a.geocodedPosition!.lng }) -
        PositionUtil.getDistanceFromToInMeters(center, { lat: b.geocodedPosition!.lat, lng: b.geocodedPosition!.lng })
    );
};

const escapeHtml = (str: string): string =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const buildInfoContent = (
    worker: WorkerWithMutualFriends,
    distance: string,
    btnId: string,
    viewProfileLabel: string,
): string => {
    const avatarUrl = worker.avatarRef?.url ?? '';
    const views = worker.uniqueViewsCount ?? 0;
    const favorites = worker.favoritesCount ?? 0;
    const mutual = (worker.mutualFriendsUids ?? []).length;

    const statParts = [
        `<span>&#128065; ${views}</span>`,
        favorites > 0 ? `<span>&#9733; ${favorites}</span>` : '',
        mutual > 0 ? `<span>&#128101; ${mutual}</span>` : '',
        distance ? `<span>&#128205; ${escapeHtml(distance)}</span>` : '',
    ].filter(Boolean).join('<span style="color:#ccc;margin:0 4px">&middot;</span>');

    return `<div style="min-width:200px;padding:4px 0;font-family:Arial,sans-serif">
        <div style="display:flex;align-items:center;margin-bottom:10px">
            <div style="flex:1;min-width:0">
                <div style="font-weight:700;font-size:14px;margin-bottom:4px">${escapeHtml(worker.displayName)}</div>
                <div style="font-size:12px;color:#666;display:flex;flex-wrap:wrap;gap:6px">${statParts}</div>
            </div>
        </div>
        <button id="${btnId}" style="width:100%;background:#0e0e0e;color:white;border:none;border-radius:8px;padding:8px 0;cursor:pointer;font-size:13px;font-weight:600">
            ${viewProfileLabel}
        </button>
    </div>`;
};

const WorkersMapSearchResults: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const ctx = useWorkersSearch();
    const userCtx = useUserContext();
    const globalCtx = useGlobalContext();

    const [sortedWorkers, setSortedWorkers] = useState<WorkerWithMutualFriends[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;

    useEffect(() => {
        globalCtx.hideFooter();
        return () => globalCtx.showFooter();
    }, []);

    useEffect(() => {
        let cancelled = false;

        const initMap = async () => {
            if (!mapRef.current || !API_KEY) return;
            await GoogleMapsLoader.load(API_KEY);
            if (cancelled || !mapRef.current) return;

            const center: Position = userCtx.position ?? AppConfig.DEFAUT_POSITION;

            const map = new google.maps.Map(mapRef.current, {
                center,
                zoom: 10,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });
            mapInstanceRef.current = map;
            infoWindowRef.current = new google.maps.InfoWindow();

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

            const sorted = sortByDistance(ctx.results, center);
            setSortedWorkers(sorted);
            placeWorkerMarkers(map, sorted);
            centerOnWorker(map, sorted[0]);
        };

        initMap();
        return () => { cancelled = true; };
    }, []); // eslint-disable-line

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        const center = userCtx.position ?? AppConfig.DEFAUT_POSITION;
        const sorted = sortByDistance(ctx.results, center);
        setSortedWorkers(sorted);
        setSelectedIndex(0);
        placeWorkerMarkers(mapInstanceRef.current, sorted);
        centerOnWorker(mapInstanceRef.current, sorted[0]);
    }, [ctx.results]); // eslint-disable-line

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        centerOnWorker(mapInstanceRef.current, sortedWorkers[selectedIndex]);
    }, [selectedIndex]); // eslint-disable-line

    const openInfoWindow = (
        map: google.maps.Map,
        marker: google.maps.Marker,
        worker: WorkerWithMutualFriends,
        distance: string,
    ) => {
        const infoWindow = infoWindowRef.current;
        if (!infoWindow) return;

        const btnId = `iw-worker-${worker.workerId}`;
        infoWindow.setContent(buildInfoContent(
            worker,
            distance,
            btnId,
            t('common.viewProfile', { defaultValue: 'View profile' }),
        ));
        infoWindow.open(map, marker);

        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
            document.getElementById(btnId)?.addEventListener('click', () => {
                navigateRef.current(Path.getWorkerProfilePath(worker.displayName));
            });
        });
    };

    const centerOnWorker = (map: google.maps.Map, worker?: WorkerWithMutualFriends) => {
        if (!worker?.geocodedPosition) return;
        map.panTo({ lat: worker.geocodedPosition.lat, lng: worker.geocodedPosition.lng });
        map.setZoom(12);
    };

    const placeWorkerMarkers = (map: google.maps.Map, sorted: WorkerWithMutualFriends[]) => {
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        sorted.forEach(worker => {
            const pos = { lat: worker.geocodedPosition!.lat, lng: worker.geocodedPosition!.lng };
            const distance = worker.point
                ? userCtx.getDistanceInfo(PositionUtil.fromGeoPoint(worker.point))
                : '';
            const marker = new google.maps.Marker({
                position: pos,
                map,
                title: worker.displayName ?? '',
            });
            marker.addListener('click', () => openInfoWindow(map, marker, worker, distance));
            markersRef.current.push(marker);
        });
    };

    const handlePrev = () => setSelectedIndex(i => Math.max(0, i - 1));
    const handleNext = () => setSelectedIndex(i => Math.min(sortedWorkers.length - 1, i + 1));

    if (!API_KEY) {
        return (
            <div className="flex flex-col items-center justify-center mt-20">
                <p className="xl-font secondary-text">{t('map.notAvailable')}</p>
            </div>
        );
    }

    const selectedWorker = sortedWorkers[selectedIndex];

    return (
        <div style={{ position: 'relative', height: 'calc(100dvh - 80px)', width: '100%' }}>
            <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

            {selectedWorker && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    <WorkerSearchListItem
                        worker={selectedWorker}
                        first
                        last
                        className="primary-bg"
                        disableDefaultBorder
                    />
                    <div className="flex items-center justify-center gap-6 py-2 primary-bg">
                        <IconButton
                            icon={<FaChevronLeft />}
                            onClick={handlePrev}
                            disabled={selectedIndex === 0}
                        />
                        <span className="s-font secondary-text">
                            {selectedIndex + 1}/{sortedWorkers.length}
                        </span>
                        <IconButton
                            icon={<FaChevronRight />}
                            onClick={handleNext}
                            disabled={selectedIndex === sortedWorkers.length - 1}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkersMapSearchResults;
