import React, { useState, useRef, useEffect, forwardRef } from 'react';
import FloatingLabel from './FloatingLabel';
import FormError from './FormError';
import { FloatingInputMode, FloatingInputModes } from 'global/interface/controls.interface';
import { useDebouncedValue } from 'global/utils/useDebouncedValue';
import GoogleMapsLoader from 'global/utils/GoogleMapsLoader';
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

// Prediction type for the new Places API
interface CityPrediction {
    placeId: string;
    mainText: string;
    secondaryText: string;
    fullText: string;
    toPlace: () => google.maps.places.Place;
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
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

        // Disable input if no country code is provided
        const isDisabled = disabled || !countryCode;

        const [inputValue, setInputValue] = useState(value?.city || '');
        const [predictions, setPredictions] = useState<CityPrediction[]>([]);
        const [showPredictions, setShowPredictions] = useState(false);
        const [isFocused, setIsFocused] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [selectedPrediction, setSelectedPrediction] = useState<CityPrediction | null>(null);
        
        // Session token for billing optimization
        const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
        
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
            if (!isFocused 
                || [selectedPrediction?.fullText.toLocaleLowerCase(),
                 selectedPrediction?.mainText.toLocaleLowerCase()
                ].includes(debouncedInputValue?.toLocaleLowerCase() || '')) {
                return;
            }

            const input = debouncedInputValue?.trim();
            if (!input || input.length < 2) {
                setPredictions([]);
                setShowPredictions(false);
                return;
            }

            searchCities(input);
        }, [debouncedInputValue]);

        useEffect(() => {
            const cleanInputValue = ![
                value?.countryCode?.toLocaleLowerCase(),
                value?.country?.toLocaleLowerCase()
            ].includes(countryCode?.toLocaleLowerCase())

            if (cleanInputValue) {
                setInputValue('');
            }
            setPredictions([]);
            setShowPredictions(false);
            setSelectedPrediction(null);
        }, [countryCode]);

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

            try {
                // Import the places library to access the new API
                const { AutocompleteSuggestion, AutocompleteSessionToken } = 
                    await google.maps.importLibrary('places') as google.maps.PlacesLibrary;

                // Create a new session token if one doesn't exist
                if (!sessionTokenRef.current) {
                    sessionTokenRef.current = new AutocompleteSessionToken();
                }

                // Build request using the new AutocompleteSuggestion API
                const request: google.maps.places.AutocompleteRequest = {
                    input,
                    includedPrimaryTypes: ['locality', 'administrative_area_level_3', 'administrative_area_level_2'], // Cities and similar
                    sessionToken: sessionTokenRef.current,
                };

                // Add country restriction if provided
                if (countryCode) {
                    request.includedRegionCodes = [countryCode.toUpperCase()];
                }

                const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

                const cityPredictions: CityPrediction[] = suggestions
                    .filter(s => s.placePrediction)
                    .map(s => {
                        const pred = s.placePrediction!;
                        return {
                            placeId: pred.placeId,
                            mainText: pred.mainText?.text || pred.text?.text || '',
                            secondaryText: pred.secondaryText?.text || '',
                            fullText: pred.text?.text || '',
                            toPlace: () => pred.toPlace(),
                        };
                    });

                setPredictions(cityPredictions);
                setShowPredictions(cityPredictions.length > 0);
            } catch (error) {
                console.error('Error fetching autocomplete suggestions:', error);
                setPredictions([]);
                setShowPredictions(false);
            } finally {
                setIsLoading(false);
            }
        };

        const selectPrediction = async (prediction: CityPrediction) => {
            if (!apiKey) return;

            setSelectedPrediction(prediction);
            setInputValue(prediction.mainText);
            setPredictions([]);
            setShowPredictions(false);
            setIsLoading(true);

            try {
                await GoogleMapsLoader.load(apiKey);

                // Use the new Place API - get the Place object from prediction
                const place = prediction.toPlace();
                
                // Fetch the required fields
                await place.fetchFields({
                    fields: ['location', 'addressComponents', 'formattedAddress', 'displayName']
                });

                // Reset session token after selection (session is complete)
                sessionTokenRef.current = null;

                if (place.location) {
                    const lat = place.location.lat();
                    const lng = place.location.lng();

                    // Parse address components to get city and country
                    let city = prediction.mainText;
                    let countryName: string | undefined;

                    if (place.addressComponents) {
                        for (const component of place.addressComponents) {
                            if (component.types.includes('locality')) {
                                city = component.longText || city;
                            }
                            if (component.types.includes('country')) {
                                countryName = component.longText || undefined;
                            }
                        }
                    }

                    const geoPosition: GeocodedPosition = {
                        lat,
                        lng,
                        city,
                        fullAddress: place.formattedAddress || prediction.fullText,
                        country: countryName,
                        countryCode: countryCode || undefined,
                    };

                    onChange(geoPosition);
                } else {
                    console.error('Failed to get place location');
                }
            } catch (error) {
                console.error('Error selecting prediction:', error);
                // Reset session token on error too
                sessionTokenRef.current = null;
            } finally {
                setIsLoading(false);
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
                    <div className="pp-control min-height pp-input-row">
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
                                key={prediction.placeId}
                                onClick={() => selectPrediction(prediction)}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            >
                                <div className="font-medium">
                                    {prediction.mainText}
                                </div>
                                <div className="text-gray-500 text-xs">
                                    {prediction.secondaryText}
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
