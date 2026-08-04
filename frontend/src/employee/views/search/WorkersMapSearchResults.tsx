import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkersSearch } from "./WorkersSearchProvider";
import { useUserContext } from "user/UserProvider";
import { AppConfig } from "@shared/AppConfig";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { Path } from "../../../path";
import GoogleMapsLoader from "global/utils/GoogleMapsLoader";
import { WorkerWithMutualFriends } from "@shared/interfaces/WorkerI";
import { Position } from "@shared/interfaces/MapsInterfaces";

const MIN_BOUNDS_WORKERS = 5;
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';
const CHIP_COLOR = '#0e0e0e';
const MAX_NAME_LEN = 20;

const escapeHtml = (str: string): string =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const createWorkerIcon = (name: string): google.maps.Icon => {
    const label = escapeHtml(name.length > MAX_NAME_LEN ? name.slice(0, MAX_NAME_LEN) + '…' : name);
    const charWidth = 7;
    const hPad = 14;
    const width = Math.max(80, label.length * charWidth + hPad * 2);
    const chipH = 28;
    const ptrH = 10;
    const height = chipH + ptrH;
    const midX = width / 2;
    const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`,
        `<rect x="0.75" y="0.75" width="${width - 1.5}" height="${chipH - 1.5}" rx="10" ry="10" fill="white" stroke="${CHIP_COLOR}" stroke-width="1.5"/>`,
        `<text x="${midX}" y="${chipH / 2 + 5}" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="#1a1a1a">${label}</text>`,
        `<polygon points="${midX - 6},${chipH} ${midX + 6},${chipH} ${midX},${height}" fill="${CHIP_COLOR}"/>`,
        `</svg>`,
    ].join('');
    return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        anchor: new google.maps.Point(midX, height),
        scaledSize: new google.maps.Size(width, height),
    };
};

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
        <button id="${btnId}" style="width:100%;background:${CHIP_COLOR};color:white;border:none;border-radius:8px;padding:8px 0;cursor:pointer;font-size:13px;font-weight:600">
            ${viewProfileLabel}
        </button>
    </div>`;
};

const WorkersMapSearchResults: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const ctx = useWorkersSearch();
    const userCtx = useUserContext();

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;

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

            placeWorkerMarkers(map, ctx.results);
        };

        initMap();
        return () => { cancelled = true; };
    }, []); // eslint-disable-line

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        placeWorkerMarkers(mapInstanceRef.current, ctx.results);
    }, [ctx.results]); // eslint-disable-line

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

    const placeWorkerMarkers = (map: google.maps.Map, results: WorkerWithMutualFriends[]) => {
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        const withPos = results.filter(w => w.geocodedPosition?.lat != null && w.geocodedPosition?.lng != null);
        if (!withPos.length) return;

        const center: Position = userCtx.position ?? AppConfig.DEFAUT_POSITION;

        const sorted = [...withPos].sort((a, b) =>
            PositionUtil.getDistanceFromToInMeters(center, { lat: a.geocodedPosition!.lat, lng: a.geocodedPosition!.lng }) -
            PositionUtil.getDistanceFromToInMeters(center, { lat: b.geocodedPosition!.lat, lng: b.geocodedPosition!.lng })
        );

        sorted.forEach(worker => {
            const pos = { lat: worker.geocodedPosition!.lat, lng: worker.geocodedPosition!.lng };
            const distance = worker.point
                ? userCtx.getDistanceInfo(PositionUtil.fromGeoPoint(worker.point))
                : '';
            const marker = new google.maps.Marker({
                position: pos,
                map,
                icon: createWorkerIcon(worker.displayName ?? ''),
            });
            marker.addListener('click', () => openInfoWindow(map, marker, worker, distance));
            markersRef.current.push(marker);
        });

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(center);
        sorted.slice(0, MIN_BOUNDS_WORKERS).forEach(w =>
            bounds.extend({ lat: w.geocodedPosition!.lat, lng: w.geocodedPosition!.lng })
        );
        map.fitBounds(bounds);
    };

    if (!API_KEY) {
        return (
            <div className="flex flex-col items-center justify-center mt-20">
                <p className="xl-font secondary-text">{t('map.notAvailable', { defaultValue: 'Map not available.' })}</p>
            </div>
        );
    }

    return <div ref={mapRef} style={{ height: 'calc(100vh - 160px)', width: '100%' }} />;
};

export default WorkersMapSearchResults;
