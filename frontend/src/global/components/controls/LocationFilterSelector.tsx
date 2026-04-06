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

            {!!value.locationCountry && (
                loadingCity ? (
                    <SkeletonControl label={t('employeeProfile.form.city')} />
                ) : (
                    <FloatingPlaceSearch
                        fullWidth
                        displayValue={value.geocodedPosition?.fullAddress || ''}
                        label={t('employeeProfile.form.city')}
                        className="w-full mt-3"
                        error={errors?.geocodedPosition}
                        countryRestriction={value.locationCountry}
                        onSelect={handleCitySelect}
                        onClear={handleCityClear}
                    />
                )
            )}

            {!!value.geocodedPosition && (
                <FloatingStepSlider
                    label={t('employeeProfile.form.radius')}
                    steps={radiusSteps}
                    value={value.positionRadiusKm}
                    onChange={(val) => onChange({ ...value, positionRadiusKm: val })}
                    unit="km"
                    fullWidth
                    className="w-full mt-3 px-2 mb-5"
                />
            )}
        </div>
    );
};

export default LocationFilterSelector;
