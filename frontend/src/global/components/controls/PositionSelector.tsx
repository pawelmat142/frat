import { useState, useRef, useEffect, forwardRef } from 'react';
import { BtnModes, InputInterface } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';
import PushPinIcon from '@mui/icons-material/PushPin';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { Position } from '@shared/def/employee-profile.def';
import FormError from './FormError';


interface PositionSelectorProps extends Omit<InputInterface, 'type' | 'value' | 'onChange'> {
    value?: Position | null;
    onChange?: (position: Position | null) => void;
}

const PositionSelector = forwardRef<HTMLInputElement, PositionSelectorProps>(
    ({
        fullWidth = false,
        className = '',
        disabled,
        label,
        value,
        id,
        required,
        name,
        center,
        onChange,
        error
    }, ref) => {

    const apiKey = "" //TODO

    const [showMap, setShowMap] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(value || null);
    const [initialPosition, setInitialPosition] = useState<Position | null>(value || null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);

    const { t } = useTranslation();

    const initialZoom = 7

    let myClass = `pp-position-selector ${className}`;
    if (fullWidth) {
        myClass += ' w-full';
    } else {
        myClass += ' w-fit';
    }
    if (disabled) {
        myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
    }

    useEffect(() => {
        setSelectedPosition(value || null);
    }, [value]);

    useEffect(() => {
        if (!showMap) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (mapContainerRef?.current && !mapContainerRef?.current?.contains(event.target as Node)) {
                setShowMap(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMap]);

    useEffect(() => {
        if (!showMap || !mapRef.current) return;

        // Load Google Maps script if not already loaded
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey || ''}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = initializeMap;
            document.head.appendChild(script);
        } else {
            initializeMap();
        }
    }, [showMap]);



    // Pobierz domyślne współrzędne z ip-api.com
    const getDefaultCoords = async (): Promise<{ lat: number; lng: number }> => {
        try {
            const res = await fetch('https://ip-api.com/json/');
            const data = await res.json();
            if (data && typeof data.lat === 'number' && typeof data.lon === 'number') {
                return { lat: data.lat, lng: data.lon };
            }
        } catch (e) {}
        // fallback Warszawa
        return { lat: 52.2297, lng: 21.0122 };
    };

    const initializeMap = async () => {
        if (!mapRef.current) return;

        // Jeśli już wybrano pozycję, użyj jej
        if (selectedPosition) {
            createMap(selectedPosition);
            return;
        }

        // Spróbuj pobrać lokalizację z urządzenia
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
                    // Jeśli nie uda się pobrać, pobierz z API
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

    // Tworzy mapę i marker
    const createMap = (initialPosition: { lat: number; lng: number }) => {
        if (!mapRef.current) return;
        const map = new google.maps.Map(mapRef.current, {
            center: initialPosition,
            zoom: initialZoom,
        });
        mapInstanceRef.current = map;
        const marker = new google.maps.Marker({
            position: initialPosition,
            map: map,
            draggable: true,
        });
        markerRef.current = marker;
        setInitialPosition(initialPosition)
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                const position = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                };
                updatePosition(position);
                marker.setPosition(e.latLng);
            }
        });
        marker.addListener('dragend', () => {
            const position = marker.getPosition();
            if (position) {
                updatePosition({
                    lat: position.lat(),
                    lng: position.lng(),
                });
            }
        });
    };

    const updatePosition = async (position: { lat: number; lng: number }) => {
        // Try to get address from coordinates using Geocoding
        try {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ location: position });
            
            if (result.results[0]) {
                const fullPosition: Position = {
                    ...position,
                    address: result.results[0].formatted_address,
                };
                setSelectedPosition(fullPosition);
                if (onChange) {
                    onChange(fullPosition);
                }
            } else {
                const fullPosition: Position = { ...position };
                setSelectedPosition(fullPosition);
                if (onChange) {
                    onChange(fullPosition);
                }
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            const fullPosition: Position = { ...position };
            setSelectedPosition(fullPosition);
            if (onChange) {
                onChange(fullPosition);
            }
        }
    };

    const handleInputClick = () => {
        if (showMap) return;
        if (!disabled) setShowMap(true);
    };

    const handleClear = () => {
        if (onChange) {
            onChange(null);
        }
        setShowMap(false);
        setSelectedPosition(null);
    };

    const handleConfirm = () => {
        if (onChange) {
            onChange(selectedPosition || initialPosition);
        }
        setShowMap(false);
        setSelectedPosition(null);
    }

    const displayValue = selectedPosition
        ? selectedPosition.address || `${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`
        : '';

    return (
        <div className={`${myClass}${center ? ' mx-auto' : ''}`}>
            <ControlLabel id={id} label={label} required={required} />
            <div className={`pp-control${error ? ' pp-control-error' : ''}`} onClick={handleInputClick}>
                <input
                    ref={ref}
                    id={id}
                    name={name || id}
                    type="text"
                    value={displayValue}
                    className='pr-10'
                    disabled={disabled}
                    required={required}
                />
                <span className={`pp-position-selector-icon MuiSvgIcon-root${disabled ? ' disabled' : ''}`}>
                    <PushPinIcon fontSize="medium" />
                </span>
                {showMap && (
                    <div className="pp-position-selector-map" ref={mapContainerRef}>
                        <div className='pp-position-selector-map-content' ref={mapRef} />
                        <div className='flex gap-5 mt-5'>
                            <Button onClick={handleClear} mode={BtnModes.ERROR_TXT}>
                                {t('common.clear')}
                            </Button>
                            <Button onClick={handleConfirm}>
                                {t('common.confirm')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <FormError error={error} />
            
        </div>
    );
});

PositionSelector.displayName = 'PositionSelector';

export default PositionSelector;
