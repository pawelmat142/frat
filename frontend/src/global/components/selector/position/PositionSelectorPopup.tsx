import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Position } from '@shared/interfaces/EmployeeProfileI';
import Button from '../../controls/Button';
import { BtnModes } from 'global/interface/controls.interface';
import CloseIcon from '@mui/icons-material/Close';

interface PositionSelectorPopupProps {
    initialPosition?: Position | null;
    initializeByCountryCode?: string;
    onConfirm: (position: Position | null) => void;
    onCancel: () => void;
}

const PositionSelectorPopup: React.FC<PositionSelectorPopupProps> = ({
    initialPosition,
    initializeByCountryCode,
    onConfirm,
    onCancel,
}) => {
    const apiKey = ""; // TODO

    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);

    const { t } = useTranslation();

    const initialZoom = 7;

    useEffect(() => {
        // Load Google Maps script
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey || ''}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => initializeMap();
            document.head.appendChild(script);
        } else {
            initializeMap();
        }
    }, []);

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

    const initializeMap = async () => {
        if (!mapRef.current) return;

        if (initialPosition) {
            createMap(initialPosition);
            return;
        }

        if (initializeByCountryCode) {
            await initMapByCountryCode(initializeByCountryCode);
            return;
        }

        await initMapByLocation();
    };

    const initMapByCountryCode = async (countryCode: string) => {
        try {
            const code = countryCode.toUpperCase();
            const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const country = data[0];
                if (country.capitalInfo && country.capitalInfo.latlng && country.capitalInfo.latlng.length === 2) {
                    const [lat, lng] = country.capitalInfo.latlng;
                    createMap({ lat, lng });
                    return;
                }
                if (country.latlng && country.latlng.length === 2) {
                    const [lat, lng] = country.latlng;
                    createMap({ lat, lng });
                    return;
                }
            }
        } catch (e) {
            toast.error("Could not initialize map by country code");
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
        try {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ location: position });

            if (result.results[0]) {
                const fullPosition: Position = {
                    ...position,
                    address: result.results[0].formatted_address,
                };
                setSelectedPosition(fullPosition);
            } else {
                const fullPosition: Position = { ...position };
                setSelectedPosition(fullPosition);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            const fullPosition: Position = { ...position };
            setSelectedPosition(fullPosition);
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    const handleConfirm = () => {
        onConfirm(selectedPosition || currentPosition);
    };

    return (
        <div className="position-selector-popup-overlay fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
            <div className="position-selector-popup secondary-bg rounded-lg shadow-xl w-full h-full md:w-[90%] md:h-[90%] max-w-6xl flex flex-col">
                <div className="position-selector-header p-4 flex items-center justify-between border-b">
                    <h2 className="text-xl font-semibold">{t('employee.selectPosition')}</h2>
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="position-selector-map-container flex-1 relative">
                    <div ref={mapRef} className="w-full h-full" />
                </div>

                <div className="position-selector-footer p-4 flex gap-4 justify-between border-t">
                    <Button onClick={handleCancel} mode={BtnModes.ERROR_TXT}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleConfirm}>
                        {t('common.confirm')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PositionSelectorPopup;
