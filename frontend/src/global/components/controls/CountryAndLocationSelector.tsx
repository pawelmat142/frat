import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GeocodedPosition, Position } from '@shared/interfaces/MapsInterfaces';
import { AppConfig } from '@shared/AppConfig';
import { GoogleMapService } from 'global/services/GoogleMapService';
import { toast } from 'react-toastify';
import CountrySelector from 'global/components/selector/CountrySelector';
import FloatingPlaceSearch, { PlaceSearchResult } from './FloatingPlaceSearch';
import FloatingStepSlider from './FloatingStepSlider';
import SkeletonControl from './SkeletonControl';
import { AnimatePresence, motion } from 'framer-motion';
import { PositionService } from 'global/services/PositionService';
import PositionSelector from '../selector/position/PositionSelector';
import { DEFAUT_POSITION } from 'offer/views/form/OfferFormStepOne';
import { useUserContext } from 'user/UserProvider';

export interface LocationFilterValue {
    locationCountry: string | null;
    geocodedPosition: GeocodedPosition | null;
    positionRadiusKm?: number;
}

export interface Config {
    locationOption: 'map' | 'searchbar',
    showRadiusSlider?: boolean;
}

export const defaultConfig: Config = {
    locationOption: 'searchbar',
    showRadiusSlider: true,
}

interface Props {
    value: LocationFilterValue;
    onChange: (value: LocationFilterValue) => void;
    errors?: {
        locationCountry?: { message?: string };
        geocodedPosition?: { message?: string };
    };
    className?: string;
    radiusSteps?: number[];
    countryRequired?: boolean;
    config?: Config;
}

const CountryAndLocationSelector: React.FC<Props> = ({
    value,
    onChange,
    errors,
    className = '',
    radiusSteps = [...AppConfig.RADIUS_STEPS_KM],
    countryRequired = true,
    config = defaultConfig,
}) => {
    const { t } = useTranslation();
    const userCtx = useUserContext();

    const [loadingCity, setLoadingCity] = useState(false);
    const [cityAnimating, setCityAnimating] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [countryCenter, setCountryCenter] = useState<Position | null>(null);

    React.useEffect(() => {
        if (!value.locationCountry || value.geocodedPosition) {
            setCountryCenter(null);
            return;
        }
        let cancelled = false;
        GoogleMapService.geocodeCountryCenter(value.locationCountry).then((pos) => {
            if (!cancelled) setCountryCenter(pos);
        });
        return () => { cancelled = true; };
    }, [value.locationCountry]);

    const handleCountryChange = (countryCode: string | null) => {
        onChange({
            locationCountry: countryCode,
            geocodedPosition: null,
            positionRadiusKm: undefined,
        });
    };

    const handleCitySelect = async (result: PlaceSearchResult) => {
        try {
            setLoadingCity(true);
            const geoPosition = await GoogleMapService.getGeoPosition({ lat: result.lat, lng: result.lng });
            // If geocoded country differs from selected, clear the country so the user re-confirms
            const geocodedCountry = geoPosition?.countryCode?.toLocaleLowerCase() ?? geoPosition?.country?.toLocaleLowerCase();
            const countryMismatch = geocodedCountry && geocodedCountry !== value.locationCountry?.toLocaleLowerCase();
            onChange({
                locationCountry: countryMismatch ? null : value.locationCountry,
                geocodedPosition: geoPosition,
                positionRadiusKm: geoPosition ? radiusSteps[0] : undefined,
            });
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error(t('employeeProfile.error.getGeocodedLocation'));
        } finally {
            setLoadingCity(false);
        }
    };

    const handleCityClear = () => {
        onChange({ ...value, geocodedPosition: null, positionRadiusKm: undefined });
    };

    /**
     * Attempt to reverse geocode the provided lat/lng and update country filter automatically.
     * Uses OpenStreetMap Nominatim (public) – consider proxying via backend for production to respect rate limits.
     */
    const autofillCountryByPosition = async (position?: GeocodedPosition | null) => {
        if (!position) {
            return;
        }
        setGeoLoading(true);
        try {
            const countryCode = await PositionService.callApiFindCountryByPosition(position);
            if (countryCode) {
                onChange({ ...value, locationCountry: countryCode, geocodedPosition: position });
            } else {
                onChange({ ...value, geocodedPosition: position });
            }
        } catch (e) {
            onChange({ ...value, geocodedPosition: position });
            // Intentionally swallow errors – network issues shouldn't break filter sheet.
        } finally {
            setGeoLoading(false);
        }
    }

    const preparePosition = (): Position => {
        return value.geocodedPosition || countryCenter || userCtx.position || DEFAUT_POSITION;
    }

    return (
        <div className={className}>
            <CountrySelector
                fullWidth
                value={value.locationCountry ?? undefined}
                label={t('employeeProfile.form.locationCountry') + (countryRequired ? '*' : '')}
                className="w-full"
                error={errors?.locationCountry}
                onSelect={(countryCode) => handleCountryChange(countryCode)}
            />

            <AnimatePresence
                onExitComplete={() => setCityAnimating(false)}
            >
                {!!value.locationCountry && (
                    <motion.div
                        key="city-control"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 0.7, 0.3, 1] }}
                        style={{ overflow: cityAnimating ? 'hidden' : 'visible' }}
                        onAnimationStart={() => setCityAnimating(true)}
                        onAnimationComplete={() => setCityAnimating(false)}
                        className="mt-3"
                    >
                        <motion.div
                            initial={{ y: 20, scale: 0.96 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 12, scale: 0.97 }}
                            transition={{ duration: 0.35, ease: [0.22, 0.7, 0.3, 1] }}
                        >
                            {(loadingCity || geoLoading) ? (
                                <SkeletonControl label={t('employeeProfile.form.city')} />
                            ) : config.locationOption === 'searchbar' ? (
                                <FloatingPlaceSearch
                                    fullWidth
                                    displayValue={value.geocodedPosition?.fullAddress || ''}
                                    label={t('employeeProfile.form.city')}
                                    error={errors?.geocodedPosition}
                                    countryRestriction={value.locationCountry}
                                    onSelect={handleCitySelect}
                                    onClear={handleCityClear}
                                />
                            ) : config.locationOption === 'map' ? (
                                <PositionSelector
                                    label={t("offer.workLocation")}
                                    name="location.geocodedPosition"
                                    className="w-full"
                                    value={value.geocodedPosition}
                                    initialPosition={preparePosition()}
                                    required
                                    onChange={(p) => {
                                        autofillCountryByPosition(p);
                                    }}
                                    error={errors?.geocodedPosition}
                                />
                            ) : null}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!!value.geocodedPosition && config.showRadiusSlider && (
                    <motion.div
                        key="radius-control"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 0.7, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                        className="mt-3 px-2 mb-5"
                    >
                        <motion.div
                            initial={{ y: 20, scale: 0.96 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 12, scale: 0.97 }}
                            transition={{ duration: 0.35, ease: [0.22, 0.7, 0.3, 1] }}
                        >
                            <FloatingStepSlider
                                label={t('employeeProfile.form.radius')}
                                steps={radiusSteps}
                                value={value.positionRadiusKm}
                                onChange={(val) => onChange({ ...value, positionRadiusKm: val })}
                                unit="km"
                                fullWidth
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CountryAndLocationSelector;
