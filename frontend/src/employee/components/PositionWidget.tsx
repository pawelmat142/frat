import { useEffect, useRef } from 'react';
import { Position } from "@shared/interfaces/MapsInterfaces";
import GoogleMapsLoader from 'global/utils/GoogleMapsLoader';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export interface Props {
    position: Position | null;
}

const PositionWidget: React.FC<Props> = ({ position }) => {

    const { t } = useTranslation();

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

    const initMap = async () => {
        if (!mapRef.current || !apiKey || !position) {
            toast.error(t('employeeProfile.error.getGeocodedLocation'));
            return;
        }

        await GoogleMapsLoader.load(apiKey)

        const center = { lat: position!.lat, lng: position!.lng };

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = new google.maps.Map(mapRef.current!, {
                center,
                zoom: 11,
                disableDefaultUI: true,
                gestureHandling: 'none',
                zoomControl: false,
            });
            // markerRef.current = new google.maps.Marker({
            //     position: center,
            //     map: mapInstanceRef.current,
            // });
        } else {
            mapInstanceRef.current.setCenter(center);
            markerRef.current?.setPosition(center);
        }
    }

    useEffect(() => {
        if (!position || !mapRef.current || !apiKey) return;
        initMap();
        return () => {
            // reset on unmount so StrictMode double-invoke recreates the map on a fresh div
            mapInstanceRef.current = null;
            markerRef.current = null;
        };
    }, [position]);

    if (!position) {
        return null;
    }

    return (
        <div className="position-widget relative w-full" style={{ height: '200px' }}>
            <div ref={mapRef} className="absolute inset-0" />
            {/* overlay blocks all pointer interactions */}
            <div className="absolute inset-0" style={{ pointerEvents: 'all' }} />
        </div>
    );
}
export default PositionWidget;
