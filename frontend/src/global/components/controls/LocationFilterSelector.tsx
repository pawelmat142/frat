import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GeocodedPosition } from '@shared/interfaces/MapsInterfaces';
import { AppConfig } from '@shared/AppConfig';
import { GoogleMapService } from 'global/services/GoogleMapService';
import { toast } from 'react-toastify';
import CountrySelector from 'global/components/selector/CountrySelector';
import FloatingPlaceSearch, { PlaceSearchResult } from './FloatingPlaceSearch';
import FloatingStepSlider from './FloatingStepSlider';
import SkeletonControl from './SkeletonControl';
import { AnimatePresence, motion } from 'framer-motion';

export interface LocationFilterValue {
    locationCountry: string | null;
    geocodedPosition: GeocodedPosition | null;
    positionRadiusKm?: number;
}

interface LocationFilterSelectorProps {
    value: LocationFilterValue;
    onChange: (value: LocationFilterValue) => void;
    errors?: {
        locationCountry?: { message?: string };
        geocodedPosition?: { message?: string };
    };
    className?: string;
    radiusSteps?: number[];
    countryRequired?: boolean;
}

const LocationFilterSelector: React.FC<LocationFilterSelectorProps> = ({
    value,
    onChange,
    errors,
    className = '',
    radiusSteps = [...AppConfig.RADIUS_STEPS_KM],
    countryRequired = true,
}) => {
    const { t } = useTranslation();
    const [loadingCity, setLoadingCity] = useState(false);
    const [cityAnimating, setCityAnimating] = useState(false);

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
                            {loadingCity ? (
                                <SkeletonControl label={t('employeeProfile.form.city')} />
                            ) : (
                                <FloatingPlaceSearch
                                    fullWidth
                                    displayValue={value.geocodedPosition?.fullAddress || ''}
                                    label={t('employeeProfile.form.city')}
                                    error={errors?.geocodedPosition}
                                    countryRestriction={value.locationCountry}
                                    onSelect={handleCitySelect}
                                    onClear={handleCityClear}
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!!value.geocodedPosition && (
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

export default LocationFilterSelector;
