import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { GeocodedPosition } from '@shared/interfaces/EmployeeProfileI';
import Button from '../../controls/Button';
import { BtnModes } from 'global/interface/controls.interface';
import { MapUtil } from 'global/utils/MapUtil';
import PositionSelectorSearchbar from './PositionSelectorSearchbar';

// TODO uprawnienie do lokalizacji
// TODO materializujemy miasta
// TODO forma / wizarda wydzielamy i reuzywamy w ofertach

interface PositionSelectorContentProps {
    initialPosition?: GeocodedPosition | null;
    onChange: (position: GeocodedPosition | null) => void;
    onCancel: () => void;
}

const PositionSelectorContent: React.FC<PositionSelectorContentProps> = ({
    initialPosition,
    onChange,
    onCancel,
}) => {

    const [selectedPosition, setSelectedPosition] = useState<GeocodedPosition | null>(null);
    const [currentPosition, setCurrentPosition] = useState<GeocodedPosition | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);

    const { t } = useTranslation();
    const initialZoom = 15;

    useEffect(() => {
        initializeMap();
    }, []);

    const initializeMap = async () => {
        if (!mapRef.current) return;

        if (initialPosition) {
            createMap(initialPosition);
            return;
        }
        await initMapByLocation();
    };

    const initMapByLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };
                    createMap(coords);
                },
                async () => {
                    const coords = await getDefaultCoords();
                    createMap(coords);
                },
                { timeout: 3000 }
            );
        } else {
            const coords = await getDefaultCoords();
            createMap(coords);
        }
    };

    const createMap = (position: { lat: number; lng: number }) => {
        if (!mapRef.current) return;
        const map = new google.maps.Map(mapRef.current, {
            center: position,
            zoom: initialZoom,
        });
        mapInstanceRef.current = map;
        const marker = new google.maps.Marker({
            position: position,
            map: map,
            draggable: true,
        });
        markerRef.current = marker;
        setCurrentPosition(position);

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                const newPosition = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                };
                updatePosition(newPosition);
                marker.setPosition(e.latLng);
            }
        });

        marker.addListener('dragend', () => {
            const markerPosition = marker.getPosition();
            if (markerPosition) {
                updatePosition({
                    lat: markerPosition.lat(),
                    lng: markerPosition.lng(),
                });
            }
        });
    };

    const updatePosition = async (position: { lat: number; lng: number }) => {
        mapInstanceRef.current?.panTo(new google.maps.LatLng(position.lat, position.lng));
        markerRef.current?.setPosition(new google.maps.LatLng(position.lat, position.lng));
        try {
            const geoPosition = await MapUtil.getGeocodedLocation(position, new google.maps.Geocoder());

            console.log('Geocoded position:', geoPosition);
            setSelectedPosition(geoPosition);
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error(t('employeeProfile.error.getGeocodedLocation'));
        }
    };

    const getDefaultCoords = async (): Promise<{ lat: number; lng: number }> => {
        try {
            const res = await fetch('https://ip-api.com/json/');
            const data = await res.json();
            if (data && typeof data.lat === 'number' && typeof data.lon === 'number') {
                return { lat: data.lat, lng: data.lon };
            }
        } catch (e) {
            console.error(e);
        }
        // fallback Warszawa
        return { lat: 52.2297, lng: 21.0122 };
    };

    return (
        <div className="position-selector-popup-overlay fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
            <div className="position-selector-popup secondary-bg rounded-lg shadow-xl w-full h-full md:w-[90%] md:h-[90%] max-w-6xl flex flex-col">

                <PositionSelectorSearchbar
                    mapInstanceRef={mapInstanceRef.current}
                    updatePosition={updatePosition}
                    onCancel={onCancel}
                    displaValue={selectedPosition?.fullAddress}
                />

                <div className="position-selector-map-container flex-1 relative">
                    <div ref={mapRef} className="w-full h-full" />
                </div>

                <div className="position-selector-footer px-4 py-2 flex gap-4 justify-between border-t">
                    <Button onClick={() => onChange(null)} mode={BtnModes.ERROR_TXT}>
                        {t('common.reset')}
                    </Button>
                    <Button onClick={() => onChange(selectedPosition || currentPosition)}>
                        {t('common.confirm')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PositionSelectorContent;
