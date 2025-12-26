import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FloatingInput from 'global/components/controls/FloatingInput';
import { FloatingInputModes } from 'global/interface/controls.interface';
import { Search } from '@mui/icons-material';
import { useDebouncedValue } from 'global/utils/useDebouncedValue';
import { toast } from 'react-toastify';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    mapInstanceRef: google.maps.Map | null;
    updatePosition: (position: { lat: number; lng: number }) => void;
    displaValue?: string;
    onCancel: () => void;
}

const PositionSelectorSearchbar: React.FC<Props> = ({ mapInstanceRef, onCancel, updatePosition, displaValue }) => {
    const { t } = useTranslation();

    const [predictions, setPredictions] = useState<any[]>([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const [freeTextInput, setFreeTextInput] = useState('');
    const debouncedFreeTextInput = useDebouncedValue(freeTextInput, 500);


    useEffect(() => {
        if (debouncedFreeTextInput === selectedPrediction?.description) {
            return
        }
        const input = debouncedFreeTextInput?.trim();
        if (!input || input.length < 3) {
            setPredictions([]);
            setShowPredictions(false);
            return;
        }
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            console.warn('Google Places library not loaded');
            return;
        }

        // Prefer AutocompleteSuggestion (new API) when available, then AutocompleteService,
        // otherwise fall back to a query-based search using PlacesService.findPlaceFromQuery
        // and normalize results to a compatible shape.
        const places = google.maps.places as any;
        const ServiceCtor = places && (places.AutocompleteSuggestion || places.AutocompleteService);
        if (ServiceCtor) {
            const service = new ServiceCtor();

            // Try known method names in order of likelihood.
            if (typeof service.getPlacePredictions === 'function') {
                service.getPlacePredictions({ input }, (preds: any[], status: any) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
                        setPredictions(preds);
                        setShowPredictions(true);
                    } else {
                        setPredictions([]);
                        setShowPredictions(false);
                    }
                });
            } else if (typeof service.getSuggestions === 'function') {
                service.getSuggestions({ input }, (preds: any[], status: any) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
                        setPredictions(preds);
                        setShowPredictions(true);
                    } else {
                        setPredictions([]);
                        setShowPredictions(false);
                    }
                });
            } else if (typeof service.getAutocompletePredictions === 'function') {
                service.getAutocompletePredictions({ input }, (preds: any[], status: any) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
                        setPredictions(preds);
                        setShowPredictions(true);
                    } else {
                        setPredictions([]);
                        setShowPredictions(false);
                    }
                });
            } else {
                // Unknown service shape; fall back to PlacesService
                const placesService = new google.maps.places.PlacesService(document.createElement('div'));
                placesService.findPlaceFromQuery(
                    { query: input, fields: ['place_id', 'formatted_address', 'name', 'geometry'] },
                    (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length) {
                            const mapped = results.map(r => ({
                                place_id: r.place_id,
                                description: r.formatted_address || (r as any).name || r.place_id,
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
        } else {
            // Fallback: use findPlaceFromQuery to get candidates and map them to a prediction-like shape
            const placesService = new google.maps.places.PlacesService(document.createElement('div'));
            placesService.findPlaceFromQuery(
                { query: input, fields: ['place_id', 'formatted_address', 'name', 'geometry'] },
                (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length) {
                        const mapped = results.map(r => ({
                            place_id: r.place_id,
                            description: r.formatted_address || (r as any).name || r.place_id,
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
    }, [debouncedFreeTextInput]);

    const selectPrediction = (prediction: any) => {
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) return;
        setSelectedPrediction(prediction);

        // If we have raw geometry from the fallback search, use it directly.
        if (prediction._rawResult && prediction._rawResult.geometry && prediction._rawResult.geometry.location) {
            const loc = prediction._rawResult.geometry.location;
            const position = { lat: typeof loc.lat === 'function' ? loc.lat() : loc.lat, lng: typeof loc.lng === 'function' ? loc.lng() : loc.lng };
            updatePosition(position);
            setFreeTextInput(prediction.description || '');
            setPredictions([]);
            setShowPredictions(false);
            return;
        }

        // Otherwise request details via PlacesService
        const target = mapInstanceRef || document.createElement('div');
        const placesService = new google.maps.places.PlacesService(target);
        placesService.getDetails({ placeId: prediction.place_id }, (place: any, status: any) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                const position = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
                updatePosition(position);
                setFreeTextInput(prediction.description || '');
                setPredictions([]);
                setShowPredictions(false);
            } else {
                toast.error(t('employeeProfile.error.getPlaceDetails') || 'Place details error');
            }
        });
    };

    return (
        <div className="position-selector-searchbar w-full mr-2">
                <div className="position-selector-header p-2 flex items-center justify-between border-b primary-bg">

                <FloatingInput
                    mode={FloatingInputModes.THIN}
                    name="freeText"
                    value={(isFocused || selectedPrediction) ? freeTextInput : (displaValue || '')}
                    onChange={e => setFreeTextInput(e.target.value)}
                    onFocus={() => {
                        setFreeTextInput('');
                        setIsFocused(true)}}
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                    label={t('employeeProfile.form.freeText')}
                    fullWidth
                    icon={<Search />}
                />

                <button
                    onClick={() => onCancel()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <CloseIcon />
                </button>
            </div>
            {showPredictions && predictions.length > 0 && (
                <div className="position-selector-searchbar-results">
                    {predictions.map(p => (
                        <div
                            key={p.place_id}
                            onClick={() => selectPrediction(p)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            {p.description}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PositionSelectorSearchbar;
