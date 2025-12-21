import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FloatingInput from 'global/components/controls/FloatingInput';
import { FloatingInputModes } from 'global/interface/controls.interface';
import { Search } from '@mui/icons-material';
import { useDebouncedValue } from 'shared/utils/useDebouncedValue';
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

    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const [selectedPrediction, setSelectedPrediction] = useState<google.maps.places.AutocompletePrediction | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const [freeTextInput, setFreeTextInput] = useState('');
    const debouncedFreeTextInput = useDebouncedValue(freeTextInput, 500);


    const service = new google.maps.places.AutocompleteService();

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
        if (typeof google === 'undefined' || !google.maps || !(google.maps.places && google.maps.places.AutocompleteService)) {
            console.warn('Google Places library not loaded');
            return;
        }
        service.getPlacePredictions({ input }, (preds, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
                console.log('Predictions:', preds);
                setPredictions(preds);
                setShowPredictions(true);
            } else {
                setPredictions([]);
                setShowPredictions(false);
            }
        });
    }, [debouncedFreeTextInput]);

    const selectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
        if (!mapInstanceRef) return;
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) return;
        setSelectedPrediction(prediction);
        const placesService = new google.maps.places.PlacesService(mapInstanceRef);
        placesService.getDetails({ placeId: prediction.place_id }, (place, status) => {
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
