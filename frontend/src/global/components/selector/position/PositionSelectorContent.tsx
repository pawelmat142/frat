import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Button from '../../controls/Button';
import { BtnModes, FloatingInputModes } from 'global/interface/controls.interface';
import GoogleMapsLoader from 'global/utils/GoogleMapsLoader';
import { GoogleMapService } from 'global/services/GoogleMapService';
import { Position, GeocodedPosition } from '@shared/interfaces/MapsInterfaces';
import { AppConfig } from '@shared/AppConfig';
import FloatingPlaceSearch from 'global/components/controls/FloatingPlaceSearch';

interface PositionSelectorContentProps {
    initialPosition?: Position;
    onChange: (position: GeocodedPosition | null) => void;
    close: () => void;
    desktop?: boolean;
}

const PositionSelectorContent: React.FC<PositionSelectorContentProps> = ({
    initialPosition,
    onChange,
    close,
    desktop = false,
}) => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''; // provide via .env.local
    if (!apiKey) {
        throw new Error('Google Maps API key is not defined in environment variables.');
    }

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

    useEffect(() => {
        if (!desktop) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };

        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [close, desktop]);

    const initializeMap = async () => {
        if (!mapRef.current || !apiKey) {
            toast.error(t('employeeProfile.error.getGeocodedLocation'));
            onChange(null);
            return;
        }

        await GoogleMapsLoader.load(apiKey);

        if (initialPosition) {
            const geoPosition = await GoogleMapService.getGeocodedLocation({
                lat: initialPosition.lat,
                lng: initialPosition.lng,
            }, apiKey);
            setSelectedPosition(geoPosition);
            createMap(initialPosition);
        } else {
            // Fallback to default position (Warsaw) if no initial position provided
            const defaultPosition = AppConfig.MAP.DEFAUT_POSITION
            createMap(defaultPosition);
        }
    };

    const createMap = async (position: { lat: number; lng: number }) => {
        await GoogleMapsLoader.load(apiKey);

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
        setCurrentPosition({ lat: position.lat, lng: position.lng } as GeocodedPosition);

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
            const geoPosition = await GoogleMapService.getGeocodedLocation(position, process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '');
            setSelectedPosition(geoPosition);
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error(t('employeeProfile.error.getGeocodedLocation'));
        }
    };

    return (
        <div
            className={`position-selector-popup-overlay${desktop ? ' position-selector-popup-overlay--desktop' : ''}`}
            role="dialog"
            aria-modal={desktop}
            aria-label={t('employeeProfile.form.location')}
            onClick={desktop ? close : undefined}
        >
            <div className="position-selector-popup secondary-bg" onClick={event => event.stopPropagation()}>

                <div className='px-2 py-2 primary-bg flex items-center'>

                    <FloatingPlaceSearch
                        className="position-selector-searchbar"
                        mode={FloatingInputModes.THIN}
                        name="freeText"
                        displayValue={selectedPosition?.fullAddress}
                        clearIconClassName="position-selector-search-clear"
                        onSelect={result => updatePosition({ lat: result.lat, lng: result.lng })}
                        mapInstanceRef={mapInstanceRef.current}
                        label={t('employeeProfile.form.freeText')}
                        fullWidth
                    />
                </div>

                <div className="position-selector-map-container flex-1 relative">
                    <div ref={mapRef} className="w-full h-full" />
                </div>

                <div className="position-selector-footer px-4 py-3 flex gap-4 justify-between border-t ">
                    <Button onClick={() => onChange(null)} mode={BtnModes.ERROR_TXT}>
                        {t('common.clear')}
                    </Button>
                    <div className="flex gap-2">
                        <Button onClick={close} mode={BtnModes.SECONDARY_TXT}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={() => onChange(selectedPosition || currentPosition)}>
                            {t('common.confirm')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PositionSelectorContent;
