import React, { useState, useRef, useEffect, forwardRef } from 'react';
import FloatingLabel from './FloatingLabel';
import FormError from './FormError';
import { FloatingInputMode, FloatingInputModes } from 'global/interface/controls.interface';
import { useDebouncedValue } from 'global/utils/useDebouncedValue';
import GoogleMapsLoader from 'global/utils/GoogleMapsLoader';
import { Close, Search } from '@mui/icons-material';

interface PlacePrediction {
    place_id: string;
    description: string;
    _rawResult?: google.maps.places.PlaceResult;
}

export interface PlaceSearchResult {
    lat: number;
    lng: number;
    description: string;
}

interface FloatingPlaceSearchProps {
    id?: string;
    name?: string;
    label?: string;
    displayValue?: string;
    onSelect: (result: PlaceSearchResult) => void;
    onClear?: () => void;
    icon?: React.ReactNode;
    mapInstanceRef?: google.maps.Map | null;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
    error?: { message?: string } | null;
    mode?: FloatingInputMode;
    /** ISO 3166-1 alpha-2 country code to restrict autocomplete results (e.g. 'pl', 'de') */
    countryRestriction?: string;
}

const FloatingPlaceSearch = forwardRef<HTMLInputElement, FloatingPlaceSearchProps>(
    ({
        id,
        name,
        label,
        displayValue,
        onSelect,
        onClear,
        icon,
        mapInstanceRef,
        fullWidth = false,
        disabled = false,
        required = false,
        center = false,
        className = '',
        error,
        mode = FloatingInputModes.DEFAULT,
        countryRestriction,
    }, ref) => {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

        const [inputValue, setInputValue] = useState('');
        const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
        const [showPredictions, setShowPredictions] = useState(false);
        const [isFocused, setIsFocused] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [selectedPrediction, setSelectedPrediction] = useState<PlacePrediction | null>(null);

        const containerRef = useRef<HTMLDivElement>(null);
        const isClearedRef = useRef(false);
        const debouncedInputValue = useDebouncedValue(inputValue, 500);

        useEffect(() => {
            if (displayValue) {
                isClearedRef.current = false;
            }
            if (!displayValue && selectedPrediction) {
                setSelectedPrediction(null);
            }
        }, [displayValue]);

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

        // Fetch predictions when debounced input changes
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

            const fetchPredictions = async () => {
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
                    console.warn('Google Maps Places library not available');
                    return;
                }

                setIsLoading(true);

                const places = google.maps.places as any;
                const ServiceCtor = places.AutocompleteService;
                if (ServiceCtor) {
                    const service = new ServiceCtor();
                    service.getPlacePredictions({ input, ...(countryRestriction ? { componentRestrictions: { country: countryRestriction } } : {}) }, (preds: any[], status: any) => {
                        setIsLoading(false);
                        if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
                            setPredictions(preds);
                            setShowPredictions(true);
                        } else {
                            setPredictions([]);
                            setShowPredictions(false);
                        }
                    });
                } else {
                    // Fallback: findPlaceFromQuery
                    const placesService = new google.maps.places.PlacesService(document.createElement('div'));
                    placesService.findPlaceFromQuery(
                        { query: input, fields: ['place_id', 'formatted_address', 'name', 'geometry'] },
                        (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
                            setIsLoading(false);
                            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length) {
                                const mapped: PlacePrediction[] = results.map(r => ({
                                    place_id: r.place_id!,
                                    description: r.formatted_address || r.name || r.place_id || '',
                                    _rawResult: r,
                                }));
                                setPredictions(mapped);
                                setShowPredictions(true);
                            } else {
                                setPredictions([]);
                                setShowPredictions(false);
                            }
                        }
                    );
                }
            };

            fetchPredictions();
        }, [debouncedInputValue]);

        const selectPrediction = async (prediction: PlacePrediction) => {
            setSelectedPrediction(prediction);
            setInputValue(prediction.description);
            setPredictions([]);
            setShowPredictions(false);

            // If raw geometry is available (from fallback), use it directly
            if (prediction._rawResult?.geometry?.location) {
                const loc = prediction._rawResult.geometry.location;
                onSelect({
                    lat: typeof loc.lat === 'function' ? loc.lat() : (loc.lat as unknown as number),
                    lng: typeof loc.lng === 'function' ? loc.lng() : (loc.lng as unknown as number),
                    description: prediction.description,
                });
                return;
            }

            // Otherwise request details via PlacesService
            if (typeof google === 'undefined' || !google.maps || !google.maps.places) return;

            const target = mapInstanceRef || document.createElement('div');
            const placesService = new google.maps.places.PlacesService(target);
            placesService.getDetails({ placeId: prediction.place_id }, (place: any, status: any) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                    onSelect({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        description: prediction.description,
                    });
                }
            });
        };

        const handleFocus = () => {
            setInputValue('');
            setIsFocused(true);
            setFocus(true);
            if (predictions.length > 0) {
                setShowPredictions(true);
            }
        };

        const handleBlur = () => {
            setTimeout(() => {
                setIsFocused(false);
                setFocus(false);
            }, 200);
        };

        const setFocus = (set: boolean) => {
            const ppControlElement = containerRef.current?.querySelector('.pp-control');
            if (ppControlElement) {
                if (set) {
                    ppControlElement.classList.add('focus');
                } else {
                    ppControlElement.classList.remove('focus');
                }
            }
        }

        const handleClear = () => {
            isClearedRef.current = true;
            setInputValue('');
            setSelectedPrediction(null);
            setPredictions([]);
            setShowPredictions(false);
            onClear?.();
        };

        const hasSelection = !!selectedPrediction || !!displayValue;

        let inputClass = `pp-control-bg pp-input floating-input ${mode}`;
        if (fullWidth) {
            inputClass += ' w-full';
        } else {
            inputClass += ' w-fit';
        }
        if (disabled) {
            inputClass += ' opacity-50 pointer-events-none cursor-not-allowed';
        }
        if (error) {
            inputClass += ' pp-control-error';
        }

        const currentValue = (isFocused || selectedPrediction) ? inputValue : (isClearedRef.current ? '' : (displayValue || ''));

        const hasValue = (): boolean => {
            return currentValue !== '';
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
                            value={currentValue}
                            onChange={e => setInputValue(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className={`${inputClass}${' pr-10'}`}
                            disabled={disabled}
                            required={required}
                            placeholder=" "
                            autoComplete="off"
                        />
                        {isLoading ? (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        ) : hasSelection ? (
                            <Close
                                className="absolute right-3 top-1/2 -translate-y-1/2 secondary-text cursor-pointer"
                                style={{ fontSize: '1.4rem', fontWeight: 'bold' }}
                                onClick={handleClear}
                            />
                        ) : (
                            icon
                                ? <span className="absolute right-3 top-1/2 -translate-y-1/2 secondary-text pointer-events-none flex items-center">{icon}</span>
                                : <Search className="absolute right-3 top-1/2 -translate-y-1/2 secondary-text pointer-events-none" style={{ fontSize: '1.2rem' }} />
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
                        {predictions.map(p => (
                            <div
                                key={p.place_id}
                                onClick={() => selectPrediction(p)}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            >
                                {p.description}
                            </div>
                        ))}
                    </div>
                )}

                <FormError error={error} />
            </div>
        );
    }
);

FloatingPlaceSearch.displayName = 'FloatingPlaceSearch';

export default FloatingPlaceSearch;
