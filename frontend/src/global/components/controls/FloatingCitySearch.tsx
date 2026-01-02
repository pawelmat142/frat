import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import FloatingLabel from './FloatingLabel';
import FormError from './FormError';
import { FloatingInputMode, FloatingInputModes } from 'global/interface/controls.interface';
import { useDebouncedValue } from 'global/utils/useDebouncedValue';
import GoogleMapsLoader from 'global/utils/GoogleMapsLoader';
import { GoogleMapService } from 'global/services/GoogleMapService';
import { GeocodedPosition } from '@shared/interfaces/MapsInterfaces';

interface FloatingCitySearchProps {
    id?: string;
    name?: string;
    label?: string;
    value?: GeocodedPosition | null;
    onChange: (position: GeocodedPosition | null) => void;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
    error?: { message?: string } | null;
    mode?: FloatingInputMode;
    countryCode?: string; // ISO country code to restrict search
}

const FloatingCitySearch = forwardRef<HTMLInputElement, FloatingCitySearchProps>(
    ({
        id,
        name,
        label,
        value,
        onChange,
        fullWidth = false,
        disabled = false,
        required = false,
        center = false,
        className = '',
        error,
        mode = FloatingInputModes.DEFAULT,
        countryCode,
    }, ref) => {
        const { t } = useTranslation();
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

        // Disable input if no country code is provided
        const isDisabled = disabled || !countryCode;

        const [inputValue, setInputValue] = useState('');
        const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
        const [showPredictions, setShowPredictions] = useState(false);
        const [isFocused, setIsFocused] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [selectedPrediction, setSelectedPrediction] = useState<google.maps.places.AutocompletePrediction | null>(null);
        
        const containerRef = useRef<HTMLDivElement>(null);
        const debouncedInputValue = useDebouncedValue(inputValue, 500);

        // Update input value when external value changes
        useEffect(() => {
            if (!isFocused) {
                if (value?.city) {
                    setInputValue(value.city);
                } else if (!value) {
                    // Clear input when value is reset/nullified
                    setInputValue('');
                    setSelectedPrediction(null);
                }
            }
        }, [value, isFocused]);

        // Search for city predictions when debounced input changes
        useEffect(() => {
            if (debouncedInputValue === selectedPrediction?.description) {
                return;
            }

            const input = debouncedInputValue?.trim();
            if (!input || input.length < 3) {
                setPredictions([]);
                setShowPredictions(false);
                return;
            }

            searchCities(input);
        }, [debouncedInputValue, countryCode]);

        // Close predictions on outside click
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setShowPredictions(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const searchCities = async (input: string) => {
            if (!apiKey) {
                console.warn('Google Maps API key is not configured');
                return;
            }

            try {
                await GoogleMapsLoader.load(apiKey);
            } catch (e) {
                console.warn('Failed to load Google Maps:', e);
                return;
            }

            if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
                console.warn('Google Places library not loaded');
                return;
            }

            setIsLoading(true);

            const places = google.maps.places as any;
            const ServiceCtor = places.AutocompleteService;

            if (!ServiceCtor) {
                setIsLoading(false);
                return;
            }

            const service = new ServiceCtor();
            const request: google.maps.places.AutocompletionRequest = {
                input,
                types: ['(cities)'], // Restrict to cities only
            };

            // Add country restriction if provided
            if (countryCode) {
                request.componentRestrictions = { country: countryCode };
            }

            service.getPlacePredictions(request, (
                preds: google.maps.places.AutocompletePrediction[] | null,
                status: google.maps.places.PlacesServiceStatus
            ) => {
                setIsLoading(false);
                if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
                    setPredictions(preds);
                    setShowPredictions(true);
                } else {
                    setPredictions([]);
                    setShowPredictions(false);
                }
            });
        };

        const selectPrediction = async (prediction: google.maps.places.AutocompletePrediction) => {
            if (!apiKey) return;

            setSelectedPrediction(prediction);
            setInputValue(prediction.structured_formatting?.main_text || prediction.description);
            setPredictions([]);
            setShowPredictions(false);
            setIsLoading(true);

            try {
                await GoogleMapsLoader.load(apiKey);

                const placesService = new google.maps.places.PlacesService(document.createElement('div'));
                
                placesService.getDetails(
                    { 
                        placeId: prediction.place_id,
                        fields: ['geometry', 'address_components', 'formatted_address', 'name']
                    },
                    async (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
                        setIsLoading(false);
                        
                        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                            const lat = place.geometry.location.lat();
                            const lng = place.geometry.location.lng();

                            // Use GoogleMapService to parse the response into GeocodedPosition
                            const geoPosition = GoogleMapService.parseGeocoderResponse({
                                results: [{
                                    ...place as any,
                                    geometry: {
                                        ...place.geometry,
                                        location: { lat: () => lat, lng: () => lng }
                                    }
                                }]
                            } as google.maps.GeocoderResponse);

                            if (geoPosition) {
                                onChange(geoPosition);
                            } else {
                                // Fallback: create basic position
                                onChange({
                                    lat,
                                    lng,
                                    city: prediction.structured_formatting?.main_text || prediction.description,
                                    fullAddress: place.formatted_address,
                                });
                            }
                        } else {
                            console.error('Failed to get place details:', status);
                        }
                    }
                );
            } catch (error) {
                setIsLoading(false);
                console.error('Error selecting prediction:', error);
            }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            setSelectedPrediction(null);
            
            // Clear selection if user clears input
            if (!newValue.trim()) {
                onChange(null);
            }
        };

        const handleFocus = () => {
            setIsFocused(true);
            if (predictions.length > 0) {
                setShowPredictions(true);
            }
        };

        const handleBlur = () => {
            // Delay to allow click on prediction
            setTimeout(() => {
                setIsFocused(false);
            }, 200);
        };

        let inputClass = `pp-control-bg pp-input floating-input ${mode}`;
        if (fullWidth) {
            inputClass += ' w-full';
        } else {
            inputClass += ' w-fit';
        }
        if (isDisabled) {
            inputClass += ' opacity-50 pointer-events-none cursor-not-allowed';
        }
        if (error) {
            inputClass += ' pp-control-error';
        }

        const hasValue = (): boolean => {
            return inputValue !== '' || !!value?.city;
        };

        const isLabelFloating = isFocused || hasValue();

        return (
            <div
                ref={containerRef}
                className={`floating-input-wrapper ${className}${center ? ' mx-auto' : ''}`}
                style={{ position: 'relative' }}
            >
                <div className="floating-input-container">
                    <div className="pp-control pp-input-row">
                        <input
                            ref={ref}
                            id={id}
                            name={name || id}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className={inputClass}
                            disabled={isDisabled}
                            required={required}
                            placeholder=" "
                            autoComplete="off"
                        />
                        {isLoading && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        )}
                        <FloatingLabel
                            htmlFor={id}
                            label={label}
                            required={required}
                            isActive={isLabelFloating}
                            error={error}
                        />
                    </div>
                </div>

                {showPredictions && predictions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {predictions.map((prediction) => (
                            <div
                                key={prediction.place_id}
                                onClick={() => selectPrediction(prediction)}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            >
                                <div className="font-medium">
                                    {prediction.structured_formatting?.main_text}
                                </div>
                                <div className="text-gray-500 text-xs">
                                    {prediction.structured_formatting?.secondary_text}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <FormError error={error} />
            </div>
        );
    }
);

FloatingCitySearch.displayName = 'FloatingCitySearch';

export default FloatingCitySearch;
